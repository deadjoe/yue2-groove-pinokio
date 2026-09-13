module.exports = {
  run: [
    // Windows is out of scope for v1
    {
      when: "{{platform === 'win32'}}",
      method: "notify",
      params: {
        html: "<b>Windows is not supported yet.</b><br/>YUE2 // GROOVE v1 targets macOS Apple Silicon (≥32 GB) or Linux + NVIDIA (≥24 GB VRAM)."
      },
      next: null
    },

    // Clone (or recover) the app when pyproject.toml is missing.
    // Pinokio venv:"env"+path:"app" creates app/env first; kernel.exists('app')
    // alone is true then and would skip clone — leaving an empty app/.
    {
      method: "shell.run",
      params: {
        message: "[ -f app/pyproject.toml ] || (rm -rf app && git clone --depth 1 https://github.com/deadjoe/yue2_groove.git app)"
      }
    },

    // Create / activate venv and install groove + YuE2 with platform overrides.
    // Do NOT use a generic Factory torch.js matrix — macOS needs torch 2.14 via overrides/macos.txt.
    // venv lands at app/env (path:"app" + venv:"env"); that is fine once clone always runs first.
    {
      when: "{{platform === 'darwin'}}",
      method: "shell.run",
      params: {
        venv: "env",
        path: "app",
        bluefairy: "off",
        message: [
          "python -m pip install -U pip uv",
          "uv pip install --python \"$VIRTUAL_ENV/bin/python\" -e \".[yue2]\" --overrides overrides/macos.txt"
        ]
      }
    },
    {
      when: "{{platform === 'linux'}}",
      method: "shell.run",
      params: {
        venv: "env",
        path: "app",
        bluefairy: "off",
        message: [
          "python -m pip install -U pip uv",
          "uv pip install --python \"$VIRTUAL_ENV/bin/python\" -e \".[yue2]\" --overrides overrides/linux.txt"
        ]
      }
    },

    // Fail install if packages are missing (blocks Pinokio from auto-starting a broken tree)
    {
      method: "shell.run",
      params: {
        venv: "env",
        path: "app",
        message: "python -c \"import yue2_groove, yue2, gradio\""
      }
    },

    // Apple Silicon attention-kernel guard (loads no weights)
    {
      when: "{{platform === 'darwin'}}",
      method: "shell.run",
      params: {
        venv: "env",
        path: "app",
        message: "python scripts/mps_sdpa_check.py"
      }
    },

    // Pre-download YuE2 weights into Pinokio's HF cache (~8 GB)
    {
      method: "shell.run",
      params: {
        venv: "env",
        path: "app",
        cache: "cache",
        bluefairy: "off",
        env: {
          HF_HUB_ENABLE_HF_TRANSFER: "1"
        },
        message: [
          "uv pip install --python \"$VIRTUAL_ENV/bin/python\" -U huggingface-hub hf_transfer",
          "hf download m-a-p/YuE2-3B",
          "hf download m-a-p/YuE2-Vae"
        ]
      }
    },

    {
      method: "notify",
      params: {
        html: "<b>Install finished.</b><br/>YuE2 weights are <b>CC BY-NC 4.0</b> (non-commercial).<br/>Click <b>Start</b> — the UI opens in the SONG view. Cover-from-audio is not part of this v1 launcher."
      }
    }
  ]
}
