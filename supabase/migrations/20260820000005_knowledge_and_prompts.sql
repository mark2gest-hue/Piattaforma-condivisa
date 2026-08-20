-- ==============================================================================
-- TABELLA PROMPT LIBRARY & KNOWLEDGE BASE (SECONDO CERVELLO)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.knowledge_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'prompting', -- 'prompting', 'copywriting', 'excel_data', 'visual_media', 'agents_workflows', 'course_notes'
  tags TEXT[] DEFAULT '{}',
  description TEXT,
  content TEXT NOT NULL,
  lesson_id INTEGER,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indici per ricerca rapida
CREATE INDEX IF NOT EXISTS idx_knowledge_category ON public.knowledge_items(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_lesson_id ON public.knowledge_items(lesson_id);

-- RLS Policies
ALTER TABLE public.knowledge_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all users to read knowledge items" ON public.knowledge_items;
CREATE POLICY "Allow all users to read knowledge items"
  ON public.knowledge_items FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow all users to insert knowledge items" ON public.knowledge_items;
CREATE POLICY "Allow all users to insert knowledge items"
  ON public.knowledge_items FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all users to update knowledge items" ON public.knowledge_items;
CREATE POLICY "Allow all users to update knowledge items"
  ON public.knowledge_items FOR UPDATE
  USING (true);

DROP POLICY IF EXISTS "Allow all users to delete knowledge items" ON public.knowledge_items;
CREATE POLICY "Allow all users to delete knowledge items"
  ON public.knowledge_items FOR DELETE
  USING (true);

-- Seed iniziale di Prompt e Framework Fondamentali
INSERT INTO public.knowledge_items (title, category, tags, description, content, lesson_id, is_featured)
VALUES
  (
    'Formula Segreta RCCF per Prompt Impeccabili',
    'prompting',
    ARRAY['rccf', 'fondamenta', 'framework'],
    'La struttura fondamentale per ottenere output precisi e privi di allucinazioni al primo colpo.',
    '### 🎯 Prompt Formula RCCF:

**1. [RUOLO]**: Agisci come un [Professione/Esperto es. Senior Marketing Strategist & Copywriter B2B].
**2. [CONTESTO]**: Lavoriamo per un''azienda che offre [descrivi prodotto o cliente], con target [identikit cliente] e con l''obiettivo di [scopo finale].
**3. [CONTENUTO]**: Sviluppa [azione precisa es. una sequenza di 3 email di presentazione, con tono empatico e senza gergo tecnico eccessivo].
**4. [FORMATO]**: Restituisci il risultato in formato Markdown, con elenchi puntati, massimo 200 parole per email e call-to-action chiara in fondo.',
    5,
    true
  ),
  (
    'Reverse Prompting (Intervista Guidata dall''IA)',
    'prompting',
    ARRAY['reverse-prompting', 'brainstorming'],
    'Chiedi all''IA di farti le domande necessarie per calibrare al millimetro la risposta.',
    'Voglio che tu crei [descrivi l''obiettivo, es. un piano di lancio per un nuovo servizio]. 

Prima di iniziare a scrivere, NON dare risposte generiche. 
Fammi una serie di 5 domande mirate una alla volta (o in blocco) per raccogliere tutte le informazioni sul mio target, budget, tempistiche e vincoli. 

Una volta che avrò risposto a tutte le domande, genererai il piano definitivo.',
    3,
    true
  ),
  (
    'Analisi Dati & Generatore Formule Excel Complesse',
    'excel_data',
    ARRAY['excel', 'dati', 'formule', 'cerca.x'],
    'Crea formule CERCA.X, INDICE/CONFRONTA o script VBA partendo dalla descrizione a parole tue.',
    'Agisci come un Data Analyst senior esperto di Microsoft Excel e Google Sheets.

Ho un foglio di calcolo con queste colonne:
- Colonna A: [Codice Prodotto]
- Colonna B: [Data Vendita]
- Colonna C: [Prezzo Unitario]
- Colonna D: [Quantità]

Scrivimi la formula esatta (compatibile con la versione italiana di Excel) per calcolare:
[Descrivi l''obiettivo, es. Il fatturato totale del mese di Agosto solo per i prodotti con codice che inizia per "AI-"].

Spiegami brevemente come funziona la formula passo dopo passo.',
    12,
    true
  ),
  (
    'Sequenza Email Commerciali B2B ad Alto Tasso di Risposta',
    'copywriting',
    ARRAY['email', 'b2b', 'vendita', 'commerciale'],
    'Struttura in 3 email di contatto e follow-up non invasivo per clienti aziendali.',
    'Agisci come un consulente commerciale B2B. 
Scrivi una sequenza di 3 email per presentare [Nome Servizio/Consulenza] al responsabile [Ruolo Decision Maker, es. Direttore Operativo]:

- **Email 1 (Valore & Curiosità)**: Lunghezza max 100 parole. Evidenzia un problema comune nel loro settore e come lo risolviamo in un terzo del tempo.
- **Email 2 (Caso Studio & Riprova Sociale - dopo 3 giorni)**: Mostra un risultato concreto ottenuto con un cliente simile.
- **Email 3 (Break-up Gentile - dopo 7 giorni)**: Ultimo contatto cordiale lasciando la porta aperta senza fare pressione.

Tono: Professionale, autorevole ma umano e diretto.',
    8,
    true
  ),
  (
    'Prompt Visivo Fotorealistico per Immagini Aziendali',
    'visual_media',
    ARRAY['midjourney', 'dalle', 'fotografia', 'immagini'],
    'Formula per generare grafiche e fotografie coerenti per presentazioni e slide.',
    'A high-end editorial commercial photograph of [soggetto principale, es. a modern tech team collaborating in a glass-walled office with laptops], glowing subtle neon blue and violet accents, natural soft cinematic lighting, golden hour ambient backlight, shot on 85mm f/1.8 lens, hyper-realistic, photorealistic textures, 8k resolution, clean composition, minimalist luxury aesthetics --ar 16:9 --v 6.0',
    9,
    true
  ),
  (
    'Istruzioni di Sistema per Agente di Supporto Automatico',
    'agents_workflows',
    ARRAY['agenti', 'system-prompt', 'n8n', 'webhook'],
    'Template di System Instruction per bot e assistenti autonomi aziendali.',
    'Sei l''Assistente Operativo di [Nome Azienda].
Il tuo scopo è assistere clienti e collaboratori fornendo risposte rapide, precise ed empatiche in italiano.

Regole Operative:
1. Basati esclusivamente sulle informazioni contenute nella documentazione aziendale fornita nel contesto.
2. Se un''informazione non è presente o hai dubbi, dichiara cordialmente che inoltrerai la richiesta al team umano invece di inventare.
3. Rispondi con frasi concise e punti elenco strutturati.
4. Mantieni sempre un tono professionale, cordiale e orientato alla soluzione.',
    18,
    true
  )
ON CONFLICT DO NOTHING;
