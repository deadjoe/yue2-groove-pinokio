module.exports = {
  run: [
    {
      method: "shell.run",
      params: {
        path: "app",
        message: "git pull --ff-only"
      }
    },
    {
      when: "{{platform === 'darwin'}}",
      method: "shell.run",
      params: {
        venv: "env",
        path: "app",
        bluefairy: "off",
        message: "uv pip install --python \"$VIRTUAL_ENV/bin/python\" -e \".[yue2]\" --overrides overrides/macos.txt"
      }
    },
    {
      when: "{{platform === 'linux'}}",
      method: "shell.run",
      params: {
        venv: "env",
        path: "app",
        bluefairy: "off",
        message: "uv pip install --python \"$VIRTUAL_ENV/bin/python\" -e \".[yue2]\" --overrides overrides/linux.txt"
      }
    },
    {
      method: "notify",
      params: {
        html: "Updated. Click <b>Start</b> to relaunch."
      }
    }
  ]
}
