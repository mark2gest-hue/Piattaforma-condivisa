import os

OUTPUT_DIR = "scratch/antigravity_video"

# Dati per le Lezioni 06 - 10 (ciascuna 18-20 minuti su 3 pagine esatte)
LEZIONI_DATA = [
    {
        "num": "06",
        "title": "GOOGLE AI STUDIO — LA PRIMA CHIAVE GRATUITA & GEMINI FLASH",
        "subtitle": "Masterclass AI Pro (Percorso 20 Ore) • Guida alla Regia per Stefano",
        "badge": "Lezione 06 • Gratuita 100%",
        "goal": "Accedere a Google AI Studio, ottenere la prima API Key ufficiale a costo zero per Gemini 2.5 Flash, testarla nel Playground ed effettuare la prima chiamata di prova senza spendere un centesimo.",
        "prep": ["Account Google personale o aziendale attivo", "Browser aperto su aistudio.google.com", "Mostrare la facilità disarmante di creazione in 60 secondi"],
        "fasi": [
            {
                "titolo": "FASE 1: Perché Google Regala le API di Gemini Flash",
                "time": "⏱️ Minuti 00:00 - 04:00",
                "screen": "Webcam frontale di Stefano, poi mostra la home di Google AI Studio.",
                "speech": "Bentornati nella sesta lezione della Masterclass AI Pro!<br><br>Nella scorsa lezione abbiamo capito cosa sono le API. Oggi passiamo all'azione pratica: creeremo la vostra primissima chiave API ufficiale di Google.<br><br>Molti si chiedono: 'Perché Google offre gratuitamente le API di Gemini 2.5 Flash?'. La risposta è che Google vuole far testare i propri modelli veloci agli sviluppatori e alle aziende, offrendo una quota gratuita giornaliera generosissima (fino a 15 richieste al minuto), più che sufficiente per tutti i nostri test e automazioni senza mai inserire una carta di credito.<br><br>Oggi vediamo come ottenerla in meno di un minuto e come provarla nel Playground interattivo."
            },
            {
                "titolo": "FASE 2: Accesso a Google AI Studio & Primo Tour",
                "time": "⏱️ Minuti 04:00 - 08:30",
                "screen": "1. Digita nel browser: aistudio.google.com<br>2. Accedi con l'account Google.<br>3. Mostra l'interfaccia: barra laterale, scelta modello (Gemini 2.5 Flash) e finestra di prompt.",
                "speech": "Apriamo il browser e andiamo su <code>aistudio.google.com</code>. Effettuiamo l'accesso con il nostro normale account Google.<br><br>Questa schermata è il <strong>Playground di Google</strong>: il banco di prova dove possiamo testare i modelli prima di collegarli ai nostri programmi.<br><br>In alto a destra vedete il selettore del modello: selezioniamo <strong>Gemini 2.5 Flash</strong>, il modello più veloce, economico e performante per l'elaborazione di testi aziendali e documenti."
            },
            {
                "titolo": "FASE 3: Creazione della Chiave API (Get API Key in 60s)",
                "time": "⏱️ Minuti 08:30 - 12:30",
                "screen": "1. Fai clic sul pulsante blu 'Get API Key' in alto a sinistra.<br>2. Clicca su 'Create API Key in new project'.<br>3. Mostra la chiave generata (es. AIzaSy...).<br>4. Copia la chiave e salvala negli appunti.",
                "speech": "Guardate quanto è semplice: clicco sul pulsante blu in alto a sinistra <strong>'Get API key'</strong>.<br><br>Poi clicco su <em>'Create API key in new project'</em>: in 3 secondi Google genera la nostra chiave univoca personale.<br><br>Ecco la nostra stringa segreta. Clicco su 'Copia': da questo momento abbiamo in mano la chiave per far interrogare Gemini da qualsiasi programma o bot che costruiremo nel corso!"
            },
            {
                "titolo": "FASE 4: Il Test nel Playground (System Instructions & Testo)",
                "time": "⏱️ Minuti 12:30 - 16:30",
                "screen": "1. Torna nel Playground.<br>2. Incolla nelle System Instructions: 'Sei il consulente commerciale di Aiutiamoci. Rispondi in modo sintetico'.<br>3. Scrivi un messaggio di prova e mostra la risposta istantanea di Gemini Flash.",
                "speech": "Facciamo subito un test nel Playground.<br><br>Nelle <em>System Instructions</em> possiamo impostare il ruolo del modello (es. consulente commerciale sintetico), e nella chat scriviamo una richiesta di prova.<br><br>Guardate la velocità di risposta di Gemini 2.5 Flash: istantanea, precisa e a costo zero.<br><br>Abbiamo verificato che il modello funziona alla perfezione ed è pronto per essere agganciato alle automazioni."
            },
            {
                "titolo": "FASE 5: Esercizio per lo Studente & Lancio Lezione 7 (OpenAI)",
                "time": "⏱️ Minuti 16:30 - 19:30",
                "screen": "Webcam frontale con riepilogo della chiave creata.",
                "speech": "Avete appena superato uno dei passaggi più importanti: possedete la vostra prima chiave AI ufficiale!<br><br><strong>Esercizio per oggi</strong>: andate su <code>aistudio.google.com</code>, generate la vostra API Key e salvatela in un posto sicuro sul vostro computer.<br><br>Nella <strong>Lezione 7</strong> faremo lo stesso con <strong>OpenAI Platform (i creatori di ChatGPT)</strong> e vedremo come impostare un <strong>tetto massimo invalicabile di 5€</strong> per proteggere il conto aziendale da qualsiasi consumo imprevisto!<br><br>Buon lavoro e alla prossima lezione!"
            }
        ]
    },
    {
        "num": "07",
        "title": "OPENAI PLATFORM — MODELLI GPT & BUDGET CAP A 5€",
        "subtitle": "Masterclass AI Pro (Percorso 20 Ore) • Guida alla Regia per Stefano",
        "badge": "Lezione 07 • Sicurezza Costi",
        "goal": "Creare l'account sviluppatore su OpenAI Platform, capire i modelli (GPT-4o Mini), ricaricare un budget minimo (5€) e impostare il limite di spesa massimo (Budget Cap) per lavorare con serenità totale.",
        "prep": ["Browser aperto su platform.openai.com", "Carta ricaricabile o aziendale con 5€", "Evidenziare la differenza tra ChatGPT Plus e OpenAI Platform"],
        "fasi": [
            {
                "titolo": "FASE 1: OpenAI Platform vs ChatGPT — La Differenza Chiave",
                "time": "⏱️ Minuti 00:00 - 04:00",
                "screen": "Webcam frontale di Stefano, poi mostra platform.openai.com.",
                "speech": "Bentornati nella settima lezione della Masterclass AI Pro!<br><br>Nella lezione precedente abbiamo ottenuto la chiave gratuita di Google. Oggi andiamo su <strong>OpenAI</strong>, i creatori di ChatGPT.<br><br>Molti confondono il sito consumer <code>chatgpt.com</code> con il portale per sviluppatori <strong><code>platform.openai.com</code></strong>.<br><br>Sul portale Platform non paghiamo 20€ al mese di abbonamento fisso: paghiamo solo i centesimi che consumiamo. Oggi vediamo come creare l'account, caricare 5€ simbolici e impostare un <strong>lucchetto di sicurezza</strong> per non spendere mai un centesimo in più di quanto deciso."
            },
            {
                "titolo": "FASE 2: I Modelli OpenAI — Perché Scegliamo GPT-4o Mini",
                "time": "⏱️ Minuti 04:00 - 08:30",
                "screen": "Mostra la documentazione modelli OpenAI: GPT-4o vs GPT-4o-mini con tabella prezzi.",
                "speech": "Diamo un'occhiata ai modelli disponibili su OpenAI.<br><br>Il modello di punta per le automazioni aziendali si chiama <strong>GPT-4o Mini</strong>. È ultra-intelligente, velocissimo e costa circa 60 volte meno rispetto ai modelli tradizionali.<br><br>Per darvi un'idea pratica: con 5€ di credito su GPT-4o Mini potete analizzare oltre 15.000 pagine di testo o smistare 30.000 email aziendali.<br><br>È il modello ideale per costruire preventivatori, assistenti clienti e bot senza incidere sui costi aziendali."
            },
            {
                "titolo": "FASE 3: Ricarica Minima & Impostazione del Budget Cap (Limite 5€)",
                "time": "⏱️ Minuti 08:30 - 12:30",
                "screen": "1. Vai su Settings -> Billing.<br>2. Mostra 'Add funds' (5€ + IVA).<br>3. Vai su Usage Limits e imposta 'Hard limit: $5.00' e 'Soft limit: $3.00'.",
                "speech": "Passiamo alla sezione fondamentale per la sicurezza aziendale: andiamo su <strong>Settings -> Billing</strong>.<br><br>Facciamo una ricarica minima prepagata di 5$. Poi andiamo subito nella scheda <strong>Usage Limits</strong>.<br><br>Qui impostiamo due tetti invalicabili:<br>• <strong>Soft Limit a 3$</strong>: OpenAI ci invia un'email di avviso quando raggiungiamo 3 dollari di consumo.<br>• <strong>Hard Limit a 5$</strong>: l'API si blocca automaticamente e non può prelevare neanche un centesimo in più.<br><br>In questo modo avete la garanzia matematica e contrattuale di non avere mai sorprese sulla carta."
            },
            {
                "titolo": "FASE 4: Generazione della API Key OpenAI",
                "time": "⏱️ Minuti 12:30 - 16:30",
                "screen": "1. Clicca su 'API Keys' nel menu a sinistra.<br>2. Clicca 'Create new secret key'.<br>3. Assegna il nome 'aiutiamoci-masterclass'.<br>4. Copia la chiave `sk-proj-...`.",
                "speech": "Ora che il conto è protetto e ricaricato, creiamo la nostra chiave: andiamo su <strong>API Keys</strong> e clicchiamo su <em>'Create new secret key'</em>.<br><br>Diamo un nome riconoscibile come 'aiutiamoci-masterclass'.<br><br>OpenAI ci mostra la chiave una sola volta: la copiamo e la custodiamo nel nostro file di appunti riservato.<br><br>Ora possediamo le due chiavi più potenti al mondo: Google Gemini e OpenAI GPT!"
            },
            {
                "titolo": "FASE 5: Esercizio Pratico & Lancio Lezione 8 (JSON)",
                "time": "⏱️ Minuti 16:30 - 19:30",
                "screen": "Webcam frontale con riepilogo chiavi create.",
                "speech": "Ottimo lavoro! Avete configurato il vostro account OpenAI con il budget cap protetto a 5€.<br><br><strong>Esercizio per oggi</strong>: entrate su <code>platform.openai.com</code>, impostate i limiti di spesa e generate la vostra chiave personale.<br><br>Nella <strong>Lezione 8</strong> impareremo il linguaggio con cui i computer scambiano i dati: il formato <strong>JSON</strong> e come obbligare l'AI a rispondere solo con tabelle rigide senza parole di troppo!<br><br>Ci vediamo alla prossima lezione!"
            }
        ]
    },
    {
        "num": "08",
        "title": "JSON & RISPOSTE STRUTTURATE — IL LINGUAGGIO DEI COMPUTER",
        "subtitle": "Masterclass AI Pro (Percorso 20 Ore) • Guida alla Regia per Stefano",
        "badge": "Lezione 08 • Dati Strutturati",
        "goal": "Capire cos'è il formato JSON (chiave: valore), perché è fondamentale per le automazioni e come costringere l'AI a produrre solo output strutturati pronti per essere letti da altri programmi.",
        "prep": ["Esempio visivo di un JSON a schermo", "Playground con prompt in modalità Structured Output", "Mostrare la differenza tra risposta discorsiva e risposta JSON"],
        "fasi": [
            {
                "titolo": "FASE 1: Perché i Computer Odiano i Discorsi e Amano il JSON",
                "time": "⏱️ Minuti 00:00 - 04:00",
                "screen": "Webcam frontale di Stefano, poi mostra una risposta normale vs una risposta in JSON.",
                "speech": "Bentornati nella lezione 8 della Masterclass AI Pro!<br><br>Oggi affrontiamo un concetto che trasforma un dilettante dell'AI in un professionista dell'automazione: il formato <strong>JSON</strong>.<br><br>Se chiediamo all'AI: 'Dimmi i dati del cliente Rossi', l'AI risponde con un testo tipo: 'Certamente! Ecco i dati: il signor Mario Rossi abita a Roma ed è interessato al corso...'.<br><br>Per un essere umano va benissimo, ma un programma automatico (come Excel o un gestionale) non sa cosa farsene di 'Certamente!': cerca solo il campo <em>Nome</em>, <em>Città</em> e <em>Prezzo</em>.<br><br>Oggi impariamo a far parlare l'AI nella lingua universale dei dati strutturati."
            },
            {
                "titolo": "FASE 2: L'Anatomia di un JSON — Chiave e Valore",
                "time": "⏱️ Minuti 04:00 - 08:30",
                "screen": "Mostra a schermo la struttura: { 'nome': 'Mario', 'cognome': 'Rossi', 'preventivo': 1500 } con spiegazione visiva.",
                "speech": "Guardate quanto è semplice un JSON: è racchiuso tra parentesi graffe ed è composto da coppie di <strong>Chiave e Valore</strong>.<br><br>Ad esempio:<br><code>'nome': 'Mario'</code><br><code>'azienda': 'Rossi SRL'</code><br><code>'preventivo': 1500</code><br><br>Non ci sono parole inutili, convenevoli o frasi di cortesia: ci sono solo le etichette esatte e i dati corrispondenti. Questo permette a qualsiasi software esterno di prelevare il valore '1500' e inserirlo all'istante in una fattura o in una riga di database."
            },
            {
                "titolo": "FASE 3: Come Istruire l'AI a Rispondere SOLO in JSON",
                "time": "⏱️ Minuti 08:30 - 12:30",
                "screen": "1. Apri il Playground.<br>2. Inserisci il prompt: 'Estrai i dati dall'email del cliente e rispondi ESCLUSIVAMENTE in formato JSON con schema: { nome, email, servizio_richiesto, urgenza }'.<br>3. Mostra l'output puro.",
                "speech": "Facciamo una prova pratica: incolliamo un'email informale di un cliente disordinata.<br><br>Nel prompt diciamo all'AI: <em>'Estrai i dati e rispondi ESCLUSIVAMENTE in formato JSON secondo questo schema'</em>.<br><br>Guardate l'output: zero chiacchiere, zero introduzioni. Solo il blocco JSON perfetto, pulito e validato.<br><br>Questo è il mattoncino con cui alimenteremo i flussi automatici senza mai rischiare che il sistema vada in errore."
            },
            {
                "titolo": "FASE 4: JSON Schema & Risposte Garantite (Structured Outputs)",
                "time": "⏱️ Minuti 12:30 - 16:30",
                "screen": "Mostra l'impostazione 'JSON Mode' o 'Response format: JSON' nelle opzioni del modello.",
                "speech": "Sia OpenAI che Google offrono oggi una funzione chiamata <strong>Structured Outputs (o JSON Mode)</strong>.<br><br>Attivando questa spunta, il modello matematicamente NON PUÒ rispondere in testo normale: è costretto al 100% a rispettare la struttura che abbiamo definito.<br><br>Questo elimina per sempre il rischio di errori di formattazione nelle nostre automazioni aziendali."
            },
            {
                "titolo": "FASE 5: Esercizio Pratico & Lancio Lezione 9 (n8n)",
                "time": "⏱️ Minuti 16:30 - 19:30",
                "screen": "Webcam frontale con anteprima dell'interfaccia di n8n.",
                "speech": "Oggi avete imparato la lingua con cui l'AI dialoga con i programmi aziendali.<br><br><strong>Esercizio per oggi</strong>: prendete un'email reale e chiedete a ChatGPT o Gemini di convertirla in formato JSON con le chiavi <code>nome</code>, <code>telefono</code> e <code>richiesta</code>.<br><br>Nella <strong>Lezione 9</strong> apriamo le porte del <strong>Pilastro 3</strong> ed entriamo per la prima volta in <strong>n8n</strong>: la piattaforma visiva senza codice per collegare nodi, webhook e creare automazioni spettacolari!<br><br>Ci vediamo alla prossima lezione!"
            }
        ]
    },
    {
        "num": "09",
        "title": "BENVENUTI IN N8N — NODI, TRIGGER & INTERFACCIA VISUALE",
        "subtitle": "Masterclass AI Pro (Percorso 20 Ore) • Guida alla Regia per Stefano",
        "badge": "Lezione 09 • Automazioni No-Code",
        "goal": "Accedere all'ambiente n8n (o istanza cloud/locale), capire l'interfaccia a nodi visuali (Trigger -> Azione) e creare il primo flusso di prova senza scrivere una riga di codice.",
        "prep": ["Istanza n8n aperta a schermo (n8n.mark2.cloud o locale)", "Flusso pulito con un nodo Trigger Manuale e un nodo Notifica", "Mostrare la facilità del drag-and-drop"],
        "fasi": [
            {
                "titolo": "FASE 1: Benvenuti nel Pilastro 3 — L'Orchestratore Aziendale n8n",
                "time": "⏱️ Minuti 00:00 - 04:00",
                "screen": "Webcam frontale di Stefano, poi mostra la dashboard di n8n.",
                "speech": "Bentornati nella nona lezione della Masterclass AI Pro!<br><br>Oggi entriamo ufficialmente nel <strong>Pilastro 3</strong> e facciamo la conoscenza con lo strumento più amato dalle aziende moderne: <strong>n8n</strong>.<br><br>Cos'è n8n? È un orchestratore visivo: immaginate una lavagna digitale dove potete collegare tra loro centinaia di programmi (Gmail, Excel, Telegram, l'AI di Google o OpenAI) semplicemente unendo dei blocchetti chiamati <strong>Nodi</strong> con delle frecce.<br><br>Zero codice, zero complessità: oggi facciamo il primo tour dell'interfaccia e creiamo il nostro primo flusso di automazione."
            },
            {
                "titolo": "FASE 2: L'Anatomia di un Workflow — Trigger ed Esecuzione",
                "time": "⏱️ Minuti 04:00 - 08:30",
                "screen": "Mostra il concetto a schermo: 1. Trigger (Quando succede qualcosa) -> 2. Nodo intermedio (Elaborazione) -> 3. Azione (Risultato).",
                "speech": "Ogni automazione in n8n segue una regola universale in 2 passaggi:<br><br>1. <strong>Il TRIGGER (Il Grilletto)</strong>: è l'evento che fa partire il flusso. Ad esempio: 'Arriva una nuova email', 'Uno studente compila un modulo sul sito', oppure 'Sono le ore 09:00 del mattino'.<br>2. <strong>LE AZIONI (I Nodi successivi)</strong>: ciò che il sistema deve fare in automatico. Ad esempio: 'Passa il testo all'AI, crea una riga su Google Sheets e inviami un messaggio su Telegram'.<br><br>Una volta attivato, n8n lavora in background 24 ore su 24 e 7 giorni su 7 per voi."
            },
            {
                "titolo": "FASE 3: Creare il Primo Workflow — Nodo Manual Trigger & Sticky Note",
                "time": "⏱️ Minuti 08:30 - 12:30",
                "screen": "1. Clicca su 'Create Workflow'.<br>2. Inserisci il nodo 'Manual Trigger'.<br>3. Aggiungi una Sticky Note gialla per spiegare il flusso.<br>4. Mostra il canvas pulito e ordinato.",
                "speech": "Creiamo insieme il nostro primo workflow: clicco su <em>'Create Workflow'</em>.<br><br>Il primo nodo che inseriamo è il <strong>Manual Trigger</strong>: un pulsante di test che ci permette di far partire il flusso con un click per provare che tutto funzioni.<br><br>Possiamo anche aggiungere delle note colorate (Sticky Notes) per documentare il lavoro: in azienda l'ordine e la chiarezza visiva sono fondamentali."
            },
            {
                "titolo": "FASE 4: Aggiungere un Nodo di Test (Code / Set Data) & Esecuzione",
                "time": "⏱️ Minuti 12:30 - 16:30",
                "screen": "1. Clicca sul '+' del trigger.<br>2. Cerca il nodo 'Edit Fields (Set)'.<br>3. Imposta due campi: 'nomeCliente: Marco' e 'stato: Attivo'.<br>4. Clicca 'Test Step' e mostra i dati che passano da sinistra a destra.",
                "speech": "Colleghiamo il secondo nodo: clicco sul '+' e scelgo il nodo <strong>Edit Fields</strong>.<br><br>Inserisco un paio di dati di prova: il nome di un cliente e il suo stato.<br><br>Ora clicco su <strong>Test Step</strong>: guardate cosa succede! I dati fluiscono da sinistra verso destra attraverso il cavo verde.<br><br>Questo è il principio fondamentale di n8n: ogni nodo riceve i dati dal precedente, li elabora e li passa al successivo."
            },
            {
                "titolo": "FASE 5: Esercizio Pratico & Lancio Lezione 10 (Checkpoint 2: Webhook)",
                "time": "⏱️ Minuti 16:30 - 19:30",
                "screen": "Webcam frontale con riepilogo del workflow creato.",
                "speech": "Avete appena mosso i primi passi all'interno del motore di automazione più potente al mondo!<br><br><strong>Esercizio per oggi</strong>: aprite n8n, create un nuovo workflow, inserite un Manual Trigger e fate la vostra prima esecuzione di prova.<br><br>Nella <strong>Lezione 10</strong> siamo al <strong>Checkpoint 2 (Metà Corso)</strong>: impareremo a creare un <strong>Webhook</strong>, cioè un link segreto capace di ricevere dati da qualsiasi sito web o app esterna in tempo reale!<br><br>Ci vediamo al Checkpoint 2!"
            }
        ]
    },
    {
        "num": "10",
        "title": "CHECKPOINT 2 — IL PRIMO WEBHOOK & METÀ CORSO",
        "subtitle": "Masterclass AI Pro (Percorso 20 Ore) • Guida alla Regia per Stefano",
        "badge": "🏁 Checkpoint 2 • Metà Corso",
        "goal": "Celebrare il traguardo delle prime 10 lezioni, creare un nodo Webhook su n8n, inviare dati da un form esterno/Postman/browser e vedere l'automazione scattare in tempo reale.",
        "prep": ["Workflow n8n con nodo Webhook attivo (metodo POST)", "Strumento per testare (modulo web o estensione browser/curl)", "Tono festoso per il raggiungimento di metà percorso!"],
        "fasi": [
            {
                "titolo": "FASE 1: Celebrazione di Metà Corso (10 Ore Formative Raggiunte!)",
                "time": "⏱️ Minuti 00:00 - 04:00",
                "screen": "Webcam frontale di Stefano con badge celebrativo di metà percorso.",
                "speech": "Benvenuti alla decima lezione e al nostro <strong>Checkpoint 2: siamo esattamente a metà della Masterclass AI Pro!</strong><br><br>Facciamo un bilancio straordinario di quello che avete già conquistato:<br>• Sapete creare agenti locali su Antigravity con regole blindate.<br>• Sapete estrarre ed elaborare dati in CSV ed Excel.<br>• Avete le vostre chiavi API di Google e OpenAI con budget protetto.<br>• Conoscete il formato JSON e avete mosso i primi passi su n8n.<br><br>Oggi sblocchiamo la competenza regina di ogni integratore digitale: il <strong>Webhook</strong>."
            },
            {
                "titolo": "FASE 2: Cos'è un Webhook — Il Campanello Digitale",
                "time": "⏱️ Minuti 04:00 - 08:30",
                "screen": "Grafica esplicativa: Un form web invia dati -> URL Webhook n8n -> Il flusso scatta all'istante.",
                "speech": "Cos'è un Webhook? Immaginatelo come un <strong>campanello di casa con una cassetta delle lettere incorporata</strong>.<br><br>Fino ad oggi i programmi tradizionali dovevano controllare continuamente ogni 5 minuti: 'Ci sono novità? Ci sono novità?'. Questo consumava tempo e risorse.<br><br>Il Webhook fa l'opposto: n8n genera un URL unico (un indirizzo web dedicato). Appena un cliente compila un modulo sul vostro sito o fa un pagamento, invia un pacchetto di dati a questo indirizzo: il campanello suona e n8n si sveglia all'istante per elaborare la richiesta in tempo reale."
            },
            {
                "titolo": "FASE 3: Creare e Configurare il Nodo Webhook su n8n",
                "time": "⏱️ Minuti 08:30 - 12:30",
                "screen": "1. Aggiungi nodo 'Webhook' su n8n.<br>2. Imposta HTTP Method: POST.<br>3. Imposta Path: 'iscrizione-cliente'.<br>4. Copia il Test Webhook URL.<br>5. Clicca 'Listen for test event'.",
                "speech": "Configuriamo il nostro campanello in 3 click:<br><br>1. Inserisco il nodo <strong>Webhook</strong>.<br>2. Imposto il metodo su <strong>POST</strong> (che significa 'invio di nuovi dati').<br>3. Nel percorso scrivo 'iscrizione-cliente'.<br><br>n8n ci fornisce un indirizzo URL dedicato. Clicco su <em>'Listen for test event'</em>: ora n8n è in ascolto, in attesa che qualcuno suoni il campanello."
            },
            {
                "titolo": "FASE 4: La Prova dal Vivo — Inviare i Dati e Vedere il Flusso Scattare",
                "time": "⏱️ Minuti 12:30 - 16:30",
                "screen": "1. Invia una chiamata di prova con dati JSON { 'cliente': 'Mario Rossi', 'email': 'mario@rossi.it' }.<br>2. Mostra n8n che riceve i dati all'istante con il badge verde di successo.<br>3. Mostra i campi arrivati nel pannello Output.",
                "speech": "Facciamo la prova del nove!<br><br>Invio un messaggio di prova con i dati di un cliente (Nome ed Email).<br><br>Guardate lo schermo: <strong>BAM!</strong> n8n ha catturato l'evento in meno di 10 millisecondi!<br><br>Nella colonna di destra compaiono esattamente i dati che abbiamo inviato: 'Mario Rossi' e 'mario@rossi.it', pronti per essere passati al prossimo nodo per far lavorare l'AI.<br><br>Avete appena creato una porta di comunicazione diretta tra il mondo esterno e il vostro sistema automatico."
            },
            {
                "titolo": "FASE 5: Superamento Checkpoint 2 & Lancio della Seconda Metà del Corso",
                "time": "⏱️ Minuti 16:30 - 19:30",
                "screen": "Webcam frontale con riepilogo delle prossime 10 lezioni (Fogli di calcolo, preventivatori, RAG, Telegram e deploy).",
                "speech": "Complimenti vivissimi: avete superato a pieni voti il <strong>Checkpoint 2 di metà corso!</strong><br><br>Nella seconda metà del percorso metteremo insieme tutti i pezzi del puzzle:<br>• Nella <strong>Lezione 11</strong> collegheremo l'AI al nostro Webhook per fargli elaborare i dati in arrivo.<br>• Nelle lezioni successive collegheremo Google Sheets, smistatori email, preventivatori automatici, il sistema RAG anti-allucinazioni e i bot Telegram di controllo umano!<br><br>Siete ufficialmente pronti per diventare dei veri esperti di Automazioni AI. Ci vediamo alla Lezione 11!"
            }
        ]
    }
]

