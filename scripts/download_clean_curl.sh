#!/bin/bash
set -e

DEST_DIR="/Users/marco/Library/CloudStorage/GoogleDrive-mark2gest@gmail.com/Il mio Drive/Aiutiamoci/Video lezioni corso base pulite "
mkdir -p "$DEST_DIR"

echo "Directory di destinazione: $DEST_DIR"

for i in $(seq 1 20); do
    num=$(printf "%02d" $i)
    dest_file="$DEST_DIR/${i} Lezione Live.mp4"
    url="https://www.malaradio.com/CorsoAi2/${i}%20Lezione%20Live.mp4"
    
    if [ -f "$dest_file" ] && [ $(stat -f%z "$dest_file" 2>/dev/null || echo 0) -gt 50000000 ]; then
        echo "[$i/20] ${i} Lezione Live.mp4 già presente ($(du -h "$dest_file" | cut -f1)), salto."
        continue
    fi
    
    echo ""
    echo "============================================================"
    echo "[$i/20] Scarico ${i} Lezione Live.mp4 da $url..."
    echo "============================================================"
    
    curl -# -L -C - \
      -A "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" \
      "$url" -o "$dest_file"
      
    echo "✓ Completato: $(du -h "$dest_file" | cut -f1)"
done

echo ""
echo "🎉 TUTTI I 20 VIDEO PULITI SONO STATI SCARICATI CON SUCCESSO SU GOOGLE DRIVE!"
