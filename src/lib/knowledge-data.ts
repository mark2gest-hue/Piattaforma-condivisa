export interface KnowledgeItem {
  id: string
  title: string
  category: 'prompting' | 'copywriting' | 'excel_data' | 'visual_media' | 'agents_workflows' | 'course_notes'
  tags: string[]
  description?: string
  content: string
  lesson_id?: number | null
  is_featured?: boolean
  created_at?: string
}

// Catalogo Predefinito di Alta Qualità (SECONDO CERVELLO)
export const DEFAULT_KNOWLEDGE_ITEMS: KnowledgeItem[] = [
  {
    id: 'k-1',
    title: 'Formula Segreta RCCF per Prompt Impeccabili',
    category: 'prompting',
    tags: ['rccf', 'fondamenta', 'framework', 'prompts'],
    description: 'La struttura fondamentale per ottenere output precisi e privi di allucinazioni al primo colpo.',
    content: `### 🎯 Formula Segreta RCCF (Modulo 5)

Usa questa struttura per ogni richiesta complessa:

1. **[RUOLO]**: Agisci come un [Professione/Esperto es. Senior Marketing Strategist B2B].
2. **[CONTESTO]**: Lavoriamo per un'azienda che offre [descrivi prodotto o cliente], con target [identikit cliente] e con l'obiettivo di [scopo finale].
3. **[CONTENUTO]**: Sviluppa [azione precisa es. una sequenza di 3 email di presentazione, con tono empatico e senza gergo tecnico].
4. **[FORMATO]**: Restituisci il risultato in formato Markdown, con elenchi puntati, massimo 200 parole e call-to-action chiara.`,
    lesson_id: 5,
    is_featured: true,
  },
  {
    id: 'k-2',
    title: 'Reverse Prompting (Intervista Guidata dall\'IA)',
    category: 'prompting',
    tags: ['reverse-prompting', 'brainstorming', 'strategia'],
    description: 'Chiedi all\'IA di farti le domande necessarie per calibrare al millimetro la risposta.',
    content: `### 🔄 Reverse Prompting (Modulo 3)

Voglio che tu crei [descrivi l'obiettivo, es. un piano di lancio per un nuovo servizio di consulenza]. 

Prima di iniziare a scrivere, NON dare risposte generiche. 
Fammi una serie di 5 domande mirate una alla volta (o in blocco) per raccogliere tutte le informazioni sul mio target, budget, tempistiche e vincoli. 

Una volta che avrò risposto a tutte le domande, genererai il piano definitivo strutturato.`,
    lesson_id: 3,
    is_featured: true,
  },
  {
    id: 'k-3',
    title: 'Few-Shot Prompting (Insegnare con Esempi Pratici)',
    category: 'prompting',
    tags: ['few-shot', 'esempi', 'precisione'],
    description: 'Fornisci 2-3 esempi concreti prima della richiesta per forzare l\'IA a seguire esattamente il tuo stile.',
    content: `### 💡 Few-Shot Prompting (Modulo 4)

Devi categorizzare e riassumere i feedback dei clienti seguendo esattamente questi esempi:

Esempio 1:
Input: "Il software è veloce ma il prezzo mensile è troppo alto."
Output: Categoria: Prezzo | Sentimento: Misto | Azione: Proporre piano annuale scontato.

Esempio 2:
Input: "Non riesco a trovare il tasto per esportare i report in PDF."
Output: Categoria: UX/Usabilità | Sentimento: Negativo | Azione: Inviare guida con screenshot.

Ora analizza questo nuovo feedback:
Input: "[Incolla qui il testo del cliente]"
Output:`,
    lesson_id: 4,
    is_featured: true,
  },
  {
    id: 'k-4',
    title: 'Analisi Dati & Generatore Formule Excel Complesse',
    category: 'excel_data',
    tags: ['excel', 'dati', 'cerca.x', 'tabelle', 'formule'],
    description: 'Crea formule CERCA.X, INDICE/CONFRONTA o calcoli percentuali partendo dalla descrizione a parole tue.',
    content: `### 📊 Analisi Dati Excel & Google Sheets (Modulo 12)

Agisci come un Data Analyst senior esperto di Microsoft Excel e Google Sheets.

Ho un foglio di calcolo con queste colonne:
- Colonna A: [Codice Prodotto]
- Colonna B: [Data Vendita]
- Colonna C: [Prezzo Unitario]
- Colonna D: [Quantità]

Scrivimi la formula esatta (compatibile con la versione italiana di Excel) per calcolare:
[Descrivi l'obiettivo, es. Il fatturato totale del mese di Agosto solo per i prodotti con codice che inizia per "AI-"].

Spiegami brevemente come funziona la formula passo dopo passo.`,
    lesson_id: 12,
    is_featured: true,
  },
  {
    id: 'k-5',
    title: 'Macro VBA per Pulizia e Formattazione Automatica Tabelle',
    category: 'excel_data',
    tags: ['excel', 'vba', 'macro', 'automazione'],
    description: 'Script pronto per pulire spazi vuoti, formattare date e colorare righe alterne.',
    content: `### ⚡ Script VBA Excel per Pulizia Dati (Modulo 12)

Scrivi una macro VBA per Excel che:
1. Elimini tutte le righe completamente vuote nel foglio attivo.
2. Rimuova gli spazi iniziali e finali superflui in tutte le celle di testo (funzione Trim).
3. Formatti la riga di intestazione con sfondo blu scuro (#1E293B) e testo bianco in grassetto.
4. Applichi bordi sottili a tutta la tabella utilizzata.

Fornisci il codice commentato e spiega dove incollarlo nell'editor VBA (Alt + F11).`,
    lesson_id: 12,
    is_featured: false,
  },
  {
    id: 'k-6',
    title: 'Sequenza Email Commerciali B2B ad Alto Tasso di Risposta',
    category: 'copywriting',
    tags: ['email', 'b2b', 'vendita', 'commerciale', 'follow-up'],
    description: 'Struttura in 3 email di contatto e follow-up non invasivo per clienti aziendali.',
    content: `### ✉️ Sequenza Commerciale B2B (Modulo 8)

Agisci come un consulente commerciale B2B. 
Scrivi una sequenza di 3 email per presentare [Nome Servizio/Consulenza] al responsabile [Ruolo Decision Maker, es. Direttore Operativo]:

- **Email 1 (Valore & Curiosità)**: Lunghezza max 100 parole. Evidenzia un problema comune nel loro settore e come lo risolviamo in un terzo del tempo.
- **Email 2 (Caso Studio & Riprova Sociale - dopo 3 giorni)**: Mostra un risultato concreto ottenuto con un cliente simile.
- **Email 3 (Break-up Gentile - dopo 7 giorni)**: Ultimo contatto cordiale lasciando la porta aperta senza fare pressione.

Tono: Professionale, autorevole ma umano e diretto.`,
    lesson_id: 8,
    is_featured: true,
  },
  {
    id: 'k-7',
    title: 'Riformulazione Testi Complessi con Metodo ELI5',
    category: 'copywriting',
    tags: ['eli5', 'semplificazione', 'comunicazione'],
    description: 'Trasforma contratti, relazioni tecniche o nozioni difficili in testi cristallini per chiunque.',
    content: `### 🧒 Metodo ELI5 ("Explain Like I'm 5") (Modulo 14)

Prendi il seguente testo specialistico:
"[Incolla testo tecnico, contrattuale o normativo]"

Riscrivilo applicando queste 3 versioni:
1. **Versione Professionale Chiara**: Per colleghi o clienti, senza acronimi oscuri.
2. **Versione Sintetica per Executive**: Massimo 3 punti elenco da leggere in 20 secondi.
3. **Versione con Metafora Quotidiana (ELI5)**: Spiegata con un'analogia semplice della vita reale.`,
    lesson_id: 14,
    is_featured: false,
  },
  {
    id: 'k-8',
    title: 'Prompt Visivo Fotorealistico per Immagini e Slide',
    category: 'visual_media',
    tags: ['midjourney', 'dalle', 'fotografia', 'immagini', 'slide'],
    description: 'Formula per generare grafiche e fotografie coerenti per presentazioni aziendali.',
    content: `### 🎨 Prompt Visivo Fotorealistico (Modulo 9 e 10)

\`\`\`text
A high-end editorial commercial photograph of [soggetto principale, es. a modern tech professional working on laptop with holograms], glowing subtle neon blue and violet accents, natural soft cinematic lighting, golden hour ambient backlight, shot on 85mm f/1.8 lens, hyper-realistic, photorealistic textures, 8k resolution, clean composition with negative copy space on left, minimalist luxury aesthetics --ar 16:9 --v 6.0
\`\`\`

**Regole di modifica:**
- Sostituisci il soggetto tra parentesi.
- Mantieni i termini fotografici (85mm, golden hour, negative copy space) per garantire uniformità.`,
    lesson_id: 9,
    is_featured: true,
  },
  {
    id: 'k-9',
    title: 'Generatore Scaletta Presentazione Aziendale in 5 Slide',
    category: 'visual_media',
    tags: ['presentazioni', 'pitch', 'slide', 'powerpoint'],
    description: 'Crea una narrazione convincente per clienti e riunioni di lavoro.',
    content: `### 📽️ Scaletta Presentazione Pitch (Modulo 11)

Crea la struttura narrativa per una presentazione di 5 slide su: [Argomento/Progetto].

Segui questo schema per ciascuna slide:
- **Titolo Slide** (chiaro e orientato al beneficio)
- **Concetto Chiave** (1 sola frase forte)
- **3 Punti Elenco di Dettaglio**
- **Idea Visual / Prompt Immagine consigliato**

Struttura:
Slide 1: Il Problema e lo Status Quo attuale
Slide 2: La Nostra Soluzione Innovativa
Slide 3: Come Funziona (Processo in 3 step)
Slide 4: Risultati & Vantaggi Misurabili (ROI)
Slide 5: Prossimi Passi & Call to Action`,
    lesson_id: 11,
    is_featured: false,
  },
  {
    id: 'k-10',
    title: 'Istruzioni di Sistema per Agente di Supporto Automatico',
    category: 'agents_workflows',
    tags: ['agenti', 'system-prompt', 'n8n', 'webhook', 'automazione'],
    description: 'Template di System Instruction per bot e assistenti autonomi aziendali.',
    content: `### 🤖 System Instruction Agente AI (Modulo 18 / AI Pro)

Sei l'Assistente Operativo di [Nome Azienda].
Il tuo scopo è assistere clienti e collaboratori fornendo risposte rapide, precise ed empatiche in italiano.

Regole Operative:
1. Basati esclusivamente sulle informazioni contenute nella documentazione aziendale fornita nel contesto.
2. Se un'informazione non è presente o hai dubbi, dichiara cordialmente che inoltrerai la richiesta al team umano invece di inventare.
3. Rispondi con frasi concise e punti elenco strutturati.
4. Mantieni sempre un tono professionale, cordiale e orientato alla soluzione.`,
    lesson_id: 18,
    is_featured: true,
  },
  {
    id: 'k-12',
    title: 'Workflow n8n: Lead Capture, Analisi AI e Notifica Telegram',
    category: 'agents_workflows',
    tags: ['n8n', 'automazione', 'telegram', 'lead-generation', 'webhook'],
    description: 'Flusso per ricevere contatti da form web, qualificarli con Gemini/Claude e notificare il team.',
    content: `### ⚡ Schema Flusso n8n Lead Qualification (Modulo 19)

1. **Trigger [Webhook POST]**: Riceve payload JSON da form contatti (nome, email, budget, richiesta).
2. **Node [AI Agent / LLM Chain]**: 
   - Prompt: "Analizza la richiesta del cliente, assegna un punteggio da 1 a 10 e riassumi le sue esigenze in 3 punti."
3. **Node [IF Punteggio >= 7]**:
   - **True**: Invia messaggio su canale Telegram VIP del team con link WhatsApp diretto.
   - **False**: Invia email di benvenuto standard con brochure allegata.
4. **Node [Database / Sheet]**: Salva il record aggiornato con i tag generati dall'IA.`,
    lesson_id: 19,
    is_featured: true,
  },
  {
    id: 'k-13',
    title: 'Agente Voice AI: Script e Gestione Chiamate di Conferma',
    category: 'agents_workflows',
    tags: ['voice-ai', 'chiamate', 'assistente-vocale', 'customer-care'],
    description: 'Istruzioni e logica per agenti vocali (es. Retell / Vapi / ElevenLabs) per confermare appuntamenti.',
    content: `### 📞 Voice Agent Prompt (Modulo 20)

Ruolo: Sei Chiara, l'assistente vocale di [Nome Clinica/Azienda].
Obiettivo: Confermare la presenza del paziente per la visita di domani alle [Orario].

Linee Guida Vocali:
- Frasi brevissime (max 15 parole per battuta per non sovrapporsi).
- Tono cordiale, naturale e rassicurante.
- Se il cliente dice "Sì", ringrazia e invia SMS di riepilogo.
- Se il cliente dice "Non posso", chiedi gentilmente: "Vuole che la richiamiamo per fissare una nuova data?".`,
    lesson_id: 20,
    is_featured: true,
  },
  {
    id: 'k-11',
    title: 'Prompt Anti-Allucinazione con Grounding e Verifica Fonti',
    category: 'prompting',
    tags: ['allucinazioni', 'sicurezza', 'fonti', 'precisione'],
    description: 'Costringe il modello a basarsi solo sui documenti forniti senza inventare.',
    content: `### 🛡️ Prompt di Grounding & Zero Allucinazioni (Modulo 15)

Rispondi alla seguente domanda basandoti ESCLUSIVAMENTE sul testo fornito tra i delimitatori <documento> e </documento>.

Regole di Vincolo Assoluto:
- Se la risposta non è presente nel testo o non è deducibile con certezza al 100%, rispondi ESATTAMENTE: "L'informazione richiesta non è presente nei documenti forniti."
- NON utilizzare conoscenze esterne non citate nel documento.
- Cita la frase esatta del testo su cui si basa la tua risposta.

<documento>
[Incolla qui il testo di riferimento]
</documento>

Domanda: [Scrivi la tua domanda]`,
    lesson_id: 15,
    is_featured: true,
  },
]
