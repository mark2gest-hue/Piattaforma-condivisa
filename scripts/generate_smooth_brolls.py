"""
Genera clip B-roll cinematici fluidi e senza traballio per il video pilota Corso 2.
Usa Pillow con interpolazione LANCZOS a virgola mobile per evitare jitter da pixel-snapping.

Clip prodotte:
  1. broll_n8n_real.mp4     - Workflow n8n REALE: panoramica + zoom node LLM/Gemini/Telegram
  2. broll_obsidian_v2.mp4  - Grafo Obsidian: pan fluido + zoom cinematico senza tremolio
  3. broll_kanban_live.mp4  - Screencast Kanban animato con cursore mouse visibile e card che avanza
"""

import subprocess, os, math
from PIL import Image, ImageDraw, ImageFilter, ImageFont

OUT_W, OUT_H = 1920, 1080
FPS = 25
LANCZOS = Image.LANCZOS

def easing_inout(t):
    """Cubic ease in-out: 0..1 -> 0..1, zero velocity agli estremi."""
    if t < 0.5:
        return 4 * t * t * t
    else:
        p = 2 * t - 2
        return 1 - p * p * p / 2

def make_frame(img, cx_f, cy_f, zoom_f):
    """
    Ritaglia da img centrato su (cx_f, cy_f) con fattore di zoom zoom_f,
    usando coordinate floating-point e resize LANCZOS.
    """
    iw, ih = img.size
    crop_w = iw / zoom_f
    crop_h = ih / zoom_f
    # Adatta aspect ratio a 16:9
    if crop_w / crop_h > OUT_W / OUT_H:
        crop_h = crop_w * OUT_H / OUT_W
    else:
        crop_w = crop_h * OUT_W / OUT_H
    
    x0 = cx_f * iw - crop_w / 2
    y0 = cy_f * ih - crop_h / 2
    x0 = max(0, min(x0, iw - crop_w))
    y0 = max(0, min(y0, ih - crop_h))
    x1 = x0 + crop_w
    y1 = y0 + crop_h
    
    cropped = img.crop((x0, y0, x1, y1))
    return cropped.resize((OUT_W, OUT_H), LANCZOS)


# ─── CLIP 1: n8n Real Workflow ────────────────────────────────────────────────
def gen_n8n_real(duration_sec=10):
    """
    0%→30%: panoramica dall'alto verso i nodi centrali (LLM Chain -> Gemini -> Telegram)
    30%→70%: zoom lento e centrato sui nodi core
    70%→100%: dissolvenza verso angolo HTTP/Supabase in basso
    """
    print("Generazione broll_n8n_real.mp4...")
    img = Image.open("public/n8n_real_workflow.png").convert("RGB")
    # Upscale 4x per non perdere dettaglio durante lo zoom
    factor = 4
    big = img.resize((img.width * factor, img.height * factor), LANCZOS)
    
    os.makedirs("public/n8n_frames", exist_ok=True)
    total = int(duration_sec * FPS)
    
    # Keyframes: (t%, cx relativo sull'immagine, cy relativo, zoom)
    kf = [
        (0.00, 0.50, 0.40, 1.0),   # Vista totale centrata
        (0.30, 0.43, 0.38, 1.4),   # Avvicina verso LLM Chain / Gemini
        (0.65, 0.55, 0.45, 1.7),   # Zoom su Telegram + Wait + Code JS
        (0.85, 0.40, 0.75, 1.5),   # Pan verso HTTP/Supabase in basso
        (1.00, 0.50, 0.55, 1.2),   # Allontana per vista finale
    ]
    
    for i in range(total):
        t = i / (total - 1)
        # Interpolazione cubica tra keyframe
        for k in range(len(kf) - 1):
            t0, cx0, cy0, z0 = kf[k]
            t1, cx1, cy1, z1 = kf[k+1]
            if t0 <= t <= t1:
                alpha = (t - t0) / (t1 - t0)
                alpha = easing_inout(alpha)
                cx = cx0 + (cx1 - cx0) * alpha
                cy = cy0 + (cy1 - cy0) * alpha
                z  = z0  + (z1  - z0)  * alpha
                break
        
        frame = make_frame(big, cx, cy, z)
        frame.save(f"public/n8n_frames/f{i:04d}.png")
        if i % 30 == 0:
            print(f"  n8n: {i}/{total}")
    
    subprocess.run([
        "/opt/homebrew/bin/ffmpeg", "-y",
        "-framerate", str(FPS),
        "-i", "public/n8n_frames/f%04d.png",
        "-c:v", "libx264", "-preset", "fast", "-crf", "17",
        "-pix_fmt", "yuv420p",
        "public/broll_n8n_real.mp4"
    ], check=True)
    print("  ✓ broll_n8n_real.mp4 generato")


