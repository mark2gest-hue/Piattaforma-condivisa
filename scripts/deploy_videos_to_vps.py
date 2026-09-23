#!/usr/bin/env python3
"""
Script di sincronizzazione e deploy dei 20 video renderizzati da Google Drive al server VPS (80.225.81.150).
Sostituisce i vecchi file in /var/www/videos/ con i nuovi video corretti.
"""

import os
import sys
import subprocess
from pathlib import Path

SRC_DIR = Path("/Users/marco/Library/CloudStorage/GoogleDrive-mark2gest@gmail.com/Il mio Drive/Aiutiamoci/video renderizzati")
SSH_KEY = "/Users/marco/.ssh/keys/vps-stefano/ssh-key-2026-09-15.key"
REMOTE_HOST = "80.225.81.150"
REMOTE_USER = "ubuntu"
REMOTE_DIR = "/var/www/videos"

def main():
    print(f"🚀 AVVIO UPLOAD 20 VIDEO SU VPS ({REMOTE_HOST})...")
    
    # 1. Rinomina / Upload pulito
    for lid in range(1, 21):
        num_str = f"{lid:02d}"
        local_file = SRC_DIR / f"lesson_{num_str}_rendered_production.mp4"
        remote_target = f"{REMOTE_DIR}/lesson_{num_str}_full_production.mp4"
        
        if not local_file.exists():
            print(f"❌ File locale non trovato: {local_file}")
            continue
            
        size_mb = local_file.stat().st_size / (1024*1024)
        print(f"📤 [{num_str}/20] Caricamento {local_file.name} ({size_mb:.1f} MB) -> {remote_target} ...")
        
        cmd = [
            "scp", "-i", SSH_KEY,
            "-o", "StrictHostKeyChecking=no",
            str(local_file),
            f"{REMOTE_USER}@{REMOTE_HOST}:{remote_target}"
        ]
        
        res = subprocess.run(cmd)
        if res.returncode == 0:
            print(f"  ✅ Lezione {lid} caricata con successo!")
        else:
            print(f"  ❌ Errore upload Lezione {lid}")

    print("\n🧹 Pulizia file .bak o obsoleti su VPS...")
    cmd_clean = [
        "ssh", "-i", SSH_KEY, "-o", "StrictHostKeyChecking=no",
        f"{REMOTE_USER}@{REMOTE_HOST}",
        f"rm -f {REMOTE_DIR}/*.bak"
    ]
    subprocess.run(cmd_clean)
    
    print("\n📋 Verifica finale file su server:")
    cmd_ls = [
        "ssh", "-i", SSH_KEY, "-o", "StrictHostKeyChecking=no",
        f"{REMOTE_USER}@{REMOTE_HOST}",
        f"ls -lh {REMOTE_DIR}/"
    ]
    subprocess.run(cmd_ls)
    print("\n🎉 TUTTI I 20 VIDEO SONO STATI PUBBLICATI IN PRODUZIONE SU AIUTIAMOCI.CLOUD!")

if __name__ == "__main__":
    main()
