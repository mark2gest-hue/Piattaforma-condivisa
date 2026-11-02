#!/usr/bin/env python3
"""
Script chirurgico di deploy e swap atomico dei 20 video rieditati da Google Drive al server VPS (100.123.212.30).
Sostituisce i vecchi file in /var/www/videos/ a Zero Downtime passando per /var/www/videos/staging/.
Usa un buffer temporaneo locale /tmp/lesson_upload_tmp.mp4 per evitare 'Operation canceled' su macOS FileProvider.
Supporta intervalli di lezioni: es. python3 deploy_videos_to_vps.py 1 5
"""

import os
import sys
import shutil
import subprocess
from pathlib import Path

SRC_DIR = Path("/Users/marco/Library/CloudStorage/GoogleDrive-mark2gest@gmail.com/Il mio Drive/Aiutiamoci/Video nuovi corso base ")
SSH_KEY = "/Users/marco/.ssh/keys/vps-stefano/ssh-key-2026-09-15.key"
REMOTE_HOST = "100.123.212.30"
REMOTE_USER = "ubuntu"
REMOTE_DIR = "/var/www/videos"
STAGING_DIR = f"{REMOTE_DIR}/staging"
TMP_BUFFER = Path("/tmp/lesson_upload_tmp.mp4")

def run_ssh(cmd_str: str) -> subprocess.CompletedProcess:
    cmd = [
        "ssh", "-i", SSH_KEY,
        "-o", "ConnectTimeout=15",
        "-o", "StrictHostKeyChecking=no",
        f"{REMOTE_USER}@{REMOTE_HOST}",
        cmd_str
    ]
    return subprocess.run(cmd, capture_output=True, text=True)

def copy_to_tmp_buffer(src_file: Path, dst_file: Path):
    """Copia a chunk da Google Drive al buffer locale /tmp."""
    size_mb = src_file.stat().st_size / (1024 * 1024)
    print(f"📥 Copia da Google Drive al buffer temporaneo {dst_file} ({size_mb:.1f} MB)...", flush=True)
    if dst_file.exists():
        dst_file.unlink()
    with open(src_file, "rb") as fsrc, open(dst_file, "wb") as fdst:
        while True:
            chunk = fsrc.read(8 * 1024 * 1024)
            if not chunk:
                break
            fdst.write(chunk)
    print(f"  ✅ Copia completata ({dst_file.stat().st_size / (1024*1024):.1f} MB)", flush=True)

