"""Verify the isolated Cover environment without downloading or loading models."""
import argparse
import importlib.metadata
import sys
from pathlib import Path


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--flavor", choices=("cu126", "cpu", "pypi"), required=True)
    args = parser.parse_args()
    expected_env = Path(__file__).resolve().parent / "app" / ".venv-sheetsage2"
    if Path(sys.prefix).resolve() != expected_env.resolve():
        raise RuntimeError(f"Expected Cover interpreter in {expected_env}, got {sys.prefix}")
    expected = "2.8.0" + ("" if args.flavor == "pypi" else "+" + args.flavor)
    pins = {"torch": expected, "torchaudio": expected, "transformers": "4.45.2",
            "huggingface-hub": "0.36.0", "safetensors": "0.5.3"}
    for name, wanted in pins.items():
        actual = importlib.metadata.version(name)
        print(f"{name}: {actual}", flush=True)
        if actual != wanted:
            raise RuntimeError(f"SheetSage2 needs {name}=={wanted}; found {actual}")
    import torch
    import torchaudio
    import transformers  # noqa: F401 -- real import validates runtime dependencies
    audio = torch.linspace(-1, 1, 1600).reshape(1, -1)
    resampled = torchaudio.functional.resample(audio, 16000, 8000)
    if resampled.shape != (1, 800) or not torch.isfinite(resampled).all():
        raise RuntimeError("TorchAudio resampling smoke test failed")
    print("SheetSage2 dependency check passed (imports and CPU audio resampling).")


if __name__ == "__main__":
    main()