# ─── CLIP 2: Obsidian Graph fluido ───────────────────────────────────────────
def gen_obsidian_smooth(duration_sec=11):
    """
    Pan + zoom completamente fluido con LANCZOS, nessun jitter.
    Segue il cluster centrale (nodo grande bianco/viola) con doppio giro di orbita.
    """
    print("Generazione broll_obsidian_v2.mp4...")
    img = Image.open("public/obsidian_graph.png").convert("RGB")
    # Scala a 3x per avere headroom di zoom
    factor = 3
    big = img.resize((img.width * factor, img.height * factor), LANCZOS)
    iw, ih = big.size
    
    os.makedirs("public/obs_frames", exist_ok=True)
    total = int(duration_sec * FPS)
    
    # Cluster centrale di Obsidian è approssimativamente al (52%, 68%) dell'immagine originale
    kf = [
        (0.00, 0.52, 0.55, 1.0),   # Vista totale del grafo
        (0.25, 0.52, 0.62, 1.3),   # Zoom verso cluster centrale
        (0.50, 0.48, 0.65, 1.55),  # Picco zoom sul nodo hub (Home/Dashboard)
        (0.75, 0.55, 0.60, 1.3),   # Pan verso i nodi Lezioni collegati
        (1.00, 0.52, 0.55, 1.05),  # Ritorno panoramico
    ]
    
    for i in range(total):
        t = i / (total - 1)
        for k in range(len(kf) - 1):
            t0, cx0, cy0, z0 = kf[k]
            t1, cx1, cy1, z1 = kf[k+1]
            if t0 <= t <= t1:
                alpha = (t - t0) / (t1 - t0)
                alpha = easing_inout(alpha)
                cx = cx0 + (cx1 - cx0) * alpha
                cy = cy0 + (cy1 - cy0) * alpha
                z  = z0  + (z1  - z0)  * alpha
                break
        
        frame = make_frame(big, cx, cy, z)
        frame.save(f"public/obs_frames/f{i:04d}.png")
        if i % 30 == 0:
            print(f"  Obsidian: {i}/{total}")
    
    subprocess.run([
        "/opt/homebrew/bin/ffmpeg", "-y",
        "-framerate", str(FPS),
        "-i", "public/obs_frames/f%04d.png",
        "-c:v", "libx264", "-preset", "fast", "-crf", "17",
        "-pix_fmt", "yuv420p",
        "public/broll_obsidian_v2.mp4"
    ], check=True)
    print("  ✓ broll_obsidian_v2.mp4 generato")


