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
    title: '🎓 Esame Finale Ufficiale — Certificazione AI Masterclass',
    subtitle: 'Test conclusivo su tutto il programma. Punteggio minimo: 75% per il rilascio dell\'Attestato 16 Ore.',
    requiredLessonId: 20,
    passThresholdPercent: 75,
    questions: [
      {
        question: 'Cosa si intende con il termine "Allucinazione" nei modelli di intelligenza artificiale?',
        options: [
          'Quando il modello genera informazioni false o inventate presentandole con sicurezza come fatti reali.',
          'Quando lo schermo del computer sfarfalla durante l\'elaborazione.',
          'Quando il modello rifiuta di rispondere per motivi di copyright.',
          'Quando l\'IA traduce un testo da una lingua all\'altra.'
        ],
        correctIndex: 0,
        explanation: 'L\'allucinazione è la generazione di fatti inventati o non verificati; si previene fornendo documenti sorgente (Grounding) e chiedendo citazioni.'
      },
      {
        question: 'Qual è la buona pratica fondamentale per garantire la privacy e la sicurezza dei dati aziendali con l\'IA?',
        options: [
          'Disattivare il training sui propri dati, anonimizzare i dati sensibili (PII) e preferire API aziendali a zero-retention.',
          'Condividere password e codici IBAN direttamente nella chat pubblica.',
          'Utilizzare sempre account condivisi senza autenticazione a due fattori.',
          'Non controllare mai le impostazioni di privacy fornite dal provider.'
        ],
        correctIndex: 0,
        explanation: 'La sicurezza aziendale impone l\'anonimizzazione dei dati sensibili e la disattivazione del salvataggio cronologia per l\'addestramento pubblico.'
      },
      {
        question: 'Come può l\'IA essere impiegata per dominare fogli di calcolo come Microsoft Excel o Google Sheets?',
        options: [
          'Generando formule complesse (CERCA.X, matriciali), script VBA/Apps Script e analizzando anomalie nei dati tabellari.',
          'Sostituendo fisicamente la tastiera del computer.',
          'Cancellando automaticamente tutte le celle duplicate senza avvisare.',
          'Creando solo file di testo senza numeri.'
        ],
        correctIndex: 0,
        explanation: 'L\'IA è un assistente formidabile per scrivere formule, creare macro VBA e sintetizzare grandi moli di dati strutturati.'
      },
      {
        question: 'Cosa sono le "Custom Instructions" (Istruzioni Personalizzate) in strumenti come ChatGPT o Claude?',
        options: [
          'Direttive permanenti che definiscono il tuo profilo, professione e formato di risposta preferito per tutte le nuove chat.',
          'Un manuale cartaceo inviato via posta.',
          'Comandi che possono essere digitati solo da ingegneri informatici.',
          'Impostazioni che cancellano la cronologia ogni 5 minuti.'
        ],
        correctIndex: 0,
        explanation: 'Le Custom Instructions evitano di dover ripetere ad ogni sessione chi sei, per chi lavori e come vuoi che l\'IA formatti i testi.'
      },
      {
        question: 'Nel nuovo paradigma lavorativo potenziato dall\'IA, qual è il ruolo più prezioso dell\'essere umano?',
        options: [
          'Agire come "Direttore d\'Orchestra": pensiero critico, strategia, validazione dei risultati, etica ed empatia relazionale.',
          'Digitare a mano milioni di parole senza mai usare strumenti digitali.',
          'Imparare a memoria tutti i parametri matematici dei modelli.',
          'Evitare qualsiasi forma di automazione per timore del cambiamento.'
        ],
        correctIndex: 0,
        explanation: 'Il professionista potenziato guida e valida l\'IA, focalizzandosi sulle decisioni strategiche e sulle relazioni umane ad alto valore aggiunto.'
      }
    ]
  }
}

