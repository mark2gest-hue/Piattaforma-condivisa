// Database di Conoscenza Dettagliato dei 20 Moduli AI Start
export const LESSON_SUMMARIES: Record<number, { title: string; summary: string; takeaways: string[]; exercise: string }> = {
  1: {
    title: '1. Benvenuti nel Futuro',
    summary: 'Introduzione alla rivoluzione dell\'Intelligenza Artificiale Generativa: perché i modelli linguistici (LLM) stanno trasformando ogni settore lavorativo e come passare da spettatore a utilizzatore consapevole.',
    takeaways: [
      'L\'IA non sostituisce le persone, ma chi usa l\'IA sostituirà chi non la usa.',
      'Differenza tra software tradizionale (regole fisse) e IA generativa (comprensione probabilistica del contesto).',
      'Approccio mentale corretto: considerare l\'IA come un collaboratore/stagista instancabile.'
    ],
    exercise: 'Fai una lista di 3 attività ripetitive che svolgi ogni settimana e che vorresti delegare all\'IA.'
  },
  2: {
    title: '2. Breve Storia dell\'Evoluzione',
    summary: 'Come siamo arrivati ai Large Language Models moderni: dai primi algoritmi di machine learning alle architetture Transformer (2017) che hanno reso possibile ChatGPT, Claude e Gemini.',
    takeaways: [
      'Il meccanismo di "Self-Attention": come i modelli pesano l\'importanza di ogni singola parola.',
      'La scalabilità computazionale e i dataset di addestramento su scala globale.',
      'Perché oggi i modelli sono in grado di comprendere sfumature, tono e contesti complessi.'
    ],
    exercise: 'Chiedi a un modello IA di spiegarti un concetto difficile del tuo lavoro come se fossi un bambino di 10 anni.'
  },
  3: {
    title: '3. Sconfiggere il Foglio Bianco',
    summary: 'Strategie pratiche per sbloccare la creatività e iniziare subito a produrre: come usare l\'IA per fare brainstorming, strutturare scalette e superare l\'ansia da pagina bianca.',
    takeaways: [
      'Non iniziare mai da zero: chiedi 5 angolazioni diverse su un argomento prima di scrivere.',
      'Il "Reverse Prompting": chiedi all\'IA cosa le serve sapere per darti la risposta migliore.',
      'Sviluppo rapido di scalette (outline) strutturate prima della stesura.'
    ],
    exercise: 'Genera 10 idee di post o argomenti per il tuo settore partendo da una singola parola chiave.'
  },
  4: {
    title: '4. Il Linguaggio della Chiarezza',
    summary: 'La precisione comunicativa nel prompting: eliminare l\'ambiguità per ottenere risposte pertinenti, evitando input generici che portano a risposte banali.',
    takeaways: [
      'Evita prompt generici come "Scrivimi un articolo": definisci obiettivo, pubblico e tono.',
      'L\'importanza dei vincoli (es. "massimo 150 parole, diviso in 3 punti elenco").',
      'Fornire esempi pratici (Few-Shot Prompting) per guidare lo stile della risposta.'
    ],
    exercise: 'Prendi un prompt generico che hai usato in passato e riscrivilo aggiungendo pubblico di destinazione e vincoli chiari.'
  },
  5: {
    title: '5. La Formula Segreta RCCF',
    summary: 'Il framework cardine del corso per creare prompt perfetti al primo colpo: Ruolo, Contesto, Contenuto e Formato.',
    takeaways: [
      '**R - Ruolo**: Chi deve impersonare l\'IA (es. "Sei un copywriter senior").',
      '**C - Contesto**: La situazione di partenza, il cliente, l\'obiettivo e i limiti.',
      '**C - Contenuto**: L\'azione specifica richiesta (es. "Scrivi una sequenza di 3 email di follow-up").',
      '**F - Formato**: La struttura visiva di output (tabella, elenco puntato, markdown, JSON).'
    ],
    exercise: 'Costruisci un prompt completo seguendo lo schema RCCF per un compito del tuo lavoro quotidiano.'
  },
  6: {
    title: '6. Iterazione',
    summary: 'L\'arte di affinare i risultati attraverso il dialogo continuo: perché il primo output è solo una bozza e come guidare l\'IA verso la perfezione.',
    takeaways: [
      'Il prompting non è un comando "usa e getta", ma una conversazione cooperativa.',
      'Tecniche di correzione mirata: "Mantieni i punti 1 e 3, ma rendi il punto 2 più informale".',
      'Chiedere all\'IA di auto-valutarsi e trovare punti deboli nel testo generato.'
    ],
    exercise: 'Prendi un testo generato e fai 3 iterazioni successive cambiando tono, lunghezza e aggiungendo un\'obiezione comune.'
  },
  7: {
    title: '7. ChatGPT, Claude, Gemini, Perplexity',
    summary: 'Panoramica comparativa dei migliori modelli di IA generativa: punti di forza, peculiarità e quale strumento scegliere per ogni specifico lavoro.',
    takeaways: [
      '**Claude (Anthropic)**: Imbattibile per scrittura naturale, sfumature umane e contesti lunghi (200k token).',
      '**ChatGPT / GPT-4o (OpenAI)**: Versatile, ottimo con codice, logica e tool avanzati (DALL-E, Canvas).',
      '**Gemini (Google)**: Multimodale nativo, perfetto con video, audio e integrazione con l\'ecosistema Google.',
      '**Perplexity**: Il miglior motore di ricerca potenziato dall\'IA con citazione esatta delle fonti.'
    ],
    exercise: 'Fai la stessa domanda di ricerca su Perplexity e su Claude e confronta la qualità delle fonti e dello stile.'
  },
  8: {
    title: '8. Scrivere senza Sforzo',
    summary: 'Redazione rapida di email formali, preventivi, comunicazioni commerciali e post per i social network senza perdere ore davanti alla tastiera.',
    takeaways: [
      'Creare template di risposta rapida per gestire la casella di posta in un terzo del tempo.',
      'Adattamento del tono di voce (Tone of Voice) per target B2B vs consumer.',
      'Riformulazione di testi complessi o normativi in linguaggio semplice e persuasivo.'
    ],
    exercise: 'Trasforma una serie di appunti sparsi e veloci in un\'email commerciale formale pronta per l\'invio.'
  },
  9: {
    title: '9. Dipingere con le Parole',
    summary: 'I fondamenti della generazione di immagini e contenuti visivi con l\'IA: concetti di composizione, illuminazione, stile e atmosfera.',
    takeaways: [
      'Struttura del prompt visivo: Soggetto + Ambiente + Illuminazione + Stile/Fotocamera.',
      'Termini tecnici chiave per la resa fotorealistica (es. "85mm lens, golden hour, volumetric lighting").',
      'Evitare parole vaghe ("bello", "incredibile") e preferire dettagli descrittivi precisi.'
    ],
    exercise: 'Descrivi una scena fotografica dettagliata con soggetto, luce e atmosfera e provala su un generatore visivo.'
  },
  10: {
    title: '10. Anatomia di un Prompt Visivo',
    summary: 'Tecniche avanzate per creare visual ad alto impatto per presentazioni aziendali, banner social e materiali di marketing.',
    takeaways: [
      'Prompting negativo: come specificare cosa NON deve comparire nell\'immagine.',
      'Uniformità stilistica per brand identity e serie di slide coerenti.',
      'Integrazione di testo e composizioni pulite con spazio negativo per loghi.'
    ],
    exercise: 'Crea un prompt per un\'immagine di copertina aziendale con spazio a sinistra per inserire un titolo.'
  },
  11: {
    title: '11. Presentazioni in 5 Minuti',
    summary: 'Creare slide e pitch aziendali in tempi record: struttura narrativa, storytelling e impaginazione guidata dall\'IA.',
    takeaways: [
      'La regola delle 3 sezioni: Problema, Soluzione, Call to Action.',
      'Come esportare testi in formato compatibile con PowerPoint, Gamma o Canva.',
      'Sintesi visiva: trasformare blocchi di testo noiosi in concetti chiave memorabili.'
    ],
    exercise: 'Fatti generare la scaletta completa di 5 slide per presentare il tuo servizio o prodotto.'
  },
  12: {
    title: '12. Analisi Dati per Excel',
    summary: 'Dominare fogli di calcolo, formule complesse, macro e pulizia dati con l\'assistenza dell\'IA, anche senza essere programmatori.',
    takeaways: [
      'Generazione istantanea di formule complesse (CERCA.X, INDICE/CONFRONTA, formule matriciali).',
      'Analisi di trend e anomalie in tabelle numeriche incollate nella chat.',
      'Scrittura di script VBA / Google Apps Script per automatizzare compiti ripetitivi.'
    ],
    exercise: 'Incolla una piccola tabella di dati e chiedi all\'IA di scriverti la formula per trovare il valore massimo per categoria.'
  },
  13: {
    title: '13. L\'Agenda Intelligente',
    summary: 'Time management e produttività personale: come usare l\'IA come assistente esecutivo per organizzare priorità, scadenze e calendari.',
    takeaways: [
      'Metodo Time-Boxing e matrice di Eisenhower automatizzati con l\'IA.',
      'Pianificazione settimanale bilanciata in base ai picchi di concentrazione.',
      'Decomposizione di grandi progetti in micro-task giornalieri.'
    ],
    exercise: 'Incolla la tua lista di cose da fare di domani e chiedi all\'IA di organizzarla per blocchi di priorità oraria.'
  },
  14: {
    title: '14. Studiare e Imparare ELI5',
    summary: 'Apprendimento accelerato e metodo Feynman: come usare l\'IA per comprendere qualsiasi argomento complesso spiegato a qualsiasi livello di difficoltà.',
    takeaways: [
      'La tecnica ELI5 ("Explain Like I\'m 5"): analogie e metafore visive per assimilare nozioni difficili.',
      'Creazione di quiz interattivi e flashcard per testare la propria memorizzazione.',
      'Simulazione di dibattiti con l\'IA che fa da "avvocato del diavolo" per affinare le proprie argomentazioni.'
    ],
    exercise: 'Chiedi all\'IA di spiegarti il funzionamento della Blockchain o dei tassi d\'interesse con una metafora della vita reale.'
  },
  15: {
    title: '15. Allucinazioni: Quando l\'IA mente',
    summary: 'Riconoscere i limiti dei modelli probabilistici: perché l\'IA inventa informazioni (allucinazioni), come prevenirle e come verificare le fonti.',
    takeaways: [
      'I modelli generano parole probabili, non hanno un database di "verità assoluta" integrato.',
      'Prompt di contenimento: "Se non sei sicuro al 100%, rispondi esplicitamente che non lo sai".',
      'Grounding: fornire sempre all\'IA il testo o documento di riferimento su cui basare la risposta.'
    ],
    exercise: 'Fai una domanda complessa con un vincolo di verifica delle fonti e osserva come cambia la precisione della risposta.'
  },
  16: {
    title: '16. Privacy e Sicurezza',
    summary: 'Protezione dei dati personali e aziendali nell\'uso dell\'IA: GDPR, impostazioni di opt-out per il training e buone pratiche di conformità.',
    takeaways: [
      'Disattivazione del salvataggio cronologia/training nelle impostazioni di ChatGPT e Claude.',
      'Anonimizzazione dei dati sensibili prima di incollarli (nomi clienti, IBAN, credenziali).',
      'Differenza tra API aziendali (zero-retention) e interfacce web gratuite.'
    ],
    exercise: 'Controlla le impostazioni di privacy del tuo account IA principale e verifica che il training sui tuoi dati sia disattivato.'
  },
  17: {
    title: '17. Il Lavoro che Cambia',
    summary: 'L\'impatto dell\'automazione sul mercato del lavoro: come riposizionarsi come professionista potenziato dall\'IA e creare nuovo valore.',
    takeaways: [
      'Le competenze umane insostituibili: pensiero critico, empatia, strategia e validazione etica.',
      'Il passaggio da "esecutore manuale" a "direttore d\'orchestra" dei sistemi IA.',
      'Come valorizzare l\'utilizzo dell\'IA nelle proprie offerte e preventivi per clienti.'
    ],
    exercise: 'Scrivi una breve frase che descrive come il tuo ruolo professionale diventa più rapido e prezioso grazie all\'IA.'
  },
  18: {
    title: '18. Creare il proprio Workflow',
    summary: 'Costruire flussi di lavoro integrati e ripetibili: combinare prompt, scorciatoie e strumenti per automatizzare le tue giornate.',
    takeaways: [
      'Creazione di una libreria personale di prompt (Prompt Library) per i compiti frequenti.',
      'Personal Custom Instructions (Istruzioni Personalizzate) per evitare di ripetere chi sei ad ogni chat.',
      'Integrazione tra chat, documenti condivisi e bacheca attività.'
    ],
    exercise: 'Imposta le tue Custom Instructions sul tuo account IA specificando la tua professione e lo stile di risposta preferito.'
  },
  19: {
    title: '19. La Tua Nuova Superpotenza',
    summary: 'Integrazione avanzata e visione d\'insieme: come l\'IA moltiplica per 10 la tua capacità produttiva e ti permette di realizzare progetti prima impensabili.',
    takeaways: [
      'Passaggio a progetti complessi: creazione di manuali, corsi, analisi di mercato in ore anziché settimane.',
      'Fiducia operativa: come validare rapidamente e spedire i propri progetti sul mercato.',
      'L\'approccio del continuo aggiornamento in un ecosistema in costante evoluzione.'
    ],
    exercise: 'Pianifica un progetto che prima ritenevi troppo lungo o difficile e spezzettalo in 4 fasi assistite dall\'IA.'
  },
  20: {
    title: '20. Riepilogo e Prossimi Passi',
    summary: 'Conclusioni del percorso AI Start, checklist di consolidamento delle competenze e presentazione delle opportunità avanzate con agenti e automazioni.',
    takeaways: [
      'Hai acquisito le fondamenta per padroneggiare qualsiasi strumento di IA generativa.',
      'Pratica quotidiana costante: l\'abitudine batte la teoria.',
      'Il passo successivo: il percorso **AI Pro** per costruire Agenti Autonomi, Webhook e flussi di lavoro automatici senza codice!'
    ],
    exercise: 'Scarica il tuo Attestato Ufficiale di Completamento e condividi il tuo traguardo!'
  }
}