# ─── CLIP 3: Kanban Live con cursore mouse ────────────────────────────────────
def gen_kanban_live(duration_sec=11):
    """
    Usa il primo frame del screencast esistente come base e aggiunge:
    - Un cursore mouse visibile che si muove sulle card
    - Effetto spotlight sotto il cursore
    - Leggero zoom verso la card attiva
    """
    print("Generazione broll_kanban_live.mp4...")
    # Estrai un frame di riferimento dallo screencast originale
    subprocess.run([
        "/opt/homebrew/bin/ffmpeg", "-y",
        "-ss", "00:00:02",
        "-i", "public/broll_agent_screencast.mp4",
        "-vframes", "1", "-update", "1",
        "public/kanban_base_frame.png"
    ], check=True)
    
    img = Image.open("public/kanban_base_frame.png").convert("RGB")
    iw, ih = img.size
    
    os.makedirs("public/kanban_frames", exist_ok=True)
    total = int(duration_sec * FPS)
    
    # Percorso del cursore: parte in alto a destra (KPI pill),
    # scende sulla card Nemotron, passa sul terminale n8n in basso
    cursor_path = [
        (0.00, (0.92, 0.12)),   # KPI pill "Agent Status"
        (0.15, (0.35, 0.30)),   # Card Nemotron "In Corso (AI)"
        (0.30, (0.35, 0.38)),   # Hover sulla card
        (0.50, (0.25, 0.55)),   # Zona n8n Workflow Canvas
        (0.65, (0.50, 0.60)),   # Nodo centrale (Gemini Agent)
        (0.80, (0.93, 0.50)),   # Terminale daemon log
        (1.00, (0.93, 0.75)),   # Ultima riga del terminale
    ]
    
    # Keyframe zoom sulla regione della card attiva
    zoom_kf = [
        (0.00, 0.50, 0.35, 1.0),
        (0.20, 0.35, 0.40, 1.18),
        (0.55, 0.40, 0.52, 1.22),
        (0.80, 0.78, 0.50, 1.15),
        (1.00, 0.50, 0.35, 1.0),
    ]
    
    # Disegna cursore: freccia bianca con bordo nero
    def draw_cursor(draw, x, y, size=22):
        pts = [
            (x, y), (x, y + size),
            (x + size*0.35, y + size*0.65),
            (x + size*0.52, y + size),
            (x + size*0.65, y + size*0.92),
            (x + size*0.50, y + size*0.65),
            (x + size*0.85, y + size*0.65),
        ]
        draw.polygon(pts, fill="black")
        inner = [(px+1, py+1) for (px, py) in pts]
        draw.polygon([(x+1.5, y+1.5), (x+1.5, y+size-2),
                      (x + size*0.35+1, y + size*0.65-1),
                      (x + size*0.5+1, y + size-2),
                      (x + size*0.64, y + size*0.9),
                      (x + size*0.49, y + size*0.64),
                      (x + size*0.84, y + size*0.64)],
                     fill="white")
    
    for i in range(total):
        t = i / (total - 1)
        
        # Interpola cursore
        for k in range(len(cursor_path) - 1):
            t0, (cx0, cy0) = cursor_path[k]
            t1, (cx1, cy1) = cursor_path[k+1]
            if t0 <= t <= t1:
                alpha = easing_inout((t - t0) / (t1 - t0))
                mx = cx0 + (cx1 - cx0) * alpha
                my = cy0 + (cy1 - cy0) * alpha
                break
        
        # Interpola zoom
        for k in range(len(zoom_kf) - 1):
            t0, zx0, zy0, z0 = zoom_kf[k]
            t1, zx1, zy1, z1 = zoom_kf[k+1]
            if t0 <= t <= t1:
                alpha = easing_inout((t - t0) / (t1 - t0))
                zx = zx0 + (zx1 - zx0) * alpha
                zy = zy0 + (zy1 - zy0) * alpha
                z  = z0  + (z1  - z0)  * alpha
                break
        
        frame = make_frame(img, zx, zy, z)
        draw = ImageDraw.Draw(frame)
        
        # Spotlight sotto il cursore
        cursor_x = int(mx * OUT_W)
        cursor_y = int(my * OUT_H)
        for r, alpha_val in [(60, 20), (35, 40), (18, 70)]:
            overlay = Image.new("RGBA", frame.size, (0, 0, 0, 0))
            od = ImageDraw.Draw(overlay)
            od.ellipse([cursor_x-r, cursor_y-r, cursor_x+r, cursor_y+r],
                        fill=(255, 255, 220, alpha_val))
            frame = Image.alpha_composite(frame.convert("RGBA"), overlay).convert("RGB")
            draw = ImageDraw.Draw(frame)
        
        draw_cursor(draw, cursor_x - 5, cursor_y - 3, size=28)
        
        frame.save(f"public/kanban_frames/f{i:04d}.png")
        if i % 30 == 0:
            print(f"  Kanban: {i}/{total}")
    
    subprocess.run([
        "/opt/homebrew/bin/ffmpeg", "-y",
        "-framerate", str(FPS),
        "-i", "public/kanban_frames/f%04d.png",
        "-c:v", "libx264", "-preset", "fast", "-crf", "17",
        "-pix_fmt", "yuv420p",
        "public/broll_kanban_live.mp4"
    ], check=True)
    print("  ✓ broll_kanban_live.mp4 generato")


if __name__ == "__main__":
    print("=== Generazione B-Roll cinematici fluidi ===")
    gen_n8n_real(duration_sec=10)
    gen_obsidian_smooth(duration_sec=11)
    gen_kanban_live(duration_sec=11)
    print("\n✓ Tutti i broll generati con successo!")
