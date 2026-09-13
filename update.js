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
    // Refresh SheetSage2 deps if the Cover venv already exists
    {
      method: "shell.run",
      params: {
        path: "app",
        bluefairy: "off",
        message: "if [ -x .venv-sheetsage2/bin/python ] && [ -f models/SheetSage2/requirements.txt ]; then .venv-sheetsage2/bin/python -m pip install -r models/SheetSage2/requirements.txt; fi"
      }
    },
    // Re-verify groove + sheetsage
    {
      method: "shell.run",
      params: {
        venv: "env",
        path: "app",
        message: "python -c \"import yue2_groove, yue2, gradio\""
      }
    },
    {
      method: "shell.run",
      params: {
        path: "app",
        message: "test -x .venv-sheetsage2/bin/python && .venv-sheetsage2/bin/python -c \"import torch, transformers\" && test -d models/SheetSage2"
      }
    },
    {
      method: "notify",
      params: {
        html: "Updated (groove + SheetSage2 deps). Click <b>Start</b> to relaunch."
      }
    }
  ]
}
