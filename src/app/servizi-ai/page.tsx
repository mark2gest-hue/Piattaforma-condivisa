'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  Zap,
  Image as ImageIcon,
  ChefHat,
  HeartPulse,
  BookOpen,
  CheckCircle2,
  Coins,
  CreditCard,
  ArrowRight,
  ShieldCheck,
  Check,
  Wand2,
  RefreshCcw,
  Sliders,
  ExternalLink,
  Lock,
  PhoneCall,
  Search,
  Sparkles,
  Upload,
  FileSpreadsheet,
  Film,
  Mic,
  Type,
  Clock,
  User,
  Download,
  Copy,
  Plus
} from 'lucide-react';

interface ToolService {
  id: string;
  category: 'famiglia' | 'casa' | 'professionale';
  title: string;
  badge: string;
  creditsCost: number;
  previewType: 'bolletta' | 'ricetta' | 'foto' | 'medico' | 'favola' | 'fattura' | 'video' | 'preventivo' | 'sollecito' | 'audio' | 'bando' | 'tasse';
  tagline: string;
  description: string;
  realWorldOutcome: string;
  targetAudience: string;
  popular?: boolean;
}

const TOOL_SERVICES: ToolService[] = [
  {
    id: 'bollette',
    category: 'casa',
    title: 'Analisi & Tutela Bollette',
    badge: 'Difesa Consumatore',
    creditsCost: 2,
    previewType: 'bolletta',
    tagline: 'Scova costi nascosti, spiega cosa paghi e prepara il reclamo',
    description: 'Invia una foto della bolletta (luce, gas o telefono). Il sistema estrae il costo reale al kWh/Smc, rileva eventuali voci indebite e scrive una lettera di reclamo formale pronta da firmare.',
    realWorldOutcome: 'Media risparmio stimata: €180/anno su bollette domestiche errate.',
    targetAudience: 'Famiglie, pensionati, consumatori',
    popular: true,
  },
  {
    id: 'frigo',
    category: 'casa',
    title: 'Dispensa & Cucina Anti-Spreco',
    badge: 'Zero Sprechi',
    creditsCost: 1,
    previewType: 'ricetta',
    tagline: 'Fotografa cosa hai in casa ➔ 2 ricette sane in 15 minuti',
    description: 'Basta scattare una foto al frigo o digitare 3 ingredienti dimenticati: genera menu bilanciati senza costringerti a fare la spesa, con tempi di cottura e calorie esatte.',
    realWorldOutcome: 'Niente più cibo buttato via e cena pronta senza stress.',
    targetAudience: 'Chiunque cucini tutti i giorni',
  },
  {
    id: 'foto-restauro',
    category: 'famiglia',
    title: 'Archivio Storico & Restauro Ricordi',
    badge: 'Memoria di Famiglia',
    creditsCost: 3,
    previewType: 'foto',
    tagline: 'Rinnova vecchie foto di famiglia in bianco e nero o danneggiate',
    description: 'Algoritmo dedicato di pulizia granulosità, rimozione graffi da scansione e colorazione filologica dei volti e dei tessuti. Restituisce il file restaurato in formato stampa ad alta risoluzione.',
    realWorldOutcome: 'Un regalo di valore inestimabile per figli, nipoti e genitori.',
    targetAudience: 'Famiglie, nonni, appassionati di storia familiare',
    popular: true,
  },
  {
    id: 'medico',
    category: 'famiglia',
    title: 'Mediatore Referti & Lettere Burocratiche',
    badge: 'Chiarezza Senza Ansia',
    creditsCost: 2,
    previewType: 'medico',
    tagline: 'Traduce lettere dell’INPS, tasse ed esami in italiano chiaro',
    description: 'Spesso la burocrazia italiana e i referti usano linguaggi allarmanti. Il sistema sintetizza il significato pratico in 4 righe ed evidenzia le 3 domande precise da porre al proprio medico o commercialista.',
    realWorldOutcome: 'Nessun dubbio o ansia: sai esattamente di cosa si tratta.',
    targetAudience: 'Cittadini, lavoratori, pensionati',
  },
  {
    id: 'favole',
    category: 'famiglia',
    title: 'Storie & Fiabe Illustrate per Bambini',
    badge: 'Didattica & Buonanotte',
    creditsCost: 4,
    previewType: 'favola',
    tagline: 'Crea una fiaba personalizzata con il nome e i sogni del tuo bambino',
    description: 'Inserisci il nome del bambino e una tematica (es. coraggio, amicizia, rispetto per la natura). Genera una favola in 4 capitoli con illustrazioni coerenti in stile acquerello, pronta da stampare come libretto.',
    realWorldOutcome: 'Il libro della buonanotte unico al mondo con il bimbo protagonista.',
    targetAudience: 'Genitori, nonni, educatori',
  },
  {
    id: 'ocr-pro',
    category: 'professionale',
    title: 'Estrattore Tabellare Fatture & Scontrini',
    badge: 'Amministrazione Snella',
    creditsCost: 3,
    previewType: 'fattura',
    tagline: 'Da foto e PDF cartacei a foglio Excel compilato con P.IVA e totali',
    description: 'Fotografa fatture, scontrini e ricevute fiscali: il modello estrae data, ragione sociale, imponibile, aliquota IVA e totale, esportando direttamente un file CSV/Excel pulito per il commercialista.',
    realWorldOutcome: 'Risparmia fino a 4 ore settimanali di battitura manuale.',
    targetAudience: 'Partite IVA, artigiani, piccoli commercianti',
  },
  {
    id: 'preventivi-blindati',
    category: 'professionale',
    title: 'Preventivatore Blindato & Clausole Extra',
    badge: 'Tutela Compensi',
    creditsCost: 2,
    previewType: 'preventivo',
    tagline: 'Preventivi formali con clausola anti-fuori-sacco e acconto 30%',
    description: 'Inserisci oggetto dell’incarico, compenso e tempi di consegna. Genera un preventivo formale con clausola anti-modifiche gratuite (extra tariffati a parte), acconto obbligatorio e recesso.',
    realWorldOutcome: 'Basta contestazioni su ore extra e acconto garantito prima di iniziare.',
    targetAudience: 'Freelance, artigiani, consulenti, sviluppatori, grafici',
    popular: true,
  },
  {
    id: 'solleciti-pagamento',
    category: 'professionale',
    title: 'Recupero Crediti & Solleciti in 3 Livelli',
    badge: 'Incasso Puntuale',
    creditsCost: 1,
    previewType: 'sollecito',
    tagline: 'Dal promemoria cordiale alla diffida formale D.Lgs. 231/02',
    description: 'Inserisci numero fattura, importo e giorni di ritardo. Genera 3 bozze graduate: 1) Promemoria amichevole, 2) Sollecito amministrativo con IBAN, 3) Messa in mora con interessi legali.',
    realWorldOutcome: 'Incassa fatture scadute senza attriti inutili né spese legali.',
    targetAudience: 'Partite IVA, studi professionali, PMI',
  },
  {
    id: 'audio-verbale',
    category: 'professionale',
    title: 'Da Vocale WhatsApp a Verbale & Task',
    badge: 'Zero Confusione',
    creditsCost: 2,
    previewType: 'audio',
    tagline: 'Trasforma vocali lunghi in to-do list e messaggio di conferma per il cliente',
    description: 'Invia l’audio del cliente o incolla il testo. Estrae i punti chiave concordati, la lista operativa delle cose da fare e redige il messaggio WhatsApp di conferma da rimandare al cliente per blindare l’accordo.',
    realWorldOutcome: 'Niente più fraintendimenti o richieste arbitrarie a voce.',
    targetAudience: 'Artigiani, agenzie, project manager, liberi professionisti',
    popular: true,
  },
  {
    id: 'scanner-bandi',
    category: 'professionale',
    title: 'Scanner Bandi & Fondo Perduto PMI',
    badge: 'Finanza Agevolata',
    creditsCost: 3,
    previewType: 'bando',
    tagline: 'Da PDF ministeriali di 60 pagine a sintesi operativa in 1 pagina',
    description: 'Carica il PDF del bando regionale, CCIAA o Invitalia. Estrae in 60 secondi: requisiti ATECO, percentuale a fondo perduto, spese ammesse, scadenze e documentazione necessaria.',
    realWorldOutcome: 'Capisci subito se puoi partecipare prima di pagare un consulente.',
    targetAudience: 'Piccole imprese, commercianti, artigiani, startup',
  },
  {
    id: 'calcolo-netto-tasse',
    category: 'professionale',
    title: 'Calcolatore Netto & Riserva Tasse F24',
    badge: 'Pianificazione Fiscale',
    creditsCost: 1,
    previewType: 'tasse',
    tagline: 'Quanto puoi spendere davvero e quanto accantonare per l’F24',
    description: 'Inserisci il fatturato incassato e il tuo regime fiscale (Forfettario 5%/15% o Semplificato). Calcola al centesimo la riserva tasse/INPS da non toccare e il netto reale in tasca.',
    realWorldOutcome: 'Zero sorprese e ansia al momento del saldo F24 di giugno e novembre.',
    targetAudience: 'Nuovi forfettari, professionisti, freelance',
  },
  {
    id: 'video-reel',
    category: 'professionale',
    title: 'Studio Sintesi Video con Voce e Sottotitoli',
    badge: 'Comunicazione',
    creditsCost: 8,
    previewType: 'video',
    tagline: 'Da testo a video verticale 9:16 per Instagram e WhatsApp con audio naturale',
    description: 'Inserisci un messaggio o un consiglio professionale: il motore seleziona sequenze video HD, monta la traccia vocale naturale in italiano e inserisce sottotitoli a comparsa ad alto impatto.',
    realWorldOutcome: 'Presenza video costante e curata senza bisogno di agenzie video.',
    targetAudience: 'Liberi professionisti, attività locali, formatori',
  },
];

const CREDIT_PACKAGES = [
  {
    id: 'pack-starter',
    name: 'Ricarica Base',
    credits: 25,
    priceEur: 5.00,
    pricePerCredit: '€0,20 / operazione',
    description: 'Perfetto per svolgere 10-12 operazioni senza abbonamento.',
    badge: 'Senza Impegno',
  },
  {
    id: 'pack-family',
    name: 'Ricarica Consigliata',
    credits: 80,
    bonusCredits: '+15 Crediti Omaggio',
    priceEur: 12.00,
    pricePerCredit: '€0,12 / operazione',
    description: 'La soluzione ideale per la gestione della casa e dei ricordi.',
    popular: true,
    badge: 'Più Scelto',
  },
  {
    id: 'pack-pro',
    name: 'Ricarica Business',
    credits: 250,
    bonusCredits: '+50 Crediti Omaggio',
    priceEur: 29.00,
    pricePerCredit: '€0,09 / operazione',
    description: 'Per piccoli studi, professionisti e usi intensivi quotidiani.',
    badge: 'Miglior Tariffa',
  },
];

