#!/usr/bin/env python3
"""Regenerate the focus-sound WAV loops in ../assets/sounds/.

vc6 defect report: the shipped loops were ad-hoc 22 kHz files clipped at
full scale (RMS ~= peak) and white-noise had a full-scale discontinuity at
the loop seam — an audible click every cycle. This script is the committed
generator: deterministic (fixed seed), 44.1 kHz 16-bit mono, seamless via a
1 s tail->head crossfade, normalized to ~-18 dBFS RMS with peak headroom.

Usage: python3 scripts/generate-sounds.py   (from apps/mobile/)
Stdlib only — no numpy.
"""

import math
import os
import random
import struct
import wave

SR = 44100
LOOP_S = 15.0
XFADE_S = 1.0
TARGET_RMS = 0.125          # ~= -18 dBFS — comfortable, not railed
PEAK_CAP = 0.7              # hard ceiling after normalization
SEED = 20261011
OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "assets", "sounds")

rng = random.Random(SEED)


def lp(samples, hz):
    """One-pole low-pass at `hz`."""
    a = 1.0 - math.exp(-2.0 * math.pi * hz / SR)
    y = 0.0
    out = []
    for x in samples:
        y += a * (x - y)
        out.append(y)
    return out


def hp(samples, hz):
    """One-pole high-pass at `hz` (DC/drift remover)."""
    a = math.exp(-2.0 * math.pi * hz / SR)
    y = 0.0
    px = 0.0
    out = []
    for x in samples:
        y = a * (y + x - px)
        px = x
        out.append(y)
    return out


def white(n):
    return [rng.gauss(0.0, 1.0) for _ in range(n)]


def brown(n, leak=0.998):
    """Brownian noise via leaky integration of white noise."""
    y = 0.0
    out = []
    for x in white(n):
        y = leak * y + x
        out.append(y)
    return out


def make_seamless(sig, n_loop, n_xfade):
    """Blend the tail over the head and truncate to the loop length."""
    out = sig[:n_loop]
    for i in range(n_xfade):
        f = i / n_xfade
        out[i] = out[i] * f + sig[n_loop + i] * (1.0 - f)
    return out


def normalize(sig):
    rms = math.sqrt(sum(s * s for s in sig) / len(sig))
    gain = TARGET_RMS / rms
    peak = max(abs(s) for s in sig) * gain
    if peak > PEAK_CAP:
        gain *= PEAK_CAP / peak
    return [s * gain for s in sig]


def write_wav(name, sig):
    path = os.path.join(OUT_DIR, name)
    pcm = b"".join(struct.pack("<h", max(-32768, min(32767, round(s * 32767)))) for s in sig)
    with wave.open(path, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm)
    print(f"{name}: {len(sig) / SR:.1f}s -> {path}")


def gen(n):
    """Generate n_loop + n_xfade source samples for a sound."""
    n_loop = int(LOOP_S * SR)
    n_xf = int(XFADE_S * SR)
    sig = n(n_loop + n_xf)
    return normalize(make_seamless(sig, n_loop, n_xf))


def src_white(n):
    # "White" but tamed: broadband noise low-passed ~8.5 kHz so it reads as
    # hiss, not hash. True unfiltered white noise is what sounded harsh.
    return lp(white(n), 8500.0)


def src_brown(n):
    # Proper Brownian rumble with a DC blocker so it doesn't wander.
    return hp(brown(n), 18.0)


def src_deep_calm(n):
    # Brown noise banded ~150-650 Hz — the audible low-mid band on phone
    # speakers (sub-100 Hz alone is inaudible there) — with one slow breath
    # per loop; the LFO period equals the loop so the envelope is seamless.
    base = lp(hp(brown(n, leak=0.999), 140.0), 650.0)
    out = []
    for i, x in enumerate(base):
        t = i / SR
        mod = 0.72 + 0.28 * math.sin(2.0 * math.pi * t / LOOP_S - math.pi / 2.0)
        out.append(x * mod)
    return out


def src_rain(n):
    # Mid-band rain hiss + sparse droplet ticks + a light low bed.
    base = lp(hp(white(n), 900.0), 5200.0)
    bed = lp(hp(brown(n), 140.0), 250.0)
    out = [0.7 * base[i] + 0.15 * bed[i] for i in range(n)]
    # droplet bursts: 30-70 ms exponentially decaying noise, random onset
    for _ in range(int(n / SR * 14)):
        start = rng.randrange(0, n - 1)
        dur = int(rng.uniform(0.03, 0.07) * SR)
        amp = rng.uniform(0.5, 1.4)
        tone = rng.uniform(1800.0, 5200.0)
        phase = rng.uniform(0.0, 2.0 * math.pi)
        for j in range(dur):
            k = start + j
            if k >= n:
                break
            env = math.exp(-j / (0.012 * SR))
            out[k] += amp * env * rng.gauss(0.0, 0.6) * (
                0.6 + 0.4 * math.sin(2.0 * math.pi * tone * j / SR + phase)
            )
    return out


def src_ocean(n):
    # Low-mid wash (not hiss) with a faint high texture, and a swell every
    # half loop — two raised-cosine swells per 15 s loop (period 7.5 s) so
    # the cycle lands seamlessly.
    wash = lp(hp(white(n), 120.0), 900.0)
    spray = lp(hp(white(n), 1500.0), 4500.0)
    swell_s = LOOP_S / 2.0
    out = []
    for i in range(n):
        t = i / SR
        phase = (t % swell_s) / swell_s
        mod = 0.45 + 0.55 * (0.5 - 0.5 * math.cos(2.0 * math.pi * phase))
        out.append((0.85 * wash[i] + 0.25 * spray[i]) * mod)
    return out


SOUNDS = {
    "white-noise.wav": src_white,
    "brown-noise.wav": src_brown,
    "deep-calm.wav": src_deep_calm,
    "rain-on-window.wav": src_rain,
    "ocean-waves.wav": src_ocean,
}


if __name__ == "__main__":
    for name, src in SOUNDS.items():
        write_wav(name, gen(src))