def generate_html_and_save():
    for item in LEZIONI_DATA:
        fasi_html = ""
        for idx, f in enumerate(item["fasi"]):
            pb = '<div class="page-break"></div>' if idx in [1, 3] else ''
            fasi_html += f"""
            {pb}
            <div class="module-card">
              <div class="module-header">
                <div class="module-title">{f['titolo']}</div>
                <div class="module-time">{f['time']}</div>
              </div>
              <div class="module-body">
                <div class="step-box">
                  <div class="step-label">🖥️ Cosa mostrare a schermo:</div>
                  <div class="action-text">{f['screen']}</div>
                  <div class="step-label">🗣️ Cosa dire a voce (Copione per Stefano):</div>
                  <div class="speech-box">
                    "{f['speech']}"
                  </div>
                </div>
              </div>
            </div>
            """

        prep_li = "".join([f"<li><strong>{p.split(':')[0]}:</strong> {p.split(':')[1] if ':' in p else p}</li>" for p in item["prep"]])

        full_html = f"""<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="UTF-8">
<title>Lezione {item['num']} — Guida alla Regia & Copione Docenza per Stefano</title>
<style>
  @page {{
    size: A4;
    margin: 12mm 12mm 12mm 12mm;
    @bottom-left {{
      content: "aiutiamoci.cloud • Masterclass AI Pro — Lezione {item['num']} (Corso 20 Ore)";
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      font-size: 7.5pt;
      color: #64748b;
    }}
    @bottom-right {{
      content: "Pagina " counter(page) " di " counter(pages);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      font-size: 7.5pt;
      color: #64748b;
      font-weight: bold;
    }}
  }}

  body {{
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    color: #0f172a;
    line-height: 1.4;
    font-size: 8.8pt;
    margin: 0;
    padding: 0;
  }}

  .header {{
    border-bottom: 2.5px solid #0284c7;
    padding-bottom: 8px;
    margin-bottom: 10px;
    display: table;
    width: 100%;
  }}
  .header-left {{
    display: table-cell;
    vertical-align: middle;
    width: 65%;
  }}
  .header-right {{
    display: table-cell;
    vertical-align: middle;
    text-align: right;
    width: 35%;
  }}
  .brand-title {{
    font-size: 13pt;
    font-weight: 800;
    color: #0f172a;
    letter-spacing: -0.02em;
    margin: 0;
  }}
  .brand-subtitle {{
    font-size: 8pt;
    color: #0284c7;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-top: 1px;
  }}
  .badge-doc {{
    display: inline-block;
    background: #f0fdf4;
    color: #166534;
    border: 1px solid #bbf7d0;
    font-weight: 700;
    font-size: 7.5pt;
    padding: 2px 7px;
    border-radius: 5px;
    text-transform: uppercase;
  }}

  .hero-box {{
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
    color: #ffffff;
    border-radius: 10px;
    padding: 12px 16px;
    margin-bottom: 10px;
    border: 1px solid #334155;
  }}
  .hero-box h1 {{
    font-size: 11.5pt;
    font-weight: 800;
    margin: 0 0 4px 0;
    color: #38bdf8;
    letter-spacing: -0.01em;
  }}
  .hero-box p {{
    font-size: 8.4pt;
    color: #e2e8f0;
    margin: 0;
    line-height: 1.35;
  }}

  h2 {{
    font-size: 10.5pt;
    color: #0f172a;
    border-bottom: 1.5px solid #e2e8f0;
    padding-bottom: 2px;
    margin-top: 12px;
    margin-bottom: 6px;
    page-break-after: avoid;
  }}

  .module-card {{
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    margin-bottom: 8px;
    overflow: hidden;
    page-break-inside: avoid;
    background: #ffffff;
  }}
  .module-header {{
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
    padding: 5px 8px;
    display: table;
    width: 100%;
    box-sizing: border-box;
  }}
  .module-title {{
    display: table-cell;
    font-size: 8.5pt;
    font-weight: 800;
    color: #0f172a;
  }}
  .module-time {{
    display: table-cell;
    text-align: right;
    font-size: 7.5pt;
    font-weight: 700;
    color: #0284c7;
  }}
  .module-body {{
    padding: 6px 8px;
  }}

  .step-box {{
    margin-bottom: 4px;
    padding: 6px 8px;
    background: #f1f5f9;
    border-left: 3px solid #0284c7;
    border-radius: 0 5px 5px 0;
  }}
  .step-label {{
    font-size: 7pt;
    font-weight: 800;
    text-transform: uppercase;
    color: #0369a1;
    margin-bottom: 2px;
  }}
  .action-text {{
    font-size: 8.2pt;
    color: #334155;
    margin-bottom: 4px;
  }}
  .speech-box {{
    background: #ffffff;
    border: 1px dashed #94a3b8;
    border-radius: 5px;
    padding: 6px 8px;
    font-size: 8.2pt;
    color: #0f172a;
    line-height: 1.35;
  }}
  .speech-box strong {{
    color: #0284c7;
  }}

  .tip-box {{
    background: #fffbeb;
    border: 1px solid #fef3c7;
    border-left: 3.5px solid #f59e0b;
    padding: 6px 8px;
    border-radius: 0 5px 5px 0;
    font-size: 7.8pt;
    color: #92400e;
    margin-top: 6px;
  }}

  .checklist {{
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 6px 10px;
    margin-bottom: 8px;
  }}
  .checklist ul {{
    margin: 2px 0 0 0;
    padding-left: 14px;
    font-size: 7.8pt;
    color: #334155;
  }}
  .checklist li {{
    margin-bottom: 1px;
  }}

  .page-break {{
    page-break-before: always;
  }}
</style>
</head>
<body>

  <!-- ==================== PAGINA 1: INTRODUZIONE & FASE 1 ==================== -->
  <div class="header">
    <div class="header-left">
      <h1 class="brand-title">LEZIONE {item['num']}: {item['title']}</h1>
      <div class="brand-subtitle">{item['subtitle']}</div>
    </div>
    <div class="header-right">
      <span class="badge-doc">{item['badge']}</span>
      <div style="font-size: 7.5pt; color: #64748b; margin-top: 1px;">Durata Stimata: 18 - 20 Minuti</div>
    </div>
  </div>

  <div class="hero-box">
    <h1>🎯 Obiettivo della Lezione</h1>
    <p>{item['goal']}</p>
  </div>

  <div class="checklist">
    <strong style="color: #0f172a; font-size: 8pt;">📋 Preparazione Desktop Prima di Iniziare:</strong>
    <ul>
      {prep_li}
    </ul>
  </div>

  <h2>SCALETTA OPERATIVA ESPANSA (5 FASI DA ~3.5-4 MINUTI CIASCUNA)</h2>

  {fasi_html}

  <div class="tip-box">
    <strong>💡 Consiglio di Regia per Stefano:</strong> Mantieni un ritmo calmo e rassicurante. Mostra con il mouse ogni click sul browser o su n8n: questa chiarezza visiva garantisce la perfetta comprensione dello studente e porta la lezione esattamente a 18-20 minuti!
  </div>

</body>
</html>
"""
        html_file = os.path.join(OUTPUT_DIR, f"LEZIONE_{item['num']}_COPIONE_REGIA_STEFANO.html")
        with open(html_file, "w", encoding="utf-8") as f:
            f.write(full_html)
        print(f"📄 File HTML generato: {html_file}")

if __name__ == "__main__":
    generate_html_and_save()
