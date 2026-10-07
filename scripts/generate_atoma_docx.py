import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
import shutil
import os

doc = docx.Document()

# Page margins
for s in doc.sections:
    s.top_margin = Inches(0.8)
    s.bottom_margin = Inches(0.8)
    s.left_margin = Inches(0.8)
    s.right_margin = Inches(0.8)

# Header Title
p_title = doc.add_paragraph()
run_title = p_title.add_run('CORSO: AI START — INTELLIGENZA ARTIFICIALE PER IL LAVORO (16 ORE)')
run_title.bold = True
run_title.font.size = Pt(16)
run_title.font.color.rgb = RGBColor(14, 116, 144)
p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER

p_sub = doc.add_paragraph()
run_sub = p_sub.add_run('Test di Valutazione Finale per Rilascio Certificazione Competenze (Ente Certificatore ATOMA)\n')
run_sub.font.size = Pt(12)
run_sub.bold = True
p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER

p_meta = doc.add_paragraph()
p_meta.add_run('• Durata Corso: ').bold = True
p_meta.add_run('16 Ore (20 Moduli Formativi Teorico-Pratici)\n')
p_meta.add_run('• Soglia di Superamento Test: ').bold = True
p_meta.add_run('80% risposte corrette (minimo 12 su 15)\n')
p_meta.add_run('• Modalità: ').bold = True
p_meta.add_run('Test a risposta multipla con 4 opzioni (1 esatta, 3 distrattori)\n')
p_meta.add_run('• Legenda: ').bold = True
p_meta.add_run('La risposta contrassegnata con [X] e in GRASSETTO VERDE è la risposta corretta ufficiale.')

doc.add_paragraph('―' * 50)

