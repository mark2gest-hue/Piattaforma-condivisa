import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

async function exportLezione05Pdf() {
  const htmlPath = path.resolve('scratch/antigravity_video/LEZIONE_05_COPIONE_REGIA_STEFANO.html');
  const pdfPath = path.resolve('public/dispense/LEZIONE_05_GUIDA_REGIA_STEFANO.pdf');
  const vaultPath = '/Users/marco/Library/Mobile Documents/iCloud~md~obsidian/Documents/KnowledgeBase/09_File_Piattaforma_Aiutiamoci/LEZIONE_05_GUIDA_REGIA_STEFANO.pdf';

  fs.mkdirSync(path.dirname(pdfPath), { recursive: true });
  fs.mkdirSync(path.dirname(vaultPath), { recursive: true });

  console.log('🚀 Avvio browser per esportazione PDF Lezione 05 (API & Costi Reali)...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle' });
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' }
  });

  await browser.close();

  // Copia anche nel Vault Obsidian
  fs.copyFileSync(pdfPath, vaultPath);

  console.log(`✅ PDF Lezione 05 Generato: ${pdfPath}`);
  console.log(`📁 Salvato nel Vault Obsidian: ${vaultPath}`);
}

exportLezione05Pdf();
