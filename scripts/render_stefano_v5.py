import subprocess

def render():
    voice = "public/stefano_corso2.wav"
    out = "public/pro_stefano_pilot.mp4"
    
    # Seg 1: 0-9s    Laptop intro       + sub_1
    # Seg 2: 9-18s   n8n REALE fluido   + sub_2
    # Seg 3: 18-29s  Obsidian V2 fluido + sub_3
    # Seg 4: 29-40s  Kanban live cursor + sub_4
    
    fc = (
        "[0:v]trim=0:9,setpts=PTS-STARTPTS,scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,format=yuv420p,setsar=1[bg1];"
        "[bg1][4:v]overlay=0:0[v1];"
        
        "[1:v]trim=0:9,setpts=PTS-STARTPTS,scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,format=yuv420p,setsar=1[bg2];"
        "[bg2][5:v]overlay=0:0[v2];"
        
        "[2:v]trim=0:11,setpts=PTS-STARTPTS,scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,format=yuv420p,setsar=1[bg3];"
        "[bg3][6:v]overlay=0:0[v3];"
        
        "[3:v]trim=0:11,setpts=PTS-STARTPTS,scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,format=yuv420p,setsar=1[bg4];"
        "[bg4][7:v]overlay=0:0[v4];"
        
        "[v1][v2][v3][v4]concat=n=4:v=1:a=0[vout]"
    )
    
    cmd = [
        "/opt/homebrew/bin/ffmpeg", "-y",
        "-i", "public/broll_pro_laptop.mp4",     # 0:v
        "-i", "public/broll_n8n_real.mp4",       # 1:v ← n8n REALE
        "-i", "public/broll_obsidian_v2.mp4",    # 2:v ← Obsidian fluido
        "-i", "public/broll_kanban_live.mp4",    # 3:v ← Kanban con cursore
        "-i", "public/subs_stefano_clean/sub_1.png",  # 4:v
        "-i", "public/subs_stefano_clean/sub_2.png",  # 5:v
        "-i", "public/subs_stefano_clean/sub_3.png",  # 6:v
        "-i", "public/subs_stefano_clean/sub_4.png",  # 7:v
        "-i", voice,                              # 8:a
        "-filter_complex", fc,
        "-map", "[vout]", "-map", "8:a",
        "-c:v", "libx264", "-preset", "fast", "-crf", "17",
        "-c:a", "aac", "-b:a", "256k",
        "-shortest", out
    ]
    print("Montaggio V5: n8n Reale + Obsidian Fluido + Kanban Live...")
    subprocess.run(cmd, check=True)
    print(f"✓ Video V5 pronto: {out}")

if __name__ == "__main__":
    render()