# 15 Questions
questions = [
    {
        'num': '1',
        'module': 'Modulo 1 & 2: Fondamenti & Approccio Metodologico',
        'q': 'Qual è la differenza strutturale fondamentale tra un software tradizionale e un modello linguistico (LLM) basato su architettura Transformer?',
        'options': [
            (True, "Il software tradizionale esegue istruzioni deterministiche rigide basate su regole fisse (IF/THEN), mentre l'LLM comprende il contesto semantico e genera contenuti prevedendo probabilisticamente le parole successive più coerenti."),
            (False, "Il software tradizionale funziona solo se collegato ad una stampante fisica, l'LLM no."),
            (False, "Gli LLM memorizzano l'intero web in un archivio zip e lo copiano pari pari senza elaborazione."),
            (False, "Non vi è alcuna differenza tecnica: entrambi eseguono solo calcoli algebrici elementari.")
        ],
        'explanation': "Come spiegato nei Moduli 1 e 2, l'IA generativa funziona con meccanismi di auto-attenzione (Self-Attention) che pesano il significato probabilistico del contesto."
    },
    {
        'num': '2',
        'module': 'Modulo 3 & 4: Superare il Foglio Bianco & Chiarezza di Contesto',
        'q': 'Quando si imposta un prompt per una ricerca complessa o un nuovo documento, cosa si intende per "Reverse Prompting"?',
        'options': [
            (True, "Chiedere preventivamente all'IA quali informazioni, dati di contesto o chiarimenti le servono da parte nostra prima di iniziare a redigere il testo definitivo."),
            (False, "Scrivere un prompt leggendolo al contrario dall'ultima parola alla prima."),
            (False, "Chiedere all'IA di cancellare la cronologia delle chat dell'ultima settimana."),
            (False, "Digitare solo parole chiave sconnesse senza alcuna punteggiatura.")
        ],
        'explanation': "Il Reverse Prompting sfrutta la capacità dell'IA di guidare l'utente facendosi porre le domande giuste per raccogliere tutti i dati necessari prima di eseguire il compito."
    },
    {
        'num': '3',
        'module': 'Modulo 5: Il Metodo RCCF (Ruolo, Contesto, Compito, Formato)',
        'q': 'Devi far preparare una sequenza di email commerciali persuasive per un servizio aziendale. Quale prompt applica rigorosamente la formula RCCF?',
        'options': [
            (True, 'Ruolo: "Sei un copywriter B2B esperto"; Contesto: "Azienda di consulenza per PMI, target titolari diffidenti verso i costi fissi"; Compito: "Scrivi 3 email di follow-up orientate al ROI"; Formato: "Tabella con Oggetto, Corpo (max 150 parole) e Call to Action chiara".'),
            (False, '"Scrivimi 3 email bellissime per vendere il mio servizio a clienti aziendali in modo persuasivo e veloce."'),
            (False, '"Spiegami cos\'è un\'email commerciale e poi dimmi se secondo te è utile inviarla ai miei clienti."'),
            (False, '"Genera un testo generico di 1000 parole senza indicare il destinatario né il settore di riferimento."')
        ],
        'explanation': "La formula RCCF garantisce che il modello riceva tutte le coordinate necessarie per un output calibrato e professionale senza genericità."
    },
    {
        'num': '4',
        'module': 'Modulo 6: L\'Arte dell\'Iterazione e del Raffinamento',
        'q': 'Perché nel lavoro professionale con gli LLM il primo output generato non va quasi mai considerato definitivo?',
        'options': [
            (True, "Perché l'interazione con l'IA è un processo dialogico e cooperativo: il primo output serve come bozza su cui applicare feedback mirati (es. calibrare il tono, correggere un punto, aggiungere obiezioni)."),
            (False, "Perché i modelli di intelligenza artificiale sbagliano intenzionalmente la prima risposta per consumare crediti."),
            (False, "Perché la prima risposta viene sempre cancellata automaticamente dai server dopo 30 secondi."),
            (False, "Perché è obbligatorio per legge riformulare la domanda almeno tre volte.")
        ],
        'explanation': "L'iterazione a più passaggi permette di perfezionare stile, lunghezza e accuratezza del testo finale."
    },
    {
        'num': '5',
        'module': 'Modulo 7: Confronto Tool e Motori di Ricerca AI',
        'q': 'Quale tra i seguenti strumenti è la scelta ottimale se devi svolgere una ricerca di mercato aggiornata con citazione verificabile delle fonti web in tempo reale?',
        'options': [
            (True, "Perplexity AI (grazie all'indice con motore di ricerca integrato e link diretti alle fonti)."),
            (False, "Un generatore di immagini grafiche come Midjourney."),
            (False, "Un software offline senza connessione internet."),
            (False, "Un programma per la registrazione audio di note vocali.")
        ],
        'explanation': "Perplexity AI è specializzato nella ricerca informativa con citazione puntuale e verificabile delle fonti web."
    },
    {
        'num': '6',
        'module': 'Modulo 8: Scrivere senza Sforzo e Adattamento Tono di Voce',
        'q': 'Per adattare rapidamente una comunicazione commerciale formale per un consiglio di amministrazione rispetto a un post per Instagram, su quale parametro occorre intervenire?',
        'options': [
            (True, 'Sul "Tono di Voce" (Tone of Voice) e sui vincoli di sintesi, specificando all\'IA il pubblico di destinazione (B2B executive vs social informale).'),
            (False, "Sulla velocità del processore del computer."),
            (False, "Sulla dimensione dello schermo su cui si legge la risposta."),
            (False, "Sul colore dei caratteri usati nella finestra di chat.")
        ],
        'explanation': "Guidare l'IA sul registro linguistico (Tone of Voice) consente di rimodulare il medesimo concetto su canali e target differenti."
    },
    {
        'num': '7',
        'module': 'Modulo 9 & 10: Prompt Visivo & Creazione Immagini AI',
        'q': 'Quali elementi costituiscono l\'anatomia di un prompt descrittivo efficace per la generazione di un visual professionale fotorealistico?',
        'options': [
            (True, "Soggetto dettagliato + Ambiente/Sfondo + Illuminazione specifica (es. luce volumetrica, golden hour) + Stile/Inquadratura (es. 85mm lens, grandangolo, close-up) + Dettagli di finitura puliti."),
            (False, 'Inserire solo parole generiche e astratte come "immagine bellissima, stupenda, capolavoro 8K".'),
            (False, "Scrivere il prompt in latino antico per rendere l'immagine più classica."),
            (False, "Non specificare mai l'illuminazione per lasciare che il computer decida a caso.")
        ],
        'explanation': "Aggettivi vaghi non funzionano nei modelli text-to-image: servono dettagli compositivi precisi di ottica, luce e ambientazione."
    },
    {
        'num': '8',
        'module': 'Modulo 11: Presentazioni e Pitch Esecutivi',
        'q': 'Qual è la struttura narrativa raccomandata per far generare all\'IA la scaletta di un pitch o presentazione aziendale ad alto impatto?',
        'options': [
            (True, "La triade logica: 1. Identificazione del Problema/Collo di bottiglia -> 2. Presentazione della Soluzione e Benefici quantificabili -> 3. Call to Action e Prossimi Passi."),
            (False, "Inserire 50 slide piene di testo fitto e grafici non commentati."),
            (False, "Parlare solo della storia dell'azienda dal 1950 senza mai citare il cliente o il problema."),
            (False, "Evitare qualsiasi conclusione o richiesta di contatto a fine presentazione.")
        ],
        'explanation': "La struttura Problem-Solution-CTA è lo standard esecutivo per presentazioni chiare e persuasive."
    },
    {
        'num': '9',
        'module': 'Modulo 12: Analisi Dati e Formule per Fogli di Calcolo',
        'q': 'Come può l\'IA supportare un professionista nella gestione avanzata di fogli di calcolo Excel o Google Sheets?',
        'options': [
            (True, "Spiegando e scrivendo formule complesse (es. CERCA.X, matriciali nidificate), generando script VBA/Apps Script e individuando anomalie o valori duplicati."),
            (False, "Sostituendo il mouse e la tastiera con un comando vocale non modificabile."),
            (False, "Cancellando i dati numerici e lasciando solo i testi."),
            (False, "Impedendo di stampare o esportare i fogli in formato PDF.")
        ],
        'explanation': "L'IA eccelle nella scrittura di macro, formule analitiche avanzate e pulizia logica di dataset."
    },
    {
        'num': '10',
        'module': 'Modulo 13: L\'Agenda Intelligente e Gestione del Tempo',
        'q': 'In che modo l\'IA può essere utilizzata come assistente esecutivo per il Time Management personale?',
        'options': [
            (True, "Organizzando un elenco disordinato di attività secondo la matrice di Eisenhower (Urgente vs Importante) e strutturandole in blocchi orari concentrati (Time-Boxing)."),
            (False, "Inviando email di disdetta a tutti gli appuntamenti del calendario senza avvisare."),
            (False, "Posticipando automaticamente tutte le scadenze al mese successivo."),
            (False, "Obbligando l'utente a lavorare 24 ore su 24 senza pause.")
        ],
        'explanation': "L'IA permette di categorizzare le priorità giornaliere e strutturare la settimana in blocchi produttivi concentrati."
    },
    {
        'num': '11',
        'module': 'Modulo 14: Apprendimento Rapido & Metodo ELI5',
        'q': 'In cosa consiste la tecnica "ELI5" (Explain Like I\'m 5) e quando è utile in azienda?',
        'options': [
            (True, "Nel farsi spiegare un concetto normativo, finanziario o tecnico complesso attraverso metafore semplici e quotidiane, per poi poterlo comunicare chiaramente a clienti o colleghi."),
            (False, "Nel parlare ai clienti con voce infantile durante le riunioni di lavoro."),
            (False, "Nel rifiutarsi di imparare nuovi strumenti software dopo i 5 anni di anzianità aziendale."),
            (False, "Nel limitare la lunghezza di qualsiasi documento a sole 5 parole.")
        ],
        'explanation': "Il metodo ELI5 e la tecnica di Feynman decostruiscono concetti complessi in metafore intuitive."
    },
    {
        'num': '12',
        'module': 'Modulo 15: Allucinazioni & Grounding Documentale',
        'q': 'Cosa sono le "Allucinazioni" dell\'IA e qual è la tecnica più efficace (Grounding) per neutralizzarle su documenti importanti?',
        'options': [
            (True, "Le allucinazioni sono risposte false o inventate generate con sicurezza dal modello; si prevengono fornendo il documento di partenza e ordinando all'IA di rispondere basandosi solo sul testo allegato."),
            (False, "Le allucinazioni sono difetti visivi del monitor del computer; si risolvono pulendo lo schermo."),
            (False, "Le allucinazioni capitano solo quando si spegne la luce della stanza."),
            (False, "Le allucinazioni si eliminano cancellando la cronologia internet del browser.")
        ],
        'explanation': "Il Grounding vincola l'elaborazione dell'IA al contesto documentale fornito, azzerando le allucinazioni."
    },
    {
        'num': '13',
        'module': 'Modulo 16: Privacy, GDPR & Sicurezza dei Dati Aziendali',
        'q': 'Quali precauzioni pratiche deve adottare un\'azienda quando i dipendenti utilizzano strumenti di IA generativa per tutelare il GDPR e i dati confidenziali?',
        'options': [
            (True, "Disattivare il salvataggio cronologia per l'addestramento pubblico nelle impostazioni, anonimizzare i dati sensibili (PII, dati finanziari) ed evitare di condividere credenziali o segreti industriali."),
            (False, "Incollare codici bancari e password dei clienti nelle chat pubbliche per comodità."),
            (False, "Condividere il medesimo account gratuito tra tutti i dipendenti senza password."),
            (False, "Non impostare alcuna regola aziendale e lasciare l'utilizzo totalmente privo di linee guida.")
        ],
        'explanation': "L'adozione sicura dell'IA in azienda richiede policy chiare su GDPR, anonimizzazione dei dati e opt-out dal training pubblico."
    },
    {
        'num': '14',
        'module': 'Modulo 18: Creare il proprio Workflow & Custom Instructions',
        'q': 'A cosa servono le "Custom Instructions" (Istruzioni Personalizzate) disponibili nelle impostazioni dei moderni strumenti di IA?',
        'options': [
            (True, "A memorizzare in modo permanente chi sei (ruolo, settore aziendale) e come desideri le risposte (tono, formattazione, vincoli), evitando di doverlo rispiegare ad ogni nuova conversazione."),
            (False, "A velocizzare la scheda grafica del computer durante i videogiochi."),
            (False, "A cambiare la lingua della tastiera del computer ogni 10 minuti."),
            (False, "A impedire l'apertura di altre schede nel browser internet.")
        ],
        'explanation': "Le Custom Instructions mantengono persistente il contesto dell'utente per risposte sempre su misura."
    },
    {
        'num': '15',
        'module': 'Modulo 1, 17 & 20: Il Professionista Potenziato & Centralità Umana',
        'q': 'Qual è la vera chiave di successo e il ruolo irrinunciabile dell\'essere umano nell\'era dell\'Intelligenza Artificiale?',
        'options': [
            (True, 'Agire da "Direttore d\'Orchestra": guidare l\'IA con pensiero critico, definire la visione strategica, validare eticamente i risultati e coltivare l\'empatia e la relazione umana di valore con le persone.'),
            (False, "Cercare di competere con l'IA nella velocità di digitazione meccanica di testi."),
            (False, "Rifiutare l'uso della tecnologia sperando che il mercato non cambi."),
            (False, "Delegare all'IA qualsiasi decisione legale ed economica senza mai rileggere o verificare.")
        ],
        'explanation': "L'IA è un amplificatore del talento umano: la strategia, il giudizio critico e l'empatia rimangono prerogative insostituibili dell'operatore umano."
    }
]

