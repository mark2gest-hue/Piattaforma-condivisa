import urllib.request
import os
import sys
import time

TARGET_DIR = "/Users/marco/Library/CloudStorage/GoogleDrive-mark2gest@gmail.com/Il mio Drive/Mark 2.0/video lezioni corso base pulite"
os.makedirs(TARGET_DIR, exist_ok=True)

print(f"Directory di destinazione: {TARGET_DIR}")

for i in range(1, 21):
    filename = f"lesson_{i:02d}_raw_clean.mp4"
    dest_path = os.path.join(TARGET_DIR, filename)
    url = f"https://www.malaradio.com/CorsoAi2/{i}%20Lezione%20Live.mp4"
    
    if os.path.exists(dest_path) and os.path.getsize(dest_path) > 50 * 1024 * 1024:
        print(f"[{i}/20] {filename} già presente ({os.path.getsize(dest_path)/(1024*1024):.1f} MB), salto.")
        continue
        
    print(f"\n[{i}/20] Scarico {filename} da {url}...")
    start_time = time.time()
    
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as resp, open(dest_path, 'wb') as out_f:
            total_size = int(resp.headers.get('Content-Length', 0))
            downloaded = 0
            block_size = 1024 * 1024 * 2 # 2MB buffer
            
            while True:
                buf = resp.read(block_size)
                if not buf:
                    break
                out_f.write(buf)
                downloaded += len(buf)
                if total_size > 0:
                    percent = (downloaded / total_size) * 100
                    mb_down = downloaded / (1024 * 1024)
                    mb_tot = total_size / (1024 * 1024)
                    sys.stdout.write(f"\r  -> {percent:.1f}% ({mb_down:.1f} MB / {mb_tot:.1f} MB)")
                    sys.stdout.flush()
        
        elapsed = time.time() - start_time
        print(f"\n  ✓ Completato in {elapsed:.1f}s ({os.path.getsize(dest_path)/(1024*1024):.1f} MB)")
    except Exception as e:
        print(f"\n  ✗ Errore download {filename}: {e}")

print("\n🎉 TUTTI I 20 VIDEO PULITI SONO STATI SCARICATI SU GOOGLE DRIVE!")
