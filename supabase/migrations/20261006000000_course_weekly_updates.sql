-- Migration: course_weekly_updates
-- Tabella per News generali sull'AI, Tutorial pratici sul Corso Base e Anteprime Agenti

CREATE TABLE IF NOT EXISTS public.course_weekly_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('news', 'prompt_tutorial', 'agent_preview', 'video')),
  badge_label TEXT NOT NULL,
  published_at DATE NOT NULL DEFAULT CURRENT_DATE,
  summary TEXT NOT NULL,
  full_content TEXT NOT NULL,
  prompts JSONB DEFAULT '[]'::jsonb,
  video_url TEXT,
  resources_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Abilita RLS
ALTER TABLE public.course_weekly_updates ENABLE ROW LEVEL SECURITY;

-- Policy di Lettura: tutti gli utenti autenticati possono leggere gli aggiornamenti attivi
CREATE POLICY "Tutti possono leggere gli aggiornamenti attivi"
  ON public.course_weekly_updates
  FOR SELECT
  USING (is_active = true);

-- Policy di Scrittura/Modifica: solo admin e dev del team
CREATE POLICY "Admin e Dev possono gestire gli aggiornamenti"
  ON public.course_weekly_updates
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'dev')
    )
  );

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_course_weekly_updates_published ON public.course_weekly_updates (published_at DESC);
CREATE INDEX IF NOT EXISTS idx_course_weekly_updates_category ON public.course_weekly_updates (category);

