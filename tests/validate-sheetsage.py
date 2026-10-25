"""Real clean-install / mismatched-environment repair test of the launcher commands.

Uses a disposable app layout, real app pyproject overrides and pinned model requirements.
No model weights or GPU are required. Run with --app-source pointing to the app checkout.
"""
import argparse
import hashlib
import json
import os
from pathlib import Path
import shlex
import shutil
import subprocess
import sys
import tempfile
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
REVISION = "24154de28aa6ca3539ae9d87b13364cae2ba2ca2"


def run(args, cwd, env, expect_ok=True):
    print("+", shlex.join(map(str, args)), flush=True)
    args = list(map(str, args))
    # Windows CreateProcess resolves a relative executable before applying cwd.
    # Pinokio runs it in a shell already rooted at app; emulate that resolution.
    if sys.platform == "win32" and "/" in args[0] and not Path(args[0]).is_absolute():
        args[0] = str((Path(cwd) / args[0]).absolute())
    result = subprocess.run(args, cwd=cwd, env=env, text=True,
                            stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    print(result.stdout, flush=True)
    if expect_ok and result.returncode:
        raise RuntimeError(f"Command failed ({result.returncode})")
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--app-source", type=Path, required=True)
    parser.add_argument("--gpu", choices=("nvidia", "cpu"), default="cpu")
    args = parser.parse_args()
    platform = {"win32": "win32", "darwin": "darwin"}.get(sys.platform, "linux")
    js = """const script = require('./sheetsage.js');
const platform = process.argv[1], gpu = process.argv[2];
const render = s => s.replace(/\{\{(.*?)\}\}/g, (_, e) => Function('platform','gpu',`return (${e})`)(platform,gpu));
const selected = script.run.filter(s => render(s.when) === 'true');
if (selected.length !== 1) throw Error('expected one platform policy');
console.log(JSON.stringify(render(selected[0].params.message)));
"""
    command = json.loads(subprocess.check_output(
        ["node", "-e", js, platform, args.gpu], cwd=ROOT, text=True))
    # Forward-slash Windows paths and quotes are deliberately accepted by shlex.
    commands = [shlex.split(part) for part in command.split(" && ")]
    env = dict(os.environ)
    for key in list(env):
        if key.startswith("UV_") or key in ("VIRTUAL_ENV", "PYTHONPATH", "PYTHONHOME"):
            env.pop(key)
    env["UV_NO_CACHE"] = "1"
    with tempfile.TemporaryDirectory(prefix="groove-cover-") as directory:
        base = Path(directory)
        app = base / "app"
        model = app / "models" / "SheetSage2"
        model.mkdir(parents=True)
        shutil.copyfile(args.app_source / "pyproject.toml", app / "pyproject.toml")
        shutil.copyfile(ROOT / "check-sheetsage.py", base / "check-sheetsage.py")
        url = f"https://huggingface.co/m-a-p/SheetSage2/resolve/{REVISION}/requirements.txt"
        with urllib.request.urlopen(url, timeout=90) as response:
            requirements = response.read()
        (model / "requirements.txt").write_bytes(requirements)
        # Main environment and settings sentinels prove repair scope is limited.
        sentinel = app / "env" / "untouched.txt"
        sentinel.parent.mkdir()
        sentinel.write_text("main environment must not change")
        settings = app / "yue2_groove_settings.json"
        settings.write_text('{"keep": true}')
        before = {p: hashlib.sha256(p.read_bytes()).hexdigest()
                  for p in (sentinel, settings, model / "requirements.txt", app / "pyproject.toml")}
        python = app / (".venv-sheetsage2/Scripts/python.exe" if platform == "win32"
                        else ".venv-sheetsage2/bin/python")
        run(["uv", "--no-config", "venv", "--python", sys.executable,
             str(app / ".venv-sheetsage2")], app, env)
        print("=== Reproduce the original override leak (dry run) ===", flush=True)
        leaked = [x for x in commands[0] if x != "--no-config"] + ["--dry-run"]
        result = run(leaked, app, env)
        wrong_version = "2.14.1" if platform == "darwin" else "2.10.0"
        if f"torch=={wrong_version}" not in result.stdout:
            raise AssertionError("Expected app override to reproduce the wrong Torch resolution")
        print("=== Clean install using production launcher commands ===", flush=True)
        for cmd in commands:
            run(cmd, app, env)
        run(["uv", "--no-config", "pip", "check", "--python", str(python)], app, env)
        print("=== Seed the reported mismatched Torch environment ===", flush=True)
        index = commands[0][commands[0].index("--index-url") + 1]
        flavor = commands[-1][-1]
        wrong = "2.10.0" + ("" if flavor == "pypi" else "+" + flavor)
        run(["uv", "--no-config", "pip", "install", "--python", str(python),
             "--no-deps", "torch==" + wrong, "--index-url", index], app, env)
        rejected = run(commands[-1], app, env, expect_ok=False)
        if rejected.returncode == 0 or "SheetSage2 needs torch==2.8.0" not in rejected.stdout:
            raise AssertionError("The checker did not reject mismatched Torch")
        print("=== In-place repair using the same Update policy ===", flush=True)
        for cmd in commands:
            run(cmd, app, env)
        run(["uv", "--no-config", "pip", "check", "--python", str(python)], app, env)
        print("=== Repeat update: dependency resolution must be idempotent ===", flush=True)
        for cmd in commands[:2]:
            result = run(cmd + ["--dry-run"], app, env)
            if "Would install" in result.stdout or "Would uninstall" in result.stdout:
                raise AssertionError("A second update would change the repaired environment")
        for p, digest in before.items():
            if hashlib.sha256(p.read_bytes()).hexdigest() != digest:
                raise AssertionError(f"Repair changed an unrelated file: {p}")
        print("PASS: clean install, mismatch rejection, repair, imports, audio operation, "
              "dependency consistency, idempotence and scope sentinels.", flush=True)


if __name__ == "__main__":
    main()
