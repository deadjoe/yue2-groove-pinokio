# What's new

Each entry is one app release.  To get it: open YUE2 // GROOVE in Pinokio, click
**Update**, then **Start**.  The footer of the page shows the version you are on.

## 1.0.1 — 2026-09-21

**A second engine for smaller graphics cards (and Windows)**

- If your NVIDIA card has less than 16 GB, or you are on Windows, songs now generate through
  the new **GGUF engine** — the same YuE2 model in a compact 8-bit form. It needs about
  **8 GB** of graphics memory for a full-length song instead of 11, and the composing stage
  is several times faster. In a blind listening test nobody could tell its rendering from
  the original. Update installs it; the app switches to it by itself when your card needs it.
- What to expect: the **first song** after the update takes about a minute longer (the model
  is converted once, +4.3 GB on disk). On Windows the very first song can also pause for a few
  minutes while the graphics driver compiles the engine — only once.
- The same seed makes a **different song** on this engine than on the original one. That is
  expected, not a fault; within one engine a seed still repeats exactly.
- Cards with 16 GB or more, and every Mac, keep the original engine. You can switch by hand
  in STUDIO → Settings → BACKEND.

**Also**

- A quick reference for 12 / 16 GB cards and Windows: `docs/LOW_VRAM.md`.

**Full details:** https://github.com/deadjoe/yue2_groove/releases/tag/v1.0.1

## 0.9.1 — 2026-09-20

- **iPhone / iPad:** tapping a text field (STYLE, LYRICS, SEED …) no longer zooms the
  page in, and the page no longer stays zoomed after you leave the field.  Pinch zoom
  still works.

**Full details:** https://github.com/deadjoe/yue2_groove/releases/tag/v0.9.1

## 0.9.0 — 2026-09-19

**Fixes you will notice**

- **Phones and iPads:** the page now uses the whole screen.  Before, about a third of
  a phone's width was empty margin and there was a blank band under the title; on an
  iPad in landscape, tabs 05–07 were hidden behind a `⋯` menu.
- **04 LIBRARY:** the play button works again after you pause a work and pick another
  one (it used to do nothing every second time).

**Under the hood**

- The app's code was reorganised and cleaned up (new checks run on every change).
  Nothing changes in how you install, start or update it.

**Full details:** https://github.com/deadjoe/yue2_groove/releases/tag/v0.9.0
