import os
import subprocess

videos_first_half = [
    (2, "https://www.malaradio.com/CorsoAI/Video/Corso%20AI%20-%20Lezione%202%20Breve%20Storia%20Evoluzione%20Lampo_1080p_caption.mp4"),
    (3, "https://www.malaradio.com/CorsoAI/Video/Corso%20AI%20-%20Lezione%203%20Sconfiggere%20il%20Foglio%20Bianco_1080p_caption.mp4"),
    (4, "https://www.malaradio.com/CorsoAI/Video/Corso%20Ai%20-%20Lezione%204%20Il%20Linguaggio%20della%20Chiarezza%20Prompt_1080p_caption.mp4"),
    (5, "https://www.malaradio.com/CorsoAI/Video/Corso%20AI%20-%20Lezione%205%20La%20Formula%20Segreta%20RCCF_1080p_caption.mp4"),
    (6, "https://www.malaradio.com/CorsoAI/Video/Corso%20AI%20-%20Lezione%206%20Iterazione_1080p_caption.mp4"),
    (7, "https://www.malaradio.com/CorsoAI/Video/Corso%20AI%20-%20Lezione%207%20ChatGPT%20Claude%20Gemini%20Perplexity_1080p_caption.mp4"),
    (8, "https://www.malaradio.com/CorsoAI/Video/Corso%20AI%20-%20Lezione%208%20Scrivere%20senza%20Sforzo_1080p_caption.mp4"),
    (9, "https://www.malaradio.com/CorsoAI/Video/Corso%20AI%20-%20Lezione%209%20Dipingere%20con%20le%20Parole_1080p_caption.mp4"),
    (10, "https://www.malaradio.com/CorsoAI/Video/Corso%20AI%20-%20Lezione%2010%20Anatomia%20di%20un%20Prompt%20Visivo_1080p_caption.mp4")
]

timestamps = ["00:02:00", "00:06:00"]

for vid_id, url in videos_first_half:
    for ts in timestamps:
        out_name = f"public/scan_frames/l{vid_id}_{ts.replace(':', '')}.jpg"
        if os.path.exists(out_name):
            continue
        cmd = f"/opt/homebrew/bin/ffmpeg -ss {ts} -i \"{url}\" -vframes 1 -q:v 3 \"{out_name}\" -y"
        try:
            subprocess.run(cmd, shell=True, capture_output=True, timeout=15)
        except:
            pass

print("Campionamento prima meta completato!")
