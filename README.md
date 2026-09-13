# YUE2 // GROOVE — Pinokio launcher

One-click local launcher for [yue2_groove](https://github.com/deadjoe/yue2_groove), the unofficial Gradio UI for [YuE2](https://github.com/multimodal-art-projection/YuE).

## What you get

1. **Install** clones groove, creates two Pinokio-managed Python environments, downloads YuE2 + SheetSage2 weights, and wires Cover.
2. **Start** opens the UI on `127.0.0.1` in the **SONG** view (Studio tabs including **02 // COVER** and **03 // EDIT** stay available).
3. **Update** / **Reset** pull code or wipe both venvs (clone, `models/`, and HF cache stay).

This is the complete app: YuE2 song generation **and** SheetSage2 Cover.

Install declares `requires.bundle = "ai"`. Pinokio installs its AI setup preset (conda, git, ffmpeg, uv, huggingface, …) automatically before the script runs. You do not install those by hand.

## Requirements

- [Pinokio Desktop](https://pinokio.computer)
- **macOS Apple Silicon with ≥ 32 GB** unified memory, **or**
- **Linux + NVIDIA GPU with ≥ 24 GB** VRAM
- **Windows: not supported** in this launcher yet
- Disk space for YuE2 (~8 GB) plus SheetSage2 (and MERT-v2-FullSong on first Cover)

## License notice

YuE2 / SheetSage2 / MERT **model weights** are **CC BY-NC 4.0 (non-commercial)** from their respective authors.  
This launcher and `yue2_groove` UI code are Apache-2.0. By installing you agree to use the weights only for non-commercial purposes.

## Install via Pinokio

1. Open Pinokio → Discover → **Download from URL**
2. Paste:

   ```text
   https://github.com/deadjoe/yue2-groove-pinokio
   ```

3. Click **Install** (first run may open Pinokio's AI setup, then download weights)
4. Click **Start** → **Open Web UI**

## What Install does

| Step | Detail |
|---|---|
| AI bundle | `requires.bundle = "ai"` — Pinokio setup installs conda/git/ffmpeg/uv/huggingface if missing |
| Clone | `yue2_groove` → `app/` when `app/pyproject.toml` is missing |
| Groove venv | official `venv: "env"` — `uv pip install -e ".[yue2]"` with `overrides/{macos,linux}.txt` |
| SheetSage2 venv | official `venv: ".venv-sheetsage2"` + torch 2.8 |
| Weights | official `hf.download` for `m-a-p/SheetSage2`, `m-a-p/YuE2-3B`, `m-a-p/YuE2-Vae` |
| Verify | groove + yue2 + Gradio frontend; Cover venv imports torch/transformers |

**MERT-v2-FullSong** is not pre-downloaded — the first Cover transcription may pull it from Hugging Face.

## Notes

- macOS installs groove torch via `overrides/macos.txt` (2.14). SheetSage2 uses torch 2.8.0 (CPU/MPS index on Mac, cu126 on Linux).
- Start uses `python -m yue2_groove … --sheetsage-python …` so Pinokio owns the process and Cover is configured.
- Apple Silicon starts with MPS watermark defaults (`0.8` / `0.5`) from `ENVIRONMENT`.
- To wipe both Python envs only: **Reset**. Weight cache and `models/SheetSage2` are kept.

## Upstream

- App: https://github.com/deadjoe/yue2_groove
- Model: https://github.com/multimodal-art-projection/YuE
- SheetSage2: https://huggingface.co/m-a-p/SheetSage2
