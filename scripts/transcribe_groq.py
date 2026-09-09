"""
Trascrizione audio via Groq Whisper (whisper-large-v3-turbo), endpoint
OpenAI-compatibile, con tempi a parola -> adatta per caption/sottotitoli.

La chiave GROQ_API_KEY si legge da .env.local a runtime, mai stampata.

Uso:
    python3 scripts/transcribe_groq.py <audio.wav> [--out srt|json|both]
Esempio:
    ffmpeg -i video.mp4 -t 80 -ar 16000 -ac 1 audiotest.wav
    python3 scripts/transcribe_groq.py audiotest.wav --out both
Genera audiotest.srt e/o audiotest.json (words[] con start/end in secondi).
"""

import argparse
import json
import os
import sys
import urllib.parse
import urllib.request
import uuid

GROQ_URL = "https://api.groq.com/openai/v1/audio/transcriptions"
MODEL = "whisper-large-v3-turbo"


def _load_key(paths=(".env.local", ".env")):
    for f in paths:
        if not os.path.exists(f):
            continue
        for line in open(f):
            s = line.strip()
            if s and not s.startswith("#") and "=" in s:
                k, _, v = s.partition("=")
                if k.strip() == "GROQ_API_KEY":
                    return v.strip()
    return None


def _transcribe(audio_path, api_key):
    boundary = "----groq" + uuid.uuid4().hex
    fields = [
        ("model", MODEL),
        ("response_format", "verbose_json"),
        ("timestamp_granularities[]", "word"),
    ]
    # costruzione body multipart
    body = bytearray()
    def add_field(name, value):
        body.extend(f"--{boundary}\r\nContent-Disposition: form-data; name=\"{name}\"\r\n\r\n{value}\r\n".encode())
    def add_file(name, filename, data):
        body.extend(f"--{boundary}\r\nContent-Disposition: form-data; name=\"{name}\"; filename=\"{filename}\"\r\nContent-Type: audio/wav\r\n\r\n".encode())
        body.extend(data)
        body.extend(b"\r\n")
    for n, v in fields:
        add_field(n, v)
    with open(audio_path, "rb") as fh:
        add_file("file", os.path.basename(audio_path), fh.read())
    body.extend(f"--{boundary}--\r\n".encode())

    req = urllib.request.Request(
        GROQ_URL, data=bytes(body),
        headers={"Authorization": f"Bearer {api_key}",
                 "Content-Type": f"multipart/form-data; boundary={boundary}",
                 "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
                 "Accept": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        print("HTTP", e.code, e.reason)
        print(e.read().decode("utf-8", "replace")[:1000])
        sys.exit(1)


def _fmt(sec):
    ms = int(round(sec * 1000))
    h, rem = divmod(ms, 3600000)
    m, rem = divmod(rem, 60000)
    s, ms = divmod(rem, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def _to_srt(words, path):
    lines = []
    # raggruppa ~4 parole a riga
    chunks = [words[i:i + 4] for i in range(0, len(words), 4)]
    for idx, ch in enumerate(chunks, 1):
        text = " ".join(w["word"] for w in ch).replace(" ", " ").strip()
        start = _fmt(ch[0]["start"])
        end = _fmt(ch[-1]["end"])
        lines.append(f"{idx}\n{start} --> {end}\n{text}\n")
    with open(path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    return path


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("audio", help="file audio (wav)")
    ap.add_argument("--out", choices=["srt", "json", "both"], default="srt")
    args = ap.parse_args()

    key = _load_key()
    if not key:
        print("GROQ_API_KEY non presente in .env.local"); sys.exit(2)

    base = os.path.splitext(args.audio)[0]
    data = _transcribe(args.audio, key)
    words = data.get("words", [])
    if not words:
        # fallback: niente tempi a parola
        print("AVVISO: nessun word-timestamp; testo:", data.get("text", ""))
    print(f"Trascritto: {len(words)} parole")

    if args.out in ("srt", "both") and words:
        print("SRT:", _to_srt(words, base + ".srt"))
    if args.out in ("json", "both"):
        with open(base + ".json", "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print("JSON:", base + ".json")


if __name__ == "__main__":
    main()
