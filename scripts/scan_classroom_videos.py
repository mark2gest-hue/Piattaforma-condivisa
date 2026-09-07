import os
import subprocess

videos = [
    (11, "https://www.malaradio.com/CorsoAI/Video/Corso%20AI%20-%20Lezione%2011%20Presentazioni%20in%205%20Minuti_1080p_caption.mp4"),
    (12, "https://www.malaradio.com/CorsoAI/video/N-Corso_Ai_-_Lezione_12_Analisi_Dati_per_Excell_1080p_caption_with_captions.mp4"),
    (13, "https://www.malaradio.com/CorsoAI/Video/Corso%20AI%20-%20Lezione%2013%20L%20Agenda%20Intelligente_1080p_caption.mp4"),
    (14, "https://www.malaradio.com/CorsoAI/Video/Corso%20AI%20-%20Lezione%2014%20Studiare%20e%20Imparare%20ELI5_1080p_caption.mp4"),
    (15, "https://www.malaradio.com/CorsoAI/video/N-Corso_Ai_-_Lezione_15_Allucinazioni_Quando_IA_mente_1080p_caption_with_captions.mp4"),
    (16, "https://www.malaradio.com/CorsoAI/Video/Corso%20AI%20-%20Lezione%2016%20Privacy%20e%20Sicurezza_1080p_caption.mp4"),
    (17, "https://www.malaradio.com/CorsoAI/Video/Corso%20AI%20-%20Lezione%2017%20Il%20Lavoro%20che%20Cambia_1080p_caption.mp4"),
    (18, "https://www.malaradio.com/CorsoAI/Video/Corso%20AI%20-%20Lezione%2018%20Creare%20il%20proprio%20Workflow_1080p_caption.mp4"),
    (19, "https://www.malaradio.com/CorsoAI/Video/Corso%20AI%20-%20Lezione%2019%20La%20Tua%20Nuova%20Superpotenza_1080p_caption.mp4"),
    (20, "https://www.malaradio.com/CorsoAI/video/N-Corso_Ai_-_Lezione_20_Riepilogo_corso_AI_principianti_1080p_caption_with_captions.mp4")
]

os.makedirs("public/scan_frames", exist_ok=True)
timestamps = ["00:02:00", "00:05:00", "00:08:00", "00:12:00"]

for vid_id, url in videos:
    for ts in timestamps:
        out_name = f"public/scan_frames/l{vid_id}_{ts.replace(':', '')}.jpg"
        if os.path.exists(out_name):
            continue
        cmd = f"/opt/homebrew/bin/ffmpeg -ss {ts} -i \"{url}\" -vframes 1 -q:v 3 \"{out_name}\" -y"
        try:
            subprocess.run(cmd, shell=True, capture_output=True, timeout=15)
        except:
            pass

print("Campionamento completato!")
