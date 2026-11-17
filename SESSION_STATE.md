# SESSION_STATE.md — Piattaforma Team Condivisa & Agenti AI

Ultimo aggiornamento: 2026-11-17 13:15
Stato corrente:
- **Fase 5 Chat & Assistenza Nativa COMPLETATA & DEPLOYATA (`v2.3.0 • Build #120`)**:
  - Aggiunto pulsante rapido **`🛟 Inbox Assistenza`** direttamente dentro `/chat` (nella colonna sinistra canali e nell'header) con link inverso **`💬 Chat`** in `/assistenza` per passare con 1 click tra chat team e ticket (riservato ai membri interni).
  - **Migrazione SQL ([supabase/migrations/20261117123000_chat_phase5_support_inbox.sql](file:///Users/marco/Sviluppo/Progetti/Prgetto%20piattaforma%20lavoro%20condivisa/supabase/migrations/20261117123000_chat_phase5_support_inbox.sql))**:
    - Nuove tabelle `public.support_tickets` e `public.support_messages` con indici, RLS per il team interno (esclusi `collaborator`) e abilitazione a `supabase_realtime`.
    - Estensione `public.push_subscriptions.user_id` a tipo `TEXT` per supportare anche sottoscrizioni studente `student-<id>`.
  - **Backend Assistenza & Auto-Routing ([src/app/actions/support.ts](file:///Users/marco/Sviluppo/Progetti/Prgetto%20piattaforma%20lavoro%20condivisa/src/app/actions/support.ts))**:
    - Persistenza duale resiliente (Supabase + `.support-tickets.json`), auto-routing automatico per categoria (`tecnico` -> Marco/Stefano, `didattica` -> docente, `commerciale` -> Lorenzo), azioni studente (`createSupportTicketAction`, `getStudentSupportTicketsAction`, `replyStudentSupportTicketAction`, `markStudentTicketReadAction`) e azioni staff (`getTeamSupportTicketsAction`, `replyTeamSupportTicketAction`, `updateSupportTicketStatusAction`, `reassignSupportTicketAction`).
  - **Inbox Assistenza Nativa per il Team ([src/app/(dashboard)/assistenza/page.tsx](file:///Users/marco/Sviluppo/Progetti/Prgetto%20piattaforma%20lavoro%20condivisa/src/app/(dashboard)/assistenza/page.tsx))**:
    - Vista a 2 colonne full-height (`100dvh`) collegata in Sidebar (`Assistenza`) e blindata nel Middleware per `collaborator`.
    - Switch *I miei / Tutti*, filtri per stato (`Aperto`, `In attesa`, `Risolto`) e categoria, ricerca, riassegnazione 1-click, link diretto `💬 Apri DM in Chat`, aggiornamento Realtime e risposta rapida con push + email automatica allo studente.
  - **Rimozione Integrale Telegram & Sistema Notifiche Studenti a 3 Livelli ([src/app/actions/notifications.ts](file:///Users/marco/Sviluppo/Progetti/Prgetto%20piattaforma%20lavoro%20condivisa/src/app/actions/notifications.ts), [src/app/actions/chat.ts](file:///Users/marco/Sviluppo/Progetti/Prgetto%20piattaforma%20lavoro%20condivisa/src/app/actions/chat.ts), [src/app/(dashboard)/chat/page.tsx](file:///Users/marco/Sviluppo/Progetti/Prgetto%20piattaforma%20lavoro%20condivisa/src/app/(dashboard)/chat/page.tsx))**:
    - Rimossa la chiamata `sendTelegramMessage` da `notifyChatMessageAction`; rimossi i link Telegram (`t.me/+...` e `@Corsi_Masterclass_bot`) da `/corsi`.
    - **Livello 1 (Web Push Studenti)**: `saveStudentPushSubscriptionAction` per `student-<id>` e pulsante `🔔 Attiva Notifiche` in `/corsi`.
    - **Livello 2 (Email Zero-Spam)**: toggle `📧 Avvisa iscritti via Email` e trigger `@tutti` in `#community-studenti`; inoltro email automatico su DM verso studenti e su risposte ai ticket `/assistenza`.
    - **Livello 3 (Badge Rossi in `/corsi`)**: pulsanti nativi `💬 Canale Studenti` (`StudentCommunityModal.tsx`) e `🛟 Assistenza 1-a-1` (`StudentSupportModal.tsx`) con contatori `N nuovi` in tempo reale, più pulsante rapido nel banner B2B e sui singoli moduli.
- **Roster Partecipanti Canale ("Chi c'è dentro"), Canale `#community-studenti` & DM 1-a-1 al Click sul Nome COMPLETATI (`v2.3.0 • Build #118`)**:
  - `src/app/actions/chat.ts`:
    - Aggiornato `SYSTEM_CHANNEL_NAMES = ['generale', 'community-studenti']`.
    - Estesa l'interfaccia `ChatMetadataItem` con metadati autore (`sender_name`, `sender_email`, `sender_student_id`).
    - Esportata l'interfaccia `EnrolledStudentChatMember` con formato deterministico `id: 'student-' + row.id` (evitando underscore per coerenza con il routing `dm:`).
    - In `getCustomChannelsAction()`: recupero e deduplica dinamica di tutti gli studenti iscritti attivi unendo `student_codes` e `course_registrations` approvate, con isolamento Zero-Leak garantito (oscurato per i collaboratori esterni).
  - `src/app/(dashboard)/chat/page.tsx`:
    - Nuovo canale di sistema **`#community-studenti`** con icona `Users`, spazio ufficiale di scambio per i corsisti Academy e i docenti.
    - Header del Canale: link/pill cliccabile `👥 X presenti` sotto il titolo (con anteprima primi 2–3 nomi su desktop) e pulsante compatto `👥 Partecipanti (X)` nella barra delle azioni a destra.
    - Modale Partecipanti ("Chi c'è in #${activeChannel}"): modale responsivo con barra di ricerca interna in tempo reale, avatar, dot verde attivo, eventuale codice corso (`AI-START-...`), badge ruolo (`TEAM`, `STUDENTE`, `COLLABORATOR`), nome cliccabile e pulsante **`💬 Messaggio`** per avviare chat 1-a-1 immediata.
    - Nomi Autore Cliccabili per DM 1-a-1: sopra ogni messaggio nella timeline principale e nei thread laterali, il nome dell'autore è un bottone interattivo che apre istantaneamente la conversazione privata con quella persona.
    - Risoluzione partner DM estesa: supporta sia membri del team che studenti con routing trasparente `dm:${sortedIds}`.
  - **PROSSIMO BLOCCO — Fase 5: Inbox Assistenza Nativa (`/assistenza`) + 2 Tasti nella stanza studenti (`/corsi`) (`💬 Canale Studenti #community-studenti` & `🛟 Assistenza 1-a-1`) + Sistema Notifiche Studenti a 3 Livelli (Rimozione Integrale Telegram)**:
    - **Livello 1 — Web Push Nativa per Studenti (`student-<id>`)**: pulsante `🔔 Attiva Notifiche` integrato nella stanza `/corsi` per consentire ai corsisti di ricevere notifiche push istantanee su smartphone e desktop all'arrivo di nuovi messaggi in `#community-studenti`, DM 1-a-1 e risposte sui propri ticket di assistenza.
    - **Livello 2 — Avviso Email Automatico Intelligente (Zero-Spam)**:
      - Su `#community-studenti`: trigger automatico di notifica email a tutti gli iscritti quando un membro del team cita `@tutti` o attiva il toggle `📧 Avvisa iscritti via Email` durante la pubblicazione di avvisi importanti (con estratto e link diretto ad `/corsi`), evitando spam sui messaggi ordinari.
      - Nei Messaggi Diretti (DM 1-a-1) e nelle risposte dello staff su ticket `/assistenza`: inoltro email immediato allo studente destinatario.
    - **Livello 3 — Badge Rosso Numerico (`🔴 N nuovi`) in Tempo Reale in `/corsi`**: contatore visivo dei messaggi non letti sui 2 pulsanti `💬 Canale Studenti` (`#community-studenti`) e `🛟 Assistenza 1-a-1` con persistenza `last_read_at` locale/sessione.
- **Fase 4 Chat & Workspace (Slash Commands & Webhook HMAC) + Pulizia Canali COMPLETATI & DEPLOYATI (`v2.3.0 • Build #117`)**:
  - **Pulizia Canali di Default & Fix Doppio `# #`**:
    - Ridotto `SYSTEM_CHANNEL_NAMES` in `src/app/actions/chat.ts` e `SYSTEM_CHANNELS` in `src/app/(dashboard)/chat/page.tsx` al solo canale `#generale` (eliminati i 5 canali fittizi `progetti`, `marketing-social`, `corsi-academy`, `commerciale-b2b`, `idee-innovazione` per un workspace minimale e privo di bloat).
    - Risolto il duplicato visivo `# #generale` nella sidebar sinistra con visualizzazione pulita del nome canale accanto all'icona `#` o `🔒`.
  - **Fase 4A: Slash Commands Operativi (`/task`, `/lead`, `/ai`)**:
    - Nuova Server Action `executeSlashCommandAction` in `src/app/actions/chat.ts` con isolamento rigoroso dei ruoli:
      - `/task [titolo] | [descrizione]`: crea istantaneamente l'attività in `public.tasks` e notifica il canale con link a `/lavori`.
      - `/lead [nome azienda] [valore €]`: riservato ai membri interni del team (bloccato per `collaborator`), inserisce il contatto in `public.clients` nella colonna *Nuovo Lead* con tag trasparente `[STAGE:nuovo_lead|VAL:...]` e placeholder email deterministico se assente.
      - `/ai [richiesta]`: interroga il client NVIDIA NIM (`generateNvidiaCompletion` con modello `nvidia/nemotron-3-ultra-550b-a55b`) e pubblica la risposta formattata direttamente nel canale.
    - Popup di autocompletamento intelligente sopra la barra di input principale in `chat/page.tsx` quando l'utente digita `/` (filtrando `/lead` per i collaboratori esterni).
  - **Fase 4B: Webhook Inbound Blindato HMAC (`src/app/api/webhooks/chat/route.ts`)**:
    - Endpoint API POST ad alte prestazioni con firma crittografica obbligatoria HMAC SHA-256 (`x-signature-256` o `x-hub-signature-256`) verificata a tempo costante con `crypto.timingSafeEqual`.
    - Risoluzione automatica di un profilo `admin`/`dev` esistente per soddisfare il vincolo DB `sender_id REFERENCES profiles(id)`.
    - Inserimento del messaggio formattato in `public.messages` e broadcast Web Push istantaneo a tutte le sottoscrizioni attive senza bloccare l'endpoint.
  - **Guardia Anti-Sovrascrittura Membri Interni & Precedenza Collaboratori**:
    - In `src/app/actions/chat.ts`: blocco preventivo contro la declassazione di account di membri del team.
    - In `src/components/layout/navbar.tsx`: precedenza deterministica al badge `COLLABORATOR`.
    - In `chat/page.tsx`: mappatura automatica collaboratori sui membri del team.
  - **PROSSIMO BLOCCO — Fase 5: Inbox Assistenza Nativa + 2 Tasti nella stanza studenti (`/corsi`) (`💬 Canale Studenti #studenti-academy` & `🛟 Assistenza 1-a-1`) con rimozione completa di Telegram**.
- **Fix Contrasto Dark Mode, Invito Collaboratore Esterno 1-Click & Cambio Password COMPLETATI & DEPLOYATI (`v2.3.0 • Build #116`)**:
  - Eliminazione di tutte le classi non standard `slate-850` e `slate-750` in `src/app/(dashboard)/chat/page.tsx`, sostituite con `slate-800` e `slate-750` -> `slate-700` per garantire contrasto ottimale, piena leggibilità e colori nitidi in Dark Mode.
  - Implementazione del ruolo `collaborator` a livello di database ([supabase/migrations/20261116221500_add_collaborator_role.sql](file:///Users/marco/Sviluppo/Progetti/Prgetto%20piattaforma%20lavoro%20condivisa/supabase/migrations/20261116221500_add_collaborator_role.sql)) e tipo TypeScript `UserRole`.
  - Architettura resiliente duale con `.chat-collaborators.json` e priorità assoluta su `user.user_metadata?.role === 'collaborator'`: isolamento immediato garantito anche prima dell'esecuzione della migrazione sullo schema Postgres remoto.
  - Box espandibile `+ Crea e Invita Collaboratore Esterno` nel modale di creazione canale con generazione automatica credenziali temporanee, salvataggio profilo, spunta automatica tra i membri del canale e pulsante `📋 Copia Messaggio Invito`.
  - Tasto `👥 Membri (N)` nell'header dei canali privati/custom: modale dedicato per gestire i membri autorizzati e invitare collaboratori al volo direttamente nel canale.
  - Modale cambio password in `navbar.tsx`: cambio password volontario tramite icona `🔑` nella topbar e forzato al primo accesso per gli utenti marcati con `must_change_password: true`.
  - Isolamento all'accesso: per il ruolo `collaborator`, bypass totale del canale `#generale` con selezione automatica del primo canale assegnato o empty state dedicato.
- **Fase 3 Chat & Workspace Stile Slack COMPLETATA & DEPLOYATA (`v2.3.0 • Build #115`)**:
  - Implementati canali dinamici e privati (`🔒`) con gestione `member_ids` e modale interattivo di creazione (nome slug, descrizione, switch pubblico/privato e selezione membri autorizzati) con storage ibrido duale (`.chat-channels.json` + `public.chat_channels`).
  - Implementata la sezione **Messaggi Diretti (DM 1-a-1)** nella sidebar: conversazioni private dirette con routing su `dm:${sortedIds}`, badge numerico non letti specifico per singolo collega e header contestuale.
  - Notifiche Web Push riservate per DM e canali privati indirizzate esclusivamente ai destinatari autorizzati (`recipientUserIds`) e **zero leak su Telegram** (i messaggi confidenziali non vengono mai inoltrati al gruppo Telegram).
  - Aggiunta barra di ricerca messaggi (`🔍 Cerca`) nell'header del canale: filtraggio istantaneo della timeline per parole chiave nel testo o nomi di file allegati.
  - Blindatura Zero-Leak del ruolo `collaborator` (Guest stile Slack):
    - Nel Middleware Next.js: redirect forzato a `/chat` se un collaboratore tenta di accedere a `/clienti`, `/posta`, `/cervello`, `/growth-studio`, `/workshop-agenti`, `/corsi`, `/zona-compiti`, `/convert`.
    - Nella Sidebar: mascheramento automatico di tutte le sezioni riservate, mostrando al collaboratore esclusivamente le voci operative consentite (`/chat`, `/lavori`, `/calendario`, `/videocall`, `/files`).
    - Nella Chat: il collaboratore vede ed accede unicamente ai canali a cui è stato espressamente invitato.
  - Migrazione database [supabase/migrations/20261116214000_chat_phase3_channels_collaborators.sql](file:///Users/marco/Sviluppo/Progetti/Prgetto%20piattaforma%20lavoro%20condivisa/supabase/migrations/20261116214000_chat_phase3_channels_collaborators.sql).
- **Fix Viewport 100dvh, Scroll Isolato & Chiusura Thread COMPLETATO & DEPLOYATO (`v2.3.0 • Build #114`)**:
  - Bloccato il viewport di `/chat` a `100dvh max-h-[100dvh] overflow-hidden` sia sul root shell sia sulla colonna principale (eliminando qualsiasi scrollbar esterna della pagina).
  - Eliminato il metodo intrusivo `scrollIntoView` sui messaggi e sul thread: ora lo scorrimento verso il basso opera esclusivamente all'interno dei rispettivi contenitori interni con `scrollTo({ top: scrollHeight })`.
  - Aggiunta chiusura rapida del Thread con il tasto fisico `Esc` e inserito pulsante `✕ Chiudi` esplicito e ben visibile nell'header del pannello Thread.
  - Riorganizzata la colonna sinistra canali con `overflow-hidden`: i 6 Canali Tematici rimangono stabilmente ancorati in alto (`shrink-0`), mentre la lista Team sottostante scorre indipendentemente solo se necessario.
- **Fase 2 Chat & Workspace Stile Slack COMPLETATA & DEPLOYATA (`v2.3.0 • Build #113`)**:
  - Implementato Thread laterale a scomparsa da `360px` su desktop (drawer a schermo intero su mobile) collegato a `parent_message_id` con visualizzazione messaggio padre originale, elenco cronologico risposte e input bar dedicata.
  - Sotto i messaggi radice con risposte compare il pulsante stile Slack `💬 X risposte • Vedi thread`.
  - Reazioni emoji rapide (`✅`, `👀`, `🔥`, `👍`) con pill contatore interattiva e toggle ottimistico a zero latenza sincronizzato in tempo reale su `public.messages` tramite Server Action `toggleMessageReactionAction`.
  - Badge numerici per messaggi non letti sui canali con persistenza locale `last_read_at` e ascolto Realtime globale su tutti i canali del team.
  - Sistema di `@Menzioni` con popup autocomplete (`@tutti`, `@Marco`, `@Stefano`, `@Lorenzo`), evidenziazione a pill nel testo dei messaggi e notifiche Web Push mirate.
  - Migrazione database [supabase/migrations/20261116211000_chat_phase2_threads_reactions.sql](file:///Users/marco/Sviluppo/Progetti/Prgetto%20piattaforma%20lavoro%20condivisa/supabase/migrations/20261116211000_chat_phase2_threads_reactions.sql).
- **Fase 1 Chat & Workspace Stile Slack COMPLETATA & DEPLOYATA (`v2.3.0 • Build #112`)**:
  - Implementata architettura PWA con `public/manifest.json` (`AIutiamoci Workspace`, display standalone) e `public/sw.js` (gestione ciclo di vita, notifiche ed evento click con focus/navigate finestra).
  - Web Push VAPID nativo zero-dipendenze (`src/lib/web-push.ts`) con RFC 8291 (`aes128gcm`) e chiavi P-256 (ES256), migrazione database Supabase `public.push_subscriptions` e fallback resiliente locale `.push-subscriptions.json`.
  - Nuove Server Action (`getVapidPublicKeyAction`, `savePushSubscriptionAction`, `sendTestPushNotificationAction`) e invio concorrente push + telegram in `notifyChatMessageAction`.
  - Layout `/chat` full-bleed ergonomico (`src/components/layout/dashboard-shell.tsx` a `h-[calc(100dvh-4rem)]`, sidebar canali fissa a 250px su desktop, drawer 100dvh su mobile, safe-area inset su iPhone/iPad e pulsante interattivo Web Push nel Channel Header).
  - Esclusione deterministica di `manifest.json` e `sw.js` dal Middleware Next.js e Supabase per prevenire redirect 307 in produzione.
- **ROADMAP ALLINEAMENTO CHAT & WORKSPACE A SLACK (Fasi 1-5)**:
  - *Fase 1*: ✅ COMPLETATA & DEPLOYATA (Build #112)
  - *Fase 2*: ✅ COMPLETATA & DEPLOYATA (Build #113)
  - *Fase 3*: ✅ COMPLETATA & DEPLOYATA (Build #115)
  - *Fase 4*: ✅ COMPLETATA & DEPLOYATA (Build #117)
  - *Fase 5*: ✅ COMPLETATA & DEPLOYATA (Build #119 — migrazione DB applicata, deploy su VPS2 online)
- **CRM Commerciale Stile Torch / GoHighLevel (`/clienti`) & Pagina Pubblica Prenotazione (`/prenota`) COMPLETATI (`ba65bc7`)**:
  - **Pipeline Vendite in `/clienti` (`src/app/(dashboard)/clienti/page.tsx`)**: 3 KPI Cards commerciali (`Pipeline in Trattativa €`, `Fatturato Acquisito Vinto €`, `Call & Proposte Calde`), switch vista `[ 💰 Pipeline Vendite | 📋 Lista Contatti ]`, Kanban a 4 fasi (`Nuovo Lead`, `Call Fissata`, `Proposta / Preventivo`, `Cliente Vinto`) con valore economico `€`, frecce di avanzamento rapido (`←`/`→`) persistite in `notes` (`[STAGE:...|VAL:...]`) e bottone WhatsApp 1-click (`wa.me`).
  - **Booking Pubblico `/prenota` (`src/app/prenota/page.tsx` + `src/lib/supabase/middleware.ts`)**: Pagina pubblica `https://aiutiamoci.cloud/prenota` accessibile senza login (HTTP 200 OK) per aziende B2B e corsisti Academy, sincronizzata con le disponibilità reali del team.
  - **Auto-Lead Sync (`src/app/api/calendar/availability/route.ts`) & Copia Link (`/calendario`)**: Ogni call prenotata da `/prenota` crea l'evento in `calendar_events` e inserisce/aggiorna automaticamente il contatto in `public.clients` nella colonna **`Call Fissata`** (`€ 1.500` B2B / `€ 199` Academy). Aggiunto pulsante `🔗 Copia Link Prenotazione` nell'header di `/calendario`.
- **Restyle Navigazione UI/UX Stile Torch (`b973c33`) & Dossier CRA / Guide Corso Base (`0cf9901`)**:
  - Sidebar organizzata in 4 macro-gruppi con espansione fluida in hover, rimozione topbar secondaria ridondante in `dashboard-shell.tsx` e fix saluto dinamico in `page.tsx`.
  - Dossier Esecutivo di Conformità Cyber Resilience Act (`DOSSIER_CONFORMITA_CRA_PIATTAFORMA_CONDIVISA.pdf`) e guide live Corso Base allineate.
- **Card 3D Parallax Tilt con Logo Pop-Out & Link Globale su Home Page (`/`) COMPLETATO & DEPLOYATO IN PRODUZIONE**:
  - Creato componente isolato [src/components/ui/tilt-card-3d.tsx](file:///Users/marco/Sviluppo/Progetti/Prgetto%20piattaforma%20lavoro%20condivisa/src/components/ui/tilt-card-3d.tsx):
    - Calcolo dell'inclinazione 3D dinamica tramite coordinate mouse e prospettiva 800px.
    - Header (Logo + Titolo) con eiezione tridimensionale marcata (`translateZ 130px`) e slittamento in parallasse.
    - Logo (`/images/logo_icon_dark.png`) con effetto "3D nel 3D": si solleva ulteriormente (`translateZ 45px`) e si ingrandisce in modo evidente (`scale 1.30x`).
    - Glare speculare dinamico che segue la luce del cursore.
    - **Link globale**: L'intera superficie della card è cliccabile (Card 1 porta ad `/academy`, Card 2 a `https://www.mark2.cloud`), senza obbligare l'utente a cliccare solo sul piccolo bottone in fondo.
    - **Protezione Mobile / Smartphone**: Disabilitata l'inclinazione 3D per dispositivi touch (`hover: hover and pointer: fine`), mantenendo schede piatte, pulite, responsive e performanti.
  - Aggiornato [src/app/page.tsx](file:///Users/marco/Sviluppo/Progetti/Prgetto%20piattaforma%20lavoro%20condivisa/src/app/page.tsx) con preservazione esatta di tutti i testi e punti elenco.
  - Build Next.js completato con successo (37/37 route statiche/dinamiche ottimizzate).
  - Deploy completato su VPS2 (`100.123.212.30`), PM2 `aiutiamoci` riavviato e online su `https://aiutiamoci.cloud`.
  - Repository sincronizzato su GitHub `main` (commit `f94eef3`).
- **Track Formativa Verticale "Cybersecurity & AI Defense" (Pronta per Registrazione Video)**:
  - Strutturato il syllabus completo in 5 moduli con copioni, dimostrazioni a schermo, codice vulnerabile vs codice sicuro e prompt di difesa:
    1. *Modulo 1*: Vibe Coding & OWASP Top 10 (SQL Injection bypass `' OR '1'='1` e Prepared Statements).
    2. *Modulo 2*: Database Fort Knox (Row Level Security RLS su PostgreSQL/Supabase & Zero-Trust).
    3. *Modulo 3*: Prompt Injection & Jailbreak (Direct/Indirect injection su agenti AI, delimitatori XML).
    4. *Modulo 4*: API, Webhook & n8n Blindati (Firma crittografica HMAC, protezione token e .env).
    5. *Modulo 5*: Ethical Hacking con l'IA (Audit statico SAST automatizzato con prompt Lead Security Auditor).
  - Documento guida persistito in [TRACK_CYBERSECURITY_AI_DEFENSE.md](file:///Users/marco/Sviluppo/Progetti/Prgetto piattaforma lavoro condivisa/TRACK_CYBERSECURITY_AI_DEFENSE.md) e nel Vault Obsidian (`01_Progetti/`).
  - Modalità operativa concordata: Screencast pulito del codice a 60fps preparato per Stefano, che registrerà la voce narrante e l'intro con il setup audio/video calibrato.
- **Sidebar Fluida Neon Dock & Ottimizzazione Spazio Schermo COMPLETATO & DEPLOYATO IN PRODUZIONE**:
  - Implementata sidebar fluttuante a capsula compatta (68px a riposo con icone centrate e micro-dot glowing) che si espande fluidamente a 260px in hover con glowing neon blu/cyan e tasto Pin/Unpin (preferenza persistita in `localStorage`).
  - L'area di lavoro centrale guadagna oltre 170px di larghezza utile su tutte le sezioni (`/posta`, `/lavori`, `/corsi`).
  - Risolti i vincoli Edge/Webpack su `middleware.ts` (`runtime = 'nodejs'`) e corretto il plugin Tailwind in ESM (`tailwind.config.ts`).
  - Push su GitHub `main` (commit `59524c1`) e deploy su VPS Oracle (`80.225.81.150`), PM2 `aiutiamoci` riavviato e online su `https://aiutiamoci.cloud`.
- **Gestione Cestino & Eliminazione Definitiva Aruba IMAP (`/posta`) COMPLETATO**:
  - Risolto il problema del ripescaggio delle email cancellate ad ogni sincronizzazione:
    - **Fase 1 (Cestino / Soft Delete)**: Click su "Elimina" da Posta in arrivo/Inviate/Archivio sposta la mail nello stato `trash`. La mail resta recuperabile a 1-click con "Ripristina" e non viene più mostrata nelle cartelle attive né riscaricata.
    - **Fase 2 (Svuota Cestino / Hard Delete)**: Quando si elimina dal Cestino, `permanentlyDeleteEmails` registra i `message_id` nella tabella blacklist `deleted_email_identifiers` (garantendo che nessun sync futuro li re-importi), si connette via `ImapFlow` alle caselle Aruba ed elimina fisicamente i messaggi dal server remoto (`messageDelete` con `EXPUNGE`), rimuovendo infine il record da Supabase.
  - Aggiunta pill **Cestino** con contatore `counts.trash` accanto ad Archivio.
  - Creata migrazione SQL: [supabase/migrations/20261011010000_email_trash_and_deleted_identifiers.sql](file:///Users/marco/Sviluppo/Progetti/Prgetto%20piattaforma%20lavoro%20condivisa/supabase/migrations/20261011010000_email_trash_and_deleted_identifiers.sql).
  - Typecheck verificato (`npx tsc --noEmit` 0 errori).
- **Riorganizzazione UI/UX Posta Condivisa (`/posta`) & Auto-Sync n8n IMAP COMPLETATO**:
  - Risolto auto-sync periodico n8n via Supabase (`knowledge_items` con categoria `system_imap_config` e timeout 10s per caselle Aruba `aiutiamoci.cloud` e `mark2.cloud`). Workflow esportato in `workflows/n8n_imap_auto_sync.json`.
  - Riorganizzato il layout a 2 colonne: da proporzione compressa `5 / 7` a `4 / 8` (rapporto 1:2), assegnando oltre il 67% della larghezza dello schermo alla lettura delle email e alla composizione.
  - Semplificata la toolbar di sinistra: sostituiti i pulsanti impilati verticalmente con pill compatte e riga unificata a 2 selettori (Casella attiva + Cartelle).
  - Allineata la colonna destra di visualizzazione messaggio ed invio risposta.
  - Verifica statica TypeScript superata con successo (`npx tsc --noEmit`).
- **Stanze Aziendali B2B & Video Custom per Corsi Corporate (`/corsi`) COMPLETATO (Opzione 1 Allineata)**:
  - Creata architettura DB multi-tenant isolata con tabelle `corporate_cohorts` e `corporate_custom_lessons` + colonna `cohort_id` su `student_codes` ([supabase/migrations/20261011000000_corporate_cohorts_and_custom_lessons.sql](file:///Users/marco/Sviluppo/Progetti/Prgetto%20piattaforma%20lavoro%20condivisa/supabase/migrations/20261011000000_corporate_cohorts_and_custom_lessons.sql)).
  - Server Actions B2B dedicate in [src/app/actions/corporate-cohorts.ts](file:///Users/marco/Sviluppo/Progetti/Prgetto%20piattaforma%20lavoro%20condivisa/src/app/actions/corporate-cohorts.ts) per gestione coorti, generazione batch di codici con prefisso aziendale personalizzato (es. `AI-AZIENDA-XXXX`), caricamento lezioni/video custom e dispense.
  - UI integrata in [src/app/(dashboard)/corsi/page.tsx](file:///Users/marco/Sviluppo/Progetti/Prgetto%20piattaforma%20lavoro%20condivisa/src/app/(dashboard)/corsi/page.tsx):
    - **Lato Studente Aziendale**: Riconoscimento automatico della coorte con badge "Stanza Privata: [Azienda]", sblocco playlist masterclass/video esclusivi integrati nel player didattico.
    - **Lato Admin/Team**: Nuova sub-tab `b2b_cohorts` nel registro corsi con modale per creare la stanza aziendale, generare codici e caricare video su misura (docente esterno/interno, dispense PDF, prompt riservati).
  - Validazione statica Next.js 15: compilazione 100% verde (`npm run build`, 38/38 route statiche/dinamiche ottimizzate).
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
- **Selettore Contatti dal Database nel Calendario (`/calendario`) & Supporto Multi-Ruolo (Studenti / Fornitori) COMPLETATO**:
  - Aggiunto pulsante rapido `[👥 Scegli dal Database]` nella sezione destinatari del modale di creazione evento.
  - Implementata server action `getSelectableRecipientsAction` in `src/app/actions/event-invitations.ts` per recuperare in modo unificato contatti da `student_codes`, `clients` e `waitlist_leads`.
  - Risolta la gestione della **doppia posizione (es. Studente + Fornitore/Partner)**: unificata la mappa contatti preservando l'array dei ruoli `sources: [...]`, l'azienda e il dettaglio multi-qualifica.
  - Aggiunto il filtro `🤝 Fornitori` nella modale del calendario, badge multipli contestuali (Studente, Fornitore, Cliente, Lead) e ricerca estesa anche per azienda.
  - Finestra di selezione modale con filtri per categoria (Tutti, Studenti, Clienti, Fornitori, Lead), barra di ricerca live e checkbox per selezione puntuale.
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