export default function ServiziAIPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('tutti');
  const [activeTab, setActiveTab] = useState<'servizi' | 'crediti' | 'trasparenza'>('servizi');
  const [simulatedUserCredits, setSimulatedUserCredits] = useState<number>(10);
  const [activeModalTool, setActiveModalTool] = useState<ToolService | null>(null);
  const [simulationStatus, setSimulationStatus] = useState<'idle' | 'running' | 'success'>('idle');

  // Modal input states
  const [modalInputMode, setModalInputMode] = useState<'upload' | 'text'>('text');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  // Form states specifici per ogni tool
  const [billProvider, setBillProvider] = useState<string>('Enel Energia');
  const [billAmount, setBillAmount] = useState<string>('240.50');
  const [billNotes, setBillNotes] = useState<string>('Bolletta bimestrale luce, sospetto costi elevati su spese trasporto e oneri.');

  const [frigoIngredients, setFrigoIngredients] = useState<string>('3 uova, 1 zucchina, mezza confezione di ricotta aperta, pasta corta, parmigiano');
  const [frigoTime, setFrigoTime] = useState<'15min' | '30min' | 'forno'>('15min');

  const [restoreColorize, setRestoreColorize] = useState<boolean>(true);
  const [restoreFixDamages, setRestoreFixDamages] = useState<boolean>(true);
  const [restoreUltraHd, setRestoreUltraHd] = useState<boolean>(true);

  const [medicalText, setMedicalText] = useState<string>('Referto ecografico: quadro morfologico con modesta alterazione disomogenea priva di formazioni nodulari espansive o addensamenti focali.');
  
  const [kidName, setKidName] = useState<string>('Leonardo');
  const [kidAge, setKidAge] = useState<string>('6');
  const [storyTopic, setStoryTopic] = useState<string>('Un cagnolino coraggioso che costruisce un razzo per esplorare la luna');
  const [storyMoral, setStoryMoral] = useState<string>('Superare la paura del buio e aiutare i compagni in difficoltà');
  const [storyStyle, setStoryStyle] = useState<string>('Acquerello Dolce');

  const [ocrExportFormat, setOcrExportFormat] = useState<'excel' | 'csv' | 'json'>('excel');

  // Nuovi Tool P.IVA
  const [quoteClient, setQuoteClient] = useState<string>('Studio Tecnico Ing. Bianchi');
  const [quoteJob, setQuoteJob] = useState<string>('Rifacimento impianto elettrico e certificazione di conformità');
  const [quoteAmount, setQuoteAmount] = useState<string>('2400');
  const [quoteDepositPercent, setQuoteDepositPercent] = useState<string>('30');
  const [quoteExtraHourly, setQuoteExtraHourly] = useState<string>('45');

  const [sollecitoClient, setSollecitoClient] = useState<string>('Azienda Meccanica SPA');
  const [sollecitoInvoiceNum, setSollecitoInvoiceNum] = useState<string>('FATT-2026/08');
  const [sollecitoAmount, setSollecitoAmount] = useState<string>('1850.00');
  const [sollecitoDaysLate, setSollecitoDaysLate] = useState<string>('28');
  const [sollecitoLevel, setSollecitoLevel] = useState<'amichevole' | 'formale' | 'diffida'>('formale');

  const [audioTranscript, setAudioTranscript] = useState<string>('Ciao Marco, ho visto la prima bozza del lavoro. Mi raccomando ricordati di cambiare i colori della testata entro giovedì sera e inserire il pulsante di pagamento. Ci sentiamo venerdì mattina per la consegna finale.');

  const [bandoAteco, setBandoAteco] = useState<string>('62.01 (Servizi Digitali / Sviluppo Software)');
  const [bandoRegion, setBandoRegion] = useState<string>('Regione Lombardia / Bando Transizione Digitale');

  const [taxGrossAmount, setTaxGrossAmount] = useState<string>('4500');
  const [taxRegime, setTaxRegime] = useState<'forfettario5' | 'forfettario15' | 'ordinario'>('forfettario5');
  const [taxAtecoPercent, setTaxAtecoPercent] = useState<string>('78');

  const [videoScript, setVideoScript] = useState<string>('3 consigli pratici per scegliere la tariffa luce ideale ed evitare le trappole del mercato libero nel 2026.');
  const [videoVoice, setVideoVoice] = useState<string>('Marco (Calda & Professionale)');
  const [videoSubtitleStyle, setVideoSubtitleStyle] = useState<string>('TikTok Giallo Evidenziato');

  const filteredTools = selectedCategory === 'tutti'
    ? TOOL_SERVICES
    : TOOL_SERVICES.filter((t) => t.category === selectedCategory);

  const handleSimulateTool = (tool: ToolService) => {
    setActiveModalTool(tool);
    setSimulationStatus('idle');
    setUploadedFileName(null);
    // Imposta il default più logico per il tipo di tool
    if (
      tool.id === 'favole' ||
      tool.id === 'video-reel' ||
      tool.id === 'preventivi-blindati' ||
      tool.id === 'solleciti-pagamento' ||
      tool.id === 'calcolo-netto-tasse'
    ) {
      setModalInputMode('text');
    } else if (tool.id === 'foto-restauro' || tool.id === 'ocr-pro' || tool.id === 'scanner-bandi') {
      setModalInputMode('upload');
    } else {
      setModalInputMode('text');
    }
  };

  const handleExecuteSimulation = () => {
    if (!activeModalTool) return;
    if (simulatedUserCredits < activeModalTool.creditsCost) {
      alert('Crediti insufficienti. Ricarica il tuo borsellino nella scheda Crediti.');
      return;
    }
    setSimulationStatus('running');
    setTimeout(() => {
      setSimulatedUserCredits((prev) => prev - activeModalTool.creditsCost);
      setSimulationStatus('success');
    }, 1600);
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 selection:bg-indigo-500 selection:text-white font-sans antialiased relative overflow-x-hidden">
      
      {/* Background Cyber-Industrial Glowing Ambient Gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/3 w-[650px] h-[500px] bg-gradient-to-br from-indigo-600/15 via-blue-600/10 to-transparent rounded-full blur-[140px]" />
        <div className="absolute top-1/3 -right-32 w-[550px] h-[450px] bg-gradient-to-tl from-cyan-600/10 via-indigo-600/10 to-transparent rounded-full blur-[130px]" />
        <div className="absolute -bottom-20 left-10 w-[600px] h-[400px] bg-gradient-to-tr from-emerald-600/10 via-slate-900 to-transparent rounded-full blur-[140px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_30%,#000_70%,transparent_100%)]" />
      </div>

      {/* Top Bar Cyber-Glassmorphism */}
      <header className="sticky top-0 z-40 bg-[#07090e]/80 backdrop-blur-xl border-b border-slate-800/80 transition-all duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="group flex items-center gap-3 transition-transform active:scale-[0.98]">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-blue-700 text-white font-black flex items-center justify-center text-sm tracking-tight shadow-[0_0_25px_rgba(99,102,241,0.4)] group-hover:shadow-[0_0_35px_rgba(99,102,241,0.65)] group-hover:scale-105 transition-all border border-indigo-400/30">
                AI
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base tracking-tight text-white flex items-center gap-2">
                  AIutiamoci <span className="text-[10px] font-mono font-semibold uppercase bg-indigo-950/80 border border-indigo-800/60 text-indigo-300 px-2 py-0.5 rounded-full tracking-wider shadow-inner">Hub Servizi</span>
                </span>
                <span className="text-xs text-slate-400 font-normal">Intelligenza Pratica per la Vita Reale</span>
              </div>
            </Link>
          </div>

          {/* Saldo Borsellino Utente Interattivo */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 bg-slate-900/90 hover:bg-slate-900 border border-indigo-900/40 hover:border-indigo-700/60 rounded-full px-4 py-1.5 shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-all duration-200">
              <div className="relative flex items-center justify-center">
                <span className="absolute w-2 h-2 rounded-full bg-amber-400/60 animate-ping" />
                <Coins className="w-4 h-4 text-amber-400 relative z-10" />
              </div>
              <span className="text-xs text-slate-400 font-mono">Borsellino:</span>
              <span className="text-xs font-bold text-amber-300 tracking-tight tabular-nums">{simulatedUserCredits} Crediti</span>
              <div className="w-[1px] h-3 bg-slate-800" />
              <button
                onClick={() => setActiveTab('crediti')}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors underline-offset-2 hover:underline"
              >
                + Ricarica
              </button>
            </div>

            <Link
              href="/growth-studio"
              className="text-xs font-bold text-emerald-300 hover:text-white bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 px-3.5 py-2 rounded-xl transition-all duration-200 hidden sm:inline-flex items-center gap-1.5 active:scale-[0.97] shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Studio Social</span>
            </Link>

            <Link
              href="/corsi"
              className="text-xs font-semibold text-slate-200 hover:text-white bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 px-4 py-2 rounded-xl transition-all duration-200 hidden sm:inline-block active:scale-[0.97] shadow-sm"
            >
              Area Corsisti
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section Cyber-Industrial: Slate & Indigo Gradient Focus */}
      <section className="relative z-10 pt-16 pb-12 px-4 sm:px-6 border-b border-slate-800/80">
        <div className="max-w-4xl mx-auto text-center">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-950/60 text-indigo-300 text-xs font-mono uppercase tracking-widest mb-6 shadow-[0_0_20px_rgba(99,102,241,0.15)] backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Zero Teoria Astratta <span className="text-indigo-600 mx-2">•</span> 100% Utilità Quotidiana</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6 leading-[1.12] text-balance">
            L’Intelligenza Artificiale applicata alle <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-blue-200 to-cyan-300">
              esigenze reali di ogni giorno
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10 font-normal text-balance">
            Dalla lettura semplificata delle bollette e dei referti medici, fino al restauro dei ricordi di famiglia e all’estrazione dei documenti di lavoro. Soluzioni con un clic, senza dover imparare a programmare.
          </p>

          {/* Navigazione a Schede Segmented Cyber-Pills */}
          <div className="inline-flex p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800/90 text-xs sm:text-sm font-semibold shadow-2xl backdrop-blur-xl">
            <button
              onClick={() => setActiveTab('servizi')}
              className={`relative px-5 py-2.5 rounded-xl transition-all duration-200 ${
                activeTab === 'servizi'
                  ? 'bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)] border border-indigo-400/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              Catalogo Servizi ({TOOL_SERVICES.length})
            </button>
            <button
              onClick={() => setActiveTab('crediti')}
              className={`relative px-5 py-2.5 rounded-xl transition-all duration-200 ${
                activeTab === 'crediti'
                  ? 'bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)] border border-indigo-400/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              Borsellino Crediti
            </button>
            <button
              onClick={() => setActiveTab('trasparenza')}
              className={`relative px-5 py-2.5 rounded-xl transition-all duration-200 ${
                activeTab === 'trasparenza'
                  ? 'bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)] border border-indigo-400/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              Abbonamento & Modelli (BYOK)
            </button>
          </div>
        </div>
      </section>

      {/* Corpo Principale */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">

        {/* ======================================================================= */}
        {/* SEZIONE 1: CATALOGO SERVIZI                                             */}
        {/* ======================================================================= */}
        {activeTab === 'servizi' && (
          <div>
            {/* Filtro Semplificato con Segmented Cyber-Pills */}
            <div className="flex items-center justify-between flex-wrap gap-4 mb-8 border-b border-slate-800/80 pb-5">
              <div className="flex items-center gap-1.5 p-1.5 bg-slate-900/80 border border-slate-800/90 rounded-xl text-xs backdrop-blur-md shadow-inner">
                <span className="text-[11px] text-slate-400 font-mono uppercase px-2.5 py-1">Ambito:</span>
                {[
                  { id: 'tutti', label: 'Tutti i Servizi' },
                  { id: 'casa', label: 'Casa & Risparmio' },
                  { id: 'famiglia', label: 'Famiglia & Salute' },
                  { id: 'professionale', label: 'Lavoro & P.IVA' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                      selectedCategory === cat.id
                        ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)] border border-indigo-400/50'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <div className="text-xs text-slate-400 font-mono flex items-center gap-2 bg-slate-900/60 border border-slate-800/80 px-3 py-1.5 rounded-xl">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                Costo per operazione: <span className="text-indigo-300 font-bold">1 - 4 crediti</span> (€0,12 - €0,48)
              </div>
            </div>

            {/* Grid dei Servizi con Cyber-Industrial Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredTools.map((tool) => (
                <div
                  key={tool.id}
                  className="group relative rounded-2xl bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-[#0b0f19] border border-slate-800/90 hover:border-indigo-500/50 transition-all duration-300 p-5 flex flex-col justify-between hover:shadow-[0_10px_35px_rgba(79,70,229,0.15)] hover:-translate-y-1"
                >
                  {/* Neon Top Highlight Accent */}
                  <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent group-hover:via-indigo-400/80 transition-all" />

                  <div>
                    {/* Header Card */}
                    <div className="flex items-center justify-between gap-2 mb-3.5">
                      <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full border border-indigo-900/50 bg-indigo-950/40 text-indigo-300 font-semibold tracking-wider shadow-inner">
                        {tool.badge}
                      </span>
                      <span className="text-[11px] font-mono font-bold text-amber-300 flex items-center gap-1.5 bg-amber-950/40 border border-amber-800/50 px-2.5 py-0.5 rounded-full shadow-inner">
                        <Coins className="w-3.5 h-3.5 text-amber-400" />
                        {tool.creditsCost} {tool.creditsCost === 1 ? 'Credito' : 'Crediti'}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white mb-2 tracking-tight group-hover:text-indigo-200 transition-colors">
                      {tool.title}
                    </h3>

                    <p className="text-xs text-slate-400 leading-relaxed mb-4 font-normal">
                      {tool.tagline}
                    </p>

                    {/* Anteprima Visiva Terminale Cyber */}
                    <div className="rounded-xl bg-[#04060a] border border-slate-800/90 p-3.5 mb-4 text-[11px] font-mono shadow-inner relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
                      
                      {tool.previewType === 'bolletta' && (
                        <div className="space-y-1.5 relative z-10">
                          <div className="text-slate-400 flex items-center justify-between border-b border-slate-800/80 pb-1.5">
                            <span>Fattura Enel/A2A:</span>
                            <span className="text-rose-400 font-bold">€ 142,30</span>
                          </div>
                          <div className="text-emerald-400 font-sans text-xs flex items-center gap-1.5 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>Spesa non dovuta: €24,50</span>
                          </div>
                          <div className="text-slate-400 text-[10px]">
                            Bozza reclamo generata per storno immediato.
                          </div>
                        </div>
                      )}

                      {tool.previewType === 'ricetta' && (
                        <div className="space-y-1.5 relative z-10">
                          <div className="text-slate-400 border-b border-slate-800/80 pb-1.5">
                            Ingredienti: Uova, Zucchine, Parmigiano
                          </div>
                          <div className="text-emerald-400 font-sans text-xs flex items-center gap-1.5 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>Tortino soffice in padella (15 min)</span>
                          </div>
                          <div className="text-slate-400 text-[10px]">
                            Zero acquisti extra, zero sprechi.
                          </div>
                        </div>
                      )}

                      {tool.previewType === 'foto' && (
                        <div className="space-y-1.5 relative z-10">
                          <div className="text-slate-400 border-b border-slate-800/80 pb-1.5 flex justify-between">
                            <span>Scansione originale:</span>
                            <span className="text-slate-400">B/N Sbiadita</span>
                          </div>
                          <div className="text-emerald-400 font-sans text-xs flex items-center gap-1.5 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>Ripristino volti & Colori storici HD</span>
                          </div>
                          <div className="text-slate-400 text-[10px]">
                            File restaurato a 300 DPI per album o quadro.
                          </div>
                        </div>
                      )}

                      {tool.previewType === 'medico' && (
                        <div className="space-y-1.5 relative z-10">
                          <div className="text-slate-400 border-b border-slate-800/80 pb-1.5">
                            Valutazione referto clinico / INPS:
                          </div>
                          <div className="text-emerald-400 font-sans text-xs flex items-center gap-1.5 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>Sintesi in 3 righe comprensibili</span>
                          </div>
                          <div className="text-slate-400 text-[10px]">
                            + 3 domande mirate per il medico curante.
                          </div>
                        </div>
                      )}

                      {tool.previewType === 'favola' && (
                        <div className="space-y-1.5 relative z-10">
                          <div className="text-slate-400 border-b border-slate-800/80 pb-1.5 flex justify-between">
                            <span>Protagonista:</span>
                            <span className="text-cyan-300 font-semibold">Marco & Il Draghetto</span>
                          </div>
                          <div className="text-emerald-400 font-sans text-xs flex items-center gap-1.5 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>4 Pagine illustrate ad acquerello</span>
                          </div>
                          <div className="text-slate-400 text-[10px]">
                            PDF impaginato per lettura su tablet o stampa.
                          </div>
                        </div>
                      )}

                      {tool.previewType === 'fattura' && (
                        <div className="space-y-1.5 relative z-10">
                          <div className="text-slate-400 border-b border-slate-800/80 pb-1.5 flex justify-between">
                            <span>Documento:</span>
                            <span className="text-cyan-300 font-semibold">Fattura Cartacea #48</span>
                          </div>
                          <div className="text-emerald-400 font-sans text-xs flex items-center gap-1.5 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>Excel: P.IVA, Data, Imponibile, IVA</span>
                          </div>
                          <div className="text-slate-400 text-[10px]">
                            Export .XLS pronto per il commercialista.
                          </div>
                        </div>
                      )}

                      {tool.previewType === 'video' && (
                        <div className="space-y-1.5 relative z-10">
                          <div className="text-slate-400 border-b border-slate-800/80 pb-1.5 flex justify-between">
                            <span>Formato:</span>
                            <span className="text-cyan-300 font-semibold">Reel Verticale 9:16</span>
                          </div>
                          <div className="text-emerald-400 font-sans text-xs flex items-center gap-1.5 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>Voce narrante + B-roll 4K + Subs</span>
                          </div>
                          <div className="text-slate-400 text-[10px]">
                            Pronto da pubblicare su Instagram e WhatsApp.
                          </div>
                        </div>
                      )}

                      {tool.previewType === 'preventivo' && (
                        <div className="space-y-1.5 relative z-10">
                          <div className="text-slate-400 border-b border-slate-800/80 pb-1.5 flex justify-between">
                            <span>Incarico:</span>
                            <span className="text-cyan-300 font-semibold">Lavoro (€2.400)</span>
                          </div>
                          <div className="text-emerald-400 font-sans text-xs flex items-center gap-1.5 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>Acconto 30% + Extra a tariffa</span>
                          </div>
                          <div className="text-slate-400 text-[10px]">
                            Preventivo PDF con clausola anti-fuori-sacco.
                          </div>
                        </div>
                      )}

                      {tool.previewType === 'sollecito' && (
                        <div className="space-y-1.5 relative z-10">
                          <div className="text-slate-400 border-b border-slate-800/80 pb-1.5 flex justify-between">
                            <span>Fattura #08 (ritardo 28gg):</span>
                            <span className="text-rose-400 font-bold">€ 1.850,00</span>
                          </div>
                          <div className="text-emerald-400 font-sans text-xs flex items-center gap-1.5 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>3 Livelli: Promemoria, Sollecito, Diffida</span>
                          </div>
                          <div className="text-slate-400 text-[10px]">
                            Include coordinate bancarie e D.Lgs. 231/02.
                          </div>
                        </div>
                      )}

                      {tool.previewType === 'audio' && (
                        <div className="space-y-1.5 relative z-10">
                          <div className="text-slate-400 border-b border-slate-800/80 pb-1.5 flex justify-between">
                            <span>Vocale WhatsApp:</span>
                            <span className="text-cyan-300 font-semibold">Audio 3 min 40 sec</span>
                          </div>
                          <div className="text-emerald-400 font-sans text-xs flex items-center gap-1.5 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>4 task + Messaggio di conferma</span>
                          </div>
                          <div className="text-slate-400 text-[10px]">
                            Niente più fraintendimenti su cosa fare.
                          </div>
                        </div>
                      )}

                      {tool.previewType === 'bando' && (
                        <div className="space-y-1.5 relative z-10">
                          <div className="text-slate-400 border-b border-slate-800/80 pb-1.5 flex justify-between">
                            <span>Bando Regionale:</span>
                            <span className="text-cyan-300 font-semibold">Fondo Digitale (PDF 64p)</span>
                          </div>
                          <div className="text-emerald-400 font-sans text-xs flex items-center gap-1.5 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>Fondo perduto 50% • ATECO ammessi</span>
                          </div>
                          <div className="text-slate-400 text-[10px]">
                            Scheda 1-pagina con scadenze obbligatorie.
                          </div>
                        </div>
                      )}

                      {tool.previewType === 'tasse' && (
                        <div className="space-y-1.5 relative z-10">
                          <div className="text-slate-400 border-b border-slate-800/80 pb-1.5 flex justify-between">
                            <span>Fattura Incassata:</span>
                            <span className="text-cyan-300 font-semibold">€ 4.500 (Forfettario)</span>
                          </div>
                          <div className="text-emerald-400 font-sans text-xs flex items-center gap-1.5 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>Netto: €3.240 • Riserva F24: €1.260</span>
                          </div>
                          <div className="text-slate-400 text-[10px]">
                            Zero ansia o sorprese alla scadenza tasse.
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Azione di Prova - Button Glow Magnetico */}
                  <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 truncate max-w-[170px]">
                      {tool.targetAudience}
                    </span>
                    <button
                      onClick={() => handleSimulateTool(tool)}
                      className="inline-flex items-center gap-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl shadow-[0_0_15px_rgba(79,70,229,0.35)] transition-all duration-200 active:scale-[0.95] group/btn"
                    >
                      <span>Avvia Tool</span>
                      <ArrowRight className="w-3.5 h-3.5 text-indigo-200 transition-transform duration-200 group-hover/btn:translate-x-1" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================================= */}
        {/* SEZIONE 2: BORSELLINO & RICARICA CREDITI                                */}
        {/* ======================================================================= */}
        {activeTab === 'crediti' && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-1 tracking-tight">
                Ricariche Flessibili a Consumo
              </h2>
              <p className="text-sm text-slate-400">
                Nessun vincolo mensile: i crediti non scadono e possono essere usati liberamente per qualsiasi servizio della piattaforma.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {CREDIT_PACKAGES.map((pack) => (
                <div
                  key={pack.id}
                  className={`relative rounded-2xl p-6 flex flex-col justify-between border transition-all duration-300 hover:-translate-y-1.5 ${
                    pack.popular
                      ? 'bg-gradient-to-b from-indigo-950/80 via-slate-900/90 to-[#0b0f19] border-indigo-500/80 shadow-[0_15px_45px_rgba(79,70,229,0.25)]'
                      : 'bg-gradient-to-b from-slate-900/80 to-[#0b0f19] border-slate-800 hover:border-slate-700 shadow-lg'
                  }`}
                >
                  {pack.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-blue-600 text-white text-[10px] font-mono font-black uppercase tracking-widest px-3.5 py-1 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.6)] border border-indigo-300/40">
                      {pack.badge}
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-bold text-white tracking-tight">{pack.name}</span>
                      {!pack.popular && (
                        <span className="text-[10px] font-mono uppercase bg-slate-800 text-slate-400 px-2.5 py-0.5 rounded-full border border-slate-700/60">
                          {pack.badge}
                        </span>
                      )}
                    </div>

                    <div className="flex items-baseline gap-1.5 mb-1">
                      <span className="text-3xl font-black text-white tracking-tight">€{pack.priceEur.toFixed(2)}</span>
                      <span className="text-xs text-slate-400 font-normal">una tantum</span>
                    </div>

                    <div className="text-xs text-amber-300 font-mono mb-4 font-semibold">
                      {pack.credits} Crediti ({pack.pricePerCredit})
                    </div>

                    {pack.bonusCredits && (
                      <div className="text-xs font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-800/60 px-3 py-1.5 rounded-xl mb-4 flex items-center gap-1.5 shadow-inner">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{pack.bonusCredits}</span>
                      </div>
                    )}

                    <p className="text-xs text-slate-400 mb-6 leading-relaxed font-normal">
                      {pack.description}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      alert(`Ricarica simulata: ${pack.credits} crediti accreditati al tuo saldo!`);
                      setSimulatedUserCredits((prev) => prev + pack.credits);
                    }}
                    className={`w-full py-3 rounded-xl text-xs font-bold transition-all duration-200 active:scale-[0.97] ${
                      pack.popular
                        ? 'bg-gradient-to-r from-indigo-500 to-blue-600 text-white hover:from-indigo-400 hover:to-blue-500 shadow-[0_0_20px_rgba(99,102,241,0.4)]'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                    }`}
                  >
                    Acquista {pack.credits} Crediti
                  </button>
                </div>
              ))}
            </div>

            {/* Nota per gli iscritti al corso */}
            <div className="mt-8 p-4 rounded-2xl border border-indigo-900/40 bg-indigo-950/20 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <span className="font-bold text-white">Iscritto al Corso AI Start o AI Pro?</span> I primi 10 crediti operativi sono già inclusi nel tuo codice studente.
                </div>
              </div>
              <Link
                href="/corsi"
                className="text-indigo-400 hover:text-indigo-300 underline font-semibold whitespace-nowrap"
              >
                Verifica il tuo Codice Corsista ➔
              </Link>
            </div>
          </div>
        )}

        {/* ======================================================================= */}
        {/* SEZIONE 3: ABBONAMENTO & TRASPARENZA TECNICA (BYOK)                     */}
        {/* ======================================================================= */}
        {activeTab === 'trasparenza' && (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-1 tracking-tight">
                Due Modi di Vivere l’Intelligenza Artificiale
              </h2>
              <p className="text-sm text-slate-400">
                Massima comodità chiavi in mano con crediti, oppure totale autonomia senza intermediari.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Opzione 1: Abbonamento Tutor */}
              <div className="rounded-2xl border border-indigo-500/50 bg-gradient-to-b from-indigo-950/40 via-slate-900/80 to-[#0b0f19] p-6 flex flex-col justify-between shadow-[0_10px_35px_rgba(79,70,229,0.15)]">
                <div>
                  <span className="text-[10px] font-mono uppercase bg-indigo-950 border border-indigo-800/60 text-indigo-300 px-2.5 py-1 rounded-full font-bold">
                    Formula Tutor H24
                  </span>
                  <h3 className="text-lg font-bold text-white mt-3 mb-1 tracking-tight">Abbonamento Campus & Tool</h3>
                  <div className="flex items-baseline gap-1.5 mb-1">
                    <span className="text-3xl font-black text-white tracking-tight">€ 9,90</span>
                    <span className="text-xs text-slate-400">/ mese</span>
                  </div>
                  <div className="text-xs text-slate-400 mb-6">Disdici in qualsiasi momento con un clic.</div>

                  <ul className="space-y-3 text-xs text-slate-300 mb-8">
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span><strong>50 Crediti mensili inclusi</strong> per tutti gli strumenti pratici.</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span><strong>Tutor Didattico AI dedicato h24</strong> per chiarire ogni dubbio sulle lezioni.</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Accesso prioritario ai modelli linguistici più recenti.</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Gruppo Community Telegram con i docenti.</span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => alert('Attivazione abbonamento Campus simulata (€9,90/mese con Stripe)')}
                  className="w-full py-3 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all active:scale-[0.97] shadow-[0_0_15px_rgba(79,70,229,0.35)]"
                >
                  Attiva Abbonamento Campus
                </button>
              </div>

              {/* Opzione 2: BYOK Personale */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase bg-slate-800/80 border border-slate-700 text-slate-400 px-2.5 py-1 rounded-full font-semibold">
                    Per Utenti Avanzati
                  </span>
                  <h3 className="text-lg font-bold text-white mt-3 mb-1 tracking-tight">Porta la Tua Chiave (BYOK)</h3>
                  <div className="flex items-baseline gap-1.5 mb-1">
                    <span className="text-3xl font-black text-white tracking-tight">Gratuito</span>
                    <span className="text-xs text-slate-400">sulla nostra piattaforma</span>
                  </div>
                  <div className="text-xs text-slate-400 mb-6">Paghi direttamente il fornitore al costo di costo.</div>

                  <ul className="space-y-3 text-xs text-slate-300 mb-8">
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>Inserisci la tua chiave <strong>OpenRouter</strong> o <strong>DeepSeek</strong>.</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>Costo reale di circa <strong>0,0002€ a risposta</strong> (frazioni di centesimo).</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>Nessuna commissione trattenuta da AIutiamoci.</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>La procedura viene spiegata passo-passo durante il corso.</span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => alert('Apertura pannello inserimento chiave personale')}
                  className="w-full py-3 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all active:scale-[0.97]"
                >
                  Configura Chiave Personale (BYOK)
                </button>
              </div>
            </div>

            {/* Box Etico di Trasparenza */}
            <div className="p-5 rounded-2xl border border-indigo-900/30 bg-slate-900/60 backdrop-blur-md text-xs leading-relaxed text-slate-400">
              <div className="font-bold text-slate-200 mb-1.5 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-400" />
                La nostra politica: Nessun "Lock-In" o costo ingannevole
              </div>
              Crediamo nella vera formazione digitale: a differenza di molti servizi online che nascondono i costi dei modelli AI dietro abbonamenti da 30€ al mese, qui ogni studente impara esattamente cosa c'è dietro. Puoi usare la comodità dei crediti ricaricabili oppure diventare totalmente indipendente collegando il tuo account all'ingrosso.
            </div>
          </div>
        )}
      </main>

      {/* ======================================================================= */}
      {/* MODALE DI SIMULAZIONE ESECUZIONE (SU MISURA PER OGNI STRUMENTO)         */}
      {/* ======================================================================= */}
      {activeModalTool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl overflow-y-auto animate-in fade-in duration-200">
          <div className="w-full max-w-xl rounded-2xl bg-[#090d16]/95 border border-indigo-500/40 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_30px_rgba(79,70,229,0.2)] my-8 transform transition-all animate-in zoom-in-95 duration-200">
            
            {/* Header Modale */}
            <div className="flex items-start justify-between gap-3 mb-5 pb-4 border-b border-slate-800/80">
              <div>
                <span className="text-[10px] font-mono uppercase text-indigo-300 bg-indigo-950/80 border border-indigo-800/60 px-2.5 py-0.5 rounded-full font-bold">
                  {activeModalTool.badge}
                </span>
                <h3 className="text-lg font-bold text-white mt-2 flex items-center gap-2 tracking-tight">
                  {activeModalTool.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveModalTool(null)}
                className="text-slate-400 hover:text-white text-sm p-2 rounded-xl hover:bg-slate-800/80 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* STATO 1: FORM INPUT DEDICATO */}
            {simulationStatus === 'idle' && (
              <div className="space-y-4 text-xs">
                
                <p className="text-neutral-400 leading-relaxed text-xs">
                  {activeModalTool.description}
                </p>

                {/* 1. BOLLETTE: Inserisci Dati o Carica Bolletta */}
                {activeModalTool.id === 'bollette' && (
                  <div className="space-y-3 pt-1">
                    <div className="flex gap-2 p-1 bg-neutral-950 rounded-lg border border-neutral-800">
                      <button
                        type="button"
                        onClick={() => setModalInputMode('text')}
                        className={`flex-1 py-1.5 rounded-md font-medium text-[11px] transition-colors ${
                          modalInputMode === 'text'
                            ? 'bg-neutral-800 text-white shadow-sm'
                            : 'text-neutral-400 hover:text-neutral-200'
                        }`}
                      >
                        ✍️ Inserisci Fornitore & Dubbi
                      </button>
                      <button
                        type="button"
                        onClick={() => setModalInputMode('upload')}
                        className={`flex-1 py-1.5 rounded-md font-medium text-[11px] transition-colors ${
                          modalInputMode === 'upload'
                            ? 'bg-neutral-800 text-white shadow-sm'
                            : 'text-neutral-400 hover:text-neutral-200'
                        }`}
                      >
                        📄 Carica PDF / Foto Bolletta
                      </button>
                    </div>

                    {modalInputMode === 'text' ? (
                      <div className="space-y-2.5">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] text-neutral-400 mb-1">Fornitore / Gestore</label>
                            <input
                              type="text"
                              value={billProvider}
                              onChange={(e) => setBillProvider(e.target.value)}
                              placeholder="es. Enel, Eni, A2A, Vodafone..."
                              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] text-neutral-400 mb-1">Importo Bolletta (€)</label>
                            <input
                              type="text"
                              value={billAmount}
                              onChange={(e) => setBillAmount(e.target.value)}
                              placeholder="es. 240.50"
                              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500 font-mono"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[11px] text-neutral-400 mb-1">Note o voci sospette</label>
                          <textarea
                            rows={3}
                            value={billNotes}
                            onChange={(e) => setBillNotes(e.target.value)}
                            placeholder="Descrivi cosa non ti torna o incolla i dati di consumo..."
                            className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500 text-xs"
                          />
                        </div>
                      </div>
                    ) : (
                      <div 
                        onClick={() => setUploadedFileName('bolletta_luce_febbraio_2026.pdf')}
                        className="border border-dashed border-neutral-700 hover:border-neutral-500 rounded-xl p-5 text-center bg-neutral-950 transition-colors cursor-pointer"
                      >
                        <Upload className="w-6 h-6 text-neutral-400 mx-auto mb-2" />
                        <div className="text-neutral-200 font-medium text-xs mb-0.5">
                          {uploadedFileName ? `File selezionato: ${uploadedFileName}` : 'Trascina o tocca per caricare la bolletta'}
                        </div>
                        <div className="text-[11px] text-neutral-500">Formati supportati: PDF, JPG, PNG (fino a 25MB)</div>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. FRIGO: Scrivi Ingredienti o Carica Foto */}
                {activeModalTool.id === 'frigo' && (
                  <div className="space-y-3 pt-1">
                    <div className="flex gap-2 p-1 bg-neutral-950 rounded-lg border border-neutral-800">
                      <button
                        type="button"
                        onClick={() => setModalInputMode('text')}
                        className={`flex-1 py-1.5 rounded-md font-medium text-[11px] transition-colors ${
                          modalInputMode === 'text'
                            ? 'bg-neutral-800 text-white shadow-sm'
                            : 'text-neutral-400 hover:text-neutral-200'
                        }`}
                      >
                        ✍️ Digita Ingredienti Disponibili
                      </button>
                      <button
                        type="button"
                        onClick={() => setModalInputMode('upload')}
                        className={`flex-1 py-1.5 rounded-md font-medium text-[11px] transition-colors ${
                          modalInputMode === 'upload'
                            ? 'bg-neutral-800 text-white shadow-sm'
                            : 'text-neutral-400 hover:text-neutral-200'
                        }`}
                      >
                        📷 Foto Frigo / Dispensa
                      </button>
                    </div>

                    {modalInputMode === 'text' ? (
                      <div className="space-y-2.5">
                        <div>
                          <label className="block text-[11px] text-neutral-400 mb-1">
                            Cosa hai in frigo o in dispensa da consumare?
                          </label>
                          <textarea
                            rows={3}
                            value={frigoIngredients}
                            onChange={(e) => setFrigoIngredients(e.target.value)}
                            placeholder="es. 3 uova, 1 zucchina, parmigiano, mezza ricotta, pasta..."
                            className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500 text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-neutral-400 mb-1.5">Tempo massimo di preparazione</label>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { id: '15min', label: '⚡ 15 Minuti (Espresso)' },
                              { id: '30min', label: '⏱️ 30 Minuti (Standard)' },
                              { id: 'forno', label: '🍲 Forno / Lenta' },
                            ].map((t) => (
                              <button
                                key={t.id}
                                type="button"
                                onClick={() => setFrigoTime(t.id as any)}
                                className={`py-1.5 px-2 rounded-lg border text-[11px] text-center transition-colors ${
                                  frigoTime === t.id
                                    ? 'bg-neutral-800 border-white text-white font-medium'
                                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                                }`}
                              >
                                {t.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div 
                        onClick={() => setUploadedFileName('foto_ripiani_frigo_01.jpg')}
                        className="border border-dashed border-neutral-700 hover:border-neutral-500 rounded-xl p-5 text-center bg-neutral-950 transition-colors cursor-pointer"
                      >
                        <ChefHat className="w-6 h-6 text-neutral-400 mx-auto mb-2" />
                        <div className="text-neutral-200 font-medium text-xs mb-0.5">
                          {uploadedFileName ? `Foto caricata: ${uploadedFileName}` : 'Scatta o carica una foto ai ripiani del frigo'}
                        </div>
                        <div className="text-[11px] text-neutral-500">L’AI riconoscerà automaticamente verdure, formaggi e scadenze</div>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. FOTO RESTAURO: Carica Foto & Opzioni di Recupero */}
                {activeModalTool.id === 'foto-restauro' && (
                  <div className="space-y-3 pt-1">
                    <div 
                      onClick={() => setUploadedFileName('foto_nonni_anni50_originale.png')}
                      className="border border-dashed border-neutral-700 hover:border-neutral-500 rounded-xl p-5 text-center bg-neutral-950 transition-colors cursor-pointer"
                    >
                      <ImageIcon className="w-6 h-6 text-neutral-400 mx-auto mb-2" />
                      <div className="text-neutral-200 font-medium text-xs mb-0.5">
                        {uploadedFileName ? `Foto selezionata: ${uploadedFileName}` : 'Carica la vecchia foto da restaurare'}
                      </div>
                      <div className="text-[11px] text-neutral-500">JPG, PNG o scansione TIFF in alta risoluzione</div>
                    </div>

                    <div className="space-y-2 p-3 bg-neutral-950 rounded-xl border border-neutral-800">
                      <div className="text-[11px] font-semibold text-neutral-300 mb-1">Opzioni di restauro attive:</div>
                      
                      <label className="flex items-center gap-2.5 text-neutral-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={restoreColorize}
                          onChange={(e) => setRestoreColorize(e.target.checked)}
                          className="rounded border-neutral-700 bg-neutral-900 text-white focus:ring-0 w-4 h-4"
                        />
                        <span>Colorazione filologica naturale (incarnato, occhi, abiti storici)</span>
                      </label>

                      <label className="flex items-center gap-2.5 text-neutral-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={restoreFixDamages}
                          onChange={(e) => setRestoreFixDamages(e.target.checked)}
                          className="rounded border-neutral-700 bg-neutral-900 text-white focus:ring-0 w-4 h-4"
                        />
                        <span>Rimozione graffi, pieghe della carta e polvere da scansione</span>
                      </label>

                      <label className="flex items-center gap-2.5 text-neutral-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={restoreUltraHd}
                          onChange={(e) => setRestoreUltraHd(e.target.checked)}
                          className="rounded border-neutral-700 bg-neutral-900 text-white focus:ring-0 w-4 h-4"
                        />
                        <span>Upscaling Ultra-HD per stampa fotografica su carta fine-art (300 DPI)</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* 4. MEDICO / BUROCRAZIA: Incolla Testo o Carica Scansione */}
                {activeModalTool.id === 'medico' && (
                  <div className="space-y-3 pt-1">
                    <div className="flex gap-2 p-1 bg-neutral-950 rounded-lg border border-neutral-800">
                      <button
                        type="button"
                        onClick={() => setModalInputMode('text')}
                        className={`flex-1 py-1.5 rounded-md font-medium text-[11px] transition-colors ${
                          modalInputMode === 'text'
                            ? 'bg-neutral-800 text-white shadow-sm'
                            : 'text-neutral-400 hover:text-neutral-200'
                        }`}
                      >
                        ✍️ Incolla Testo Referto / Burocrazia
                      </button>
                      <button
                        type="button"
                        onClick={() => setModalInputMode('upload')}
                        className={`flex-1 py-1.5 rounded-md font-medium text-[11px] transition-colors ${
                          modalInputMode === 'upload'
                            ? 'bg-neutral-800 text-white shadow-sm'
                            : 'text-neutral-400 hover:text-neutral-200'
                        }`}
                      >
                        📄 Carica Foto / Scansione
                      </button>
                    </div>

                    {modalInputMode === 'text' ? (
                      <div className="space-y-2">
                        <label className="block text-[11px] text-neutral-400">
                          Incolla il testo del referto medico o della lettera INPS/Agenzia Entrate
                        </label>
                        <textarea
                          rows={4}
                          value={medicalText}
                          onChange={(e) => setMedicalText(e.target.value)}
                          placeholder="Incolla qui le conclusioni dell'esame o il passaggio formale da chiarire..."
                          className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500 text-xs font-mono"
                        />
                      </div>
                    ) : (
                      <div 
                        onClick={() => setUploadedFileName('referto_ecografia_anonimo.pdf')}
                        className="border border-dashed border-neutral-700 hover:border-neutral-500 rounded-xl p-5 text-center bg-neutral-950 transition-colors cursor-pointer"
                      >
                        <HeartPulse className="w-6 h-6 text-neutral-400 mx-auto mb-2" />
                        <div className="text-neutral-200 font-medium text-xs mb-0.5">
                          {uploadedFileName ? `Referto caricato: ${uploadedFileName}` : 'Carica scansione referto o foto lettera'}
                        </div>
                        <div className="text-[11px] text-neutral-500">PDF, JPG o PNG</div>
                      </div>
                    )}

                    <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-[11px] text-neutral-400 flex items-center gap-2">
                      <Lock className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <span><strong>Tutela Privacy:</strong> i dati anagrafici vengono rimossi prima dell’elaborazione linguistica.</span>
                    </div>
                  </div>
                )}

                {/* 5. FAVOLE PER BAMBINI: Form Creativo Guidato */}
                {activeModalTool.id === 'favole' && (
                  <div className="space-y-3 pt-1">
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] text-neutral-400 mb-1">Nome del bambino/a</label>
                        <input
                          type="text"
                          value={kidName}
                          onChange={(e) => setKidName(e.target.value)}
                          placeholder="es. Leonardo, Giulia..."
                          className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-neutral-400 mb-1">Età (anni)</label>
                        <input
                          type="text"
                          value={kidAge}
                          onChange={(e) => setKidAge(e.target.value)}
                          placeholder="es. 5, 7, 9..."
                          className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1">Personaggi o mondo preferito</label>
                      <input
                        type="text"
                        value={storyTopic}
                        onChange={(e) => setStoryTopic(e.target.value)}
                        placeholder="es. Un cagnolino coraggioso, dinosauri gentili, pianeti di caramelle..."
                        className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1">Insegnamento o morale della storia</label>
                      <input
                        type="text"
                        value={storyMoral}
                        onChange={(e) => setStoryMoral(e.target.value)}
                        placeholder="es. Superare la paura del buio, rispettare la natura, condividere i giochi..."
                        className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1">Stile Grafico Illustrazioni</label>
                      <select
                        value={storyStyle}
                        onChange={(e) => setStoryStyle(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-100 focus:outline-none focus:border-neutral-500"
                      >
                        <option value="Acquerello Dolce">🎨 Acquerello Dolce (Stile Fiaba Tradizionale)</option>
                        <option value="Pastello Illustrato">🖍️ Disegno a Pastello Morbido</option>
                        <option value="Fiabesco Digitale">✨ Fiabesco Digitale Pixar 3D</option>
                        <option value="Tavola Classica">📖 Tavola Classica a Matita</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* 6. OCR PRO: Fatture & Scontrini Excel */}
                {activeModalTool.id === 'ocr-pro' && (
                  <div className="space-y-3 pt-1">
                    <div 
                      onClick={() => setUploadedFileName('fatture_ricevute_marzo_2026.zip')}
                      className="border border-dashed border-neutral-700 hover:border-neutral-500 rounded-xl p-5 text-center bg-neutral-950 transition-colors cursor-pointer"
                    >
                      <FileSpreadsheet className="w-6 h-6 text-neutral-400 mx-auto mb-2" />
                      <div className="text-neutral-200 font-medium text-xs mb-0.5">
                        {uploadedFileName ? `File selezionato: ${uploadedFileName}` : 'Trascina fatture, ricevute o scontrini'}
                      </div>
                      <div className="text-[11px] text-neutral-500">Carica singoli file o un pacco fino a 20 scontrini (PDF/JPG)</div>
                    </div>

                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1.5">Formato di esportazione desiderato</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'excel', label: '📊 Foglio Excel (.xlsx)' },
                          { id: 'csv', label: '📄 File CSV universale' },
                          { id: 'json', label: '⚙️ JSON Dati Grezzi' },
                        ].map((f) => (
                          <button
                            key={f.id}
                            type="button"
                            onClick={() => setOcrExportFormat(f.id as any)}
                            className={`py-1.5 px-2 rounded-lg border text-[11px] text-center transition-colors ${
                              ocrExportFormat === f.id
                                ? 'bg-neutral-800 border-white text-white font-medium'
                                : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                            }`}
                          >
                            {f.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 7. VIDEO REEL: Testo, Voce e Sottotitoli */}
                {activeModalTool.id === 'video-reel' && (
                  <div className="space-y-3 pt-1">
                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1">
                        Script o Messaggio del Video (fino a 60 secondi di parlato)
                      </label>
                      <textarea
                        rows={3}
                        value={videoScript}
                        onChange={(e) => setVideoScript(e.target.value)}
                        placeholder="Scrivi qui il consiglio professionale o il messaggio per i social..."
                        className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500 text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] text-neutral-400 mb-1">Voce Narrante AI</label>
                        <select
                          value={videoVoice}
                          onChange={(e) => setVideoVoice(e.target.value)}
                          className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-100 focus:outline-none focus:border-neutral-500 text-xs"
                        >
                          <option value="Marco (Calda & Professionale)">🎙️ Marco (Calda & Professionale)</option>
                          <option value="Elena (Istituzionale & Chiara)">🎙️ Elena (Istituzionale & Chiara)</option>
                          <option value="Alex (Dinamico & Social)">🎙️ Alex (Dinamico & Social)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] text-neutral-400 mb-1">Stile Sottotitoli</label>
                        <select
                          value={videoSubtitleStyle}
                          onChange={(e) => setVideoSubtitleStyle(e.target.value)}
                          className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-100 focus:outline-none focus:border-neutral-500 text-xs"
                        >
                          <option value="TikTok Giallo Evidenziato">🟨 TikTok Giallo Evidenziato</option>
                          <option value="Minimale Bianco Clean">⬜ Minimale Bianco Clean</option>
                          <option value="Box Scuro Alto Contrasto">⬛ Box Scuro Alto Contrasto</option>
                        </select>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-[11px] text-neutral-400 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Film className="w-3.5 h-3.5 text-neutral-400" />
                        Formato di esportazione:
                      </span>
                      <span className="font-mono text-neutral-200">Verticale 9:16 (1080x1920 HD)</span>
                    </div>
                  </div>
                )}

                {/* 8. PREVENTIVI BLINDATI */}
                {activeModalTool.id === 'preventivi-blindati' && (
                  <div className="space-y-3 pt-1">
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] text-neutral-400 mb-1">Cliente / Committente</label>
                        <input
                          type="text"
                          value={quoteClient}
                          onChange={(e) => setQuoteClient(e.target.value)}
                          placeholder="es. Studio Legale Rossi..."
                          className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-neutral-400 mb-1">Compenso Pattuito (€)</label>
                        <input
                          type="text"
                          value={quoteAmount}
                          onChange={(e) => setQuoteAmount(e.target.value)}
                          placeholder="es. 2400"
                          className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500 font-mono text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1">Oggetto dell'incarico e deliverables</label>
                      <textarea
                        rows={3}
                        value={quoteJob}
                        onChange={(e) => setQuoteJob(e.target.value)}
                        placeholder="Descrivi cosa include il lavoro (es. 5 pagine web, setup hosting, 2 sessioni formative)..."
                        className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500 text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] text-neutral-400 mb-1">Acconto all'avvio (%)</label>
                        <input
                          type="text"
                          value={quoteDepositPercent}
                          onChange={(e) => setQuoteDepositPercent(e.target.value)}
                          placeholder="es. 30 o 50"
                          className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-100 font-mono text-xs focus:outline-none focus:border-neutral-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-neutral-400 mb-1">Tariffa Modifiche Extra (€/ora)</label>
                        <input
                          type="text"
                          value={quoteExtraHourly}
                          onChange={(e) => setQuoteExtraHourly(e.target.value)}
                          placeholder="es. 45 o 60"
                          className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-100 font-mono text-xs focus:outline-none focus:border-neutral-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 9. SOLLECITI DI PAGAMENTO */}
                {activeModalTool.id === 'solleciti-pagamento' && (
                  <div className="space-y-3 pt-1">
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] text-neutral-400 mb-1">Cliente / Debitore</label>
                        <input
                          type="text"
                          value={sollecitoClient}
                          onChange={(e) => setSollecitoClient(e.target.value)}
                          placeholder="es. Azienda Meccanica SPA..."
                          className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-100 focus:outline-none focus:border-neutral-500 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-neutral-400 mb-1">N. Fattura & Data</label>
                        <input
                          type="text"
                          value={sollecitoInvoiceNum}
                          onChange={(e) => setSollecitoInvoiceNum(e.target.value)}
                          placeholder="es. FATT-2026/08"
                          className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-100 font-mono text-xs focus:outline-none focus:border-neutral-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] text-neutral-400 mb-1">Importo Scaduto (€)</label>
                        <input
                          type="text"
                          value={sollecitoAmount}
                          onChange={(e) => setSollecitoAmount(e.target.value)}
                          placeholder="es. 1850.00"
                          className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-100 font-mono text-xs focus:outline-none focus:border-neutral-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-neutral-400 mb-1">Giorni di Ritardo</label>
                        <input
                          type="text"
                          value={sollecitoDaysLate}
                          onChange={(e) => setSollecitoDaysLate(e.target.value)}
                          placeholder="es. 15, 30, 60..."
                          className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-100 font-mono text-xs focus:outline-none focus:border-neutral-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1.5">Livello di Fermezza della Comunicazione</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'amichevole', label: '1. Promemoria Cordiale' },
                          { id: 'formale', label: '2. Sollecito con IBAN' },
                          { id: 'diffida', label: '3. Diffida D.Lgs. 231/02' },
                        ].map((lvl) => (
                          <button
                            key={lvl.id}
                            type="button"
                            onClick={() => setSollecitoLevel(lvl.id as any)}
                            className={`py-1.5 px-2 rounded-lg border text-[11px] text-center transition-colors ${
                              sollecitoLevel === lvl.id
                                ? 'bg-neutral-800 border-white text-white font-medium'
                                : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                            }`}
                          >
                            {lvl.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 10. DA VOCALE WHATSAPP A VERBALE */}
                {activeModalTool.id === 'audio-verbale' && (
                  <div className="space-y-3 pt-1">
                    <div className="flex gap-2 p-1 bg-neutral-950 rounded-lg border border-neutral-800">
                      <button
                        type="button"
                        onClick={() => setModalInputMode('text')}
                        className={`flex-1 py-1.5 rounded-md font-medium text-[11px] transition-colors ${
                          modalInputMode === 'text'
                            ? 'bg-neutral-800 text-white shadow-sm'
                            : 'text-neutral-400 hover:text-neutral-200'
                        }`}
                      >
                        ✍️ Incolla Trascrizione o Appunti
                      </button>
                      <button
                        type="button"
                        onClick={() => setModalInputMode('upload')}
                        className={`flex-1 py-1.5 rounded-md font-medium text-[11px] transition-colors ${
                          modalInputMode === 'upload'
                            ? 'bg-neutral-800 text-white shadow-sm'
                            : 'text-neutral-400 hover:text-neutral-200'
                        }`}
                      >
                        🎙️ Carica File Audio / Vocale
                      </button>
                    </div>

                    {modalInputMode === 'text' ? (
                      <div>
                        <label className="block text-[11px] text-neutral-400 mb-1">
                          Incolla il testo del messaggio vocale o gli appunti della telefonata
                        </label>
                        <textarea
                          rows={4}
                          value={audioTranscript}
                          onChange={(e) => setAudioTranscript(e.target.value)}
                          placeholder="Incolla il testo del vocale o la trascrizione grezza del cliente..."
                          className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500 text-xs"
                        />
                      </div>
                    ) : (
                      <div 
                        onClick={() => setUploadedFileName('audio_cliente_richiesta_modifiche.ogg')}
                        className="border border-dashed border-neutral-700 hover:border-neutral-500 rounded-xl p-5 text-center bg-neutral-950 transition-colors cursor-pointer"
                      >
                        <Mic className="w-6 h-6 text-neutral-400 mx-auto mb-2" />
                        <div className="text-neutral-200 font-medium text-xs mb-0.5">
                          {uploadedFileName ? `Audio caricato: ${uploadedFileName}` : 'Carica vocale WhatsApp o memo vocale'}
                        </div>
                        <div className="text-[11px] text-neutral-500">Supporta OGG, MP3, M4A, WAV</div>
                      </div>
                    )}
                  </div>
                )}

                {/* 11. SCANNER BANDI E CONTRIBUTI */}
                {activeModalTool.id === 'scanner-bandi' && (
                  <div className="space-y-3 pt-1">
                    <div 
                      onClick={() => setUploadedFileName('bando_transizione_digitale_2026.pdf')}
                      className="border border-dashed border-neutral-700 hover:border-neutral-500 rounded-xl p-5 text-center bg-neutral-950 transition-colors cursor-pointer"
                    >
                      <FileText className="w-6 h-6 text-neutral-400 mx-auto mb-2" />
                      <div className="text-neutral-200 font-medium text-xs mb-0.5">
                        {uploadedFileName ? `Bando caricato: ${uploadedFileName}` : 'Trascina o carica il PDF del bando'}
                      </div>
                      <div className="text-[11px] text-neutral-500">PDF ministeriali, regionali, CCIAA o Invitalia fino a 60 pagine</div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] text-neutral-400 mb-1">Codice ATECO Aziendale</label>
                        <input
                          type="text"
                          value={bandoAteco}
                          onChange={(e) => setBandoAteco(e.target.value)}
                          placeholder="es. 62.01, 43.21..."
                          className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-100 text-xs focus:outline-none focus:border-neutral-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-neutral-400 mb-1">Regione / Ambito</label>
                        <input
                          type="text"
                          value={bandoRegion}
                          onChange={(e) => setBandoRegion(e.target.value)}
                          placeholder="es. Lombardia, Nazionale..."
                          className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-100 text-xs focus:outline-none focus:border-neutral-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 12. CALCOLO NETTO E RISERVA TASSE */}
                {activeModalTool.id === 'calcolo-netto-tasse' && (
                  <div className="space-y-3 pt-1">
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] text-neutral-400 mb-1">Fattura / Incasso Lordo (€)</label>
                        <input
                          type="text"
                          value={taxGrossAmount}
                          onChange={(e) => setTaxGrossAmount(e.target.value)}
                          placeholder="es. 4500"
                          className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-100 font-mono text-xs focus:outline-none focus:border-neutral-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-neutral-400 mb-1">Regime Fiscale</label>
                        <select
                          value={taxRegime}
                          onChange={(e) => setTaxRegime(e.target.value as any)}
                          className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-100 text-xs focus:outline-none focus:border-neutral-500"
                        >
                          <option value="forfettario5">Forfettario Start-up (5% + INPS)</option>
                          <option value="forfettario15">Forfettario Standard (15% + INPS)</option>
                          <option value="ordinario">Regime Ordinario / Semplificato</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1">Coefficiente di Redditività ATECO</label>
                      <select
                        value={taxAtecoPercent}
                        onChange={(e) => setTaxAtecoPercent(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-100 text-xs focus:outline-none focus:border-neutral-500"
                      >
                        <option value="78">78% — Professionisti, Consulenti, Sviluppatori, Servizi</option>
                        <option value="67">67% — Commercio all'ingrosso e dettaglio</option>
                        <option value="86">86% — Attività immobiliari e costruzioni</option>
                        <option value="40">40% — Commercio al dettaglio alimentari / Ristorazione</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Footer Costo e Azioni */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-950 border border-neutral-800 font-mono text-xs mt-4">
                  <span className="text-neutral-400">Costo Operazione:</span>
                  <span className="font-semibold text-amber-300 flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5" />
                    {activeModalTool.creditsCost} Crediti
                  </span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveModalTool(null)}
                    className="px-3.5 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium transition-colors"
                  >
                    Annulla
                  </button>
                  <button
                    type="button"
                    onClick={handleExecuteSimulation}
                    className="px-4 py-2 rounded-lg bg-white hover:bg-neutral-200 text-neutral-950 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Wand2 className="w-3.5 h-3.5 text-neutral-950" />
                    {activeModalTool.id === 'bollette' && `Analizza Bolletta (${activeModalTool.creditsCost} Crediti)`}
                    {activeModalTool.id === 'frigo' && `Genera Ricette (${activeModalTool.creditsCost} Credito)`}
                    {activeModalTool.id === 'foto-restauro' && `Avvia Restauro (${activeModalTool.creditsCost} Crediti)`}
                    {activeModalTool.id === 'medico' && `Decodifica Referto (${activeModalTool.creditsCost} Crediti)`}
                    {activeModalTool.id === 'favole' && `Crea Fiaba Illustrata (${activeModalTool.creditsCost} Crediti)`}
                    {activeModalTool.id === 'ocr-pro' && `Estrai Dati Excel (${activeModalTool.creditsCost} Crediti)`}
                    {activeModalTool.id === 'preventivi-blindati' && `Genera Preventivo (${activeModalTool.creditsCost} Crediti)`}
                    {activeModalTool.id === 'solleciti-pagamento' && `Genera Sollecito (${activeModalTool.creditsCost} Credito)`}
                    {activeModalTool.id === 'audio-verbale' && `Estrai Verbale (${activeModalTool.creditsCost} Crediti)`}
                    {activeModalTool.id === 'scanner-bandi' && `Analizza Bando (${activeModalTool.creditsCost} Crediti)`}
                    {activeModalTool.id === 'calcolo-netto-tasse' && `Calcola Riserva (${activeModalTool.creditsCost} Credito)`}
                    {activeModalTool.id === 'video-reel' && `Monta Video Reel (${activeModalTool.creditsCost} Crediti)`}
                  </button>
                </div>
              </div>
            )}

            {/* STATO 2: ELABORAZIONE IN CORSO */}
            {simulationStatus === 'running' && (
              <div className="py-12 text-center space-y-3">
                <RefreshCcw className="w-8 h-8 text-white animate-spin mx-auto" />
                <div className="text-sm font-semibold text-white">Elaborazione in corso...</div>
                <div className="text-xs text-neutral-400">
                  {activeModalTool.id === 'bollette' && 'Verifica tariffaria ARERA e decodifica oneri di sistema'}
                  {activeModalTool.id === 'frigo' && 'Composizione menu bilanciato e tempi di cottura minimi'}
                  {activeModalTool.id === 'foto-restauro' && 'Pulizia granulosità, ricostruzione pigmenti e upscaling 4K'}
                  {activeModalTool.id === 'medico' && 'Sintesi semantica priva di gergo e redazione domande per il medico'}
                  {activeModalTool.id === 'favole' && `Generazione 4 capitoli e illustrazioni per ${kidName}`}
                  {activeModalTool.id === 'ocr-pro' && 'Riconoscimento OCR ottico e compilazione righe contabili'}
                  {activeModalTool.id === 'preventivi-blindati' && 'Redazione clausole contrattuali e piano di pagamento acconti'}
                  {activeModalTool.id === 'solleciti-pagamento' && 'Calibrazione del tono e calcolo termini di mora D.Lgs. 231/02'}
                  {activeModalTool.id === 'audio-verbale' && 'Scomposizione semantica audio e formulazione to-do list'}
                  {activeModalTool.id === 'scanner-bandi' && 'Scansione ammissibilità ATECO e verifica aliquota fondo perduto'}
                  {activeModalTool.id === 'calcolo-netto-tasse' && 'Calcolo imposta sostitutiva, rivalsa INPS e riserva netta'}
                  {activeModalTool.id === 'video-reel' && 'Sintesi vocale neurale in italiano e sincronizzazione clip'}
                </div>
              </div>
            )}

            {/* STATO 3: RISULTATO DEDICATO SU MISURA */}
            {simulationStatus === 'success' && (
              <div className="space-y-4 text-xs">
                <div className="p-3.5 rounded-xl bg-neutral-950 border border-emerald-900/60 text-emerald-400 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                  <div>
                    <div className="font-semibold text-white text-xs mb-0.5">Operazione Completata con Successo</div>
                    <div className="text-[11px] text-neutral-300">
                      Scalati {activeModalTool.creditsCost} crediti. Il tuo nuovo saldo è di {simulatedUserCredits} crediti.
                    </div>
                  </div>
                </div>

                {/* Box Esito Specifico per Tool */}
                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
                  <div className="font-semibold text-white text-xs flex items-center justify-between">
                    <span>Risultato Elaborazione:</span>
                    <span className="text-[10px] font-mono text-neutral-500">ID #2026-OK</span>
                  </div>

                  {/* BOLLETTE RESULT */}
                  {activeModalTool.id === 'bollette' && (
                    <div className="space-y-2 font-sans text-xs text-neutral-300 leading-relaxed">
                      <div className="p-2.5 bg-neutral-900 rounded-lg border border-neutral-800">
                        <div className="text-[11px] text-neutral-400">Tariffa Applicata Rilevata:</div>
                        <div className="font-semibold text-amber-300 text-sm">0,34 €/kWh (Media mercato tutelato: 0,14 €/kWh)</div>
                        <div className="text-[11px] text-rose-400 mt-1">⚠️ Rilevata voce extra "Servizi Opzionali Non Richiesti": €14,90/mese</div>
                      </div>
                      <p className="text-[11px] text-neutral-300">
                        {activeModalTool.realWorldOutcome}
                      </p>
                      <button 
                        onClick={() => alert('Download bozza reclamo formale avviato (.docx)')}
                        className="w-full py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-medium flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Scarica Lettera di Reclamo Formale (.docx)
                      </button>
                    </div>
                  )}

                  {/* FRIGO RESULT */}
                  {activeModalTool.id === 'frigo' && (
                    <div className="space-y-2.5 font-sans text-xs text-neutral-300">
                      <div className="p-2.5 bg-neutral-900 rounded-lg border border-neutral-800">
                        <div className="font-semibold text-white mb-1">🍽️ Ricetta 1: Frittata Soffice Zucchine & Crema di Ricotta (12 min)</div>
                        <div className="text-[11px] text-neutral-400">Taglia la zucchina a rondelle sottili, saltala 4 min in padella. Sbatti le uova con la ricotta e cuoci a fuoco dolce per 6 minuti.</div>
                      </div>
                      <div className="p-2.5 bg-neutral-900 rounded-lg border border-neutral-800">
                        <div className="font-semibold text-white mb-1">🍝 Ricetta 2: Pasta Rapida al Mantecato di Ricotta e Scaglie di Parmigiano (10 min)</div>
                        <div className="text-[11px] text-neutral-400">Unisci la ricotta con 2 cucchiai di acqua di cottura e pepe. Manteca la pasta direttamente in padella.</div>
                      </div>
                    </div>
                  )}

                  {/* FOTO RESTAURO RESULT */}
                  {activeModalTool.id === 'foto-restauro' && (
                    <div className="space-y-2.5 font-sans text-xs text-neutral-300">
                      <div className="p-2.5 bg-neutral-900 rounded-lg border border-neutral-800 flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-white">File Restaurato: {uploadedFileName || 'foto_restaurata_300dpi.png'}</div>
                          <div className="text-[11px] text-emerald-400">✓ Graffi eliminati • Colori volti applicati • Risoluzione 4096x2840</div>
                        </div>
                      </div>
                      <button 
                        onClick={() => alert('Download immagine restaurata HD avviato')}
                        className="w-full py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-medium flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Scarica Foto Restaurata per Stampa 300 DPI
                      </button>
                    </div>
                  )}

                  {/* MEDICO RESULT */}
                  {activeModalTool.id === 'medico' && (
                    <div className="space-y-2.5 font-sans text-xs text-neutral-300">
                      <div className="p-2.5 bg-neutral-900 rounded-lg border border-neutral-800">
                        <div className="font-semibold text-white mb-1">Spiegazione in Parole Semplici:</div>
                        <div className="text-[11px] text-neutral-300 leading-relaxed">
                          L'esame non evidenzia masse, nodi o lesioni pericolose. C'è solo una normale e lieve variazione del tessuto, del tutto identica a quella riscontrata nella visita precedente.
                        </div>
                      </div>
                      <div className="p-2.5 bg-neutral-900 rounded-lg border border-neutral-800">
                        <div className="font-semibold text-white mb-1">2 Domande Consigliate per il Medico:</div>
                        <ul className="text-[11px] text-neutral-400 list-disc list-inside space-y-0.5">
                          <li>"Dottore, il controllo a 12 mesi è confermato o preferisce vederci prima?"</li>
                          <li>"Ci sono precauzioni particolari o abitudini da modificare?"</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* FAVOLE RESULT */}
                  {activeModalTool.id === 'favole' && (
                    <div className="space-y-2.5 font-sans text-xs text-neutral-300">
                      <div className="p-3 bg-neutral-900 rounded-lg border border-neutral-800 space-y-1.5">
                        <div className="font-semibold text-white">📖 Libro: "{kidName} e il Razzo delle Stelle Amiche"</div>
                        <div className="text-[11px] text-neutral-400 italic">
                          "Capitolo 1: Nella cameretta di {kidName}, la luce della luna non faceva più paura. Il piccolo cagnolino Leo scodinzolò puntando la bussola dorata verso il cielo..."
                        </div>
                        <div className="text-[10px] text-neutral-500 font-mono">Include 4 capitoli completi + 4 tavole illustrate in stile {storyStyle}</div>
                      </div>
                      <button 
                        onClick={() => alert('Download libretto PDF stampabile con copertina avviato')}
                        className="w-full py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-medium flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Scarica Libretto Fiaba Stampabile (.pdf)
                      </button>
                    </div>
                  )}

                  {/* OCR PRO RESULT */}
                  {activeModalTool.id === 'ocr-pro' && (
                    <div className="space-y-2.5 font-sans text-xs text-neutral-300">
                      <div className="p-2.5 bg-neutral-900 rounded-lg border border-neutral-800 overflow-x-auto font-mono text-[10px]">
                        <div className="grid grid-cols-4 gap-2 font-bold text-neutral-300 pb-1 border-b border-neutral-800">
                          <div>Data / Fornitore</div>
                          <div>P.IVA</div>
                          <div>Imponibile</div>
                          <div>Totale</div>
                        </div>
                        <div className="grid grid-cols-4 gap-2 text-neutral-400 pt-1">
                          <div>14/03/26 - Forniture SRL</div>
                          <div>08472910961</div>
                          <div>€ 142,00</div>
                          <div className="text-white font-semibold">€ 173,24</div>
                        </div>
                      </div>
                      <button 
                        onClick={() => alert('Download foglio Excel compilato avviato (.xlsx)')}
                        className="w-full py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-medium flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Scarica Foglio Compilato (.xlsx)
                      </button>
                    </div>
                  )}

                  {/* PREVENTIVI BLINDATI RESULT */}
                  {activeModalTool.id === 'preventivi-blindati' && (
                    <div className="space-y-2.5 font-sans text-xs text-neutral-300">
                      <div className="p-3 bg-neutral-900 rounded-lg border border-neutral-800 space-y-2">
                        <div className="flex justify-between items-baseline border-b border-neutral-800 pb-1.5">
                          <span className="font-semibold text-white">Preventivo Incarico #{quoteClient.split(' ')[0]}-2026</span>
                          <span className="font-mono text-emerald-400 font-bold">€ {quoteAmount} + IVA</span>
                        </div>
                        <div className="text-[11px] text-neutral-400">
                          <strong>Condizioni di Pagamento:</strong> Acconto {quoteDepositPercent}% all'accettazione (€ {(Number(quoteAmount || 0) * (Number(quoteDepositPercent || 30) / 100)).toFixed(2)}), Saldo 70% alla consegna.
                        </div>
                        <div className="p-2 rounded bg-neutral-950 border border-neutral-800 text-[10px] text-amber-300/90 font-mono">
                          ✓ Clausola Anti-Fuori-Sacco attiva: "Eventuali revisioni, varianti o richieste non contemplate nell'allegato tecnico saranno conteggiate a parte alla tariffa oraria di €{quoteExtraHourly}/ora previa approvazione scritta."
                        </div>
                      </div>
                      <button 
                        onClick={() => alert('Download Preventivo Formale PDF con firma digitale avviato')}
                        className="w-full py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-medium flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Scarica Preventivo Formale PDF
                      </button>
                    </div>
                  )}

                  {/* SOLLECITI PAGAMENTO RESULT */}
                  {activeModalTool.id === 'solleciti-pagamento' && (
                    <div className="space-y-2.5 font-sans text-xs text-neutral-300">
                      <div className="p-3 bg-neutral-900 rounded-lg border border-neutral-800 space-y-2">
                        <div className="flex justify-between items-center text-neutral-400 border-b border-neutral-800 pb-1">
                          <span>Bozza Sollecito ({sollecitoLevel.toUpperCase()}):</span>
                          <span className="font-mono text-white">Fattura {sollecitoInvoiceNum}</span>
                        </div>
                        <p className="text-[11px] text-neutral-300 font-mono leading-relaxed bg-neutral-950 p-2.5 rounded border border-neutral-800">
                          {sollecitoLevel === 'amichevole' && `Gentile ${sollecitoClient}, con la presente ci permettiamo di ricordarVi la fattura ${sollecitoInvoiceNum} di € ${sollecitoAmount} scaduta da ${sollecitoDaysLate} giorni. Confidando in una semplice svista contabile, restiamo a disposizione per ogni chiarimento.`}
                          {sollecitoLevel === 'formale' && `Spett.le ${sollecitoClient}, ad oggi non risulta pervenuto il saldo della fattura ${sollecitoInvoiceNum} pari a € ${sollecitoAmount}. Vi invitiamo a regolarizzare l'importo a mezzo bonifico bancario (IBAN: IT99X00000000000) entro 5 giorni lavorativi.`}
                          {sollecitoLevel === 'diffida' && `FORMALE MESSA IN MORA (D.Lgs. 231/02): Spett.le ${sollecitoClient}, trascorsi infruttuosamente ${sollecitoDaysLate} giorni dalla scadenza della fattura ${sollecitoInvoiceNum} (€ ${sollecitoAmount}), intimiamo il pagamento entro 48 ore con riserva di addebito interessi legali e spese di recupero.`}
                        </p>
                      </div>
                      <button 
                        onClick={() => alert('Testo del sollecito copiato negli appunti!')}
                        className="w-full py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-medium flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        Copia Testo per WhatsApp / Email
                      </button>
                    </div>
                  )}

                  {/* AUDIO VERBALE RESULT */}
                  {activeModalTool.id === 'audio-verbale' && (
                    <div className="space-y-2.5 font-sans text-xs text-neutral-300">
                      <div className="p-3 bg-neutral-900 rounded-lg border border-neutral-800 space-y-2">
                        <div className="font-semibold text-white">📋 Task Operativi Estratti dal Vocale:</div>
                        <ul className="space-y-1 text-[11px] text-neutral-300 list-disc list-inside">
                          <li>Aggiornare palette cromatica della testata (Scadenza: Giovedì ore 18:00)</li>
                          <li>Integrare pulsante di pagamento checkout diretto</li>
                          <li>Predisporre recap per consegna finale di Venerdì mattina</li>
                        </ul>
                        <div className="p-2 rounded bg-neutral-950 border border-neutral-800 text-[10px] text-emerald-400 font-mono">
                          ✓ Messaggio di conferma pronto da inviare al cliente su WhatsApp generato.
                        </div>
                      </div>
                      <button 
                        onClick={() => alert('Messaggio di conferma per WhatsApp copiato!')}
                        className="w-full py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-medium flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        Copia Messaggio di Conferma WhatsApp
                      </button>
                    </div>
                  )}

                  {/* SCANNER BANDI RESULT */}
                  {activeModalTool.id === 'scanner-bandi' && (
                    <div className="space-y-2.5 font-sans text-xs text-neutral-300">
                      <div className="p-3 bg-neutral-900 rounded-lg border border-neutral-800 space-y-2">
                        <div className="flex justify-between items-center border-b border-neutral-800 pb-1">
                          <span className="font-semibold text-white">Esito Ammissibilità:</span>
                          <span className="text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">AMMESSO 100% ✓</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <div><strong>Agevolazione:</strong> 50% Fondo Perduto</div>
                          <div><strong>Scadenza:</strong> 30 Aprile 2026</div>
                          <div><strong>Spese Ammesse:</strong> Software, AI, Hardware, Formazione</div>
                          <div><strong>Spesa Minima:</strong> € 5.000</div>
                        </div>
                      </div>
                      <button 
                        onClick={() => alert('Download Scheda Sintetica Bando 1-Pagina avviato')}
                        className="w-full py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-medium flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Scarica Scheda Bando 1-Pagina (.pdf)
                      </button>
                    </div>
                  )}

                  {/* CALCOLO NETTO TASSE RESULT */}
                  {activeModalTool.id === 'calcolo-netto-tasse' && (
                    <div className="space-y-2.5 font-sans text-xs text-neutral-300">
                      <div className="p-3 bg-neutral-900 rounded-lg border border-neutral-800 space-y-2 font-mono text-xs">
                        <div className="flex justify-between border-b border-neutral-800 pb-1.5 text-neutral-400">
                          <span>Incasso Fattura Lordo:</span>
                          <span className="text-white font-bold font-mono">€ {taxGrossAmount}</span>
                        </div>
                        <div className="flex justify-between text-rose-400 text-[11px]">
                          <span>🛡️ Riserva Tasse & INPS (da accantonare):</span>
                          <span>- € {(Number(taxGrossAmount || 0) * 0.28).toFixed(2)} (28%)</span>
                        </div>
                        <div className="flex justify-between text-emerald-400 font-bold text-sm pt-1 border-t border-neutral-800">
                          <span>💵 Netto Reale Spendibile in Tasca:</span>
                          <span>€ {(Number(taxGrossAmount || 0) * 0.72).toFixed(2)} (72%)</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => alert('Promemoria F24 salvato nel tuo Secondo Cervello!')}
                        className="w-full py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-medium flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        Salva Ripartizione nel Secondo Cervello
                      </button>
                    </div>
                  )}

                  {/* VIDEO REEL RESULT */}
                  {activeModalTool.id === 'video-reel' && (
                    <div className="space-y-2.5 font-sans text-xs text-neutral-300">
                      <div className="p-3 bg-neutral-900 rounded-lg border border-neutral-800 flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-white">Video Reel 9:16 Generato (42 sec)</div>
                          <div className="text-[11px] text-neutral-400">Voce: {videoVoice} • Sottotitoli sincronizzati</div>
                        </div>
                        <span className="text-[10px] font-mono bg-neutral-800 px-2 py-1 rounded text-emerald-400">1080x1920 HD</span>
                      </div>
                      <button 
                        onClick={() => alert('Download video MP4 verticale pronto per i social avviato')}
                        className="w-full py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-medium flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Scarica Video Reel (.mp4)
                      </button>
                    </div>
                  )}

                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveModalTool(null)}
                    className="px-4 py-2 rounded-lg bg-white hover:bg-neutral-200 text-neutral-950 font-semibold text-xs transition-colors"
                  >
                    Chiudi
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
