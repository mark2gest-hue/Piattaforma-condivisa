#!/usr/bin/env python3
"""
Generatore delle 20 Dispense Operative per gli Studenti del Corso AI Pro.
Genera file PDF professionali in formato A4, distribuiti in:
- public/dispense/DISPENSA_STUDENTE_MODULO_01.pdf ... 20.pdf
- iCloud KnowledgeBase Vault (Secondo Cervello)
"""

import os
import base64
import subprocess
import shutil

PROJECT_DIR = "/Users/marco/Sviluppo/Progetti/Prgetto piattaforma lavoro condivisa"
LOGO_PATH = os.path.join(PROJECT_DIR, "public/images/logo_full_light.png")
OUTPUT_DIR = os.path.join(PROJECT_DIR, "public/dispense")
VAULT_DIR = "/Users/marco/Library/Mobile Documents/iCloud~md~obsidian/Documents/KnowledgeBase/09_File_Piattaforma_Aiutiamoci/Dispense_Studenti_Pro"
SCRATCH_DIR = os.path.join(PROJECT_DIR, "scratch_dispense_html")

os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(VAULT_DIR, exist_ok=True)
os.makedirs(SCRATCH_DIR, exist_ok=True)

with open(LOGO_PATH, "rb") as f:
    logo_base64 = base64.b64encode(f.read()).decode("utf-8")

