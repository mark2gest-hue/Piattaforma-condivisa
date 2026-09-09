"""
Montaggio "persona a camera fissa" con inserimento B-ROLL in stile PiP (v6).

Stile A (PiP): per ~6s il video e' il B-roll a schermo intero con il relatore
miniaturizzato (crop 3/4 gia' tarato) in basso a destra che CONTINUA a parlare.
L'audio e' sempre quello del relatore sullo stesso intervallo -> labiale sincrono
per costruzione (box ricavato dallo stesso intervallo temporale dell'audio).

Altri principi mantenuti dal baseline v4 approvato:
- Tagli secchi sincronizzati (timeline video==audio 1:1).
- Crop verticali tarati (viso alto con headroom, non al bordo basso).
- Timeline costruita a BLOCCHI di durata variabile, start sorgente cumulativo.

Il B-roll deve essere animato (clip Pexels reale). Inserisci una coppia
(durata, "broll") nei blocchi per creare uno spezzone PiP.

Uso:
    python3 scripts/enhance_live_lesson.py <input.mp4> <output.mp4> [num_blocchi]
"""

import subprocess
import sys

FFMPEG = "/opt/homebrew/bin/ffmpeg"
BROLL_FILE = "public/broll/ai_ai.mp4"   # clip scaricato (Pexels) via fetch_broll.py
BOX_BORDER = "0x00dcff@0.9"
BOX_W = 540
BOX_H = 304
# Box relatore: riuso il crop 3/4 tarato (busto+testa con headroom) -> niente
# coordinate viso indovinate; box scalato a BOX_WxBOX_H e sovrapposto in basso a destra.
BOX_SRC_CROP = "1500:844:210:190"
BOX_MARGIN = 48

# Blocchi: (durata_s, tipo, valore, nome)
#   tipo "zoom": valore = crop ("W:H:x:y") o None (wide)
#   tipo "broll": valore = offset_s dentro il clip b-roll (0, 4, ...)
# start sorgente cumulativo, timeline 1:1.
BLOCKS = [
    (10.0, "zoom",  None,                "wide"),
    (10.0, "zoom",  "1500:844:210:190",  "piano_3_4"),
    (6.0,  "broll", 0.0,                 "spezzone_pip_1"),
    (10.0, "zoom",  "1280:720:320:235",  "close_viso"),
    (10.0, "zoom",  None,                "wide"),
    (10.0, "zoom",  "1500:844:40:190",   "3_4_sx"),
    (6.0,  "broll", 4.0,                 "spezzone_pip_2"),
    (10.0, "zoom",  "1500:844:380:190",  "3_4_dx"),
    (8.0,  "zoom",  "1280:720:320:255",  "close_2"),
]


def starts(blocks):
    s = []
    acc = 0.0
    for dur, *_ in blocks:
        s.append(acc)
        acc += dur
    return s, acc


def norm(label):
    return f",fps=30,setsar=1,format=yuv420p[{label}]"


def build_zoom(start, dur, crop, label):
    base = f"[0:v]trim=start={start}:end={start + dur},setpts=PTS-STARTPTS"
    if crop:
        chain = f"{base},crop={crop},scale=1920:1080"
    else:
        chain = f"{base},scale=1920:1080"
    return chain + norm(label)


def build_broll(start, dur, broll_off, label):
    # background = clip b-roll animato a schermo intero
    bg = (
        f"[1:v]trim=start={broll_off}:end={broll_off + dur},setpts=PTS-STARTPTS,"
        f"scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080"
    ) + norm("bg")
    # box relatore: crop 3/4 dello stesso intervallo sorgente -> labiale sincrono
    spk = (
        f"[0:v]trim=start={start}:end={start + dur},setpts=PTS-STARTPTS,"
        f"crop={BOX_SRC_CROP},scale={BOX_W}:{BOX_H}"
    ) + norm("spk")
    spk_b = (
        f"[spk]drawbox=x=0:y=0:w={BOX_W}:h={BOX_H}:color={BOX_BORDER}:t=3[bord]"
    )
    out = f"[bg][bord]overlay=W-w-{BOX_MARGIN}:H-h-{BOX_MARGIN}[{label}]"
    return bg + ";" + spk + ";" + spk_b + ";" + out


def build_filter(blocks):
    starts_list, total = starts(blocks)
    parts = []
    for i, (dur, kind, val, name) in enumerate(blocks):
        s = starts_list[i]
        if kind == "broll":
            parts.append(build_broll(s, dur, val, f"s{i}"))
        else:
            parts.append(build_zoom(s, dur, val, f"s{i}"))
    labels = "".join(f"[s{i}]" for i in range(len(blocks)))
    parts.append(f"{labels}concat=n={len(blocks)}:v=1:a=0[vout]")
    parts.append(
        f"[0:a]atrim=0:{total},asetpts=PTS-STARTPTS,"
        f"acompressor=threshold=-18dB:ratio=3:attack=5:release=50[aout]"
    )
    return ";\n".join(parts), total


def main():
    if len(sys.argv) < 3:
        print("Uso: python3 scripts/enhance_live_lesson.py <input> <output> [num_blocchi]")
        sys.exit(1)
    src, out = sys.argv[1], sys.argv[2]
    blocks = BLOCKS
    if len(sys.argv) > 3:
        n = max(2, min(int(sys.argv[3]), len(BLOCKS)))
        blocks = BLOCKS[:n]

    fc, total = build_filter(blocks)
    seq = " -> ".join(b[3] for b in blocks)
    print(f"Render ~{total:.0f}s (cut sincroni, labiale 1:1)")
    print("Blocchi:", seq)

    cmd = [
        FFMPEG, "-y",
        "-i", src,
        "-i", BROLL_FILE,
        "-filter_complex", fc,
        "-map", "[vout]",
        "-map", "[aout]",
        "-c:v", "libx264",
        "-preset", "veryfast",
        "-crf", "18",
        "-c:a", "aac",
        "-b:a", "192k",
        "-t", f"{total}",
        out,
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        print("ERRORE:\n", res.stderr[-4000:])
        sys.exit(1)
    print("OK:", out)


if __name__ == "__main__":
    main()
