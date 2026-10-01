import os

OUTPUT_HTML = "scratch/antigravity_video/LEZIONE_04_COPIONE_REGIA_STEFANO.html"

html_doc = """<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="UTF-8">
<title>Lezione 04 — Checkpoint 1 Pratico & Consolidamento (Stefano)</title>
<style>
  @page {
    size: A4;
    margin: 12mm 12mm 12mm 12mm;
    @bottom-left {
      content: "aiutiamoci.cloud • Masterclass AI Pro — Lezione 04 (Checkpoint 1)";
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
    background: #fef2f2;
    color: #991b1b;
    border: 1px solid #fecaca;
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
    color: #f59e0b;
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
      <h1 class="brand-title">LEZIONE 04: CHECKPOINT 1 — L'AGENTE PERSONALE OPERATIVO</h1>
      <div class="brand-subtitle">Masterclass AI Pro (Percorso 20 Ore) • Guida alla Regia per Stefano</div>
    </div>
    <div class="header-right">
      <span class="badge-doc">🏁 Checkpoint 1 • Lezione 04</span>
      <div style="font-size: 7.5pt; color: #64748b; margin-top: 1px;">Durata Stimata: 18 - 20 Minuti</div>
    </div>
  </div>

  <div class="hero-box">
    <h1>🏁 Obiettivo del Checkpoint 1: Consolidamento e Primo Traguardo Raggiunto</h1>
    <p>
      In questa lezione facciamo una verifica a 360° di quanto appreso nelle prime 3 lezioni. Guidiamo lo studente in una <strong>simulazione aziendale completa end-to-end</strong> (creazione nuovo progetto, personalizzazione regole, elaborazione documento ed esportazione report finale) prima di passare al Modulo 2 dedicato a Modelli, API e n8n.
    </p>
  </div>

  <div class="checklist">
    <strong style="color: #0f172a; font-size: 8pt;">📋 Preparazione Desktop Prima di Iniziare:</strong>
    <ul>
      <li><strong>Scopo della Lezione:</strong> Rassicurare lo studente, far recap delle competenze acquisite e celebrare la prima vittoria!</li>
      <li><strong>File da Preparare:</strong> Una seconda cartella di test chiamata <code>Progetto-Azienda-Test</code> per mostrare l'autonomia da zero.</li>
      <li><strong>Tono di Stefano:</strong> Motivante, empatico e festoso per il primo traguardo del percorso.</li>
    </ul>
  </div>

  <h2>SCALETTA OPERATIVA ESPANSA (5 FASI DA ~3.5-4 MINUTI CIASCUNA)</h2>

  <div class="module-card">
    <div class="module-header">
      <div class="module-title">FASE 1: Celebrazione del 1° Traguardo & Riepilogo Competenze</div>
      <div class="module-time">⏱️ Minuti 00:00 - 04:00</div>
    </div>
    <div class="module-body">
      <div class="step-box">
        <div class="step-label">🖥️ Cosa mostrare a schermo:</div>
        <div class="action-text">Webcam frontale di Stefano, con grafica o slide che elenca i 3 risultati già sbloccati.</div>
        <div class="step-label">🗣️ Cosa dire a voce (Copione per Stefano):</div>
        <div class="speech-box">
          "Complimenti a tutti! Siamo arrivati alla quarta lezione e al nostro primo <strong>Checkpoint Ufficiale</strong> della Masterclass AI Pro.<br><br>
          Fermiamoci un secondo a guardare cosa avete già imparato a fare in pochissimo tempo:<br>
          1. Avete allestito una vera cabina di regia professionale con Antigravity.<br>
          2. Avete blindato il vostro Agente con il file <code>AGENTS.md</code> evitando allucinazioni e imponendo il controllo umano.<br>
          3. Siete capaci di fargli leggere appunti disordinati ed estrarre tabelle CSV perfette per Excel in 5 secondi.<br><br>
          Oggi facciamo una prova generale: partiamo da zero e mettiamo alla prova il vostro Agente su un caso reale completo!"
        </div>
      </div>
    </div>
  </div>

  <div class="page-break"></div>

  <!-- ==================== PAGINA 2: FASI 2 & 3 ==================== -->
  <div class="module-card">
    <div class="module-header">
      <div class="module-title">FASE 2: La Sfida Pratica — Creare un Ufficio per un Nuovo Settore</div>
      <div class="module-time">⏱️ Minuti 04:00 - 08:30</div>
    </div>
    <div class="module-body">
      <div class="step-box">
        <div class="step-label">🖥️ Cosa fare a schermo:</div>
        <div class="action-text">
          1. Crea una cartella <code>Consulenza-Immobiliare</code> sul desktop e aprila in Antigravity.<br>
          2. Scrivi all'Agente: <code>Sei l'assistente operativo dell'Agenzia Immobiliare Domus. Crea il file AGENTS.md con regole per rispondere a potenziali acquirenti, classificare gli immobili per budget e richiedere sempre conferma prima di inviare preventivi.</code><br>
          3. Mostra la generazione immediata del file di regole specializzato.
        </div>
        <div class="step-label">🗣️ Cosa dire a voce (Copione per Stefano):</div>
        <div class="speech-box">
          "Immaginiamo di voler creare un assistente per un settore completamente diverso, ad esempio un'agenzia immobiliare o uno studio professionale.<br><br>
          Creo una nuova cartella 'Consulenza-Immobiliare', la apro in Antigravity e chiedo all'Agente di redigere le sue regole operative specializzate per gestire richieste di acquisto e budget degli immobili.<br><br>
          Vedete la straordinaria flessibilità? Cambiando semplicemente la cartella e le regole di <code>AGENTS.md</code>, potete trasformare il vostro computer in un ufficio commerciale, un reparto marketing o un ufficio acquisti dedicato a qualsiasi attività!"
        </div>
      </div>
    </div>
  </div>

  <div class="module-card">
    <div class="module-header">
      <div class="module-title">FASE 3: Elaborazione e Creazione del Report di Sintesi</div>
      <div class="module-time">⏱️ Minuti 08:30 - 12:30</div>
    </div>
    <div class="module-body">
      <div class="step-box">
        <div class="step-label">🖥️ Cosa fare a schermo:</div>
        <div class="action-text">
          1. Inserisci un file <code>richieste_clienti_immobili.txt</code> con 3 messaggi di clienti (zone cercate, budget, urgenza).<br>
          2. Chiedi all'Agente: <code>Analizza le richieste e crea un file report_settimanale.md con una tabella comparativa e una stima del valore totale delle trattative.</code><br>
          3. Mostra l'Agente che calcola il totale numerico e genera il report impaginato in Markdown.
        </div>
        <div class="step-label">🗣️ Cosa dire a voce (Copione per Stefano):</div>
        <div class="speech-box">
          "Trasciniamo dentro le richieste grezze arrivate via WhatsApp dai clienti.<br><br>
          Chiediamo all'Agente non solo di estrarre i dati, ma di redigere un <strong>report esecutivo</strong> con tabella comparativa e somma economica dei budget.<br><br>
          Guardate il documento <code>report_settimanale.md</code>: ha calcolato i totali, organizzato i clienti per priorità e preparato un briefing perfetto da presentare al titolare o ai colleghi in riunione."
        </div>
      </div>
    </div>
  </div>

  <div class="page-break"></div>

  <!-- ==================== PAGINA 3: FASI 4 & 5 (SUPERAMENTO CHECKPOINT) ==================== -->
  <div class="module-card">
    <div class="module-header">
      <div class="module-title">FASE 4: Risoluzione Dubbi Frequenti & Troubleshooting Rapido</div>
      <div class="module-time">⏱️ Minuti 12:30 - 16:30</div>
    </div>
    <div class="module-body">
      <div class="step-box">
        <div class="step-label">🖥️ Cosa mostrare a schermo:</div>
        <div class="action-text">Mostra come rimediare a piccoli errori (es. cosa fare se un file non si apre o se l'Agente sbaglia una colonna).</div>
        <div class="step-label">🗣️ Cosa dire a voce (Copione per Stefano):</div>
        <div class="speech-box">
          "Cosa fare se durante il lavoro qualcosa non va come previsto?<br><br>
          • <strong>Se l'Agente sbaglia una colonna o dimentica un dato</strong>: non cancellate il file a mano! Scrivetegli semplicemente: <em>'Hai dimenticato la colonna Telefono, aggiorna il file aggiungendola'</em>.<br>
          • <strong>Se l'Agente scrive troppo testo</strong>: ricordategli la regola: <em>'Rileggi AGENTS.md e dammi la risposta sintetica a tabella'</em>.<br><br>
          Con l'Intelligenza Artificiale non serve ripartire da capo: basta dialogare con precisione ed iterare sul risultato."
        </div>
      </div>
    </div>
  </div>

  <div class="module-card">
    <div class="module-header">
      <div class="module-title">FASE 5: Superamento Checkpoint 1 & Lancio del Blocco API (Lezione 5)</div>
      <div class="module-time">⏱️ Minuti 16:30 - 19:30</div>
    </div>
    <div class="module-body">
      <div class="step-box">
        <div class="step-label">🖥️ Cosa mostrare a schermo:</div>
        <div class="action-text">Webcam frontale con grafica celebrativa del Checkpoint 1 completato.</div>
        <div class="step-label">🗣️ Cosa dire a voce (Copione per Stefano):</div>
        <div class="speech-box">
          "Abbiamo completato ufficialmente il <strong>Pilastro 1 della Masterclass AI Pro</strong>!<br><br>
          Da questo momento avete in mano le competenze fondamentali per creare assistenti dedicati a qualsiasi cartella o progetto aziendale.<br><br>
          Dalla <strong>Lezione 5</strong> entriamo nel vivo del <strong>Pilastro 2</strong>: scopriremo cosa sono le <strong>API</strong> (il ponte magico per collegare l'AI al resto del mondo), come ottenere le chiavi gratuite di Google AI Studio (Gemini Flash) e come blindare i costi su OpenAI impostando un tetto massimo di 5€ per lavorare in totale sicurezza aziendale.<br><br>
          Bravissimi tutti, completate l'esercizio e ci vediamo alla prossima lezione!"
        </div>
      </div>
    </div>
  </div>

  <div class="tip-box">
    <strong>💡 Consiglio di Regia per Stefano:</strong> Festeggia questo momento! Il Checkpoint 1 dà allo studente la prima grande sensazione di successo concreto e lo carica di entusiasmo per il passaggio alle API e alle automazioni n8n.
  </div>

</body>
</html>
"""

with open(OUTPUT_HTML, "w", encoding="utf-8") as f:
    f.write(html_doc)

print("📄 File HTML Lezione 04 (Checkpoint 1 - 18-20 Min) creato con successo!")
