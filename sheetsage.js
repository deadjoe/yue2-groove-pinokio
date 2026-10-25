// Both Install and Update use this policy. Main-app overrides in app/pyproject.toml
// must never affect the independent SheetSage2 interpreter or dependency resolver.
const python = "{{platform === 'win32' ? '.venv-sheetsage2/Scripts/python.exe' : '.venv-sheetsage2/bin/python'}}"
function step(when, flavor, index, suffix) {
  const target = `--python "${python}"`
  return {
    when,
    method: "shell.run",
    params: {
      path: "app",
      venv: ".venv-sheetsage2",
      message: [
        `uv --no-config pip install ${target} torch==2.8.0${suffix} torchaudio==2.8.0${suffix} --index-url ${index}`,
        `uv --no-config pip install ${target} -r models/SheetSage2/requirements.txt`,
        `"${python}" ../check-sheetsage.py --flavor ${flavor}`
      ].join(" && ")
    }
  }
}
module.exports = {
  run: [
    step("{{(platform === 'linux' || platform === 'win32') && gpu === 'nvidia'}}",
      "cu126", "https://download.pytorch.org/whl/cu126", "+cu126"),
    step("{{(platform === 'linux' || platform === 'win32') && gpu !== 'nvidia'}}",
      "cpu", "https://download.pytorch.org/whl/cpu", "+cpu"),
    step("{{platform === 'darwin'}}", "pypi", "https://pypi.org/simple", "")
  ]
}
