const test = require('node:test')
const assert = require('node:assert/strict')
const install = require('../install.js')
const update = require('../update.js')
const torch = require('../torch.js')
const sheetsage = require('../sheetsage.js')

function render(text, platform, gpu = 'nvidia') {
  return text.replace(/\{\{(.*?)\}\}/g, (_, expression) =>
    Function('platform', 'gpu', `return (${expression})`)(platform, gpu))
}

for (const platform of ['darwin', 'linux', 'win32']) {
  test(`${platform}: asset repair keeps the app dependency policy`, () => {
    const step = install.run.find(step =>
      String(step.params?.message).includes('--reinstall-package gradio'))
    assert.equal(step.params.path, 'app')
    assert.equal(step.params.venv, 'env')
    const command = render(step.params.message[0], platform)
    assert.match(command, / -e \. --overrides /)
    assert.ok(command.endsWith(platform === 'darwin' ? 'overrides/macos.txt' : 'overrides/linux.txt'))
    assert.doesNotMatch(command, /gradio[>=<]/)
    for (const script of [install, update]) {
      const steps = script.run.filter(s => String(s.params?.message).includes('--overrides overrides/'))
        .filter(s => !s.when || render(s.when, platform) === 'true')
      assert.ok(steps.some(s => String(s.params?.message).includes('--overrides overrides/' +
        (platform === 'darwin' ? 'macos' : 'linux') + '.txt')))
    }
  })
}

test('CUDA Torch repair never runs on macOS', () => {
  for (const step of torch.run) assert.equal(render(step.when, 'darwin'), 'false')
})

test('SheetSage2 venv checks import torchaudio, not just torch', () => {
  // A present-but-unloadable libtorchaudio.pyd must fail install/update, not the
  // first Cover transcription.
  for (const script of [install, update]) {
    const steps = script.run.filter(s => s.params?.venv === '.venv-sheetsage2' &&
      String(s.params?.message).includes('import torch'))
    assert.ok(steps.length > 0)
    for (const step of steps) assert.match(String(step.params.message), /torchaudio/)
  }
})

test('CPU-only machines do not get the cu126 SheetSage2 torch', () => {
  const steps = sheetsage.run.filter(s =>
    String(s.params?.message).includes('download.pytorch.org/whl'))
  for (const step of steps) {
    const message = String(step.params.message)
    if (message.includes('cu126')) {
      assert.equal(render(step.when, 'win32', 'nvidia'), 'true')
      assert.equal(render(step.when, 'win32', 'cpu'), 'false')
      assert.equal(render(step.when, 'linux', 'cpu'), 'false')
    }
    if (message.includes('/whl/cpu')) {
      assert.equal(render(step.when, 'win32', 'cpu'), 'true')
      assert.equal(render(step.when, 'darwin', 'cpu'), 'false')
    }
  }
})

for (const platform of ['darwin', 'linux', 'win32']) {
  for (const gpu of ['nvidia', 'cpu', 'amd']) {
    test(`SheetSage2 isolated policy: ${platform}/${gpu}`, () => {
      const selected = sheetsage.run.filter(s => render(s.when, platform, gpu) === 'true')
      assert.equal(selected.length, 1)
      const step = selected[0]
      assert.equal(step.params.path, 'app')
      assert.equal(step.params.venv, '.venv-sheetsage2')
      const command = render(step.params.message, platform, gpu)
      const python = platform === 'win32' ? '.venv-sheetsage2/Scripts/python.exe' : '.venv-sheetsage2/bin/python'
      const parts = command.split(' && ')
      assert.equal(parts.length, 3)
      for (const install of parts.slice(0, 2)) {
        assert.match(install, /^uv --no-config pip install /)
        assert.ok(install.includes(`--python "${python}"`))
      }
      const suffix = platform === 'darwin' ? '' : gpu === 'nvidia' ? '+cu126' : '+cpu'
      assert.ok(parts[0].includes(`torch==2.8.0${suffix} torchaudio==2.8.0${suffix}`))
      assert.match(parts[1], /-r models\/SheetSage2\/requirements.txt$/)
      assert.ok(parts[2].startsWith(`"${python}" ../check-sheetsage.py --flavor `))
    })
  }
}

test('Install and Update both repair SheetSage2 after downloading its pinned requirements', () => {
  for (const script of [install, update]) {
    const installer = script.run.findIndex(s => s.method === 'script.start' && s.params.uri === 'sheetsage.js')
    const download = script.run.findIndex(s => s.method === 'hf.download' && s.params._.includes('m-a-p/SheetSage2'))
    assert.ok(installer > download && download >= 0)
    assert.equal(script.run.filter(s => s.params?.uri === 'sheetsage.js').length, 1)
    for (const s of script.run) {
      if (s.params?.venv === '.venv-sheetsage2') {
        assert.doesNotMatch(String(s.params.message), /uv .*pip install/)
      }
    }
  }
})
