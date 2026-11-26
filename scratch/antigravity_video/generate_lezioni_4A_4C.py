import os

OUTPUT_DIR = "scratch/antigravity_video"

CSS_STYLE = """
  @page {
    size: A4;
    margin: 12mm 12mm 12mm 12mm;
  }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    color: #0f172a;
    line-height: 1.45;
    font-size: 9.2pt;
    margin: 0;
    padding: 0;
  }
  .header {
    border-bottom: 2.5px solid #6366f1;
    padding-bottom: 10px;
    margin-bottom: 14px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .brand-title { font-size: 14pt; font-weight: 800; color: #0f172a; margin: 0; }
  .brand-subtitle { font-size: 8.5pt; color: #475569; margin: 2px 0 0 0; }
  .badge {
    display: inline-block;
    background: #eef2ff;
    color: #4338ca;
    border: 1px solid #c7d2fe;
    border-radius: 999px;
    padding: 4px 10px;
    font-size: 8pt;
    font-weight: 700;
  }
  .goal-box {
    background: #f8fafc;
    border: 1px solid #cbd5e1;
    border-left: 4px solid #6366f1;
    border-radius: 8px;
    padding: 10px 12px;
    margin-bottom: 12px;
  }
  .goal-box h3 { margin: 0 0 4px 0; font-size: 9.5pt; color: #312e81; }
  .prep-box {
    background: #fffbeb;
    border: 1px solid #fde68a;
    border-radius: 8px;
    padding: 8px 12px;
    margin-bottom: 14px;
  }
  .prep-box h3 { margin: 0 0 4px 0; font-size: 9pt; color: #92400e; }
  .prep-box ul { margin: 0; padding-left: 18px; }
  .module-card {
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    margin-bottom: 12px;
    overflow: hidden;
    page-break-inside: avoid;
  }
  .module-header {
    background: #0f172a;
    color: #f8fafc;
    padding: 8px 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .module-title { font-weight: 700; font-size: 9.5pt; }
  .module-time { font-size: 8pt; color: #38bdf8; font-weight: 600; }
  .module-body { padding: 10px 12px; background: #ffffff; }
  .step-label { font-size: 8pt; font-weight: 700; color: #0284c7; margin-bottom: 3px; text-transform: uppercase; }
  .action-text { font-size: 8.8pt; color: #1e293b; margin-bottom: 8px; }
  .speech-box {
    background: #f8fafc;
    border: 1px dashed #cbd5e1;
    border-radius: 6px;
    padding: 8px 10px;
    font-size: 8.8pt;
    color: #0f172a;
  }
  .tip-box {
    background: #ecfdf5;
    border: 1px solid #a7f3d0;
    border-radius: 8px;
    padding: 10px 12px;
    font-size: 8.8pt;
    color: #065f46;
    margin-top: 10px;
  }
  code {
    background: #e2e8f0;
    padding: 1px 4px;
    border-radius: 4px;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 8.2pt;
  }
"""

