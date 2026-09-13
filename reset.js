module.exports = {
  run: [
    {
      method: "fs.rm",
      params: {
        path: "app/env"
      }
    },
    {
      method: "fs.rm",
      params: {
        path: "env"
      }
    },
    {
      method: "notify",
      params: {
        html: "Virtual environment removed. Click <b>Install</b> for a clean install.<br/>(App clone and Hugging Face weight cache are kept.)"
      }
    }
  ]
}
