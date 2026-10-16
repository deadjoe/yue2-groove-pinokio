const test = require('node:test')
const assert = require('node:assert/strict')
const install = require('../install.js')
const update = require('../update.js')
const torch = require('../torch.js')

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
