# SESSION_STATE.md — Piattaforma Team Condivisa & Agenti AI

Ultimo aggiornamento: 2026-09-06 20:12
Stato corrente: In produzione / Sincronizzazione 5 caselle Aruba & Obsidian

---

## 1. Obiettivo del Progetto
- **Descrizione**: Hub operativo integrato per i soci e collaboratori del team (`aiutiamoci.cloud` / Ti AIuto). Centralizza l'orchestrazione di compiti Kanban con agenti AI autonomi (*Human-in-the-Loop*), posta aziendale condivisa multi-account, archivio documenti cloud con sintesi automatica, Secondo Cervello (Knowledge Vault & Graph), gestione studenti/corsi formativi, hub marketing (framework APEX, calcolatore ROI, generatori asset) e comunicazioni realtime (chat, videocall Daily.co, notifiche Telegram).
- **Stack principale**: Next.js 15.2.0 (App Router), React 19, TypeScript 5.7, Tailwind CSS, Radix UI, Supabase (PostgreSQL, Auth SSR, RLS, Storage, Realtime), NVIDIA NIM (Nemotron 550B), Google Generative AI, IMAPFlow + MailParser, Resend, Daily.co WebRTC, @dnd-kit.

---

## 2. Stato Avanzamento Lavori

### Completato (Done)
- [x] **Setup & Architettura Core**: Next.js 15 App Router con TypeScript, Tailwind CSS, middleware di sessione Supabase SSR e dark theme.
- [x] **Database & Migrazioni Supabase (15 migrazioni applicate)**:
  - Schema iniziale per profili, ruoli (`admin`, `dev`, `business`), progetti, task, messaggi chat, email e file.
  - Tabella `student_codes` e `course_registrations` con generatori di codici formativi.
  - Tabella `calendar_events` per scadenze e riunioni di team.
  - Tabella `waitlist_leads` per raccolta contatti dalla landing page pubblica.
  - Gestione documentale con gerarchia cartelle (`files_storage_hierarchy.sql`).
  - Tabelle Secondo Cervello: `knowledge_items`, nodi e categorie tematiche.
  - Tabella `marketing_campaigns` con schema protetto da RLS per funnel APEX.
  - Estensione agenti in `profiles` (`is_agent`, `agent_model`, `agent_system_prompt`) e tabella `task_agent_runs`.
- [x] **Bacheca Lavori Kanban (`/lavori`)**:
  - Drag-and-drop 4 colonne (*Da Fare*, *In Corso*, *In Revisione AI/Team*, *Completato*) via `@dnd-kit`.
  - Assegnazione a soci umani o all'agente autonomo `🤖 Nemotron Lead Agent`.
  - Workflow *Human-in-the-Loop*: esecuzione con AI (`executeAgentTaskAction`), invio in revisione, approvazione o richiesta modifiche con feedback.
- [x] **Marketing & Campagne (`/marketing`)**:
  - Framework APEX Growth con tracciamento metriche, budget e stato campagne.
  - Simulatore economico e calcolatore ROI in tempo reale (Ad Spend, nuovi clienti, fatturato stimato).
  - Generatori modali interattivi per asset social: Caroselli (`carousel-generator-modal.tsx`), Locandine promozionali (`locandina-generator-modal.tsx`) e Reel/Storyboard video (`reel-video-generator-modal.tsx`).
- [x] **Posta Condivisa (`/posta`)**:
  - Webmail centralizzata multi-inbox con 5 caselle Aruba (`team@aiutiamoci.cloud`, `info@aiutiamoci.cloud`, `assistenza@aiutiamoci.cloud`, `info@mar2.cloud`, `support@mar2.cloud`).
  - Sincronizzazione IMAP server-side con `imapflow` e `mailparser` (`/api/email/imap-sync`) con merge automatico credenziali e ripristino predefiniti.
  - Copilota AI per analisi email: categorizzazione, priorità e bozza di risposta rapida (`/api/ai/email-agent`).
  - Invio email e risposte via Resend.
- [x] **Documenti & Cloud Storage (`/files`)**:
  - Navigazione ad albero/cartelle integrata con bucket storage Supabase.
  - Preview in-browser di immagini e PDF.
  - Sintesi esecutiva automatica dei file con intelligenza artificiale.
  - Funzione "Crea Compito da File" (one-click su `/lavori`) e archiviazione nel Secondo Cervello.
