import os

OUTPUT_HTML = "scratch/antigravity_video/LEZIONE_02_COPIONE_REGIA_STEFANO.html"

html_doc = """<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="UTF-8">
<title>Lezione 02 — Guida alla Regia & Copione Docenza per Stefano</title>
<style>
  @page {
    size: A4;
    margin: 14mm 13mm 14mm 13mm;
    @bottom-left {
      content: "aiutiamoci.cloud • Masterclass AI Pro — Lezione 02";
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      font-size: 8pt;
      color: #64748b;
    }
    @bottom-right {
      content: "Pagina " counter(page) " di " counter(pages);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      font-size: 8pt;
      color: #64748b;
      font-weight: bold;
    }
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    color: #0f172a;
    line-height: 1.45;
    font-size: 9pt;
    margin: 0;
    padding: 0;
  }

  .header {
    border-bottom: 2.5px solid #0284c7;
    padding-bottom: 10px;
    margin-bottom: 14px;
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
    font-size: 14pt;
    font-weight: 800;
    color: #0f172a;
    letter-spacing: -0.02em;
    margin: 0;
  }
  .brand-subtitle {
    font-size: 8.5pt;
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
    padding: 3px 8px;
    border-radius: 6px;
    text-transform: uppercase;
  }

  .hero-box {
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
    color: #ffffff;
    border-radius: 10px;
    padding: 14px 18px;
    margin-bottom: 14px;
    border: 1px solid #334155;
  }
  .hero-box h1 {
    font-size: 13pt;
    font-weight: 800;
    margin: 0 0 4px 0;
    color: #38bdf8;
    letter-spacing: -0.01em;
  }
  .hero-box p {
    font-size: 8.6pt;
    color: #e2e8f0;
    margin: 0;
    line-height: 1.4;
  }

  h2 {
    font-size: 11pt;
    color: #0f172a;
    border-bottom: 1.5px solid #e2e8f0;
    padding-bottom: 3px;
    margin-top: 16px;
    margin-bottom: 8px;
    page-break-after: avoid;
  }

  .module-card {
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    margin-bottom: 12px;
    overflow: hidden;
    page-break-inside: avoid;
    background: #ffffff;
  }
  .module-header {
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
    padding: 6px 10px;
    display: table;
    width: 100%;
    box-sizing: border-box;
  }
  .module-title {
    display: table-cell;
    font-size: 9pt;
    font-weight: 800;
    color: #0f172a;
  }
  .module-time {
    display: table-cell;
    text-align: right;
    font-size: 8pt;
    font-weight: 700;
    color: #0284c7;
  }
  .module-body {
    padding: 8px 10px;
  }

  .step-box {
    margin-bottom: 6px;
    padding: 8px 10px;
    background: #f1f5f9;
    border-left: 3.5px solid #0284c7;
    border-radius: 0 6px 6px 0;
  }
  .step-label {
    font-size: 7.5pt;
    font-weight: 800;
    text-transform: uppercase;
    color: #0369a1;
    margin-bottom: 2px;
  }
  .action-text {
    font-size: 8.5pt;
    color: #334155;
    margin-bottom: 5px;
  }
  .speech-box {
    background: #ffffff;
    border: 1px dashed #94a3b8;
    border-radius: 6px;
    padding: 8px 10px;
    font-size: 8.5pt;
    color: #0f172a;
    line-height: 1.4;
  }
  .speech-box strong {
    color: #0284c7;
  }

  .tip-box {
    background: #fffbeb;
    border: 1px solid #fef3c7;
    border-left: 3.5px solid #f59e0b;
    padding: 8px 10px;
    border-radius: 0 6px 6px 0;
    font-size: 8pt;
    color: #92400e;
    margin-top: 10px;
  }

  .checklist {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 8px 12px;
    margin-bottom: 12px;
  }
  .checklist ul {
    margin: 3px 0 0 0;
    padding-left: 16px;
    font-size: 8.2pt;
    color: #334155;
  }
  .checklist li {
    margin-bottom: 2px;
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
      <h1 class="brand-title">LEZIONE 02: LA MEMORIA & LE REGOLE DELL'AGENTE</h1>
      <div class="brand-subtitle">Masterclass AI Pro • Guida alla Regia per Stefano</div>
    </div>
    <div class="header-right">
      <span class="badge-doc">Scheda Singola • Lezione 02</span>
      <div style="font-size: 7.5pt; color: #64748b; margin-top: 2px;">Durata Obiettivo: 10 - 12 Minuti</div>
    </div>
  </div>

  <div class="hero-box">
    <h1>🎯 Obiettivo della Lezione: Rendere l'Agente Affidabile e Disciplinato</h1>
    <p>
      In questa lezione mostriamo come personalizzare il file <code>AGENTS.md</code> per dare all'Agente le <strong>3 Regole d'Oro Aziendali</strong> (Zero Allucinazioni, Risposte Strutturate e Sicurezza con Controllo Umano). Lo studente capirà perché un agente con regole scritte è infinitamente superiore a una chat generica.
    </p>
  </div>

  <div class="checklist">
    <strong style="color: #0f172a; font-size: 8.5pt;">📋 Preparazione Desktop Prima di Iniziare:</strong>
    <ul>
      <li><strong>Cartella di Lavoro:</strong> Apri Antigravity con la cartella <code>Laboratorio-AI-Pro</code> della Lezione 1.</li>
      <li><strong>File Visibile:</strong> Fai clic su <code>AGENTS.md</code> a sinistra per averlo già aperto al centro dello schermo.</li>
      <li><strong>Atteggiamento:</strong> Fai notare quanto è rassicurante vedere le regole scritte nero su bianco.</li>
    </ul>
  </div>

  <h2>SCALETTA & COPIONE OPERATIVO</h2>

  <div class="module-card">
    <div class="module-header">
      <div class="module-title">FASE 1: Perché le Chat Dimenticano e Antigravity No</div>
      <div class="module-time">⏱️ Minuti 00:00 - 03:30</div>
    </div>
    <div class="module-body">
      <div class="step-box">
        <div class="step-label">🖥️ Cosa mostrare a schermo:</div>
        <div class="action-text">Antigravity aperto con il file <code>AGENTS.md</code> visibile nell'editor al centro.</div>
        <div class="step-label">🗣️ Cosa dire a voce (Copione per Stefano):</div>
        <div class="speech-box">
          "Bentornati nella seconda lezione della Masterclass AI Pro!<br><br>
          Nella scorsa lezione abbiamo creato la nostra cartella di lavoro e il nostro primo file <code>AGENTS.md</code>.<br><br>
          Oggi affrontiamo uno dei problemi più frustranti di chi usa l'intelligenza artificiale: <strong>la perdita di memoria</strong>. Quante volte vi è capitato su ChatGPT di spiegare chi siete, che tipo di risposte volete, e poi il giorno dopo dover ricominciare tutto da capo perché la chat si è dimenticata?<br><br>
          In azienda questo non è accettabile. In Antigravity la soluzione è semplicissima e si chiama <strong>Grounding su File</strong>: noi scriviamo le regole una volta sola dentro questo documento, e l'Agente le applicherà automaticamente ogni singolo giorno, ad ogni richiesta."
        </div>
      </div>
    </div>
  </div>

  <div class="page-break"></div>

  <!-- ==================== PAGINA 2: FASE 2 & FASE 3 ==================== -->
  <div class="module-card">
    <div class="module-header">
      <div class="module-title">FASE 2: Inserire le 3 Regole d'Oro Aziendali</div>
      <div class="module-time">⏱️ Minuti 03:30 - 07:30</div>
    </div>
    <div class="module-body">
      <div class="step-box">
        <div class="step-label">🖥️ Cosa fare a schermo:</div>
        <div class="action-text">
          1. Clicca nella chat dell'Agente a destra.<br>
          2. Incolla questo comando: <code>Aggiorna AGENTS.md inserendo 3 regole fondamentali per la nostra azienda: 1) Zero Allucinazioni: se non trovi un dato nei file rispondi 'Dato non presente' senza inventare; 2) Risposte Strutturate: usa sempre elenchi puntati o tabelle; 3) Sicurezza: prima di cancellare o modificare file chiedi sempre la mia conferma esplicita.</code><br>
          3. Mostra l'Agente mentre esegue la modifica (evidenzia le righe verdi aggiunte nel file al centro).
        </div>
        <div class="step-label">🗣️ Cosa dire a voce (Copione per Stefano):</div>
        <div class="speech-box">
          "Guardate lo schermo: ho chiesto all'Agente di aggiungere tre regole cruciali.<br><br>
          • <strong>Regola 1 (Anti-Allucinazione)</strong>: Se l'Agente non trova un dato certo, deve dircelo con onestà invece di inventare risposte verosimili.<br>
          • <strong>Regola 2 (Ordine)</strong>: Niente muri di testo infiniti, solo tabelle ed elenchi puntati chiari.<br>
          • <strong>Regola 3 (Controllo Umano)</strong>: Nessuna modifica irreversibile ai nostri file senza il nostro permesso esplicito.<br><br>
          Vedete come ha lavorato l'Agente? Non ha cancellato il file per riscriverlo da zero: ha inserito chirurgicamente le nuove direttive preservando la struttura."
        </div>
      </div>
    </div>
  </div>

  <div class="module-card">
    <div class="module-header">
      <div class="module-title">FASE 3: Il Test Pratico di Verifica (Mettiamo alla Prova l'Agente)</div>
      <div class="module-time">⏱️ Minuti 07:30 - 11:00</div>
    </div>
    <div class="module-body">
      <div class="step-box">
        <div class="step-label">🖥️ Cosa fare a schermo:</div>
        <div class="action-text">
          1. Fai una domanda trabocchetto nella chat: <code>Qual è il numero di telefono del nostro fornitore Rossi?</code><br>
          2. Mostra la risposta dell'Agente: <em>"Dato non presente nei documenti della cartella."</em><br>
          3. Fai un secondo test: <code>Cancellami il file AGENTS.md</code><br>
          4. Mostra l'Agente che si ferma e chiede: <em>"Attenzione: per la regola di sicurezza, confermi di voler procedere?"</em>
        </div>
        <div class="step-label">🗣️ Cosa dire a voce (Copione per Stefano):</div>
        <div class="speech-box">
          "Facciamo la prova del nove!<br><br>
          Ho chiesto il numero di un fornitore che non esiste nei nostri file: una normale chat avrebbe provato a inventare un prefisso a caso, mentre il nostro Agente ha risposto esattamente: <em>'Dato non presente nei documenti'</em>.<br><br>
          Poi gli ho chiesto per scherzo di cancellare il file delle regole: e lui si è fermato chiedendo la mia autorizzazione esplicita.<br><br>
          Ecco la differenza tra un semplice assistente di prova e un <strong>collaboratore affidabile per la vostra azienda</strong>.<br><br>
          Nella prossima lezione faremo un altro passo avanti: gli daremo in pasto un file di appunti disordinati e vedremo come lo trasforma in una tabella clienti perfetta in 5 secondi!"
        </div>
      </div>
    </div>
  </div>

  <div class="tip-box">
    <strong>💡 Consiglio per Stefano:</strong> Mostra grande soddisfazione quando l'Agente risponde correttamente al test trabocchetto! Questo trasmette sicurezza e fa capire agli studenti che l'IA può essere controllata e resa sicura al 100%.
  </div>

</body>
</html>
"""

with open(OUTPUT_HTML, "w", encoding="utf-8") as f:
    f.write(html_doc)

print("📄 File HTML Lezione 02 creato con successo!")
