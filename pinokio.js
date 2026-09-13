const path = require("path")

module.exports = {
  version: "1.0",
  title: "YUE2 // GROOVE",
  description: "Unofficial Gradio UI for YuE2. SONG view by default. Weights CC BY-NC 4.0. macOS ≥32GB or Linux NVIDIA ≥24GB; Windows not supported in v1.",
  icon: "icon.png",
  menu: async (kernel, info) => {
    // Real install = cloned app source + venv (venv alone can exist if clone was skipped)
    let installed = info.exists("app/pyproject.toml") && (info.exists("app/env") || info.exists("env"))
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