- [x] **Secondo Cervello & Knowledge Vault (`/cervello`)**:
  - Repository prompt RCCF, deliverable AI approvati, template copy e analisi dati.
  - Ricerca full-text e filtri per categorie.
  - Visualizzatore interattivo Knowledge Graph su canvas (`knowledge-graph-view.tsx`).
  - Sincronizzazione diretta con Vault locale Obsidian (Mac & iCloud) e script dedicato `npm run sync:vault`.

---

## 3. File Coinvolti di Recente
- [src/app/(dashboard)/lavori/page.tsx](file:///Users/marco/Sviluppo/Progetti/Prgetto%20piattaforma%20lavoro%20condivisa/src/app/(dashboard)/lavori/page.tsx) — Bacheca Kanban con dnd-kit e workflow Human-in-the-Loop.
- [src/app/(dashboard)/marketing/page.tsx](file:///Users/marco/Sviluppo/Progetti/Prgetto%20piattaforma%20lavoro%20condivisa/src/app/(dashboard)/marketing/page.tsx) — Hub marketing APEX con simulatore ROI e gestione campagne.
- [src/app/actions/agent-tasks.ts](file:///Users/marco/Sviluppo/Progetti/Prgetto%20piattaforma%20lavoro%20condivisa/src/app/actions/agent-tasks.ts) — Orchestrazione esecuzione agenti AI con NVIDIA Nemotron e notifiche Telegram.
- [src/app/actions/marketing.ts](file:///Users/marco/Sviluppo/Progetti/Prgetto%20piattaforma%20lavoro%20condivisa/src/app/actions/marketing.ts) — Server actions per campagne marketing e generatori di contenuti.
- [src/components/layout/sidebar.tsx](file:///Users/marco/Sviluppo/Progetti/Prgetto%20piattaforma%20lavoro%20condivisa/src/components/layout/sidebar.tsx) — Sidebar con real-time badge email, navigazione completa e status team.
- [src/components/cervello/knowledge-graph-view.tsx](file:///Users/marco/Sviluppo/Progetti/Prgetto%20piattaforma%20lavoro%20condivisa/src/components/cervello/knowledge-graph-view.tsx) — Vista a grafo interattivo per il Secondo Cervello.
- [src/lib/nvidia.ts](file:///Users/marco/Sviluppo/Progetti/Prgetto%20piattaforma%20lavoro%20condivisa/src/lib/nvidia.ts) — Client server-side per endpoint NVIDIA NIM OpenAI-compatible.
- [src/lib/telegram.ts](file:///Users/marco/Sviluppo/Progetti/Prgetto%20piattaforma%20lavoro%20condivisa/src/lib/telegram.ts) — Dispacciamento notifiche bot Telegram ai soci.
- [GUIDA_OPERATIVA_TEAM.md](file:///Users/marco/Sviluppo/Progetti/Prgetto%20piattaforma%20lavoro%20condivisa/GUIDA_OPERATIVA_TEAM.md) — Manuale operativo completo per soci e collaboratori.
- [AGENTS.md](file:///Users/marco/Sviluppo/Progetti/Prgetto%20piattaforma%20lavoro%20condivisa/AGENTS.md) — Regole operative e vincoli per agenti AI di sviluppo.

---

## 4. Decisioni Architetturali & Vincoli
- **Architettura Full-Stack**: Next.js 15 App Router con separazione netta tra Server Components per fetching sicuro e Client Components (`'use client'`) per UI reattive, drag-and-drop e canvas.
- **Database & RLS**: PostgreSQL su Supabase con 15 migrazioni tracciate. Tutte le tabelle sensibili hanno Row Level Security (RLS) attiva; le server actions amministrative utilizzano il client service-role protetto (`createAdminClient`) in isolamento server-side.
- **Flusso Agente Human-in-the-Loop**: Nessun agente AI esegue modifiche distruttive o chiude compiti in autonomia; l'output viene generato nello stato `task_agent_runs` e la card passa su *In Revisione* fino ad approvazione esplicita del socio.
- **Multi-Account IMAP & Notifiche**: Le caselle di dominio aziendali sono lette via protocollo IMAP protetto, normalizzate su tabella `shared_emails` e notificate su Telegram senza esporre credenziali lato client.
- **Variabili d'ambiente**: Nessun segreto hardcoded; configurazione rigorosamente confinata in `.env.local` (mai letto, stampato o modificato dagli agenti).

---

## 5. Prossimi Passi Immediati (Next Actions)
1. Eseguire validazione typecheck (`npm run typecheck`) e linting previa autorizzazione esplicita.
2. Monitorare l'efficienza delle chiamate NVIDIA NIM e i tempi di risposta su prompt lunghi.
3. Consolidare la gestione filtri e tag nella visualizzazione del Secondo Cervello.
