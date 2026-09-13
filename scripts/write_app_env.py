#!/usr/bin/env python3
"""Upsert YUE2_GROOVE_* keys into app/.env with absolute paths.

Cwd must be app/, or pass the app directory as argv[1].
"""
from __future__ import annotations

import sys
from pathlib import Path


def main() -> None:
    if len(sys.argv) > 1:
        app = Path(sys.argv[1]).resolve()
    else:
        app = Path(".").resolve()

    env_path = app / ".env"
    keys = {
        "YUE2_GROOVE_SHEETSAGE_PYTHON": str(app / ".venv-sheetsage2" / "bin" / "python"),
        "YUE2_GROOVE_SHEETSAGE_MODEL": str(app / "models" / "SheetSage2"),
        "YUE2_GROOVE_VIEW": "song",
        "YUE2_GROOVE_HOST": "127.0.0.1",
    }

    lines = env_path.read_text(encoding="utf-8").splitlines() if env_path.is_file() else []
    seen: set[str] = set()
    out: list[str] = []
    for line in lines:
        raw = line.strip()
        if not raw or raw.startswith("#") or "=" not in raw:
            out.append(line)
            continue
        k = raw.split("=", 1)[0].strip()
        if k in keys:
            out.append(f"{k}={keys[k]}")
            seen.add(k)
        else:
            out.append(line)
    for k, v in keys.items():
        if k not in seen:
            out.append(f"{k}={v}")

    env_path.write_text("\n".join(out) + "\n", encoding="utf-8")
    print("Wrote", env_path)
    for k in keys:
        print(f"  {k}={keys[k]}")


if __name__ == "__main__":
    main()
