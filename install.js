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
    {
      when: "{{platform === 'linux'}}",
      method: "shell.run",
      params: {
        path: "app",
        bluefairy: "off",
        env: {
          HF_XET_HIGH_PERFORMANCE: "1"
        },
        message: [
          "if command -v python3.11 >/dev/null; then PY=python3.11; elif command -v python3.10 >/dev/null; then PY=python3.10; else PY=python3; fi; echo \"SheetSage2 venv python: $($PY --version)\"; $PY -m venv .venv-sheetsage2",
          ".venv-sheetsage2/bin/python -m pip install -U pip",
          ".venv-sheetsage2/bin/python -m pip install huggingface-hub==0.36.0",
          ".venv-sheetsage2/bin/hf download m-a-p/SheetSage2 --local-dir models/SheetSage2",
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
          HF_XET_HIGH_PERFORMANCE: "1"
        },
        message: [
          "if command -v python3.11 >/dev/null; then PY=python3.11; elif command -v python3.10 >/dev/null; then PY=python3.10; else PY=python3; fi; echo \"SheetSage2 venv python: $($PY --version)\"; $PY -m venv .venv-sheetsage2",
          ".venv-sheetsage2/bin/python -m pip install -U pip",
          ".venv-sheetsage2/bin/python -m pip install huggingface-hub==0.36.0",
          ".venv-sheetsage2/bin/hf download m-a-p/SheetSage2 --local-dir models/SheetSage2",
          ".venv-sheetsage2/bin/python -m pip install torch==2.8.0 torchaudio==2.8.0",
          ".venv-sheetsage2/bin/python -m pip install -r models/SheetSage2/requirements.txt"
        ]
      }
    },

    // Write app/.env with absolute SheetSage paths (upsert; do not clobber unrelated keys)
    {
      method: "shell.run",
      params: {
        path: "app",
        message: "python3 - <<'PY'\nfrom pathlib import Path\napp = Path('.').resolve()\nenv_path = app / '.env'\nkeys = {\n    'YUE2_GROOVE_SHEETSAGE_PYTHON': str(app / '.venv-sheetsage2' / 'bin' / 'python'),\n    'YUE2_GROOVE_SHEETSAGE_MODEL': str(app / 'models' / 'SheetSage2'),\n    'YUE2_GROOVE_VIEW': 'song',\n    'YUE2_GROOVE_HOST': '127.0.0.1',\n}\nlines = env_path.read_text(encoding='utf-8').splitlines() if env_path.is_file() else []\nseen = set()\nout = []\nfor line in lines:\n    raw = line.strip()\n    if not raw or raw.startswith('#') or '=' not in raw:\n        out.append(line)\n        continue\n    k = raw.split('=', 1)[0].strip()\n    if k in keys:\n        out.append(f'{k}={keys[k]}')\n        seen.add(k)\n    else:\n        out.append(line)\nfor k, v in keys.items():\n    if k not in seen:\n        out.append(f'{k}={v}')\nenv_path.write_text('\\n'.join(out) + '\\n', encoding='utf-8')\nprint('Wrote', env_path)\nfor k in keys:\n    print(f'  {k}={keys[k]}')\nPY"
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
          HF_XET_HIGH_PERFORMANCE: "1"
        },
        message: [
          "uv pip install --python \"$VIRTUAL_ENV/bin/python\" -U huggingface-hub",
          "hf download m-a-p/YuE2-3B",
          "hf download m-a-p/YuE2-Vae"
        ]
      }
    },

    // Verify gates (fail install if anything is missing)
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
        message: "test -x .venv-sheetsage2/bin/python && .venv-sheetsage2/bin/python -c \"import torch, transformers\" && test -d models/SheetSage2 && (test -f models/SheetSage2/requirements.txt || test -f models/SheetSage2/config.json || ls models/SheetSage2 | grep -q .)"
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
