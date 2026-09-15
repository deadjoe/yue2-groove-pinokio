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
        message: "uv pip install -e \".[yue2]\" --overrides overrides/macos.txt"
      }
    },
    {
      when: "{{platform === 'linux' || platform === 'win32'}}",
      method: "shell.run",
      params: {
        venv: "env",
        path: "app",
        message: "uv pip install -e \".[yue2]\" --overrides overrides/linux.txt"
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
        html: "Updated (groove + SheetSage2 deps). Click <b>Start</b> to relaunch."
      }
    }
  ]
}
