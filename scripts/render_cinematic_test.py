"""
Script di rendering avanzato per il test pilota Lezione 1.
Inquadratura 3/4 SX calibrata per lasciare spazio alla card destra senza toccare il viso.
"""

import subprocess
import os

FFMPEG = "/opt/homebrew/bin/ffmpeg"
INPUT_RAW = "/Users/marco/Downloads/1 Lezione Live.mp4"
OUTPUT_FINAL = "public/test_lezione1_cinematic.mp4"
BROLL_FILE = "public/broll_ai_stream.mp4"

OVERLAY_BADGE = "public/overlays_test/badge_intro.png"
OVERLAY_LOWER = "public/overlays_test/lower_third_focus.png"
OVERLAY_CARD = "public/overlays_test/card_riassunto.png"

# Parametri PiP
PIP_W = 540
PIP_H = 304
PIP_SRC_CROP = "1500:844:210:190"
PIP_BORDER = "0x0284c7@0.9"
PIP_MARGIN = 40

def render_cinematic_test():
    print("Inizio assemblaggio filter_complex rifinito...")

    # Nel segmento 5, per spostare Stefano a sinistra e lasciare tutta la metà destra libera:
    # crop da x=500..1920 (prendendo Stefano che è al centro del raw e posizionandolo a sinistra nell'output)
    # Stefano nel raw è al centro (~x=800-1120). Se facciamo crop a partire da x=620, Stefano finisce sulla sinistra!
    CROP_STEFANO_SX = "1400:788:560:210"

    filter_complex = (
        # Seg 1 (0-10s): Wide + Badge
        "[0:v]trim=0:10,setpts=PTS-STARTPTS,fps=30,scale=1920:1080,setsar=1,format=yuv420p[v1_raw];"
        "[2:v]scale=1920:1080,format=rgba[badge];"
        "[v1_raw][badge]overlay=0:0:enable='between(t,0,9.5)'[seg1];"

        # Seg 2 (10-20s): Piano 3/4 + Lower Third
        "[0:v]trim=10:20,setpts=PTS-STARTPTS,crop=1500:844:210:190,scale=1920:1080,fps=30,setsar=1,format=yuv420p[v2_raw];"
        "[3:v]scale=1920:1080,format=rgba[lower];"
        "[v2_raw][lower]overlay=0:0:enable='between(t,1.2,9.5)'[seg2];"

        # Seg 3 (20-28s PiP): B-roll a tutto schermo + Stefano in basso a destra
        "[1:v]trim=0:8,setpts=PTS-STARTPTS,scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,fps=30,setsar=1,format=yuv420p[bg_broll];"
        f"[0:v]trim=20:28,setpts=PTS-STARTPTS,crop={PIP_SRC_CROP},scale={PIP_W}:{PIP_H},fps=30,setsar=1,format=yuv420p[stefano_box];"
        f"[stefano_box]drawbox=x=0:y=0:w={PIP_W}:h={PIP_H}:color={PIP_BORDER}:t=4[stefano_bordered];"
        f"[bg_broll][stefano_bordered]overlay=W-w-{PIP_MARGIN}:H-h-{PIP_MARGIN}[seg3];"

        # Seg 4 (28-38s Close-up): Primo piano viso per connessione emotiva
        "[0:v]trim=28:38,setpts=PTS-STARTPTS,crop=1280:720:320:235,scale=1920:1080,fps=30,setsar=1,format=yuv420p[seg4];"

        # Seg 5 (38-48s Spostato a sinistra + Card riassuntiva a destra)
        f"[0:v]trim=38:48,setpts=PTS-STARTPTS,crop={CROP_STEFANO_SX},scale=1920:1080,fps=30,setsar=1,format=yuv420p[v5_raw];"
        "[4:v]scale=1920:1080,format=rgba[card];"
        "[v5_raw][card]overlay=0:0:enable='between(t,0.5,9.5)'[seg5];"

        # Seg 6 (48-60s Wide): Chiusura inquadratura aperta
        "[0:v]trim=48:60,setpts=PTS-STARTPTS,fps=30,scale=1920:1080,setsar=1,format=yuv420p[seg6];"

        # Concatenazione dei 6 spezzoni con labiale matematicamente perfetto
        "[seg1][seg2][seg3][seg4][seg5][seg6]concat=n=6:v=1:a=0[vout];"

        # Sottile accento cyan in alto
        "[vout]drawbox=x=0:y=0:w=1920:h=4:color=#0284c7:t=fill[vfinal]"
    )

    audio_filter = (
        "atrim=0:60,asetpts=PTS-STARTPTS,"
        "acompressor=threshold=-16dB:ratio=3.2:attack=5:release=50:makeup=2,"
        "equalizer=f=120:width_type=o:w=1:g=2,"
        "equalizer=f=3500:width_type=o:w=1:g=1.5"
    )

    cmd = [
        FFMPEG, "-y",
        "-i", INPUT_RAW,
        "-i", BROLL_FILE,
        "-i", OVERLAY_BADGE,
        "-i", OVERLAY_LOWER,
        "-i", OVERLAY_CARD,
        "-filter_complex", filter_complex,
        "-af", audio_filter,
        "-map", "[vfinal]",
        "-map", "0:a",
        "-c:v", "libx264",
        "-preset", "fast",
        "-crf", "18",
        "-c:a", "aac",
        "-b:a", "192k",
        "-t", "60",
        OUTPUT_FINAL
    ]

    print("Rendering in corso...")
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        print("Errore:\n", res.stderr)
        return False
    
    print(f"Video rifinito con successo: {OUTPUT_FINAL}")
    return True

if __name__ == "__main__":
    render_cinematic_test()
