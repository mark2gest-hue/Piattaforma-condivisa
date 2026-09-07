import subprocess
import os

def run_cmd(cmd):
    print("Running:", cmd)
    res = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if res.returncode != 0:
        print("STDERR:", res.stderr)
        raise RuntimeError(f"Command failed: {res.stderr}")
    return res.stdout

def create_cinematic_sample():
    src = "public/sample_lesson1_raw.mp4"
    broll_matrix = "public/broll_cyber_matrix.mp4"
    broll_stream = "public/broll_ai_stream.mp4"
    overlay_header = "public/overlays/header_topic.png"
    overlay_side = "public/overlays/keypoints_side.png"
    out = "public/sample_lesson1_cinematic.mp4"
    
    # Timeline 60 secondi:
    # 0s - 10s: Wide shot + Header topic overlay (intro)
    # 10s - 22s: Inquadratura 3/4 (Avatar spostato a destra) + Side Keypoints a sinistra!
    # 22s - 32s: B-roll Matrix Code scuro / Cyber (audio avatar continuo)
    # 32s - 45s: Picture-in-Picture! B-roll AI stream a schermo intero con Avatar in box rimpicciolito in basso a destra (bordato ciano)
    # 45s - 60s: Wide shot avatar + transizione di chiusura
    
    # 1. Segmento 1: 0 - 10s (Wide + Header)
    # [0:v] trim=0:10,setpts=PTS-STARTPTS,scale=1920:1080,format=yuv420p,setsar=1 [v1_raw]
    # [v1_raw][1:v] overlay=0:0 [seg1]
    
    # 2. Segmento 2: 10 - 22s (3/4 framing: avatar a destra crop=1350:760:570:40,scale=1920:1080 + Keypoints)
    # [0:v] trim=10:22,setpts=PTS-STARTPTS,crop=1350:760:570:40,scale=1920:1080,format=yuv420p,setsar=1 [v2_crop]
    # [v2_crop][2:v] overlay=0:0 [seg2]
    
    # 3. Segmento 3: 22 - 32s (B-roll Cyber Matrix puro, 10s)
    # [3:v] trim=0:10,setpts=PTS-STARTPTS,scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,format=yuv420p,setsar=1 [seg3]
    
    # 4. Segmento 4: 32 - 45s (Picture-in-Picture: Sotto B-roll AI stream, sopra Avatar miniaturizzato a destra)
    # Background: [4:v] trim=0:13,setpts=PTS-STARTPTS,scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,format=yuv420p,setsar=1 [pip_bg]
    # Pip avatar: [0:v] trim=32:45,setpts=PTS-STARTPTS,crop=1080:1080:420:0,scale=440:440,drawbox=x=0:y=0:w=440:h=440:color=0x00dcff@0.9:t=4,format=yuv420p,setsar=1 [pip_avatar]
    # [pip_bg][pip_avatar] overlay=W-w-60:H-h-60 [seg4]
    
    # 5. Segmento 5: 45 - 60s (Wide avatar di ritorno con header)
    # [0:v] trim=45:60,setpts=PTS-STARTPTS,scale=1920:1080,format=yuv420p,setsar=1 [seg5]

    filter_complex = (
        "[0:v]trim=0:10,setpts=PTS-STARTPTS,scale=1920:1080,format=yuv420p,setsar=1[v1_raw];"
        "[v1_raw][1:v]overlay=0:0[seg1];"
        
        "[0:v]trim=10:22,setpts=PTS-STARTPTS,crop=1350:760:570:40,scale=1920:1080,format=yuv420p,setsar=1[v2_crop];"
        "[v2_crop][2:v]overlay=0:0[seg2];"
        
        "[3:v]trim=0:10,setpts=PTS-STARTPTS,scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,format=yuv420p,setsar=1[seg3];"
        
        "[4:v]trim=0:13,setpts=PTS-STARTPTS,scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,format=yuv420p,setsar=1[pip_bg];"
        "[0:v]trim=32:45,setpts=PTS-STARTPTS,crop=1080:1080:420:0,scale=420:420,drawbox=x=0:y=0:w=420:h=420:color=0x00dcff@0.9:t=4,format=yuv420p,setsar=1[pip_avatar];"
        "[pip_bg][pip_avatar]overlay=W-w-60:H-h-60[seg4];"
        
        "[0:v]trim=45:60,setpts=PTS-STARTPTS,scale=1920:1080,format=yuv420p,setsar=1[seg5];"
        
        "[seg1][seg2][seg3][seg4][seg5]concat=n=5:v=1:a=0[vout];"
        "[0:a]atrim=0:60,asetpts=PTS-STARTPTS[aout]"
    )
    
    cmd = [
        "/opt/homebrew/bin/ffmpeg", "-y",
        "-i", src,
        "-i", overlay_header,
        "-i", overlay_side,
        "-i", broll_matrix,
        "-i", broll_stream,
        "-filter_complex", filter_complex,
        "-map", "[vout]",
        "-map", "[aout]",
        "-c:v", "libx264",
        "-preset", "veryfast",
        "-crf", "20",
        "-c:a", "aac",
        "-b:a", "192k",
        out
    ]
    
    print("Avvio render cinematico...")
    subprocess.run(cmd, check=True)
    print("Render completato con successo:", out)

if __name__ == "__main__":
    create_cinematic_sample()
