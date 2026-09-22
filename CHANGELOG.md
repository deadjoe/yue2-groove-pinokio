# What's new

Each entry is one app release.  To get it: open YUE2 // GROOVE in Pinokio, click
**Update**, then **Start**.  The footer of the page shows the version you are on.

**If Update seems not to have taken** (the footer still shows the old version, or a new
feature listed here is missing): quit Pinokio completely, open it again, and click **Update**
once more.  Pinokio keeps the update steps it loaded at launch until it is restarted, so the
first Update after a launcher change can run the old steps.

## 1.0.3 — 2026-09-22

**Random seeds, and songs up to 12 minutes**

- **SEED is `-1` by default now**, which means "a new random seed every song" — no more typing
  numbers. The seed that was used is shown in STATUS and saved with the work, so you can type it
  back in to repeat a take exactly; TRY ANOTHER SEED in the SONG view works as before. (EDIT keeps a
  fixed seed by default, because an edit is compared against its original.)
- **Songs can be longer than 6 minutes.** The 6-minute ceiling was the app's, not the model's.
  In ADVANCED // SAMPLING the length ceiling now goes up to 12 minutes, and a new BUDGET PRESET,
  **Long song (~10 min)**, sets everything a long song needs. A song still ends when its lyrics
  end, so a long song needs long lyrics. If the lyrics and score would not leave enough room for
  the length you asked for, the app shortens the ceiling and tells you in STATUS instead of
  failing halfway. Two honest notes: nobody has measured the model past 6 minutes, and on the
  original engine a longer ceiling needs more graphics memory (about 330 MB per extra minute) —
  on a 12 GB card, stay with the default.

**Full details:** https://github.com/deadjoe/yue2_groove/releases/tag/v1.0.3

## 1.0.2 — 2026-09-21

**The GGUF engine, now checked on all three platforms**

- The engine from 1.0.1 has now generated full songs on macOS, Linux and Windows — on Windows on
  an 8 GB card (RTX 2070): a 4:51 song, 6 minutes, 6.1 GB of graphics memory. The docs say what
  each machine gets and how far it was tested (README → Requirements).
- **Windows:** the converted model file gets the same name on every platform now. If you already
  generated a song with 1.0.1 on Windows, the first song after this update converts the model once
  more (about a minute); the old file is no longer used — the terminal names it, and you can delete
  it (`app\models\gguf\YuE2-3B-Q8_0-4c1e36b64d88.gguf`, 3.8 GB).
- The very first song on a machine downloads the model weights (7.3 GB) before anything else
  happens; the STATUS line now says so instead of sitting silently at 5 %.
- Update no longer complains about missing engine binaries in the first two hours after a release.
- Also in the Docker image, for those who run it that way.

**Full details:** https://github.com/deadjoe/yue2_groove/releases/tag/v1.0.2

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
- If the first song after the update stops with **`No module named 'gguf'`**, Update ran with
  the old steps: quit Pinokio, open it again, click Update, then Start (see the top of this page).

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
