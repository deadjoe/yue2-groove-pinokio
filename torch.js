// Put the CUDA build of torch into the groove venv on NVIDIA machines.
//
// `uv pip install -e ".[yue2]"` resolves torch from PyPI. PyPI's Linux wheel is
// CUDA-enabled (it pulls nvidia-*-cu12), but PyPI's Windows wheel is CPU-only, so
// without this step Windows + NVIDIA silently runs the 3B model on the CPU.
//
// Adapted from Pinokio's system/examples/torch.js. The version pin must track
// `torch==` in upstream YuE2's pyproject.toml (yue2-v0.1.6 -> 2.10.0).
// macOS is intentionally not touched: overrides/macos.txt already pins torch
// 2.14.0 for the MPS attention fix. AMD / CPU-only machines fall through
// unchanged; YuE2 upstream supports CUDA (BF16) and MPS only.
module.exports = {
  run: [
    // nvidia windows
    {
      when: "{{gpu === 'nvidia' && platform === 'win32'}}",
      method: "shell.run",
      params: {
        venv: "{{args && args.venv ? args.venv : null}}",
        path: "{{args && args.path ? args.path : '.'}}",
        message: "uv pip install torch==2.10.0 --index-url https://download.pytorch.org/whl/cu128 --force-reinstall --no-deps"
      },
      next: null
    },
    // nvidia linux
    {
      when: "{{gpu === 'nvidia' && platform === 'linux'}}",
      method: "shell.run",
      params: {
        venv: "{{args && args.venv ? args.venv : null}}",
        path: "{{args && args.path ? args.path : '.'}}",
        message: "uv pip install torch==2.10.0 --index-url https://download.pytorch.org/whl/cu128 --force-reinstall"
      },
      next: null
    }
  ]
}
