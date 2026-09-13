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
        env: {
          HF_HUB_ENABLE_HF_TRANSFER: "0",
          HF_XET_HIGH_PERFORMANCE: "1"
        },
        message: "if [ -x .venv-sheetsage2/bin/python ] && [ -f models/SheetSage2/requirements.txt ]; then .venv-sheetsage2/bin/python -m pip install -r models/SheetSage2/requirements.txt; fi"
      }
    },
    // Re-verify groove + sheetsage (real model files, not just dir)
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
        message: "test -x .venv-sheetsage2/bin/python && .venv-sheetsage2/bin/python -c \"import torch, transformers\" && (test -f models/SheetSage2/config.json || test -f models/SheetSage2/model.safetensors || test -f models/SheetSage2/pytorch_model.bin) && find models/SheetSage2 -type f -size +100k | head -1 | grep -q ."
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
