#!/usr/bin/env python3
"""
Pipeline automatizzata per il rendering professionale delle 20 lezioni di "Corso AI per Tutti"
(Docente: Stefano Maraisi).

Flusso per ogni lezione:
1. Estrazione audio compatto a 16kHz mono.
2. Trascrizione parola per parola via Groq Whisper (whisper-large-v3-turbo) in 3-5 secondi (Costo 0).
3. Generazione automatica dei sottotitoli animati in formato ASS (.ass) con karaoke a parola attiva (#38BDF8 / Giallo / Bianco).
4. Generazione automatica delle grafiche e titoli per ogni lezione (Banner iniziale, Lower-third docente).
5. Render video Full HD con FFmpeg (ottimizzato H.264 VideoToolbox / libx264).
6. Salvataggio diretto in Google Drive: "Aiutiamoci/video renderizzati".
"""

import os
import sys
import json
import uuid
import time
import subprocess
import urllib.request
import urllib.parse
from pathlib import Path

GROQ_URL = "https://api.groq.com/openai/v1/audio/transcriptions"
MODEL = "whisper-large-v3-turbo"

SRC_DIR = Path("/Users/marco/Library/CloudStorage/GoogleDrive-mark2gest@gmail.com/Il mio Drive/Aiutiamoci/Video lezioni corso base pulite ")
OUT_DIR = Path("/Users/marco/Library/CloudStorage/GoogleDrive-mark2gest@gmail.com/Il mio Drive/Aiutiamoci/video renderizzati")
CACHE_DIR = Path("/Users/marco/Sviluppo/Progetti/Prgetto piattaforma lavoro condivisa/scripts/.cache_render")

LESSONS_META = {
    1: {"num": "1", "title": "Benvenuti nel Futuro", "filename": "1 Lezione Live.mp4"},
    2: {"num": "2", "title": "Breve Storia dell'Evoluzione", "filename": "2 Lezione Live.mp4"},
    3: {"num": "3", "title": "Sconfiggere il Foglio Bianco", "filename": "3 Lezione Live.mp4"},
    4: {"num": "4", "title": "Il Linguaggio della Chiarezza", "filename": "4 Lezione Live.mp4"},
    5: {"num": "5", "title": "La Formula Segreta RCCF", "filename": "5 Lezione Live.mp4"},
    6: {"num": "6", "title": "Iterazione", "filename": "6 Lezione Live.mp4"},
    7: {"num": "7", "title": "ChatGPT, Claude, Gemini, Perplexity", "filename": "7 Lezione Live.mp4"},
    8: {"num": "8", "title": "Scrivere senza Sforzo", "filename": "8 Lezione Live.mp4"},
    9: {"num": "9", "title": "Dipingere con le Parole", "filename": "9 Lezione Live.mp4"},
    10: {"num": "10", "title": "Anatomia di un Prompt Visivo", "filename": "10 Lezione Live.mp4"},
    11: {"num": "11", "title": "Presentazioni in 5 Minuti", "filename": "11 Lezione Live.mp4"},
    12: {"num": "12", "title": "Analisi Dati per Excel", "filename": "12 Lezione Live.mp4"},
    13: {"num": "13", "title": "L'Agenda Intelligente", "filename": "13 Lezione Live.mp4"},
    14: {"num": "14", "title": "Studiare e Imparare ELI5", "filename": "14 Lezione Live.mp4"},
    15: {"num": "15", "title": "Allucinazioni: Quando l'IA mente", "filename": "15 Lezione Live.mp4"},
    16: {"num": "16", "title": "Privacy e Sicurezza", "filename": "16 Lezione Live.mp4"},
    17: {"num": "17", "title": "Il Lavoro che Cambia", "filename": "17 Lezione Live.mp4"},
    18: {"num": "18", "title": "Creare il proprio Workflow", "filename": "18 Lezione Live.mp4"},
    19: {"num": "19", "title": "La Tua Nuova Superpotenza", "filename": "19 Lezione Live.mp4"},
    20: {"num": "20", "title": "Riepilogo Corso AI", "filename": "20 Lezione Live.mp4"},
}

