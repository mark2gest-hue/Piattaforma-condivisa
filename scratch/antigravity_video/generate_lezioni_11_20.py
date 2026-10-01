import os

OUTPUT_DIR = "scratch/antigravity_video"

# Dati per le Lezioni 11 - 20 (ciascuna 18-20 minuti su 3 pagine esatte)
LEZIONI_DATA_11_20 = [
    {
        "num": "11",
        "title": "COLLEGARE L'AI AL WEBHOOK — L'AGENTE AUTOMATICO SU N8N",
        "subtitle": "Masterclass AI Pro (Percorso 20 Ore) • Guida alla Regia per Stefano",
        "badge": "Lezione 11 • AI su n8n",
        "goal": "Unire il Webhook creato nella lezione 10 con il nodo AI (Gemini/OpenAI) su n8n: far analizzare i dati ricevuti in ingresso ed emettere una diagnosi/risposta automatica istantanea.",
        "prep": ["Workflow n8n con nodo Webhook", "Chiave API Google/OpenAI a portata di mano", "Mostrare il cavo che unisce il Webhook al nodo AI"],
        "fasi": [
            {
                "titolo": "FASE 1: Benvenuti nella Seconda Metà del Corso — Dare il Cervello al Webhook",
                "time": "⏱️ Minuti 00:00 - 04:00",
                "screen": "Webcam frontale di Stefano, poi mostra il workflow n8n della lezione 10.",
                "speech": "Bentornati nell'undicesima lezione della Masterclass AI Pro!<br><br>Nella scorsa lezione abbiamo creato il nostro Webhook, cioè il campanello digitale che riceve i dati dall'esterno.<br><br>Oggi facciamo la magia: <strong>diamo un cervello a questo campanello</strong>. Collegheremo il nodo dell'Intelligenza Artificiale (usando la chiave gratuita di Google Gemini o OpenAI) per fare in modo che ogni dato in arrivo venga letto, compreso ed elaborato all'istante dall'AI senza nessun intervento umano.<br><br>Vediamo come unire i due nodi e configurare il prompt di elaborazione in 5 minuti."
            },
            {
                "titolo": "FASE 2: Inserire il Nodo 'Basic LLM Chain / OpenAI Model' su n8n",
                "time": "⏱️ Minuti 04:00 - 08:30",
                "screen": "1. Clicca sul '+' dopo il nodo Webhook.<br>2. Cerca 'AI / OpenAI' o 'Google Gemini'.<br>3. Incolla l'API Key nelle credenziali di n8n.<br>4. Seleziona il modello 'gemini-2.5-flash' o 'gpt-4o-mini'.",
                "speech": "Aggiungiamo il cervello al flusso: clicco sul '+' accanto al Webhook e cerco il nodo <strong>Google Gemini</strong> o <strong>OpenAI</strong>.<br><br>Nelle credenziali incolliamo la nostra API Key (quella che abbiamo generato nelle lezioni 6 e 7). n8n la memorizza in modo crittografato e sicuro.<br><br>Come modello scegliamo <strong>Gemini 2.5 Flash</strong> o <strong>GPT-4o Mini</strong>: velocità fulminea e costo praticamente nullo."
            },
            {
                "titolo": "FASE 3: Passare i Dati del Webhook nel Prompt dell'AI",
                "time": "⏱️ Minuti 08:30 - 12:30",
                "screen": "1. Nel campo Prompt, trascina la variabile '{{ $json.body.messaggio }}' proveniente dal Webhook.<br>2. Scrivi le istruzioni: 'Analizza la richiesta del cliente e scrivi una risposta commerciale calorosa e professionale'.",
                "speech": "Ora colleghiamo i fili: nel campo di testo del prompt usiamo il drag-and-drop di n8n.<br><br>Trasciniamo il testo arrivato dal cliente (<code>{{ $json.body.messaggio }}</code>) e diciamo all'AI:<br><em>'Analizza questa richiesta e genera una risposta commerciale professionale proponendo una videocall informativa'</em>.<br><br>In questo modo, ogni volta che un cliente diverso invia un messaggio, l'AI leggerà dinamicamente quel testo specifico."
            },
            {
                "titolo": "FASE 4: Il Test dal Vivo — Ricezione, Elaborazione e Risultato",
                "time": "⏱️ Minuti 12:30 - 16:30",
                "screen": "1. Invia una richiesta di prova simulata.<br>2. Mostra il flusso verde che si attiva.<br>3. Apri il nodo AI e leggi la risposta personalizzata generata in 1.2 secondi.",
                "speech": "Eseguiamo il test dal vivo: invio una richiesta da un cliente fittizio che chiede informazioni sul corso.<br><br>Guardate: il Webhook scatta, passa il messaggio al nodo AI e in 1 secondo esatto abbiamo la risposta commerciale personalizzata, impeccabile e pronta per essere inviata!<br><br>Il vostro primo Agente Cloud h24 è ufficialmente vivo e funzionante."
            },
            {
                "titolo": "FASE 5: Esercizio Pratico & Lancio Lezione 12 (Google Sheets)",
                "time": "⏱️ Minuti 16:30 - 19:30",
                "screen": "Webcam frontale con riepilogo del flusso e anteprima di Google Sheets.",
                "speech": "Avete appena creato il cuore pulsante di qualsiasi automazione moderna!<br><br><strong>Esercizio per oggi</strong>: collegate il nodo AI al vostro Webhook e testate l'elaborazione di un messaggio inviato da voi.<br><br>Nella <strong>Lezione 12</strong> faremo un passo fondamentale per il business: collegheremo <strong>Google Sheets ed Excel</strong> per salvare ogni richiesta e risposta in una riga di tabella ordinata in automatico!<br><br>A tra poco con la Lezione 12!"
            }
        ]
    },
    {
        "num": "12",
        "title": "FOGLI DI CALCOLO AUTOMATICI — GOOGLE SHEETS & EXCEL CLOUD",
        "subtitle": "Masterclass AI Pro (Percorso 20 Ore) • Guida alla Regia per Stefano",
        "badge": "Lezione 12 • Database No-Code",
        "goal": "Collegare n8n a Google Sheets, mappare le colonne del foglio di calcolo (Data, Cliente, Email, Sintesi AI, Stato) e registrare automaticamente ogni evento senza aprire il file a mano.",
        "prep": ["Foglio Google Sheets creato con colonne predefinite", "Nodo Google Sheets aggiunto su n8n", "Account Google connesso con OAuth in 2 click"],
        "fasi": [
            {
                "titolo": "FASE 1: Perché Google Sheets è il Database Preferito dalle PMI",
                "time": "⏱️ Minuti 00:00 - 04:00",
                "screen": "Webcam frontale di Stefano, poi mostra un foglio Google Sheets pulito.",
                "speech": "Bentornati nella dodicesima lezione della Masterclass AI Pro!<br><br>Oggi colleghiamo uno degli strumenti più usati e amati al mondo: <strong>Google Sheets</strong> (o Excel Online).<br><br>Perché i fogli di calcolo cloud sono così importanti? Perché sono il database più semplice e accessibile per un'azienda: tutto il team può guardarli, filtrarli, condividerli o esportarli con un click.<br><br>Oggi faremo in modo che ogni volta che l'AI elabora una richiesta, una nuova riga compaia nel foglio di calcolo in tempo reale, senza che nessuno debba inserire i dati a mano."
            },
            {
                "titolo": "FASE 2: Preparare il Foglio di Calcolo & Le Intestazioni",
                "time": "⏱️ Minuti 04:00 - 08:30",
                "screen": "1. Crea un foglio chiamato 'Registro_Clienti_AI'.<br>2. Inserisci le intestazioni in riga 1: Data, Nome, Email, Richiesta, Risposta_AI, Priorità.<br>3. Evidenzia la prima riga in azzurro per ordine visivo.",
                "speech": "Creiamo il nostro foglio su Google Drive e lo chiamiamo <code>Registro_Clienti_AI</code>.<br><br>Nella prima riga definiamo le colonne che vogliamo tracciare:<br>• <strong>Data</strong><br>• <strong>Nome Cliente</strong><br>• <strong>Email</strong><br>• <strong>Sintesi Richiesta</strong><br>• <strong>Risposta AI</strong><br>• <strong>Priorità</strong><br><br>Un'impostazione ordinata è la chiave per avere archivi aziendali perfetti."
            },
            {
                "titolo": "FASE 3: Aggiungere il Nodo Google Sheets su n8n & Autenticazione",
                "time": "⏱️ Minuti 08:30 - 12:30",
                "screen": "1. Su n8n aggiungi nodo 'Google Sheets'.<br>2. Scegli operazione 'Append Row' (Aggiungi Riga).<br>3. Connetti l'account Google con il pulsante 'Sign in with Google'.<br>4. Seleziona il foglio dal menu a tendina.",
                "speech": "Torniamo su n8n e aggiungiamo il nodo <strong>Google Sheets</strong> subito dopo il nodo AI.<br><br>Come operazione scegliamo <strong>'Append Row'</strong>, che significa semplicemente: 'Aggiungi una riga in fondo alla tabella'.<br><br>Ci autentichiamo con il nostro account Google in un click e selezioniamo il nostro foglio <code>Registro_Clienti_AI</code>."
            },
            {
                "titolo": "FASE 4: Mappare i Campi (Drag & Drop delle Colonne) & Test",
                "time": "⏱️ Minuti 12:30 - 16:30",
                "screen": "1. Mappa: Nome -> Campo nome, Risposta -> Testo AI generato, Data -> Data odierna.<br>2. Esegui il test.<br>3. Mostra la finestra affiancata con la nuova riga che compare magicamente su Google Sheets.",
                "speech": "Mappiamo le colonne trascinando i dati: il nome del cliente va nella colonna Nome, e il testo elaborato dall'AI va nella colonna Risposta_AI.<br><br>Facciamo il test di esecuzione e guardate il foglio Google a destra: <strong>voilà! La riga è comparsa all'istante!</strong><br><br>Nessun errore di battitura, nessun ritardo: ogni lead viene catalogato all'istante."
            },
            {
                "titolo": "FASE 5: Esercizio Pratico & Lancio Lezione 13 (Smistatore Email)",
                "time": "⏱️ Minuti 16:30 - 19:30",
                "screen": "Webcam frontale con riepilogo del flusso Webhook -> AI -> Sheets.",
                "speech": "Avete appena costruito il vostro primo database aziendale auto-compilante!<br><br><strong>Esercizio per oggi</strong>: create il vostro foglio Google, collegate il nodo n8n ed eseguite un inserimento di prova.<br><br>Nella <strong>Lezione 13</strong> collegheremo la casella di posta per creare lo <strong>Smistatore Email Aziendale</strong>: l'AI leggerà le email in arrivo, riconoscerà quelle urgenti e le separerà dallo spam!<br><br>A tra poco!"
            }
        ]
    },
    {
        "num": "13",
        "title": "SMISTATORE EMAIL AZIENDALE — FILTRO LEAD, URGENZE & SPAM",
        "subtitle": "Masterclass AI Pro (Percorso 20 Ore) • Guida alla Regia per Stefano",
        "badge": "Lezione 13 • Inbox Automation",
        "goal": "Configurare un trigger di ricezione email su n8n (Gmail/IMAP), analizzare il contenuto con l'AI per classificare il messaggio (Preventivo, Assistenza, Urgente, Spam) e instradarlo automaticamente.",
        "prep": ["Account Gmail/IMAP di test collegato", "Nodo Email Trigger su n8n", "Esempi di 3 email: una richiesta preventivo, un reclamo e una newsletter spam"],
        "fasi": [
            {
                "titolo": "FASE 1: Il Dramma della Casella di Posta Intasata",
                "time": "⏱️ Minuti 00:00 - 04:00",
                "screen": "Webcam frontale di Stefano, poi mostra una casella di posta con 50 email non lette.",
                "speech": "Bentornati nella tredicesima lezione della Masterclass AI Pro!<br><br>Ogni imprenditore e professionista passa in media tra 1 e 2 ore al giorno a fare una cosa noiosissima: aprire la posta, cancellare la pubblicità, cercare di capire quali email sono urgenti e inoltrare le richieste ai colleghi giusti.<br><br>Oggi creiamo lo <strong>Smistatore Email Intelligente</strong>: un assistente AI che legge ogni email in arrivo in tempo reale, capisce l'intento del mittente, assegna un'etichetta (es. Preventivo, Assistenza o Spam) e ci avvisa solo se c'è un'urgenza reale."
            },
            {
                "titolo": "FASE 2: Il Nodo Gmail / Email Trigger su n8n",
                "time": "⏱️ Minuti 04:00 - 08:30",
                "screen": "1. Inserisci il nodo 'Gmail Trigger' o 'Email Read (IMAP)'.<br>2. Imposta l'evento 'On New Email Received'.<br>3. Mostra i campi estratti (Mittente, Oggetto, Corpo del testo).",
                "speech": "Su n8n inseriamo il nodo <strong>Gmail Trigger</strong> (o Email IMAP per le caselle aziendali aruba/pec).<br><br>Questo nodo controlla la posta per noi: non appena arriva un nuovo messaggio, estrae puliti il nome del mittente, l'oggetto e il testo dell'email.<br><br>Nessun codice: n8n gestisce tutta la connessione protetta via OAuth."
            },
            {
                "titolo": "FASE 3: Il Prompt di Classificazione con JSON",
                "time": "⏱️ Minuti 08:30 - 12:30",
                "screen": "1. Collega il nodo AI Gemini/OpenAI.<br>2. Prompt: 'Analizza questa email e restituisci un JSON con: categoria (Preventivo, Assistenza, Info, Spam), urgenza (1-5), sintesi (1 riga)'.<br>3. Mostra l'output strutturato.",
                "speech": "Colleghiamo il testo dell'email al nodo AI e gli diamo una direttiva precisa:<br><em>'Analizza l'email e categorizzala in: Preventivo, Assistenza, Info o Spam. Assegna un punteggio di urgenza da 1 a 5 e scrivi un riassunto in una sola riga'</em>.<br><br>Guardate l'output JSON: in 500 millisecondi l'AI ha capito se il cliente è arrabbiato, se vuole comprare o se è una semplice newsletter da ignorare."
            },
            {
                "titolo": "FASE 4: Il Nodo Switch (Instradamento Condizionale)",
                "time": "⏱️ Minuti 12:30 - 16:30",
                "screen": "1. Aggiungi il nodo 'Switch' su n8n.<br>2. Crea 3 rami: Se Preventivo -> Salva su Sheets; Se Urgente -> Invia Notifica; Se Spam -> Archivia.<br>3. Mostra il bivio visivo sul canvas.",
                "speech": "Ora usiamo il nodo più potente della logica aziendale: il nodo <strong>Switch (il Bivio)</strong>.<br><br>Se l'AI ha classificato l'email come 'Preventivo', il flusso prende il ramo 1 e salva il cliente su Google Sheets.<br>Se è 'Urgente', prende il ramo 2 e ci manda un avviso immediato.<br>Se è 'Spam', la archivia senza disturbarci.<br><br>Questo è il vero smistamento intelligente senza toccare la tastiera."
            },
            {
                "titolo": "FASE 5: Esercizio Pratico & Lancio Lezione 14 (Preventivatore PDF)",
                "time": "⏱️ Minuti 16:30 - 19:30",
                "screen": "Webcam frontale con riepilogo dello smistatore email.",
                "speech": "Avete appena eliminato ore di stress quotidiano dalla vostra casella di posta!<br><br><strong>Esercizio per oggi</strong>: create il vostro flusso di lettura email e testate la categorizzazione su 2 email diverse.<br><br>Nella <strong>Lezione 14</strong> faremo un capolavoro: costruiremo l'<strong>Assistente Preventivi Automatico</strong>, capace di leggere la richiesta del cliente, consultare il listino prezzi e generare una bozza di preventivo PDF pronta da inviare!<br><br>A tra poco!"
            }
        ]
    },
    {
        "num": "14",
        "title": "L'ASSISTENTE PREVENTIVI — DA RICHIESTA CLIENTE A BOZZA PDF",
        "subtitle": "Masterclass AI Pro (Percorso 20 Ore) • Guida alla Regia per Stefano",
        "badge": "Lezione 14 • Vendite & Preventivi",
        "goal": "Creare un flusso che riceve una richiesta di quotazione, incrocia i dati con un listino prezzi aziendale e genera automaticamente un documento PDF di proposta commerciale elegante.",
        "prep": ["Listino prezzi semplice in JSON o tabella", "Template HTML per il preventivo PDF", "Mostrare il PDF finale generato in 2 secondi"],
        "fasi": [
            {
                "titolo": "FASE 1: Il Collo di Bottiglia Commerciale nei Preventivi",
                "time": "⏱️ Minuti 00:00 - 04:00",
                "screen": "Webcam frontale di Stefano, poi mostra una richiesta di preventivo tipica arrivata da un cliente.",
                "speech": "Bentornati nella quattordicesima lezione della Masterclass AI Pro!<br><br>Nelle vendite esiste una regola aurea: <strong>chi risponde per primo con una proposta chiara e professionale vince l'80% delle trattative</strong>.<br><br>Spesso però i preventivi restano fermi sulla scrivania per giorni perché bisogna calcolare i prezzi, scrivere il testo e impaginare il documento.<br><br>Oggi costruiamo l'<strong>Assistente Preventivi Automatico</strong>: prende la richiesta del cliente, consulta il vostro listino prezzi ufficiale e genera una proposta commerciale in formato PDF pronta per la revisione in 3 secondi netti."
            },
            {
                "titolo": "FASE 2: Il Listino Prezzi Grounding (Nessun Errore sui Prezzi)",
                "time": "⏱️ Minuti 04:00 - 08:30",
                "screen": "Mostra il listino aziendale: Corso Base: 490€, Corso Pro: 990€, Bundle Completo: 1290€, Consulenza: 150€/ora.",
                "speech": "La prima regola per un preventivo è la sicurezza: l'AI non deve MAI inventare i prezzi.<br><br>Inseriamo nel prompt il nostro <strong>Listino Prezzi Ufficiale</strong> blindato: definiamo i pacchetti e le tariffe orarie.<br><br>Diciamo all'Agente: <em>'Calcola i totali e applica l'IVA al 22% solo in base a queste voci ufficiali'</em>.<br><br>In questo modo abbiamo la certezza matematica della correttezza economica del preventivo."
            },
            {
                "titolo": "FASE 3: Il Template Grafico HTML del Preventivo",
                "time": "⏱️ Minuti 08:30 - 12:30",
                "screen": "Mostra il template HTML con logo aziendale, tabella prezzi ordinata e totale con IVA.",
                "speech": "Per avere un preventivo che trasmetta autorevolezza e qualità, usiamo un <strong>Template HTML elegante</strong> con il logo della nostra azienda, i dati del cliente e la tabella dei servizi.<br><br>L'AI compila i segnaposto del template inserendo il nome del cliente, la data e le righe di calcolo con i totali corretti.<br><br>Il risultato è una grafica pulita, moderna e altamente professionale."
            },
            {
                "titolo": "FASE 4: Conversione in PDF & Salvataggio Automatico",
                "time": "⏱️ Minuti 12:30 - 16:30",
                "screen": "1. Aggiungi nodo di conversione HTML to PDF o visualizzazione browser.<br>2. Esegui il flusso completo.<br>3. Apri il PDF generato a schermo: perfetto, formattato e pronto.",
                "speech": "Facciamo partire il flusso: guardate cosa accade in 2 secondi!<br><br>La richiesta del cliente entra nel sistema, l'AI consulta il listino, popola il documento e genera il file <code>Preventivo_Mario_Rossi.pdf</code>.<br><br>Apriamo il PDF a schermo: intestazione impeccabile, voci di spesa chiare, totale calcolato al centesimo e firma aziendale.<br><br>Una velocità di risposta commerciale che lascia i vostri concorrenti a distanza siderale."
            },
            {
                "titolo": "FASE 5: Esercizio Pratico & Lancio Lezioni 15-16 (Il RAG)",
                "time": "⏱️ Minuti 16:30 - 19:30",
                "screen": "Webcam frontale con riepilogo dell'assistente preventivi.",
                "speech": "Avete creato uno strumento di vendita automatica formidabile!<br><br><strong>Esercizio per oggi</strong>: personalizzate il listino prezzi con i servizi della vostra azienda e generate il vostro primo preventivo di test.<br><br>Nelle <strong>Lezioni 15 e 16</strong> entriamo nel <strong>Pilastro 4</strong>: scopriremo il <strong>RAG (Retrieval-Augmented Generation)</strong>, la tecnologia che permette all'AI di studiare centinaia di pagine di PDF, manuali e contratti aziendali per rispondere senza mai allucinare!<br><br>A tra poco!"
            }
        ]
    },
    {
        "num": "15",
        "title": "RAG AZIENDALE (PARTE 1) — CARICARE DOCUMENTI & MANUALI INTERNI",
        "subtitle": "Masterclass AI Pro (Percorso 20 Ore) • Guida alla Regia per Stefano",
        "badge": "Lezione 15 • Conoscenza Aziendale",
        "goal": "Capire cos'è il RAG (dare una biblioteca all'AI), come caricare documenti lunghi (PDF, regolamenti, cataloghi tecnici) e preparare la base di conoscenza interna senza inviare dati sensibili all'esterno.",
        "prep": ["Documento PDF di esempio (es. Guida Aziendale o Catalogo Prodotti)", "Piattaforma con knowledge base o cartella documenti", "Spiegare la differenza tra memoria generale e memoria aziendale"],
        "fasi": [
            {
                "titolo": "FASE 1: Perché i Modelli AI non Conoscono i Tuoi Dati Interni",
                "time": "⏱️ Minuti 00:00 - 04:00",
                "screen": "Webcam frontale di Stefano, poi mostra una cartella con 10 PDF aziendali.",
                "speech": "Bentornati nella quindicesima lezione della Masterclass AI Pro!<br><br>Oggi entriamo nel <strong>Pilastro 4</strong> e parliamo della tecnologia più rivoluzionaria in assoluto per le aziende: il <strong>RAG (Retrieval-Augmented Generation)</strong>.<br><br>ChatGPT e Gemini conoscono tutto lo scibile umano su internet, ma non sanno nulla della vostra azienda: non conoscono i vostri listini speciali, le garanzie dei vostri prodotti, le procedure interne o i contratti dei vostri clienti.<br><br>Oggi impariamo come dare all'AI una <strong>biblioteca privata e sicura</strong> con tutti i vostri documenti, per farla diventare un'esperta assoluta della vostra azienda."
            },
            {
                "titolo": "FASE 2: La Metafora della Biblioteca — Come Funziona il RAG",
                "time": "⏱️ Minuti 04:00 - 08:30",
                "screen": "Grafica esplicativa: Domanda -> Il RAG cerca nei PDF aziendali -> Estrae la pagina esatta -> L'AI formula la risposta.",
                "speech": "Come funziona il RAG? Pensate a uno studente che deve sostenere un esame.<br><br>Se gli fate una domanda a memoria su un dettaglio microscopico, potrebbe sbagliare o tirare a indovinare.<br><br>Ma se l'esame è <strong>a libro aperto</strong>, lo studente apre il manuale aziendale alla pagina esatta, legge la clausola contrattuale e vi risponde con precisione millimetrica citando la fonte.<br><br>Questo è il RAG: prima cerca nei vostri PDF le 2 o 3 pagine rilevanti, e poi usa l'AI solo per spiegarvele in modo chiaro ed esatto."
            },
            {
                "titolo": "FASE 3: Caricare il Documento nella Knowledge Base",
                "time": "⏱️ Minuti 08:30 - 12:30",
                "screen": "1. Prendi un file PDF aziendale (es. 'Regolamento_Interno_Garanzie.pdf').<br>2. Trascinalo nella sezione Conoscenza / Knowledge Base.<br>3. Mostra l'indicizzazione dei paragrafi (Chunking).",
                "speech": "Carichiamo il nostro documento aziendale: trascino il file <code>Regolamento_Garanzie.pdf</code> nella nostra cartella di conoscenza.<br><br>Cosa sta facendo il sistema? Sta suddividendo il PDF in piccoli blocchetti logici chiamati <em>Chunks</em>.<br><br>Ogni paragrafo viene etichettato e memorizzato: in questo modo, quando faremo una domanda, il sistema saprà istantaneamente in quale pagina e riga si trova l'informazione cercata."
            },
            {
                "titolo": "FASE 4: Privacy & Sicurezza dei Documenti Aziendali",
                "time": "⏱️ Minuti 12:30 - 16:30",
                "screen": "Mostra lo schema di sicurezza: i documenti restano sul server privato e non vengono usati per riaddestrare modelli pubblici.",
                "speech": "Una domanda fondamentale che ogni imprenditore fa: <em>'I miei documenti riservati sono al sicuro?'</em>.<br><br>La risposta è sì: tramite le API aziendali e i sistemi RAG privati, i vostri documenti <strong>NON vengono mai utilizzati per addestrare modelli pubblici</strong>.<br><br>I dati restano al 100% di vostra proprietà esclusiva nel vostro spazio privato, conformi alle direttive europee GDPR e sulla privacy."
            },
            {
                "titolo": "FASE 5: Esercizio Pratico & Lancio Lezione 16 (Interrogazione con Fonti)",
                "time": "⏱️ Minuti 16:30 - 19:30",
                "screen": "Webcam frontale con riepilogo del documento caricato.",
                "speech": "Avete appena creato la memoria storica e documentale della vostra azienda!<br><br><strong>Esercizio per oggi</strong>: prendete un PDF reale (una brochure di prodotto o un regolamento) e caricatelo nella cartella di lavoro.<br><br>Nella <strong>Lezione 16</strong> faremo la magia finale: interrogheremo l'AI su clausole contrattuali complesse e vedremo come risponde <strong>senza allucinare e citando esattamente la pagina e il paragrafo di origine</strong>!<br><br>Ci vediamo alla Lezione 16!"
            }
        ]
    },
    {
        "num": "16",
        "title": "RAG AZIENDALE (PARTE 2) — INTERROGAZIONE CON FONTI & ZERO ALLUCINAZIONI",
        "subtitle": "Masterclass AI Pro (Percorso 20 Ore) • Guida alla Regia per Stefano",
        "badge": "Lezione 16 • Precisione Assoluta",
        "goal": "Interrogare l'assistente RAG su documenti complessi, verificare la precisione della risposta con citazione della fonte (es. [Fonte: Pag. 4, Art. 7]) e testare la risposta 'Dato non presente' per evitare allucinazioni.",
        "prep": ["Knowledge base con PDF caricato nella lezione 15", "Elenco di 3 domande specifiche e 1 domanda trabocchetto", "Mostrare le note a piè di pagina con le citazioni"],
        "fasi": [
            {
                "titolo": "FASE 1: L'Incubo delle Allucinazioni e la Cura Definitiva",
                "time": "⏱️ Minuti 00:00 - 04:00",
                "screen": "Webcam frontale di Stefano, poi mostra il documento PDF aperto accanto alla chat.",
                "speech": "Bentornati nella sedicesima lezione della Masterclass AI Pro!<br><br>Nella scorsa lezione abbiamo caricato il nostro manuale aziendale. Oggi vediamo come interrogare l'AI per ottenere <strong>risposte certe al 100%</strong>.<br><br>In azienda un'allucinazione dell'AI può costare cara: pensate se un cliente chiede 'Qual è il tempo di reso?' e l'AI inventa '60 giorni' quando la vostra policy è di 14 giorni!<br><br>Oggi vedremo come il RAG elimina questo rischio obbligando l'AI a citare sempre la pagina e l'articolo esatto da cui ha estratto la risposta."
            },
            {
                "titolo": "FASE 2: La Prima Domanda con Citazione della Fonte",
                "time": "⏱️ Minuti 04:00 - 08:30",
                "screen": "1. Digita nella chat: 'Quali sono i requisiti per richiedere la sostituzione in garanzia del prodotto X?'.<br>2. Mostra la risposta immediata con la citazione: '[Rif: Manuale_Garanzie.pdf, Pagina 3, Articolo 4.2]'.",
                "speech": "Facciamo la prima domanda: <em>'Quali sono i requisiti per la sostituzione in garanzia?'</em>.<br><br>Guardate la risposta: l'AI non solo riassume i 3 requisiti in modo chiarissimo, ma in fondo aggiunge: <strong>[Fonte: Manuale_Garanzie.pdf, Pagina 3, Articolo 4.2]</strong>.<br><br>Questo significa che qualsiasi dipendente o cliente può verificare all'istante l'autenticità dell'informazione sulla documentazione ufficiale."
            },
            {
                "titolo": "FASE 3: Il Test Trabocchetto — La Risposta 'Non Presente'",
                "time": "⏱️ Minuti 08:30 - 12:30",
                "screen": "1. Fai una domanda su una condizione inesistente (es. 'Coprite i danni da allagamento accidentale?').<br>2. Mostra l'AI che risponde: 'Informazione non presente nella documentazione fornita. Ti invito a contattare la direzione commerciale'.",
                "speech": "Mettiamo alla prova il sistema con una domanda trabocchetto su una clausola non prevista nel regolamento.<br><br>Guardate: invece di inventare una risposta, l'AI dice con assoluta onestà: <em>'Questa informazione non è presente nel documento caricato. Ti consiglio di contattare il reparto commerciale'</em>.<br><br>Questo è il livello di affidabilità professionale che trasforma l'AI in uno strumento pronto per la produzione aziendale."
            },
            {
                "titolo": "FASE 4: Ricerca Semantica su Più Documenti Contemporaneamente",
                "time": "⏱️ Minuti 12:30 - 16:30",
                "screen": "Mostra l'Agente che incrocia i dati tra 2 PDF diversi (Catalogo Prodotti + Listino Prezzi) e genera una sintesi unificata.",
                "speech": "La vera potenza del RAG si vede quando incrociamo più file contemporaneamente.<br><br>Possiamo avere nella cartella il Catalogo Tecnico, il Listino Prezzi e il Manuale di Istruzioni: con una sola domanda, l'Agente legge le specifiche tecniche dal catalogo e i prezzi dal listino, unendoli in una risposta perfetta.<br><br>Un lavoro di ricerca che a un umano richiederebbe 20 minuti di consultazione tra faldoni diversi."
            },
            {
                "titolo": "FASE 5: Esercizio Pratico & Lancio Lezione 17 (Bot Telegram)",
                "time": "⏱️ Minuti 16:30 - 19:30",
                "screen": "Webcam frontale con anteprima dell'app Telegram su smartphone.",
                "speech": "Avete appena dominato la tecnologia RAG: la più richiesta e pagata oggi sul mercato della consulenza AI!<br><br><strong>Esercizio per oggi</strong>: fate 3 domande specifiche e 1 domanda trabocchetto al vostro documento e verificate le citazioni.<br><br>Nella <strong>Lezione 17</strong> collegheremo tutto questo al vostro smartphone creando un <strong>Bot Telegram con pulsanti interattivi APPROVA / RIFIUTA</strong> per dare la conferma finale alle azioni dell'AI direttamente dal cellulare!<br><br>Ci vediamo alla Lezione 17!"
            }
        ]
    },
    {
        "num": "17",
        "title": "HUMAN-IN-THE-LOOP SU TELEGRAM — CONTROLLO UMANO CON TASTI OK/NO",
        "subtitle": "Masterclass AI Pro (Percorso 20 Ore) • Guida alla Regia per Stefano",
        "badge": "Lezione 17 • Mobile Control",
        "goal": "Creare un bot Telegram con BotFather, collegarlo a n8n e ricevere notifiche interattive su smartphone con tasti [🟢 APPROVA] e [🔴 RIFIUTA] prima che l'AI invii email o salvi dati sensibili.",
        "prep": ["Smartphone con app Telegram aperta", "Bot creato con @BotFather in 1 minuto", "Workflow n8n con nodo Telegram 'Send Inline Keyboard'"],
        "fasi": [
            {
                "titolo": "FASE 1: L'AI Autonoma ma con il Telecomando in Mano all'Imprenditore",
                "time": "⏱️ Minuti 00:00 - 04:00",
                "screen": "Webcam frontale di Stefano, poi mostra lo smartphone con l'app Telegram.",
                "speech": "Bentornati nella diciassettesima lezione della Masterclass AI Pro!<br><br>Molti imprenditori hanno una paura legittima: <em>'Cosa succede se l'AI invia un'email sbagliata a un cliente importante mentre sono fuori ufficio?'</em>.<br><br>La risposta dei migliori ingegneri al mondo si chiama <strong>Human-in-the-Loop (L'Umano al Comando)</strong>.<br><br>Oggi creiamo un sistema geniale: l'AI fa tutto il lavoro pesante di notte o mentre siete in viaggio, ma prima di spedire l'email vi manda un messaggio su <strong>Telegram</strong> con il riassunto e due pulsanti: <strong>[🟢 APPROVA]</strong> o <strong>[🔴 RIFIUTA]</strong>. Con un tocco del pollice dal cellulare decidete voi se dare il via libera!"
            },
            {
                "titolo": "FASE 2: Creare il Bot Telegram con @BotFather in 60 Secondi",
                "time": "⏱️ Minuti 04:00 - 08:30",
                "screen": "1. Apri Telegram e cerca '@BotFather'.<br>2. Invia '/newbot'.<br>3. Dai il nome: 'Assistente Aziendale Aiutiamoci'.<br>4. Copia il Bot Token segreto fornito da BotFather.",
                "speech": "Creiamo il nostro bot ufficiale in un minuto: apriamo Telegram e cerchiamo <strong>@BotFather</strong>, il bot ufficiale di Telegram per creare assistenti.<br><br>Inviamo il comando <code>/newbot</code>, scegliamo un nome e Telegram ci restituisce all'istante il nostro <strong>Bot Token</strong>.<br><br>Copiamo questo token: è la chiave che permette a n8n di inviarci messaggi e pulsanti sul nostro telefono."
            },
            {
                "titolo": "FASE 3: Configurare il Nodo Telegram con Pulsanti (Inline Keyboard)",
                "time": "⏱️ Minuti 08:30 - 12:30",
                "screen": "1. Su n8n inserisci il nodo 'Telegram'.<br>2. Inserisci il Bot Token.<br>3. Imposta il messaggio con la bozza preparata dall'AI.<br>4. Aggiungi due pulsanti: 'APPROVA' (callback_data: 'ok') e 'RIFIUTA' (callback_data: 'no').",
                "speech": "Andiamo su n8n e inseriamo il nodo <strong>Telegram</strong>.<br><br>Incolliamo il token e configuriamo il messaggio. Sotto al testo aggiungiamo la tastiera interattiva:<br>• Tasto Verde: <strong>[🟢 APPROVA E INVIA]</strong><br>• Tasto Rosso: <strong>[🔴 MODIFICA / RIFIUTA]</strong><br><br>In questo modo l'automazione si mette in pausa e aspetta il vostro tocco dallo smartphone."
            },
            {
                "titolo": "FASE 4: La Prova dal Vivo sullo Smartphone",
                "time": "⏱️ Minuti 12:30 - 16:30",
                "screen": "1. Fai scattare il flusso.<br>2. Mostra la notifica che arriva in diretta su Telegram sullo smartphone.<br>3. Premi il tasto 'APPROVA' sullo schermo del telefono.<br>4. Mostra n8n che riceve l'ok e completa l'invio dell'email.",
                "speech": "Guardate la magia dal vivo: faccio partire il test.<br><br><strong>Ding!</strong> Arriva la notifica istantanea su Telegram con la bozza del preventivo preparata dall'AI.<br><br>Leggo il testo comodamente dal telefono e premo <strong>[APPROVA]</strong>: all'istante n8n riceve il consenso, genera il PDF e spedisce l'email al cliente.<br><br>Controllo totale, zero rischi e massima velocità operativa ovunque vi troviate."
            },
            {
                "titolo": "FASE 5: Esercizio Pratico & Lancio Lezione 18 (Trascrizioni Audio)",
                "time": "⏱️ Minuti 16:30 - 19:30",
                "screen": "Webcam frontale con smartphone in mano.",
                "speech": "Avete appena trasformato il vostro smartphone nel telecomando di controllo della vostra azienda automatizzata!<br><br><strong>Esercizio per oggi</strong>: create il vostro bot con BotFather e inviatevi un messaggio di test con i due pulsanti interattivi.<br><br>Nella <strong>Lezione 18</strong> scopriremo come gestire i <strong>vocali di WhatsApp e le registrazioni di riunioni</strong>: l'AI le ascolterà per noi e creerà verbali ordinati con le to-do list assegnate ai collaboratori!<br><br>A tra poco!"
            }
        ]
    },
    {
        "num": "18",
        "title": "TRASCRIZIONE AUDIO & VERBALI DI RIUNIONE — WHISPER & VOCALI",
        "subtitle": "Masterclass AI Pro (Percorso 20 Ore) • Guida alla Regia per Stefano",
        "badge": "Lezione 18 • Audio Intelligence",
        "goal": "Utilizzare il modello Whisper di OpenAI o Groq per trascrivere registrazioni audio (vocali WhatsApp, riunioni Zoom/Meet), ripulire intercalari e generare un verbale esecutivo con le to-do list dei collaboratori.",
        "prep": ["File audio di prova di 1-2 minuti (nota vocale di lavoro)", "Nodo OpenAI Whisper su n8n o Antigravity", "Mostrare la trasformazione da audio parlato a to-do list numerata"],
        "fasi": [
            {
                "titolo": "FASE 1: La Maledizione dei Messaggi Vocali e delle Riunioni Lunghe",
                "time": "⏱️ Minuti 00:00 - 04:00",
                "screen": "Webcam frontale di Stefano, poi mostra una cartella con registrazioni vocali.",
                "speech": "Bentornati nella diciottesima lezione della Masterclass AI Pro!<br><br>Quante volte vi capita di ricevere messaggi vocali su WhatsApp di 4 o 5 minuti con colleghi o clienti che parlano a ruota libera, oppure di uscire da una riunione di un'ora senza un verbale scritto con chi deve fare cosa?<br><br>Riascoltare i vocali e prendere appunti fa perdere tempo prezioso. Oggi utilizziamo uno dei modelli più potenti al mondo: <strong>OpenAI Whisper</strong>.<br><br>Gli daremo in pasto un file audio vocale: il sistema lo trascriverà con precisione chirurgica e l'AI estrarrà le decisioni prese e la lista delle azioni da compiere."
            },
            {
                "titolo": "FASE 2: Il Modello Whisper — Trascrizione Audio Perfetta in Italiano",
                "time": "⏱️ Minuti 04:00 - 08:30",
                "screen": "Mostra il funzionamento di Whisper: riceve file audio (.mp3, .m4a, .wav) ed emette il testo trascritto con punteggiatura perfetta.",
                "speech": "Whisper è il modello di riconoscimento vocale più avanzato al mondo: comprende l'italiano alla perfezione, ignora i rumori di fondo e riconosce la punteggiatura corretta.<br><br>Non solo trascrive le parole esatte, ma è in grado di gestire termini tecnici, nomi propri e numeri di telefono dettati a voce.<br><br>Vediamo come inserire il nodo di trascrizione nel nostro flusso di lavoro."
            },
            {
                "titolo": "FASE 3: Il Prompt di Sintesi Esecutiva & To-Do List",
                "time": "⏱️ Minuti 08:30 - 12:30",
                "screen": "1. Collega l'audio trascritto al nodo AI.<br>2. Prompt: 'Estrai da questa riunione: 1) Sintesi in 3 punti; 2) Decisioni prese; 3) Tabella To-Do List con Responsabile e Scadenza'.",
                "speech": "Una volta ottenuto il testo parlato grezzo, lo passiamo al nostro Agente AI con una direttiva esecutiva:<br><em>'Elimina gli intercalari (eh, cioè, allora) e crea un verbale strutturato con: Sintesi delle decisioni e Tabella con le mansioni assegnate a ciascun responsabile'</em>.<br><br>In questo modo trasformiamo un discorso informale e disordinato in un piano d'azione operativo chiaro."
            },
            {
                "titolo": "FASE 4: La Prova dal Vivo — Da Audio a Verbale Formattato in 4 Secondi",
                "time": "⏱️ Minuti 12:30 - 16:30",
                "screen": "1. Carica una nota vocale di test di 60 secondi.<br>2. Esegui il flusso.<br>3. Mostra a schermo il verbale generato: elenco puntato e tabella con nomi e compiti.",
                "speech": "Facciamo la prova dal vivo: carico una registrazione audio in cui parlo di un nuovo progetto commerciale.<br><br>Avvio l'elaborazione... e guardate il risultato a schermo!<br><br>In 4 secondi abbiamo il documento <code>Verbale_Riunione.md</code>: chi deve contattare il fornitore, chi prepara la brochure e la data di scadenza concordata.<br><br>Un documento pronto da condividere sul gruppo aziendale per allineare tutto il team."
            },
            {
                "titolo": "FASE 5: Esercizio Pratico & Lancio Lezione 19 (Sicurezza & Errori)",
                "time": "⏱️ Minuti 16:30 - 19:30",
                "screen": "Webcam frontale con riepilogo del sistema di trascrizione.",
                "speech": "Avete aggiunto un superpotere straordinario alla vostra produttività quotidiana!<br><br><strong>Esercizio per oggi</strong>: registrate un breve vocale di 1 minuto con il cellulare e fatelo trascrivere e sintetizzare dal flusso.<br><br>Nella <strong>Lezione 19</strong> affronteremo la robustezza del sistema: <strong>Sicurezza, Gestione Errori e Fallback</strong>, per garantire che le vostre automazioni non si blocchino mai anche se un server esterno va offline!<br><br>A tra poco!"
            }
        ]
    },
    {
        "num": "19",
        "title": "SICUREZZA, PRIVACY DATI & GESTIONE ERRORI — AUTOMAZIONI A PROVA DI BOMBA",
        "subtitle": "Masterclass AI Pro (Percorso 20 Ore) • Guida alla Regia per Stefano",
        "badge": "Lezione 19 • Robustezza & Sicurezza",
        "goal": "Impostare nodi di gestione errore (Error Trigger / Retry / Fallback), proteggere chiavi e password con variabili d'ambiente (.env) e garantire che il sistema avvisi il team in caso di problemi tecnici senza perdere dati.",
        "prep": ["Workflow con ramo di Error Handling (Se fallisce -> Invia avviso)", "Dimostrazione di cosa succede quando un'API va offline", "Tono rassicurante e professionale sulla resilienza"],
        "fasi": [
            {
                "titolo": "FASE 1: Cosa Succede Quando Internet o un Server Fallisce?",
                "time": "⏱️ Minuti 00:00 - 04:00",
                "screen": "Webcam frontale di Stefano, poi mostra una simulazione di errore (API non raggiungibile).",
                "speech": "Bentornati nella diciannovesima lezione della Masterclass AI Pro!<br><br>Nel mondo reale della tecnologia, le cose a volte possono fallire: un server esterno può essere momentaneamente sovraccarico, una connessione internet può avere un micro-buco o un cliente può inserire un'email non valida.<br><br>I dilettanti creano sistemi che alla prima anomalia si bloccano e perdono i dati.<br><br>I professionisti costruiscono <strong>automazioni a prova di bomba</strong> con sistemi di <strong>Error Handling e Retry automatico</strong>. Oggi vediamo come blindare i nostri flussi per garantire continuità totale al vostro business."
            },
            {
                "titolo": "FASE 2: I Nodi di Riprova Automatica (Retry on Fail)",
                "time": "⏱️ Minuti 04:00 - 08:30",
                "screen": "Mostra nelle impostazioni del nodo n8n: 'Retry on Fail: 3 tentativi' con intervallo di 2 secondi.",
                "speech": "La prima regola di difesa è il <strong>Retry automatico</strong>: all'interno di ogni nodo su n8n possiamo attivare l'opzione <em>'Retry on Fail'</em>.<br><br>Se l'API di Google o OpenAI risponde con un momentaneo ritardo, n8n non va in crash: aspetta 2 secondi e riprova automaticamente fino a 3 volte.<br><br>Il 95% dei piccoli problemi di rete si risolve all'istante senza che nessuno se ne accorga."
            },
            {
                "titolo": "FASE 3: Il Flusso di Fallback & Notifica di Emergenza su Telegram",
                "time": "⏱️ Minuti 08:30 - 12:30",
                "screen": "1. Configura il 'Workflow Settings -> Error Trigger'.<br>2. Crea un workflow di emergenza che invia un messaggio su Telegram: '⚠️ Attenzione: il flusso preventivi ha riscontrato un errore nel nodo X'.",
                "speech": "E se l'errore persiste? Interviene il nostro <strong>Workflow di Emergenza (Error Trigger)</strong>.<br><br>Se un flusso fallisce, n8n scatta immediatamente su un binario secondario e invia un avviso su Telegram al titolare o al responsabile tecnico, specificando l'errore esatto e salvando i dati del cliente in una cartella di recupero.<br><br>In questo modo nessun dato va mai perso e avete sempre il controllo assoluto dello stato di salute dei vostri sistemi."
            },
            {
                "titolo": "FASE 4: Protezione Segreti Aziendali (Variabili d'Ambiente .env)",
                "time": "⏱️ Minuti 12:30 - 16:30",
                "screen": "Mostra la gestione delle credenziali cifrate su n8n e l'uso delle variabili protette.",
                "speech": "Parliamo di sicurezza delle chiavi: le vostre API Key e password non devono mai essere scritte in chiaro nei documenti pubblici.<br><br>Su n8n e Antigravity le credenziali vengono custodite in un caveau crittografato protetto da password principale.<br><br>In questo modo, anche se condividete lo schermo o collaborate con un collega, i vostri segreti aziendali restano invisibili e inviolabili."
            },
            {
                "titolo": "FASE 5: Sintesi & Lancio del Gran Finale (Lezione 20: Esame & Certificazione)",
                "time": "⏱️ Minuti 16:30 - 19:30",
                "screen": "Webcam frontale con grafica celebrativa del percorso completato al 95%.",
                "speech": "I vostri sistemi ora non sono solo intelligenti, ma solidi, sicuri e a prova di imprevisto!<br><br>Siamo arrivati alla vigilia del gran finale.<br><br>Nella <strong>Lezione 20</strong> celebreremo il <strong>Checkpoint 3 Finale</strong>: metteremo in produzione l'ecosistema completo attivo h24, faremo il test di certificazione e rilasceremo l'<strong>Attestato Ufficiale della Masterclass AI Pro</strong>!<br><br>Preparatevi per il traguardo finale!"
            }
        ]
    },
    {
        "num": "20",
        "title": "CHECKPOINT 3 FINALE — DEPLOY IN PRODUZIONE & ATTESTATO UFFICIALE",
        "subtitle": "Masterclass AI Pro (Percorso 20 Ore) • Guida alla Regia per Stefano",
        "badge": "🎓 Checkpoint 3 • Traguardo Finale",
        "goal": "Mettere in produzione l'intero ecosistema aziendale (Agente Locale + n8n Cloud + Sheets + Telegram), eseguire il test di certificazione finale e rilasciare l'Attestato Ufficiale di Competenza della Masterclass AI Pro.",
        "prep": ["Ecosistema completo attivo e collegato", "Modello grafico dell'Attestato Ufficiale con nome studente", "Tono trionfale, celebrativo ed emozionante per il completamento delle 20 ore!"],
        "fasi": [
            {
                "titolo": "FASE 1: Celebrazione del Percorso Completo (20 Ore Formative Conquistate!)",
                "time": "⏱️ Minuti 00:00 - 04:00",
                "screen": "Webcam frontale di Stefano con grafica trionfale e logo ufficiale Aiutiamoci.",
                "speech": "Congratulazioni e benvenuti alla ventesima e ultima lezione della Masterclass AI Pro!<br><br>Oggi tagliamo un traguardo straordinario: avete completato un percorso formativo di <strong>20 ore di altissimo livello</strong> sull'Intelligenza Artificiale applicata e le automazioni aziendali.<br><br>Non siete più spettatori dell'innovazione tecnologica: oggi siete professionisti capaci di progettare, costruire e governare una vera squadra di Agenti ed automazioni autonome.<br><br>In questa lezione finale facciamo il collaudo generale del sistema in produzione e celebriamo il rilascio del vostro <strong>Attestato Ufficiale</strong>."
            },
            {
                "titolo": "FASE 2: Il Collaudo Generale dell'Ecosistema in Produzione",
                "time": "⏱️ Minuti 04:00 - 08:30",
                "screen": "Mostra l'intero flusso a schermo: 1. Candidatura/Email -> 2. AI Gemini/GPT -> 3. Google Sheets -> 4. Telegram con tasti Approva/Rifiuta -> 5. Generazione PDF.",
                "speech": "Guardate la meraviglia dell'architettura che abbiamo costruito insieme passo dopo passo:<br><br>1. Un cliente invia una richiesta dal sito o via email.<br>2. Il <strong>Webhook</strong> cattura l'evento in tempo reale.<br>3. L'<strong>AI</strong> consulta il listino prezzi e redige la proposta commerciale.<br>4. I dati vengono salvati automaticamente su <strong>Google Sheets</strong>.<br>5. Ricevete la notifica su <strong>Telegram</strong> e con un tocco date l'approvazione finale al PDF.<br><br>Tutto questo lavora per voi in background, 24 ore su 24, 365 giorni all'anno."
            },
            {
                "titolo": "FASE 3: L'Attivazione H24 in Produzione (Active Toggle)",
                "time": "⏱️ Minuti 08:30 - 12:30",
                "screen": "1. Su n8n sposta l'interruttore in alto a destra su 'Active' (Verde).<br>2. Mostra lo stato 'Workflow is active and running in background'.",
                "speech": "Facciamo il gesto definitivo: andiamo su n8n e spostiamo l'interruttore in alto a destra su <strong>ACTIVE (Verde)</strong>.<br><br>Da questo istante l'automazione è ufficialmente <strong>in produzione</strong>.<br><br>Potete spegnere il computer, andare a dormire o dedicarvi ai vostri clienti: il vostro ufficio digitale continuerà a rispondere, smistare ed elaborare senza sosta."
            },
            {
                "titolo": "FASE 4: Esame Finale & Rilascio dell'Attestato Ufficiale",
                "time": "⏱️ Minuti 12:30 - 16:30",
                "screen": "Mostra l'Attestato Ufficiale di Competenza della Masterclass AI Pro con badge oro e codice di verifica univoco.",
                "speech": "Ecco il riconoscimento formale del vostro impegno: l'<strong>Attestato Ufficiale di Competenza della Masterclass AI Pro</strong> rilasciato da Aiutiamoci.cloud.<br><br>Questo certificato attesta che possedete le competenze pratiche per implementare Agenti AI, gestire API, creare flussi n8n e proteggere i dati aziendali.<br><br>Un valore aggiunto enorme per il vostro curriculum, per la vostra azienda e per posizionarvi come leader nella trasformazione digitale del vostro settore."
            },
            {
                "titolo": "FASE 5: Saluto Finale, Community Permanente & Prossimi Passi",
                "time": "⏱️ Minuti 16:30 - 20:00",
                "screen": "Webcam frontale con link alla Community Telegram permanente e ringraziamenti finali.",
                "speech": "Questo non è un punto di arrivo, ma l'inizio della vostra nuova era lavorativa.<br><br>Il nostro supporto non finisce qui: la nostra <strong>Community Telegram riservata</strong> e il nostro <strong>Tutor AI h24</strong> rimangono a vostra disposizione permanente per confrontarvi, risolvere dubbi e continuare a crescere insieme durante le dirette del giovedì.<br><br>A nome mio, di Marco e di tutto il team di <strong>Aiutiamoci.cloud</strong>, grazie di cuore per la fiducia e per aver intrapreso questo viaggio con noi.<br><br>Buon lavoro con i vostri Agenti AI e ci vediamo nella community!"
            }
        ]
    }
]

def generate_html_11_20():
    for item in LEZIONI_DATA_11_20:
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
    generate_html_11_20()
