import os

OUTPUT_HTML = "scratch/antigravity_video/LEZIONE_03_COPIONE_REGIA_STEFANO.html"

html_doc = """<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="UTF-8">
<title>Lezione 03 — Guida alla Regia & Copione Docenza per Stefano (18-20 Minuti)</title>
<style>
  @page {
    size: A4;
    margin: 12mm 12mm 12mm 12mm;
    @bottom-left {
      content: "aiutiamoci.cloud • Masterclass AI Pro — Lezione 03 (Corso 20 Ore)";
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      font-size: 7.5pt;
      color: #64748b;
    }
    @bottom-right {
      content: "Pagina " counter(page) " di " counter(pages);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      font-size: 7.5pt;
      color: #64748b;
      font-weight: bold;
    }
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    color: #0f172a;
    line-height: 1.4;
    font-size: 8.8pt;
    margin: 0;
    padding: 0;
  }

  .header {
    border-bottom: 2.5px solid #0284c7;
    padding-bottom: 8px;
    margin-bottom: 10px;
    display: table;
    width: 100%;
  }
  .header-left {
    display: table-cell;
    vertical-align: middle;
    width: 65%;
  }
  .header-right {
    display: table-cell;
    vertical-align: middle;
    text-align: right;
    width: 35%;
  }
  .brand-title {
    font-size: 13.5pt;
    font-weight: 800;
    color: #0f172a;
    letter-spacing: -0.02em;
    margin: 0;
  }
  .brand-subtitle {
    font-size: 8pt;
    color: #0284c7;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-top: 1px;
  }
  .badge-doc {
    display: inline-block;
    background: #f0fdf4;
    color: #166534;
    border: 1px solid #bbf7d0;
    font-weight: 700;
    font-size: 7.5pt;
    padding: 2px 7px;
    border-radius: 5px;
    text-transform: uppercase;
  }

  .hero-box {
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
    color: #ffffff;
    border-radius: 10px;
    padding: 12px 16px;
    margin-bottom: 10px;
    border: 1px solid #334155;
  }
  .hero-box h1 {
    font-size: 12pt;
    font-weight: 800;
    margin: 0 0 4px 0;
    color: #38bdf8;
    letter-spacing: -0.01em;
  }
  .hero-box p {
    font-size: 8.4pt;
    color: #e2e8f0;
    margin: 0;
    line-height: 1.35;
  }

  h2 {
    font-size: 10.5pt;
    color: #0f172a;
    border-bottom: 1.5px solid #e2e8f0;
    padding-bottom: 2px;
    margin-top: 12px;
    margin-bottom: 6px;
    page-break-after: avoid;
  }

  .module-card {
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    margin-bottom: 8px;
    overflow: hidden;
    page-break-inside: avoid;
    background: #ffffff;
  }
  .module-header {
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
    padding: 5px 8px;
    display: table;
    width: 100%;
    box-sizing: border-box;
  }
  .module-title {
    display: table-cell;
    font-size: 8.5pt;
    font-weight: 800;
    color: #0f172a;
  }
  .module-time {
    display: table-cell;
    text-align: right;
    font-size: 7.5pt;
    font-weight: 700;
    color: #0284c7;
  }
  .module-body {
    padding: 6px 8px;
  }

  .step-box {
    margin-bottom: 4px;
    padding: 6px 8px;
    background: #f1f5f9;
    border-left: 3px solid #0284c7;
    border-radius: 0 5px 5px 0;
  }
  .step-label {
    font-size: 7pt;
    font-weight: 800;
    text-transform: uppercase;
    color: #0369a1;
    margin-bottom: 2px;
  }
  .action-text {
    font-size: 8.2pt;
    color: #334155;
    margin-bottom: 4px;
  }
  .speech-box {
    background: #ffffff;
    border: 1px dashed #94a3b8;
    border-radius: 5px;
    padding: 6px 8px;
    font-size: 8.2pt;
    color: #0f172a;
    line-height: 1.35;
  }
  .speech-box strong {
    color: #0284c7;
  }

  .tip-box {
    background: #fffbeb;
    border: 1px solid #fef3c7;
    border-left: 3.5px solid #f59e0b;
    padding: 6px 8px;
    border-radius: 0 5px 5px 0;
    font-size: 7.8pt;
    color: #92400e;
    margin-top: 6px;
  }

  .checklist {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 6px 10px;
    margin-bottom: 8px;
  }
  .checklist ul {
    margin: 2px 0 0 0;
    padding-left: 14px;
    font-size: 7.8pt;
    color: #334155;
  }
  .checklist li {
    margin-bottom: 1px;
  }

  .page-break {
    page-break-before: always;
  }
</style>
</head>
<body>

  <!-- ==================== PAGINA 1: INTRODUZIONE & FASE 1 ==================== -->
  <div class="header">
    <div class="header-left">
      <h1 class="brand-title">LEZIONE 03: ELABORAZIONE DATI & CREAZIONE FILE CSV / EXCEL</h1>
      <div class="brand-subtitle">Masterclass AI Pro (Percorso 20 Ore) • Guida alla Regia per Stefano</div>
    </div>
    <div class="header-right">
      <span class="badge-doc">Scheda Singola • Lezione 03</span>
      <div style="font-size: 7.5pt; color: #64748b; margin-top: 1px;">Durata Stimata: 18 - 20 Minuti</div>
    </div>
  </div>

  <div class="hero-box">
    <h1>🎯 Obiettivo della Lezione: Da Testo Grezzo e Disordinato a Tabella Perfetta</h1>
    <p>
      In questa lezione mostriamo come sfruttare l'Agente per uno dei compiti più frequenti e noiosi in ogni ufficio: prendere appunti informali, note di telefonate o elenchi disordinati e trasformarli in un <strong>file CSV pulito e strutturato</strong> pronto per Excel, Google Sheets o il gestionale aziendale.
    </p>
  </div>

  <div class="checklist">
    <strong style="color: #0f172a; font-size: 8pt;">📋 Preparazione Desktop Prima di Iniziare:</strong>
    <ul>
      <li><strong>Cartella di Lavoro:</strong> Apri Antigravity sulla cartella <code>Laboratorio-AI-Pro</code>.</li>
      <li><strong>File di Esempio Preparato:</strong> Tieni sul desktop un file di testo chiamato <code>appunti_clienti_fiera.txt</code> con 4-5 contatti disordinati (nomi, cellulari, email e note sparsi).</li>
      <li><strong>Focus:</strong> Far toccare con mano quanto tempo si risparmia eliminando il copia-incolla manuale.</li>
    </ul>
  </div>

  <h2>SCALETTA OPERATIVA ESPANSA (5 FASI DA ~3.5-4 MINUTI CIASCUNA)</h2>

  <div class="module-card">
    <div class="module-header">
      <div class="module-title">FASE 1: Lo Scenario Reale — Il Problema dei Dati Disordinati</div>
      <div class="module-time">⏱️ Minuti 00:00 - 04:00</div>
    </div>
    <div class="module-body">
      <div class="step-box">
        <div class="step-label">🖥️ Cosa mostrare a schermo:</div>
        <div class="action-text">Webcam frontale di Stefano, poi mostra il file <code>appunti_clienti_fiera.txt</code> aperto con testo sparso e disordinato.</div>
        <div class="step-label">🗣️ Cosa dire a voce (Copione per Stefano):</div>
        <div class="speech-box">
          "Bentornati nella terza lezione della Masterclass AI Pro!<br><br>
          Nelle prime due lezioni abbiamo creato il nostro ambiente e addestrato l'Agente con le regole aziendali.<br><br>
          Oggi affrontiamo una situazione che capita ogni giorno in qualsiasi ufficio: torniamo da una fiera, da un incontro o abbiamo degli appunti presi al volo durante una telefonata. Guardate questo file di testo: ci sono nomi di clienti, numeri di telefono scritti con formati diversi, email e note aziendali tutti mescolati senza un ordine preciso.<br><br>
          Normalmente perderemmo mezz'ora a fare copia-incolla riga per riga dentro un foglio Excel. Oggi vediamo come l'Agente può leggere questo documento, capire quali sono i dati importanti ed esportare una tabella perfetta in meno di 5 secondi."
        </div>
      </div>
    </div>
  </div>

  <div class="page-break"></div>

  <!-- ==================== PAGINA 2: FASI 2 & 3 ==================== -->
  <div class="module-card">
    <div class="module-header">
      <div class="module-title">FASE 2: Inserire il File nella Cartella e Istruire l'Agente</div>
      <div class="module-time">⏱️ Minuti 04:00 - 08:30</div>
    </div>
    <div class="module-body">
      <div class="step-box">
        <div class="step-label">🖥️ Cosa fare a schermo:</div>
        <div class="action-text">
          1. Trascina con il mouse il file <code>appunti_clienti_fiera.txt</code> dentro la colonna sinistra di Antigravity.<br>
          2. Clicca nella chat dell'Agente e digita: <code>Leggi il file appunti_clienti_fiera.txt presente nella cartella. Estrai tutti i contatti e crea un file pulito chiamato clienti_fiera.csv con le seguenti colonne: Nome, Azienda, Email, Telefono, Interesse, Note.</code><br>
          3. Premi Invio e mostra l'Agente che legge il file (<em>Reading file</em>) e scrive il nuovo file.
        </div>
        <div class="step-label">🗣️ Cosa dire a voce (Copione per Stefano):</div>
        <div class="speech-box">
          "Guardate la semplicità: ho preso il file dal desktop e l'ho trascinato dentro la cartella di Antigravity.<br><br>
          Poi ho dato una semplice istruzione in italiano: gli ho detto di leggere gli appunti, riconoscere i contatti e creare un file <code>clienti_fiera.csv</code> specificando esattamente le colonne che ci servono: Nome, Azienda, Email, Telefono e Note.<br><br>
          Vedete cosa sta facendo l'Agente? Non sta parlando a vuoto: leggete la dicitura 'Reading file'... ha aperto il documento grezzo, lo ha scansionato e sta creando il nuovo file ordinato."
        </div>
      </div>
    </div>
  </div>

  <div class="module-card">
    <div class="module-header">
      <div class="module-title">FASE 3: Apertura e Ispezione del File CSV Generato</div>
      <div class="module-time">⏱️ Minuti 08:30 - 12:30</div>
    </div>
    <div class="module-body">
      <div class="step-box">
        <div class="step-label">🖥️ Cosa fare a schermo:</div>
        <div class="action-text">
          1. Fai clic sul nuovo file <code>clienti_fiera.csv</code> comparso nella colonna di sinistra.<br>
          2. Mostra il contenuto impaginato al centro: colonne separate da virgola, numeri di telefono uniformati e note collocate al posto giusto.
        </div>
        <div class="step-label">🗣️ Cosa dire a voce (Copione per Stefano):</div>
        <div class="speech-box">
          "Clicchiamo sul file appena creato: <code>clienti_fiera.csv</code>.<br><br>
          Guardate il risultato: ogni cliente ha la sua riga, i numeri di cellulare sono stati formattati in modo coerente, le email sono corrette e le note sono state separate ordinatamente.<br><br>
          Questo file CSV è lo standard universale del mondo digitale: potete aprirlo con un doppio click su Microsoft Excel, caricarlo su Google Sheets o importarlo direttamente nel vostro CRM aziendale senza toccare una sola virgola a mano."
        </div>
      </div>
    </div>
  </div>

  <div class="page-break"></div>

  <!-- ==================== PAGINA 3: FASI 4 & 5 ==================== -->
  <div class="module-card">
    <div class="module-header">
      <div class="module-title">FASE 4: Arricchimento dei Dati (Filtri, Categorie e Priorità)</div>
      <div class="module-time">⏱️ Minuti 12:30 - 16:30</div>
    </div>
    <div class="module-body">
      <div class="step-box">
        <div class="step-label">🖥️ Cosa fare a schermo:</div>
        <div class="action-text">
          1. Digita nella chat: <code>Aggiungi una colonna 'Priorità' al file clienti_fiera.csv: imposta 'Alta' per i clienti che chiedevano un preventivo urgente, e 'Media' o 'Bassa' per gli altri contatti informativi.</code><br>
          2. Mostra l'Agente che aggiorna il file aggiungendo la nuova colonna e classificando correttamente ogni riga.
        </div>
        <div class="step-label">🗣️ Cosa dire a voce (Copione per Stefano):</div>
        <div class="speech-box">
          "Ma possiamo fare molto di più: chiediamo all'Agente di analizzare il contesto e aggiungere un valore strategico.<br><br>
          Gli ho chiesto di aggiungere una colonna 'Priorità', riconoscendo in automatico chi ha chiesto un preventivo urgente rispetto a chi voleva solo informazioni generali.<br><br>
          Guardate: l'Agente ha ragionato sulle note del cliente, ha capito il livello di urgenza e ha categorizzato ogni riga con Priorità Alta o Media. Il lavoro di un'intera mattinata svolto in pochi secondi."
        </div>
      </div>
    </div>
  </div>

  <div class="module-card">
    <div class="module-header">
      <div class="module-title">FASE 5: Esercizio Pratico per lo Studente & Conclusione</div>
      <div class="module-time">⏱️ Minuti 16:30 - 19:30</div>
    </div>
    <div class="module-body">
      <div class="step-box">
        <div class="step-label">🖥️ Cosa mostrare a schermo:</div>
        <div class="action-text">Mostra la cartella con i file ordinati e passa alla webcam frontale per il saluto finale.</div>
        <div class="step-label">🗣️ Cosa dire a voce (Copione per Stefano):</div>
        <div class="speech-box">
          "Avete visto quanto è potente un Agente quando lo applichiamo a compiti pratici e quotidiani.<br><br>
          <strong>Il vostro compito per oggi</strong>:<br>
          1. Create un piccolo file di testo con 3 o 4 contatti fittizi disordinati.<br>
          2. Chiedete all'Agente di estrarli e creare un file <code>.csv</code> pulito.<br>
          3. Apritelo con Excel o Google Sheets per verificare l'impaginazione.<br><br>
          Nella <strong>Lezione 4</strong> faremo il nostro primo <strong>Checkpoint Pratico</strong>: consolideremo tutto quello che abbiamo visto finora con un test completo prima di passare al mondo delle API e delle automazioni esterne!<br><br>
          Buon lavoro e ci vediamo alla prossima lezione!"
        </div>
      </div>
    </div>
  </div>

  <div class="tip-box">
    <strong>💡 Consiglio di Regia per Stefano:</strong> Fai notare con orgoglio la pulizia del file CSV aperto nell'editor! Questo fa capire all'imprenditore o al professionista che l'AI risolve problemi concreti d'ufficio e non è solo un passatempo tecnologico.
  </div>

</body>
</html>
"""

with open(OUTPUT_HTML, "w", encoding="utf-8") as f:
    f.write(html_doc)

print("📄 File HTML Lezione 03 (18-20 Min) creato con successo!")
