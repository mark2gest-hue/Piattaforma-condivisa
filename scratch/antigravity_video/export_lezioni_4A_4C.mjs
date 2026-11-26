import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const MODULI = ['4A', '4B', '4C'];

async function exportModuli4AC() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const vaultDir = '/Users/marco/Library/Mobile Documents/iCloud~md~obsidian/Documents/KnowledgeBase/09_File_Piattaforma_Aiutiamoci';
  const desktopDir = '/Users/marco/Desktop';
  fs.mkdirSync(vaultDir, { recursive: true });

  for (const num of MODULI) {
    // 1. Guida Regia Stefano PDF
    const regiaHtml = path.resolve(`scratch/antigravity_video/LEZIONE_${num}_COPIONE_REGIA_STEFANO.html`);
    const regiaPdf = path.resolve(`public/dispense/LEZIONE_${num}_GUIDA_REGIA_STEFANO.pdf`);
    await page.goto(`file://${regiaHtml}`, { waitUntil: 'networkidle' });
    await page.pdf({
      path: regiaPdf,
      format: 'A4',
      printBackground: true,
      margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' },
    });
    fs.copyFileSync(regiaPdf, path.join(vaultDir, `LEZIONE_${num}_GUIDA_REGIA_STEFANO.pdf`));
    fs.copyFileSync(regiaPdf, path.join(desktopDir, `LEZIONE_${num}_GUIDA_REGIA_STEFANO.pdf`));

    // 2. Dispensa Studenti PDF
    const dispHtml = path.resolve(`scratch/antigravity_video/DISPENSA_PRO_MODULO_${num}.html`);
    const dispPdf = path.resolve(`public/dispense/DISPENSA_PRO_MODULO_${num}.pdf`);
    await page.goto(`file://${dispHtml}`, { waitUntil: 'networkidle' });
    await page.pdf({
      path: dispPdf,
      format: 'A4',
      printBackground: true,
      margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' },
    });
    fs.copyFileSync(dispPdf, path.join(vaultDir, `DISPENSA_PRO_MODULO_${num}.pdf`));
    console.log(`Exported 4${num.slice(1)} PDFs ok.`);
  }

  await browser.close();
}

exportModuli4AC();
