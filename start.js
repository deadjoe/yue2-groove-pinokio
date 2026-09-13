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
        message: "python -m yue2_groove --host 127.0.0.1 --port {{port}} --no-preload",
        on: [
          {
            event: "/(https?:\\/\\/((\\d|\\.)+|localhost):\\d+)/",
            done: true
          }
        ]
      }
    },
    {
      method: "local.set",
      params: {
        url: "{{input.event[1]}}"
      }
    }
  ]
}
