from PIL import Image, ImageDraw, ImageFont
import os

os.makedirs('public/overlays_pro', exist_ok=True)
w, h = 1920, 1080

font_huge = ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial Bold.ttf', 38)
font_title = ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial Bold.ttf', 26)
font_body = ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial.ttf', 21)
font_code = ImageFont.truetype('/System/Library/Fonts/Supplemental/Courier New Bold.ttf', 22)

# 1. Overlay Intro: Il Limite di ChatGPT
img1 = Image.new('RGBA', (w, h), (0, 0, 0, 0))
d1 = ImageDraw.Draw(img1)
# Header Pro
d1.rounded_rectangle([(80, 60), (450, 130)], radius=12, fill=(15, 23, 42, 230), outline=(139, 92, 246, 255), width=2)
d1.text((110, 80), 'CORSO 2: AI PRO', fill=(167, 139, 250, 255), font=font_title)

# Card centrale: Limite Chatbot
d1.rounded_rectangle([(460, 320), (1460, 760)], radius=20, fill=(10, 15, 30, 235), outline=(239, 68, 68, 220), width=2)
d1.text((520, 360), 'IL VECCHIO MODO: CHATBOT PASSIVO', fill=(248, 113, 113, 255), font=font_huge)
d1.text((520, 450), '❌ Tu devi aprire la chat ogni volta', fill=(241, 245, 249, 255), font=font_title)
d1.text((520, 520), '❌ Devi copiare e incollare i testi a mano', fill=(241, 245, 249, 255), font=font_title)
d1.text((520, 590), '❌ Se non sei al computer, il lavoro si ferma', fill=(241, 245, 249, 255), font=font_title)
d1.text((520, 670), '👉 Sei tu che lavori per l intelligenza artificiale.', fill=(148, 163, 184, 255), font=font_body)
img1.save('public/overlays_pro/card_1_old_way.png')

# 2. Overlay La Svolta: Cos è un Agente Autonomo
img2 = Image.new('RGBA', (w, h), (0, 0, 0, 0))
d2 = ImageDraw.Draw(img2)
d2.rounded_rectangle([(80, 60), (450, 130)], radius=12, fill=(15, 23, 42, 230), outline=(139, 92, 246, 255), width=2)
d2.text((110, 80), 'CORSO 2: AI PRO', fill=(167, 139, 250, 255), font=font_title)

d2.rounded_rectangle([(460, 300), (1460, 780)], radius=20, fill=(8, 15, 28, 240), outline=(56, 189, 248, 255), width=3)
d2.text((520, 340), 'LA SVOLTA: AGENTE AUTONOMO', fill=(56, 189, 248, 255), font=font_huge)
d2.text((520, 430), '⚡ Tu assegni l obiettivo di alto livello (Goal)', fill=(241, 245, 249, 255), font=font_title)
d2.text((520, 500), '⚡ L Agente decide in autonomia i passi da compiere', fill=(241, 245, 249, 255), font=font_title)
d2.text((520, 570), '⚡ Usa strumenti: legge file, chiama API, invia email', fill=(241, 245, 249, 255), font=font_title)
d2.text((520, 640), '⚡ Lavora 24/7 in background mentre fai altro', fill=(52, 211, 153, 255), font=font_title)
d2.text((520, 710), '👉 Da esecutore manuale a Manager di sistemi intelligenti.', fill=(148, 163, 184, 255), font=font_body)
img2.save('public/overlays_pro/card_2_agent_way.png')

# 3. Overlay Architettura Flusso (3 blocchi collegati)
img3 = Image.new('RGBA', (w, h), (0, 0, 0, 0))
d3 = ImageDraw.Draw(img3)
d3.rounded_rectangle([(80, 60), (450, 130)], radius=12, fill=(15, 23, 42, 230), outline=(139, 92, 246, 255), width=2)
d3.text((110, 80), 'CORSO 2: AI PRO', fill=(167, 139, 250, 255), font=font_title)

# Blocco 1: Trigger / Evento
d3.rounded_rectangle([(140, 360), (580, 680)], radius=18, fill=(15, 23, 42, 235), outline=(59, 130, 246, 255), width=2)
d3.text((180, 400), '1. EVENTO (Trigger)', fill=(96, 165, 250, 255), font=font_title)
d3.text((180, 460), '• Nuova email ricevuta\n• Nuovo file caricato\n• Scadenza oraria', fill=(226, 232, 240, 255), font=font_body)

# Freccia 1 -> 2
d3.text((610, 500), '➔', fill=(56, 189, 248, 255), font=font_huge)

# Blocco 2: Ragionamento Agente
d3.rounded_rectangle([(670, 360), (1250, 680)], radius=18, fill=(15, 23, 42, 235), outline=(168, 85, 247, 255), width=3)
d3.text((710, 400), '2. AGENTE AI (Cervello)', fill=(192, 132, 252, 255), font=font_title)
d3.text((710, 460), '• Analizza la richiesta\n• Consulta l archivio aziendale\n• Decide la soluzione corretta', fill=(226, 232, 240, 255), font=font_body)

# Freccia 2 -> 3
d3.text((1280, 500), '➔', fill=(56, 189, 248, 255), font=font_huge)

# Blocco 3: Azione Concreta
d3.rounded_rectangle([(1340, 360), (1780, 680)], radius=18, fill=(15, 23, 42, 235), outline=(34, 197, 94, 255), width=2)
d3.text((1380, 400), '3. AZIONE REALE', fill=(74, 222, 128, 255), font=font_title)
d3.text((1380, 460), '• Crea preventivo\n• Invia su Telegram/Email\n• Aggiorna il database', fill=(226, 232, 240, 255), font=font_body)
img3.save('public/overlays_pro/card_3_workflow.png')

print('Tutti gli overlay Pro generati!')
