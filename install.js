module.exports = {
  // Pinokio 8: declare the AI setup preset. Server checks kernel.bin.preset("ai")
  // and redirects to /setup/ai before this script runs if conda/git/ffmpeg/uv
  // are missing. Same pattern as pinokiofactory/wan.
  requires: {
    bundle: "ai"
  },
  run: [
    // Explicit AI preset install (same RPC as Pinokio /setup UI).
    // Complements requires.bundle: installs conda/git/ffmpeg/uv/huggingface if missing.
    {
      method: "kernel.bin.install",
      params: {
        mode: "ai"
      }
    },
    {
      when: "{{platform === 'win32'}}",
      method: "notify",
      params: {
        html: "<b>Windows is not supported yet.</b><br/>YUE2 // GROOVE targets macOS Apple Silicon (≥32 GB) or Linux + NVIDIA (≥24 GB VRAM)."
      },
      next: null
    },

    // Recover an empty app/ (Pinokio may create app/env before clone).
    {
      when: "{{!exists('app/pyproject.toml')}}",
      method: "shell.run",
      params: {
        message: "rm -rf app && git clone --depth 1 https://github.com/deadjoe/yue2_groove.git app"
      }
    },

    {
      when: "{{platform === 'darwin'}}",
      method: "shell.run",
      params: {
        venv: "env",
        path: "app",
        message: [
          "python -m pip install -U pip uv",
          "uv pip install -e \".[yue2]\" --overrides overrides/macos.txt"
        ]
      }
    },
    {
      when: "{{platform === 'linux'}}",
      method: "shell.run",
      params: {
        venv: "env",
        path: "app",
        message: [
          "python -m pip install -U pip uv",
          "uv pip install -e \".[yue2]\" --overrides overrides/linux.txt"
        ]
      }
    },

    // Gradio frontend assets + YuE2-compatible hub pin
    {
      method: "shell.run",
      params: {
        venv: "env",
        path: "app",
        message: [
          "uv pip install --reinstall-package gradio \"gradio>=6,<7\"",
          "uv pip install \"huggingface-hub==0.36.2\"",
          "python -c \"from pathlib import Path; import gradio; p=Path(gradio.__file__).parent/'templates'/'frontend'/'index.html'; assert p.is_file(), p\""
        ]
      }
    },

    // Cover venv: official venv: attribute (Pinokio conda python, not host python3.11)
    {
      when: "{{platform === 'linux'}}",
      method: "shell.run",
      params: {
        venv: ".venv-sheetsage2",
        path: "app",
        message: [
          "python -m pip install -U pip",
          "python -m pip install huggingface-hub==0.36.0",
          "python -m pip install torch==2.8.0 torchaudio==2.8.0 --index-url https://download.pytorch.org/whl/cu126"
        ]
      }
    },
    {
      when: "{{platform === 'darwin'}}",
      method: "shell.run",
      params: {
        venv: ".venv-sheetsage2",
        path: "app",
        message: [
          "python -m pip install -U pip",
          "python -m pip install huggingface-hub==0.36.0",
          "python -m pip install torch==2.8.0 torchaudio==2.8.0"
        ]
      }
    },

    {
      method: "hf.download",
      params: {
        path: "app",
        _: ["m-a-p/SheetSage2"],
        "local-dir": "models/SheetSage2"
      }
    },
    {
      method: "shell.run",
      params: {
        venv: ".venv-sheetsage2",
        path: "app",
        message: "python -m pip install -r models/SheetSage2/requirements.txt"
      }
    },

    {
      method: "hf.download",
      params: {
        path: "app",
        _: ["m-a-p/YuE2-3B"]
      }
    },
    {
      method: "hf.download",
      params: {
        path: "app",
        _: ["m-a-p/YuE2-Vae"]
      }
    },

    {
      when: "{{platform === 'darwin'}}",
      method: "shell.run",
      params: {
        venv: "env",
        path: "app",
        message: "python scripts/mps_sdpa_check.py"
      }
    },

    {
      method: "shell.run",
      params: {
        venv: "env",
        path: "app",
        message: "python -c \"from pathlib import Path; import yue2_groove, yue2, gradio; p=Path(gradio.__file__).parent/'templates'/'frontend'/'index.html'; assert p.is_file(), p\""
      }
    },
    {
      method: "shell.run",
      params: {
        venv: ".venv-sheetsage2",
        path: "app",
        message: "python -c \"import torch, transformers\""
      }
    },

    {
      method: "notify",
      params: {
        html: "<b>Install finished.</b><br/>Full app ready: YuE2 generation <b>and</b> SheetSage2 Cover (dual venv).<br/>YuE2 / SheetSage2 / MERT weights are <b>CC BY-NC 4.0</b> (non-commercial).<br/>MERT-v2-FullSong may download on the <b>first Cover</b> transcription.<br/>Click <b>Start</b> — UI opens in the SONG view."
      }
    }
  ]
}
