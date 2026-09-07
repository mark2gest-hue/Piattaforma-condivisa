import subprocess

def generate_dynamic_video(input_path, output_path):
    # La build di FFmpeg non ha drawtext abilitato (manca libfreetype),
    # ma supporta pienamente:
    # 1. Split e crop su secondo piano dinamico (Punch-in Zoom a 2 telecamere)
    # 2. Overlay grafici tramite immagini o box colorati
    # 3. Equalizzazione audio e presenza voce
    
    # Switch temporale multi-camera:
    # 00s-12s: Camera Wide (Normale)
    # 12s-24s: Camera 2 Primo Piano (Zoom 1.20x su viso avatar)
    # 24s-38s: Camera Wide (Normale)
    # 38s-50s: Camera 2 Primo Piano (Zoom 1.20x su viso avatar)
    # 50s-60s: Camera Wide (Normale)
    filter_complex = (
        "[0:v]split=2[v1][v2];"
        "[v2]crop=1560:878:180:60,scale=1920:1080[closeup];"
        "[v1][closeup]blend=all_expr='if(between(T,12,24)+between(T,38,50),B,A)'[dynamo];"
        # Barra grafica accento moderna blu AiUtiamoci in alto
        "[dynamo]drawbox=x=0:y=0:w=1920:h=6:color=#3B82F6:t=fill[outv]"
    )
    
    # Miglioramento audio voce: compressore dinamico per rendere la voce profonda e togliere sbalzi
    audio_filter = "acompressor=threshold=-18dB:ratio=3:attack=5:release=50"
    
    cmd = [
        "ffmpeg", "-y",
        "-i", input_path,
        "-filter_complex", filter_complex,
        "-af", audio_filter,
        "-map", "[outv]",
        "-map", "0:a",
        "-c:v", "libx264",
        "-preset", "veryfast",
        "-crf", "18",
        "-c:a", "aac",
        "-b:a", "192k",
        output_path
    ]
    
    print("Elaborazione video dinamico pilota...")
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        print("Errore:\n", res.stderr)
        return False
    print(f"Video pilota completato: {output_path}")
    return True

if __name__ == "__main__":
    generate_dynamic_video("public/sample_lesson1_raw.mp4", "public/sample_lesson1_enhanced.mp4")
