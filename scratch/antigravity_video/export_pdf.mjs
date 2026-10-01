import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

async function exportPdf() {
  const htmlPath = path.resolve('scratch/antigravity_video/GUIDA_REGIA_STEFANO_CORSO_PRO.html');
  const pdfPath = path.resolve('public/dispense/GUIDA_REGIA_DOCENZA_STEFANO_CORSO_PRO.pdf');
  const vaultPath = '/Users/marco/Library/Mobile Documents/iCloud~md~obsidian/Documents/KnowledgeBase/09_File_Piattaforma_Aiutiamoci/GUIDA_REGIA_DOCENZA_STEFANO_CORSO_PRO.pdf';

  fs.mkdirSync(path.dirname(pdfPath), { recursive: true });
  fs.mkdirSync(path.dirname(vaultPath), { recursive: true });

  console.log('🚀 Avvio browser per esportazione PDF A4...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle' });
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '15mm', right: '15mm', bottom: '15mm', left: '15mm' }
  });

  await browser.close();

  // Copia anche nel Vault Obsidian
  fs.copyFileSync(pdfPath, vaultPath);

  console.log(`✅ PDF Generato con successo: ${pdfPath}`);
  console.log(`📁 Salvato anche nel Vault Obsidian: ${vaultPath}`);
}

exportPdf();