def load_groq_key():
    for p in [".env.local", ".env"]:
        if os.path.exists(p):
            with open(p, "r", encoding="utf-8") as f:
                for line in f:
                    s = line.strip()
                    if s and not s.startswith("#") and "=" in s:
                        k, _, v = s.partition("=")
                        if k.strip() == "GROQ_API_KEY":
                            return v.strip().strip('"').strip("'")
    return None

def transcribe_audio_groq(audio_path, api_key):
    boundary = "----groq" + uuid.uuid4().hex
    fields = [
        ("model", MODEL),
        ("response_format", "verbose_json"),
        ("timestamp_granularities[]", "word"),
    ]
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
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": f"multipart/form-data; boundary={boundary}",
            "User-Agent": "TiAIuto/1.0",
            "Accept": "application/json"
        },
        method="POST"
    )
    with urllib.request.urlopen(req, timeout=180) as r:
        return json.load(r)

def format_ass_time(sec):
    h = int(sec // 3600)
    m = int((sec % 3600) // 60)
    s = sec % 60
    return f"{h:d}:{m:02d}:{s:05.2f}"

def generate_ass_subtitles(words, output_ass_path):
    header = """[Script Info]
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Arial,50,&H00FFFFFF,&H0038BDF8,&H00000000,&H80000000,-1,0,0,0,100,100,1,0,1,3.5,2,2,100,100,85,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    events = []
    
    # Raggruppa parole in blocchi di 3-4 parole per ritmo visivo moderno
    chunk_size = 4
    for i in range(0, len(words), chunk_size):
        chunk = words[i:i + chunk_size]
        if not chunk:
            continue
        
        # Per ogni parola attiva nel chunk creiamo un Dialogue event
        for active_idx, w_active in enumerate(chunk):
            w_start = w_active.get("start", 0)
            w_end = w_active.get("end", w_start + 0.3)
            
            # Formatta la riga evidenziando la parola attiva
            line_parts = []
            for idx, w in enumerate(chunk):
                raw_word = w.get("word", "").strip()
                if not raw_word:
                    continue
                if idx == active_idx:
                    line_parts.append(r"{\c&H0038BDF8\b1\fscx108\fscy108}" + raw_word + r"{\r}")
                else:
                    line_parts.append(r"{\c&H00FFFFFF}" + raw_word)
            
            text_line = " ".join(line_parts)
            events.append(f"Dialogue: 0,{format_ass_time(w_start)},{format_ass_time(w_end)},Default,,0,0,0,,{text_line}")

    with open(output_ass_path, "w", encoding="utf-8") as f:
        f.write(header + "\n".join(events) + "\n")

def escape_ffmpeg_text(text):
    return text.replace("'", "'\\''").replace(":", "\\:").replace("%", "\\%")

def process_lesson(lesson_id, api_key, force=False):
    meta = LESSONS_META[lesson_id]
    num_str = f"{lesson_id:02d}"
    src_file = SRC_DIR / meta["filename"]
    
    out_rendered = OUT_DIR / f"lesson_{num_str}_rendered_production.mp4"
    
    print(f"\n========================================================")
    print(f"🎬 [LEZIONE {lesson_id}/20] {meta['title']}")
    print(f"📁 Sorgente: {src_file.name}")
    print(f"🎯 Output:   {out_rendered.name}")
    print(f"========================================================")
    
    if not src_file.exists():
        print(f"❌ File sorgente non trovato: {src_file}")
        return False
        
    if out_rendered.exists() and not force and out_rendered.stat().st_size > 10 * 1024 * 1024:
        print(f"✅ Video già renderizzato presente in Google Drive ({out_rendered.stat().st_size / (1024*1024):.1f} MB). Salto.")
        return True

    lesson_cache = CACHE_DIR / f"lesson_{num_str}"
    lesson_cache.mkdir(parents=True, exist_ok=True)
    
    wav_file = lesson_cache / "audio_16k.wav"
    json_file = lesson_cache / "transcript.json"
    ass_file = lesson_cache / "subtitles.ass"
    
    # 1. Estrazione Audio WAV
    if not wav_file.exists() or wav_file.stat().st_size == 0:
        print("🔊 Estrazione traccia audio 16kHz...")
        cmd_audio = [
            "ffmpeg", "-y", "-i", str(src_file),
            "-vn", "-acodec", "pcm_s16le", "-ar", "16000", "-ac", "1",
            str(wav_file)
        ]
        subprocess.run(cmd_audio, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        print(f"  -> Audio estratto: {wav_file.stat().st_size / (1024*1024):.2f} MB")

    # 2. Trascrizione Word-Level via Groq Whisper
    if not json_file.exists() or json_file.stat().st_size == 0:
        print("⚡ Trascrizione audio con Groq Whisper Large v3 Turbo...")
        t0 = time.time()
        data = transcribe_audio_groq(str(wav_file), api_key)
        with open(json_file, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        words = data.get("words", [])
        print(f"  -> Trascritto in {time.time()-t0:.1f}s: {len(words)} parole rilevate.")
    else:
        with open(json_file, "r", encoding="utf-8") as f:
            data = json.load(f)
            words = data.get("words", [])

    # 3. Generazione Sottotitoli ASS
    print("📝 Generazione file sottotitoli .ass con stile dinamico...")
    generate_ass_subtitles(words, str(ass_file))
    print(f"  -> Sottotitoli salvati: {ass_file}")

    # 4. Render FFmpeg con Grafiche & Sottotitoli
    title_esc = escape_ffmpeg_text(meta['title'])
    num_title_esc = escape_ffmpeg_text(f"LEZIONE {meta['num']}")
    top_bar_title = escape_ffmpeg_text(f"Lezione {meta['num']} • {meta['title']}")

    ass_path_escaped = str(ass_file).replace(":", "\\:").replace("'", "'\\''")

    # Filter graph professionale identico al template Masterclass approvato
    v_filter = (
        f"[0:v]"
        # 1. Intro Center Card (0.2s -> 3.5s)
        f"drawbox=x=360:y='if(between(t, 0.2, 3.5), 220, -1000)':w=1200:h=280:color=black@0.94:t=fill,"
        f"drawbox=x=360:y='if(between(t, 0.2, 3.5), 220, -1000)':w=10:h=280:color=#38BDF8:t=fill,"
        f"drawtext=text='TI AIUTO  •  CORSO AI PER PRINCIPIANTI':x=400:y='if(between(t, 0.2, 3.5), 255, -1000)':fontsize=22:fontcolor=#38BDF8,"
        f"drawtext=text='{num_title_esc}':x=400:y='if(between(t, 0.2, 3.5), 305, -1000)':fontsize=70:fontcolor=white,"
        f"drawtext=text='{title_esc}':x=400:y='if(between(t, 0.2, 3.5), 415, -1000)':fontsize=34:fontcolor=#F59E0B,"
        # 2. Top-Left Persistent Badge (dopo 3.6s)
        f"drawbox=x=50:y='if(gte(t, 3.6), 50, -300)':w=540:h=95:color=black@0.92:t=fill,"
        f"drawbox=x=50:y='if(gte(t, 3.6), 50, -300)':w=8:h=95:color=#38BDF8:t=fill,"
        f"drawtext=text='CORSO AI PER TUTTI':x='if(gte(t, 3.6), 75, -500)':y=72:fontsize=16:fontcolor=#38BDF8,"
        f"drawtext=text='{top_bar_title}':x='if(gte(t, 3.6), 75, -500)':y=100:fontsize=22:fontcolor=white,"
        # 3. Lower-Third Docente (3.6-11s, 180-188s, 420-428s)
        f"drawbox=x=50:y='if(between(t, 3.6, 11)+between(t, 180, 188)+between(t, 420, 428), 870, -200)':w=460:h=85:color=black@0.94:t=fill,"
        f"drawbox=x=50:y='if(between(t, 3.6, 11)+between(t, 180, 188)+between(t, 420, 428), 870, -200)':w=8:h=85:color=#F59E0B:t=fill,"
        f"drawtext=text='Stefano Maraisi':x='if(between(t, 3.6, 11)+between(t, 180, 188)+between(t, 420, 428), 75, -500)':y=890:fontsize=24:fontcolor=white,"
        f"drawtext=text='Docente & Fondatore Ti AIuto':x='if(between(t, 3.6, 11)+between(t, 180, 188)+between(t, 420, 428), 75, -500)':y=922:fontsize=15:fontcolor=#E2E8F0,"
        # 4. Sottotitoli Dinamici ASS
        f"ass='{ass_path_escaped}'[v_out]"
    )

    temp_out = lesson_cache / f"temp_{num_str}.mp4"
    
    # Esecuzione FFmpeg con accelerazione Apple Silicon VideoToolbox
    ffmpeg_bin = "/opt/homebrew/opt/ffmpeg-full/bin/ffmpeg" if os.path.exists("/opt/homebrew/opt/ffmpeg-full/bin/ffmpeg") else "ffmpeg"
    
    cmd_render = [
        ffmpeg_bin, "-y",
        "-i", str(src_file),
        "-filter_complex", v_filter,
        "-map", "[v_out]",
        "-map", "0:a",
        "-c:v", "h264_videotoolbox", "-b:v", "2200k", "-maxrate", "3000k", "-bufsize", "6000k",
        "-c:a", "aac", "-b:a", "192k",
        str(temp_out)
    ]
    
    print("🚀 Rendering video Full HD in corso (Hardware Accelerated)...")
    t_render_start = time.time()
    res = subprocess.run(cmd_render)
    if res.returncode != 0:
        print("⚠️ Fallback su codifica libx264 fast...")
        cmd_render[cmd_render.index("h264_videotoolbox")] = "libx264"
        cmd_render[cmd_render.index("-b:v")] = "-crf"
        cmd_render[cmd_render.index("2200k")] = "20"
        cmd_render.remove("-maxrate")
        cmd_render.remove("3000k")
        cmd_render.remove("-bufsize")
        cmd_render.remove("6000k")
        cmd_render.insert(cmd_render.index("20") + 1, "-preset")
        cmd_render.insert(cmd_render.index("-preset") + 1, "fast")
        subprocess.run(cmd_render, check=True)

    # Sposta il video renderizzato nella cartella Google Drive finale
    temp_out.replace(out_rendered)
    render_duration = time.time() - t_render_start
    size_mb = out_rendered.stat().st_size / (1024*1024)
    print(f"🎉 COMPLETATA Lezione {lesson_id} in {render_duration:.1f}s | Dimensione: {size_mb:.1f} MB")
    print(f"📍 Salvato in: {out_rendered}")
    return True

def main():
    api_key = load_groq_key()
    if not api_key:
        print("❌ Errore: GROQ_API_KEY non trovata in .env.local")
        sys.exit(1)
        
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    
    # Se viene passato un ID di lezione specifico
    if len(sys.argv) > 1:
        target_ids = [int(x) for x in sys.argv[1:]]
    else:
        target_ids = list(range(1, 21))
        
    print(f"🚀 AVVIO BATCH RENDERING SU {len(target_ids)} LEZIONI")
    print(f"📂 Cartella destinazione: {OUT_DIR}")
    
    success_count = 0
    start_total = time.time()
    
    for lid in target_ids:
        try:
            ok = process_lesson(lid, api_key)
            if ok:
                success_count += 1
        except Exception as e:
            print(f"❌ Errore durante il rendering della lezione {lid}: {e}")
            
    total_time = time.time() - start_total
    print(f"\n========================================================")
    print(f"🏁 BATCH COMPLETATO: {success_count}/{len(target_ids)} lezioni renderizzate con successo in {total_time/60:.1f} minuti!")
    print(f"📁 I video sono disponibili in: Google Drive > Aiutiamoci > video renderizzati")
    print(f"========================================================")

if __name__ == "__main__":
    main()
