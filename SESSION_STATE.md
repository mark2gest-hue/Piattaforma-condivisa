# SESSION_STATE.md — Piattaforma Team Condivisa & Agenti AI

Ultimo aggiornamento: 2026-09-09 22:18
Stato corrente: Aggiunto pulsante di ritorno rapido "Area Admin" nella barra superiore del workshop di Mira (`/workshop-agenti`), collegato direttamente a `/lavori`. Google Meet Pro integrato in `/videocall` e nei comandi vocali di Mira. Build di produzione 0 errori.

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
  - **Metriche Reali Funnel**: estrazione diretta da Supabase (`waitlist_leads` e `student_codes`) con conteggio leads raccolti, studenti attivi e calcolo automatico CVR reale.
  - **Preset 1-Click Corsi**: compilazione istantanea del brief di campagna per `Corso 1: AI Start` (€97) e `Corso 2: AI Pro (Agenti Autonomi)` (€297) sia nel generatore avanzato sia nelle chips rapide del generatore express.
  - Simulatore economico e calcolatore ROI in tempo reale (Ad Spend, nuovi clienti, fatturato stimato).
  - Generatori modali interattivi per asset social: Caroselli (`carousel-generator-modal.tsx`), Locandine promozionali (`locandina-generator-modal.tsx`) e Reel/Storyboard video (`reel-video-generator-modal.tsx`).
  - Integrazione diretta con Buffer per programmazione post e auto-indicizzazione nel Secondo Cervello.
- [x] **Posta Condivisa (`/posta`)**:
  - Webmail centralizzata multi-inbox con 5 caselle Aruba (`team@aiutiamoci.cloud`, `info@aiutiamoci.cloud`, `assistenza@aiutiamoci.cloud`, `info@mar2.cloud`, `support@mar2.cloud`).
  - Sincronizzazione IMAP server-side con `imapflow` e `mailparser` (`/api/email/imap-sync`) con merge automatico credenziali e ripristino predefiniti.
  - Selezione multipla con checkbox (singola o "Seleziona tutte") e barra azioni bulk per eliminazione multipla (`deleteSharedEmailsBulk`) e marcatura in blocco come lette (`markEmailsAsReadBulk`).
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
- [x] **Gestione Studenti & Corsi Formativi (`/corsi`)**:
  - Filtri rapidi per categoria accreditamento: `Tutti`, `Corso 1: AI Start` (badge blu), `Corso 2: AI Pro (Agenti)` (badge viola) e `Bundle Completo` (badge dorato).
  - Ricerca istantanea full-text per nome studente, email e codice univoco.
  - Workflow approvazione nuove iscrizioni e conversione lead da lista d'attesa in corsisti abilitati.
- [x] **Centralino 24/7 & Funnel Lead Corso Agenti AI (n8n v2.8.4 su Oracle VPS)**:
  - **Monitoraggio 5 caselle aziendali**: `assistenza@aiutiamoci.cloud`, `info@aiutiamoci.cloud`, `team@aiutiamoci.cloud`, `info@mark2.cloud`, `support@mark2.cloud`.
  - **Triage con Gemini 2.5 Flash**: classificazione multi-categoria (`CORSO_AGENTI_AI`, `ASSISTENZA`, `INFO_GENERALI`, `TEAM_INTERNO`, `SPAM`) con estrazione strutturata (nome, email, WhatsApp, livello tecnico, quesito).
  - **Filtro Logico Anti-Spam & Switch routing**: segregazione email operative da lead formativi.
  - **Archiviazione automatica Lead**: nodo HTTP Request verso Supabase REST API (tabella `waitlist_leads`).
  - **Autoresponder email istantaneo**: invio automatico da `info@aiutiamoci.cloud` (SMTP Aruba porta 465 SSL) con presentazione corso, programma e orientamento.
  - **Alert Telegram Prioritario Team**: scheda ricca per contatto immediato dei lead qualificati.
  - **Webhook Trigger dedicato**: canale `Iscrizione-corso-ai` per intercettare in tempo reale le iscrizioni provenienti dalla landing page.
