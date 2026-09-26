module.exports = {
  requires: {
    bundle: "ai"
  },
  run: [
    // Launcher scripts first (same as Pinokio's yue example), then the app.
    {
      method: "shell.run",
      params: {
        message: "git pull --ff-only"
      }
    },
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
        message: "uv pip install -e \".[yue2,gguf]\" --overrides overrides/macos.txt"
      }
    },
    {
      when: "{{platform === 'linux' || platform === 'win32'}}",
      method: "shell.run",
      params: {
        venv: "env",
        path: "app",
        message: "uv pip install -e \".[yue2,gguf]\" --overrides overrides/linux.txt"
      }
    },
    // The optional GGUF engine (docs/GGUF_ENGINE.md): this platform's yue2.cpp binaries from
    // the app's release into app/bin/yue2cpp. Idempotent (an install at the pinned commit is
    // kept). Not fatal: without the binaries the app runs exactly as before and its log says
    // that the engine would fit a small card.
    {
      method: "shell.run",
      params: {
        venv: "env",
        path: "app",
        message: "python -m yue2_groove.gguf_engine install --tag latest || echo GGUF engine binaries not installed - the app keeps the PyTorch engine"
      }
    },
    // Keep CUDA torch on NVIDIA if the reinstall above pulled PyPI's wheel back in.
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
    // Put SheetSage2 on the revision install.js pins (a no-op when already there). Repairs
    // installs from 2026-09-22 on, whose later revision fails Cover with
    // FileNotFoundError: chord_spelling_sheetsage2.py; the module cache needs no cleanup.
    {
      when: "{{exists('app/.venv-sheetsage2')}}",
      method: "hf.download",
      params: {
        path: "app",
        _: ["m-a-p/SheetSage2"],
        revision: "24154de28aa6ca3539ae9d87b13364cae2ba2ca2",
        "local-dir": "models/SheetSage2"
      }
    },
    {
      when: "{{exists('app/.venv-sheetsage2') && exists('app/models/SheetSage2/requirements.txt')}}",
      method: "shell.run",
      params: {
        venv: ".venv-sheetsage2",
        path: "app",
        message: "uv pip install -r models/SheetSage2/requirements.txt"
      }
    },
    // Existing installs: fetch the pinned MERT-v2-FullSong snapshot (cache hit = instant).
    {
      when: "{{exists('app/.venv-sheetsage2') && exists('app/models/SheetSage2/config.json')}}",
      method: "shell.run",
      params: {
        venv: ".venv-sheetsage2",
        path: "app",
        message: "python -c \"import json; from huggingface_hub import snapshot_download; c=json.load(open('models/SheetSage2/config.json', encoding='utf-8')); print(snapshot_download(c['base_model_name_or_path'], revision=c['base_model_revision']))\""
      }
    },
    {
      method: "shell.run",
      params: {
        venv: "env",
        path: "app",
        message: "python -c \"import yue2_groove, yue2, gradio\""
      }
    },
    {
      method: "notify",
      params: {
        html: "Updated (groove + SheetSage2 deps + GGUF engine binaries). Click <b>Start</b> to relaunch."
      }
    }
  ]
}
