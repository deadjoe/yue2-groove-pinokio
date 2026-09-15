module.exports = {
  // Pinokio's AI setup preset (conda/git/ffmpeg/uv/huggingface, CUDA on NVIDIA).
  // The server checks it and redirects to /setup/ai before this script runs, the
  // same as every official launcher. Do not add an explicit kernel.bin.install:
  // it re-runs the whole preset, and its bun step fails on Windows when the
  // freshly unpacked bun.exe is still locked (Defender) during npm's rename.
  requires: {
    bundle: "ai"
  },
  run: [
    // Recover an empty app/ (Pinokio may create app/env before clone).
    // fs.rm instead of `rm -rf`: the default Windows shell is cmd.exe.
    {
      when: "{{!exists('app/pyproject.toml')}}",
      method: "fs.rm",
      params: {
        path: "app"
      }
    },
    {
      when: "{{!exists('app/pyproject.toml')}}",
      method: "shell.run",
      params: {
        message: "git clone --depth 1 https://github.com/deadjoe/yue2_groove.git app"
      }
    },

    {
      when: "{{platform === 'darwin'}}",
      method: "shell.run",
      params: {
        venv: "env",
        path: "app",
        message: [
          "uv pip install -e \".[yue2]\" --overrides overrides/macos.txt"
        ]
      }
    },
    {
      when: "{{platform === 'linux' || platform === 'win32'}}",
      method: "shell.run",
      params: {
        venv: "env",
        path: "app",
        message: [
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

    // CUDA torch for NVIDIA (PyPI's Windows torch wheel is CPU-only). No-op on macOS.
    {
      method: "script.start",
      params: {
        uri: "torch.js",
        params: {
          path: "app",
          venv: "env"
        }
      }
    },

    // Cover venv: official venv: attribute (Pinokio conda python, not host python3.11)
    {
      when: "{{platform === 'linux' || platform === 'win32'}}",
      method: "shell.run",
      params: {
        venv: ".venv-sheetsage2",
        path: "app",
        message: [
          "uv pip install huggingface-hub==0.36.0",
          "uv pip install torch==2.8.0 torchaudio==2.8.0 --index-url https://download.pytorch.org/whl/cu126"
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
          "uv pip install huggingface-hub==0.36.0",
          "uv pip install torch==2.8.0 torchaudio==2.8.0"
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
        message: "uv pip install -r models/SheetSage2/requirements.txt"
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
        message: "python scripts/mps_sdpa_check.py || true"
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
      when: "{{gpu === 'nvidia'}}",
      method: "shell.run",
      params: {
        venv: "env",
        path: "app",
        message: "python -c \"import torch; assert torch.cuda.is_available(), 'torch ' + torch.__version__ + ' has no CUDA support'; print('CUDA torch', torch.__version__, torch.cuda.get_device_name(0))\""
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
