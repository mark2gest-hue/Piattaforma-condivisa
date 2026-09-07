import os
import time
import subprocess
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

def capture_frames():
    os.makedirs("public/screencast_frames", exist_ok=True)
    
    options = Options()
    options.add_argument('--headless=new')
    options.add_argument('--window-size=1920,1080')
    options.add_argument('--hide-scrollbars')
    options.add_argument('--force-device-scale-factor=1')
    
    print("Avvio Chrome headless...")
    driver = webdriver.Chrome(options=options)
    driver.set_window_size(1920, 1080)
    
    print("Navigazione su http://localhost:3000/demo-screencast...")
    driver.get("http://localhost:3000/demo-screencast")
    time.sleep(2)
    
    # Cattura 40 secondi a 2 frame al secondo (80 frame totali)
    total_duration = 40.0
    fps = 4
    total_frames = int(total_duration * fps)
    interval = 1.0 / fps
    
    print(f"Inizio cattura di {total_frames} frame ad alta risoluzione 1080p...")
    start_time = time.time()
    
    for i in range(total_frames):
        frame_path = f"public/screencast_frames/frame_{i:04d}.png"
        driver.save_screenshot(frame_path)
        # Sincronizzazione temporale
        elapsed = time.time() - start_time
        target_time = (i + 1) * interval
        if target_time > elapsed:
            time.sleep(target_time - elapsed)
        if i % 10 == 0:
            print(f"Catturati {i}/{total_frames} frame...")
            
    driver.quit()
    print("Cattura completata con successo!")
    
    # Creazione video MP4 fluido con FFmpeg
    out_video = "public/broll_agent_screencast.mp4"
    print("Compilazione video broll_agent_screencast.mp4 con FFmpeg...")
    ffmpeg_cmd = [
        "/opt/homebrew/bin/ffmpeg", "-y",
        "-framerate", str(fps),
        "-i", "public/screencast_frames/frame_%04d.png",
        "-vf", "scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080",
        "-c:v", "libx264",
        "-r", "25",
        "-pix_fmt", "yuv420p",
        "-crf", "18",
        "-preset", "fast",
        out_video
    ]
    subprocess.run(ffmpeg_cmd, check=True)
    print(f"Video generato: {out_video}")

if __name__ == "__main__":
    capture_frames()
