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
        path: "app/.venv-sheetsage2"
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
        html: "Virtual environments removed (groove <code>app/env</code> + SheetSage2 <code>app/.venv-sheetsage2</code>).<br/>Click <b>Install</b> for a clean install.<br/>(App clone, <code>models/</code>, and Hugging Face weight cache are kept.)"
      }
    }
  ]
}
