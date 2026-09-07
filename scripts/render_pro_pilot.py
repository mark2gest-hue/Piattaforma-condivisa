import subprocess
import os

def render_pro_video():
    # Audio con voce italiana Alice
    audio_text = (
        "Nel primo corso abbiamo imparato a parlare con i modelli di intelligenza artificiale. "
        "Ma c'è un limite evidente. Ogni volta devi aprire una chat, scrivere il prompt, copiare e incollare il risultato a mano. "
        "Se non sei al computer, il lavoro si ferma. "
        "Ecco perché siamo qui. Un agente autonomo non aspetta che tu gli faccia una domanda. "
        "Tu gli assegni un obiettivo di business, e lui decide da solo quali passi compiere per raggiungerlo. "
        "Controlla le tue email, interroga il database aziendale, scrive documenti e interagisce con i tuoi software. "
        "Nel corso Pro non impariamo a scrivere prompt più lunghi. "
        "Impariamo a costruire collaboratori digitali che lavorano per te, ventiquattro ore su ventiquattro. "
        "Benvenuti nel livello successivo."
    )
    
    os.makedirs("public/audio_pro", exist_ok=True)
    raw_aiff = "public/audio_pro/voice.aiff"
    voice_wav = "public/audio_pro/voice.wav"
    
    # Sintesi vocale con say
    print("Sintesi vocale...")
    subprocess.run(["say", "-v", "Alice", "-o", raw_aiff, audio_text], check=True)
    subprocess.run(["/opt/homebrew/bin/ffmpeg", "-y", "-i", raw_aiff, "-af", "volume=1.8", voice_wav], check=True)
    
    # B-roll disponibili:
    # 1. public/broll_pro_laptop.mp4 (persone al lavoro su laptop moderno)
    # 2. public/broll_cyber_matrix.mp4 (Matrix code)
    # 3. public/broll_ai_stream.mp4 (neural stream)
    
    # Overlays:
    # 1. public/overlays_pro/card_1_old_way.png
    # 2. public/overlays_pro/card_2_agent_way.png
    # 3. public/overlays_pro/card_3_workflow.png
    
    out_video = "public/pro_lesson1_pilot.mp4"
    
    # Timeline video: 56 secondi totali (durata voce)
    # Segmento 1: 0 - 14s -> broll laptop + card_1_old_way
    # Segmento 2: 14 - 28s -> broll cyber matrix + card_2_agent_way
    # Segmento 3: 28 - 44s -> broll ai stream + card_3_workflow
    # Segmento 4: 44 - 56s -> broll laptop + transizione finale
    
    filter_complex = (
        "[0:v]trim=0:14,setpts=PTS-STARTPTS,scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,format=yuv420p,setsar=1[bg1];"
        "[bg1][3:v]overlay=0:0[v1];"
        
        "[1:v]trim=0:14,setpts=PTS-STARTPTS,scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,format=yuv420p,setsar=1[bg2];"
        "[bg2][4:v]overlay=0:0[v2];"
        
        "[2:v]trim=0:16,setpts=PTS-STARTPTS,scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,format=yuv420p,setsar=1[bg3];"
        "[bg3][5:v]overlay=0:0[v3];"
        
        "[0:v]trim=14:26,setpts=PTS-STARTPTS,scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,format=yuv420p,setsar=1[v4];"
        
        "[v1][v2][v3][v4]concat=n=4:v=1:a=0[vout]"
    )
    
    cmd = [
        "/opt/homebrew/bin/ffmpeg", "-y",
        "-i", "public/broll_pro_laptop.mp4",
        "-i", "public/broll_cyber_matrix.mp4",
        "-i", "public/broll_ai_stream.mp4",
        "-i", "public/overlays_pro/card_1_old_way.png",
        "-i", "public/overlays_pro/card_2_agent_way.png",
        "-i", "public/overlays_pro/card_3_workflow.png",
        "-i", voice_wav,
        "-filter_complex", filter_complex,
        "-map", "[vout]",
        "-map", "6:a",
        "-c:v", "libx264",
        "-preset", "veryfast",
        "-crf", "20",
        "-c:a", "aac",
        "-b:a", "192k",
        "-shortest",
        out_video
    ]
    
    print("Render del video pilota Pro in corso...")
    subprocess.run(cmd, check=True)
    print("Video Pro generato con successo:", out_video)

if __name__ == "__main__":
    render_pro_video()
