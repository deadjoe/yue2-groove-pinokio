# YUE2 // GROOVE — Pinokio launcher

<p align="center">
  <a href="https://pinokio.computer"><img src="https://img.shields.io/badge/one--click-Pinokio-F4A261" alt="One-click Pinokio launcher"></a>
  <a href="https://github.com/multimodal-art-projection/YuE"><img src="https://img.shields.io/badge/model-Yue2-7C3AED?logo=github&logoColor=white" alt="Yue2 model"></a>
  <a href="https://huggingface.co/m-a-p/SheetSage2"><img src="https://img.shields.io/badge/cover-SheetSage2%20%2B%20MERT2-0A9396" alt="SheetSage2 + MERT2"></a>
  <img src="https://img.shields.io/badge/platform-macOS%20%C2%B7%20Linux-0EA5E9" alt="macOS · Linux">
  <img src="https://img.shields.io/badge/hardware-24%20GB%20VRAM%20or%2032%20GB%20Apple%20Silicon-EF4444" alt="24 GB VRAM or 32 GB Apple Silicon">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-Apache%202.0-blue" alt="Apache 2.0"></a>
</p>

YUE2 // GROOVE is the latest music studio built on the open-source Yue2 model and its inference stack. Generate high-quality full songs from style and lyrics with an editable score plan — powered by the latest YuE model — cover from audio with SheetSage2 and MERT2, refine and compare edits, and keep your works in a reusable, easy-to-manage library. You get high-quality creation with real creative control. Hardware: an NVIDIA GPU with 24 GB VRAM on Linux (YuE2's recommended setup, validated end-to-end on NVIDIA L4 hosts; a 16 GB memory budget runs everything the app can produce, and 12 GB runs the unquantized model at CFG 1.0 or for shorter songs) or an Apple Silicon Mac with 32 GB+ unified memory (where this app is developed and tested). Windows is not a supported platform: install, launch and Cover were verified once on Windows 11 (RTX 2070, 8 GB); song generation has not been run there and gets best-effort help only. YuE2 has no official quantized weights and Groove runs the unmodified BF16 model; the experimental FP8 mode (about 4x slower) remains for full-length CFG 1.5 songs on 12 GB, and AR offload is verified lossless.

## What you get

