"""
Crea overlay grafici professionali ad alta risoluzione (1920x1080) per il test pilota della Lezione 1.
Usa font di sistema reali con glyph pieni (senza glifi mancanti).
"""

import os
from PIL import Image, ImageDraw, ImageFont

os.makedirs("public/overlays_test", exist_ok=True)
W, H = 1920, 1080

font_path_bold = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
font_path_reg = "/System/Library/Fonts/Supplemental/Arial.ttf"

font_bold_lg = ImageFont.truetype(font_path_bold, 30)
font_bold_md = ImageFont.truetype(font_path_bold, 24)
font_regular = ImageFont.truetype(font_path_reg, 19)
font_tag = ImageFont.truetype(font_path_bold, 14)

# 1. BADGE CAPITOLO (Top Left) - Durata 0-10s
img_badge = Image.new("RGBA", (W, H), (0, 0, 0, 0))
d1 = ImageDraw.Draw(img_badge)
d1.rounded_rectangle([(60, 50), (460, 130)], radius=14, fill=(15, 23, 42, 235), outline=(56, 189, 248, 255), width=2)
d1.rounded_rectangle([(80, 65), (250, 92)], radius=6, fill=(2, 132, 199, 255))
d1.text((95, 70), "CORSO 1 - LEZIONE 1", fill=(255, 255, 255, 255), font=font_tag)
d1.text((80, 98), "Benvenuti nel Futuro", fill=(241, 245, 249, 255), font=font_bold_md)
img_badge.save("public/overlays_test/badge_intro.png")

# 2. LOWER THIRD (In basso a sinistra, non sopra il mento) - Durata 12-20s
img_lower = Image.new("RGBA", (W, H), (0, 0, 0, 0))
d3 = ImageDraw.Draw(img_lower)
lw_x1, lw_y1 = 60, 940
lw_x2, lw_y2 = 1200, 1020
d3.rounded_rectangle([(lw_x1, lw_y1), (lw_x2, lw_y2)], radius=14, fill=(15, 23, 42, 240), outline=(56, 189, 248, 255), width=2)
d3.text((lw_x1 + 30, lw_y1 + 18), "PUNTO CHIAVE: L'AI non ti sostituisce, potenzia cio che fai", fill=(241, 245, 249, 255), font=font_bold_md)
d3.text((lw_x1 + 30, lw_y1 + 48), "Uno strumento pratico per moltiplicare tempo e risultati", fill=(148, 163, 184, 255), font=font_regular)
img_lower.save("public/overlays_test/lower_third_focus.png")

# 3. CARD CONCETTUALE LATERALE (Destra estrema, perfettamente pulita)
img_card = Image.new("RGBA", (W, H), (0, 0, 0, 0))
d2 = ImageDraw.Draw(img_card)
box_x1, box_y1 = 1240, 200
box_x2, box_y2 = 1860, 680

d2.rounded_rectangle([(box_x1, box_y1), (box_x2, box_y2)], radius=16, fill=(10, 18, 36, 240), outline=(139, 92, 246, 255), width=2)
d2.text((box_x1 + 30, box_y1 + 30), "IL NUOVO APPROCCIO", fill=(192, 132, 252, 255), font=font_bold_md)
d2.line([(box_x1 + 30, box_y1 + 68), (box_x2 - 30, box_y1 + 68)], fill=(51, 65, 85, 255), width=1)

points = [
    ("> Strumento per Creare", "Non un semplice robot rispondi-email"),
    ("> Moltiplicatore di Idee", "Bozze e strategie in pochi secondi"),
    ("> Alleato Operativo", "Elimina i compiti noiosi e ripetitivi")
]

cur_y = box_y1 + 88
for title, subtitle in points:
    d2.text((box_x1 + 30, cur_y), title, fill=(248, 250, 252, 255), font=font_bold_md)
    d2.text((box_x1 + 30, cur_y + 32), subtitle, fill=(148, 163, 184, 255), font=font_regular)
    cur_y += 90

img_card.save("public/overlays_test/card_riassunto.png")
print("Overlay aggiornati con successo.")