-- Seed iniziale con contenuti reali di valore per il Corso Base e anteprime Agenti
INSERT INTO public.course_weekly_updates (title, category, badge_label, published_at, summary, full_content, prompts)
VALUES
(
  'Come Ottenere Risposte Perfette al Primo Tentativo: Il Framework RCCF',
  'prompt_tutorial',
  'TUTORIAL PROMPT',
  '2026-10-05',
  'La differenza tra un prompt generico che allucina e un prompt professionale che produce un risultato aziendale impeccabile.',
  'Nel Corso Base abbiamo visto che i modelli IA non sanno chi siete né qual è il vostro standard aziendale a meno che non glielo diciate esplicitamente. 

Il metodo più veloce per non sprecare tempo in correzioni è usare sempre i 4 pilastri del Framework RCCF:
1. **Ruolo (Role)**: Chi è l''IA? (es. Senior Consulente B2B, Copywriter Diretto, Analista Dati).
2. **Contesto (Context)**: In che situazione ci troviamo? Chi è il destinatario?
3. **Compito (Constraint / Task)**: Cosa deve fare esattamente passo dopo passo?
4. **Formato (Format)**: Come deve restituire il risultato? (es. Tabella a 3 colonne, bullet list senza preamboli, massimo 120 parole).

Qui sotto trovi un prompt universale pronto da copiare e adattare alle tue esigenze quotidiane.',
  '[
    {
      "title": "Prompt Universale RCCF per Revisione Documenti & Email",
      "prompt": "Agisci come un Direttore Commerciale B2B esperto in PMI italiane. \n\nHo preparato questa bozza di risposta per un cliente che richiede chiarimenti sui nostri tempi di consegna:\n\"\"\"\n[INCOLLA QUI IL TUO TESTO]\n\"\"\"\n\nIl tuo compito è revisionare il testo seguendo questi vincoli rigidi:\n1. Tono professionale, empatico ma autorevole.\n2. Riduci la lunghezza eliminando parole inutili e giri di parole.\n3. Evidenzia la soluzione proposta nei primi due paragrafi.\n4. Formato di output: restituisci prima la versione migliorata pronta all''invio, e sotto in 3 punti secchi le motivazioni dei cambiamenti apportati.",
      "notes": "Adattabile per offerte commerciali, risposte a fornitori o comunicazioni interne."
    }
  ]'::jsonb
),
(
  'Ragionamento Ibrido e Contesti Estesi: Quando Conviene Attivare il Thinking',
  'news',
  'NEWS AI',
  '2026-10-02',
  'Analisi pratica sull''uso delle catene di pensiero profondo vs risposte standard a latenza zero per il lavoro aziendale.',
  'Le novità introdotte negli ultimi modelli di punta (come Claude 3.7 con Extended Thinking e Gemini 2.5) hanno portato una nuova opzione: scegliere tra **risposta immediata** e **ragionamento profondo (Reasoning / Thinking)**.

### Quando attivare il Thinking:
- **Analisi di Contratti o Normative**: Quando l''IA deve verificare clausole incrociate e non può permettersi sviste.
- **Formule e Fogli di Calcolo Complessi**: Quando deve combinare più condizioni logiche prima di scrivere la formula.
- **Piani Strategici Multi-Step**: Quando il task richiede di pianificare 5-10 azioni sequenziali.

### Quando NON serve (e fa perdere solo tempo):
- Scrittura di email brevi e messaggi operativi.
- Riassunti di testi semplici e sintesi veloci.
- Traduzioni e correzioni grammaticali.',
  '[]'::jsonb
),
(
  'Prompting per Fogli di Calcolo: Pulire e Formattare Dati CSV in 30 Secondi',
  'prompt_tutorial',
  'TUTORIAL PROMPT',
  '2026-09-28',
  'Come dare in pasto all''IA elenchi caotici o estratti gestionali per ottenere tabelle pulite pronte da incollare in Excel.',
  'Uno dei compiti più noiosi in azienda è ripulire elenchi disordinati di contatti, indirizzi o codici articolo esportati dal gestionale.

Invece di perdere ore a sistemare celle a mano, possiamo chiedere al modello di normalizzare i dati con un vincolo di output Markdown o CSV.',
  '[
    {
      "title": "Prompt per Normalizzazione Elenchi & Tabelle",
      "prompt": "Agisci come Data Cleansing Specialist.\n\nEcco un elenco grezzo di contatti con dati disordinati:\n\"\"\"\n[INCOLLA QUI I TUOI DATI SPORCHI]\n\"\"\"\n\nCompito:\n1. Separa i dati in 4 colonne: Nome e Cognome, Azienda, Email, Città/Provincia.\n2. Correggi le maiuscole/minuscole nei nomi e normalizza i suffissi societari (es. Srl, SpA).\n3. Se un campo manca, inserisci \"N/D\".\n4. Restituisci il risultato ESCLUSIVAMENTE come tabella Markdown pronta da copiare e incollare direttamente in Excel/Fogli Google.",
      "notes": "Incolla la tabella risultante direttamente in Excel premendo Ctrl+V / Cmd+V."
    }
  ]'::jsonb
),
(
  'Dalla Singola Chat agli Agenti Autonomi: Come Funziona una Squadra AI',
  'agent_preview',
  'ANTEPRIMA AGENTI',
  '2026-09-21',
  'Cosa succede quando un modello smette di essere una chat passiva e comincia a coordinare ricerche, bozze e approvazioni in autonomia.',
  'Nel Corso Base impariamo a dialogare con l''IA "uno a uno": tu fai una domanda, l''IA risponde. 

Nel **Corso Avanzato sugli Agenti AI**, il paradigma cambia radicalmente:
Non sei più tu a dover fare ogni singolo passaggio. Creiamo una **Squadra di Agenti Specializzati** che collaborano tra loro:

1. **Marco (Director)**: Riceve il tuo obiettivo (es. *"Trova 5 hotel a Rimini per offerta software"*), pianifica la strategia e assegna i compiti.
2. **Stefano (Scout)**: Naviga il web in autonomia, estrae i dati reali e verifica le email aziendali.
3. **Chiara (Copywriter)**: Scrive le bozze commerciali iper-personalizzate per ciascun contatto usando il framework RCCF.
4. **Lorenzo (Closer & Dispatch)**: Prepara l''invio e chiede la tua autorizzazione prima di registrare tutto sul CRM.

Questo è il futuro dell''automazione aziendale: **l''imprenditore guida e valida, la squadra esegue.**',
  '[]'::jsonb
),
(
  'Gestire Reclami e Richieste Difficili: Il Prompt \"Cuscino & Soluzione\"',
  'prompt_tutorial',
  'TUTORIAL PROMPT',
  '2026-09-14',
  'Tecnica di prompting per trasformare una situazione di tensione commerciale in un''opportunità di fidelizzazione.',
  'Quando un cliente è scontento per un ritardo o un errore, la risposta d''impulso rischia di peggiorare le cose. 

La tecnica del "Cuscino & Soluzione" consiste nel far riconoscere all''IA la frustrazione del cliente (il cuscino) per poi passare immediatamente a una proposta concreta e misurabile (la soluzione), senza scuse difensive.',
  '[
    {
      "title": "Prompt per Risposta a Reclamo Complesso",
      "prompt": "Agisci come Responsabile Customer Success & Relazioni Clienti Senior.\n\nHo ricevuto questo reclamo da un cliente importante:\n\"\"\"\n[INCOLLA QUI IL RECLAMO DEL CLIENTE]\n\"\"\"\n\nLa nostra posizione reale:\n- Causa del problema: [es. ritardo fornitore esterno]\n- Soluzione che possiamo offrire subito: [es. consegna parziale domani + sconto 10% sul prossimo ordine]\n\nScrivi una risposta email che:\n1. Ringrazi il cliente per la segnalazione e riconosca il disagio senza usare toni burocratici o difensivi.\n2. Presenti la soluzione con date e azioni certe.\n3. Chiuda con un invito cordiale a una breve telefonata di allineamento.",
      "notes": "Ottimo per disinnescare tensioni con clienti storici o ordini urgenti."
    }
  ]'::jsonb
);
