"""
Aggiunge FRASI CHIAVE (caption) al montaggio v6 renderizzato.

Il montaggio v6 e' 1:1 con l'audio sorgente (blocchi contigui 0-80s), quindi i
tempi delle parole della trascrizione mappano direttamente sul video. Qui
sovrapponiamo card-testo brevi e impattanti in momenti scelti.

Approccio (ffmpeg senza drawtext): generiamo PNG trasparenti 1920xH con PIL
(font Arial) e li overlay-iamo con enable=between(t,...).

Uso:
    python3 scripts/add_key_captions.py <video_v6.mp4> <output.mp4>
"""

import os
import subprocess
import sys
from PIL import Image, ImageDraw, ImageFont

FFMPEG = "/opt/homebrew/bin/ffmpeg"
FONT = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
CANVAS_W = 1920
BAND_H = 170          # altezza banda testo
Y_TOP = 760           # y del bordo alto della banda nel frame 1080
FONT_SZ = 44

# (start_s, end_s, testo_display)
# Scelti dalle frasi chiave reali del pezzo (evito le finestre b-roll 20-26 e 56-62).
PHRASES = [
    (14.1, 17.0, "Parole chiare e semplici per tutti"),
    (28.9, 35.0, "Un super aiutante che ti capisce"),
    (40.5, 46.0, "Non un robot: uno strumento per creare"),
    (48.3, 52.6, "Crea cose in pochi secondi"),
    (54.0, 55.8, "Non serve essere programmatori"),
    (69.8, 72.6, "Intelligenza artificiale generativa"),
]

OUT_DIR = "tmp/caps"


def make_band(text):
    img = Image.new("RGBA", (CANVAS_W, BAND_H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    font = ImageFont.truetype(FONT, FONT_SZ)
    # larghezza banda in base al testo
    bbox = d.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    pad_x, pad_y = 46, 22
    bw = tw + pad_x * 2
    bx = (CANVAS_W - bw) // 2
    by = (BAND_H - (bbox[3] - bbox[1]) - pad_y * 2) // 2
    d.rounded_rectangle([bx, by, bx + bw, by + (bbox[3] - bbox[1]) + pad_y * 2],
                        radius=26, fill=(8, 15, 30, 200), outline=(56, 189, 248, 255), width=3)
    d.text((bx + pad_x, by + pad_y), text, fill=(255, 255, 255, 255), font=font)
    return img


def main():
    if len(sys.argv) < 3:
        print("Uso: python3 scripts/add_key_captions.py <video_v6.mp4> <output.mp4>")
        sys.exit(1)
    src, out = sys.argv[1], sys.argv[2]
    os.makedirs(OUT_DIR, exist_ok=True)

    # genera i png delle bande
    pngs = []
    for i, (s, e, text) in enumerate(PHRASES):
        p = f"{OUT_DIR}/cap_{i:02d}.png"
        make_band(text).save(p)
        pngs.append(p)

    # ffmpeg: 0:v = video; poi ogni png in loop come input; overlay a catena
    cmd = [FFMPEG, "-y", "-i", src]
    for p in pngs:
        cmd += ["-loop", "1", "-framerate", "30", "-i", p]

    fc_parts = []
    prev = "0:v"
    for i, (s, e, _) in enumerate(PHRASES):
        outl = f"ov{i}" if i < len(PHRASES) - 1 else "vout"
        fc_parts.append(
            f"[{prev}][{i+1}:v]overlay=0:{Y_TOP}:enable='between(t,{s:.2f},{e:.2f})'[{outl}]"
        )
        prev = outl

    cmd += ["-filter_complex", ";".join(fc_parts)]
    cmd += ["-map", "[vout]", "-map", "0:a"]
    cmd += ["-c:v", "libx264", "-preset", "veryfast", "-crf", "18",
            "-c:a", "copy", "-t", "80", out]
    print(f"Sovrappongo {len(PHRASES)} frasi chiave...")
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        print("ERRORE:\n", res.stderr[-3000:])
        sys.exit(1)
    print("OK:", out)


if __name__ == "__main__":
    main()