MODULES_DATA = {
    1: {
        "title": "1. Da Cartella Vuota al Primo Agente (Google Antigravity)",
        "subtitle": "Setup ambiente operativo, introduzione ad Antigravity e primo file generato in locale.",
        "objectives": [
            "Comprendere la differenza tra chat web generica e un Agentic IDE collegato ai file locali.",
            "Configurare la prima cartella di lavoro su disco e inizializzare l'ambiente di sviluppo.",
            "Eseguire il primo prompt operativo per leggere e creare file in locale senza attriti."
        ],
        "core_concepts": [
            ("Agentic IDE vs Chat Web", "Nelle chat tradizionali devi fare continuo copia-incolla di testi. Un IDE agentico come Antigravity opera direttamente nella tua cartella di lavoro, potendo leggere, creare, modificare file e lanciare comandi in modo chirurgico."),
            ("L'Ambiente di Lavoro Confinato (Workspace)", "L'agente lavora esclusivamente all'interno della cartella aperta. Non ha accesso al resto del disco se non autorizzato, garantendo sicurezza, isolamento e controllo totale sui dati aziendali."),
            ("Il Ciclo Operativo: Prompt → Azione → Verifica", "L'agente non si limita a rispondere a parole: formula un piano, esegue l'azione (es. scrive un file .txt o .csv) e verifica l'esito.")
        ],
        "cheat_sheet": """# Prompt di benvenuto per inizializzare il workspace:
"Sei il mio assistente operativo. Analizza questa cartella, crea un file chiamato 'note_progetto.md' con una sezione per gli obiettivi di oggi e riassumi in 3 punti cosa possiamo fare insieme." """,
        "exercise": "Apri una nuova cartella vuota su Antigravity, lancia il prompt sopra e verifica che il file `note_progetto.md` sia stato creato correttamente sul tuo computer.",
        "checklist": [
            "Cartella del progetto creata sul computer",
            "Antigravity aperto sulla cartella",
            "Primo file generato dall'agente verificato con successo"
        ]
    },
    2: {
        "title": "2. La Costituzione dell'Agente: Regole, Memoria e AGENTS.md",
        "subtitle": "Come governare il comportamento dell'agente con istruzioni permanenti, divieti e linee guida aziendali.",
        "objectives": [
            "Comprendere il ruolo del file AGENTS.md (o System Rules) come memoria e costituzione dell'agente.",
            "Definire regole chiare su tono di voce, formattazione, divieti di modifica e convenzioni aziendali.",
            "Evitare la deriva dell'agente senza dover riscrivere le istruzioni ad ogni prompt."
        ],
        "core_concepts": [
            ("Cos'è AGENTS.md", "È un file markdown posizionato nella root del progetto che l'agente legge automaticamente prima di ogni risposta. Funziona come una costituzione inviolabile."),
            ("Struttura delle Regole Efficaci", "Un buon file di regole contiene: 1) Ruolo e scopo del progetto; 2) Linee guida di stile e tono; 3) Divieti operativi (es. non cancellare file senza permesso, non toccare file .env); 4) Formati di output obbligatori."),
            ("Persistenza tra le Sessioni", "A differenza del contesto temporaneo di una chat, le regole in AGENTS.md rimangono valide per sempre, per te e per chiunque collabori sul progetto.")
        ],
        "cheat_sheet": """# Template Base AGENTS.md
# Costituzione Agente di Progetto
- **Ruolo**: Assistente Operativo per la gestione preventivi e documenti aziendali.
- **Tono di voce**: Diretto, sintetico, professionale, in italiano.
- **Divieti**: Non cancellare mai file esistenti; non inventare dati economici non presenti nei listini.
- **Formati**: Usa sempre tabelle per i riepiloghi e salva i report nella cartella `output/`.""",
        "exercise": "Crea un file AGENTS.md nella tua cartella con 3 regole rigide sul tono e un formato tabellare obbligatorio, poi fai una richiesta all'agente e verifica il rispetto delle regole.",
        "checklist": [
            "File AGENTS.md posizionato nella cartella di lavoro",
            "Regole di tono, divieti e formati inserite",
            "Test di verifica con richiesta operativa completato"
        ]
    },
    3: {
        "title": "3. Come Pensa un Agente: Thinking, File ed Error-Correction",
        "subtitle": "Comprendere il ciclo di ragionamento (Chain of Thought), l'ispezione dei file e l'autocorrezione degli errori.",
        "objectives": [
            "Capire come i modelli con capacità di Thinking scompongono problemi complessi in micro-passaggi.",
            "Osservare come l'agente esamina i file sorgente prima di proporre modifiche.",
            "Gestire i casi di errore e insegnare all'agente ad autocorreggersi."
        ],
        "core_concepts": [
            ("Chain of Thought (CoT)", "Prima di generare l'output finale, l'agente compie un ragionamento interno: analizza il problema, pianifica le chiamate agli strumenti e valuta i rischi."),
            ("Ispezione Preventiva (Read Before Write)", "Un agente affidabile legge sempre il file esistente per verificare il contesto prima di fare modifiche, evitando sovrascritture accidentali."),
            ("Loop di Autocorrezione", "Se un comando o una modifica produce un errore, l'agente legge il messaggio di errore del sistema e tenta una correzione autonoma.")
        ],
        "cheat_sheet": """# Prompt per stimolare il ragionamento strutturato:
"Prima di modificare il file, analizza la struttura attuale, elenca in 3 punti cosa intendi fare e quali verifiche farai per assicurarti che non ci siano errori di sintassi o dati mancanti." """,
        "exercise": "Crea un file con un piccolo errore (es. un calcolo errato in una tabella) e chiedi all'agente di ispezionare il file, individuare l'errore e correggerlo spiegando il motivo.",
        "checklist": [
            "Compreso il meccanismo di Thinking e pianificazione",
            "Testata l'ispezione preventiva di un file esistente",
            "Eseguita con successo una correzione automatica guidata"
        ]
    },
    4: {
        "title": "4. Compiti Autonomi & Tool Isolati: Esecuzione Sicura",
        "subtitle": "Delegare task multi-step ad agenti e subagenti mantenendo il controllo perimetrale e la sicurezza.",
        "objectives": [
            "Comprendere il concetto di Tool (strumenti per leggere, scrivere, cercare nel web o eseguire script).",
            "Imparare a delegare compiti composti da più passaggi sequenziali.",
            "Applicare i principi di sicurezza per impedire modifiche indesiderate fuori dalla cartella."
        ],
        "core_concepts": [
            ("Cosa sono i Tool", "I tool sono le 'mani' dell'agente: funzioni software native che permettono al modello linguistico di interagire con il mondo reale (file system, terminale, web)."),
            ("Subagenti & Isolamento", "Per compiti complessi, un agente principale può coordinare subagenti dedicati a singoli compiti (es. uno ricerca, uno sintetizza, uno impagina)."),
            ("Human-in-the-Loop", "Per azioni delicate (eliminazioni, invio comunicazioni esterne), l'agente deve sempre richiedere la conferma esplicita dell'utente.")
        ],
        "cheat_sheet": """# Prompt per delega operativa sicura:
"Crea una cartella chiamata 'report_settimanale', genera al suo interno 3 file di riepilogo divisi per reparto (Commerciale, Amministrazione, Tecnico) e richiedi la mia approvazione prima di finalizzare." """,
        "exercise": "Fai eseguire all'agente un compito in 3 passaggi: creazione cartella, generazione di una tabella dati e creazione di un riassunto finale in markdown.",
        "checklist": [
            "Compreso il funzionamento dei Tool operativi",
            "Eseguito un compito multi-step in autonomia",
            "Verificato il meccanismo di approvazione per azioni critiche"
        ]
    },
    5: {
        "title": "5. Cosa sono le API: Il Cameriere Digitale & Chat vs Backend",
        "subtitle": "Dalla chat manuale alle chiamate programmatiche: come i software scambiano intelligenza via API.",
        "objectives": [
            "Comprendere cosa sia un'API (Application Programming Interface) attraverso la metafora del cameriere.",
            "Distinguere i costi a consumo (pay-as-you-go) dagli abbonamenti fissi mensili.",
            "Comprendere la struttura di una richiesta (Request) e di una risposta (Response)."
        ],
        "core_concepts": [
            ("La Metafora del Cameriere", "Tu sei al tavolo (il tuo programma), la cucina prepara i piatti (il server AI di Google/OpenAI), il cameriere è l'API che porta il tuo ordine in cucina e ti riporta il piatto pronto."),
            ("Perché le API costano una frazione", "Con le API non paghi 20-30€/mese fissi per persona: paghi solo i millesimi di centesimo per i singoli token effettivamente scambiati quando il flusso lavora."),
            ("Request & Response", "Ogni chiamata API invia un pacchetto (Prompt, Modello scelto, Temperatura) e riceve una risposta pulita senza fronzoli grafici.")
        ],
        "cheat_sheet": """# Concetti chiave API:
- Endpoint: L'indirizzo web a cui inviare la richiesta (es. api.openai.com/v1/chat/completions)
- API Key: La tua chiave di sicurezza personale per autenticare la chiamata e addebitare il consumo.
- Payload: I dati inviati (ruolo, prompt, parametri).""",
        "exercise": "Identifica nel tuo lavoro quotidiano un'attività che oggi fai a mano copiando testi e immagina come potrebbe essere automatizzata inviando i dati a un'API in background.",
        "checklist": [
            "Compresa la differenza fondamentale tra interfaccia Chat e API",
            "Chiara la convenienza economica del modello pay-as-you-go",
            "Identificati i componenti chiave: Endpoint, Key, Payload"
        ]
    },
    6: {
        "title": "6. Google AI Studio: Generare la Prima Chiave Gratuita (Gemini 2.5 Flash)",
        "subtitle": "Accesso a Google AI Studio, generazione della chiave API gratuita e test dei modelli Gemini ultra-rapidi.",
        "objectives": [
            "Creare un account sviluppatore su Google AI Studio (aistudio.google.com).",
            "Generare una API Key gratuita per il modello Gemini 2.5 Flash.",
            "Testare prompt e parametri (System Instructions, Temperature) direttamente nel Playground."
        ],
        "core_concepts": [
            ("Google AI Studio & Free Tier", "Google offre un piano gratuito generoso per sviluppatori e studenti che consente di effettuare centinaia di richieste al giorno a costo zero con Gemini Flash."),
            ("Gemini 2.5 Flash", "Modello ottimizzato per velocità estrema e grandissima finestra di contesto (1 milione di token), ideale per automazioni, lettura di documenti lunghi e sintesi."),
            ("System Instructions nel Playground", "Nel playground puoi definire il comportamento del modello prima di testare le tue chiamate operative.")
        ],
        "cheat_sheet": """# Passaggi di Setup Google AI Studio:
1. Vai su https://aistudio.google.com
2. Clicca su 'Get API key' -> 'Create API key in new project'
3. Copia la chiave e salvala in un gestore password sicuro (mai condividerla pubblicamente).""",
        "exercise": "Genera la tua prima chiave API su Google AI Studio ed esegui un test nel Playground chiedendo a Gemini 2.5 Flash di riassumere un testo di 500 parole in 3 punti elenco.",
        "checklist": [
            "Account Google AI Studio attivo",
            "API Key Gemini generata e salvata al sicuro",
            "Test eseguito con successo nel Playground"
        ]
    },
    7: {
        "title": "7. OpenAI Platform: Limiti di Spesa (5€ Cap), Modelli & Playground",
        "subtitle": "Configurazione account OpenAI Platform, gestione del budget di sicurezza e selezione modelli GPT.",
        "objectives": [
            "Accedere a platform.openai.com e comprendere la differenza con ChatGPT Plus.",
            "Impostare un limite massimo di spesa mensile (Budget Cap a 5€) per totale serenità.",
            "Generare una Secret Key e scegliere il modello più adatto (GPT-4o vs GPT-4o-mini)."
        ],
        "core_concepts": [
            ("OpenAI Platform vs ChatGPT Plus", "L'abbonamento ChatGPT Plus da 20$/mese è per la chat web. La Platform è l'infrastruttura API a consumo ricaricabile con pochi euro."),
            ("Budget Cap di Sicurezza", "Impostare sempre un limite di utilizzo (Usage Limit) e una soglia di avviso (es. Soft Limit a 3€, Hard Limit a 5€) per evitare spese impreviste."),
            ("GPT-4o-mini vs GPT-4o", "GPT-4o-mini costa circa il 95% in meno di GPT-4o ed è perfetto per il 90% delle automazioni di routine (estrazione dati, classificazione email).")
        ],
        "cheat_sheet": """# Best Practice di Sicurezza OpenAI:
- Settings > Limits > Set monthly budget: Soft Limit 3.00$, Hard Limit 5.00$
- API Keys > Create new secret key > Dai un nome chiaro (es. 'n8n-corso-ai')
- Assegna permessi ristretti (Restricted Key) se non hai bisogno di accesso amministrativo.""",
        "exercise": "Accedi a platform.openai.com, imposta il limite di spesa massimo mensile a 5€ e genera una Secret Key dedicata alle tue esercitazioni.",
        "checklist": [
            "Accesso a platform.openai.com effettuato",
            "Budget cap di sicurezza (5€) impostato e salvato",
            "Secret Key generata e memorizzata in modo protetto"
        ]
    },
    8: {
        "title": "8. JSON & Risposte Strutturate: Costringere l'AI a non Divagare",
        "subtitle": "Lo standard JSON per collegare l'AI a database e fogli di calcolo senza preamboli discorsivi.",
        "objectives": [
            "Comprendere la struttura del formato JSON (coppie chiave-valore, array, tipi di dato).",
            "Forzare l'AI a restituire esclusivamente output JSON valido (JSON Mode / Structured Outputs).",
            "Estrarre informazioni non strutturate (testo libero di un'email) in dati pronti per il database."
        ],
        "core_concepts": [
            ("Cos'è il JSON (JavaScript Object Notation)", "È il formato universale di scambio dati su Internet: leggero, leggibile dalle macchine e perfettamente strutturato."),
            ("Eliminare il Rumore", "Quando colleghi l'AI a un software, non vuoi frasi come 'Certamente, ecco la risposta:'. Vuoi un blocco dati puro che il software successivo possa leggere all'istante."),
            ("Schema JSON", "Definire i campi obbligatori (es. `nome`, `email`, `servizio_richiesto`, `budget_stimato`) per garantire che l'AI non ometta mai informazioni cruciali.")
        ],
        "cheat_sheet": """# Esempio di Schema JSON per Triage Richieste:
{
  "nome_cliente": "Mario Rossi",
  "email": "mario@azienda.it",
  "urgenza": "Alta",
  "servizi_richiesti": ["Sviluppo Web", "Consulenza AI"],
  "budget_indicativo": 3500
}

# Prompt di comando JSON:
"Rispondi SOLO in formato JSON valido secondo questo schema, senza alcun testo prima o dopo." """,
        "exercise": "Prendi un'email di richiesta preventivo confusa e chiedi all'AI di estrarre in formato JSON: Cliente, Telefono, Servizio e Budget stimato.",
        "checklist": [
            "Compresa la sintassi base del JSON (chiavi e valori)",
            "Testata la generazione di JSON puro senza testo introduttivo",
            "Validata la correttezza del pacchetto dati generato"
        ]
    },
    9: {
        "title": "9. Benvenuti in n8n: L'Interfaccia Visuale, Trigger & Nodi",
        "subtitle": "L'infrastruttura leader di workflow automation: concetti di Trigger, Nodi esecutivi e flusso dati.",
        "objectives": [
            "Comprendere cosa sia n8n e perché è la piattaforma di automazione più potente e flessibile per le aziende.",
            "Navigare l'editor visuale (Canvas, Nodi, Connessioni).",
            "Distinguere i nodi Trigger (eventi scatenanti) dai nodi Action (azioni esecutive)."
        ],
        "core_concepts": [
            ("Automazione Visuale No-Code / Low-Code", "n8n permette di collegare centinaia di servizi (Gmail, Sheets, Telegram, OpenAI, Database) trascinando blocchi logici su una lavagna interattiva."),
            ("I Nodi Trigger", "Il punto di partenza del flusso: un evento che avvia l'automazione (es. ricezione di un webhook, nuova email, orario pianificato)."),
            ("Il Passaggio Dati tra Nodi", "Ogni nodo riceve i dati dal nodo precedente, li elabora o trasforma e li passa al nodo successivo sotto forma di oggetti JSON.")
        ],
        "cheat_sheet": """# Anatomia di un Workflow n8n:
1. Trigger: 'Quando succede X' (es. Arriva un lead da form web)
2. Nodo AI / LLM: 'Elabora e sintetizza con Gemini o GPT'
3. Action: 'Salva su Google Sheets e invia notifica Telegram' """,
        "exercise": "Accedi alla tua istanza n8n, crea un nuovo workflow vuoto, inserisci un nodo 'Schedule Trigger' impostato a ogni 10 minuti e un nodo 'Code/Set' con un messaggio di prova.",
        "checklist": [
            "Accesso a n8n completato con successo",
            "Creata la prima lavagna di workflow",
            "Inseriti e collegati i primi due nodi logici"
        ]
    },
    10: {
        "title": "10. Il Primo Webhook: Ricevere Dati in Tempo Reale",
        "subtitle": "Configurazione di un Webhook su n8n per ricevere notifiche e dati da form esterni e siti web.",
        "objectives": [
            "Capire cos'è un Webhook (una porta d'ingresso HTTP sempre in ascolto).",
            "Configurare un nodo Webhook Trigger in modalità Test e Production su n8n.",
            "Inviare una richiesta POST con dati simulati e osservare la ricezione in tempo reale."
        ],
        "core_concepts": [
            ("Webhook vs Polling", "Il polling chiede continuamente 'Ci sono novità?' ogni minuto sprecando risorse. Il Webhook è una notifica istantanea: appena l'evento accade sul sito web, i dati vengono sparati direttamente al tuo n8n."),
            ("URL di Test vs URL di Produzione", "In modalità Test il webhook ascolta una singola chiamata per permetterti di progettare il flusso. In modalità Active (Produzione) rimane attivo 24/7."),
            ("Metodi HTTP (GET e POST)", "Usiamo POST quando dobbiamo inviare un carico di dati (payload JSON con le risposte del form cliente).")
        ],
        "cheat_sheet": """# Procedura Webhook n8n:
1. Inserisci nodo 'Webhook' -> Metodo: POST -> Path: 'nuovo-lead'
2. Clicca 'Listen for test event'
3. Invia la richiesta da Postman, cURL o dal form del sito
4. Salva la struttura dati ricevuta per i nodi successivi.""",
        "exercise": "Crea un Webhook POST su n8n, invia un payload di prova con nome ed email e visualizza l'oggetto ricevuto nella finestra di output di n8n.",
        "checklist": [
            "Nodo Webhook configurato con metodo POST",
            "Test di ascolto completato con successo",
            "Dati ricevuti e visibili correttamente nell'albero JSON"
        ]
    },
    11: {
        "title": "11. Collegare l'AI al Webhook: Elaborazione Dati Automatica",
        "subtitle": "Integrazione del nodo AI / OpenAI / Gemini a valle del Webhook per elaborare i dati in tempo reale.",
        "objectives": [
            "Inserire un nodo 'AI Agent' o 'Basic LLM Chain' a valle del Webhook.",
            "Configurare le credenziali API (Google AI Studio o OpenAI) all'interno di n8n.",
            "Passare le variabili dinamiche del Webhook (es. `{{ $json.body.messaggio }}`) al prompt dell'AI."
        ],
        "core_concepts": [
            ("Le Credenziali Sicure in n8n", "n8n cifra le tue chiavi API nel suo database protetto. Non devi mai scrivere la chiave in chiaro nei nodi del flusso."),
            ("Variabili Dinamiche (Espressioni)", "Con la sintassi `{{ $json.campo }}` puoi iniettare i dati appena arrivati dal form direttamente nel testo del prompt per l'AI."),
            ("Elaborazione in Tempo Reale", "Nel momento esatto in cui l'utente preme invio sul form, l'AI analizza la richiesta, estrae i punti chiave e prepara la risposta in meno di 2 secondi.")
        ],
        "cheat_sheet": """# Prompt dinamico nel nodo AI:
"Sei un assistente commerciale. Analizza la seguente richiesta appena arrivata dal form:
Cliente: {{ $json.body.nome }}
Testo: {{ $json.body.messaggio }}

Determina: 1) Categoria; 2) Livello di priorità (Bassa/Media/Alta); 3) Bozza di risposta professionale." """,
        "exercise": "Collega il nodo AI al webhook creato nella lezione 10 e verifica che inviando un messaggio di prova l'AI risponda analizzando i dati dinamici ricevuti.",
        "checklist": [
            "Credenziali API salvate in sicurezza su n8n",
            "Nodo AI collegato al Webhook con variabili dinamiche",
            "Test end-to-end eseguito con successo"
        ]
    },
    12: {
        "title": "12. Fogli di Calcolo Automatici: Google Sheets & Excel senza Codice",
        "subtitle": "Salvataggio automatico dei dati elaborati dall'AI su Google Sheets o fogli di calcolo cloud.",
        "objectives": [
            "Connettere l'account Google Workspace a n8n tramite OAuth2 o Service Account.",
            "Aggiungere automaticamente una riga su Google Sheets per ogni richiesta elaborata.",
            "Aggiornare righe esistenti o ricercare dati per arricchire il contesto dell'AI."
        ],
        "core_concepts": [
            ("Google Sheets come Database Leggero", "I fogli di calcolo condivisi sono perfetti per consentire a tutto il team aziendale di visualizzare i lead senza dover accedere a complessi database."),
            ("Mappatura delle Colonne", "Mappare ogni campo dell'oggetto JSON (Data, Nome, Email, Analisi AI, Priorità) nella rispettiva colonna del foglio di calcolo."),
            ("Operazioni Append vs Update", "'Append' aggiunge una nuova riga in fondo alla tabella; 'Update' modifica una riga esistente in base a un ID univoco.")
        ],
        "cheat_sheet": """# Configurazione Nodo Google Sheets:
- Operation: Append Row
- Document: Seleziona il tuo foglio 'Lead_Aziendali_2026'
- Sheet: 'Foglio1'
- Columns:
  * Data: {{ $now.toFormat('dd/MM/yyyy HH:mm') }}
  * Cliente: {{ $('Webhook').item.json.body.nome }}
  * Priorita: {{ $json.priorita }}
  * Sintesi: {{ $json.sintesi }}""",
        "exercise": "Crea un foglio Google con 4 colonne (Data, Nome, Email, Sintesi AI) e configura n8n per inserire automaticamente una riga ad ogni attivazione del flusso.",
        "checklist": [
            "Connessione Google Sheets autorizzata",
            "Mappatura colonne impostata correttamente",
            "Riga di prova inserita automaticamente nel foglio"
        ]
    },
    13: {
        "title": "13. Smistatore Email Intelligente: Triage della Posta & Filtro Lead",
        "subtitle": "Automazione della casella di posta: lettura email in arrivo, classificazione automatica e risposte mirate.",
        "objectives": [
            "Configurare il trigger Gmail / IMAP su n8n per monitorare la posta in arrivo.",
            "Classificare automaticamente le email in categorie (Lead commerciale, Assistenza tecnica, Spam, Amministrazione).",
            "Applicare etichette (Label) su Gmail o inoltrare al reparto di competenza."
        ],
        "core_concepts": [
            ("Email Triage", "Il processo di smistamento prioritario della posta: le email urgenti vengono segnalate all'istante, le newsletter archiviate e i lead passati al commerciale."),
            ("Nodo Switch / Router", "Un bivio logico su n8n: se l'AI ha classificato la mail come 'Commerciale' il flusso segue il ramo A; se 'Assistenza' segue il ramo B."),
            ("Bozze Automatiche su Gmail", "Creare una bozza di risposta (Draft) già pronta su Gmail senza inviarla subito, lasciando al personale umano solo il controllo finale.")
        ],
        "cheat_sheet": """# Regole di Classificazione per l'AI:
"Analizza questa email in arrivo:
Oggetto: {{ $json.subject }}
Corpo: {{ $json.text }}

Restituisci SOLO una delle seguenti categorie:
- COMMERCIALE (se richiede preventivi o informazioni sui servizi)
- ASSISTENZA (se lamenta problemi o chiede supporto)
- AMMINISTRAZIONE (se invia fatture o solleciti)
- SPAM (se pubblicità non richiesta)" """,
        "exercise": "Crea un flusso che legge l'ultima email ricevuta, la fa classificare dall'AI e applica un'etichetta corrispondente su Gmail.",
        "checklist": [
            "Trigger Email configurato e funzionante",
            "Prompt di classificazione impostato con categorie univoche",
            "Nodo di smistamento logico (Switch) testato"
        ]
    },
    14: {
        "title": "14. L'Assistente Preventivi: Dal Listino Prezzi alla Proposta PDF",
        "subtitle": "Costruire un workflow che incrocia richieste clienti con listini aziendali e calcola preventivi esatti.",
        "objectives": [
            "Estrarre i requisiti specifici e i quantitativi dalla richiesta del cliente.",
            "Interrogare un listino prezzi archiviato su foglio di calcolo o database.",
            "Generare una bozza di preventivo dettagliata con calcolo di totali, IVA e tempi di consegna."
        ],
        "core_concepts": [
            ("Incrocio Dati & Grounding Economico", "L'AI non deve mai inventare i prezzi. Il workflow legge il listino ufficiale e fornisce all'AI i costi esatti da applicare alle voci richieste dal cliente."),
            ("Calcolo Matematico Deterministico", "Lasciare le somme e le moltiplicazioni ai nodi di calcolo logico o a script JavaScript, usando l'AI per l'impaginazione e la spiegazione commerciale."),
            ("Personalizzazione della Proposta", "Adattare la spiegazione del valore in base al settore e alle esigenze specifiche espresse dal cliente nella richiesta iniziale.")
        ],
        "cheat_sheet": """# Struttura del Flusso Preventivi:
1. Input: Richiesta cliente via form o email
2. AI Extractor: Identifica i codici articolo e le quantità
3. Data Lookup: Recupera prezzi unitari dal listino Google Sheets
4. Formula: Calcola Subtotale, Sconto e IVA
5. AI Generator: Redige la lettera di accompagnamento del preventivo.""",
        "exercise": "Crea un listino con 3 prodotti/servizi con relativi prezzi, fai analizzare una richiesta cliente e genera la tabella preventivo calcolata.",
        "checklist": [
            "Listino prezzi strutturato e collegato al flusso",
            "Estrazione accurata dei quantitativi senza allucinazioni",
            "Bozza preventivo con totali generata correttamente"
        ]
    },
    15: {
        "title": "15. RAG Aziendale (Parte 1): Caricare Cataloghi, Manuali e Procedure",
        "subtitle": "Introduzione al Retrieval-Augmented Generation: indicizzazione di documenti PDF e archivi aziendali.",
        "objectives": [
            "Comprendere perché serve il RAG quando i documenti aziendali superano i limiti di memoria dell'AI.",
            "Capire i concetti di Chunking (spezzettamento testi) ed Embeddings vettoriali.",
            "Caricare e indicizzare file PDF in un Vector Store all'interno di n8n."
        ],
        "core_concepts": [
            ("Cos'è il RAG (Retrieval-Augmented Generation)", "Una tecnica che cerca prima i passaggi pertinenti all'interno dei tuoi documenti privati e poi li fornisce all'AI come contesto per formulare la risposta."),
            ("Embeddings Vettoriali", "Trasformare blocchi di testo in coordinate matematiche (vettori) che rappresentano il significato semantico del testo, permettendo ricerche per concetto anziché solo per parole chiave."),
            ("Vector Store", "Il database specializzato nel memorizzare questi vettori e trovare istantaneamente i paragrafi più simili alla domanda dell'utente.")
        ],
        "cheat_sheet": """# Componenti del Nodo RAG in n8n:
- Document Loader: Estrae il testo grezzo dai PDF caricati.
- Text Splitter: Divide il testo in frammenti (es. 500 caratteri con 50 di overlap).
- Embeddings Model: Converte i frammenti in vettori (es. OpenAI text-embedding-3-small).
- Vector Store: Memorizza i dati (es. Qdrant, Pinecone o Vector Store in-memory).""",
        "exercise": "Carica un manuale o catalogo PDF di 5 pagine su n8n e verifica il processo di chunking ed embedding nel Vector Store.",
        "checklist": [
            "Compreso il funzionamento teorico del RAG",
            "PDF caricato ed elaborato dal Text Splitter",
            "Vettori generati e memorizzati nel Vector Store"
        ]
    },
    16: {
        "title": "16. RAG Aziendale (Parte 2): Interrogazione PDF con Fonti e Citazioni",
        "subtitle": "Costruzione della chat documentale aziendale con citazione esatta di capitoli e pagine senza allucinazioni.",
        "objectives": [
            "Configurare l'AI Agent con il nodo 'Vector Store Retriever'.",
            "Impostare un System Prompt di grounding rigoroso (vietato inventare informazioni non presenti nei documenti).",
            "Interrogare la knowledge base e ottenere risposte con riferimenti esatti alle sezioni sorgente."
        ],
        "core_concepts": [
            ("Retrieval & Re-ranking", "Quando l'utente fa una domanda, il sistema recupera i 3-5 estratti più rilevanti dai documenti e li incolla nel prompt di sistema dell'AI."),
            ("Prompt di Contenimento Rigoroso", "Istruire l'agente a dichiarare onestamente 'L'informazione non è presente nei documenti forniti' quando la risposta non è rintracciabile nei testi."),
            ("Citazione Trasparente delle Fonti", "Obbligare l'AI a indicare alla fine della risposta il titolo del documento e il paragrafo di riferimento per consentire il controllo umano immediato.")
        ],
        "cheat_sheet": """# System Prompt per RAG Aziendale:
"Sei l'assistente documentale dell'azienda. Rispondi alla domanda dell'utente basandoti ESCLUSIVAMENTE sui seguenti frammenti di testo:
{{ $json.context }}

Regole:
1. Non usare conoscenze esterne né inventare dati non presenti.
2. Se il testo non contiene la risposta, dì: 'Dato non presente nella documentazione aziendale'.
3. Includi sempre alla fine: [Fonte: Nome_File - Paragrafo X]." """,
        "exercise": "Fai una domanda specifica sul documento caricato nella lezione 15 e verifica che l'agente risponda citando la fonte corretta.",
        "checklist": [
            "Vector Store Retriever collegato all'AI Agent",
            "Prompt di grounding rigoroso applicato",
            "Test di verifica con citazione delle fonti completato"
        ]
    },
    17: {
        "title": "17. Human-in-the-Loop su Telegram: Approvazione Preventivi con Tasti OK/NO",
        "subtitle": "Controllo umano nelle automazioni: l'agente prepara la risposta e attende il tuo clic su Telegram prima dell'invio.",
        "objectives": [
            "Creare un Bot Telegram tramite @BotFather e recuperare il Chat ID personale.",
            "Inviare notifiche ricche con pulsanti interattivi (Inline Keyboard: [✅ Approva] / [❌ Rifiuta]).",
            "Usare il nodo 'Wait (Webhook Resume)' su n8n per sospendere il flusso fino all'approvazione umana."
        ],
        "core_concepts": [
            ("Il Principio Human-in-the-Loop", "La combinazione perfetta: l'AI fa il 95% del lavoro pesante di analisi e stesura in pochi secondi; l'essere umano supervisiona e approva in un secondo con un tocco dallo smartphone."),
            ("Nodi di Attesa Asincrona (Wait Node)", "n8n può congelare l'esecuzione di un flusso per ore o giorni, in attesa che arrivi il segnale di sblocco dal pulsante premuto su Telegram."),
            ("Routing Post-Approvazione", "Se premi Approva, il preventivo viene inviato al cliente via email; se premi Rifiuta, il flusso viene archiviato con notifica al team.")
        ],
        "cheat_sheet": """# Configurazione Messaggio Telegram con Bottoni:
- Chat ID: {{ $vars.MY_TELEGRAM_CHAT_ID }}
- Text: 🚨 *Nuovo Preventivo da Approvare:*
Cliente: {{ $json.cliente }}
Totale: {{ $json.totale }} €
Bozza: {{ $json.bozza_messaggio }}

- Reply Markup: Inline Keyboard
  [ [ { "text": "✅ Approva e Invia", "callback_data": "ok" }, { "text": "❌ Rifiuta", "callback_data": "ko" } ] ]""",
        "exercise": "Crea un bot Telegram, inviati una bozza di messaggio e configura il nodo Wait per completare l'invio solo dopo aver premuto [Approva].",
        "checklist": [
            "Bot Telegram creato e collegato a n8n",
            "Messaggio con pulsanti interattivi ricevuto sullo smartphone",
            "Nodo di attesa (Wait) sbloccato correttamente al clic del pulsante"
        ]
    },
    18: {
        "title": "18. Trascrizione Audio & Verbali di Riunione da Vocali WhatsApp",
        "subtitle": "Da nota vocale o registrazione meeting a verbale formale con compiti assegnati ed estrazione action-items.",
        "objectives": [
            "Scaricare e inviare file audio alle API Whisper di OpenAI per la trascrizione automatica.",
            "Strutturare prompt di sintesi per estrarre: Punti trattati, Decisioni prese e Compiti (con responsabile e scadenza).",
            "Salvare il verbale formattato in Google Docs, Notion o nel Secondo Cervello Obsidian."
        ],
        "core_concepts": [
            ("Modelli Speech-to-Text (Whisper)", "Modelli capaci di trascrivere registrazioni audio anche con rumori di fondo, accenti regionali o sovrapposizione di voci con altissima fedeltà."),
            ("Dalla Trascrizione Grezza al Verbale Esecutivo", "Un audio di 15 minuti produce migliaia di parole disordinate. L'AI filtra i convenevoli e sintetizza solo il succo operativo utile per l'azienda."),
            ("Action-Items con Assegnazione", "L'AI individua chi deve fare cosa entro quando, permettendo di inserire direttamente i compiti nella bacheca attività aziendale.")
        ],
        "cheat_sheet": """# Prompt per Verbale di Riunione Esecutivo:
"Sei un assistente esecutivo di direzione. Analizza la seguente trascrizione di riunione:
{{ $json.transcription }}

Genera un verbale strutturato in:
1. 🎯 Obiettivo dell'Incontro
2. 📌 Decisioni Strategiche Prese
3. 📋 Tabella Compiti Assegnati (Attività | Responsabile | Scadenza)
4. 🗓️ Data Prossimo Allineamento" """,
        "exercise": "Registra una nota vocale di 1 minuto elencando 3 cose da fare per un progetto, mandala al flusso e genera il verbale strutturato.",
        "checklist": [
            "Nodo Whisper configurato per la trascrizione audio",
            "Prompt di sintesi verbale testato con successo",
            "Verbale salvato automaticamente nel sistema di destinazione"
        ]
    },
    19: {
        "title": "19. Sicurezza, Privacy Dati Aziendali & Gestione Errori (Fallback)",
        "subtitle": "Blindare le automazioni aziendali: gestione dei fallimenti, fallback tra provider e conformità GDPR.",
        "objectives": [
            "Configurare l'Error Trigger su n8n per ricevere notifiche immediate in caso di guasto o blocco di un flusso.",
            "Implementare strategie di Fallback: se un'API AI fallisce, passare automaticamente a un modello alternativo.",
            "Anonimizzare preventivamente dati sensibili (GDPR / PII) prima di trasmetterli a server esterni."
        ],
        "core_concepts": [
            ("Continuità di Servizio (Business Continuity)", "I server cloud o le API possono avere micro-interruzioni. Un'architettura professionale prevede retry automatici e percorsi di emergenza."),
            ("Error Workflow Dedicato", "Un flusso speciale che scatta solo quando un altro workflow si rompe, inviando il log dell'errore al responsabile tecnico su Telegram o email."),
            ("Data Masking & Privacy", "Sostituire nomi di persone, numeri di telefono o carte di credito con codici generici prima di inviare il testo ai modelli cloud.")
        ],
        "cheat_sheet": """# Best Practice di Resilienza:
1. Imposta 'Retry on Fail' sui nodi HTTP (3 tentativi con intervallo di 2 secondi).
2. Crea un workflow 'Global Error Handler' collegato nelle impostazioni di n8n.
3. Configura un percorso alternativo: Se Gemini 2.5 Flash risponde 500/Timeout -> Riprova con GPT-4o-mini.""",
        "exercise": "Simula un errore disattivando temporaneamente una chiave API e verifica che l'Error Trigger ti invii l'avviso di emergenza su Telegram con il dettaglio del nodo fallito.",
        "checklist": [
            "Workflow di gestione errori configurato",
            "Retry automatici attivati sui nodi critici",
            "Test di simulazione guasto completato con notifica ricevuta"
        ]
    },
    20: {
        "title": "20. Deploy h24, Manutenzione Workflow & Certificazione AI Pro",
        "subtitle": "Messa in produzione 24/7 su server cloud dedicato, monitoraggio nel tempo e rilascio attestato finale.",
        "objectives": [
            "Attivare tutti i workflow realizzati in modalità 'Active' continua su server VPS o cloud dedicato.",
            "Eseguire il collaudo generale end-to-end dell'intero ecosistema di agenti e automazioni.",
            "Completare l'Esame Finale Ufficiale e richiedere l'Attestato di Certificazione AI Automation Specialist."
        ],
        "core_concepts": [
            ("Esecuzione Continua h24", "I tuoi assistenti digitali lavorano 365 giorni all'anno, rispondendo ai clienti anche di notte e nei giorni festivi senza mai stancarsi."),
            ("Manutenzione & Versioning", "Esportare periodicamente i file JSON dei tuoi workflow per salvarli in una cartella di backup sicuro o repository GitHub."),
            ("Il Ruolo dell'AI Automation Specialist", "Hai acquisito le competenze pratiche più richieste dal mercato: progettare, costruire e manutenere sistemi multi-agente per PMI e professionisti.")
        ],
        "cheat_sheet": """# Checklist di Collaudo Finale:
- [ ] Tutti i workflow sono impostati su 'Active'
- [ ] Le chiavi API sono confinate nelle credenziali sicure
- [ ] I tetti di spesa (Budget Cap) sono attivi su tutte le piattaforme
- [ ] I canali di notifica Telegram/Email sono verificati
- [ ] I backup dei flussi JSON sono stati salvati.""",
        "exercise": "Esegui il test completo di tutti i flussi realizzati nel corso, compila l'Esame Finale e scarica il tuo Attestato Ufficiale di Certificazione AI Pro!",
        "checklist": [
            "Tutti i workflow attivati in produzione",
            "Backup dei flussi salvato sul computer",
            "Esame Finale completato e Attestato scaricato"
        ]
    }
}