LEZIONI = [
    {
        "num": "4A",
        "title": "SKILLS & AUTOMAZIONI RIPETIBILI IN ANTIGRAVITY (SKILL.MD)",
        "badge": "Lezione 4A • Antigravity Skills",
        "goal": "Trasformare una procedura aziendale ripetitiva (report settimanale, analisi preventivi, check email) in una Skill permanente (.gemini/skills/nome/SKILL.md) riutilizzabile con un solo comando.",
        "prep": [
            "Cartella di progetto aperta in Google Antigravity IDE",
            "2 file di appunti grezzi di esempio (es. note_lunedi.txt, note_venerdi.txt)",
            "Mostrare differenza tra scrivere un prompt lungo ogni volta vs richiamare una Skill"
        ],
        "fasi": [
            {
                "titolo": "FASE 1: Il Limite dei Prompt Ripetuti Ogni Giorno",
                "time": "Minuti 00:00 - 04:00",
                "screen": "Webcam frontale di Stefano, poi mostra Antigravity IDE aperto su una cartella di lavoro.",
                "speech": "\"Bentornati nella lezione 4A della Masterclass AI Pro! Nelle prime 4 lezioni abbiamo visto le basi di Antigravity e il file AGENTS.md. Oggi facciamo un salto di qualità: impariamo a creare le <strong>Skills</strong>.<br><br>Pensate a un compito che fate ogni settimana: leggere gli appunti sparsi, controllare i numeri e scrivere il report del venerdì. Se ogni volta riscrivete un prompt da 20 righe, perdete tempo e ottenete risultati sempre diversi. Con una <strong>Skill</strong> insegnate la procedura all'IDE una volta sola, per sempre.\""
            },
            {
                "titolo": "FASE 2: Creare la Prima Skill (SKILL.md) nell'IDE",
                "time": "Minuti 04:00 - 09:00",
                "screen": "1. Chiedi all'agente in Antigravity di creare `.gemini/skills/report-settimanale/SKILL.md`.<br>2. Mostra i 3 blocchi del file: name/description (quando usarla), Passaggi Esatti, Formato di Output.",
                "speech": "\"Creiamo la nostra cartella <code>.gemini/skills/report-settimanale/</code> con dentro il file <code>SKILL.md</code>. Guardate com'è semplice: in cima mettiamo nome e descrizione (così l'agente capisce quando attivarla), poi elenchiamo i 3 passaggi esatti e il formato finale della tabella.<br><br>Da questo momento, ogni volta che apriamo questo progetto, la Skill è nel DNA dell'agente.\""
            },
            {
                "titolo": "FASE 3: Esecuzione dal Vivo su File Reali",
                "time": "Minuti 09:00 - 14:30",
                "screen": "1. Scrivi in chat: 'Usa la skill report-settimanale sui file nella cartella note/'.<br>2. Mostra l'agente che legge automaticamente SKILL.md, analizza i file e produce `REPORT_SETTIMANALE.md` perfetto.",
                "speech": "\"Mettiamola subito alla prova! Scrivo semplicemente: <em>'Prepara il report settimanale dai file in note/'</em>. Guardate cosa fa Antigravity: riconosce la Skill, la legge in automatico, applica le nostre regole e genera il report identico al nostro standard aziendale.\""
            },
            {
                "titolo": "FASE 4: Esercizio & Ponte verso la Lezione 4B",
                "time": "Minuti 14:30 - 18:00",
                "screen": "Webcam frontale con riepilogo della cartella `.gemini/skills/`.",
                "speech": "\"<strong>Esercizio pratico:</strong> scegliete un lavoro ripetitivo del vostro ufficio (es. sintesi riunione o controllo fatture) e fatelo trasformare da Antigravity in una Skill.<br><br>Nella prossima lezione (<strong>4B</strong>) vedremo come far lavorare <strong>più agenti insieme in parallelo</strong> e collegare Antigravity a strumenti esterni con gli <strong>MCP Server</strong>!\""
            }
        ],
        "takeaways": [
            "Differenza tra prompt usa-e-getta e Skill riutilizzabile salvata in .gemini/skills/ (SKILL.md).",
            "Struttura di una Skill efficace: trigger di attivazione, istruzioni passo-passo e template di output.",
            "Condivisione delle Skill nel team per garantire lo stesso standard operativo."
        ],
        "exercise": "Crea .gemini/skills/riepilogo-settimanale/SKILL.md in Antigravity e genera un report standardizzato partendo da 2 file di appunti."
    },
    {
        "num": "4B",
        "title": "SUBAGENTI, LAVORO PARALLELO & MCP SERVER NELL'IDE",
        "badge": "Lezione 4B • Multi-Agente & MCP",
        "goal": "Orchestrare più subagenti specializzati (Ricercatore, Esecutore, Revisore) dentro Antigravity e collegare l'IDE a servizi esterni reali tramite MCP Server e Browser.",
        "prep": [
            "Progetto aperto in Antigravity IDE",
            "Esempio di task complesso (es. analisi di 5 documenti + controllo qualità)",
            "Mostrare la sezione MCP / Tool esterni nelle impostazioni di Antigravity"
        ],
        "fasi": [
            {
                "titolo": "FASE 1: Perché Un Solo Agente Non Basta sui Task Complessi",
                "time": "Minuti 00:00 - 04:30",
                "screen": "Webcam frontale + schema visivo: Direttore -> Subagente 1 (Ricerca) + Subagente 2 (Scrittura) -> Revisore.",
                "speech": "\"Bentornati nella lezione 4B! Quando chiedete a un solo agente di fare 10 cose insieme — cercare dati, scrivere un documento lungo e controllarne gli errori — tende a perdere pezzi.<br><br>Oggi vediamo come usare i <strong>Subagenti</strong> dentro Antigravity: un agente principale fa da Direttore e delega pezzi separati a collaboratori specializzati, poi controlla il risultato finale.\""
            },
            {
                "titolo": "FASE 2: Lanciare Subagenti in Parallelo & Revisore Indipendente",
                "time": "Minuti 04:30 - 10:30",
                "screen": "Mostra in Antigravity un prompt di delega: 'Analizza questi file con un subagente ricercatore e poi fai verificare i numeri da un secondo agente revisore'.",
                "speech": "\"Guardate in diretta: chiedo ad Antigravity di dividere il lavoro. Un subagente legge e riassume i file senza sporcare la conversazione principale, mentre un altro verifica che non ci siano numeri mancanti.<br><br>È il segreto per avere output di qualità professionale.\""
            },
            {
                "titolo": "FASE 3: Connettere Antigravity al Mondo Esterno (MCP & Browser)",
                "time": "Minuti 10:30 - 16:00",
                "screen": "Mostra la lista MCP Server / Browser subagent nell'IDE: lettura pagina web o interrogazione database direttamente da chat.",
                "speech": "\"Ma Antigravity non lavora solo sui file del PC: tramite i server <strong>MCP (Model Context Protocol)</strong> e l'agente <strong>Browser</strong>, potete collegarlo al vostro database, ai fogli online o fargli aprire e testare un sito web dal vivo!\""
            },
            {
                "titolo": "FASE 4: Esercizio & Ponte verso la Lezione 4C",
                "time": "Minuti 16:00 - 20:00",
                "screen": "Webcam frontale.",
                "speech": "\"<strong>Esercizio:</strong> provate a chiedere ad Antigravity di usare un subagente per analizzare una cartella e un secondo passaggio di revisione.<br><br>Nella lezione <strong>4C</strong> uniremo tutto: useremo Antigravity per <strong>generare agenti, script e interi workflow JSON da incollare su n8n</strong>!\""
            }
        ],
        "takeaways": [
            "Pattern Direttore -> Subagente -> Controllo per ridurre errori e mantenere pulito il contesto.",
            "Collegare Antigravity a database, fogli e servizi tramite MCP Server.",
            "Uso del subagente Browser per verificare pagine web e interfacce dal vivo."
        ],
        "exercise": "Lancia un flusso con delega a subagente in Antigravity: uno estrae i punti chiave da un file e un controllo finale verifica che non manchi nulla."
    },
    {
        "num": "4C",
        "title": "DA ANTIGRAVITY A N8N: CREARE AGENTI, SCRIPT & WORKFLOW JSON",
        "badge": "Lezione 4C • Ponte IDE -> n8n",
        "goal": "Usare Antigravity IDE come fabbrica per generare e testare script locali, mini-tool web e workflow JSON completi pronti da incollare direttamente sulla canvas di n8n.",
        "prep": [
            "Antigravity IDE aperto",
            "Una finestra browser aperta su n8n con un workflow vuoto",
            "Mostrare Copia/Incolla di un JSON generato da Antigravity dentro n8n"
        ],
        "fasi": [
            {
                "titolo": "FASE 1: Antigravity come Fabbrica di Agenti e Automazioni",
                "time": "Minuti 00:00 - 04:00",
                "screen": "Webcam frontale di Stefano, poi schermata divisa: Antigravity a sinistra, n8n vuoto a destra.",
                "speech": "\"Benvenuti nella lezione 4C, il ponte finale del blocco Antigravity! Finora abbiamo visto cosa fa l'IDE sui vostri file. Da dalla prossima lezione entreremo nelle API e in n8n.<br><br>Ma prima vi mostro il superpotere più sottovalutato: potete usare <strong>Antigravity per progettare, generare e testare gli script e gli stessi workflow di n8n</strong> in pochi secondi!\""
            },
            {
                "titolo": "FASE 2: Generare uno Script / Mini-Agente Locale in 60 Secondi",
                "time": "Minuti 04:00 - 09:30",
                "screen": "Chiedi ad Antigravity: 'Crea uno script Python che legge tutti i CSV nella cartella e calcola il totale fatturato per cliente'. Esegui nel terminale integrato.",
                "speech": "\"Chiediamo all'agente di scriverci uno script Python su misura per un'esigenza reale d'ufficio. Lui crea il file, lo lancia nel terminale e verifica che il risultato sia esatto — zero codice scritto a mano da noi.\""
            },
            {
                "titolo": "FASE 3: Generare un Workflow n8n Completo in JSON e Incollarlo",
                "time": "Minuti 09:30 - 15:30",
                "screen": "1. Chiedi ad Antigravity: 'Generami il JSON per n8n con Webhook POST + nodo Set che estrae cliente ed email'.<br>2. Copia il JSON.<br>3. Vai su n8n vuoto e premi Cmd+V / Ctrl+V: i nodi compaiono subito.",
                "speech": "\"Adesso guardate questa magia: chiedo ad Antigravity il JSON di un flusso n8n. Lo copio, clicco nello spazio vuoto di n8n e premo Incolla... <strong>ecco i nodi già montati e collegati!</strong><br><br>E quando in futuro avrete un errore su n8n, vi basterà incollarlo in Antigravity per avere subito la soluzione.\""
            },
            {
                "titolo": "FASE 4: Esercizio & Lancio Blocco API / n8n (Lezione 5)",
                "time": "Minuti 15:30 - 19:00",
                "screen": "Webcam frontale.",
                "speech": "\"<strong>Esercizio:</strong> fate generare ad Antigravity il JSON di un piccolo workflow n8n (Trigger + Set) e tenetelo pronto.<br><br>Dalla <strong>Lezione 5</strong> scopriremo cosa sono le <strong>API</strong> e cominceremo a costruire le automazioni cloud h24!\""
            }
        ],
        "takeaways": [
            "Far scrivere e verificare script Python/Node e mini-tool direttamente ad Antigravity.",
            "Generare workflow n8n in JSON dall'IDE e importarli con Copia/Incolla sulla canvas.",
            "Usare Antigravity come assistente di debug quando un flusso o un'API restituisce errore."
        ],
        "exercise": "Chiedi ad Antigravity il JSON di un workflow n8n (Webhook POST + Edit Fields) e incollalo in un workflow vuoto su n8n."
    }
]