for item in questions:
    p_q = doc.add_paragraph()
    r_num = p_q.add_run(f"Domanda {item['num']}. ")
    r_num.bold = True
    r_num.font.size = Pt(11)
    
    r_mod = p_q.add_run(f"[{item['module']}]\n")
    r_mod.italic = True
    r_mod.font.color.rgb = RGBColor(100, 116, 139)
    
    r_text = p_q.add_run(item['q'])
    r_text.bold = True
    r_text.font.size = Pt(11)
    
    opt_letters = ['A', 'B', 'C', 'D']
    for idx, (is_correct, opt_text) in enumerate(item['options']):
        p_opt = doc.add_paragraph()
        p_opt.paragraph_format.left_indent = Inches(0.25)
        
        if is_correct:
            r_mark = p_opt.add_run(f"[X]  {opt_letters[idx]})  {opt_text}  (RISPOSTA CORRETTA)")
            r_mark.bold = True
            r_mark.font.color.rgb = RGBColor(16, 128, 67)
        else:
            r_mark = p_opt.add_run(f"[  ]  {opt_letters[idx]})  {opt_text}")
            r_mark.font.color.rgb = RGBColor(51, 65, 85)
            
    p_exp = doc.add_paragraph()
    p_exp.paragraph_format.left_indent = Inches(0.25)
    r_exp_title = p_exp.add_run('Spiegazione didattica: ')
    r_exp_title.italic = True
    r_exp_title.font.size = Pt(9.5)
    r_exp_title.font.color.rgb = RGBColor(100, 116, 139)
    
    r_exp = p_exp.add_run(item['explanation'] + '\n')
    r_exp.italic = True
    r_exp.font.size = Pt(9.5)
    r_exp.font.color.rgb = RGBColor(100, 116, 139)

output_path = '/Users/marco/Sviluppo/Progetti/Prgetto piattaforma lavoro condivisa/public/dispense/TEST_VALUTAZIONE_FINALE_ATOMA.docx'
doc.save(output_path)
print('DOCX successfully created at:', output_path)

# Copy to Downloads for easy email attachment
downloads_path = os.path.expanduser('~/Downloads/TEST_VALUTAZIONE_FINALE_ATOMA.docx')
shutil.copy(output_path, downloads_path)
print('DOCX copied to Downloads:', downloads_path)

# Save also in Obsidian KnowledgeBase
obsidian_dir = '/Users/marco/Library/Mobile Documents/iCloud~md~obsidian/Documents/KnowledgeBase/01_Progetti/Aiutiamoci_Academy'
os.makedirs(obsidian_dir, exist_ok=True)
obsidian_docx = os.path.join(obsidian_dir, 'TEST_VALUTAZIONE_FINALE_ATOMA.docx')
shutil.copy(output_path, obsidian_docx)
print('DOCX successfully copied to Obsidian:', obsidian_docx)
