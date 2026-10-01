import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const LEZIONI = ['06', '07', '08', '09', '10'];

async function exportBatchPdf() {
  console.log('🚀 Avvio browser Playwright per esportazione batch Lezioni 06 - 10...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const vaultDir = '/Users/marco/Library/Mobile Documents/iCloud~md~obsidian/Documents/KnowledgeBase/09_File_Piattaforma_Aiutiamoci';
  fs.mkdirSync(vaultDir, { recursive: true });

  for (const num of LEZIONI) {
    const htmlPath = path.resolve(`scratch/antigravity_video/LEZIONE_${num}_COPIONE_REGIA_STEFANO.html`);
    const pdfPath = path.resolve(`public/dispense/LEZIONE_${num}_GUIDA_REGIA_STEFANO.pdf`);
    const vaultPath = path.join(vaultDir, `LEZIONE_${num}_GUIDA_REGIA_STEFANO.pdf`);

    await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle' });
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' }
    });

    fs.copyFileSync(pdfPath, vaultPath);
    console.log(`✅ Generato PDF Lezione ${num}: ${pdfPath}`);
  }

  await browser.close();
  console.log('🎉 Tutte le lezioni da 06 a 10 sono state esportate con successo!');
}

exportBatchPdf();
