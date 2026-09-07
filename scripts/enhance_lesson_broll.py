import subprocess

def generate_pro_broll_video():
    # Normalizziamo SAR e formato pixel con setsar=1 e format=yuv420p
    filter_complex = (
        "[0:v]split=2[av_w][av_c];"
        "[av_w]format=yuv420p,setsar=1[av_wide];"
        "[av_c]crop=1560:878:180:60,scale=1920:1080,format=yuv420p,setsar=1[av_close];"
        
        "[1:v]fps=25,scale=1920:1080,format=yuv420p,setsar=1[br1];"
        "[2:v]fps=25,scale=1920:1080,format=yuv420p,setsar=1[br2];"
        
        # 0s-12s: Avatar wide
        "[av_wide]trim=start=0:end=12,setpts=PTS-STARTPTS[seg1];"
        # 12s-18s: B-roll Robot
        "[br1]trim=start=0:end=6,setpts=PTS-STARTPTS[seg2];"
        # 18s-30s: Avatar Closeup
        "[av_close]trim=start=18:end=30,setpts=PTS-STARTPTS[seg3];"
        # 30s-36s: B-roll AI Eyes
        "[br2]trim=start=0:end=6,setpts=PTS-STARTPTS[seg4];"
        # 36s-48s: Avatar wide
        "[av_wide]trim=start=36:end=48,setpts=PTS-STARTPTS[seg5];"
        # 48s-60s: Avatar Closeup
        "[av_close]trim=start=48:end=60,setpts=PTS-STARTPTS[seg6];"
        
        "[seg1][seg2][seg3][seg4][seg5][seg6]concat=n=6:v=1:a=0[v_montage];"
        "[v_montage]drawbox=x=0:y=0:w=1920:h=6:color=#3B82F6:t=fill[final_video]"
    )
    
    cmd = [
        "ffmpeg", "-y",
        "-i", "public/sample_lesson1_raw.mp4",
        "-i", "public/broll_robot.mp4",
        "-i", "public/broll_ai_eyes.mp4",
        "-filter_complex", filter_complex,
        "-map", "[final_video]",
        "-map", "0:a",
        "-c:v", "libx264",
        "-preset", "veryfast",
        "-crf", "18",
        "-c:a", "copy",
        "-t", "60",
        "public/sample_lesson1_broll_enhanced.mp4"
    ]
    
    print("Render montaggio dinamico...")
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        print("Errore:\n", res.stderr)
        return False
    print("Video con B-Roll generato con successo!")
    return True

if __name__ == "__main__":
    generate_pro_broll_video()
