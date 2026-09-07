import subprocess
import os

import subprocess
import os

def render_stefano_video_v3():
    # Audio reale registrato da Stefano per il Corso 2
    voice_audio = "public/stefano_corso2.wav"
    out_video = "public/pro_stefano_pilot.mp4"
    
    # Timing esatto voce di Stefano (durata tot ~ 39.8s):
    # Seg 1: 0 - 9s   (9s)  -> broll_pro_laptop.mp4 (Intro team / laptop) + sub_1.png
    # Seg 2: 9 - 18s  (9s)  -> broll_n8n_canvas.mp4 (Vero Canvas n8n a schermo intero con pipeline nodi) + sub_2.png
    # Seg 3: 18 - 29s (11s) -> broll_obsidian_graph.mp4 (Vista Grafo Obsidian - Secondo Cervello & Vault) + sub_3.png
    # Seg 4: 29 - 40s (11s) -> broll_agent_screencast.mp4 (Bacheca Kanban Operativa + Terminale Daemon) + sub_4.png
    
    filter_complex = (
        # Seg 1: 0-9s laptop + sub_1
        "[0:v]trim=0:9,setpts=PTS-STARTPTS,scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,format=yuv420p,setsar=1[bg1];"
        "[bg1][4:v]overlay=0:0[v1];"
        
        # Seg 2: 9-18s (9s) VERO WORKFLOW CANVAS N8N A SCHERMO INTERO + sub_2
        "[1:v]trim=0:9,setpts=PTS-STARTPTS,scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,format=yuv420p,setsar=1[bg2];"
        "[bg2][5:v]overlay=0:0[v2];"
        
        # Seg 3: 18-29s (11s) VISTA GRAFO OBSIDIAN (Animata slow zoom) + sub_3
        "[2:v]trim=0:11,setpts=PTS-STARTPTS,scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,format=yuv420p,setsar=1[bg3];"
        "[bg3][6:v]overlay=0:0[v3];"
        
        # Seg 4: 29-40s (11s) BACHECA KANBAN OPERATIVA + TERMINALE LIVE + sub_4
        "[3:v]trim=20:31,setpts=PTS-STARTPTS,scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,format=yuv420p,setsar=1[bg4];"
        "[bg4][7:v]overlay=0:0[v4];"
        
        # Concat dei 4 segmenti distinti
        "[v1][v2][v3][v4]concat=n=4:v=1:a=0[vout]"
    )
    
    cmd = [
        "/opt/homebrew/bin/ffmpeg", "-y",
        "-i", "public/broll_pro_laptop.mp4",             # 0:v (Intro)
        "-i", "public/broll_n8n_canvas.mp4",             # 1:v (n8n puro a tutto schermo!)
        "-i", "public/broll_obsidian_graph.mp4",         # 2:v (Obsidian Grafo)
        "-i", "public/broll_agent_screencast.mp4",       # 3:v (Kanban + Terminale)
        "-i", "public/subs_stefano_clean/sub_1.png",     # 4:v
        "-i", "public/subs_stefano_clean/sub_2.png",     # 5:v
        "-i", "public/subs_stefano_clean/sub_3.png",     # 6:v
        "-i", "public/subs_stefano_clean/sub_4.png",     # 7:v
        "-i", voice_audio,                               # 8:a
        "-filter_complex", filter_complex,
        "-map", "[vout]",
        "-map", "8:a",
        "-c:v", "libx264",
        "-preset", "fast",
        "-crf", "18",
        "-c:a", "aac",
        "-b:a", "256k",
        "-shortest",
        out_video
    ]
    
    print("Montaggio video V4: 4 scene distinte (Intro -> n8n Fullscreen -> Obsidian -> Kanban)...")
    subprocess.run(cmd, check=True)
    print(f"Video V4 completato con successo: {out_video}")

if __name__ == "__main__":
    render_stefano_video_v3()
