# 📘 Guida Operativa Team Hub: Piattaforma Condivisa & Agenti AI
> **Manuale d'uso per i soci e collaboratori del team.**  
> *Versione completa con Marketing APEX, Suite Agenti AI, Nemotron NIM e Secondo Cervello.*

---

## 🎯 1. Panoramica Generale della Piattaforma

La piattaforma **Team Hub** è il centro operativo integrato del team per:
1. Orchestrazione e assegnazione compiti con **Agenti AI autonomi** (*Human-in-the-Loop*).
2. Gestione della **posta aziendale** centralizzata con assistente di risposta intelligente.
3. Archivio documentale cloud con **sintesi automatica dei file**.
4. **Secondo Cervello** e Knowledge Vault aziendale per prompt, documenti e deliverable.
5. Gestione **iscritti e corsi formativi** con approvazione e generazione automatica dei codici.
6. **Marketing & Campagne** con simulatore ROI e funnel APEX.
7. Suite e piattaforma esterna **Agenti AI**.

Tutte le attività sono sincronizzate in **tempo reale (Realtime Supabase)** con notifiche immediate sul canale **Telegram** del team.

---

## 📋 2. Bacheca Lavori & Compiti (`/lavori`)

La bacheca Kanban organizza le attività quotidiane su 4 colonne strategiche:

```
[ Da Fare ] ➡️ [ In Corso ] ➡️ [ 🟣 In Revisione (AI / Team) ] ➡️ [ ✅ Completato ]
```

### Come creare e gestire i compiti:
1. **Nuovo Compito:** Clicca sul pulsante viola `+ Nuovo Compito` in alto a destra.
2. **Assegnazione:**
   - **A un membro umano:** Seleziona il nome del socio dal menu a tendina.
   - **All'Agente AI:** Seleziona `🤖 Nemotron Lead Agent (Agente Autonomo)`.
3. **Ambiti & Progetti:** Associa ogni compito a un ambito (*Corsi Formativi*, *Consulenze B2B*, *Sviluppo Agenti*).

### ⚡ Flusso Human-in-the-Loop (Lavorare con l'Agente AI):
L'intelligenza artificiale **richiede sempre la supervisione e la validazione del team**:
1. **Avvio:** Sulla card del compito assegnato a Nemotron, clicca su **`⚡ Esegui con Agente AI`**.
2. **Elaborazione:** L'agente genera la soluzione, l'analisi o il codice e sposta automaticamente la card nella colonna **"In Revisione"**.
3. **Revisione Umana:** Clicca su **`👀 Revisiona Output Agente`** per aprire la finestra di validazione.
4. **Scelta:**
   - **`✅ Approva & Completa Task`**: Convalida il lavoro, archivia l'output nel Secondo Cervello e completa il compito.
   - **`🔄 Richiedi Modifiche`**: Inserisci un feedback testuale e rimanda il task all'agente per affinarlo.

---

## 📢 3. Marketing & Campagne (`/marketing`)

L'hub strategico per la crescita, le sponsorizzate e la gestione dei lanci secondo il framework **APEX Growth**:

### Funzionalità chiave:
1. **Simulatore Economico & Calcolatore ROI:**
   - Inserisci target follower, CPC (costo per click), tasso di conversione (%) e prezzo del prodotto.
   - Calcola in tempo reale la stima di **Spesa Pubblicitaria (Ad Spend)**, **Nuovi Clienti** e **Fatturato Lordo Previsto**.
2. **Piani di Lancio & Campagne:**
   - Monitoraggio delle campagne attive (Lancio Corsi, Campagne B2B, Lead Generation).
   - Suddivisione per canali (Instagram, LinkedIn, Meta Ads, Email Marketing).
   - Monitoraggio dello stato: *Bozza*, *In Corso*, *Completata*.

---

## 🤖 4. Sezione Agenti AI & Piattaforma Esterna

Nel menu laterale, la voce **Agenti AI** rappresenta il ponte tra la nostra piattaforma interna e l'ecosistema di agenti:
1. **Suite Esterna (`https://agenti-aiutiamoci.vercel.app/`):**
   - Accesso diretto con un click alla piattaforma esterna dedicata allo sviluppo, testing e deploy degli agenti per clienti e corsi avanzati.
2. **Integrazione Interna (NVIDIA Nemotron NIM):**
   - All'interno del nostro Team Hub, il motore AI (Nemotron 550B) alimenta direttamente i moduli di lavoro, la sintesi documentale e la posta elettronica.

