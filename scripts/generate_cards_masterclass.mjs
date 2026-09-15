import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const outDir = '/Users/marco/Sviluppo/Progetti/Prgetto piattaforma lavoro condivisa/recordings/assets_masterclass';
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function renderElement(filename, width, height, html) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width, height });
  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          margin: 0;
          padding: 0;
          background: transparent;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100vw;
          height: 100vh;
        }
      </style>
    </head>
    <body>
      ${html}
    </body>
    </html>
  `);
  
  const element = await page.$('.target');
  await element.screenshot({ path: path.join(outDir, filename), omitBackground: true });
  await browser.close();
  console.log(`Generato asset: ${filename}`);
}

async function main() {
  // 1. Intro Title Banner (0 - 3.8s)
  await renderElement('banner_intro.png', 1200, 300, `
    <div class="target" style="
      width: 1100px;
      background: rgba(10, 15, 29, 0.94);
      border-left: 10px solid #0284c7;
      border-radius: 16px;
      padding: 30px 40px;
      box-shadow: 0 30px 60px rgba(0,0,0,0.8);
      backdrop-filter: blur(20px);
      box-sizing: border-box;
    ">
      <div style="font-size: 18px; font-weight: 800; letter-spacing: 0.1em; color: #38bdf8; text-transform: uppercase;">
        AIUTIAMOCI.CLOUD • CAMPUS DIDATTICO
      </div>
      <div style="font-size: 54px; font-weight: 900; color: #ffffff; margin: 10px 0 6px 0; letter-spacing: -0.02em;">
        GUIDA ALLA REGISTRAZIONE
      </div>
      <div style="font-size: 24px; font-weight: 600; color: #f59e0b;">
        Le 3 Modalità di Accesso al Percorso AI
      </div>
    </div>
  `);

  // 2. Persistent Top Badge (da 4s in poi)
  await renderElement('badge_top.png', 600, 120, `
    <div class="target" style="
      width: 520px;
      background: rgba(10, 15, 29, 0.92);
      border-left: 8px solid #0284c7;
      border-radius: 12px;
      padding: 16px 24px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.7);
      backdrop-filter: blur(16px);
      box-sizing: border-box;
    ">
      <div style="font-size: 13px; font-weight: 800; letter-spacing: 0.08em; color: #38bdf8; text-transform: uppercase;">
        AIUTIAMOCI • FORMAZIONE OPERATIVA
      </div>
      <div style="font-size: 20px; font-weight: 800; color: #ffffff; margin-top: 4px;">
        3 Percorsi di Accesso Guidato
      </div>
    </div>
  `);

  // 3. Lower Third speaker/presenter note
  await renderElement('lower_third.png', 600, 120, `
    <div class="target" style="
      width: 520px;
      background: rgba(10, 15, 29, 0.94);
      border-left: 8px solid #f59e0b;
      border-radius: 12px;
      padding: 16px 24px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.7);
      backdrop-filter: blur(16px);
      box-sizing: border-box;
    ">
      <div style="font-size: 18px; font-weight: 800; color: #ffffff;">
        Masterclass Interattiva 2026
      </div>
      <div style="font-size: 14px; font-weight: 500; color: #94a3b8; margin-top: 2px;">
        Nessun prerequisito tecnico richiesto • Pratica immediata
      </div>
    </div>
  `);

  // 4. Card 1
  await renderElement('card_step1_iscrizione.png', 520, 280, `
    <div class="target" style="
      width: 480px;
      border-radius: 16px;
      background: rgba(15, 23, 42, 0.95);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-left: 8px solid #0284c7;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8);
      padding: 24px;
      box-sizing: border-box;
    ">
      <div style="background: rgba(2, 132, 199, 0.25); color: #38bdf8; display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase;">
        STEP 1 • ACCESSO LIBERO
      </div>
      <div style="margin: 12px 0 8px 0; font-size: 20px; font-weight: 800; color: #ffffff;">
        Inizia il Corso Completo
      </div>
      <div style="font-size: 14px; line-height: 1.5; color: #94a3b8;">
        Iscrizione con nome ed email. Accesso immediato alle 20 lezioni pratiche senza carta di credito.
      </div>
      <div style="margin-top: 14px; padding-top: 12px; border-top: 1px solid rgba(255, 255, 255, 0.08); display: flex; justify-content: space-between; font-size: 13px; font-weight: 600; color: #38bdf8;">
        <span>🎓 20 Moduli On-Demand</span>
        <span>Modulo Dati →</span>
      </div>
    </div>
  `);

  // 5. Card 2
  await renderElement('card_step2_codice.png', 520, 280, `
    <div class="target" style="
      width: 480px;
      border-radius: 16px;
      background: rgba(15, 23, 42, 0.95);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-left: 8px solid #10b981;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8);
      padding: 24px;
      box-sizing: border-box;
    ">
      <div style="background: rgba(16, 185, 129, 0.25); color: #34d399; display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase;">
        STEP 2 • STUDENTI & AZIENDE
      </div>
      <div style="margin: 12px 0 8px 0; font-size: 20px; font-weight: 800; color: #ffffff;">
        Hai già il Codice di Accesso?
      </div>
      <div style="font-size: 14px; line-height: 1.5; color: #94a3b8;">
        Sblocco immediato del workspace e delle dispense PDF inserendo la chiave univoca rilasciata dall'ente.
      </div>
      <div style="margin-top: 14px; padding-top: 12px; border-top: 1px solid rgba(255, 255, 255, 0.08); display: flex; justify-content: space-between; font-size: 13px; font-weight: 600; color: #34d399;">
        <span>⚡ Sblocco Rapido</span>
        <span>Chiave Studente →</span>
      </div>
    </div>
  `);

  // 6. Card 3
  await renderElement('card_step3_pro.png', 520, 280, `
    <div class="target" style="
      width: 480px;
      border-radius: 16px;
      background: rgba(15, 23, 42, 0.95);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-left: 8px solid #a855f7;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8);
      padding: 24px;
      box-sizing: border-box;
    ">
      <div style="background: rgba(168, 85, 247, 0.25); color: #c084fc; display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase;">
        STEP 3 • BUSINESS & AUTOMAZIONI
      </div>
      <div style="margin: 12px 0 8px 0; font-size: 20px; font-weight: 800; color: #ffffff;">
        AI Pro — Lista d'Attesa
      </div>
      <div style="font-size: 14px; line-height: 1.5; color: #94a3b8;">
        Percorso avanzato per professionisti: workflow n8n, centralini vocali AI e automazione processi aziendali.
      </div>
      <div style="margin-top: 14px; padding-top: 12px; border-top: 1px solid rgba(255, 255, 255, 0.08); display: flex; justify-content: space-between; font-size: 13px; font-weight: 600; color: #c084fc;">
        <span>🚀 Posti Limitati</span>
        <span>Priorità Riservata →</span>
      </div>
    </div>
  `);
}

main().catch(console.error);
