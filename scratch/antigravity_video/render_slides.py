import os
import json
from PIL import Image, ImageDraw, ImageFont

OUTPUT_DIR = "scratch/antigravity_video"

# Carica dati scene
with open(os.path.join(OUTPUT_DIR, "scenes.json"), "r") as f:
    scenes = json.load(f)

# Dimensioni Master 1080p
WIDTH = 1920
HEIGHT = 1080

# Font macOS di sistema
FONT_BOLD = "/System/Library/Fonts/SFProDisplay-Bold.otf" if os.path.exists("/System/Library/Fonts/SFProDisplay-Bold.otf") else "/System/Library/Fonts/HelveticaNeue.ttc"
FONT_MEDIUM = "/System/Library/Fonts/SFProDisplay-Medium.otf" if os.path.exists("/System/Library/Fonts/SFProDisplay-Medium.otf") else "/System/Library/Fonts/HelveticaNeue.ttc"

try:
    font_badge = ImageFont.truetype(FONT_BOLD, 22)
    font_title = ImageFont.truetype(FONT_BOLD, 54)
    font_subtitle = ImageFont.truetype(FONT_MEDIUM, 28)
    font_bullet = ImageFont.truetype(FONT_MEDIUM, 26)
    font_footer = ImageFont.truetype(FONT_MEDIUM, 20)
    font_brand = ImageFont.truetype(FONT_BOLD, 30)
except Exception:
    font_badge = ImageFont.load_default()
    font_title = ImageFont.load_default()
    font_subtitle = ImageFont.load_default()
    font_bullet = ImageFont.load_default()
    font_footer = ImageFont.load_default()
    font_brand = ImageFont.load_default()

def create_gradient_bg(width, height):
    # Sfondo Dark Tech profondo (Slate 950 -> Deep Blue Indigo)
    base = Image.new("RGBA", (width, height), (10, 15, 30, 255))
    draw = ImageDraw.Draw(base)
    
    # Glow radiale al centro / angolo
    for r in range(400, 0, -10):
        alpha = int(25 * (1 - r / 400))
        draw.ellipse([width//2 - r*2, height//2 - r - 100, width//2 + r*2, height//2 + r + 100], fill=(30, 58, 138, alpha))
        
    return base

def render_scene_slide(scene):
    img = create_gradient_bg(WIDTH, HEIGHT)
    draw = ImageDraw.Draw(img)
    
    # Top Bar: Logo & Brand
    # Badge Pillola Sinistra
    draw.rounded_rectangle([100, 80, 280, 130], radius=16, fill=(30, 41, 59, 220), outline=(56, 189, 248, 180), width=2)
    draw.text((125, 92), "ANTIGRAVITY", font=font_brand, fill=(255, 255, 255, 255))
    
    # Badge Categoria Destra
    draw.rounded_rectangle([WIDTH - 420, 80, WIDTH - 100, 130], radius=16, fill=(15, 23, 42, 200), outline=(99, 102, 241, 140), width=1)
    draw.text((WIDTH - 395, 95), scene['badge'], font=font_badge, fill=(165, 180, 252, 255))
    
    # Main Card Centrale Glassmorphism
    CARD_L = 100
    CARD_T = 180
    CARD_R = WIDTH - 100
    CARD_B = HEIGHT - 140
    
    draw.rounded_rectangle([CARD_L, CARD_T, CARD_R, CARD_B], radius=28, fill=(15, 23, 42, 210), outline=(51, 65, 85, 255), width=2)
    
    # Barra colorata accent in alto alla card
    draw.rounded_rectangle([CARD_L + 2, CARD_T + 2, CARD_R - 2, CARD_T + 8], radius=4, fill=(2, 132, 199, 255))
    
    # Titolo Principale
    draw.text((CARD_L + 60, CARD_T + 55), scene['title'], font=font_title, fill=(255, 255, 255, 255))
    
    # Sottotitolo
    draw.text((CARD_L + 60, CARD_T + 130), scene['subtitle'], font=font_subtitle, fill=(56, 189, 248, 255))
    
    # Linea separatrice
    draw.line([CARD_L + 60, CARD_T + 185, CARD_R - 60, CARD_T + 185], fill=(30, 41, 59, 255), width=2)
    
    # Punti Chiave (Bullets Box)
    start_y = CARD_T + 225
    for idx, point in enumerate(scene['details']):
        y = start_y + idx * 110
        # Pillola icona/numero
        draw.rounded_rectangle([CARD_L + 60, y, CARD_L + 120, y + 60], radius=14, fill=(2, 132, 199, 40), outline=(56, 189, 248, 200), width=2)
        draw.text((CARD_L + 82, y + 14), f"{idx+1}", font=font_bullet, fill=(56, 189, 248, 255))
        
        # Testo del punto
        draw.text((CARD_L + 150, y + 16), point, font=font_bullet, fill=(241, 245, 249, 255))

    # Footer Barra Inferiore
    draw.text((CARD_L + 60, CARD_B - 60), "aiutiamoci.cloud • Corso Pratico di Intelligenza Artificiale", font=font_footer, fill=(148, 163, 184, 255))
    draw.text((CARD_R - 260, CARD_B - 60), "Modulo 1 • Zero Teoria", font=font_footer, fill=(56, 189, 248, 255))
    
    out_file = os.path.join(OUTPUT_DIR, f"{scene['id']}_slide.png")
    img.save(out_file, "PNG")
    print(f"🖼️ Slide salvata: {out_file}")

if __name__ == "__main__":
    for s in scenes:
        render_scene_slide(s)
    print("✅ Tutte le slide 1080p sono state renderizzate con successo!")
