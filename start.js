module.exports = {
  requires: {
    bundle: "ai"
  },
  daemon: true,
  run: [
    // {{cwd}} is the launcher root; $PWD does not expand in cmd.exe (Windows default shell).
    {
      when: "{{platform !== 'win32'}}",
      method: "shell.run",
      params: {
        venv: "env",
        path: "app",
        env: {
          YUE2_GROOVE_VIEW: "song",
          YUE2_GROOVE_HOST: "127.0.0.1",
          // Use the SheetSage2 snapshot Install put in app/models (YuE2 stays in the HF cache).
          YUE2_GROOVE_MODELS: "{{path.resolve(cwd, 'app', 'models')}}"
        },
        message: "python -c \"from pathlib import Path; import gradio; p=Path(gradio.__file__).parent/'templates'/'frontend'/'index.html'; assert p.is_file(), p\" && python -m yue2_groove --host 127.0.0.1 --port {{port}} --no-preload --sheetsage-python \"{{path.resolve(cwd, 'app', '.venv-sheetsage2', 'bin', 'python')}}\"",
        on: [
          {
            event: "/(http:\\/\\/(?:127\\.0\\.0\\.1|localhost):\\d+)/",
            done: true
          }
        ]
      }
    },
    {
      when: "{{platform === 'win32'}}",
      method: "shell.run",
      params: {
        venv: "env",
        path: "app",
        env: {
          YUE2_GROOVE_VIEW: "song",
          YUE2_GROOVE_HOST: "127.0.0.1",
          // Use the SheetSage2 snapshot Install put in app/models (YuE2 stays in the HF cache).
          YUE2_GROOVE_MODELS: "{{path.resolve(cwd, 'app', 'models')}}"
        },
        message: "python -c \"from pathlib import Path; import gradio; p=Path(gradio.__file__).parent/'templates'/'frontend'/'index.html'; assert p.is_file(), p\" && python -m yue2_groove --host 127.0.0.1 --port {{port}} --no-preload --sheetsage-python \"{{path.resolve(cwd, 'app', '.venv-sheetsage2', 'Scripts', 'python.exe')}}\"",
        on: [
          {
            event: "/(http:\\/\\/(?:127\\.0\\.0\\.1|localhost):\\d+)/",
            done: true
          }
        ]
      }
    },
    {
      when: "{{Boolean(input && input.event && input.event[1])}}",
      method: "local.set",
      params: {
        url: "{{input.event[1]}}"
      }
    }
  ]
}