def generate_pdf_for_module(mod_num: int, data: dict):
    title = data["title"]
    subtitle = data["subtitle"]
    objectives = data["objectives"]
    core_concepts = data["core_concepts"]
    cheat_sheet = data["cheat_sheet"]
    exercise = data["exercise"]
    checklist = data["checklist"]

    obj_html = "".join([f"<li>{item}</li>" for item in objectives])
    concepts_html = "".join([
        f"""<div class="concept-card">
          <div class="concept-title">{c_title}</div>
          <div class="concept-desc">{c_desc}</div>
        </div>""" for c_title, c_desc in core_concepts
    ])
    chk_html = "".join([
        f"""<div class="check-item"><span class="check-box">☐</span> <span>{item}</span></div>""" for item in checklist
    ])

    html_content = f"""<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="UTF-8">
<style>
  @page {{
    size: A4;
    margin: 16mm 14mm 16mm 14mm;
    @bottom-left {{
      content: "aiutiamoci.cloud • Corso AI Pro (20 Ore) • Dispensa Operativa";
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 8pt;
      color: #94a3b8;
    }}
    @bottom-right {{
      content: "Modulo {mod_num:02d} • Pagina " counter(page) " di " counter(pages);
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 8pt;
      color: #94a3b8;
      font-weight: bold;
    }}
  }}

  body {{
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    color: #1e293b;
    line-height: 1.42;
    font-size: 9pt;
    margin: 0;
    padding: 0;
  }}

  .header-table {{
    display: table;
    width: 100%;
    border-bottom: 2.5px solid #0284c7;
    padding-bottom: 10px;
    margin-bottom: 12px;
  }}
  .header-left {{
    display: table-cell;
    vertical-align: middle;
    width: 40%;
  }}
  .header-right {{
    display: table-cell;
    vertical-align: middle;
    text-align: right;
    width: 60%;
    font-size: 8.5pt;
    color: #475569;
  }}
  .logo {{
    height: 38px;
    max-width: 180px;
    object-fit: contain;
  }}

  .badge-row {{
    margin-bottom: 6px;
  }}
  .badge {{
    display: inline-block;
    background-color: #0284c7;
    color: #ffffff;
    font-size: 7.5pt;
    font-weight: 800;
    padding: 2.5px 8px;
    border-radius: 4px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }}
  .badge-tag {{
    display: inline-block;
    background-color: #f1f5f9;
    color: #334155;
    font-size: 7.5pt;
    font-weight: 600;
    padding: 2.5px 8px;
    border-radius: 4px;
    margin-left: 5px;
    border: 1px solid #e2e8f0;
  }}

  h1 {{
    font-size: 13.5pt;
    color: #0f172a;
    margin: 0 0 4px 0;
    font-weight: 800;
    letter-spacing: -0.3px;
  }}
  .subtitle {{
    font-size: 9.5pt;
    color: #475569;
    margin: 0 0 12px 0;
    font-style: italic;
  }}

  .section-title {{
    font-size: 10.5pt;
    font-weight: 800;
    color: #0369a1;
    border-left: 3.5px solid #0284c7;
    padding-left: 7px;
    margin: 12px 0 6px 0;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }}

  ul.obj-list {{
    margin: 4px 0 10px 0;
    padding-left: 18px;
  }}
  ul.obj-list li {{
    margin-bottom: 3.5px;
    color: #334155;
  }}

  .concept-card {{
    background-color: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 5px;
    padding: 7px 10px;
    margin-bottom: 6px;
  }}
  .concept-title {{
    font-weight: 800;
    color: #0f172a;
    font-size: 9pt;
    margin-bottom: 2px;
  }}
  .concept-desc {{
    color: #475569;
    font-size: 8.5pt;
  }}

  .code-block {{
    background-color: #0f172a;
    color: #38bdf8;
    font-family: 'Courier New', Courier, monospace;
    font-size: 8pt;
    padding: 8px 10px;
    border-radius: 5px;
    white-space: pre-wrap;
    word-break: break-word;
    margin: 4px 0 10px 0;
    line-height: 1.35;
    border: 1px solid #1e293b;
  }}

  .exercise-box {{
    background-color: #f0fdf4;
    border: 1.5px solid #86efac;
    border-radius: 5px;
    padding: 8px 12px;
    margin: 8px 0;
  }}
  .exercise-title {{
    font-weight: 800;
    color: #166534;
    font-size: 9pt;
    margin-bottom: 3px;
  }}
  .exercise-text {{
    color: #14532d;
    font-size: 8.5pt;
  }}

  .checklist-box {{
    background-color: #f8fafc;
    border: 1px solid #cbd5e1;
    border-radius: 5px;
    padding: 7px 12px;
    margin: 8px 0 0 0;
  }}
  .check-item {{
    font-size: 8.5pt;
    color: #334155;
    margin-bottom: 3px;
  }}
  .check-box {{
    color: #0284c7;
    font-weight: bold;
    margin-right: 4px;
  }}
</style>
</head>
<body>

  <div class="header-table">
    <div class="header-left">
      <img src="data:image/png;base64,{logo_base64}" class="logo" alt="Logo">
    </div>
    <div class="header-right">
      <strong>CORSO AI PRO • 20 ORE FORMATIVE</strong><br>
      Automazioni, Agenti Autonomi & Sistemi Aziendali
    </div>
  </div>

  <div class="badge-row">
    <span class="badge">Dispensa Studente</span>
    <span class="badge-tag">Modulo {mod_num:02d} di 20</span>
    <span class="badge-tag">Uso Operativo Personale</span>
  </div>

  <h1>{title}</h1>
  <div class="subtitle">{subtitle}</div>

  <div class="section-title">🎯 Obiettivi Didattici & Risultati Attesi</div>
  <ul class="obj-list">
    {obj_html}
  </ul>

  <div class="section-title">💡 Concetti Chiave & Architettura</div>
  {concepts_html}

  <div class="section-title">📋 Prompt & Schema Operativo (Pronto all'Uso)</div>
  <div class="code-block">{cheat_sheet}</div>

  <div class="exercise-box">
    <div class="exercise-title">🛠️ Esercizio Pratico Guidato</div>
    <div class="exercise-text">{exercise}</div>
  </div>

  <div class="checklist-box">
    <div style="font-weight: 800; color: #0f172a; font-size: 8.5pt; margin-bottom: 4px;">✅ Checklist di Consolidamento Fine Modulo</div>
    {chk_html}
  </div>

</body>
</html>
"""
    html_file = os.path.join(SCRATCH_DIR, f"dispensa_modulo_{mod_num:02d}.html")
    with open(html_file, "w", encoding="utf-8") as f:
        f.write(html_content)

    pdf_filename = f"DISPENSA_STUDENTE_MODULO_{mod_num:02d}.pdf"
    pdf_out_public = os.path.join(OUTPUT_DIR, pdf_filename)
    pdf_out_vault = os.path.join(VAULT_DIR, pdf_filename)

    weasy_bin = "/opt/homebrew/bin/weasyprint"
    res = subprocess.run([weasy_bin, html_file, pdf_out_public], capture_output=True, text=True)
    if res.returncode != 0:
        print(f"[ERRORE Modulo {mod_num}] Weasyprint:", res.stderr)
        return False
    else:
        shutil.copyfile(pdf_out_public, pdf_out_vault)
        print(f"✓ Generata dispensa Modulo {mod_num:02d}: {pdf_filename}")
        return True

def main():
    print(f"Avvio compilazione delle 20 dispense per studenti...")
    success_count = 0
    for mod_num in range(1, 21):
        data = MODULES_DATA.get(mod_num)
        if data:
            if generate_pdf_for_module(mod_num, data):
                success_count += 1
        else:
            print(f"Dati mancanti per modulo {mod_num}")

    print(f"\nOperazione completata con successo: {success_count}/20 PDF generati e sincronizzati nel Vault.")

if __name__ == "__main__":
    main()
