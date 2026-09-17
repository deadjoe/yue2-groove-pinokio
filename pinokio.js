const path = require("path")

module.exports = {
  version: "8.0",
  title: "YUE2 // GROOVE",
  description: "YUE2 // GROOVE is the latest music studio built on the open-source Yue2 model and its inference stack. Generate high-quality full songs from style and lyrics with an editable score plan \u2014 powered by the latest YuE model \u2014 cover from audio with SheetSage2 and MERT2, refine and compare edits, and keep your works in a reusable, easy-to-manage library. You get high-quality creation with real creative control. Hardware: an NVIDIA GPU with 24 GB VRAM on Linux (YuE2's recommended setup, validated end-to-end on NVIDIA L4 hosts; a 16 GB memory budget runs everything the app can produce, and 12 GB runs the unquantized model at CFG 1.0 or for shorter songs) or an Apple Silicon Mac with 32 GB+ unified memory (where this app is developed and tested). Windows is not a supported platform: install, launch and Cover were verified once on Windows 11 (RTX 2070, 8 GB); song generation has not been run there and gets best-effort help only. YuE2 has no official quantized weights and Groove runs the unmodified BF16 model; the experimental FP8 mode (about 4x slower) remains for full-length CFG 1.5 songs on 12 GB, and AR offload is verified lossless.",
  icon: "icon.png",
  menu: async (kernel, info) => {
    // Full install = cloned app + groove venv + SheetSage2 venv
    let installed = info.exists("app/pyproject.toml") && info.exists("app/env") && info.exists("app/.venv-sheetsage2")
    let running = {
      install: info.running("install.js"),
      start: info.running("start.js"),
      update: info.running("update.js"),
      reset: info.running("reset.js")
    }

    if (running.install) {
      return [{
        default: true,
        icon: "fa-solid fa-plug",
        text: "Installing",
        href: "install.js"
      }]
    }

    if (running.update) {
      return [{
        default: true,
        icon: "fa-solid fa-terminal",
        text: "Updating",
        href: "update.js"
      }]
    }

    if (running.reset) {
      return [{
        default: true,
        icon: "fa-solid fa-terminal",
        text: "Resetting",
        href: "reset.js"
      }]
    }

    if (running.start) {
      let local = info.local("start.js")
      let url = local && local.url
      // Ignore unresolved template garbage from a failed URL capture
      let urlOk = url && typeof url === "string" && /^https?:\/\//.test(url) && !url.includes("{{")
      if (urlOk) {
        return [{
          default: true,
          icon: "fa-solid fa-rocket",
          text: "Open Web UI",
          href: url
        }, {
          icon: "fa-solid fa-terminal",
          text: "Terminal",
          href: "start.js"
        }]
      }
      return [{
        default: true,
        icon: "fa-solid fa-terminal",
        text: "Starting",
        href: "start.js"
      }]
    }

    if (installed) {
      return [{
        default: true,
        icon: "fa-solid fa-power-off",
        text: "Start",
        href: "start.js"
      }, {
        icon: "fa-solid fa-plug",
        text: "Update",
        href: "update.js"
      }, {
        icon: "fa-solid fa-plug",
        text: "Install",
        href: "install.js"
      }, {
        icon: "fa-regular fa-circle-xmark",
        text: "Reset",
        href: "reset.js"
      }]
    }

    return [{
      default: true,
      icon: "fa-solid fa-plug",
      text: "Install",
      href: "install.js"
    }]
  }
}
