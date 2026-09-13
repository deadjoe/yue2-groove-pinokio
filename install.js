module.exports = {
  run: [
    // Windows is out of scope for v1
    {
      when: "{{platform === 'win32'}}",
      method: "notify",
      params: {
        html: "<b>Windows is not supported yet.</b><br/>YUE2 // GROOVE targets macOS Apple Silicon (≥32 GB) or Linux + NVIDIA (≥24 GB VRAM)."
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

    // Groove venv: app/env via venv:"env", path:"app" + platform overrides.
    // Do NOT use a generic Factory torch.js matrix — macOS needs torch 2.14 via overrides/macos.txt.
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

    // Gradio frontend assets: Pinokio Disk Saver / incomplete installs can strip
    // site-packages/gradio/templates/frontend. Reinstall + assert before continuing.
    // Re-pin huggingface-hub==0.36.2 after Gradio (it may pull hub 1.x; YuE2 needs 0.36.x).
    {
      method: "shell.run",
      params: {
        venv: "env",
        path: "app",
        bluefairy: "off",
        message: [
          "uv pip install --python \"$VIRTUAL_ENV/bin/python\" --reinstall-package gradio \"gradio>=6,<7\"",
          "uv pip install --python \"$VIRTUAL_ENV/bin/python\" \"huggingface-hub==0.36.2\"",
          "python -c \"from pathlib import Path; import gradio; p=Path(gradio.__file__).parent/'templates'/'frontend'/'index.html'; assert p.is_file(), p\""
        ]
      }
    },

    // FFmpeg 6.1+ on PATH (SheetSage2 Cover needs it)
    {
      method: "shell.run",
      params: {
        path: "app",
        bluefairy: "off",
        message: "command -v ffmpeg >/dev/null || conda install -y -c conda-forge ffmpeg; ffmpeg -version"
      }
    },

    // SheetSage2 separate venv at app/.venv-sheetsage2 (AUTO-DETECT looks here).
    // Recipe from app docs/COVER_EDIT.md — Python 3.11 preferred, 3.10 fallback.
    // Force HF_HUB_ENABLE_HF_TRANSFER=0: Pinokio injects =1 but hf_transfer is not installed;
    // XET high-performance path works without the hf_transfer package.
    {
      when: "{{platform === 'linux'}}",
      method: "shell.run",
      params: {
        path: "app",
        bluefairy: "off",
        env: {
          HF_HUB_ENABLE_HF_TRANSFER: "0",
          HF_XET_HIGH_PERFORMANCE: "1"
        },
        message: [
          "if command -v python3.11 >/dev/null; then PY=python3.11; elif command -v python3.10 >/dev/null; then PY=python3.10; else PY=python3; fi; echo \"SheetSage2 venv python: $($PY --version)\"; $PY -m venv .venv-sheetsage2",
          ".venv-sheetsage2/bin/python -m pip install -U pip",
          ".venv-sheetsage2/bin/python -m pip install huggingface-hub==0.36.0",
          "rm -rf models/SheetSage2",
          "export HF_HUB_ENABLE_HF_TRANSFER=0 HF_XET_HIGH_PERFORMANCE=1; .venv-sheetsage2/bin/hf download m-a-p/SheetSage2 --local-dir models/SheetSage2",
          ".venv-sheetsage2/bin/python -m pip install torch==2.8.0 torchaudio==2.8.0 --index-url https://download.pytorch.org/whl/cu126",
          ".venv-sheetsage2/bin/python -m pip install -r models/SheetSage2/requirements.txt"
        ]
      }
    },
    {
      when: "{{platform === 'darwin'}}",
      method: "shell.run",
      params: {
        path: "app",
        bluefairy: "off",
        env: {
          HF_HUB_ENABLE_HF_TRANSFER: "0",
          HF_XET_HIGH_PERFORMANCE: "1"
        },
        message: [
          "if command -v python3.11 >/dev/null; then PY=python3.11; elif command -v python3.10 >/dev/null; then PY=python3.10; else PY=python3; fi; echo \"SheetSage2 venv python: $($PY --version)\"; $PY -m venv .venv-sheetsage2",
          ".venv-sheetsage2/bin/python -m pip install -U pip",
          ".venv-sheetsage2/bin/python -m pip install huggingface-hub==0.36.0",
          "rm -rf models/SheetSage2",
          "export HF_HUB_ENABLE_HF_TRANSFER=0 HF_XET_HIGH_PERFORMANCE=1; .venv-sheetsage2/bin/hf download m-a-p/SheetSage2 --local-dir models/SheetSage2",
          ".venv-sheetsage2/bin/python -m pip install torch==2.8.0 torchaudio==2.8.0",
          ".venv-sheetsage2/bin/python -m pip install -r models/SheetSage2/requirements.txt"
        ]
      }
    },

    // Write app/.env with absolute SheetSage paths (upsert; do not clobber unrelated keys).
    // External script avoids jimini confusion from inline Python containing split('=', 1)[0].
    {
      method: "shell.run",
      params: {
        path: "app",
        message: "python3 ../scripts/write_app_env.py"
      }
    },

    // Pre-download YuE2 weights into Pinokio's HF cache (~8 GB)
    // Same transfer override: Pinokio may inject HF_HUB_ENABLE_HF_TRANSFER=1.
    {
      method: "shell.run",
      params: {
        venv: "env",
        path: "app",
        cache: "cache",
        bluefairy: "off",
        env: {
          HF_HUB_ENABLE_HF_TRANSFER: "0",
          HF_XET_HIGH_PERFORMANCE: "1"
        },
        message: [
          "uv pip install --python \"$VIRTUAL_ENV/bin/python\" \"huggingface-hub==0.36.2\"",
          "export HF_HUB_ENABLE_HF_TRANSFER=0 HF_XET_HIGH_PERFORMANCE=1; hf download m-a-p/YuE2-3B",
          "export HF_HUB_ENABLE_HF_TRANSFER=0 HF_XET_HIGH_PERFORMANCE=1; hf download m-a-p/YuE2-Vae"
        ]
      }
    },

    // Verify gates (fail install if anything is missing)
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
        path: "app",
        message: "test -x .venv-sheetsage2/bin/python && .venv-sheetsage2/bin/python -c \"import torch, transformers\" && (test -f models/SheetSage2/config.json || test -f models/SheetSage2/model.safetensors || test -f models/SheetSage2/pytorch_model.bin) && find models/SheetSage2 -type f -size +100k | head -1 | grep -q ."
      }
    },
    // YuE2: hf download exit codes are the primary gate; also require HF cache content
    {
      method: "shell.run",
      params: {
        venv: "env",
        path: "app",
        cache: "cache",
        message: "test -n \"${HF_HOME:-}\" && test -d \"$HF_HOME\" && find \"$HF_HOME\" -type d \\( -iname '*YuE2*' -o -iname '*yue2*' \\) 2>/dev/null | head -1 | grep -q ."
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

    {
      method: "notify",
      params: {
        html: "<b>Install finished.</b><br/>Full app ready: YuE2 generation <b>and</b> SheetSage2 Cover (dual venv).<br/>YuE2 / SheetSage2 / MERT weights are <b>CC BY-NC 4.0</b> (non-commercial).<br/>MERT-v2-FullSong may download on the <b>first Cover</b> transcription.<br/>Click <b>Start</b> — UI opens in the SONG view."
      }
    }
  ]
}
