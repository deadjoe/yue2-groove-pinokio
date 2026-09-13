module.exports = {
  daemon: true,
  run: [
    {
      method: "shell.run",
      params: {
        venv: "env",
        path: "app",
        env: {
          YUE2_GROOVE_VIEW: "song",
          YUE2_GROOVE_HOST: "127.0.0.1"
        },
        // Prefer -m over scripts/serve.sh so Pinokio owns the daemon lifecycle.
        // --sheetsage-python wires Cover; app/.env (written by Install) also sets YUE2_GROOVE_*.
        message: "python -m yue2_groove --host 127.0.0.1 --port {{port}} --no-preload --sheetsage-python \"$PWD/.venv-sheetsage2/bin/python\"",
        on: [
          {
            // Pinokio 8 / Factory: full match is input.event[0] (no capture-group index).
            // Gradio prints http://127.0.0.1:<port> or http://localhost:<port>.
            event: "/http:\\/\\/(?:127\\.0\\.0\\.1|localhost):\\d+/",
            done: true
          }
        ]
      }
    },
    {
      // Only set when the shell matched a URL; otherwise Pinokio can write the
      // unresolved template literal and Open Web UI becomes ENOENT garbage.
      when: "{{Boolean(input && input.event)}}",
      method: "local.set",
      params: {
        url: "{{input.event[0]}}"
      }
    }
  ]
}