- [x] **Automazione n8n "Video Factory Free" (Marketing Autonomo 100% Free)**:
  - **Gemini 2.5 Flash**: Generazione copy persuasivo, hook, sottotitoli e prompt di ricerca video.
  - **Workflow n8n "Video Factory Free" (100% Funzionante & Testato End-to-End)**:
    - **Trigger**: manuale o schedulato a tempo.
    - **Gemini 2.5 Flash**: copy persuasivo, hook, sottotitoli e query per video.
    - **Pexels API**: estrazione video verticale Full HD / 4K commerciale gratuito.
    - **Telegram Preview & Human-in-the-Loop**: invio anteprima con video e testo nel gruppo team con inline keyboard.
    - **Nodo Wait (Resume on Webhook)**: sblocco 1-click tramite pulsante Telegram su URL pubblico HTTPS (`https://n8n.mark2.cloud`).
    - **Ponte Storage Supabase**:
      - Nodo `Download video`: download binario MP4 in memoria (filtro `>= 960px` per requisiti Reel).
      - Nodo `Upload supabase`: caricamento REST multipart su bucket pubblico `marketing-media` (`video-reel.mp4`).
    - **Buffer GraphQL Integration (`Create a post`)**: prelievo del video da Supabase Storage e pubblicazione automatica del vero Video/Reel sui canali social (Facebook, Instagram, LinkedIn).
  - **Evoluzione: "Weekly Content Factory" (100% OPERATIVA, ATTIVA & PUBBLICATA IN PRODUZIONE)**:
    - **Trigger**: `Schedule Trigger` schedulato attivo in produzione 24/7 + Manual trigger per run estemporanee.
    - **Workflow Status**: **PUBLISHED** (attivo in background su n8n.mark2.cloud).
    - **Nuova Strategia Editoriale Integrata (Alternanza Reel/Post & Target Privato vs PMI)**:
      - **Distribuzione Settimanale (1 post/giorno)**:
        - *Lunedì (Reel 9:16 - Privati/Base)*: Errore comune principianti (italiano semplice, no codice) ➔ CTA Corso 1 (AI Start).
        - *Martedì (Post Grafico - PMI)*: 3 compiti aziendali noiosi da automatizzare ➔ CTA Corso 2 (Agenti AI Pro).
        - *Mercoledì (Reel 9:16 - Privati/Base)*: Micro-tutorial pratico (es. riassunto PDF in 10s) ➔ CTA Corso 1 (AI Start).
        - *Giovedì (Post Grafico - PMI)*: Caso studio / ROI ore risparmiate con n8n ➔ CTA Corso 2 (Agenti AI Pro).
        - *Venerdì (Reel 9:16 - Privati/Base)*: Prompt semplice (Formula RCCF) ➔ CTA Corso 1 (AI Start).
        - *Sabato (Post Grafico - Community)*: Falso mito vs Verità sull'impatto dell'AI.
        - *Domenica (Reel 9:16 - Privati/Crescita)*: Mindset e tempo ritrovato per sé ➔ CTA aiutiamoci.cloud.
      - **Gemini 2.5 Flash**: Prompt con output JSON differenziato: `facebook_copy` (approfondito con link) e `instagram_copy` (visivo, compatto, CTA bio/DM e hashtag).
      - **Switch Formato su n8n**: routing condizionale (solo per i Reel esegue chiamata Pexels e upload su Supabase Storage, ottimizzando storage e quote).
      - **Buffer Cross-Channel Separato**: nodi finali dedicati per Facebook (`BUFFER_CHANNEL_FACEBOOK_ID`) e Instagram (`BUFFER_CHANNEL_INSTAGRAM_ID`).
    - **Telegram Human-in-the-Loop**: recap aggregato dei post con pulsante 1-click pubblico HTTPS per approvazione globale da parte del team.
    - **Ponte Supabase Storage**: caricamento su bucket pubblico `marketing-media` solo per i video Reel verticali 9:16.
    - **Buffer Queue & Multi-Channel**: accodamento automatico sui canali social con copy e asset adatti al rispettivo canale.
