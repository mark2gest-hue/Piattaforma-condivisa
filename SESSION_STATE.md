# SESSION_STATE.md — Piattaforma Team Condivisa & Agenti AI

Ultimo aggiornamento: 2026-10-10 12:08
Stato corrente:
- **Ridisegno Gateway A Due Vie su `aiutiamoci.cloud` (Landing Page Radice `/`) COMPLETATO & DEPLOYATO**:
  - Eliminato completamente il vecchio layout con AI Slop, menu dispersivi e ragnatele.
  - Implementata architettura essenziale e minimale a due vie simmetriche:
    1. **Aiutiamoci Academy** (`/corsi` / `/academy`): formazione pratica per privati e dipendenti, lezioni guidate, certificazione ATOMA.
    2. **Aiutiamoci Impresa** (link esterno a `https://www.mark2.cloud`): soluzioni agenti autonomi, assistenti vocali, NetworkDiag Ops Pro e automazioni per PMI.
  - Estetica ad altissima fedeltà e profondità fisica stile Apple / Bang & Olufsen / Linear:
    - Sfondo organico a vignettatura scura (`#050811` -> `#030509`) con micro-reticolo tecnico a contrasto impercettibile.
    - Luce radente zenitale sui bordi superiori delle card (`border-top: 1px solid rgba(255,255,255,0.35)`).
    - Ombre fisiche multistrato ad alta presenza e alone backlight diffuso retrostante morbido.
    - Loghi quadrati identici `h-10 w-10` (`/images/logo_icon_dark.png`) per entrambe le card, rimossi tag URL laterali.
  - Header minimale: Logo a sinistra, pulsanti essenziali `[Ho un codice]` (con modal di riscatto/accesso corsisti) e `[Accedi]` a destra.
  - Footer con link legali e conformità GDPR.
  - Build Next.js 15 compilato con successo (route statica `/` a 5.73 kB).
  - Deploy completato su VPS Oracle (`80.225.81.150`), PM2 `aiutiamoci` riavviato e online su [https://aiutiamoci.cloud](https://aiutiamoci.cloud).
  - **Commit 60bf144**: Etichette pulsanti gateway aggiornate a "Vai a Aiutiamoci Accademy" e "Vai a Aiutiamoci Impresa", deployato e verificato online.
- **Ridisegno Landing Page Academy (`src/app/academy/page.tsx`) COMPLETATO & DEPLOYATO**:
  - Eliminato completamente il look "AI Slop" generico (immagini Midjourney sintetiche con robot/ologrammi, gradienti fluo disordinati).
  - Eliminata la slide rigida con l'elenco statico dei 20 moduli (`MODULES_LIST`).
  - Implementata struttura verticale a sezioni con animazioni 3D Reveal graduali (`perspective: 1000px`, scale ed elevazione progressiva allo scroll).
  - Parallasse multi-livello fluida sui livelli di sfondo (`0.12x`, `0.22x`, `0.30x`).
  - Micro-terminal con metriche reali (ore effettive, stack concreto LiveKit/n8n/Next.js, badge ufficiali ATOMA).
  - Autenticità del team docenti (Marco, Stefano, Lorenzo) con credenziali concrete.
  - Commit `2da4708`, push su `main` e deploy live con successo su VPS Oracle (`80.225.81.150`).
  - Endpoint verificato live: **HTTP/2 200 OK** su [https://aiutiamoci.cloud/academy](https://aiutiamoci.cloud/academy).
- **Prossimo Task**: Riprogettazione ed allineamento sito **Aiutiamoci Impresa** (`https://www.mark2.cloud` nel repository `mark2gest-hue/mark2-ai-site` / `/Users/marco/Sviluppo/Progetti/Progetto sito mark2gest`).


  - Il servizio Node.js su porta 3008 sulla VPS (129.152.10.82) non era in esecuzione nel demone PM2, causando errore HTTP 502 (Bad Gateway) da Nginx.
  - Avviato `video-studio` sotto PM2 daemon (`ecosystem.config.cjs`) e salvato lo stato persistente (`pm2 save`). Verificato codice HTTP 200 su `https://video.aiutiamoci.cloud`.
  - Aggiunto link diretto a **Video Studio Factory** anche nel menu laterale della piattaforma ([src/components/layout/sidebar.tsx](file:///Users/marco/Sviluppo/Progetti/Prgetto piattaforma lavoro condivisa/src/components/layout/sidebar.tsx)) sotto la sezione *Progetti & Marketing* con auto-login PIN 2026.

  - Implementata server action `cleanDuplicateRegistrationsAction` in `src/app/actions/student.ts` con protezione ferrea: non tocca in alcun modo gli iscritti approvati o attivi.
  - Elimina automaticamente solo le registrazioni in attesa (`approved: false`) che risultano doppioni di utenti già attivi/approvati o invii multipli accidentali del questionario.
  - Consolida record duplicati nella rubrica `clients` preservando il record principale.
  - Aggiunto pulsante operativo `[🧹 Pulisci Duplicati]` nella barra del registro registrazioni (`/corsi`) con popup di conferma preventiva e alert con riepilogo puntuale delle rimozioni.
- **Selettore Contatti dal Database nel Calendario (`/calendario`) COMPLETATO**:
  - Aggiunto pulsante rapido `[👥 Scegli dal Database]` nella sezione destinatari del modale di creazione evento.
  - Implementata server action `getSelectableRecipientsAction` in `src/app/actions/event-invitations.ts` per recuperare in modo unificato contatti da `student_codes` (studenti con codici), `clients` (rubrica clienti B2B) e `waitlist_leads` (lead lista d'attesa).
  - Finestra di selezione modale con filtri per categoria (Tutti, Studenti, Clienti, Lead), barra di ricerca live e checkbox per selezionare puntualmente 2, 3 o 5 destinatari.
  - Aggancio automatico degli indirizzi selezionati al campo di invio email e alla spedizione della comunicazione via Resend.
- **Upload e Visualizzazione Allegati nella Chat (`/chat`) COMPLETATO**:
  - Implementato supporto completo per allegare e inviare foto (PNG, JPG, WebP, GIF) e documenti (PDF, DOCX, XLSX, TXT, CSV, ZIP).
  - Upload sicuro su Supabase Storage (`team-files/chat-attachments/`).
  - Rendering ricco nei messaggi: anteprima immagini con zoom modale a 1-click e card documenti con icona, dimensione formattata e pulsante download.
  - Barra anteprima file selezionati prima dell'invio con rimozione rapida.
  - Pulsante graffetta `[📎]` attivo su desktop e mobile.
- **Fix Chat Mobile Responsive (`/chat`) COMPLETATO**:
  - Risolto il problema di sovrapposizione e schiacciamento della chat su dispositivi mobili.
  - Implementato drawer laterale a comparsa per i canali tematici e la lista membri del team con backdrop e pulsante toggle `[#canale]`.
  - Ottimizzato lo spazio viewport per massimizzare la visibilità dei messaggi (`h-[calc(100dvh-8rem)]`) e barra di input fissa a fondo schermo.
  - Eliminati finti video e link irrilevanti: il player video compare solo in presenza di video reali.
  - Implementato supporto completo per contenuti testuali: Prompt pronti con copia a 1-click (`navigator.clipboard`), framework RCCF, obiettivo e risultato atteso.
  - Creata API route CRON (`/api/cron/weekly-course-updates` in [src/app/api/cron/weekly-course-updates/route.ts](file:///Users/marco/Sviluppo/Progetti/Prgetto%20piattaforma%20lavoro%20condivisa/src/app/api/cron/weekly-course-updates/route.ts)) che genera ogni lunedì 2 item (alternanza News Verificate / Tutorial Prompt) + 1 Pillola Agenti e li salva in Supabase (`course_weekly_updates`).
  - Aggiunto pulsante di trigger immediato per il team (`⚡ Genera Aggiornamenti Ora`) per test e generazione manuale.
  - Creata migrazione Supabase [supabase/migrations/20261006000000_course_weekly_updates.sql](file:///Users/marco/Sviluppo/Progetti/Prgetto%20piattaforma%20lavoro%20condivisa/supabase/migrations/20261006000000_course_weekly_updates.sql).
- **Tracciamento Ore Studenti (16h), Avanzamento Lezioni & Sblocco Esame ATOMA COMPLETATO**:
  - Creata tabella e migrazione SQL `student_progress` ([20261005000000_student_progress.sql](file:///Users/marco/Sviluppo/Progetti/Prgetto%20piattaforma%20lavoro%20condivisa/supabase/migrations/20261005000000_student_progress.sql)) con RLS, indici e trigger `updated_at`.
  - Aggiornata server action `getStudentCodesAction` per estrarre congiuntamente `total_hours`, `completed_lessons` e `is_exam_unlocked`.
  - Aggiunta server action `toggleStudentExamUnlockAction` per sblocco/blocco manuale 1-click dell'esame ATOMA.
  - Aggiornata la vista Registro Corsisti ([src/app/(dashboard)/corsi/page.tsx](file:///Users/marco/Sviluppo/Progetti/Prgetto%20piattaforma%20lavoro%20condivisa/src/app/(dashboard)/corsi/page.tsx)) con barra di progresso ore/lezioni e pulsante toggle di sblocco esame sia nella tabella Studenti Corso 1 sia nella tabella Studenti Corso 2.
- **Migrazione Database GDPR in Europa (Francoforte - `eu-central-1`) COMPLETATA**:
  - Creato nuovo progetto Supabase EU `omrciqisxdrwuhstinbw` (`Piattaforma Condivisa EU` a Francoforte).
  - Applicate con successo tutte le 15 migrazioni dello schema SQL (`supabase db push`).
  - Importati e sincronizzati con successo al 100% tutti i record storici e dati live (4 profili soci + auth, 67 compiti kanban, 43 codici studenti, 97 registrazioni corsi, 94 metadati file, eventi calendario e lead).
  - Backup locale conservato in `supabase/backups/`.
- Nuova rotta riservata Servizi AI (`/servizi-ai`):
  - Creata vetrina con estetica Anti-Slop per presentare le soluzioni pratiche (bollette, anti-spreco, foto, referti medici, fatture Excel).
  - Nessun pulsante o link pubblico presente nella landing o navbar (accessibile solo tramite URL diretto).
  - Deploy completato con successo sulla VPS Didattica (`80.225.81.150` via Nginx + PM2 `aiutiamoci`).
- Semplificazione strategica Landing Page pubblica (`/`):
  - Ridisegnato il funnel d'azione a 3 percorsi chiari nell'Hero (Iscrizione Masterclass, Pagamento ATOMA, Area Corsisti).
  - Header ripulito con pulsante `[🔒 Team]`.
  - Sezione Percorsi Formativi ("Scegli il livello più adatto a te"): card con badge integrati negli header interni e hover zoom per le copertine dei corsi (AI Start e AI Pro).
  - **Simulatore Interattivo Area Studenti** (Pattern A2UI / Generative UI) a 3 Tab:
    1. `Video Player HD`: Screenshot interfaccia reale con player e trascrizioni.
    2. `Tutor Didattico Virtuale @AI`: Simulazione live chat reattiva con esempio formula RCCF.
    3. `Certificazione Ufficiale`: Anteprima attestato di completamento ATOMA con codice anticontraffazione.
  - Sotto la sezione: Box lista d'attesa per "AI Pro B2B".
- Area Corsisti (`/corsi`):
  - Aggiunti pulsanti dedicati per la Community Telegram e per il bot didattico h24 (`@Corsi_Masterclass_bot`).

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
  - **Preset 1-Click Corsi**: compilazione istantanea del brief di campagna per `Corso 1: AI Start` (€149) e `Corso 2: AI Pro (Agenti Autonomi)` (€297) sia nel generatore avanzato sia nelle chips rapide del generatore express.
  - Simulatore economico e calcolatore ROI in tempo reale (Ad Spend, nuovi clienti, fatturato stimato).
  - Generatori modali interattivi per asset social: Caroselli (`carousel-generator-modal.tsx`), Locandine promozionali (`locandina-generator-modal.tsx`) e Reel/Storyboard video (`reel-video-generator-modal.tsx`).
  - Integrazione diretta con Buffer per programmazione post e auto-indicizzazione nel Secondo Cervello.
- [x] **Posta Condivisa (`/posta`)**:
  - Webmail centralizzata multi-inbox con 5 caselle Aruba (`team@aiutiamoci.cloud`, `info@aiutiamoci.cloud`, `assistenza@aiutiamoci.cloud`, `info@mar2.cloud`, `support@mar2.cloud`).
  - Sincronizzazione IMAP server-side con `imapflow` e `mailparser` (`/api/email/imap-sync`) con merge automatico credenziali e ripristino predefiniti.
  - **Sistema di Archiviazione & Cartelle Personalizzate**:
    - Cartella **Archivio** dedicata (`counts.archived`) con pulsanti rapidi "Archivia" e "Ripristina" (singola e in blocco).
    - Creazione dinamica di **Cartelle su misura** (+ Nuova Cartella con selettore colore: Clienti, Corsi, Fatture, Assistenza Risolta, ecc.).
    - Assegnazione email con menu a tendina "Cartella" nel dettaglio e "Sposta in..." nella barra multipla (bulk).
    - Badge colorati delle cartelle e dello stato archiviata direttamente sulle card della lista email.
  - Selezione multipla con checkbox (singola o "Seleziona tutte") e barra azioni bulk per eliminazione multipla (`deleteSharedEmailsBulk`), archiviazione in blocco (`archiveEmailsBulk`) e marcatura come lette (`markEmailsAsReadBulk`).
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
1. **Lead Magnet Social & Micro-App AI Funnel (IN STANDBY — Pronto su Richiesta)**:
   - **Obiettivo**: Regalare l'uso 1-shot di singole micro-app funzionali sui social (TikTok, Instagram, LinkedIn) per attrarre lead qualificati e convertirli a caldo verso i percorsi formativi ("Vuoi imparare a crearla da zero? Iscriviti al corso qui").
   - **Micro-App Candidate di Punta**:
     1. ⚡ `Analisi & Tutela Bollette` (Consumi, costi nascosti e bozza reclamo formale via Gemini 2.5 Flash Vision).
     2. 📖 `Storie & Fiabe Illustrate per Bambini` (Fiaba personalizzata con nome del bimbo, morale e illustrazioni acquerello in PDF stampabile — *appeal emotivo e viralità altissima per genitori e nonni sui social*).
     3. 🧾 `Estrattore Tabellare Fatture/Scontrini in Excel` (Da foto/PDF cartaceo a tabella CSV/Excel scaricabile per P.IVA).
     4. 🎙️ `Da Vocale WhatsApp a Verbale & Task` (Trascrizione audio ➔ lista to-do + messaggio di conferma).
   - **Architettura & Protezione Anti-Abuso (3 Livelli)**:
     - *Livello 1 (Browser)*: Token cifrato in LocalStorage per bloccare l'accesso al 2° tentativo con modale *"Hai esaurito la prova gratuita"*.
     - *Livello 2 (Server/IP)*: Rate limiting su Supabase / Edge per bloccare tentativi multipli in incognito dallo stesso IP (max 1 test/giorno).
     - *Livello 3 (Gated Lead Capture)*: Per visualizzare/scaricare il report completo è richiesta l'email (salvata automaticamente in `waitlist_leads` / `clients`).
   - **CTA Finale a Caldo**: Box visibile sotto l'output con gancio *"🚀 Vuoi imparare a costruire micro-app intelligenti come questa in meno di 1 ora e senza programmare? ➔ Iscriviti al Corso"*.
   - **Stato**: In standby per confronto con i soci. Al via libera, l'agente collegherà la Server Action reale con Gemini e la rotta pubblica standalone isolata (es. `/app/bollette`).

2. **Masterclass 20 Lezioni — Nuovo Motore Remotion (React + Motion Spring) APPROVATO**:
   - Validato con pieno successo il test comparativo con Remotion (`masterclass_remotion_comparison.mp4`): grafica vettoriale, animazioni elastiche Apple-style (`spring`), CSS Glassmorphism e sorgenti native pulite senza residui.
   - **In attesa**: Invio dei link definitivi dei 20 video da parte di Stefano Maraisi.
   - **Azione successiva**: Al ricevimento dei link/file, rifinire il template master della Lezione 1 con Remotion (audio + sottotitoli + card didattiche + PiP) e lanciare la pipeline batch automatizzata per assemblare tutte e 20 le lezioni in parallelo ad altissima fedeltà.
3. **Roadmap AG-UI Protocol (In Memoria)**:
   - Nota tecnica archiviata in Obsidian: `KnowledgeBase/06_Corso_Agenti_AI/AG_UI_Protocol_Architecture.md`.
   - Adottare per gradi il pattern Generative UI (event-driven streaming) per Agente Mira (`/workshop-agenti`) per renderizzare componenti interattivi (quiz, form, slider) e integrare il concetto come lezione di punta nel Modulo 7 del Corso Pro.
4. Eseguire validazione periodica typecheck e monitorare le route di produzione su `aiutiamoci.cloud`.

