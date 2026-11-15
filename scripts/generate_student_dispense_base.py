#!/usr/bin/env python3
"""
Generatore delle 20 Dispense Operative per gli Studenti del Corso Base AI Start (16 Ore).
Genera file PDF professionali in formato A4, distribuiti in:
- public/dispense/DISPENSA_STUDENTE_MODULO_01.pdf ... 20.pdf
Opera esclusivamente all'interno del repository locale.
"""

import os
import base64
import subprocess

PROJECT_DIR = "/Users/marco/Sviluppo/Progetti/Prgetto piattaforma lavoro condivisa"
LOGO_PATH = os.path.join(PROJECT_DIR, "public/images/logo_full_light.png")
OUTPUT_DIR = os.path.join(PROJECT_DIR, "public/dispense")
SCRATCH_DIR = os.path.join(PROJECT_DIR, "scratch_dispense_base_html")

os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(SCRATCH_DIR, exist_ok=True)

with open(LOGO_PATH, "rb") as f:
    logo_base64 = base64.b64encode(f.read()).decode("utf-8")

MODULES_DATA = {
    1: {
        "title": "1. Benvenuti nel Futuro",
        "subtitle": "Dalla teoria all'azione: come l'Intelligenza Artificiale Generativa trasforma il lavoro quotidiano.",
        "objectives": [
            "Comprendere la differenza fondamentale tra software deterministico e intelligenza probabilistica basata su LLM.",
            "Adottare il corretto modello mentale: trattare l'IA come uno stagista instancabile ad alto potenziale.",
            "Individuare colli di bottiglia e mansioni ripetitive delegabili subito all'assistente intelligente."
        ],
        "core_concepts": [
            ("Software Tradizionale vs LLM", "I programmi classici seguono regole rigide predefinite (se accade X fai Y). I Large Language Models comprendono il contesto e il significato probabilistico del linguaggio naturale, gestendo ambiguità ed elaborando risposte articolate."),
            ("L'Approccio del Direttore d'Orchestra", "L'IA non ti sostituisce, ma chi usa l'IA sostituisce chi non la usa. Il tuo ruolo professionale si sposta dall'esecuzione manuale alla direzione strategica: formulare compiti chiari, impostare vincoli e convalidare i risultati."),
            ("Mappatura delle Attività Delegabili", "Distingui tra mansioni a basso valore aggiunto (bozze email, sintesi verbali, trascrizioni, formattazione dati) e compiti ad alto valore decisionale. Delega subito i primi per liberare fino al 40% del tuo tempo lavorativo.")
        ],
        "cheat_sheet": """# Prompt RCCF di Benvenuto & Diagnosi Mansioni:
[RUOLO]: Sei un consulente senior di organizzazione e produttività aziendale.
[CONTESTO]: Lavoro in ambito aziendale/professionale e desidero iniziare a delegare compiti all'IA generativa.
[CONTENUTO]: Analizza queste 3 mie attività settimanali:
1. Stesura di email di risposta a richieste informative ripetitive dei clienti;
2. Riassunto di lunghe riunioni e appunti presi al volo;
3. Ricerca preliminare di informazioni e confronto tra soluzioni di mercato.
Suggerisci per ciascuna: il miglior strumento IA da usare, l'approccio consigliato e la stima del tempo risparmiato.
[FORMATO]: Tabella a 4 colonne (Attività | Strumento Consigliato | Metodo di Delega | Risparmio Stimato).""",
        "exercise": "Elenca 3 attività ripetitive della tua settimana lavorativa, lancia il prompt diagnostico sopra e definisci la prima mansione da delegare all'IA a partire da oggi.",
        "checklist": [
            "Compreso il funzionamento probabilistico dei modelli linguistici (LLM)",
            "Identificate le prime 3 mansioni ad alta ripetitività da automatizzare",
            "Eseguito il primo prompt diagnostico con restituzione tabellare"
        ]
    },
    2: {
        "title": "2. Breve Storia dell'Evoluzione",
        "subtitle": "Dai primi algoritmi alle reti Transformer: come siamo arrivati a ChatGPT, Claude e Gemini.",
        "objectives": [
            "Comprendere la svolta epocale dell'architettura Transformer introdotta nel 2017.",
            "Capire come il meccanismo della Self-Attention permette ai modelli di comprendere sfumature e contesti lunghi.",
            "Distinguere tra modelli fondazionali (Foundation Models) e applicazioni verticali di settore."
        ],
        "core_concepts": [
            ("La Rivoluzione del 2017: Attention Is All You Need", "Il paper scientifico pubblicato dai ricercatori di Google che ha cambiato la storia: i modelli non leggono più le parole una alla volta in sequenza lineare, ma analizzano contemporaneamente tutte le relazioni semantiche dell'intero testo."),
            ("Self-Attention & Pesi Semantici", "La rete neurale calcola il peso e l'importanza di ciascuna parola rispetto a tutte le altre nella frase, cogliendo pronomi, doppi sensi, contesto culturale e connessioni complesse senza perdersi nei paragrafi lunghi."),
            ("Dati su Scala Globale & Proprietà Emergenti", "Miliardi di parametri addestrati su dataset giganteschi hanno fatto emergere capacità non programmate esplicitamente: traduzione, logica deduttiva, sintesi concettuale e scrittura di codice.")
        ],
        "cheat_sheet": """# Prompt per Spiegazione di Concetti Complessi (Metodo Analogico):
[RUOLO]: Sei un eccezionale divulgatore scientifico e tecnologico.
[CONTESTO]: Devo spiegare a un collega non tecnico il funzionamento dei modelli di intelligenza artificiale.
[CONTENUTO]: Spiega il concetto di 'Self-Attention' e 'Reti Neurali Transformer' usando una metafora concreta della vita quotidiana (es. un gruppo di persone che collabora a un tavolo o una biblioteca).
[FORMATO]: 
1. La Metafora Quotidiana (max 150 parole);
2. Cosa accade nella realtà tecnologica;
3. Perché questo ha reso possibili strumenti come ChatGPT e Claude.""",
        "exercise": "Chiedi all'IA di spiegarti un concetto tecnico difficile del tuo settore lavorativo usando una metafora semplice e valuta la chiarezza dell'analogia generata.",
        "checklist": [
            "Compreso il ruolo spartiacque dell'architettura Transformer",
            "Chiaro il funzionamento del meccanismo di Self-Attention",
            "Sperimentata con successo la tecnica della spiegazione analogica"
        ]
    },
    3: {
        "title": "3. Sconfiggere il Foglio Bianco",
        "subtitle": "Strategie pratiche per sbloccare la creatività, fare brainstorming e strutturare scalette in tempi record.",
        "objectives": [
            "Superare il blocco iniziale generando molteplici angolazioni creative in pochi istanti.",
            "Padroneggiare il Reverse Prompting: farsi intervistare dall'IA per raccogliere i dati essenziali.",
            "Costruire scalette (outlines) strutturate prima di redigere qualsiasi testo o documento lungo."
        ],
        "core_concepts": [
            ("Brainstorming Divergente", "Non iniziare mai chiedendo all'IA un testo finito al primo colpo. Chiedi prima 5 o 10 angolazioni diverse su un argomento: questo attiva collegamenti inattesi e ti permette di selezionare la traiettoria migliore."),
            ("La Tecnica del Reverse Prompting", "Invece di sforzarti a scrivere tutto il contesto, di' all'IA: 'Voglio creare X per il pubblico Y. Prima di iniziare, fammi le 5 domande più importanti che ti servono per confezionare la soluzione ideale.'"),
            ("La Struttura prima del Contenuto", "Non scrivere mai paragrafi discorsivi senza aver prima validato l'indice dei punti chiave. L'outline garantisce coerenza, evita digressioni e fa risparmiare il 70% del tempo.")
        ],
        "cheat_sheet": """# Prompt di Reverse Prompting per Sbloccare Progetti:
[RUOLO]: Sei uno stratega della comunicazione e project manager senior.
[CONTESTO]: Devo avviare un nuovo progetto/documento intitolato: [Inserisci Titolo o Obiettivo].
[CONTENUTO]: Non iniziare subito a scrivere il documento. Fammi invece 5 domande mirate e specifiche su:
1. Obiettivo finale e pubblico di destinazione;
2. Tono di voce e stile atteso;
3. Punti di forza irrinunciabili ed eventuali elementi da escludere;
4. Formato e lunghezza desiderati;
5. Azione specifica che il lettore deve compiere dopo la lettura.
Attendi le mie risposte prima di generare la scaletta operativa.
[FORMATO]: Elenco numerato chiaro con breve motivazione per ciascuna domanda.""",
        "exercise": "Prendi un progetto o articolo che rimandi da tempo, applica il prompt di Reverse Prompting, rispondi alle 5 domande dell'IA e fatti generare la scaletta.",
        "checklist": [
            "Sbloccato il foglio bianco attraverso brainstorming divergente",
            "Applicata con successo la tecnica del Reverse Prompting",
            "Generata una scaletta strutturata prima della stesura finale"
        ]
    },
    4: {
        "title": "4. Il Linguaggio della Chiarezza",
        "subtitle": "La precisione comunicativa nel prompting: eliminare l'ambiguità per ottenere risposte millimetriche.",
        "objectives": [
            "Riconoscere ed eliminare le richieste vaghe che producono output banali e generici.",
            "Impostare vincoli ferrei su lunghezza, pubblico di riferimento e stile di comunicazione.",
            "Sfruttare il Few-Shot Prompting (esempi pratici guidati) per indirizzare il modello."
        ],
        "core_concepts": [
            ("Il Principio 'Garbage In, Garbage Out'", "L'IA risponde allo stesso livello di precisione della domanda. Un prompt vago come 'Scrivi una mail per un cliente' produce banalità; un prompt circostanziato genera un asset operativo immediato."),
            ("I Tre Vincoli d'Oro: Chi, Quanto, Come", "Ogni richiesta efficace deve fissare: 1) Destinatario preciso; 2) Limite volumetrico rigoroso (es. max 120 parole, 4 bullet point); 3) Linee guida stilistiche (es. diretto, empatico, nessun gergo autoreferenziale)."),
            ("Few-Shot Prompting (Apprendimento per Esempi)", "Includi nel prompt 1 o 2 esempi di stile già validati: il modello dedurrà istantaneamente ritmo, cadenza, formattazione e vocabolario gradito.")
        ],
        "cheat_sheet": """# Prompt con Vincoli Rigidi & Few-Shot (Esempi Guidati):
[RUOLO]: Sei un copywriter specializzato in comunicazioni aziendali ad alta efficacia.
[CONTESTO]: Dobbiamo comunicare ai nostri clienti un aggiornamento sulle modalità di consegna.
[VINCOLI RIGIDI]:
- Lunghezza: massimo 100 parole esatte;
- Tono: rassicurante, trasparente, orientato alla soluzione;
- Vietato usare frasi fatte come 'Ci scusiamo per il disagio' o 'Restiamo a disposizione'.
[ESEMPIO DI STILE GRADITO]:
'Gentile Marco, da lunedì il tuo ordine viaggia con tracciamento prioritario. Ecco i 2 dettagli operativi da tenere a mente: [...]'
[CONTENUTO DA RIELABORARE]:
[Incolla qui la bozza disordinata o i punti da comunicare].
[FORMATO]: Testo finale pronto per l'invio senza preamboli discorsivi.""",
        "exercise": "Riscrivi un prompt generico che usavi in passato aggiungendo target, vincolo di parole ed un esempio di stile, poi confronta i due risultati.",
        "checklist": [
            "Eliminata ogni ambiguità dalla formulazione della richiesta",
            "Definiti vincoli numerici e qualitativi non negoziabili",
            "Fornito almeno un esempio concreto di riferimento (Few-Shot)"
        ]
    },
    5: {
        "title": "5. La Formula Segreta RCCF",
        "subtitle": "Il framework cardine del corso: Ruolo, Contesto, Contenuto e Formato per prompt perfetti al primo colpo.",
        "objectives": [
            "Memorizzare e interiorizzare la struttura universale RCCF.",
            "Definire Ruolo competente e Contesto dettagliato per orientare i pesi semantici del modello.",
            "Vincolare rigidamente Contenuto operativo e Formato visivo finale."
        ],
        "core_concepts": [
            ("R - Ruolo (L'Identità Operativa)", "Assegnare un ruolo specifico ('Sei un revisore legale specializzato in PMI' anziché 'Sei un assistente') attiva il sottoinsieme di competenze e terminologia più pertinente nel modello neurale."),
            ("C - Contesto (Lo Scenario di Partenza)", "Fornisci il quadro: chi siamo, chi è il cliente, qual è la posta in gioco, quali sono i vincoli di tempo e le obiezioni tipiche da disarmare preventivamente."),
            ("C - Contenuto & F - Formato", "Il Contenuto specifica l'azione puntuale richiesta; il Formato definisce la gabbia visiva (tabella Markdown, JSON, elenco numerato, checklist pronta da spuntare).")
        ],
        "cheat_sheet": """# Master Template RCCF (Da Stampare e Tenere sulla Scrivania):
[RUOLO]: Sei un [Titolo professionale preciso con X anni di esperienza in settore Y].
[CONTESTO]: Lavoro in [Tipo azienda/studio]. Il mio target sono [Descrizione clienti]. La situazione attuale è [Problema o opportunità], con i seguenti vincoli: [Budget, scadenze, requisiti].
[CONTENUTO]: Esegui la seguente attività: [Descrizione puntuale dell'azione richiesta].
Assicurati di [Criterio di successo 1] ed evita rigorosamente [Errore da evitare].
[FORMATO]: Restituisci l'output esclusivamente in:
- Struttura: [Tabella Markdown / Elenco puntato in 3 sezioni];
- Lunghezza: [Es. max 200 parole];
- Nessun commento o convenevole prima e dopo il testo.""",
        "exercise": "Prendi una richiesta reale della tua giornata lavorativa e trasformala compilando tutti e 4 i blocchi della formula RCCF prima di inviarla all'IA.",
        "checklist": [
            "Ruolo specialistico assegnato con precisione",
            "Contesto arricchito con background e vincoli reali",
            "Formato di output specificato in modo inequivocabile"
        ]
    },
    6: {
        "title": "6. Iterazione",
        "subtitle": "L'arte di affinare i risultati: perché il primo output è solo una bozza e come guidare l'IA all'eccellenza.",
        "objectives": [
            "Vedere il prompting come un dialogo cooperativo a più passaggi e non come un comando isolato.",
            "Fornire correzioni chirurgiche selettive ('mantieni A, taglia B, riscrivi C').",
            "Stimolare l'autovalutazione del modello (Self-Critique) prima della consegna finale."
        ],
        "core_concepts": [
            ("Il Principio Bozza-Revisione", "Anche il miglior copywriter o analista non produce la versione perfetta al primo colpo. Il primo output serve a fissare le fondamenta; le 2-3 iterazioni successive elevano la qualità al livello professionale."),
            ("Feedback Selettivo e Chirurgico", "Non dire genericamente 'Non va bene'. Indica esattamente cosa conservare e cosa correggere: 'Il tono del punto 1 è perfetto; il punto 3 è troppo accademico, trasformalo in un esempio pratico per un negoziante.'"),
            ("Critica Avversariale Guidata", "Chiedi al modello: 'Leggi la tua risposta precedente impersonando il cliente più scettico e pignolo del mondo. Trova 3 punti deboli o poco chiari e proponi come correggerli.'")
        ],
        "cheat_sheet": """# Prompt di Iterazione Chirurgica & Self-Critique:
# Prompt Iterativo 1 (Critica interna):
"Analizza criticamente la risposta che hai appena generato. Individua:
1. Due passaggi che risultano generici o privi di valore pratico;
2. Un'obiezione che un professionista esperto potrebbe sollevare.
Proponi la versione rivista correggendo queste debolezze."

# Prompt Iterativo 2 (Rifinitura di stile):
"Mantieni intatti i concetti chiave, ma:
- Riduci la lunghezza complessiva del 30%;
- Sostituisci la forma passiva con verbi d'azione diretti;
- Aggiungi un riquadro finale 'Azione Immediata in 2 Minuti'." """,
        "exercise": "Scegli un testo generato dall'IA e conducilo attraverso 3 cicli di iterazione: 1) Sintesi e taglio; 2) Cambio tono; 3) Aggiunta di un caso studio concreto.",
        "checklist": [
            "Condotti almeno 3 round consecutivi di affinamento",
            "Fornito feedback chirurgico su elementi specifici",
            "Testata la procedura di critica avversariale (Self-Critique)"
        ]
    },
    7: {
        "title": "7. ChatGPT, Claude, Gemini, Perplexity",
        "subtitle": "Panoramica comparativa dei migliori modelli: punti di forza, peculiarità e la scelta corretta per ogni compito.",
        "objectives": [
            "Conoscere le specializzazioni distintive di Claude, ChatGPT, Gemini e Perplexity.",
            "Scegliere lo strumento ideale in base alla natura del lavoro (scrittura, analisi dati, codice o ricerca fonti).",
            "Comprendere la differenza tra motori di ricerca AI e modelli di generazione pura."
        ],
        "core_concepts": [
            ("Claude (Anthropic)", "Il punto di riferimento per la scrittura naturale, lo stile editoriale caldo e sfumato e la gestione di contesti enormi (fino a 200.000 token per analizzare libri o contratti interi in un colpo solo)."),
            ("ChatGPT / GPT-4o (OpenAI)", "Il coltellino svizzero più versatile: eccellente nella logica deduttiva, nella generazione di codice, nell'elaborazione di fogli Excel e nella creazione visuale (Canvas, DALL-E)."),
            ("Gemini (Google) & Perplexity", "Gemini eccelle nell'integrazione Google Workspace e nella gestione nativa multimodale (audio, video lunghi). Perplexity è il re indiscusso della ricerca web in tempo reale con fonti citate riga per riga.")
        ],
        "cheat_sheet": """# Matrice di Selezione Rapida dello Strumento:
- Scrittura narrativa, policy aziendali, analisi contratti complessi: CLAUDE
- Risoluzione problemi logici, fogli di calcolo, codice, brainstorming: CHATGPT (GPT-4o)
- Trascrizione note audio, video YouTube, file Google Drive: GEMINI
- Ricerche di mercato aggiornate ad oggi, statistiche, verifica fonti web: PERPLEXITY

# Prompt di Confronto Multi-Modello:
"Fai la stessa domanda di settore su Perplexity (per estrarre dati e fonti) e passa i risultati a Claude chiedendo di redigere una sintesi esecutiva pronta per il management." """,
        "exercise": "Lancia una ricerca complessa su Perplexity per raccogliere dati recenti e chiedi a Claude di trasformare i risultati in un breve articolo divulgativo.",
        "checklist": [
            "Identificate le caratteristiche chiave dei 4 modelli principali",
            "Eseguito un test comparativo parallelo tra due strumenti",
            "Mappato l'utilizzo degli strumenti rispetto alle proprie mansioni lavorative"
        ]
    },
    8: {
        "title": "8. Scrivere senza Sforzo",
        "subtitle": "Email formali, comunicazioni delicate, preventivi e post professionali in un terzo del tempo.",
        "objectives": [
            "Trasformare appunti veloci e disordinati in comunicazioni formali impeccabili.",
            "Calibrare istantaneamente il Tone of Voice per clienti B2B, collaboratori o fornitori.",
            "Riformulare messaggi complessi o normativi in un linguaggio limpido e persuasivo."
        ],
        "core_concepts": [
            ("Dagli Appunti alla Comunicazione Finale", "Non perdere tempo a comporre frasi elaborate: incolla all'IA parole chiave e note veloci ('digli che ritardiamo di 2 giorni ma regaliamo la spedizione e il checkup gratuito') e ottieni un'email diplomatica e professionale."),
            ("La Modulazione del Tone of Voice", "Lo stesso messaggio può essere declinato in modalità 'Autorevole e formale' (per controversie legali o contrattuali) o 'Empatico e collaborativo' (per fidelizzare un cliente). Specifica sempre l'effetto psicologico desiderato."),
            ("La Regola delle Prime Due Righe", "Nelle comunicazioni di lavoro moderne l'attenzione è minima: la conclusione, la decisione o la richiesta principale devono trovarsi nelle prime due righe, lasciando le motivazioni ai paragrafi successivi.")
        ],
        "cheat_sheet": """# Prompt per Email Commerciale da Appunti Rapidi:
[RUOLO]: Sei un responsabile delle relazioni con i clienti con eccellenti doti diplomatiche.
[CONTESTO]: Dobbiamo comunicare a un cliente importante una modifica ai tempi di consegna senza incrinare il rapporto.
[APPUNTI GREZZI DA RIELABORARE]:
- Consegna slitta da giovedì a lunedì mattina prossimo;
- Motivo: controllo qualità aggiuntivo sul lotto;
- Compensazione: estensione garanzia gratuita di 6 mesi e trasporto a carico nostro;
- Tono: dispiaciuto ma professionale, niente scuse eccessive, focus sulla sicurezza.
[FORMATO]:
1. Oggetto chiaro e non allarmistico;
2. Testo dell'email in 3 paragrafi brevi;
3. Chiamata all'azione per confermare l'orario di scarico merci lunedì.""",
        "exercise": "Prendi un'email delicata che hai rimandato questa settimana, inserisci i punti chiave nel prompt sopra e genera la risposta pronta all'invio.",
        "checklist": [
            "Trasformate note grezze in comunicazione rifinita",
            "Calibrato il tono di voce in base al destinatario",
            "Inserita la conclusione chiave nelle prime due righe"
        ]
    },
    9: {
        "title": "9. Dipingere con le Parole",
        "subtitle": "I fondamenti della generazione di immagini con l'IA: composizione, luce, materiali e atmosfera.",
        "objectives": [
            "Comprendere la sintassi descrittiva per i modelli visivi (Midjourney, DALL-E, Ideogram).",
            "Padroneggiare i parametri di illuminazione, inquadratura fotografica e texture dei materiali.",
            "Eliminare aggettivi generici a favore di dettagli fisici concreti ed evocativi."
        ],
        "core_concepts": [
            ("La Formula della Composizione Visiva", "Un prompt visivo efficace segue la sequenza: Soggetto principale + Posa/Azione + Ambiente e Sfondo + Illuminazione + Tipo di ottica e stile visivo (es. 'ritratto 85mm f/1.8, golden hour')."),
            ("La Luce come Elemento Narrativo", "La luce definisce la professionalità dell'immagine: 'Studio softbox lighting' conferisce pulizia commerciale; 'Cinematic rim lighting' aggiunge drammaticità; 'Diffused daylight' dona naturalezza realistica."),
            ("Dettagli Fisici vs Parole Vuote", "Evita termini vaghi come 'immagine bellissima' o 'iper-realistica'. Usa descrizioni concrete: 'superficie in alluminio spazzolato con riflessi morbidi', 'profondità di campo ridotta', 'palette colori pastello desaturata'.")
        ],
        "cheat_sheet": """# Formula Master per Prompt Fotografico Fotorealistico:
[SOGGETTO]: Ritratto ravvicinato di una professionista che analizza dati su un tablet moderno.
[AMBIENTE]: Ufficio open space contemporaneo, architettura in legno chiaro e vetro, piante sullo sfondo sfocato.
[ILLUMINAZIONE]: Luce naturale mattutina proveniente da una grande vetrata laterale, riflessi morbidi, no ombre dure.
[PARAMETRI FOTOGRAFICI]: Scatto fotografico 50mm, apertura f/2.0, messa a fuoco nitida sugli occhi, grana fotografica fine, colori caldi naturali.
[DIVIETI]: No illustrazioni 3D plasticose, no volti deformati, no sovrasaturazione cromatica.""",
        "exercise": "Componi un prompt descrittivo dettagliato per un'immagine rappresentativa del tuo settore professionale e testalo sul generatore visivo.",
        "checklist": [
            "Applicata la sequenza Soggetto + Ambiente + Luce + Ottica",
            "Sostituiti aggettivi vaghi con dettagli fisici misurabili",
            "Ottenuta un'immagine coerente con lo stile richiesto"
        ]
    },
    10: {
        "title": "10. Anatomia di un Prompt Visivo",
        "subtitle": "Creare visual professionali per slide, banner e materiali promozionali: formati, proporzioni e spazio negativo.",
        "objectives": [
            "Gestire proporzioni (Aspect Ratio) e inquadrature per i diversi canali digitali.",
            "Progettare lo Spazio Negativo (Negative Space) per consentire l'inserimento di testi e loghi.",
            "Utilizzare il prompting negativo per eliminare elementi indesiderati e artefatti visivi."
        ],
        "core_concepts": [
            ("Lo Spazio Negativo per la Grafica", "Quando crei immagini per presentazioni o inserzioni, l'immagine non deve occupare ogni millimetro: progetta intenzionalmente aree vuote o sfocate (a sinistra o in alto) destinate a ospitare titoli e copy."),
            ("Proporzioni e Formati (Aspect Ratio)", "Definisci il formato prima della generazione: 16:9 per slide PowerPoint e schermi orizzontali; 1:1 per post social quadrati; 9:16 per Stories e smartphone."),
            ("Il Prompting Negativo", "Specifica esplicitamente cosa NON vuoi vedere nell'immagine: 'no text, no letters, no watermark, no extra limbs, no cartoon style'. Questo riduce gli errori dei generatori del 60%.")
        ],
        "cheat_sheet": """# Prompt per Hero Image Orizzontale (16:9) con Spazio Testo a Sinistra:
[SOGGETTO & INQUADRATURA]: Composizione orizzontale 16:9. Sul terzo destro dell'inquadratura si trova una postazione di lavoro elegante con laptop e tazza in ceramica.
[SPAZIO NEGATIVO]: I due terzi sinistri dell'inquadratura sono uno spazio pulito, parete neutra con gradiente di luce soffusa, ideale per sovrapposizione di testo.
[STILE & LUCE]: Fotografia editoriale di interni, luce da studio diffusa, tonalità ardesia e legno caldo, resa nitida e sobria.
[NEGATIVE PROMPT]: no text, no watermark, no signatures, no people, no distorted furniture.""",
        "exercise": "Genera un'immagine con spazio negativo a sinistra in formato 16:9 e aprila su Canva o PowerPoint inserendo il titolo della tua prossima presentazione.",
        "checklist": [
            "Definito il corretto Aspect Ratio (16:9 o 1:1)",
            "Riservato lo spazio negativo per l'inserimento di testi",
            "Applicati i vincoli negativi anti-artefatto"
        ]
    },
    11: {
        "title": "11. Presentazioni in 5 Minuti",
        "subtitle": "Creare slide e pitch aziendali in tempi record: struttura narrativa, storytelling e impaginazione rapida.",
        "objectives": [
            "Applicare la regola narrativa delle 3 sezioni: Problema, Soluzione e Chiamata all'Azione (CTA).",
            "Generare la scaletta completa di una presentazione aziendale di 6-8 slide in meno di 2 minuti.",
            "Formattare i testi in tabelle compatibili con Gamma, Canva o PowerPoint."
        ],
        "core_concepts": [
            ("La Struttura Narrativa del Pitch", "Una presentazione memorabile non è un elenco di caratteristiche tecniche: mostra il punto di dolore attuale del cliente, introduce la visione del risultato desiderato e posiziona la tua soluzione come il ponte naturale per raggiungerlo."),
            ("La Regola 'Un Concetto per Slide'", "Evita di sovraccaricare le diapositive con blocchi di testo illeggibili. L'IA sintetizza ciascuna slide in: 1 Titolo ad alto impatto, 1 sottotitolo esplicativo e massimo 3 punti elenco essenziali."),
            ("Esportazione Pronta per Software di Slide", "Fatti restituire la presentazione in una tabella Markdown con colonne dedicate a Titolo, Bullet point e Suggerimento visivo per facilitare il copia-incolla immediato.")
        ],
        "cheat_sheet": """# Prompt per Presentazione Aziendale ad Alto Impatto (5 Slide):
[RUOLO]: Sei un presentation designer e pitch coach di livello internazionale.
[CONTESTO]: Dobbiamo presentare una proposta a [Tipo di cliente] per [Servizio/Prodotto offerto].
[CONTENUTO]: Progetta una presentazione efficace in 5 slide seguendo questa struttura:
- Slide 1: Titolo accattivante & Promessa di valore;
- Slide 2: Il Problema attuale e il costo dell'inazione;
- Slide 3: La Nostra Soluzione e i 3 pilastri operativi;
- Slide 4: Risultati attesi, tempi e garanzie;
- Slide 5: Chiamata all'Azione (Prossimo passo immediato).
[FORMATO]: Tabella Markdown con colonne: [Numero Slide | Titolo | Punti Chiave (max 10 parole l'uno) | Suggerimento Immagine].""",
        "exercise": "Genera la scaletta di una presentazione per un tuo servizio o progetto usando il prompt sopra e trasferiscila sul tuo software di presentazione abituale.",
        "checklist": [
            "Applicata la sequenza narrativa Problema-Soluzione-Azione",
            "Sintetizzato ogni concetto in titoli e punti essenziali",
            "Generata la tabella di impaginazione rapida per le slide"
        ]
    },
    12: {
        "title": "12. Analisi Dati per Excel",
        "subtitle": "Dominare fogli di calcolo, formule complesse, pulizia dati e macro con l'assistenza dell'IA.",
        "objectives": [
            "Generare all'istante formule complesse (CERCA.X, INDICE/CONFRONTA, formule matriciali).",
            "Risolvere rapidamente errori di calcolo (#N/D, #VALORE!, formati incoerenti).",
            "Creare script VBA o Google Apps Script per automatizzare compiti ripetitivi sui dati."
        ],
        "core_concepts": [
            ("Mappare la Tabella per l'IA", "Per ottenere formule senza errori, descrivi con esattezza le coordinate: 'Nel Foglio1 ho i Codici in colonna A (A2:A100) e i Prezzi in colonna C; nel Foglio2 ho i Codici in colonna B. Scrivi la formula CERCA.X in italiano.'"),
            ("Spiegazione Didattica della Formula", "Chiedi sempre all'IA di spiegare ciascun argomento della formula generata: in questo modo comprendi il funzionamento e impari ad applicarla autonomamente."),
            ("Pulizia e Normalizzazione Dati", "Incolla 5 righe di dati disordinati (es. date in formati diversi o testi con spaziature anomale) e chiedi all'IA la formula o funzione più rapida per ripulirli in blocco.")
        ],
        "cheat_sheet": """# Prompt per Formule Excel & Fogli Google Avanzate:
[RUOLO]: Sei un analista dati e formatore certificato Microsoft Excel / Google Sheets.
[CONTESTO]: Lavoro su un foglio di calcolo con versione Excel in italiano.
[STRUTTURA DEI DATI]:
- Foglio 'Vendite': Colonna A = Data, Colonna B = ID_Cliente, Colonna C = Fatturato;
- Foglio 'Anagrafica': Colonna A = ID_Cliente, Colonna B = Nome, Colonna C = Categoria (Retail/B2B).
[CONTENUTO]: 
1. Scrivi la formula CERCA.X per recuperare la Categoria in colonna D del foglio Vendite, gestendo eventuali codici assenti con il testo 'Non Censito';
2. Scrivi la formula per calcolare il totale fatturato generato esclusivamente dai clienti B2B;
3. Spiega brevemente come funzionano i singoli parametri inseriti.
[FORMATO]: Formule evidenziate in blocchi di codice pronte da incollare e spiegazione sintetica.""",
        "exercise": "Identifica un calcolo o incrocio dati che esegui manualmente su Excel e fatti generare la formula esatta completa di gestione degli errori.",
        "checklist": [
            "Fornita la mappatura precisa di righe e colonne all'IA",
            "Ottenuta e testata la formula sul foglio di calcolo reale",
            "Compreso il funzionamento logico di ciascun parametro"
        ]
    },
    13: {
        "title": "13. L'Agenda Intelligente",
        "subtitle": "Time management con l'IA: matrice di Eisenhower, blocchi orari e pianificazione della settimana.",
        "objectives": [
            "Organizzare to-do list disordinate applicando la matrice di Eisenhower automatica.",
            "Strutturare la giornata lavorativa con il metodo Time-Boxing in base ai livelli di concentrazione.",
            "Decomporre progetti imponenti in micro-task giornalieri da 25-45 minuti."
        ],
        "core_concepts": [
            ("Time-Boxing Guidato dall'IA", "Assegnare a ciascun impegno uno spazio temporale prefissato sul calendario impedisce ai compiti di espandersi all'infinito (Legge di Parkinson), riducendo drasticamente stress e distrazioni."),
            ("La Matrice di Eisenhower Automatica", "L'IA classifica le tue incombenze in: 1) Urgenti & Importanti (fai subito); 2) Importanti ma non urgenti (pianifica con cura); 3) Urgenti non importanti (delega/automatizza); 4) Superflue (elimina)."),
            ("Micro-Tasking contro la Procrastinazione", "Se un'attività genera ansia, chiedi all'IA di suddividerla in 3 o 4 passaggi elementari che richiedano meno di 20 minuti ciascuno. L'avvio diventa immediato.")
        ],
        "cheat_sheet": """# Prompt per Organizzazione Giornaliera Time-Boxing:
[RUOLO]: Sei un executive assistant specializzato in alta produttività personale.
[CONTESTO]: Giornata lavorativa dalle 08:30 alle 18:00 (con 1 ora di pausa pranzo dalle 13:00 alle 14:00).
[MIE ATTIVITÀ DI OGGI]:
[Incolla l'elenco grezzo dei compiti, email da mandare, scadenze e riunioni fissate].
[CONTENUTO]:
1. Filtra i compiti con la matrice Urgente/Importante;
2. Posiziona il 'Deep Work' (lavoro ad alta concentrazione) nella fascia mattutina;
3. Raggruppa le mansioni amministrative e le telefonate nel primo pomeriggio;
4. Inserisci 15 minuti di buffer di sicurezza a fine giornata per gli imprevisti.
[FORMATO]: Tabella oraria suddivisa in blocchi da 45-60 minuti con indicazione specifica dell'attività da svolgere.""",
        "exercise": "Incolla la tua to-do list di domani nel prompt e segui la tabella oraria generata, verificando l'efficacia del Time-Boxing sulla tua produttività.",
        "checklist": [
            "Attività classificate per priorità reale e urgenza",
            "Costruita la pianificazione giornaliera a blocchi orari",
            "Inseriti buffer di recupero per assorbire imprevisti"
        ]
    },
    14: {
        "title": "14. Studiare e Imparare ELI5",
        "subtitle": "Apprendimento accelerato e metodo Feynman: comprendere e assimilare qualsiasi concetto complesso in minuti.",
        "objectives": [
            "Applicare la tecnica ELI5 ('Explain Like I'm 5') per comprendere normative e nozioni complesse.",
            "Generare quiz interattivi e domande a risposta multipla per la memorizzazione attiva.",
            "Simulare colloqui e dibattiti usando l'IA come interlocutore critico (Avvocato del Diavolo)."
        ],
        "core_concepts": [
            ("Il Metodo Feynman Potenziato dall'IA", "La vera comprensione coincide con la capacità di spiegare un'idea con parole semplici. Se un testo è troppo difficile, chiedi all'IA di tradurlo in un'analogia concreta della vita di tutti i giorni."),
            ("Active Recall (Richiamo Attivo della Memoria)", "La rilettura passiva di un testo è poco efficace. Chiedi all'IA di farti 5 domande a trabocchetto sul materiale studiato: lo sforzo di rispondere consolida le nozioni nella memoria a lungo termine."),
            ("Simulazione di Contraddittorio", "Prima di una riunione cruciale o di un esame, addestra l'IA a interpretare la controparte più scettica e rispondi alle sue obiezioni per affinare la tua sicurezza espositiva.")
        ],
        "cheat_sheet": """# Prompt per Apprendimento Accellerato in 3 Livelli (ELI5):
[RUOLO]: Sei un mentore accademico e comunicatore d'eccezione.
[CONTESTO]: Devo comprendere a fondo il seguente argomento ostico: [Inserisci Argomento, es. Smart Contract / Nuova Normativa Fiscale].
[CONTENUTO]:
1. Spiegazione Livello 1 (ELI5): Spiegalo a un bambino di 8 anni usando una metafora semplice e vivace;
2. Spiegazione Livello 2 (Professionale): Riformulalo con la terminologia tecnica corretta e i collegamenti di settore;
3. Test di Comprensione: Genera 3 domande a risposta multipla con relativa spiegazione per verificare se ho assimilato i concetti chiave.
[FORMATO]: 3 sezioni chiaramente separate da titoli evidenti.""",
        "exercise": "Scegli un argomento che hai sempre trovato difficile o noioso, lancia il prompt a 3 livelli e rispondi al quiz di verifica finale.",
        "checklist": [
            "Compreso il concetto attraverso una metafora intuitiva",
            "Appresi i termini tecnici corretti per l'uso professionale",
            "Completato con successo il quiz di verifica attiva"
        ]
    },
    15: {
        "title": "15. Allucinazioni: Quando l'IA mente",
        "subtitle": "Riconoscere i limiti dei modelli probabilistici: come prevenire le allucinazioni e verificare le fonti.",
        "objectives": [
            "Comprendere la causa tecnica delle allucinazioni (previsione statistica vs verità fattuale).",
            "Applicare prompt di contenimento rigoroso ('Se non trovi il dato, dichiara che non lo sai').",
            "Implementare la tecnica del Grounding: ancorare l'IA a documenti certi forniti dall'utente."
        ],
        "core_concepts": [
            ("La Natura Probabilistica dell'IA", "I modelli linguistici non possiedono una nozione intrinseca di 'verità': calcolano quale sequenza di parole ha la più alta probabilità statistica di seguire la domanda. Quando non conoscono un dato, tendono a inventarlo con tono sicuro."),
            ("Il Principio del Grounding (Ancoraggio)", "La regola aurea per azzerare le allucinazioni: non chiedere all'IA nozioni mnemoniche a scatola chiusa. Fornisci tu il testo sorgente (PDF, contratto, bilancio) e obbligala a rispondere esclusivamente sulla base di quel materiale."),
            ("La Clausola di Contenimento e Non-Invenzione", "Inserisci sempre la clausola esplicita: 'È severamente vietato formulare ipotesi o inventare dati. Se l'informazione richiesta non è presente nel testo allegato, rispondi testualmente: Informazione non reperibile nel documento fornito.'")
        ],
        "cheat_sheet": """# Prompt di Grounding Rigido Anti-Allucinazione:
[RUOLO]: Sei un perito analista e verificatore documentale inflessibile.
[CONTESTO]: Devo estrarre informazioni certe da questo testo senza alcun margine di errore.
[REGOLE DI CONTENIMENTO RIGIDISSIME]:
1. Rispondi alla mia domanda basandoti ESCLUSIVAMENTE sul testo fornito tra triple virgolette;
2. Non utilizzare alcuna conoscenza pregressa o esterna al testo;
3. Per ogni affermazione, cita tra parentesi quadre la frase esatta del testo di riferimento;
4. Se il testo non menziona l'argomento richiesto, scrivi UNICAMENTE: 'Dato non presente nel documento'.
[TESTO SORGENTE]:
\"\"\"
[Incolla qui il testo o l'estratto del documento]
\"\"\"
[DOMANDA]: [Inserisci la tua domanda specifica].""",
        "exercise": "Fai una domanda trabocchetto su un dettaglio inesistente prima con un prompt generico e poi con il prompt di Grounding, verificando l'arresto dell'allucinazione.",
        "checklist": [
            "Compresa la dinamica statistica alla base delle allucinazioni",
            "Applicata la clausola vincolante di non-invenzione",
            "Ancorata con successo la risposta al testo sorgente (Grounding)"
        ]
    },
    16: {
        "title": "16. Privacy e Sicurezza",
        "subtitle": "Protezione dei dati personali e aziendali nell'uso dell'IA: GDPR, opt-out dal training e buone pratiche.",
        "objectives": [
            "Disattivare l'addestramento dei modelli sui propri dati personali nelle impostazioni dei software.",
            "Applicare l'anonimizzazione preventiva (Data Masking) prima di incollare dati sensibili.",
            "Distinguere tra interfacce web commerciali gratuite e API aziendali a zero-retention."
        ],
        "core_concepts": [
            ("Opt-Out dal Training", "I principali provider di IA consentono di disattivare l'impiego delle proprie conversazioni per addestrare i futuri modelli. Questa configurazione va eseguita immediatamente su ogni account utilizzato per motivi professionali."),
            ("Data Masking Preventivo", "Non incollare mai nomi di clienti, codici fiscali, IBAN o credenziali: sostituiscili preventivamente con segnaposto neutri (es. [Cliente_Alfa], [Importo_X], [Data_Y]). Una volta generata la risposta, reinserisci i valori reali in locale."),
            ("Interfacce Web Consumer vs API Enterprise", "Nelle versioni web gratuite o economiche i dati possono essere conservati temporaneamente per motivi di sicurezza; nelle soluzioni API o Enterprise vige il principio di zero data retention per contratto certificato.")
        ],
        "cheat_sheet": """# Checklist Operativa di Blindatura Privacy:
1. ChatGPT Web: Impostazioni > Controllo Dati > Disattiva 'Migliora il modello per tutti';
2. Claude Web: Verifica le impostazioni di privacy del tuo account Anthropic;
3. Regola Aurea del Copia-Incolla:
   - Nomi persone -> [Persona_1, Persona_2]
   - Aziende -> [Azienda_X]
   - Importi economici -> [Valore_A, Valore_B]
   - IBAN / Carte / Password -> CANCELLARE SEMPRE prima dell'invio.""",
        "exercise": "Accedi al tuo account IA principale, verifica che il flag di addestramento sui tuoi dati sia disattivato ed esegui un test di anonimizzazione su un testo di prova.",
        "checklist": [
            "Verificate e salvate le impostazioni di opt-out sui tuoi account",
            "Acquisito il metodo di anonimizzazione preventiva (Data Masking)",
            "Chiara la differenza di tutela legale tra chat consumer e canali protetti"
        ]
    },
    17: {
        "title": "17. Il Lavoro che Cambia",
        "subtitle": "L'impatto dell'automazione sul mercato del lavoro: posizionarsi come professionista potenziato dall'IA.",
        "objectives": [
            "Individuare le competenze umane che aumentano di valore: empatia, strategia, pensiero critico ed etica.",
            "Passare da 'esecutore manuale di compiti' a 'direttore d'orchestra' di sistemi intelligenti.",
            "Valorizzare l'efficienza ottenuta con l'IA nelle proprie proposte commerciali per clienti."
        ],
        "core_concepts": [
            ("Il Paradosso dell'Efficienza", "Quando il costo di produzione di bozze e analisi si riduce, la domanda di soluzioni personalizzate, veloci e di alta qualità cresce vertiginosamente. Chi padroneggia l'IA ha a disposizione più opportunità, non meno."),
            ("Le Competenze Umane Insostituibili", "1) Visione d'insieme e definizione degli obiettivi; 2) Sensibilità relazionale ed empatia con clienti e colleghi; 3) Controllo qualità e assunzione di responsabilità finale."),
            ("Dalla Tariffa Oraria alla Vendita per Valore", "Se prima impiegavi 8 ore per redigere una proposta e oggi ne impieghi 1 con l'IA, non fatturare un'ora sola: offri un servizio più approfondito, rapido e risolutivo facendoti pagare per il valore generato.")
        ],
        "cheat_sheet": """# Manifesto Professionale del Lavoratore Aumentato:
"Non utilizzo l'IA per lavorare di meno o in modo superficiale.
Utilizzo l'IA per eliminare l'attrito dei compiti ripetitivi e dedicare
il 100% delle mie energie intellettuali alla strategia, alla cura del dettaglio,
all'ascolto delle persone e alla risoluzione di problemi reali."

# Prompt per Posizionamento Professionale:
[RUOLO]: Sei un consulente di carriera e personal branding.
[CONTESTO]: Sono un [La tua professione]. Ho integrato strumenti di IA generativa nel mio flusso di lavoro.
[CONTENUTO]: Scrivi una breve bio professionale (max 80 parole) per LinkedIn che spieghi come l'uso dell'IA mi rende più rapido e preciso senza rinunciare al tocco umano artigianale.
[FORMATO]: 2 proposte di testo ad alto impatto.""",
        "exercise": "Scrivi una breve dichiarazione di valore per il tuo profilo o per un preventivo che spieghi i vantaggi concreti che i tuoi clienti ottengono grazie alla tua efficienza con l'IA.",
        "checklist": [
            "Mappate le competenze umane strategiche da valorizzare",
            "Definito il passaggio dalla tariffa a tempo alla tariffa a valore",
            "Aggiornata la propria presentazione professionale"
        ]
    },
    18: {
        "title": "18. Creare il proprio Workflow",
        "subtitle": "Costruire flussi di lavoro integrati e ripetibili: libreria di prompt, istruzioni personalizzate e scorciatoie.",
        "objectives": [
            "Configurare le Custom Instructions (Istruzioni Personalizzate) del proprio profilo IA.",
            "Costruire una Prompt Library ordinata per compiti ricorrenti.",
            "Integrare prompt e scorciatoie per azzerare i tempi di avvio delle attività quotidiane."
        ],
        "core_concepts": [
            ("Istruzioni Personalizzate Permanenti", "Spiega una volta per tutte all'IA chi sei, in quale settore lavori e come vuoi che ti risponda (es. 'Sii sempre sintetico, usa tabelle, niente preamboli decorativi'). Non dovrai ripeterlo mai più in ogni singola chat."),
            ("La Tua Prompt Library Personale", "Quando scopri un prompt che genera risultati eccellenti, non lasciarlo affondare nella cronologia: salvalo in una cartella dedicata o in un file note. I prompt validati sono veri e propri asset aziendali."),
            ("Standardizzazione dei Processi", "Associa a ciascuna routine del tuo lavoro (es. gestione nuovo cliente, chiusura mese, bozza preventivo) un prompt pre-impostato: la delega diventa immediata e a prova di errore.")
        ],
        "cheat_sheet": """# Template per Custom Instructions di Profilo (Da Incollare nelle Impostazioni):
# SEZIONE 1: Chi sono e di cosa mi occupo:
- Ruolo: [Tua professione/settore];
- Destinatari del mio lavoro: [Tipologia di clienti o colleghi];
- Obiettivi ricorrenti: Massima precisione, chiarezza comunicativa, soluzioni pratiche ed applicabili subito.

# SEZIONE 2: Come desidero che l'IA risponda sempre:
- Tono professionale, asciutto e diretto;
- Evita convenevoli iniziali ('Certamente', 'Ottima domanda');
- Se ci sono elenchi o confronti, prediligi sempre tabelle Markdown;
- Se non sei certo al 100% di un'informazione, dichiara subito il limite senza inventare.""",
        "exercise": "Compila il template delle Istruzioni Personalizzate e incollalo nelle impostazioni del tuo account IA preferito, testando una nuova conversazione.",
        "checklist": [
            "Impostate e attivate le Custom Instructions permanenti",
            "Creata una nota dedicata per la propria Prompt Library",
            "Standardizzata la prima procedura ricorrente di lavoro"
        ]
    },
    19: {
        "title": "19. La Tua Nuova Superpotenza",
        "subtitle": "Dalle micro-attività ai progetti complessi: moltiplicare la propria capacità di esecuzione e di mercato.",
        "objectives": [
            "Affrontare progetti ambiziosi (manuali, nuovi servizi, ricerche complesse) prima bloccati dalla mancanza di tempo.",
            "Acquisire fiducia operativa per prototipare rapidamente e lanciare idee sul mercato.",
            "Costruire un metodo di aggiornamento continuo e sostenibile nel tempo."
        ],
        "core_concepts": [
            ("Il Moltiplicatore di Esecuzione", "Con l'ausilio dell'IA una singola persona competente può svolgere mansioni che in passato richiedevano un intero dipartimento: redazione, revisione, sintesi dati, codice base e grafiche preliminari."),
            ("Il Principio del Prototipo Veloce (Ship Fast)", "Non aspettare mesi prima di testare un'idea commerciale. Con l'IA puoi realizzare la bozza dell'offerta, la presentazione e la struttura del servizio in un singolo pomeriggio e raccogliere subito feedback reali."),
            ("L'Abitudine della Curiosità Sperimentale", "I modelli evolvono rapidamente, ma i principi fondanti appresi (chiarezza, contesto, vincoli, iterazione, verifica delle fonti) restano la tua bussola immutabile per qualsiasi strumento futuro.")
        ],
        "cheat_sheet": """# Il Metodo in 4 Fasi per Sviluppare Grandi Progetti in Tempi Record:
1. FASE 1 - Ideazione & Indice: Definisci con l'IA l'indice completo e la struttura dei capitoli/moduli;
2. FASE 2 - Stesura Modulare: Sviluppa un singolo blocco alla volta applicando la formula RCCF;
3. FASE 3 - Revisione Incrociata: Fai rileggere l'intero elaborato all'IA chiedendole di verificare coerenza e linearità;
4. FASE 4 - Packaging Commerciale: Fatti generare la sintesi esecutiva (Executive Summary) e la presentazione in 5 slide per presentarlo ai decisori.""",
        "exercise": "Recupera un progetto che tenevi bloccato nel cassetto da mesi, applica la Fase 1 del metodo e genera l'indice operativo completo.",
        "checklist": [
            "Selezionato un progetto ambizioso da sbloccare",
            "Applicato il metodo in 4 fasi per lo sviluppo rapido",
            "Generata la prima versione concreta pronta per la validazione"
        ]
    },
    20: {
        "title": "20. Riepilogo Corso AI & Prossimi Passi",
        "subtitle": "Consolidamento delle competenze, rilascio attestato ufficiale 16 ore e introduzione al percorso AI Pro.",
        "objectives": [
            "Ripercorrere i 20 moduli e verificare il consolidamento di tutte le competenze pratiche acquisite.",
            "Scaricare l'Attestato Ufficiale di Completamento del Corso Base AI Start (16 Ore Certificate).",
            "Scoprire il livello avanzato successivo: automatizzare processi con Webhook, n8n e Agenti nel percorso AI Pro."
        ],
        "core_concepts": [
            ("Il Bagaglio Operativo Acquisito", "Hai interiorizzato il metodo RCCF, il reverse prompting, la creazione di presentazioni, l'analisi dati su fogli di calcolo, la difesa dalle allucinazioni, la tutela della privacy e la costruzione di workflow personali."),
            ("La Pratica Quotidiana Costante", "L'intelligenza artificiale è una competenza muscolare: l'eccellenza si consolida usandola ogni giorno per risolvere problemi reali, evitando di tornare alle vecchie abitudini manuali."),
            ("Il Prossimo Livello: Dal Dialogo all'Automazione (AI Pro)", "Nel Corso Base hai imparato a dialogare efficacemente con l'IA nella chat. Nel percorso avanzato AI Pro imparerai a collegare i modelli ad API, Webhook, fogli di calcolo e database per far lavorare i sistemi h24 in background!")
        ],
        "cheat_sheet": """# Il Decalogo del Professionista AI Start:
1. Pensa prima di digitare: chiarisci a te stesso l'obiettivo prima di aprire la chat;
2. Applica sempre Ruolo, Contesto, Contenuto e Formato (RCCF);
3. Fissa vincoli rigorosi su lunghezza, pubblico e stile;
4. Fornisci esempi pratici di stile atteso (Few-Shot Prompting);
5. Non fermarti alla prima risposta: itera e affina selettivamente;
6. Ancora sempre le risposte a documenti verificati (Grounding);
7. Disattiva il training sui tuoi dati e tutela le informazioni sensibili;
8. Costruisci e arricchisci continuamente la tua Prompt Library;
9. Ricorda: l'IA suggerisce e propone, l'essere umano valida e decide;
10. Continua a sperimentare con curiosità e spirito critico.""",
        "exercise": "Completa il quiz finale di verifica sulla piattaforma, genera il tuo Attestato Ufficiale di Certificazione AI Start e condividi il tuo successo formativo!",
        "checklist": [
            "Verificato il consolidamento di tutti i 20 moduli formativi",
            "Attestato Ufficiale di Certificazione (16 Ore) generato e scaricato",
            "Pronto per esplorare le automazioni avanzate del percorso AI Pro"
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
      content: "aiutiamoci.cloud • Corso Base AI Start (16 Ore) • Dispensa Operativa";
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
    border-bottom: 2.5px solid #4f46e5;
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
    background-color: #4f46e5;
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
    color: #3730a3;
    border-left: 3.5px solid #4f46e5;
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
    background-color: #eff6ff;
    border: 1.5px solid #93c5fd;
    border-radius: 5px;
    padding: 8px 12px;
    margin: 8px 0;
  }}
  .exercise-title {{
    font-weight: 800;
    color: #1e40af;
    font-size: 9pt;
    margin-bottom: 3px;
  }}
  .exercise-text {{
    color: #1e3a8a;
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
    color: #4f46e5;
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
      <strong>CORSO BASE AI START • 16 ORE CERTIFICATE</strong><br>
      Domina l'Intelligenza Artificiale da Zero — Metodo Pratico & Prompt RCCF
    </div>
  </div>

  <div class="badge-row">
    <span class="badge">Dispensa Studente Corso Base</span>
    <span class="badge-tag">Modulo {mod_num:02d} di 20</span>
    <span class="badge-tag">Percorso AI Start</span>
  </div>

  <h1>{title}</h1>
  <div class="subtitle">{subtitle}</div>

  <div class="section-title">🎯 Obiettivi Didattici & Risultati Attesi</div>
  <ul class="obj-list">
    {obj_html}
  </ul>

  <div class="section-title">💡 Concetti Chiave & Metodo Operativo</div>
  {concepts_html}

  <div class="section-title">📋 Prompt RCCF & Schemi Pratici (Pronti all'Uso)</div>
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
    html_file = os.path.join(SCRATCH_DIR, f"dispensa_base_modulo_{mod_num:02d}.html")
    with open(html_file, "w", encoding="utf-8") as f:
        f.write(html_content)

    pdf_filename = f"DISPENSA_STUDENTE_MODULO_{mod_num:02d}.pdf"
    pdf_out_public = os.path.join(OUTPUT_DIR, pdf_filename)

    weasy_bin = "/opt/homebrew/bin/weasyprint"
    res = subprocess.run([weasy_bin, html_file, pdf_out_public], capture_output=True, text=True)
    if res.returncode != 0:
        print(f"[ERRORE Modulo {mod_num}] Weasyprint:", res.stderr)
        return False
    else:
        print(f"✓ Generata dispensa Base Modulo {mod_num:02d}: {pdf_filename}")
        return True

def main():
    print("Avvio compilazione delle 20 dispense ufficiali per studenti del Corso Base AI Start...")
    success_count = 0
    for mod_num in range(1, 21):
        data = MODULES_DATA.get(mod_num)
        if data:
            if generate_pdf_for_module(mod_num, data):
                success_count += 1
        else:
            print(f"Dati mancanti per modulo {mod_num}")

    print(f"\nOperazione completata con successo: {success_count}/20 PDF generati in public/dispense.")

if __name__ == "__main__":
    main()