- [x] **Video Corsi Dinamici & Cinematic Batch Pipeline (In Sviluppo / Pilota Pronto)**:
  - **Problema originario**: 20 video del Corso 1 (AI Start) con avatar statico frontale da 10 minuti ("noiosi e poco dinamici").
  - **Soluzione Zero-Manual-Work & 100% Free**: script Python + FFmpeg locale per montaggio automatico procedurale ad alto ritmo visivo:
    - **Inquadratura 3/4 Dinamica**: crop e posizionamento asimmetrico cinematografico sulla regola dei terzi, lasciando spazio a sinistra per grafiche e slide riassuntive.
    - **Overlay Cyber Glass**: card capitolo in alto a sinistra e bullet point informativi sincronizzati (senza dipendere da freetype/drawtext).
    - **B-Roll Dark Tech / Cyber**: sequenze B-roll ad alta definizione (Matrix binary code e flussi dati neurali) scaricate da Pexels.
    - **Picture-in-Picture (PiP)**: video concettuale a schermo intero con l'avatar miniaturizzato in basso a destra contornato da neon ciano (audio originale ininterrotto).
    - **Stato Video Pilota Corso 2**:
      - Video V5 (High Realism) renderizzato con successo (`public/pro_stefano_pilot.mp4`) e inviato nel gruppo Telegram.
      - Risolti jitter video tramite rendering sub-pixel (Pillow LANCZOS) e aggiunto screencast dinamico con cursore spotlight.
      - Sdoppiato il nodo finale Buffer su n8n per pubblicazione cross-channel (Facebook + Instagram Reels).
      - Creata e collegata la nota tecnica nel Vault Obsidian (`06_Corso_Agenti_AI/Workflows_Operativi/Workflow_Video_Factory_n8n_Buffer.md`) con wikilinks bidirezionali a Lezione 11, Lezione 3, Lezione 6 e Home.md.
      - **Corso 2 (AI Pro - Agenti Autonomi)**: Video Pilota V4 inviato con successo sul gruppo Telegram dei soci.
        - File: `public/pro_stefano_pilot.mp4` (Full HD 1080p, 39.8s).
        - Audio: Voce reale registrata da Stefano in Mixcraft (`public/stefano_corso2.wav`).
        - Struttura video a 4 scene:
          1. **0s - 9s**: Team al lavoro su laptop (Intro Corso 2).
          2. **9s - 18s**: **Canvas n8n a tutto schermo** con pipeline (*Webhook Trigger ➔ Switch Triage ➔ Nemotron AI Agent ➔ Supabase DB ➔ Dispatch Telegram/Resend*).
          3. **18s - 29s**: **Vista Grafo Obsidian reale** con zoom progressivo (Secondo Cervello & Knowledge Vault).
          4. **29s - 40s**: **Bacheca Operativa Kanban** (*Nemotron Lead Agent* live) + Terminale daemon log.
        - Inviato sul gruppo Telegram dei soci in attesa di pareri e feedback.
      - **TikTok Reel 9:16 Virale**: Generato e renderizzato video verticale pronto da pubblicare (`public/tiktok_ai_pro_viral.mp4`, 1080x1920, 29s).
        - Hook: Stop a usare l'AI come chatbot.
        - Sequenza dinamica: Vista Grafo Obsidian ➔ Canvas n8n ➔ Secondo Cervello ➔ Bacheca Kanban ➔ CTA Link in bio.
        - Grafiche e font giga-impact in overlay per il feed social.

---

## 3. File Coinvolti di Recente
- [src/app/(dashboard)/marketing/page.tsx](file:///Users/marco/Sviluppo/Progetti/Prgetto%20piattaforma%20lavoro%20condivisa/src/app/(dashboard)/marketing/page.tsx) — Card metriche reali funnel (leads e corsisti da Supabase) e simulatore economico.
- [src/app/(dashboard)/marketing/campagna/page.tsx](file:///Users/marco/Sviluppo/Progetti/Prgetto%20piattaforma%20lavoro%20condivisa/src/app/(dashboard)/marketing/campagna/page.tsx) — Preset 1-click Corso 1 vs Corso 2 e chips avanzate per Agenti AI.
- [src/app/actions/marketing.ts](file:///Users/marco/Sviluppo/Progetti/Prgetto%20piattaforma%20lavoro%20condivisa/src/app/actions/marketing.ts) — Server action `getMarketingRealMetricsAction` per estrazione metriche live.
- [src/app/(dashboard)/corsi/page.tsx](file:///Users/marco/Sviluppo/Progetti/Prgetto%20piattaforma%20lavoro%20condivisa/src/app/(dashboard)/corsi/page.tsx) — Filtri per livello corso (AI Start vs AI Pro), ricerca e approvazione studenti.
- [src/app/actions/student.ts](file:///Users/marco/Sviluppo/Progetti/Prgetto%20piattaforma%20lavoro%20condivisa/src/app/actions/student.ts) — Server actions per gestione codici studente, waitlist e conversioni.

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
