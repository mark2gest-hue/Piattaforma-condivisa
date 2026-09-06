import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('🔄 Avvio sincronizzazione Secondo Cervello con Obsidian...');

// Cartella destinazione
const primaryDir = '/Users/marco/Sviluppo/KnowledgeBase/07_Secondo_Cervello_Aiutiamoci';
const fallbackDir = path.join(os.homedir(), 'Library/Mobile Documents/iCloud~md~obsidian/Documents/KnowledgeBase/07_Secondo_Cervello_Aiutiamoci');

let targetDir = primaryDir;
if (!fs.existsSync('/Users/marco/Sviluppo/KnowledgeBase') && fs.existsSync(path.dirname(fallbackDir))) {
  targetDir = fallbackDir;
}

fs.mkdirSync(targetDir, { recursive: true });

// Carica items da knowledge-data.ts
const dataFilePath = path.join(rootDir, 'src/lib/knowledge-data.ts');
if (!fs.existsSync(dataFilePath)) {
  console.error('❌ Errore: file knowledge-data.ts non trovato in', dataFilePath);
  process.exit(1);
}

const dataContent = fs.readFileSync(dataFilePath, 'utf-8');

// Dashboard principale
const dashboardContent = `# 🧠 Secondo Cervello & Knowledge Base — Aiutiamoci Cloud

Benvenuto nel tuo **Vault Obsidian Interconnesso**.
Tutti i file sono in formato Markdown puro con collegamenti bidirezionali (\`[[wikilinks]]\`).

---

## 📚 Cartelle del Vault:
- [[01_Prompt_Library]]: Formule RCCF, Copywriting, Excel e Prompt Visivi.
- [[02_Corsi_AI_Start]]: Tutte le 20 lezioni video con punti chiave ed esercizi.
- [[03_Skills_&_Agenti]]: Template di istruzioni di sistema per bot e automazioni.

---

## 🔗 Mappa dei Corsi:
${Array.from({ length: 20 }, (_, i) => `- [[Lezione_${String(i + 1).padStart(2, '0')}]]`).join('\n')}

---
*Generato automaticamente da [aiutiamoci.cloud](https://aiutiamoci.cloud)*
`;

fs.writeFileSync(path.join(targetDir, '00_Dashboard_Cervello.md'), dashboardContent, 'utf-8');

// Parsing semplice degli elementi per estrarli
// Poiché DEFAULT_KNOWLEDGE_ITEMS è un array di oggetti TypeScript, possiamo estrarre i blocchi con regex
const itemsRegex = /{\s*id:\s*['"]([^'"]+)['"][\s\S]*?title:\s*(['"`])([\s\S]*?)\2[\s\S]*?category:\s*['"]([^'"]+)['"][\s\S]*?tags:\s*\[([\s\S]*?)\][\s\S]*?description:\s*(['"`])([\s\S]*?)\6[\s\S]*?content:\s*`([\s\S]*?)`[\s\S]*?}/g;

let count = 1; // contando la dashboard
let match;

const folderMap = {
  prompting: '01_Prompt_Library/Prompting',
  copywriting: '01_Prompt_Library/Copywriting',
  excel_data: '01_Prompt_Library/Excel_e_Dati',
  visual_media: '01_Prompt_Library/Immagini_e_Slide',
  agents_workflows: '03_Skills_&_Agenti',
  course_notes: '02_Corsi_AI_Start',
};

while ((match = itemsRegex.exec(dataContent)) !== null) {
  const [, id, , title, category, tagsRaw, , description, content] = match;
  const sanitizedTitle = title.replace(/[^a-zA-Z0-9_\-]/g, '_').replace(/_+/g, '_').slice(0, 50);
  const folder = folderMap[category] || '01_Prompt_Library';
  
  const destFolder = path.join(targetDir, folder);
  fs.mkdirSync(destFolder, { recursive: true });

  const tags = tagsRaw.split(',').map(t => t.trim().replace(/['"]/g, '')).filter(Boolean);

  const fileText = `---
title: "${title}"
category: "${category}"
tags: [${tags.map(t => `"${t}"`).join(', ')}]
created: "${new Date().toISOString()}"
---

# ${title}

${description ? `> **Descrizione**: ${description}\n` : ''}

${content}

---
*Torna alla [[00_Dashboard_Cervello]]*
`;

  fs.writeFileSync(path.join(destFolder, `${sanitizedTitle}.md`), fileText, 'utf-8');
  count++;
}

console.log(`✅ Sincronizzazione completata: ${count} note scritte in:`);
console.log(`   📂 ${targetDir}`);
