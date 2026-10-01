import os
import json
import subprocess

OUTPUT_DIR = "scratch/antigravity_video"
FINAL_VIDEO = "public/demo_antigravity_masterclass.mp4"
FFMPEG = "/opt/homebrew/bin/ffmpeg"

with open(os.path.join(OUTPUT_DIR, "scenes.json"), "r") as f:
    scenes = json.load(f)

def assemble_video():
    clip_files = []
    
    for idx, s in enumerate(scenes):
        slide_img = os.path.join(OUTPUT_DIR, f"{s['id']}_slide.png")
        audio_mp3 = os.path.join(OUTPUT_DIR, f"{s['id']}.mp3")
        scene_mp4 = os.path.join(OUTPUT_DIR, f"{s['id']}_clip.mp4")
        dur = s['duration']
        
        print(f"🎬 Assemblaggio clip {s['id']} (durata: {dur}s)...")
        
        # Genera clip video con zoom lento (Ken Burns leggero per dinamismo) + audio
        cmd = [
            FFMPEG, "-y",
            "-loop", "1", "-i", slide_img,
            "-i", audio_mp3,
            "-filter_complex", f"[0:v]scale=8000:-1,zoompan=z='min(zoom+0.0004,1.05)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=25*{dur}:s=1920x1080:fps=30,format=yuv420p[v];[1:a]apad=pad_dur=1.2[a]",
            "-map", "[v]",
            "-map", "[a]",
            "-t", str(dur),
            "-c:v", "libx264", "-preset", "veryfast", "-crf", "18",
            "-c:a", "aac", "-b:a", "192k",
            scene_mp4
        ]
        subprocess.run(cmd, check=True)
        clip_files.append(scene_mp4)

    # Concatena tutte le scene con lista concat
    concat_list_path = os.path.join(OUTPUT_DIR, "concat_list.txt")
    with open(concat_list_path, "w") as f:
        for clip in clip_files:
            abs_path = os.path.abspath(clip)
            f.write(f"file '{abs_path}'\n")

    print(f"🎞️ Concatenazione finale in {FINAL_VIDEO}...")
    os.makedirs(os.path.dirname(FINAL_VIDEO), exist_ok=True)
    
    concat_cmd = [
        FFMPEG, "-y",
        "-f", "concat", "-safe", "0", "-i", concat_list_path,
        "-c", "copy",
        FINAL_VIDEO
    ]
    subprocess.run(concat_cmd, check=True)
    print("🎉 VIDEO FINALE CREATO CON SUCCESSO!")

if __name__ == "__main__":
    assemble_video()
