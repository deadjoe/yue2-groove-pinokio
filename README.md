# YUE2 // GROOVE — Pinokio launcher

<p align="center">
  <a href="https://pinokio.computer"><img src="https://img.shields.io/badge/one--click-Pinokio-F4A261" alt="One-click Pinokio launcher"></a>
  <a href="https://github.com/multimodal-art-projection/YuE"><img src="https://img.shields.io/badge/model-Yue2-7C3AED?logo=github&logoColor=white" alt="Yue2 model"></a>
  <a href="https://huggingface.co/m-a-p/SheetSage2"><img src="https://img.shields.io/badge/cover-SheetSage2%20%2B%20MERT2-0A9396" alt="SheetSage2 + MERT2"></a>
  <img src="https://img.shields.io/badge/platform-macOS%20%2F%20Linux%20%2F%20Windows*-0EA5E9" alt="macOS / Linux / Windows">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-Apache%202.0-blue" alt="Apache 2.0"></a>
</p>

YUE2 // GROOVE is the latest music studio built on the open-source Yue2 model and its inference stack. Generate high-quality full songs from style and lyrics with an editable score plan — powered by the latest YuE model — cover from audio with SheetSage2 and MERT2, refine and compare edits, and keep your works in a reusable, easy-to-manage library. You get high-quality creation with real creative control.

## What you get

1. **Install** clones groove, creates two Pinokio-managed Python environments, downloads YuE2 + SheetSage2 weights, and wires Cover.
2. **Start** opens the UI on `127.0.0.1` in the **SONG** view (Studio tabs including **02 // COVER** and **03 // EDIT** stay available).
3. **Update** / **Reset** pull code or wipe both venvs (clone, `models/`, and HF cache stay).

This is the complete app: YuE2 song generation **and** SheetSage2 Cover.

## Screenshots

**Pinokio Explore** — Installable app page:

<img src="docs/images/pinokio-app-page.png" alt="YUE2 // GROOVE on Pinokio Explore" width="100%">

**SONG** — start (NEW / COVER / EDIT):

<img src="docs/images/song-start-dark.png" alt="SONG view start cards" width="100%">

**SONG** — after generate:

<img src="docs/images/song-audio-dark.png" alt="SONG view with audio and score" width="100%">

More UI shots live in the [yue2_groove README](https://github.com/deadjoe/yue2_groove#screenshots).


Install declares `requires.bundle = "ai"`. Pinokio installs its AI setup preset (conda, git, ffmpeg, uv, huggingface, …) automatically before the script runs. You do not install those by hand.

## Requirements

- [Pinokio Desktop](https://pinokio.computer)
- Disk space for YuE2 (~8 GB) plus SheetSage2 (and MERT-v2-FullSong on first Cover)

### Recommended hardware

Not enforced by the launcher — install will proceed either way.

- **macOS:** Apple Silicon with **≥ 32 GB** unified memory (from `yue2_groove` guidance; developed on 64 GB)
- **Linux:** NVIDIA GPU with BF16 and **≥ 24 GB** VRAM (YuE2 upstream baseline)
- **Windows:** untested; Install uses the same CUDA dependency path as Linux

## License notice

YuE2 / SheetSage2 / MERT **model weights** are **CC BY-NC 4.0 (non-commercial)** from their respective authors.  
This launcher and `yue2_groove` UI code are Apache-2.0. By installing you agree to use the weights only for non-commercial purposes.

## Install via Pinokio

**Easiest:** open the [app page on Pinokio](https://pinokio.co/apps/github-com-deadjoe-yue2-groove-pinokio) → **Install** → **Start**.

Or from Desktop:

1. Open Pinokio → **Explore** / Discover → search `YUE2 // GROOVE` (or **Download from URL**)
2. If using URL, paste:

   ```text
   https://github.com/deadjoe/yue2-groove-pinokio
   ```

3. Finish **Dev Setup** if it appears, then complete download
4. Click **Install** (AI bundle via `requires.bundle`, then weights)
5. Click **Start** → **Open Web UI**

> On a brand-new Pinokio home, prefer **Explore / Discover → Download from URL** (or the app-page Install). Avoid Create / Plugins → “Download from Git URL” — that Universal Launcher path can skip the bin seed and fail with `conda: command not found`.

## What Install does

| Step | Detail |
|---|---|
| AI bundle | `requires.bundle = "ai"` plus first step `kernel.bin.install` `mode: "ai"` (same as Pinokio setup UI) |
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