os.makedirs(OUTPUT_DIR, exist_ok=True)

for lez in LEZIONI:
    num = lez["num"]
    # 1. Guida Regia Stefano HTML
    fasi_html = ""
    for f in lez["fasi"]:
        fasi_html += f"""
        <div class="module-card">
          <div class="module-header">
            <div class="module-title">{f['titolo']}</div>
            <div class="module-time">{f['time']}</div>
          </div>
          <div class="module-body">
            <div class="step-label">Cosa mostrare a schermo</div>
            <div class="action-text">{f['screen']}</div>
            <div class="step-label">Cosa dire a voce (Copione Stefano)</div>
            <div class="speech-box">{f['speech']}</div>
          </div>
        </div>"""

    prep_html = "".join(f"<li>{p}</li>" for p in lez["prep"])
    regia_html = f"""<!DOCTYPE html>
<html lang="it">
<head><meta charset="UTF-8"><title>Lezione {num} — Guida Regia Stefano</title><style>{CSS_STYLE}</style></head>
<body>
  <div class="header">
    <div>
      <h1 class="brand-title">Lezione {num} — {lez['title']}</h1>
      <p class="brand-subtitle">AIutiamoci • Masterclass AI Pro • Guida alla Regia per Stefano</p>
    </div>
    <div class="badge">{lez['badge']}</div>
  </div>
  <div class="goal-box"><h3>Obiettivo della Lezione</h3><div>{lez['goal']}</div></div>
  <div class="prep-box"><h3>Prima di iniziare a registrare</h3><ul>{prep_html}</ul></div>
  {fasi_html}
  <div class="tip-box"><strong>Consiglio di Regia:</strong> Mostra chiaramente ogni click dentro Antigravity IDE (file creati a sinistra, chat dell'agente a destra).</div>
</body>
</html>"""
    with open(os.path.join(OUTPUT_DIR, f"LEZIONE_{num}_COPIONE_REGIA_STEFANO.html"), "w", encoding="utf-8") as fp:
        fp.write(regia_html)

    # 2. Dispensa Studenti HTML
    takeaways_html = "".join(f"<li style='margin-bottom:6px'>{t}</li>" for t in lez["takeaways"])
    dispensa_html = f"""<!DOCTYPE html>
<html lang="it">
<head><meta charset="UTF-8"><title>Dispensa Modulo {num} — AI Pro</title><style>{CSS_STYLE}</style></head>
<body>
  <div class="header">
    <div>
      <h1 class="brand-title">Modulo {num} — {lez['title']}</h1>
      <p class="brand-subtitle">AIutiamoci Academy • Masterclass AI Pro • Dispensa Operativa</p>
    </div>
    <div class="badge">{lez['badge']}</div>
  </div>
  <div class="goal-box"><h3>Cosa imparerai in questo modulo</h3><div>{lez['goal']}</div></div>
  <div class="module-card">
    <div class="module-header"><div class="module-title">Punti Chiave Operativi</div><div class="module-time">AI Pro</div></div>
    <div class="module-body"><ul style="margin:0;padding-left:18px">{takeaways_html}</ul></div>
  </div>
  <div class="prep-box">
    <h3>Esercizio Pratico Consigliato</h3>
    <div>{lez['exercise']}</div>
  </div>
  <div class="tip-box"><strong>AIutiamoci Academy</strong> — Umani nel pensiero. Smart nell'azione. • https://aiutiamoci.cloud</div>
</body>
</html>"""
    with open(os.path.join(OUTPUT_DIR, f"DISPENSA_PRO_MODULO_{num}.html"), "w", encoding="utf-8") as fp:
        fp.write(dispensa_html)

print("Generated HTML files for 4A, 4B, 4C.")
