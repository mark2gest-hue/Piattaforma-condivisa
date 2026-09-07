import subprocess
import os

def render_tiktok():
    out_video = "public/tiktok_ai_pro_viral.mp4"
    audio_path = "public/tiktok_voice.mp3"
    
    # 5 Segmenti verticali (1080x1920):
    # Seg 1: 0 - 6s   (6s) -> Obsidian Grafo (Hook shock) + sub_1.png
    # Seg 2: 6 - 12s  (6s) -> n8n Canvas (Automazione pipeline) + sub_2.png
    # Seg 3: 12 - 18s (6s) -> Obsidian Grafo (Secondo Cervello) + sub_3.png
    # Seg 4: 18 - 24s (6s) -> Screencast Kanban + Telegram + sub_4.png
    # Seg 5: 24 - 29.5s (5.5s) -> Laptop / Portale Corsi (CTA Link in bio) + sub_5.png
    
    filter_complex = (
        # Seg 1: 0-6s Obsidian + sub_1
        "[0:v]trim=0:6,setpts=PTS-STARTPTS,scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,format=yuv420p,setsar=1[bg1];"
        "[bg1][4:v]overlay=0:0[v1];"
        
        # Seg 2: 6-12s n8n + sub_2
        "[1:v]trim=0:6,setpts=PTS-STARTPTS,scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,format=yuv420p,setsar=1[bg2];"
        "[bg2][5:v]overlay=0:0[v2];"
        
        # Seg 3: 12-18s Obsidian + sub_3
        "[0:v]trim=5:11,setpts=PTS-STARTPTS,scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,format=yuv420p,setsar=1[bg3];"
        "[bg3][6:v]overlay=0:0[v3];"
        
        # Seg 4: 18-24s Kanban Screencast + sub_4
        "[2:v]trim=15:21,setpts=PTS-STARTPTS,scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,format=yuv420p,setsar=1[bg4];"
        "[bg4][7:v]overlay=0:0[v4];"
        
        # Seg 5: 24-29.5s Laptop CTA + sub_5
        "[3:v]trim=0:5.5,setpts=PTS-STARTPTS,scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,format=yuv420p,setsar=1[bg5];"
        "[bg5][8:v]overlay=0:0[v5];"
        
        # Concat dei 5 segmenti verticali
        "[v1][v2][v3][v4][v5]concat=n=5:v=1:a=0[vout]"
    )
    
    cmd = [
        "/opt/homebrew/bin/ffmpeg", "-y",
        "-i", "public/broll_obsidian_graph.mp4",         # 0:v
        "-i", "public/broll_n8n_canvas.mp4",             # 1:v
        "-i", "public/broll_agent_screencast.mp4",       # 2:v
        "-i", "public/broll_pro_laptop.mp4",             # 3:v
        "-i", "public/tiktok_subs/sub_1.png",            # 4:v
        "-i", "public/tiktok_subs/sub_2.png",            # 5:v
        "-i", "public/tiktok_subs/sub_3.png",            # 6:v
        "-i", "public/tiktok_subs/sub_4.png",            # 7:v
        "-i", "public/tiktok_subs/sub_5.png",            # 8:v
        "-i", audio_path,                                # 9:a
        "-filter_complex", filter_complex,
        "-map", "[vout]",
        "-map", "9:a",
        "-c:v", "libx264",
        "-preset", "fast",
        "-crf", "19",
        "-c:a", "aac",
        "-b:a", "192k",
        "-shortest",
        out_video
    ]
    
    print("Render video verticale TikTok (1080x1920)...")
    subprocess.run(cmd, check=True)
    print(f"Reel TikTok generato con successo: {out_video}")

if __name__ == "__main__":
    render_tiktok()
