"""Generate the fixed pt-PT alphabet clips on macOS; standard library only.

Requires the installed Joana pt_PT voice, say and afconvert. No network calls.
Normalizes active speech to -19 dBFS RMS, with a -1 dBFS peak ceiling.
"""
import array
import math
from pathlib import Path
import subprocess
import tempfile
import wave

NAMES = "á bê cê dê é efe gê agá i jota capa ele eme ene ó pê quê erre esse tê u vê dáblio xis ípsilon zê".split()
ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public/audio/alphabet/pt-PT"

def generate():
    voices = subprocess.check_output(["say", "-v", "?"], text=True)
    if not any(line.startswith("Joana ") and "pt_PT" in line for line in voices.splitlines()):
        raise RuntimeError("Installed Joana pt_PT voice is required; no locale fallback")
    OUT.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="tempo-alphabet-") as temp:
        for letter, name in zip("abcdefghijklmnopqrstuvwxyz", NAMES, strict=True):
            source, pcm = Path(temp) / f"{letter}.aiff", Path(temp) / f"{letter}.wav"
            # A sentence boundary prevents bare accented glyphs being expanded
            # into a description of the character by the speech engine.
            subprocess.run(["say", "-v", "Joana", "-o", str(source), name + "."], check=True)
            subprocess.run(["afconvert", "-f", "WAVE", "-d", "LEI16", str(source), str(pcm)], check=True)
            with wave.open(str(pcm)) as stream:
                rate = stream.getframerate()
                if stream.getnchannels() != 1 or stream.getsampwidth() != 2:
                    raise RuntimeError("Expected mono 16-bit audio")
                samples = array.array("h", stream.readframes(stream.getnframes()))
            if not samples or max(map(abs, samples)) < 100:
                raise RuntimeError(f"Empty/silent synthesis for {letter}")
            audible = [i for i, sample in enumerate(samples) if abs(sample) >= 200]
            samples = samples[max(0, audible[0] - int(rate * .08)):audible[-1] + int(rate * .12)]
            active = [sample for sample in samples if abs(sample) >= 328]
            rms = math.sqrt(sum(sample * sample for sample in active) / len(active))
            gain = min(32768 * 10 ** (-19 / 20) / rms, 32767 * 10 ** (-1 / 20) / max(map(abs, samples)))
            normalized = array.array("h", (round(sample * gain) for sample in samples))
            with wave.open(str(OUT / f"{letter}.wav"), "wb") as stream:
                stream.setparams((1, 2, rate, 0, "NONE", "not compressed"))
                stream.writeframes(normalized.tobytes())
            print(f"{letter.upper()} {name}: {len(normalized)/rate:.2f}s; gain {gain:.2f}")

if __name__ == "__main__":
    generate()
