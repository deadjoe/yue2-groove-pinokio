# YUE2 // GROOVE — Pinokio launcher

One-click local launcher for [yue2_groove](https://github.com/deadjoe/yue2_groove), the unofficial Gradio UI for [YuE2](https://github.com/multimodal-art-projection/YuE).

## What you get

1. **Install** clones groove, creates **two** Python environments, installs FFmpeg if needed, downloads YuE2 + SheetSage2 weights, and writes `app/.env` so Cover is wired.
2. **Start** opens the UI on `127.0.0.1` in the **SONG** view (full Studio tabs including **02 // COVER** and **03 // EDIT** are available).
3. **Update** / **Reset** pull code or wipe both venvs (clone, `models/`, and HF cache stay).

This is the **complete** app for non-technical users: YuE2 song generation **and** SheetSage2 Cover — not SONG-only.

## Requirements

- [Pinokio Desktop](https://pinokio.computer)
- **macOS Apple Silicon with ≥ 32 GB** unified memory, **or**
- **Linux + NVIDIA GPU with ≥ 24 GB** VRAM
- **Windows: not supported** in this launcher yet
- Disk space for YuE2 (~8 GB) **plus** SheetSage2 (and MERT-v2-FullSong on first Cover) — plan for well over 10 GB of model data

## License notice

YuE2 / SheetSage2 / MERT **model weights** are **CC BY-NC 4.0 (non-commercial)** from their respective authors.  
This launcher and `yue2_groove` UI code are Apache-2.0. By installing you agree to use the weights only for non-commercial purposes.

## Install via Pinokio

1. Open Pinokio → Discover → **Download from URL**
2. Paste:

   ```text
   https://github.com/deadjoe/yue2-groove-pinokio
   ```

3. Click **Install** (first run downloads weights; can take a while)
4. Click **Start** → **Open Web UI**

## What Install does

| Step | Detail |
|---|---|
| Clone | `yue2_groove` → `app/` (recovers if Pinokio created an empty `app/env` first) |
| Groove venv | `app/env` — `uv pip install -e ".[yue2]"` with `overrides/{macos,linux}.txt` |
| FFmpeg | Ensures `ffmpeg` 6.1+ on `PATH` (`conda-forge` if missing) |
| SheetSage2 venv | `app/.venv-sheetsage2` (Python 3.11 preferred, 3.10 fallback) + torch 2.8 + `models/SheetSage2` |
| `.env` | Absolute `YUE2_GROOVE_SHEETSAGE_PYTHON` / `…_MODEL` (+ view/host); upserts without clobbering other keys |
| YuE2 weights | `hf download m-a-p/YuE2-3B` and `YuE2-Vae` into Pinokio `cache` (`HF_XET_HIGH_PERFORMANCE=1`, `HF_HUB_ENABLE_HF_TRANSFER=0`) |
| Verify | Imports + executable SheetSage python + real model files under `models/SheetSage2` + YuE2 HF cache dirs |

**MERT-v2-FullSong** (SheetSage2’s parent encoder) is **not** pre-downloaded at install — the first Cover transcription may pull it from Hugging Face.

## Notes

- If Install fails on `hf_transfer`, we force `HF_HUB_ENABLE_HF_TRANSFER=0` on every `hf download` step so the XET path works without the `hf_transfer` package.
- Start uses `python -m yue2_groove … --sheetsage-python …` so Pinokio owns the process and Cover is configured.
- macOS installs groove torch via `overrides/macos.txt` (2.14); SheetSage2 uses torch 2.8.0 without the CUDA index.
- Linux SheetSage2 uses torch/torchaudio 2.8.0 from the cu126 wheel index.
- Apple Silicon starts with MPS watermark defaults (`0.8` / `0.5`) from `ENVIRONMENT`.
- To wipe both Python envs only: **Reset**. Weight cache and `models/SheetSage2` are kept.

## Upstream

- App: https://github.com/deadjoe/yue2_groove
- Model: https://github.com/multimodal-art-projection/YuE
- SheetSage2: https://huggingface.co/m-a-p/SheetSage2