1. **Install** clones groove, creates two Pinokio-managed Python environments, downloads YuE2 + SheetSage2 weights, and wires Cover.
2. **Start** opens the UI on `127.0.0.1` in the **SONG** view (Studio tabs including **02 // COVER** and **03 // EDIT** stay available).
3. **Update** pulls this launcher and the app, then refreshes both venvs; **Reset** wipes both venvs (clone, `models/`, and HF cache stay).

This is the complete app: YuE2 song generation **and** SheetSage2 Cover.

New versions of the app arrive through **Update**; what each one changes is in
[CHANGELOG.md](CHANGELOG.md).

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
- About 11 GB of disk for weights: YuE2-3B + VAE (7.8 GB), MERT-v2-FullSong (2.4 GB), SheetSage2 (0.2 GB) — all fetched by Install

### Hardware

- **macOS — tested.** Apple Silicon with **≥ 32 GB** unified memory. This is the platform the app and this launcher are developed and tested on (two 64 GB machines, M1 Max and M4 Pro).
- **Linux + NVIDIA — validated end-to-end, two sessions.** GPU with BF16 and **≥ 24 GB** VRAM is YuE2 upstream's recommended configuration; the app was validated on NVIDIA L4 hosts (generation, Cover, memory budgets, FP8, cross-host reproducibility — see the app's [LINUX_CUDA.md](https://github.com/deadjoe/yue2_groove/blob/main/docs/LINUX_CUDA.md)). A full-length song peaks at about 10.5–10.8 GiB; a **16 GB memory budget** completed the same song **bit-identical** to the 24 GB run and also the longest song the app can produce (11.6 GiB); a **12 GB budget** runs the unquantized model at CFG 1.0 (9.6 GiB) or for songs up to a few minutes. No physical 16 GB or 12 GB card has been tested — these are allocation caps on an L4. Install puts the CUDA (cu128) torch build into the groove venv via `torch.js` and fails if `torch.cuda.is_available()` is still false.
- **Windows + NVIDIA — best effort, now with a path that fits the card.** Install, launch and Cover were verified on Windows 11 (RTX 2070 8 GB); song generation on Windows runs through the **GGUF engine** below (yue2.cpp brings its own FlashAttention, which PyTorch's Windows build lacks), validated on Linux, macOS and that Windows machine (a full-length song on the RTX 2070, 4:51 of audio in 6 minutes, 6.1 GB of graphics memory at peak). A card under 16 GB, or an NVIDIA card next to a CPU-only torch, gets the GGUF engine automatically once its binaries are installed (Install / Update do that).

Memory is not enforced — install proceeds either way.

### Lower VRAM: the GGUF engine

YuE2 ships as one **unquantized BF16** model (7.3 GB of weights; a full-length CFG 1.5 song peaks at
10.5–10.8 GiB in PyTorch). Groove 1.0 adds an optional second engine — the same model through
[yue2.cpp](https://github.com/ServeurpersoCom/yue2.cpp) with an 8-bit (Q8_0) backbone — for cards the
reference configuration does not fit:

- **What it costs in quality:** measured with the reference run's own score, tokens and noise, the
  Q8_0 rendering lands 24 dB from the CUDA reference — the size of a CUDA → Apple-Silicon platform
  change — and a blind ABX could not tell them apart. It is **not** the reference configuration: the
  same seed gives a *different take*, and every run records which engine made it.
- **What it gives:** a full-length CFG 1.5 song at a **peak of 8.2 GB** (measured on an RTX A4000),
  2.5–6× faster AR stage, no FP8 penalty; 8 GB cards get a context cap automatically (songs up to
  ~4.9 min). Details, limits and provenance: [docs/GGUF_ENGINE.md](https://github.com/deadjoe/yue2_groove/blob/main/docs/GGUF_ENGINE.md).
- **Selection:** automatic on a CUDA card under 16 GB (or an NVIDIA card torch cannot see); never on
  Apple Silicon or ≥ 16 GB, where BACKEND → **gguf** in the Settings rail switches by hand. The GGUF
  files are prepared from the weights already on disk on the first GGUF generation (about a minute,
  +4.3 GB, no download).

The PyTorch engine's own knobs stay: **MEMORY BUDGET** (16 validated bit-identical to 24; 12 runs the
unquantized model at CFG 1.0 or for shorter songs), **QUANTIZATION = fp8** (RTX 40+, ~4× slower) and
**OFFLOAD AR WEIGHTS** (lossless, does not lower the peak). Reports from 8–12 GB cards are welcome.

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
| AI bundle | `requires.bundle = "ai"` — Pinokio's own setup installs conda/git/ffmpeg/uv/huggingface (and CUDA on NVIDIA) before Install runs, as in every official launcher |
| Clone | `yue2_groove` → `app/` when `app/pyproject.toml` is missing |
| Groove venv | official `venv: "env"` — `uv pip install -e ".[yue2]"` with `overrides/{macos,linux}.txt` |
| CUDA torch | `torch.js` (Pinokio's standard pattern): on NVIDIA Linux/Windows reinstalls `torch==2.10.0` from the `cu128` index — PyPI's Windows wheel is CPU-only. No-op on macOS |
| SheetSage2 venv | official `venv: ".venv-sheetsage2"` + torch 2.8 |
| Weights | official `hf.download` for `m-a-p/SheetSage2` (to `app/models/SheetSage2`), `m-a-p/YuE2-3B`, `m-a-p/YuE2-Vae`; then the MERT-v2-FullSong snapshot pinned in SheetSage2's `config.json` (`base_model_revision`) into the HF cache |
| Verify | groove + yue2 + Gradio frontend; Cover venv imports torch/transformers; on NVIDIA, `torch.cuda.is_available()` must be true |

Cover needs no network after Install: Start passes `YUE2_GROOVE_MODELS=app/models` so the app uses the downloaded SheetSage2, and the adapter finds its MERT base in the cache by commit hash.

## Notes

- macOS installs groove torch via `overrides/macos.txt` (2.14). Linux/Windows + NVIDIA get `torch==2.10.0+cu128` from `torch.js` (the pin must track upstream YuE2's `torch==`). SheetSage2 uses torch 2.8.0 (CPU/MPS index on Mac, cu126 on Linux/Windows).
- Start uses `python -m yue2_groove … --sheetsage-python …` so Pinokio owns the process and Cover is configured. The venv path and `YUE2_GROOVE_MODELS` are built with `path.resolve(cwd, …)` (cmd.exe on Windows does not expand `$PWD`).
- Apple Silicon starts with MPS watermark defaults (`0.8` / `0.5`) from `ENVIRONMENT`.
- To wipe both Python envs only: **Reset**. Weight cache and `models/SheetSage2` are kept.

## Upstream

- App: https://github.com/deadjoe/yue2_groove
- Model: https://github.com/multimodal-art-projection/YuE
- SheetSage2: https://huggingface.co/m-a-p/SheetSage2