def main():
    start_lid = int(sys.argv[1]) if len(sys.argv) > 1 else 1
    end_lid = int(sys.argv[2]) if len(sys.argv) > 2 else 20

    print(f"🚀 AVVIO DEPLOY VIDEO SU VPS ({REMOTE_HOST}) — Intervallo Lezioni: {start_lid} -> {end_lid}", flush=True)

    # 1. Crea cartella di staging su VPS
    res_mkdir = run_ssh(f"mkdir -p {STAGING_DIR}")
    if res_mkdir.returncode != 0:
        print(f"❌ Impossibile creare directory di staging su VPS: {res_mkdir.stderr}", flush=True)
        sys.exit(1)

    durations_dict = {}

    for lid in range(start_lid, end_lid + 1):
        num_str = f"{lid:02d}"
        local_file = SRC_DIR / f"Lezione{lid}Lm_broadcast_hq.mp4"
        staging_target = f"{STAGING_DIR}/lesson_{num_str}_full_production.mp4"
        final_target = f"{REMOTE_DIR}/lesson_{num_str}_full_production.mp4"

        if not local_file.exists():
            print(f"❌ File locale non trovato: {local_file}", flush=True)
            continue

        local_size = local_file.stat().st_size
        local_size_mb = local_size / (1024 * 1024)

        # Controllo se il file finale su VPS ha già esattamente la stessa dimensione
        check_res = run_ssh(f"stat -c %s {final_target} 2>/dev/null || echo 0")
        remote_final_size = int(check_res.stdout.strip()) if check_res.stdout.strip().isdigit() else 0

        if remote_final_size == local_size:
            print(f"⏭️  [Lezione {num_str}] Già presente in produzione e allineata al byte ({local_size_mb:.2f} MB). Salto upload.", flush=True)
        else:
            # 1. Copia nel buffer /tmp locale
            copy_to_tmp_buffer(local_file, TMP_BUFFER)

            # 2. Upload con SCP dal buffer locale allo staging VPS
            print(f"📤 [Lezione {num_str}/20] Uploading {local_file.name} in staging via buffer temporaneo...", flush=True)
            scp_cmd = [
                "scp", "-i", SSH_KEY,
                "-o", "ConnectTimeout=15",
                "-o", "StrictHostKeyChecking=no",
                str(TMP_BUFFER),
                f"{REMOTE_USER}@{REMOTE_HOST}:{staging_target}"
            ]
            upload_res = subprocess.run(scp_cmd)
            
            # Rimozione immediata buffer temporaneo per non saturare disco locale
            if TMP_BUFFER.exists():
                TMP_BUFFER.unlink()

            if upload_res.returncode != 0:
                print(f"❌ Errore durante SCP per Lezione {lid}", flush=True)
                sys.exit(1)

            # 3. Verifica byte in staging
            staging_check = run_ssh(f"stat -c %s {staging_target} 2>/dev/null || echo 0")
            staging_size = int(staging_check.stdout.strip()) if staging_check.stdout.strip().isdigit() else 0
            if staging_size != local_size:
                print(f"❌ Discrepanza byte staging per Lezione {lid}: locale={local_size}, remoto={staging_size}", flush=True)
                sys.exit(1)

            # 4. Remuxing lossless su VPS per garantire Progressive MP4 +faststart (unifica fMP4 ed elimina blocchi moof)
            faststart_staging = f"{STAGING_DIR}/lesson_{num_str}_faststart.mp4"
            print(f"🎬 [Lezione {num_str}] Remuxing lossless +faststart su VPS...", flush=True)
            remux_cmd = f"/usr/bin/ffmpeg -y -v error -i {staging_target} -c copy -movflags +faststart {faststart_staging} && chmod 644 {faststart_staging} && rm -f {staging_target}"
            remux_res = run_ssh(remux_cmd)
            if remux_res.returncode != 0:
                print(f"❌ Errore durante remux faststart per Lezione {lid}: {remux_res.stderr}", flush=True)
                sys.exit(1)

            # 5. Swap atomico POSIX
            print(f"⚡ [Lezione {num_str}] Eseguo swap atomico POSIX in produzione...", flush=True)
            swap_res = run_ssh(f"mv -f {faststart_staging} {final_target} && chmod 644 {final_target}")
            if swap_res.returncode != 0:
                print(f"❌ Errore durante lo swap atomico per Lezione {lid}: {swap_res.stderr}", flush=True)
                sys.exit(1)
            print(f"  ✅ Lezione {lid} swappata con successo in produzione!", flush=True)

        # Lettura durata con ffprobe direttamente sulla VPS
        dur_cmd = f"/usr/bin/ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 {final_target}"
        dur_res = run_ssh(dur_cmd)
        if dur_res.returncode == 0 and dur_res.stdout.strip():
            try:
                seconds_float = float(dur_res.stdout.strip())
                mins = int(seconds_float // 60)
                secs = int(round(seconds_float % 60))
                if secs == 60:
                    mins += 1
                    secs = 0
                dur_str = f"{mins:02d}:{secs:02d}"
                durations_dict[lid] = dur_str
                print(f"  ⏱️ Durata Lezione {num_str}: {dur_str} ({seconds_float:.1f}s)", flush=True)
            except Exception as e:
                print(f"  ⚠️ Errore parsing durata Lezione {lid}: {e}", flush=True)
        else:
            print(f"  ⚠️ ffprobe fallito per Lezione {lid}: {dur_res.stderr}", flush=True)

    # Pulizia staging se arrivati alla fine
    if end_lid == 20:
        print("\n🧹 Pulizia directory staging...", flush=True)
        run_ssh(f"rmdir {STAGING_DIR} 2>/dev/null || true")

    print("\n📋 Elenco durate rilevate:", flush=True)
    for l_id, d_str in sorted(durations_dict.items()):
        print(f"  Lezione {l_id:02d}: '{d_str}'", flush=True)

    print(f"\n🎉 BLOCCO LEZIONI {start_lid}-{end_lid} COMPLETATO!", flush=True)

if __name__ == "__main__":
    main()
