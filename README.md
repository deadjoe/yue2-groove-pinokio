# YUE2 // GROOVE — Pinokio launcher

<p align="center">
  <a href="https://pinokio.computer"><img src="https://img.shields.io/badge/one--click-Pinokio-F4A261" alt="One-click Pinokio launcher"></a>
  <a href="https://github.com/multimodal-art-projection/YuE"><img src="https://img.shields.io/badge/model-Yue2-7C3AED?logo=github&logoColor=white" alt="Yue2 model"></a>
  <a href="https://huggingface.co/m-a-p/SheetSage2"><img src="https://img.shields.io/badge/cover-SheetSage2%20%2B%20MERT2-0A9396" alt="SheetSage2 + MERT2"></a>
  <img src="https://img.shields.io/badge/platform-macOS%20%C2%B7%20Linux%20%C2%B7%20Windows%20(untested)-0EA5E9" alt="macOS · Linux · Windows (untested)">
  <img src="https://img.shields.io/badge/hardware-24%20GB%20VRAM%20or%2032%20GB%20Apple%20Silicon-EF4444" alt="24 GB VRAM or 32 GB Apple Silicon">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-Apache%202.0-blue" alt="Apache 2.0"></a>
</p>

YUE2 // GROOVE is the latest music studio built on the open-source Yue2 model and its inference stack. Generate high-quality full songs from style and lyrics with an editable score plan — powered by the latest YuE model — cover from audio with SheetSage2 and MERT2, refine and compare edits, and keep your works in a reusable, easy-to-manage library. You get high-quality creation with real creative control. Hardware: an NVIDIA GPU with 24 GB VRAM on Linux (YuE2's validated setup) or an Apple Silicon Mac with 32 GB+ unified memory (where this app is developed and tested). Windows + NVIDIA gets the CUDA build installed but is untested. YuE2 is one unquantized BF16 model; the memory budget / AR offload / experimental FP8 knobs in Settings are unvalidated below 24 GB.

## What you get

1. **Install** clones groove, creates two Pinokio-managed Python environments, downloads YuE2 + SheetSage2 weights, and wires Cover.
2. **Start** opens the UI on `127.0.0.1` in the **SONG** view (Studio tabs including **02 // COVER** and **03 // EDIT** stay available).
3. **Update** pulls this launcher and the app, then refreshes both venvs; **Reset** wipes both venvs (clone, `models/`, and HF cache stay).

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

### Hardware

- **macOS — tested.** Apple Silicon with **≥ 32 GB** unified memory. This is the platform the app and this launcher are developed and tested on (a 64 GB machine).
- **Linux + NVIDIA — upstream's platform, not exercised by the author.** GPU with BF16 and **≥ 24 GB** VRAM is YuE2 upstream's only validated configuration. Install puts the CUDA (cu128) torch build into the groove venv via `torch.js` and fails if `torch.cuda.is_available()` is still false.
- **Windows + NVIDIA — untested.** Same CUDA path as Linux (`torch.js` replaces PyPI's CPU-only Windows torch wheel). YuE2 upstream does not list Windows as a supported platform; the launcher follows Pinokio's standard `torch.js` pattern, but nobody has confirmed a full generation on Windows yet. Reports welcome.

Memory is not enforced — install proceeds either way.

### Lower VRAM

YuE2 ships as one **unquantized BF16** model (3B weights ≈ 7 GB, the rest of the 24 GB is KV cache, NAR synthesis and VAE decode). There is no int8/int4/GGUF build. What upstream offers, all reachable from the **Settings** rail:

- **MEMORY BUDGET** — the GiB YuE2 may use (`≤ 12` also halves the VAE decode window)
- **OFFLOAD AR WEIGHTS** — moves the AR stack to CPU during acoustic synthesis
- **QUANTIZATION = fp8** — experimental, AR linears only, needs an RTX 40-series or newer (compute capability ≥ 8.9); upstream marks its quality as unvalidated

None of these are validated below 24 GB by upstream or by this launcher. If you try them on a 12–16 GB card, reports are welcome.

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
| CUDA torch | `torch.js` (Pinokio's standard pattern): on NVIDIA Linux/Windows reinstalls `torch==2.10.0` from the `cu128` index — PyPI's Windows wheel is CPU-only. No-op on macOS |
| SheetSage2 venv | official `venv: ".venv-sheetsage2"` + torch 2.8 |
| Weights | official `hf.download` for `m-a-p/SheetSage2`, `m-a-p/YuE2-3B`, `m-a-p/YuE2-Vae` |
| Verify | groove + yue2 + Gradio frontend; Cover venv imports torch/transformers; on NVIDIA, `torch.cuda.is_available()` must be true |

**MERT-v2-FullSong** is not pre-downloaded — the first Cover transcription may pull it from Hugging Face.

## Notes

- macOS installs groove torch via `overrides/macos.txt` (2.14). Linux/Windows + NVIDIA get `torch==2.10.0+cu128` from `torch.js` (the pin must track upstream YuE2's `torch==`). SheetSage2 uses torch 2.8.0 (CPU/MPS index on Mac, cu126 on Linux/Windows).
- Start uses `python -m yue2_groove … --sheetsage-python …` so Pinokio owns the process and Cover is configured. The venv path is built with `path.resolve(cwd, …)` (cmd.exe on Windows does not expand `$PWD`).
- Apple Silicon starts with MPS watermark defaults (`0.8` / `0.5`) from `ENVIRONMENT`.
- To wipe both Python envs only: **Reset**. Weight cache and `models/SheetSage2` are kept.

## Upstream

- App: https://github.com/deadjoe/yue2_groove
- Model: https://github.com/multimodal-art-projection/YuE
- SheetSage2: https://huggingface.co/m-a-p/SheetSage2
