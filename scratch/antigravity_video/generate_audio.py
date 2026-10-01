import asyncio
import edge_tts
import os
import subprocess
import json

OUTPUT_DIR = "scratch/antigravity_video"
VOICE = "it-IT-DiegoNeural" # Voce maschile italiana naturale e carismatica

# Script delle scene con testo parlato e titoli grafici
SCENES = [
    {
        "id": "scene_01",
        "title": "BENVENUTI IN ANTIGRAVITY",
        "subtitle": "L'Ambiente di Sviluppo Potenziato dall'Intelligenza Artificiale",
        "badge": "MODULO 1 • PRIMI PASSI",
        "voice_text": "Benvenuti su Antigravity. Oggi vediamo insieme come impostare l'ambiente di lavoro ideale per collaborare a quattro mani con l'intelligenza artificiale.",
        "icon": "🚀",
        "details": [
            "Pair-programming avanzato con AI Agents",
            "Controllo totale del codice e dei file di progetto",
            "Automazione dei test, build e deploy con un click"
        ]
    },
    {
        "id": "scene_02",
        "title": "LA CABINA DI REGIA",
        "subtitle": "Spazio di Lavoro Unificato e Navigazione Chirurgica",
        "badge": "INTERFACCIA & TOOLS",
        "voice_text": "All'apertura di Antigravity troviamo una cabina di regia completa. A sinistra l'albero dei file, al centro l'editor di testo, e sulla destra la chat agentica sempre attiva.",
        "icon": "⚡",
        "details": [
            "File Explorer con supporto multi-workspace",
            "Terminali persistenti integrati in zsh",
            "Memoria di contesto e Secondo Cervello condiviso"
        ]
    },
    {
        "id": "scene_03",
        "title": "I COMANDI FONDAMENTALI",
        "subtitle": "Come Istruire l'Agente Senza Confusione",
        "badge": "WORKFLOW OPERATIVO",
        "voice_text": "Per ottenere il massimo basta usare i comandi chiave: barra plan per pianificare prima di toccare il codice, e la menzione dei file per lavorare in modo chirurgico e sicuro.",
        "icon": "🎯",
        "details": [
            "/plan : Crea il piano d'azione prima delle modifiche",
            "/goal : Esecuzione autonoma di task complessi",
            "Zero rischio di modifiche incontrollate"
        ]
    },
    {
        "id": "scene_04",
        "title": "PRONTI A PARTIRE",
        "subtitle": "Inizia Subito il Tuo Prossimo Progetto",
        "badge": "ACCADEMIA & RISORSE",
        "voice_text": "Ora il tuo ambiente è configurato e pronto. Nei prossimi moduli vedremo come creare applicazioni web, automazioni aziendali ed agenti autonomi.",
        "icon": "🏆",
        "details": [
            "Dispense e cheat-sheet scaricabili in PDF",
            "Supporto continuativo nella community Telegram",
            "Prossima lezione: Tecniche avanzate di Prompting"
        ]
    }
]

async def generate_audio():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    for s in SCENES:
        audio_path = os.path.join(OUTPUT_DIR, f"{s['id']}.mp3")
        print(f"🎙️ Generazione audio neurale per {s['id']}...")
        communicate = edge_tts.Communicate(s['voice_text'], VOICE, rate="+5%")
        await communicate.save(audio_path)
        
        # Misura durata con ffprobe
        cmd = f"ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 {audio_path}"
        dur = float(subprocess.check_output(cmd, shell=True).decode().strip())
        s['duration'] = dur + 1.2 # aggiunge 1.2s di respiro per la transizione grafica
        print(f"   Durata audio: {dur:.2f}s -> Scena calibrata a: {s['duration']:.2f}s")

if __name__ == "__main__":
    asyncio.run(generate_audio())
    with open(os.path.join(OUTPUT_DIR, "scenes.json"), "w") as f:
        json.dump(SCENES, f, indent=2)
    print("✅ Generazione audio completata!")
