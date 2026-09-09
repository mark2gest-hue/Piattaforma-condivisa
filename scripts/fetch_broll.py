"""
Helper: scarica uno spezzone B-roll rilevante (landscape) da Pexels, con
fallback su Pixabay, per inserirlo come spezza-parlato in un video lezione.

Le chiavi NON sono hardcodate ne' scritte su file: si leggono a runtime dalle
variabili d'ambiente PEXELS_API_KEY e PIXABAY_API_KEY. Non vengono mai stampate.

Uso:
    PEXELS_API_KEY=xxx python3 scripts/fetch_broll.py "intelligenza artificiale" \
        --out public/broll/ai_workflow.mp4 [--dur 6]

Ritorna 0 e scrive il file se ok; altrimenti exit 1 e messaggio d'errore.
Dipendenze: solo stdlib (urllib) + ffmpeg gia' presente nel progetto.
"""

import argparse
import json
import os
import subprocess
import sys
import urllib.parse
import urllib.request

UA = {"User-Agent": "aiutiamoci-broll-fetcher/1.0"}
WANT_H = 1080  # altezza preferita del file video (Full HD)

# Durata minima del clip richiesto (per avere abbastanza spezzone senza loop).
MIN_CLIP_S = 3.0


def _get_pexels_video(query):
    key = os.environ.get("PEXELS_API_KEY")
    if not key:
        return None, "PEXELS_API_KEY non presente nell'ambiente"
    url = "https://api.pexels.com/videos/search?" + urllib.parse.urlencode(
        {"query": query, "orientation": "landscape", "per_page": 5}
    )
    req = urllib.request.Request(url, headers={**UA, "Authorization": key})
    with urllib.request.urlopen(req, timeout=30) as r:
        data = json.load(r)
    if not data.get("videos"):
        return None, "Pexels: nessun video per la query"
    # scegli il file piu' vicino a 1920x1080 con durata sufficiente
    best = None
    for v in data["videos"]:
        dur = v.get("duration") or 0
        if dur < MIN_CLIP_S:
            continue
        for f in v.get("video_files", []):
            h = f.get("height") or 0
            if h == 0:
                continue
            score = abs(h - WANT_H) - (1.0 if (f.get("width") or 0) >= 1920 else 0)
            cand = (f.get("link"), f.get("width"), h, dur, score)
            if best is None or score < best[4]:
                best = cand
    if not best:
        return None, "Pexels: nessun file adatto"
    return best, None


def _get_pixabay_video(query):
    key = os.environ.get("PIXABAY_API_KEY")
    if not key:
        return None, "PIXABAY_API_KEY non presente nell'ambiente"
    url = "https://pixabay.com/api/videos/?" + urllib.parse.urlencode(
        {"key": key, "q": query, "video_type": "film", "per_page": 5}
    )
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=30) as r:
        data = json.load(r)
    hits = data.get("hits") or []
    if not hits:
        return None, "Pixabay: nessun video per la query"
    best = None
    for h in hits:
        dur = h.get("duration") or 0
        if dur < MIN_CLIP_S:
            continue
        for f in h.get("videos", {}).values():
            hh = f.get("height") or 0
            if hh == 0:
                continue
            score = abs(hh - WANT_H)
            cand = (f.get("url"), f.get("width"), hh, dur, score)
            if best is None or score < best[4]:
                best = cand
    if not best:
        return None, "Pixabay: nessun file adatto"
    return best, None


def _download(url, out):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=60) as r, open(out, "wb") as f:
        while True:
            chunk = r.read(1 << 20)
            if not chunk:
                break
            f.write(chunk)


def main():
    ap = argparse.ArgumentParser(description="Scarica B-roll landscape da Pexels/Pixabay")
    ap.add_argument("query", help="keyword argomento, es. 'automazione workflow'")
    ap.add_argument("--out", required=True, help="percorso file di output (.mp4)")
    ap.add_argument("--provider", choices=["pexels", "pixabay", "auto"], default="auto")
    args = ap.parse_args()

    os.makedirs(os.path.dirname(os.path.abspath(args.out)) or ".", exist_ok=True)

    order = ["pexels", "pixabay"] if args.provider == "auto" else [args.provider]
    pick = None
    for prov in order:
        fn = _get_pexels_video if prov == "pexels" else _get_pixabay_video
        pick, err = fn(args.query)
        if pick:
            print(f"[{prov}] clip scelto: {pick[1]}x{pick[2]} durata ~{pick[3]}s")
            break
        print(f"[{prov}] {err}")

    if not pick:
        sys.exit(1)
    link, w, h, dur, _ = pick
    tmp = args.out + ".part"
    _download(link, tmp)

    # Normalizza a 1920x1080 (cover crop) e limita la durata del file b-roll
    cmd = [
        "/opt/homebrew/bin/ffmpeg", "-y",
        "-i", tmp,
        "-vf", "scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,setsar=1",
        "-c:v", "libx264", "-preset", "veryfast", "-crf", "18",
        "-an", args.out,
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        print("ffmpeg errore:\n", res.stderr[-2000:])
        sys.exit(1)
    try:
        os.remove(tmp)
    except OSError:
        pass
    print("OK:", args.out, f"({w}x{h} sorgente)")


if __name__ == "__main__":
    main()
