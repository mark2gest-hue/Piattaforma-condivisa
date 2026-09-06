import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Errore: Credenziali Supabase mancanti in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const vaultRoot = '/Users/marco/Sviluppo/KnowledgeBase';
const targetBaseDir = path.join(vaultRoot, '09_File_Piattaforma_Aiutiamoci');

async function syncStorage() {
  console.log('🔄 Avvio download e sincronizzazione file da Supabase Storage a Obsidian...');
  fs.mkdirSync(targetBaseDir, { recursive: true });

  // 1. Recupera tutte le righe dalla tabella files
  const { data: allItems, error } = await supabase.from('files').select('*');
  if (error) {
    console.error('❌ Errore query tabella files:', error);
    process.exit(1);
  }

  // Mappa cartelle id -> folder_name
  const folderMap = new Map();
  allItems.filter(i => i.mime_type === 'folder').forEach(folder => {
    folderMap.set(folder.id, folder.name);
    const folderDiskPath = path.join(targetBaseDir, folder.name);
    fs.mkdirSync(folderDiskPath, { recursive: true });
  });

  // 2. Scarica i file reali
  const filesToDownload = allItems.filter(i => i.mime_type !== 'folder');
  console.log(`📁 Trovati ${filesToDownload.length} file da scaricare...`);

  let downloaded = 0;
  for (const item of filesToDownload) {
    // Determina la cartella padre
    const folderId = item.storage_path.split('/')[0];
    const folderName = folderMap.get(folderId) || 'Radice';
    const destDir = path.join(targetBaseDir, folderName);
    fs.mkdirSync(destDir, { recursive: true });

    const destFilePath = path.join(destDir, item.name);

    console.log(`⬇️  Scaricamento: [${folderName}] / ${item.name}...`);

    const { data: blob, error: dlErr } = await supabase.storage
      .from('team-files')
      .download(item.storage_path);

    if (dlErr) {
      console.warn(`⚠️  Errore download per ${item.name}:`, dlErr.message);
      continue;
    }

    const buffer = Buffer.from(await blob.arrayBuffer());
    fs.writeFileSync(destFilePath, buffer);
    downloaded++;
  }

  // 3. Copia speciale per il Corso Agenti AI (per comodità)
  const corsoDestDir = path.join(vaultRoot, '06_Corso_Agenti_AI/Slide_e_Presentazioni');
  fs.mkdirSync(corsoDestDir, { recursive: true });

  const corsoFiles = [
    'Enterprise_Agent_Blueprint.pptx',
    'Corso Agenti Software.pptx',
    'corso agenti ai Gamma.pdf'
  ];

  const sourceMateriale = path.join(targetBaseDir, 'Materiale per corso');
  if (fs.existsSync(sourceMateriale)) {
    corsoFiles.forEach(cf => {
      const src = path.join(sourceMateriale, cf);
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, path.join(corsoDestDir, cf));
      }
    });
  }

  console.log(`\n✅ Sincronizzazione completata!`);
  console.log(`   Scaricati ${downloaded} file in: ${targetBaseDir}`);
  console.log(`   Presentazioni del corso copiate anche in: ${corsoDestDir}`);
}

syncStorage().catch(err => {
  console.error('❌ Errore fatale:', err);
  process.exit(1);
});