---

## ✉️ 5. Posta Condivisa (`/posta`)

La sezione posta centralizza le email delle nostre caselle aziendali e fornisce un copilota AI per le risposte veloci.

### Caselle integrate:
- `team@aiutiamoci.cloud` *(Casella generale e risposte team)*
- `info@aiutiamoci.cloud`
- `assistenza@aiutiamoci.cloud`
- `info@mar2.cloud` & `support@mar2.cloud`

### Funzionalità:
1. **Filtro Caselle:** Filtra con i pulsanti superiori i messaggi di una specifica casella.
2. **✨ Analizza con AI:** Cliccando questo tasto su un'email ricevuta, l'AI estrae:
   - **Riassunto sintetico** in 2 frasi.
   - **Priorità e Categoria** (*Urgente*, *Supporto*, *Commerciale*, *Informativo*).
   - **Bozza di Risposta personalizzata** pronta per essere incollata nel modulo con 1 click.
3. **Invio Risposta:** Seleziona il mittente preferito (es. `Team Ti AIuto <team@aiutiamoci.cloud>`) e invia direttamente dal pannello.

---

## 📁 6. Documenti & File Cloud (`/files`)

L'archivio condiviso per documenti, contratti, slide, fogli di calcolo e materiale formativo.

### Funzionalità:
1. **Upload & Cartelle:** Carica file e organizza i documenti in sottocartelle con navigazione breadcrumb.
2. **Anteprima Istantanea:** Clicca sull'icona dell'occhio `👁️` per visualizzare immagini e PDF direttamente nel browser.
3. **✨ Sintesi Documentale AI:**
   - Clicca sull'icona viola `✨` accanto a qualsiasi documento per estrarre la sintesi esecutiva e i punti salienti.
   - **📌 Crea Compito da File:** Trasforma la sintesi del documento direttamente in un task su `/lavori` con un solo click.
   - **Salvataggio nel Secondo Cervello:** Tutte le sintesi confluiscono automaticamente nel database di conoscenza.

---

## 🧠 7. Secondo Cervello & Vault Conoscenza (`/cervello`)

Il database centrale dove risiede tutto il patrimonio di conoscenza aziendale, prompt, note e output dell'AI.

### Come utilizzarlo:
1. **Ricerca Globale:** Digita qualsiasi termine nella barra di ricerca per trovare prompt, note e documenti sintetizzati.
2. **Categorie Tematiche:**
   - `📁 Documenti & File AI`: Tutte le analisi e le sintesi dei documenti caricati.
   - `🤖 Agenti & Automazioni`: Tutti i deliverable e gli output approvati dei task AI.
   - `🎯 Prompting & RCCF`: Formule e prompt ingegnerizzati per ChatGPT / Claude / Gemini.
   - `✉️ Copy & Email B2B`: Template di vendita e sequenze email.
   - `📊 Excel & Analisi Dati`: Script e formule avanzate.
3. **Knowledge Graph:** Mappa visuale interattiva delle relazioni logiche tra note e progetti.

---

## 🎓 8. Corsi & Gestione Studenti (`/corsi`)

Gestione delle registrazioni e dei codici di accesso per i percorsi formativi (*AI Start* e *AI Pro*).

### Flusso Iscrizioni:
1. **Richieste dal Sito:** Quando un utente compila il questionario di candidatura su `aiutiamoci.cloud`, compare nella scheda *Registrazioni in Attesa*.
2. **Approvazione:** Cliccando su **"Approva"**:
   - Viene generato il codice univoco dello studente (es. `AI-START-XXXX`).
   - Il sistema invia **automaticamente l'email di benvenuto** con il codice e il link all'area studenti.
3. **Iscrizione Manuale:** Creazione di singoli codici o importazione massiva di corsisti.

---

## 💬 9. Chat Interna (`/chat`) & Notifiche Telegram

- **Chat di Team:** Riservata esclusivamente alla **comunicazione diretta tra i soci del team** nei canali `#generale` e `#progetti`.
- **Bot Telegram:** Invia notifiche in tempo reale per nuovi task, compiti AI in revisione, approvazioni, file caricati e nuovi studenti registrati.

---

### 💡 Come salvare questa guida in PDF:
1. Apri il file `GUIDA_OPERATIVA_TEAM.html` nel browser.
2. Premi `Ctrl + P` (o `Cmd + P` su Mac).
3. Seleziona **"Salva come PDF"**.
