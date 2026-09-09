"""
Aggiunge riquadri INFO in ALTO A DESTRA sopra le inquadrature normali/larghe,
mantenendo invariate le frasi chiave in basso (gia' nel v7).

3 tipologie in 3 inquadrature diverse:
  1. Tag capitolo            -> wide 0-10s
  2. Frase chiave compatto   -> piano_3/4 10-20s (quando la dice ~14-17s)
  3. Bullet parole chiave    -> wide 36-46s      (quando parla di cosa fa l'AI ~42-48s)

Uso:
    python3 scripts/add_topright_panels.py <video_v7.mp4> <output.mp4>
"""

import os
import subprocess
import sys
from PIL import Image, ImageDraw, ImageFont

FFMPEG = "/opt/homebrew/bin/ffmpeg"
FONT_B = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
FONT_R = "/System/Library/Fonts/Supplemental/Arial.ttf"
MARGIN = 48
Y_TOP = 64
OUT_DIR = "tmp/panels"

# palette coerente con i card esistenti
VIO = (167, 139, 250, 255)
CYAN = (56, 189, 248, 255)
GREEN = (52, 211, 153, 255)
WHITE = (255, 255, 255, 255)
BG = (8, 15, 30, 200)


def _w(d, text, font):
    b = d.textbbox((0, 0), text, font=font)
    return b[2] - b[0]


def panel_tag():
    """Opzione 1: tag capitolo persistente su wide 0-10s."""
    f_title = ImageFont.truetype(FONT_B, 22)
    f_main = ImageFont.truetype(FONT_B, 40)
    pad = 30
    img = Image.new("RGBA", (1000, 1000), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    line1 = "CORSO 1 · LEZIONE 1"
    line2 = "Benvenuti nel futuro"
    w1 = _w(d, line1, f_title)
    w2 = _w(d, line2, f_main)
    bw = max(w1, w2) + pad * 2
    bh = 52 + 48 + pad * 2
    d.rounded_rectangle([0, 0, bw, bh], radius=16, fill=BG, outline=VIO, width=3)
    d.text((pad, pad), line1, fill=VIO, font=f_title)
    d.text((pad, pad + 40), line2, fill=WHITE, font=f_main)
    return img.crop((0, 0, bw, bh))


def panel_frase():
    """Opzione 2: frase chiave compatta su piano_3/4."""
    f = ImageFont.truetype(FONT_B, 34)
    text = "20 lezioni, parole chiare e semplici"
    pad = 26
    img = Image.new("RGBA", (1600, 600), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    tw = _w(d, text, f)
    bw = tw + pad * 2
    bh = 60 + pad * 2
    d.rounded_rectangle([0, 0, bw, bh], radius=28, fill=BG, outline=CYAN, width=3)
    d.text((pad, pad), text, fill=WHITE, font=f)
    return img.crop((0, 0, bw, bh))


def panel_bullet():
    """Opzione 3: bullet parole chiave su wide 36-46s."""
    f = ImageFont.truetype(FONT_B, 30)
    lines = ["creare cose", "testi · immagini · idee"]
    pad = 24
    img = Image.new("RGBA", (1400, 800), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    tw = max(_w(d, l, f) for l in lines)
    lh = 40
    bw = tw + pad * 2
    bh = lh * len(lines) + 22 + pad * 2
    d.rounded_rectangle([0, 0, bw, bh], radius=16, fill=BG, outline=GREEN, width=3)
    y = pad
    for l in lines:
        d.ellipse([pad, y + lh // 2 - 5, pad + 12, y + lh // 2 + 7], fill=GREEN)
        d.text((pad + 24, y), l, fill=WHITE, font=f)
        y += lh
    return img.crop((0, 0, bw, bh))


# (start, end, builder)
PANELS = [
    (0.6, 9.4, panel_tag),      # wide 0-10  -> tag capitolo
    (14.1, 17.0, panel_frase),  # piano 3/4  -> frase chiave
    (42.0, 48.5, panel_bullet), # wide 36-46 -> bullet
]


def main():
    if len(sys.argv) < 3:
        print("Uso: python3 scripts/add_topright_panels.py <video_v7.mp4> <output.mp4>")
        sys.exit(1)
    src, out = sys.argv[1], sys.argv[2]
    os.makedirs(OUT_DIR, exist_ok=True)

    pngs = []
    for i, (_, _, b) in enumerate(PANELS):
        p = f"{OUT_DIR}/panel_{i:02d}.png"
        b().save(p)
        pngs.append(p)

    cmd = [FFMPEG, "-y", "-i", src]
    for p in pngs:
        cmd += ["-loop", "1", "-framerate", "30", "-i", p]

    fc = []
    prev = "0:v"
    for i, (s, e, _) in enumerate(PANELS):
        outl = f"p{i}" if i < len(PANELS) - 1 else "vout"
        fc.append(
            f"[{prev}][{i+1}:v]overlay=W-w-{MARGIN}:{Y_TOP}:enable='between(t,{s},{e})'[{outl}]"
        )
        prev = outl

    cmd += ["-filter_complex", ";".join(fc)]
    cmd += ["-map", "[vout]", "-map", "0:a"]
    cmd += ["-c:v", "libx264", "-preset", "veryfast", "-crf", "18",
            "-c:a", "copy", "-t", "80", out]
    print(f"Aggiungo {len(PANELS)} riquadri top-right...")
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        print("ERRORE:\n", res.stderr[-3000:])
        sys.exit(1)
    print("OK:", out)


if __name__ == "__main__":
    main()
