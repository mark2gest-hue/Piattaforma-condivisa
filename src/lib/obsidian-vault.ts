import fs from 'fs';
import path from 'path';
import os from 'os';

/**
 * Helper per la gestione del Vault Obsidian locale & iCloud.
 * Implementa l'Agent Learning Loop stile LifeOS:
 * - Scrittura regole apprese e correzioni umane
 * - Archiviazione deliverable approvati
 * - Iniezione memoria a lungo termine nel prompt dell'Agente
 */

// Cartelle sorgente Vault Obsidian
const PRIMARY_VAULT_DIR = '/Users/marco/Sviluppo/KnowledgeBase/07_Secondo_Cervello_Aiutiamoci';
const ICLOUD_VAULT_DIR = path.join(
  os.homedir(),
  'Library/Mobile Documents/iCloud~md~obsidian/Documents/KnowledgeBase/07_Secondo_Cervello_Aiutiamoci'
);

export function getObsidianVaultDir(): string {
  if (fs.existsSync(PRIMARY_VAULT_DIR)) {
    return PRIMARY_VAULT_DIR;
  }
  if (fs.existsSync(path.dirname(ICLOUD_VAULT_DIR))) {
    return ICLOUD_VAULT_DIR;
  }
  return PRIMARY_VAULT_DIR;
}

export interface LearningRule {
  taskTitle: string;
  projectName?: string;
  feedback: string;
  date: string;
}

/**
 * Salva una correzione o linea guida appresa nel Vault Obsidian.
 * Crea una nota Markdown con wikilinks per arricchire il Knowledge Graph.
 */
export async function saveLearnedRuleToObsidian(rule: LearningRule): Promise<string | null> {
  try {
    const vaultDir = getObsidianVaultDir();
    const rulesFolder = path.join(vaultDir, '03_Skills_&_Agenti/Regole_Apprese');
    fs.mkdirSync(rulesFolder, { recursive: true });

    const safeTitle = rule.taskTitle.replace(/[^a-zA-Z0-9_\-]/g, '_').slice(0, 40);
    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = `Regola_${dateStr}_${safeTitle}.md`;
    const filePath = path.join(rulesFolder, fileName);

    const content = `---
type: "regola_appresa"
task: "${rule.taskTitle}"
project: "${rule.projectName || 'Generale'}"
created: "${new Date().toISOString()}"
tags: ["lifeos", "agent-memory", "regola-team", "auto-apprendimento"]
---

# 🧠 Regola Appresa da Feedback Umano

> **Origine Task**: [[${rule.taskTitle}]]  
> **Data**: ${dateStr}  
> **Progetto**: ${rule.projectName ? `[[${rule.projectName}]]` : 'N/D'}

## ⚠️ Feedback & Correzione del Team:
${rule.feedback}

## 🎯 Direttiva per i prossimi task dell'Agente:
- Ricorda questo vincolo durante l'elaborazione di task simili.
- Evita di ripetere la scelta contestata dall'operatore.
- Mantieni la coerenza con lo standard approvato.

---
*Collegato alla [[00_Dashboard_Cervello]] e all'indice [[03_Skills_&_Agenti]]*
`;

    fs.writeFileSync(filePath, content, 'utf-8');
    return filePath;
  } catch (err) {
    console.warn('Avviso: scrittura nel Vault Obsidian non riuscita (opzionale):', err);
    return null;
  }
}

/**
 * Salva un deliverable approvato come nota permanente nel Vault Obsidian.
 */
export async function saveApprovedDeliverableToObsidian(
  title: string,
  deliverableContent: string,
  projectName?: string
): Promise<string | null> {
  try {
    const vaultDir = getObsidianVaultDir();
    const folder = path.join(vaultDir, '04_Deliverable_Approvati');
    fs.mkdirSync(folder, { recursive: true });

    const safeTitle = title.replace(/[^a-zA-Z0-9_\-]/g, '_').slice(0, 45);
    const fileName = `Deliverable_${safeTitle}.md`;
    const filePath = path.join(folder, fileName);

    const content = `---
type: "deliverable_approvato"
task: "${title}"
project: "${projectName || 'Generale'}"
status: "approvato"
created: "${new Date().toISOString()}"
tags: ["deliverable", "approvato", "ai-output", "knowledge-vault"]
---

# ✅ ${title}

> **Progetto**: ${projectName ? `[[${projectName}]]` : 'N/D'}  
> **Stato**: Approvato dal team e archiviato nel Secondo Cervello.

---

${deliverableContent}

---
*Archiviato automaticamente nel Secondo Cervello. Vedi [[00_Dashboard_Cervello]]*
`;

    fs.writeFileSync(filePath, content, 'utf-8');
    return filePath;
  } catch (err) {
    console.warn('Avviso: archiviazione deliverable su Obsidian saltata:', err);
    return null;
  }
}

/**
 * Legge le ultime regole apprese da Obsidian per iniettarle nella memoria dell'Agente.
 */
export function getRecentLearnedRules(limit: number = 5): string {
  try {
    const vaultDir = getObsidianVaultDir();
    const rulesFolder = path.join(vaultDir, '03_Skills_&_Agenti/Regole_Apprese');
    if (!fs.existsSync(rulesFolder)) {
      return '';
    }

    const files = fs
      .readdirSync(rulesFolder)
      .filter((f) => f.endsWith('.md'))
      .reverse()
      .slice(0, limit);

    if (files.length === 0) return '';

    const snippets: string[] = [];
    for (const file of files) {
      try {
        const text = fs.readFileSync(path.join(rulesFolder, file), 'utf-8');
        // Estrai la sezione del feedback
        const match = text.match(/## ⚠️ Feedback & Correzione del Team:\s*([\s\S]*?)\s*##/);
        if (match && match[1]) {
          snippets.push(`- Regola (${file.replace('.md', '')}): ${match[1].trim()}`);
        }
      } catch {
        // Ignora singoli file illeggibili
      }
    }

    if (snippets.length === 0) return '';

    return `\n\n--- MEMORIA PERSISTENTE DI APPRENDIMENTO (Regole stabilite dai soci):\n${snippets.join(
      '\n'
    )}\nTieni rigorosamente conto di queste regole ed evita di ripetere gli errori segnalati.`;
  } catch {
    return '';
  }
}