export interface CheckpointTestQuestion {
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

export interface CheckpointTest {
  id: 'entry' | 'midterm' | 'final'
  title: string
  subtitle: string
  requiredLessonId: number
  passThresholdPercent: number
  questions: CheckpointTestQuestion[]
}

export const CHECKPOINT_TESTS: Record<'entry' | 'midterm' | 'final', CheckpointTest> = {
  entry: {
    id: 'entry',
    title: '🏁 Test d\'Ingresso — Alfabetizzazione & Competenze Base',
    subtitle: 'Valutazione iniziale obbligatoria per consolidare i concetti cardine e proseguire nel corso.',
    requiredLessonId: 1,
    passThresholdPercent: 70,
    questions: [
      {
        question: 'Qual è la differenza fondamentale tra un motore di ricerca tradizionale e un modello di IA generativa (LLM)?',
        options: [
          'Il motore di ricerca indicizza pagine web esistenti, mentre l\'LLM comprende il contesto e genera risposte inedite in linguaggio naturale.',
          'L\'IA generativa cerca solo file PDF sul computer.',
          'I motori di ricerca non utilizzano Internet, l\'IA sì.',
          'Non c\'è alcuna differenza tecnica o funzionale.'
        ],
        correctIndex: 0,
        explanation: 'I motori di ricerca tradizionali restituiscono link esistenti; i modelli generativi elaborano e creano contenuti contestualizzati su misura.'
      },
      {
        question: 'Qual è l\'approccio mentale raccomandato per interagire efficacemente con l\'IA generativa?',
        options: [
          'Considerarla come un collaboratore/stagista instancabile a cui fornire contesto chiaro e feedback.',
          'Considerarla un oracolo infallibile che non richiede mai verifiche o revisioni.',
          'Usarla solo con comandi telegrafici di una singola parola.',
          'Evitare di darle dettagli sulla propria azienda o sul compito.'
        ],
        correctIndex: 0,
        explanation: 'Trattare l\'IA come un collaboratore a cui spiegare obiettivi e dare indicazioni è il segreto per risultati di eccellenza.'
      },
      {
        question: 'Cosa significa che un modello di linguaggio è "probabilistico"?',
        options: [
          'Prevede e genera le parole successive più coerenti in base al contesto e all\'addestramento ricevuto.',
          'Significa che funziona solo il 50% delle volte.',
          'Significa che risponde solo se lanci un dado virtuale.',
          'Significa che non può elaborare testi scritti in italiano.'
        ],
        correctIndex: 0,
        explanation: 'Gli LLM funzionano calcolando la probabilità statistica dei token (parole/sotto-parole) più appropriati al contesto.'
      }
    ]
  },
  midterm: {
    id: 'midterm',
    title: '⚖️ Test Intermedio — Prompt Engineering & Metodo RCCF',
    subtitle: 'Verifica operativa obbligatoria a metà percorso (Modulo 10) prima di sbloccare i moduli avanzati.',
    requiredLessonId: 10,
    passThresholdPercent: 75,
    questions: [
      {
        question: 'Cosa rappresentano le 4 lettere della formula segreta RCCF?',
        options: [
          'Ruolo, Contesto, Contenuto, Formato',
          'Ricerca, Codice, Controllo, File',
          'Risposta, Chiarezza, Firma, Font',
          'Robot, Calcolo, Foto, Formattazione'
        ],
        correctIndex: 0,
        explanation: 'RCCF sta per: Ruolo (chi impersona), Contesto (la situazione), Contenuto (il compito), Formato (la struttura visiva di output).'
      },
      {
        question: 'Cos\'è la tecnica del "Few-Shot Prompting"?',
        options: [
          'Fornire all\'IA 1 o 2 esempi pratici di input/output desiderati all\'interno del prompt.',
          'Scrivere un prompt in meno di 5 secondi.',
          'Fare una sola domanda e chiudere la chat.',
          'Scattare una fotografia dello schermo.'
        ],
        correctIndex: 0,
        explanation: 'Il Few-Shot Prompting consiste nel dare esempi concreti all\'IA per impostare lo stile, il formato e il livello di dettaglio atteso.'
      },
      {
        question: 'Nel prompting per immagini visive (es. Midjourney, DALL-E), quale elemento NON dovrebbe mancare?',
        options: [
          'Soggetto principale, ambientazione/luce e stile visivo o tipo di lente.',
          'Aggettivi vaghi come "fallo bellissimo e stupendo".',
          'Solo il nome di un colore casuale.',
          'Comandi testuali privi di descrizioni compositive.'
        ],
        correctIndex: 0,
        explanation: 'La chiarezza descrittiva (soggetto, luce, atmosfera, fotocamera) produce risultati fotorealistici infinitamente superiori ad aggettivi generici.'
      },
      {
        question: 'Perché l\'iterazione continua è fondamentale nel lavoro con i modelli linguistici?',
        options: [
          'Perché il primo output è una base di partenza che va raffinata e calibrata con feedback mirati.',
          'Perché l\'IA rifiuta sempre la prima risposta.',
          'Perché serve a consumare più tempo.',
          'Perché i modelli non ricordano la domanda precedente.'
        ],
        correctIndex: 0,
        explanation: 'L\'interazione con l\'IA è un dialogo collaborativo: affinare il tiro con feedback successivi porta a risultati perfetti.'
      }
    ]
  },
  final: {
    id: 'final',
    title: '🎓 Esame Ufficiale di Certificazione Europea — AI Specialist (16 Ore)',
    subtitle: 'Valutazione rigorosa delle competenze teorico-pratiche basata sui 20 Moduli del Corso Base AI Start (Ente Certificatore ATOMA). Soglia di superamento: 80% (12/15 corrette).',
    requiredLessonId: 20,
    passThresholdPercent: 80,
    questions: [
      {
        question: '1. [Modulo 1 & 2: Fondamenti & Approccio] Qual è la differenza strutturale fondamentale tra un software tradizionale e un modello linguistico (LLM) basato su architettura Transformer?',
        options: [
          'Il software tradizionale esegue istruzioni deterministiche rigide basate su regole fisse (IF/THEN), mentre l\'LLM comprende il contesto semantico e genera contenuti prevedendo probabilisticamente le parole successive più coerenti.',
          'Il software tradizionale funziona solo se collegato ad una stampante fisica, l\'LLM no.',
          'Gli LLM memorizzano l\'intero web in un archivio zip e lo copiano pari pari senza elaborazione.',
          'Non vi è alcuna differenza tecnica: entrambi eseguono solo calcoli algebrici elementari.'
        ],
        correctIndex: 0,
        explanation: 'Come spiegato nei Moduli 1 e 2, l\'IA generativa funziona con meccanismi di auto-attenzione (Self-Attention) che pesano il significato probabilistico del contesto.'
      },
      {
        question: '2. [Modulo 3 & 4: Foglio Bianco & Chiarezza] Quando si imposta un prompt per una ricerca complessa o un nuovo documento, cosa si intende per "Reverse Prompting"?',
        options: [
          'Chiedere preventivamente all\'IA quali informazioni, dati di contesto o chiarimenti le servono da parte nostra prima di iniziare a redigere il testo definitivo.',
          'Scrivere un prompt leggendolo al contrario dall\'ultima parola alla prima.',
          'Chiedere all\'IA di cancellare la cronologia delle chat dell\'ultima settimana.',
          'Digitare solo parole chiave sconnesse senza alcuna punteggiatura.'
        ],
        correctIndex: 0,
        explanation: 'Il Reverse Prompting (Modulo 3) sfrutta la capacità dell\'IA di guidare l\'utente facendosi porre le domande giuste per raccogliere tutti i dati necessari.'
      },
      {
        question: '3. [Modulo 5: Metodo RCCF] Devi far preparare una sequenza di email commerciali persuasive per un servizio aziendale. Quale prompt applica rigorosamente la formula RCCF?',
        options: [
          'Ruolo: "Sei un copywriter B2B esperto"; Contesto: "Azienda di consulenza per PMI, target titolari diffidenti verso i costi fissi"; Compito: "Scrivi 3 email di follow-up orientate al ROI"; Formato: "Tabella con Oggetto, Corpo (max 150 parole) e Call to Action chiara".',
          '"Scrivimi 3 email bellissime per vendere il mio servizio a clienti aziendali in modo persuasivo e veloce."',
          '"Spiegami cos\'è un\'email commerciale e poi dimmi se secondo te è utile inviarla ai miei clienti."',
          '"Genera un testo generico di 1000 parole senza indicare il destinatario né il settore di riferimento."'
        ],
        correctIndex: 0,
        explanation: 'La formula RCCF (Ruolo, Contesto, Compito, Formato - Modulo 5) garantisce che il modello riceva tutte le coordinate necessarie per un output perfetto senza genericità.'
      },
      {
        question: '4. [Modulo 6: L\'Arte dell\'Iterazione] Perché nel lavoro professionale con gli LLM il primo output generato non va quasi mai considerato definitivo?',
        options: [
          'Perché l\'interazione con l\'IA è un processo dialogico e cooperativo: il primo output serve come bozza su cui applicare feedback mirati (es. calibrare il tono, correggere un punto, aggiungere obiezioni).',
          'Perché i modelli di intelligenza artificiale sbagliano intenzionalmente la prima risposta per consumare crediti.',
          'Perché la prima risposta viene sempre cancellata automaticamente dai server dopo 30 secondi.',
          'Perché è obbligatorio per legge riformulare la domanda almeno tre volte.'
        ],
        correctIndex: 0,
        explanation: 'Come approfondito nel Modulo 6, l\'iterazione a più passaggi permette di perfezionare stile, lunghezza e accuratezza del testo finale.'
      },
      {
        question: '5. [Modulo 7: Confronto Tool] Quale tra i seguenti strumenti è la scelta ottimale se devi svolgere una ricerca di mercato aggiornata con citazione verificabile delle fonti web in tempo reale?',
        options: [
          'Perplexity AI (grazie all\'indice con motore di ricerca integrato e link diretti alle fonti).',
          'Un generatore di immagini grafiche come Midjourney.',
          'Un software offline senza connessione internet.',
          'Un programma per la registrazione audio di note vocali.'
        ],
        correctIndex: 0,
        explanation: 'Il Modulo 7 confronta i grandi modelli evidenziando la specializzazione di Perplexity nella ricerca informativa con citazione puntuale delle fonti.'
      },
      {
        question: '6. [Modulo 8: Scrivere senza Sforzo] Per adattare rapidamente una comunicazione commerciale formale per un consiglio di amministrazione rispetto a un post per Instagram, su quale parametro occorre intervenire?',
        options: [
          'Sul "Tono di Voce" (Tone of Voice) e sui vincoli di sintesi, specificando all\'IA il pubblico di destinazione (B2B executive vs social informale).',
          'Sulla velocità del processore del computer.',
          'Sulla dimensione dello schermo su cui si legge la risposta.',
          'Sul colore dei caratteri usati nella finestra di chat.'
        ],
        correctIndex: 0,
        explanation: 'Il Modulo 8 dimostra come guidare l\'IA nel rimodulare lo stesso concetto su diversi registri linguistici e canali di comunicazione.'
      },
      {
        question: '7. [Modulo 9 & 10: Prompt Visivo & Immagini] Quali elementi costituiscono l\'anatomia di un prompt descrittivo efficace per la generazione di un visual professionale fotorealistico?',
        options: [
          'Soggetto dettagliato + Ambiente/Sfondo + Illuminazione specifica (es. luce volumetrica, golden hour) + Stile/Inquadratura (es. 85mm lens, grandangolo, close-up) + Dettagli di finitura puliti.',
          'Inserire solo parole generiche e astratte come "immagine bellissima, stupenda, capolavoro 8K".',
          'Scrivere il prompt in latino antico per rendere l\'immagine più classica.',
          'Non specificare mai l\'illuminazione per lasciare che il computer decida a caso.'
        ],
        correctIndex: 0,
        explanation: 'Nei Moduli 9 e 10 si spiega che aggettivi vaghi non funzionano: servono dettagli compositivi precisi di ottica, luce e ambientazione.'
      },
      {
        question: '8. [Modulo 11: Presentazioni in 5 Minuti] Qual è la struttura narrativa raccomandata per far generare all\'IA la scaletta di un pitch o presentazione aziendale ad alto impatto?',
        options: [
          'La triade logica: 1. Identificazione del Problema/Collo di bottiglia -> 2. Presentazione della Soluzione e Benefici quantificabili -> 3. Call to Action e Prossimi Passi.',
          'Inserire 50 slide piene di testo fitto e grafici non commentati.',
          'Parlare solo della storia dell\'azienda dal 1950 senza mai citare il cliente o il problema.',
          'Evitare qualsiasi conclusione o richiesta di contatto a fine presentazione.'
        ],
        correctIndex: 0,
        explanation: 'Il Modulo 11 illustra la regola fondamentale dello storytelling esecutivo (Problema, Soluzione, CTA) per slide incisive e veloci da realizzare.'
      },
      {
        question: '9. [Modulo 12: Analisi Dati per Excel] Come può l\'IA supportare un professionista nella gestione avanzata di fogli di calcolo Excel o Google Sheets?',
        options: [
          'Spiegando e scrivendo formule complesse (es. CERCA.X, matriciali nidificate), generando script VBA/Apps Script e individuando anomalie o valori duplicati.',
          'Sostituendo il mouse e la tastiera con un comando vocale non modificabile.',
          'Cancellando i dati numerici e lasciando solo i testi.',
          'Impedendo di stampare o esportare i fogli in formato PDF.'
        ],
        correctIndex: 0,
        explanation: 'Il Modulo 12 mostra come delegare all\'IA la scrittura di macro, formule complesse e la pulizia logica di tabelle di calcolo.'
      },
      {
        question: '10. [Modulo 13: L\'Agenda Intelligente] In che modo l\'IA può essere utilizzata come assistente esecutivo per il Time Management personale?',
        options: [
          'Organizzando un elenco disordinato di attività secondo la matrice di Eisenhower (Urgente vs Importante) e strutturandole in blocchi orari concentrati (Time-Boxing).',
          'Inviando email di disdetta a tutti gli appuntamenti del calendario senza avvisare.',
          'Posticipando automaticamente tutte le scadenze al mese successivo.',
          'Obbligando l\'utente a lavorare 24 ore su 24 senza pause.'
        ],
        correctIndex: 0,
        explanation: 'Nel Modulo 13 si impara a usare l\'IA per dare priorità strategica alle to-do list giornaliere e pianificare la settimana in blocchi di tempo.'
      },
      {
        question: '11. [Modulo 14: Apprendimento Rapido & Metodo ELI5] In cosa consiste la tecnica "ELI5" (Explain Like I\'m 5) e quando è utile in azienda?',
        options: [
          'Nel farsi spiegare un concetto normativo, finanziario o tecnico complesso attraverso metafore semplici e quotidiane, per poi poterlo comunicare chiaramente a clienti o colleghi.',
          'Nel parlare ai clienti con voce infantile durante le riunioni di lavoro.',
          'Nel rifiutarsi di imparare nuovi strumenti software dopo i 5 anni di anzianità aziendale.',
          'Nel limitare la lunghezza di qualsiasi documento a sole 5 parole.'
        ],
        correctIndex: 0,
        explanation: 'Il Modulo 14 insegna il metodo Feynman ed ELI5 per decostruire nozioni difficili in analogie intuitive e facilmente comprensibili.'
      },
      {
        question: '12. [Modulo 15: Allucinazioni & Grounding] Cosa sono le "Allucinazioni" dell\'IA e qual è la tecnica più efficace (Grounding) per neutralizzarle su documenti importanti?',
        options: [
          'Le allucinazioni sono risposte false o inventate generate con sicurezza dal modello; si prevengono fornendo il documento di partenza e ordinando all\'IA di rispondere basandosi solo sul testo allegato.',
          'Le allucinazioni sono difetti visivi del monitor del computer; si risolvono pulendo lo schermo.',
          'Le allucinazioni capitano solo quando si spegne la luce della stanza.',
          'Le allucinazioni si eliminano cancellando la cronologia internet del browser.'
        ],
        correctIndex: 0,
        explanation: 'Nel Modulo 15 si spiega l\'origine probabilistica delle allucinazioni e come il "Grounding" (ancoraggio ai documenti caricati) garantisca risposte veritiere.'
      },
      {
        question: '13. [Modulo 16: Privacy & Sicurezza Aziendale] Quali precauzioni pratiche deve adottare un\'azienda quando i dipendenti utilizzano strumenti di IA generativa per tutelare il GDPR e i dati confidenziali?',
        options: [
          'Disattivare il salvataggio cronologia per l\'addestramento pubblico nelle impostazioni, anonimizzare i dati sensibili (PII, dati finanziari) ed evitare di condividere credenziali o segreti industriali.',
          'Incollare codici bancari e password dei clienti nelle chat pubbliche per comodità.',
          'Condividere il medesimo account gratuito tra tutti i dipendenti senza password.',
          'Non impostare alcuna regola aziendale e lasciare l\'utilizzo totalmente privo di linee guida.'
        ],
        correctIndex: 0,
        explanation: 'Il Modulo 16 è interamente dedicato alle buone pratiche di compliance GDPR, privacy policy, anonimizzazione preventiva e impostazioni di opt-out.'
      },
      {
        question: '14. [Modulo 18: Creare il proprio Workflow] A cosa servono le "Custom Instructions" (Istruzioni Personalizzate) disponibili nelle impostazioni dei moderni strumenti di IA?',
        options: [
          'A memorizzare in modo permanente chi sei (ruolo, settore aziendale) e come desideri le risposte (tono, formattazione, vincoli), evitando di doverlo rispiegare ad ogni nuova conversazione.',
          'A velocizzare la scheda grafica del computer durante i videogiochi.',
          'A cambiare la lingua della tastiera del computer ogni 10 minuti.',
          'A impedire l\'apertura di altre schede nel browser internet.'
        ],
        correctIndex: 0,
        explanation: 'Il Modulo 18 spiega come creare il proprio workflow su misura impostando istruzioni di sistema perenni per risparmiare tempo quotidiano.'
      },
      {
        question: '15. [Modulo 1, 17 & 20: Il Professionista Potenziato] Qual è la vera chiave di successo e il ruolo irrinunciabile dell\'essere umano nell\'era dell\'Intelligenza Artificiale?',
        options: [
          'Agire da "Direttore d\'Orchestra": guidare l\'IA con pensiero critico, definire la visione strategica, validare eticamente i risultati e coltivare l\'empatia e la relazione umana di valore con le persone.',
          'Cercare di competere con l\'IA nella velocità di digitazione meccanica di testi.',
          'Rifiutare l\'uso della tecnologia sperando che il mercato non cambi.',
          'Delegare all\'IA qualsiasi decisione legale ed economica senza mai rileggere o verificare.'
        ],
        correctIndex: 0,
        explanation: 'Come ribadito lungo tutto il corso (Moduli 1, 17 e 20), l\'IA amplifica il potenziale umano ma richiede sempre senso critico, strategia ed etica dell\'operatore.'
      }
    ]
  }
}

export interface PracticalGuide {
  id: string
  title: string
  category: 'Guida Pratica' | 'Configurazione' | 'Confronto Tool'
  badge: string
  readTime: string
  description: string
  freeFeatures: string[]
  paidFeatures: string[]
  customizationSteps: { title: string; instruction: string; promptExample?: string }[]
  recommendedSettings: string[]
}

export const PRACTICAL_GUIDES: PracticalGuide[] = [
  {
    id: 'guida-chatgpt-custom',
    title: 'Guida Pratica: Come Personalizzare ChatGPT (Free vs Plus/Team)',
    category: 'Configurazione',
    badge: 'OpenAI ChatGPT',
    readTime: '6 min di lettura',
    description: 'Manuale passo-passo per configurare le Custom Instructions, la memoria persistente e i Custom GPT, con analisi approfondita delle differenze tra piano Gratuito e a Pagamento.',
    freeFeatures: [
      'Accesso al modello standard GPT-4o mini con risposte illimitate.',
      'Accesso a GPT-4o con limite dinamico di messaggi ogni 3 ore (poi fallback a mini).',
      'Custom Instructions attive: memorizzazione del tuo profilo e stile di scrittura.',
      'Analisi di file (PDF, immagini, fogli di calcolo) con limiti di caricamento giornaliero.',
      'Navigazione Web in tempo reale con Bing e generazione immagini di base.'
    ],
    paidFeatures: [
      'Accesso prioritario e senza limiti a GPT-4o e modelli di ragionamento avanzato (o1, o3-mini).',
      'Creazione di Custom GPT personali e aziendali con Knowledge Base privata (fino a centinaia di PDF/dati).',
      'Funzionalità Advanced Voice Mode a bassa latenza e senza interruzioni.',
      'Canvas: workspace interattivo per revisionare codice, contratti e copy fianco a fianco.',
      'Capacità di analisi dati estesa (Python Sandbox per grafici e pivot table su grandi dataset).'
    ],
    customizationSteps: [
      {
        title: '1. Configurare le Istruzioni Personalizzate (Custom Instructions)',
        instruction: 'Vai in Impostazioni > Personalizzazione > Istruzioni Personalizzate. Compila le due sezioni chiave:',
        promptExample: 'PARTE 1 (Chi sei): "Sono un imprenditore/consulente italiano. Lavoro con PMI e professionisti. Il mio obiettivo è risparmiare tempo e automatizzare compiti operativi."\n\nPARTE 2 (Come vuoi che risponda): "Rispondi sempre in italiano professionale, diretto e senza preamboli o complimenti. Usa elenchi puntati per i passaggi chiave e tabelle per i confronti. Quando scrivi copy, applica la formula RCCF."'
      },
      {
        title: '2. Gestire la Memoria Dinamica',
        instruction: 'ChatGPT impara dai dialoghi se la Memoria è attiva. Per fissare regole ferree, digita in chat:',
        promptExample: '"Ricorda per tutte le prossime sessioni che il mio tono di voce deve essere asciutto, autorevole e focalizzato sul ROI aziendale."'
      },
      {
        title: '3. Creare un Custom GPT Aziendale (Piano Plus/Team)',
        instruction: 'Da "Esplora GPT" clicca su "+ Crea". Nella scheda "Configure" inserisci le istruzioni di sistema (System Prompt), carica i tuoi documenti PDF (listini, manuali interni) e disattiva la condivisione per addestramento.'
      }
    ],
    recommendedSettings: [
      'Attiva sempre le Custom Instructions per evitare di rispiegare il tuo contesto ad ogni prompt.',
      'Disattiva l\'addestramento sui tuoi dati in Impostazioni > Controlli Dati se inserisci informazioni riservate.',
      'Usa Canvas ogni volta che devi lavorare su un testo lungo (email complesse, report, schede prodotto).'
    ]
  },
  {
    id: 'guida-claude-custom',
    title: 'Guida Pratica: Come Personalizzare Claude (Free vs Pro/Team)',
    category: 'Configurazione',
    badge: 'Anthropic Claude',
    readTime: '6 min di lettura',
    description: 'Come sfruttare Claude Sonnet e Opus per la scrittura naturale e l\'analisi documentale profonda, con la gestione dei Projects e delle System Instructions.',
    freeFeatures: [
      'Accesso al modello Claude 3.5 Sonnet (il più naturale e sfumato nella scrittura italiana).',
      'Finestra di contesto generosa (fino a 200k token per caricare interi libri o relazioni).',
      'Creazione di Artifacts interattivi (anteprime di codice, tabelle HTML, documenti formattati).',
      'Limite di messaggi dinamico in base al traffico server globale (si ricarica ogni 5 ore).'
    ],
    paidFeatures: [
      'Limite di utilizzo 5x superiore rispetto al piano gratuito con accesso prioritario.',
      'Funzionalità "Projects": crea cartelle di lavoro tematiche con Knowledge Base fino a 500 pagine e istruzioni di progetto dedicate.',
      'Accesso a Claude 3.7 Sonnet con modalità "Extended Thinking" (ragionamento ibrido profondo su logica e contratti).',
      'Condivisione di progetti e prompt standardizzati all\'interno del team.'
    ],
    customizationSteps: [
      {
        title: '1. Creare un "Project" Dedicato (Piano Pro)',
        instruction: 'Nella dashboard clicca su "Projects" > "New Project". Assegna un nome (es. "Marketing & Copy B2B" oppure "Analisi Bilanci").',
        promptExample: 'PROJECT INSTRUCTIONS:\n"Agisci come il Direttore Marketing senior della mia azienda. Conosci i nostri clienti target (PMI) e il nostro stile comunicativo. Ogni volta che produci copy o email, rispetta il nostro manifesto aziendale presente nei file allegati."'
      },
      {
        title: '2. Caricare la Knowledge Base di Progetto',
        instruction: 'Carica file .txt, .pdf, o .csv contenenti la storia aziendale, le FAQ, i listini e gli esempi di successo. Claude consulterà automaticamente questi dati per ogni risposta nel progetto.'
      },
      {
        title: '3. Personalizzare lo Stile con gli Artifacts',
        instruction: 'Chiedi esplicitamente a Claude di usare gli Artifacts per documenti riutilizzabili:',
        promptExample: '"Crea un Artifact con la tabella di comparazione e una checklist operativa in formato Markdown modificabile."'
      }
    ],
    recommendedSettings: [
      'Crea un Project separato per ogni area di lavoro (es. "Amministrazione", "Vendite", "Social Media").',
      'Sfrutta Claude Sonnet per qualsiasi testo che debba sembrare scritto da un copywriter umano d\'élite.',
      'Attiva "Extended Thinking" quando devi analizzare clausole legali, incongruenze nei contratti o strategie complesse.'
    ]
  },
  {
    id: 'guida-gemini-custom',
    title: 'Guida Pratica: Come Personalizzare Google Gemini (Free vs Advanced)',
    category: 'Configurazione',
    badge: 'Google Gemini',
    readTime: '5 min di lettura',
    description: 'Guida all\'ecosistema Google AI: integrazione con Google Workspace (Drive, Gmail, Docs), estensioni native e creazione dei "Gems" personalizzati.',
    freeFeatures: [
      'Accesso al modello Gemini 2.0 Flash / 1.5 Flash con risposte ultra-veloci.',
      'Finestra di contesto da 1 Milione di token (puoi caricare file audio, video fino a 1 ora e PDF di 700 pagine).',
      'Estensioni Google integrate: collega Gmail, Google Drive, Google Maps, YouTube e Flights direttamente nei prompt.',
      'Ricerca Google nativa con fonti aggiornate al secondo esatto.'
    ],
    paidFeatures: [
      'Accesso prioritario al modello Gemini 1.5 Pro / 2.5 Advanced con capacità di ragionamento logico superiore.',
      'Creazione di "Gems" (assistenti IA personalizzati con prompt di sistema e compiti ricorrenti).',
      'Integrazione diretta all\'interno di Google Workspace (Gemini integrato in Gmail per redigere email e in Google Docs/Sheets).',
      '2 TB di spazio di archiviazione Google One Cloud inclusi nell\'abbonamento.'
    ],
    customizationSteps: [
      {
        title: '1. Attivare e Usare le Estensioni Google',
        instruction: 'In Impostazioni > Estensioni, attiva Google Workspace e YouTube. Nel prompt richiama l\'estensione con la chiocciola (@):',
        promptExample: '"@Google Drive cerca il documento del preventivo Rossi e sintetizza i 3 punti chiave."'
      },
      {
        title: '2. Creare un "Gem" Personalizzato (Piano Advanced)',
        instruction: 'Clicca su "Gestione Gems" > "Nuovo Gem". Dai un nome al tuo assistente (es. "Tutor Email Aziendali") e inserisci le istruzioni:',
        promptExample: '"Sei l\'assistente dedicato alla gestione della posta in arrivo. Il tuo compito è classificare ogni messaggio in Urgente, Informativo o Da Delegare, e proporre una bozza di risposta cordiale di massimo 4 righe."'
      },
      {
        title: '3. Analisi Multimodale di Video e Audio Lunghi',
        instruction: 'Trascina un file MP3 di una riunione o un link video YouTube: Gemini estrarrà la trascrizione, i decision points e la lista delle cose da fare (Action Items).'
      }
    ],
    recommendedSettings: [
      'Usa Gemini per elaborare grandi archivi: se hai una cartella piena di PDF o una registrazione audio da 1 ora, caricala direttamente.',
      'Sfrutta l\'estensione @YouTube per riassumere webinar o tutorial lunghi in meno di 10 secondi.'
    ]
  },
  {
    id: 'guida-perplexity-custom',
    title: 'Guida Pratica: Come Personalizzare Perplexity AI (Free vs Pro)',
    category: 'Configurazione',
    badge: 'Perplexity AI',
    readTime: '5 min di lettura',
    description: 'Il motore di ricerca e ricerca aumentata da IA: come configurare l\'AI Profile, organizzare le Collections e scegliere i modelli di calcolo ottimali.',
    freeFeatures: [
      'Ricerche Quick Search illimitate con citazione puntuale delle fonti web verificate.',
      'Accesso standard al motore di sintesi con link cliccabili a ogni notizia/studio citato.',
      'Creazione di "Collections" per raggruppare ricerche per argomenti o clienti.',
      'Configurazione del profilo utente (AI Profile) con lingua, settore e formato di risposta.'
    ],
    paidFeatures: [
      'Oltre 300 ricerche "Pro Search" al giorno con ragionamento multifase e ricerca incrociata su decine di fonti.',
      'Possibilità di scegliere il modello sottostante per ogni ricerca: Claude 3.5 Sonnet, GPT-4o, o3-mini o DeepSeek R1.',
      'Caricamento e analisi di file illimitati all\'interno delle Collections con ricerca semantica (RAG).',
      'Generazione di immagini di supporto con Flux e DALL-E 3.',
      'Crediti mensili per API Perplexity.'
    ],
    customizationSteps: [
      {
        title: '1. Configurare l\'AI Profile',
        instruction: 'Vai nel tuo profilo (icona in basso a sinistra) > Impostazioni > AI Profile. Inserisci:',
        promptExample: 'LAVORO & RUOLO: "Consulente strategico e formatore per imprese italiane."\nLINGUA: "Italiano"\nFORMATO PREFERITO: "Fornisci sempre risposte strutturate con sommario esecutivo, dati quantitativi recenti e fonti ufficiali."'
      },
      {
        title: '2. Usare le "Collections" per i Tuoi Clienti o Progetti',
        instruction: 'Crea una Collection (es. "Studio Concorrenti B2B"). Inserisci un Prompt di Collezione personalizzato che forzi Perplexity a filtrare i risultati solo per il mercato italiano ed europeo.'
      },
      {
        title: '3. Scegliere il Modello IA Giusto per la Ricerca (Piano Pro)',
        instruction: 'Nella casella di ricerca Pro, seleziona il modello: scegli Claude 3.5 Sonnet per sintesi articolate e narrative, oppure o3-mini/DeepSeek per confronti numerici e normativi complessi.'
      }
    ],
    recommendedSettings: [
      'Sostituisci Google con Perplexity per qualsiasi ricerca di mercato o analisi della concorrenza.',
      'Usa la modalità "Focus" (es. Academic, Writing, YouTube, Reddit) per restringere il campo di ricerca solo a fonti specializzate.'
    ]
  }
]

// Database di Conoscenza Dettagliato dei 20 Moduli AI Pro (Agenti Autonomi & Automazioni)
export const LESSON_SUMMARIES_PRO: Record<number, { title: string; summary: string; takeaways: string[]; exercise: string }> = {
  1: {
    title: '1. Da Cartella Vuota al Primo Agente',
    summary: 'Configurazione dell\'ambiente di lavoro in Google Antigravity IDE: come collegare una cartella locale vuota alla cabina di comando e far generare il primo assistente operativo.',
    takeaways: [
      'Differenza fondamentale tra chatbot web (usa e getta) e IDE agentico con accesso al file system locale.',
      'Setup del workspace e comprensione dei tre pannelli: file, editor e cabina di controllo dell\'agente.',
      'Primo test di esecuzione: l\'agente legge un file grezzo di note e genera un CSV strutturato.'
    ],
    exercise: 'Crea una cartella sul desktop, aprila in Antigravity e chiedi all\'agente di creare un file di benvenuto con la data odierna.'
  },
  2: {
    title: '2. La Costituzione dell\'Agente (AGENTS.md)',
    summary: 'La scrittura di AGENTS.md come memoria persistente e contratto di lavoro: regole di comportamento, tono di voce, confini operativi e standard di output.',
    takeaways: [
      'Il file AGENTS.md viene letto prima di ogni singola esecuzione per dare contesto persistente.',
      'Definizione di ruoli chiari, vincoli di sicurezza (es. non toccare file .env) e formati richiesti.',
      'Come evitare allucinazioni imponendo all\'agente di verificare sempre i file prima di modificare.'
    ],
    exercise: 'Scrivi un file AGENTS.md per la tua azienda definendo chi sei, che tono usare e quali file non deve mai toccare.'
  },
  3: {
    title: '3. Come Lavora l\'Agente: Thinking & File System',
    summary: 'Analisi del ciclo operativo dell\'agente: pianificazione del pensiero (Thinking), ispezione dei file, modifiche chirurgiche e verifica del risultato.',
    takeaways: [
      'Il ciclo Think-Plan-Act: l\'agente pianifica i passi prima di scrivere il codice.',
      'Lettura ed elaborazione batch di cartelle e documenti aziendali complessi.',
      'Modifiche chirurgiche e localizzate senza sovrascrivere file interi.'
    ],
    exercise: 'Fornisci all\'agente 3 file di testo disordinati e chiedigli di sintetizzarli in un unico report Markdown tabellare.'
  },
  4: {
    title: '4. Compiti Autonomi & Tool Isolati',
    summary: 'Come autorizzare l\'agente a eseguire compiti multi-step in autonomia mantenendo il controllo umano sui passaggi critici.',
    takeaways: [
      'L\'uso degli strumenti integrati: lettura, scrittura, ricerca e comandi shell controllati.',
      'Pattern Human-in-the-Loop: richiedere conferma prima di operazioni distruttive o invii esterni.',
      'Isolamento e sicurezza nell\'esecuzione di script locali.'
    ],
    exercise: 'Chiedi all\'agente di analizzare la dimensione di tutti i file in una cartella e creare un file README riassuntivo.'
  },
  5: {
    title: '5. Cosa sono le API: Il Cameriere Digitale',
    summary: 'Concetto chiave dell\'automazione: cosa sono le API, come funzionano le chiamate HTTP, i metodi GET/POST e la differenza tra interfaccia utente e scambio dati.',
    takeaways: [
      'La metafora del cameriere: la tua app chiede il menu (request), la cucina/server risponde con il piatto (response).',
      'Differenza tra costo di abbonamento fisso ($20/mese) e costo al consumo via API (pochi centesimi per milione di token).',
      'Struttura del messaggio: Endpoint URL, Headers di autenticazione e Body con il prompt.'
    ],
    exercise: 'Individua 3 software che usi ogni giorno (es. CRM, WhatsApp, Gestionale) e verifica se dispongono di API pubbliche.'
  },
  6: {
    title: '6. Google AI Studio: La Prima Chiave Gratuita',
    summary: 'Creazione e configurazione di una API Key gratuita su Google AI Studio per accedere a Gemini 2.5 Flash senza costi e testarla nel Playground.',
    takeaways: [
      'Accesso al portale Google AI Studio e generazione della chiave API in 60 secondi.',
      'Utilizzo del Playground per testare temperature, system instructions e limiti di token.',
      'I vantaggi di Gemini 2.5 Flash: 1 milione di token di contesto e altissima velocità a costo zero nel tier free.'
    ],
    exercise: 'Genera la tua API Key su Google AI Studio e fai un test nel Playground incollando un testo lungo da sintetizzare.'
  },
  7: {
    title: '7. OpenAI Platform & Limiti di Spesa',
    summary: 'Registrazione sulla piattaforma OpenAI per sviluppatori, generazione di Secret Key e impostazione dei limiti di spesa (Budget Cap a 5€) per la massima sicurezza.',
    takeaways: [
      'Creazione dell\'account OpenAI Developer e generazione delle Secret Key.',
      'Impostazione fondamentale di Usage Limits: Hard Limit e Soft Limit per evitare addebiti imprevisti.',
      'Best practice: non condividere mai le chiavi API e non committarle mai su GitHub pubblico.'
    ],
    exercise: 'Configura un limite di spesa massimo di 5€/mese sul tuo account OpenAI developer e crea una chiave per i test.'
  },
  8: {
    title: '8. JSON & Risposte Strutturate',
    summary: 'Forzare l\'AI a rispondere esclusivamente in formato JSON valido: perché è fondamentale per integrare l\'intelligenza artificiale con database, fogli di calcolo e webhook.',
    takeaways: [
      'Cos\'è il formato JSON: chiavi, valori, array e oggetti.',
      'Modalità JSON Mode / Structured Outputs per garantire che la risposta sia sempre parsabile da un programma.',
      'Prompt di validazione schema: definire i campi obbligatori (es. `nome`, `email`, `preventivo_totale`).'
    ],
    exercise: 'Scrivi un prompt che chieda all\'AI di estrarre da un testo libero il nome, la città e il numero di telefono in formato JSON puro.'
  },
  9: {
    title: '9. Benvenuti in n8n: Nodi & Trigger',
    summary: 'Introduzione all\'ambiente di automazione visiva n8n: interfaccia, navigazione, tipologie di nodi (Trigger vs Action) e filosofia senza codice.',
    takeaways: [
      'Perché n8n è lo standard open source per l\'automazione aziendale rispetto a Zapier/Make.',
      'La differenza tra Trigger (l\'evento che avvia il flusso) e Action (l\'operazione eseguita).',
      'Come collegare i nodi e ispezionare i dati in transito (Input / Output panel).'
    ],
    exercise: 'Crea un workflow vuoto su n8n, inserisci un nodo Manual Trigger e un nodo Set per passare un messaggio di testo.'
  },
  10: {
    title: '10. Il Primo Webhook',
    summary: 'Creare e testare un Webhook in n8n: ricevere dati in tempo reale da moduli web, landing page o applicazioni esterne.',
    takeaways: [
      'Cos\'è un Webhook: un link univoco sempre in ascolto che riceve notifiche istantanee.',
      'Differenza tra Webhook URL di Test e Webhook URL di Produzione.',
      'Ispezione del payload JSON ricevuto dal browser o da un modulo di contatto.'
    ],
    exercise: 'Crea un nodo Webhook su n8n, aprilo dal browser passando dei parametri nell\'URL e verifica i dati catturati.'
  },
  11: {
    title: '11. Collegare l\'AI al Webhook',
    summary: 'Inserire un modello LLM (Gemini / OpenAI) all\'interno di un flusso n8n per trasformare, classificare o riassumere i dati in arrivo in tempo reale.',
    takeaways: [
      'Configurazione delle Credenziali API su n8n in modo sicuro.',
      'Utilizzo dei nodi AI Agent e Basic LLM Chain all\'interno del canvas.',
      'Inoltro del prompt con variabili dinamiche prelevate dal webhook precedente.'
    ],
    exercise: 'Collega il tuo webhook a un nodo Gemini su n8n per tradurre automaticamente qualsiasi testo ricevuto in inglese.'
  },
  12: {
    title: '12. Fogli di Calcolo Automatici (Google Sheets / Excel)',
    summary: 'Scrittura, aggiornamento e lettura automatica di righe su Google Sheets o Excel senza aprire manualmente i file.',
    takeaways: [
      'Autenticazione OAuth e Service Account per Google Sheets.',
      'Operazioni di Append Row (aggiungi riga) e Update Row basate su ID univoco.',
      'Flusso completo: Ricezione dati -> Elaborazione AI -> Salvataggio riga su foglio di calcolo.'
    ],
    exercise: 'Costruisci un flusso n8n che riceve un contatto via webhook e lo scrive come nuova riga su Google Sheets.'
  },
  13: {
    title: '13. Smistatore Email Aziendale',
    summary: 'Costruzione di un agente di triage automatico della casella di posta: lettura email in arrivo, categorizzazione e inoltro delle urgenze.',
    takeaways: [
      'Integrazione del nodo Email Trigger (IMAP) per monitorare le caselle aziendali.',
      'Prompt di classificazione: distinguere preventivi, assistenza clienti, comunicazioni interne e spam.',
      'Routing condizionale con il nodo Switch in base alla categoria individuata dall\'AI.'
    ],
    exercise: 'Imposta una regola che classifica un\'email fittizia e invia una notifica differente se è etichettata come "Urgente".'
  },
  14: {
    title: '14. L\'Assistente Preventivi',
    summary: 'Automazione da richiesta grezza a proposta commerciale: incrociare la richiesta del cliente con il listino prezzi e generare una bozza di preventivo.',
    takeaways: [
      'Estrazione dei requisiti e dei quantitativi dalla richiesta del cliente via LLM.',
      'Incrocio dati con un listino prezzi archiviato su foglio di calcolo o database.',
      'Generazione della bozza di risposta commerciale con riepilogo costi e condizioni.'
    ],
    exercise: 'Fornisci una richiesta cliente con 3 servizi richiesti e fai calcolare all\'agente il totale esatto applicando il listino.'
  },
  15: {
    title: '15. RAG Aziendale (Parte 1): Caricare la Conoscenza',
    summary: 'Introduzione al Retrieval-Augmented Generation: come caricare cataloghi, regolamenti e documenti PDF aziendali per renderli consultabili dall\'AI.',
    takeaways: [
      'Limiti del context window e perché serve un sistema RAG per archivi documentali enormi.',
      'Concetto di Chunking (spezzettamento del testo) ed Embeddings vettoriali.',
      'Caricamento e indicizzazione di documenti PDF in un Vector Store.'
    ],
    exercise: 'Carica un documento PDF di 5 pagine in un Vector Store su n8n e verifica la generazione dei vettori di ricerca.'
  },
  16: {
    title: '16. RAG Aziendale (Parte 2): Interrogazione con Fonti',
    summary: 'Costruzione della chat aziendale sicura: interrogare la knowledge base con citazione esatta delle fonti ed eliminazione totale delle allucinazioni.',
    takeaways: [
      'Il nodo Vector Store Retriever: come recuperare solo i pezzi di testo pertinenti alla domanda.',
      'Prompt di grounding: "Rispondi solo ed esclusivamente basandoti sui documenti forniti; cita pagina e sezione".',
      'Verifica dell\'accuratezza e gestione delle risposte "Dato non presente nella documentazione".'
    ],
    exercise: 'Fai una domanda specifica sul documento caricato e verifica che l\'agente risponda citando il paragrafo corretto.'
  },
  17: {
    title: '17. Human-in-the-Loop su Telegram',
    summary: 'Controllo umano nelle automazioni: l\'agente prepara la risposta o il preventivo e invia un messaggio su Telegram con pulsanti [Approva] o [Rifiuta] prima dell\'invio reale.',
    takeaways: [
      'Creazione di un Bot Telegram con BotFather e recupero del Chat ID.',
      'Invio di messaggi ricchi con Inline Keyboard interattive.',
      'Nodo Wait (Webhook Resume) su n8n per attendere il clic del responsabile prima di procedere con l\'invio.'
    ],
    exercise: 'Crea un bot Telegram che ti invia una bozza di testo e attende il tuo clic su [Approva] per completare il flusso.'
  },
  18: {
    title: '18. Trascrizione Audio & Verbali di Riunione',
    summary: 'Da nota vocale WhatsApp o file audio a verbale strutturato: trascrizione con Whisper ed estrazione automatica dei compiti assegnati.',
    takeaways: [
      'Download e invio di file audio al modello Whisper via API per la trascrizione fedele.',
      'Prompt di sintesi verbale: Obiettivi, Decisioni prese, Compiti assegnati con data e responsabile.',
      'Salvataggio automatico del verbale nel Secondo Cervello / Notion / Google Docs.'
    ],
    exercise: 'Invia una breve nota vocale di prova e falla trascrivere e riassumere in 3 compiti operativi dall\'agente.'
  },
  19: {
    title: '19. Sicurezza, Privacy Dati & Gestione Errori',
    summary: 'Protezione delle infrastrutture aziendali: gestione dei fallimenti API, retry automatici, alert in caso di blocco e anonimizzazione dei dati sensibili (GDPR).',
    takeaways: [
      'Gestione degli Error Trigger su n8n per ricevere un avviso immediato se un flusso fallisce.',
      'Anonimizzazione preventiva dei dati personali (PII) prima di inviarli ai provider cloud.',
      'Strategie di fallback: se un\'API non risponde, passare automaticamente a un provider di backup.'
    ],
    exercise: 'Configura un flusso con un nodo di errore simulato e verifica la ricezione dell\'alert di emergenza su Telegram.'
  },
  20: {
    title: '20. Deploy h24, Manutenzione & Certificazione Pro',
    summary: 'Messa in produzione definitiva dei workflow su server cloud attivo 24/7, monitoraggio dello stato e rilascio dell\'Attestato Ufficiale di Completamento AI Pro.',
    takeaways: [
      'Attivazione dei workflow in modalità attiva h24 su server VPS o cloud dedicato.',
      'Checklist di collaudo finale: test end-to-end su tutti i flussi realizzati durante il corso.',
      'Rilascio dell\'Attestato Ufficiale di Completamento con codice di verifica e prossimi passi professionali.'
    ],
    exercise: 'Verifica che tutti i tuoi flussi siano attivi e scarica il tuo Attestato Ufficiale AI Pro!'
  }
}

// 4 Checkpoint Test Interattivi per il Corso AI Pro (Ogni 5 Lezioni)
export const CHECKPOINT_TESTS_PRO: Record<'pro_chk1' | 'pro_chk2' | 'pro_chk3' | 'pro_final', CheckpointTest> = {
  pro_chk1: {
    id: 'pro_chk1' as any,
    title: '🤖 Checkpoint 1 — Antigravity, Regole AGENTS.md & File System',
    subtitle: 'Verifica delle competenze pratiche dopo le prime 5 lezioni (Setup ambiente, file system e costituzione dell\'agente).',
    requiredLessonId: 5,
    passThresholdPercent: 75,
    questions: [
      {
        question: 'Qual è il ruolo primario del file AGENTS.md nella cartella di lavoro di un agente?',
        options: [
          'Fornire una "costituzione" persistente con identità, regole, tono e vincoli che l\'agente legge prima di ogni operazione.',
          'È un file temporaneo che serve solo per installare il programma.',
          'Contiene l\'elenco delle password e delle carte di credito aziendali.',
          'Serve per compilare il codice in linguaggio macchina.'
        ],
        correctIndex: 0,
        explanation: 'AGENTS.md è la memoria persistente dell\'agente in cui si definiscono regole, formati attesi e confini di sicurezza.'
      },
      {
        question: 'Cosa differenzia un IDE agentico come Google Antigravity da una normale chat web di ChatGPT o Claude?',
        options: [
          'L\'IDE agentico ha accesso al file system della cartella di lavoro: può leggere, creare e modificare file chirurgicamente.',
          'L\'IDE agentico funziona solo senza connessione Internet.',
          'La chat web è a pagamento, l\'IDE non usa modelli di intelligenza artificiale.',
          'Non c\'è alcuna differenza pratica.'
        ],
        correctIndex: 0,
        explanation: 'Gli agenti in un IDE possono interagire direttamente con i file del tuo computer, leggere documenti grezzi e scrivere output ordinati.'
      },
      {
        question: 'Nella metafora del "cameriere digitale", cosa rappresenta una chiamata API?',
        options: [
          'Una richiesta strutturata inviata da un programma a un server (il cameriere) per ottenere dati o elaborazioni senza interfaccia grafica.',
          'Un cavo fisico che collega due monitor.',
          'Un messaggio vocale inviato su WhatsApp.',
          'Un virus informatico che blocca il computer.'
        ],
        correctIndex: 0,
        explanation: 'Le API consentono a software differenti di comunicare tra loro scambiandosi dati e istruzioni in background.'
      },
      {
        question: 'Perché l\'uso delle API è generalmente molto più economico rispetto agli abbonamenti web mensili per compiti automatizzati?',
        options: [
          'Perché si paga esclusivamente al consumo (pochi centesimi per milione di token elaborati) solo quando il flusso viene eseguito.',
          'Perché le API sono sempre gratuite per tutti.',
          'Perché i modelli via API hanno meno intelligenza rispetto alla chat.',
          'Perché le API non utilizzano server cloud.'
        ],
        correctIndex: 0,
        explanation: 'Con le API paghi solo i token effettivi utilizzati, permettendo di gestire migliaia di operazioni aziendali con budget ridottissimi.'
      }
    ]
  },
  pro_chk2: {
    id: 'pro_chk2' as any,
    title: '🔌 Checkpoint 2 — API Keys, Gestione Costi, JSON & Webhook',
    subtitle: 'Verifica intermedia a metà percorso (Modulo 10) su chiavi di sicurezza, formati strutturati e ricezione dati.',
    requiredLessonId: 10,
    passThresholdPercent: 75,
    questions: [
      {
        question: 'Qual è la migliore pratica di sicurezza fondamentale per gestire le proprie API Key aziendali?',
        options: [
          'Impostare limiti di spesa (Budget Cap) sulla piattaforma del provider e non pubblicare mai la chiave in file pubblici o chat.',
          'Incollare la chiave in un post pubblico per ricordarla facilmente.',
          'Disattivare ogni limite di credito per non rischiare interruzioni.',
          'Inviare la chiave per email a tutti i clienti.'
        ],
        correctIndex: 0,
        explanation: 'Le API Key sono come password di spesa: vanno protette, confinate nelle variabili d\'ambiente e protette con tetti di budget (es. 5€/mese).'
      },
      {
        question: 'Perché il formato JSON è lo standard de-facto per collegare l\'AI con software e database?',
        options: [
          'Perché è un formato standard a coppie chiave-valore interpretabile senza ambiguità da qualsiasi sistema informativo.',
          'Perché è l\'unico formato che supporta i caratteri in lingua italiana.',
          'Perché rende il testo invisibile agli utenti.',
          'Perché occupa meno di 1 byte sul disco fisso.'
        ],
        correctIndex: 0,
        explanation: 'Il JSON garantisce che i dati estratti dall\'AI (nomi, numeri, importi) possano essere inseriti direttamente in tabelle e database.'
      },
      {
        question: 'Cos\'è un Webhook all\'interno di una piattaforma di automazione come n8n?',
        options: [
          'Un indirizzo web univoco sempre in ascolto che riceve istantaneamente i dati appena accade un evento esterno.',
          'Un pulsante per spegnere il server locale.',
          'Un programma per visualizzare immagini tridimensionali.',
          'Un tipo di microfono per registrare podcast.'
        ],
        correctIndex: 0,
        explanation: 'Il Webhook funge da "porta d\'ingresso" che riceve dati in tempo reale (es. un nuovo modulo compilato da un cliente sul sito).'
      },
      {
        question: 'In n8n, qual è la differenza fondamentale tra un nodo "Trigger" e un nodo "Action"?',
        options: [
          'Il Trigger avvia l\'automazione al verificarsi di un evento (es. ricezione email), mentre l\'Action esegue il compito successivo.',
          'Il Trigger cancella i dati, l\'Action li salva.',
          'Non c\'è alcuna differenza, sono sinonimi.',
          'L\'Action si attiva per prima e il Trigger per ultimo.'
        ],
        correctIndex: 0,
        explanation: 'Ogni flusso parte sempre da un nodo Trigger (l\'innesco) e prosegue attraverso una serie di nodi Action (le azioni da compiere).'
      }
    ]
  },
  pro_chk3: {
    id: 'pro_chk3' as any,
    title: '⚙️ Checkpoint 3 — Automazione Aziendale: n8n, Fogli Dati & Email',
    subtitle: 'Verifica avanzata (Modulo 15) su flussi di triage email, fogli di calcolo automatici e basi di RAG.',
    requiredLessonId: 15,
    passThresholdPercent: 75,
    questions: [
      {
        question: 'Come lavora un agente di triage della posta aziendale realizzato su n8n?',
        options: [
          'Legge l\'email via IMAP/Trigger, usa l\'AI per classificarla (preventivo, urgenza, spam) e la instrada con un nodo Switch.',
          'Elimina tutte le email in arrivo per liberare spazio sul server.',
          'Invia sempre la stessa risposta automatica a chiunque senza leggere il testo.',
          'Funziona solo se il computer rimane acceso con la finestra del browser aperta.'
        ],
        correctIndex: 0,
        explanation: 'L\'agente legge il messaggio, ne estrae il senso con l\'LLM e decide il percorso migliore (notifica urgente, bozza o archiviazione).'
      },
      {
        question: 'In un flusso n8n che genera preventivi commerciali, come si garantisce l\'esattezza dei prezzi?',
        options: [
          'Incrociando la richiesta del cliente con il listino prezzi ufficiale memorizzato su Google Sheets o database.',
          'Lasciando che l\'AI inventi i prezzi basandosi sulla propria fantasia.',
          'Chiedendo al cliente di inserire lui il totale finale.',
          'Applicando sempre un prezzo fisso di 100€ a qualsiasi prodotto.'
        ],
        correctIndex: 0,
        explanation: 'L\'AI estrae gli articoli richiesti, mentre il calcolo matematico e i prezzi vengono prelevati dal listino aziendale verificato.'
      },
      {
        question: 'Cosa si intende per "RAG" (Retrieval-Augmented Generation) in ambito aziendale?',
        options: [
          'Fornire all\'AI l\'accesso a documenti aziendali specifici (PDF, listini) per rispondere solo con dati reali e verificabili.',
          'Un algoritmo per velocizzare la connessione Wi-Fi dell\'ufficio.',
          'Un sistema per stampare volantini pubblicitari.',
          'Un software per registrare l\'orario dei dipendenti.'
        ],
        correctIndex: 0,
        explanation: 'Il RAG consente all\'AI di consultare gli archivi aziendali prima di generare la risposta, garantendo risposte precise e con fonti.'
      },
      {
        question: 'Perché è necessario suddividere i documenti in "Chunk" prima di salvarli in un Vector Store?',
        options: [
          'Perché consente di recuperare con precisione chirurgica solo i paragrafi pertinenti alla specifica domanda posta dall\'utente.',
          'Perché i documenti interi occupano troppo spazio sul monitor.',
          'Perché l\'AI può leggere solo una lettera alla volta.',
          'Perché i PDF lunghi non possono essere salvati sui computer moderni.'
        ],
        correctIndex: 0,
        explanation: 'Spezzettare il testo in blocchi semantici permette al motore vettoriale di trovare esattamente il passaggio che contiene la risposta.'
      }
    ]
  },
  pro_final: {
    id: 'pro_final' as any,
    title: '🎓 Esame Finale — AI Automation Specialist (Corso AI Pro)',
    subtitle: 'Verifica finale completa per il rilascio dell\'Attestato Ufficiale di Completamento AI Pro.',
    requiredLessonId: 20,
    passThresholdPercent: 80,
    questions: [
      {
        question: 'Cosa significa adottare un approccio "Human-in-the-Loop" con Telegram in un flusso automatico?',
        options: [
          'L\'agente prepara il lavoro e chiede conferma all\'operatore umano tramite pulsanti [Approva/Rifiuta] prima di inviare dati o email.',
          'Un essere umano deve digitare manualmente ogni singola parola dell\'email.',
          'L\'automazione viene interrotta definitivamente e non riprende mai.',
          'L\'utente deve telefonare all\'agente vocale per ogni operazione.'
        ],
        correctIndex: 0,
        explanation: 'Il pattern Human-in-the-Loop mantiene il pieno controllo aziendale: l\'AI fa la fatica di redazione, l\'uomo valida con un clic.'
      },
      {
        question: 'Come si trasforma un file audio di una riunione o nota vocale WhatsApp in un verbale con compiti assegnati?',
        options: [
          'Si trascrive l\'audio con un modello come Whisper e si passa la trascrizione a un LLM con prompt per estrarre decisioni e compiti.',
          'Si invia l\'audio direttamente al foglio Excel senza trascriverlo.',
          'Si converte l\'audio in un\'immagine e si analizzano i colori.',
          'Non è tecnicamente possibile estrarre informazioni da un file vocale.'
        ],
        correctIndex: 0,
        explanation: 'Whisper converte l\'audio in testo con precisione, e l\'LLM isola le cose da fare assegnandole ai rispettivi responsabili.'
      },
      {
        question: 'In che modo un sistema ben progettato gestisce gli errori imprevisti (es. API di un provider offline)?',
        options: [
          'Con nodi di Error Trigger che intercettano il blocco, inviano un alert Telegram al team e attivano un modello di fallback.',
          'Cancellando tutti i dati dell\'azienda per sicurezza.',
          'Ignorando l\'errore e facendo finta che il flusso sia riuscito.',
          'Riavviando l\'intero sistema operativo ogni 5 minuti.'
        ],
        correctIndex: 0,
        explanation: 'La resilienza aziendale prevede fallback intelligenti e notifiche immediate al team se un servizio esterno ha un disservizio.'
      },
      {
        question: 'Cosa garantisce l\'operatività h24 di un\'infrastruttura n8n + Agenti AI in produzione?',
        options: [
          'L\'esecuzione su un server VPS cloud dedicato gestito da un process manager (come PM2 o Docker) sempre attivo e connesso.',
          'Lasciare un laptop portatile aperto con lo schermo acceso sul tavolo dell\'ufficio.',
          'Installare una chiavetta USB nel router aziendale.',
          'Usare solo software privi di connessione a Internet.'
        ],
        correctIndex: 0,
        explanation: 'Un server cloud VPS con Docker o PM2 mantiene attivi i trigger e i webhook 24 ore su 24, 7 giorni su 7 in modo affidabile e professionale.'
      }
    ]
  }
}

