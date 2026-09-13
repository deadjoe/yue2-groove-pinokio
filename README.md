# YUE2 // GROOVE — Pinokio launcher

One-click local launcher for [yue2_groove](https://github.com/deadjoe/yue2_groove), the unofficial Gradio UI for [YuE2](https://github.com/multimodal-art-projection/YuE).

## What you get (v1)

1. **Install** clones groove, creates a venv, installs `yue2-groove` + `yue2-infer` with the correct platform overrides, and downloads the YuE2 model weights (~8 GB).
2. **Start** opens the UI on `127.0.0.1` in the **SONG** view.
3. **Update** / **Reset** pull code or wipe the venv.

Cover-from-audio (SheetSage2 second environment) is **not** included in v1.

## Requirements

- [Pinokio Desktop](https://pinokio.computer)
- **macOS Apple Silicon with ≥ 32 GB** unified memory, **or**
- **Linux + NVIDIA GPU with ≥ 24 GB** VRAM
- **Windows: not supported** in this launcher yet
- Disk space for ~8 GB of Hugging Face weights

## License notice

YuE2 **model weights** are **CC BY-NC 4.0 (non-commercial)** from the YuE2 project.  
This launcher and `yue2_groove` UI code are Apache-2.0. By installing you agree to use the weights only for non-commercial purposes.

## Install via Pinokio

1. Open Pinokio → Discover → **Download from URL**
2. Paste:

   ```text
   https://github.com/deadjoe/yue2-groove-pinokio
   ```

3. Click **Install** (first run downloads weights; can take a while)
4. Click **Start** → **Open Web UI**

## Notes

- Start uses `python -m yue2_groove` (not `scripts/serve.sh`) so Pinokio owns the process.
- macOS installs torch via groove’s `overrides/macos.txt` (2.14) — not a generic Factory torch matrix.
- Apple Silicon starts with MPS watermark defaults (`0.8` / `0.5`) from `ENVIRONMENT`.
- To wipe the Python env only: **Reset**. Weight cache under Pinokio’s cache folder is kept.

## Upstream

- App: https://github.com/deadjoe/yue2_groove
- Model: https://github.com/multimodal-art-projection/YuE
