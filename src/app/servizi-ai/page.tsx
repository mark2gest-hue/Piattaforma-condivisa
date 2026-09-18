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
  previewType: 'bolletta' | 'ricetta' | 'foto' | 'medico' | 'favola' | 'fattura' | 'video';
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
    if (tool.id === 'favole' || tool.id === 'video-reel') {
      setModalInputMode('text');
    } else if (tool.id === 'foto-restauro' || tool.id === 'ocr-pro') {
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
    <div className="min-h-screen bg-neutral-950 text-neutral-100 selection:bg-neutral-800 selection:text-white font-sans antialiased">
      
      {/* Top Bar Istituzionale e Sobria */}
      <header className="sticky top-0 z-40 bg-neutral-950/95 backdrop-blur border-b border-neutral-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-white text-neutral-950 font-bold flex items-center justify-center text-sm tracking-tighter">
                AI
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-sm tracking-tight text-white flex items-center gap-2">
                  AIutiamoci <span className="text-[10px] font-mono uppercase bg-neutral-900 border border-neutral-800 text-neutral-400 px-1.5 py-0.5 rounded">Sportello Servizi</span>
                </span>
                <span className="text-[11px] text-neutral-400">Strumenti Pratici & Valore Quotidiano</span>
              </div>
            </Link>
          </div>

          {/* Saldo Borsellino Utente */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 shadow-sm">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs text-neutral-400 font-mono">Saldo:</span>
              <span className="text-xs font-semibold text-white">{simulatedUserCredits} Crediti</span>
              <button
                onClick={() => setActiveTab('crediti')}
                className="ml-2 text-[11px] font-medium text-neutral-300 hover:text-white underline underline-offset-2"
              >
                Ricarica
              </button>
            </div>

            <Link
              href="/corsi"
              className="text-xs text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 px-3 py-1.5 rounded-lg transition-colors hidden sm:inline-block"
            >
              Area Corsisti
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section Tipografica (Anti-Slop: Niente Gradienti Neon Giganti) */}
      <section className="pt-12 pb-10 px-4 sm:px-6 border-b border-neutral-900 bg-neutral-950">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neutral-800 bg-neutral-900/80 text-neutral-300 text-xs font-mono uppercase tracking-wider mb-5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Nessuna Teoria Astratta • Solo Utilità Quotidiana
          </div>

          <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-white mb-4 leading-tight">
            L’Intelligenza Artificiale applicata alle <br className="hidden sm:block" />
            <span className="text-neutral-300 underline decoration-neutral-700 underline-offset-8">esigenze reali di ogni giorno</span>
          </h1>

          <p className="text-sm sm:text-base text-neutral-400 max-w-2xl mx-auto leading-relaxed mb-8">
            Dalla lettura semplificata delle bollette e dei referti medici, fino al restauro dei ricordi di famiglia e all’estrazione dei documenti di lavoro. Soluzioni con un clic, senza dover imparare a programmare.
          </p>

          {/* Navigazione a Schede */}
          <div className="inline-flex p-1 rounded-xl bg-neutral-900 border border-neutral-800 text-xs sm:text-sm font-medium">
            <button
              onClick={() => setActiveTab('servizi')}
              className={`px-4 py-2 rounded-lg transition-all ${
                activeTab === 'servizi'
                  ? 'bg-neutral-800 text-white shadow-sm font-semibold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Catalogo Servizi ({TOOL_SERVICES.length})
            </button>
            <button
              onClick={() => setActiveTab('crediti')}
              className={`px-4 py-2 rounded-lg transition-all ${
                activeTab === 'crediti'
                  ? 'bg-neutral-800 text-white shadow-sm font-semibold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Borsellino Crediti
            </button>
            <button
              onClick={() => setActiveTab('trasparenza')}
              className={`px-4 py-2 rounded-lg transition-all ${
                activeTab === 'trasparenza'
                  ? 'bg-neutral-800 text-white shadow-sm font-semibold'
                  : 'text-neutral-400 hover:text-white'
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
            {/* Filtro Semplificato */}
            <div className="flex items-center justify-between flex-wrap gap-4 mb-8 border-b border-neutral-800/80 pb-4">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-neutral-400 mr-2 font-mono uppercase">Settore:</span>
                {[
                  { id: 'tutti', label: 'Tutti i Servizi' },
                  { id: 'casa', label: 'Casa & Risparmio' },
                  { id: 'famiglia', label: 'Famiglia & Salute' },
                  { id: 'professionale', label: 'Lavoro & P.IVA' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-md border text-xs transition-colors ${
                      selectedCategory === cat.id
                        ? 'bg-white text-neutral-950 font-semibold border-white'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <div className="text-xs text-neutral-400 font-mono">
                Costo per operazione: da 1 a 4 crediti (€0,12 - €0,48)
              </div>
            </div>

            {/* Grid dei Servizi con Anteprime "Prima / Dopo" Tangibili */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTools.map((tool) => (
                <div
                  key={tool.id}
                  className="rounded-xl bg-neutral-900/60 border border-neutral-800 hover:border-neutral-700 transition-all p-5 flex flex-col justify-between group"
                >
                  <div>
                    {/* Header Card */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded border border-neutral-800 bg-neutral-900 text-neutral-400 font-medium">
                        {tool.badge}
                      </span>
                      <span className="text-xs font-mono font-medium text-amber-300/90 flex items-center gap-1 bg-amber-950/40 border border-amber-900/40 px-2 py-0.5 rounded">
                        <Coins className="w-3 h-3 text-amber-400" />
                        {tool.creditsCost} {tool.creditsCost === 1 ? 'Credito' : 'Crediti'}
                      </span>
                    </div>

                    <h3 className="text-base font-semibold text-white mb-1.5 group-hover:text-neutral-200">
                      {tool.title}
                    </h3>

                    <p className="text-xs text-neutral-400 leading-relaxed mb-4">
                      {tool.tagline}
                    </p>

                    {/* Anteprima Visiva Tangibile Specifica del Servizio */}
                    <div className="rounded-lg bg-neutral-950 border border-neutral-800/80 p-3 mb-4 text-[11px] font-mono">
                      {tool.previewType === 'bolletta' && (
                        <div className="space-y-1.5">
                          <div className="text-neutral-400 flex items-center justify-between border-b border-neutral-800 pb-1">
                            <span>Fattura Enel/A2A:</span>
                            <span className="text-rose-400">€ 142,30</span>
                          </div>
                          <div className="text-emerald-400 font-sans text-xs">
                            ✓ Spesa non dovuta: €24,50 (oneri di sistema pregressi)
                          </div>
                          <div className="text-neutral-400 text-[10px]">
                            Bozza reclamo generata per storno immediato.
                          </div>
                        </div>
                      )}

                      {tool.previewType === 'ricetta' && (
                        <div className="space-y-1.5">
                          <div className="text-neutral-400 border-b border-neutral-800 pb-1">
                            Ingredienti rilevati: Uova, Zucchine, Parmigiano
                          </div>
                          <div className="text-emerald-400 font-sans text-xs">
                            ✓ Tortino soffice alle zucchine in padella (15 min)
                          </div>
                          <div className="text-neutral-400 text-[10px]">
                            Zero acquisti extra, zero sprechi.
                          </div>
                        </div>
                      )}

                      {tool.previewType === 'foto' && (
                        <div className="space-y-1.5">
                          <div className="text-neutral-400 border-b border-neutral-800 pb-1 flex justify-between">
                            <span>Scansione originale:</span>
                            <span className="text-neutral-400">B/N Sbiadita</span>
                          </div>
                          <div className="text-emerald-400 font-sans text-xs">
                            ✓ Ripristino volti & Colori storici HD
                          </div>
                          <div className="text-neutral-400 text-[10px]">
                            File restaurato a 300 DPI per album o quadro.
                          </div>
                        </div>
                      )}

                      {tool.previewType === 'medico' && (
                        <div className="space-y-1.5">
                          <div className="text-neutral-400 border-b border-neutral-800 pb-1">
                            Valutazione referto clinico / INPS:
                          </div>
                          <div className="text-emerald-400 font-sans text-xs">
                            ✓ Sintesi in 3 righe comprensibili
                          </div>
                          <div className="text-neutral-400 text-[10px]">
                            + 3 domande mirate per il medico curante.
                          </div>
                        </div>
                      )}

                      {tool.previewType === 'favola' && (
                        <div className="space-y-1.5">
                          <div className="text-neutral-400 border-b border-neutral-800 pb-1 flex justify-between">
                            <span>Protagonista:</span>
                            <span className="text-neutral-300">Marco & Il Draghetto</span>
                          </div>
                          <div className="text-emerald-400 font-sans text-xs">
                            ✓ 4 Pagine illustrate con disegni ad acquerello
                          </div>
                          <div className="text-neutral-400 text-[10px]">
                            PDF impaginato per lettura su tablet o stampa.
                          </div>
                        </div>
                      )}

                      {tool.previewType === 'fattura' && (
                        <div className="space-y-1.5">
                          <div className="text-neutral-400 border-b border-neutral-800 pb-1 flex justify-between">
                            <span>Documento:</span>
                            <span className="text-neutral-300">Fattura Cartacea #48</span>
                          </div>
                          <div className="text-emerald-400 font-sans text-xs">
                            ✓ Tabella Excel: P.IVA, Data, Imponibile, IVA
                          </div>
                          <div className="text-neutral-400 text-[10px]">
                            Export .XLS pronto per il commercialista.
                          </div>
                        </div>
                      )}

                      {tool.previewType === 'video' && (
                        <div className="space-y-1.5">
                          <div className="text-neutral-400 border-b border-neutral-800 pb-1 flex justify-between">
                            <span>Formato:</span>
                            <span className="text-neutral-300">Reel Verticale 9:16</span>
                          </div>
                          <div className="text-emerald-400 font-sans text-xs">
                            ✓ Voce narrante + B-roll 4K + Sottotitoli
                          </div>
                          <div className="text-neutral-400 text-[10px]">
                            Pronto da pubblicare su Instagram e WhatsApp.
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Azione di Prova */}
                  <div className="pt-3 border-t border-neutral-800 flex items-center justify-between">
                    <span className="text-[11px] text-neutral-400">
                      Destinatari: {tool.targetAudience}
                    </span>
                    <button
                      onClick={() => handleSimulateTool(tool)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold bg-neutral-100 hover:bg-white text-neutral-950 px-3 py-1.5 rounded-md transition-colors"
                    >
                      Avvia
                      <ArrowRight className="w-3.5 h-3.5" />
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
              <h2 className="text-2xl font-semibold text-white mb-1">
                Ricariche Flessibili a Consumo
              </h2>
              <p className="text-sm text-neutral-400">
                Nessun vincolo mensile: i crediti non scadono e possono essere usati liberamente per qualsiasi servizio della piattaforma.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {CREDIT_PACKAGES.map((pack) => (
                <div
                  key={pack.id}
                  className={`rounded-xl p-6 flex flex-col justify-between border ${
                    pack.popular
                      ? 'bg-neutral-900 border-white shadow-md'
                      : 'bg-neutral-900/50 border-neutral-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-neutral-300">{pack.name}</span>
                      <span className="text-[10px] font-mono uppercase bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded">
                        {pack.badge}
                      </span>
                    </div>

                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="text-3xl font-semibold text-white">€{pack.priceEur.toFixed(2)}</span>
                      <span className="text-xs text-neutral-400">una tantum</span>
                    </div>

                    <div className="text-xs text-neutral-300 font-mono mb-4">
                      {pack.credits} Crediti ({pack.pricePerCredit})
                    </div>

                    {pack.bonusCredits && (
                      <div className="text-xs font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-900/50 px-2.5 py-1 rounded mb-4">
                        {pack.bonusCredits}
                      </div>
                    )}

                    <p className="text-xs text-neutral-400 mb-6 leading-relaxed">
                      {pack.description}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      alert(`Ricarica simulata: ${pack.credits} crediti accreditati al tuo saldo!`);
                      setSimulatedUserCredits((prev) => prev + pack.credits);
                    }}
                    className={`w-full py-2.5 rounded-lg text-xs font-semibold transition-all ${
                      pack.popular
                        ? 'bg-white text-neutral-950 hover:bg-neutral-200'
                        : 'bg-neutral-800 hover:bg-neutral-700 text-white'
                    }`}
                  >
                    Acquista {pack.credits} Crediti
                  </button>
                </div>
              ))}
            </div>

            {/* Nota per gli iscritti al corso */}
            <div className="mt-8 p-4 rounded-xl border border-neutral-800 bg-neutral-900/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <span className="font-semibold text-white">Iscritto al Corso AI Start o AI Pro?</span> I primi 10 crediti operativi sono già inclusi nel tuo codice studente.
                </div>
              </div>
              <Link
                href="/corsi"
                className="text-white hover:underline font-medium whitespace-nowrap"
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
              <h2 className="text-2xl font-semibold text-white mb-1">
                Due Modi di Vivere l’Intelligenza Artificiale
              </h2>
              <p className="text-sm text-neutral-400">
                Massima comodità chiavi in mano con crediti, oppure totale autonomia senza intermediari.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Opzione 1: Abbonamento Tutor */}
              <div className="rounded-xl border border-neutral-700 bg-neutral-900 p-6 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded">
                    Formula Tutor H24
                  </span>
                  <h3 className="text-lg font-semibold text-white mt-2 mb-1">Abbonamento Campus & Tool</h3>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-3xl font-semibold text-white">€ 9,90</span>
                    <span className="text-xs text-neutral-400">/ mese</span>
                  </div>
                  <div className="text-xs text-neutral-400 mb-6">Disdici in qualsiasi momento con un clic.</div>

                  <ul className="space-y-2.5 text-xs text-neutral-300 mb-8">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span><strong>50 Crediti mensili inclusi</strong> per tutti gli strumenti pratici.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span><strong>Tutor Didattico AI dedicato h24</strong> per chiarire ogni dubbio sulle lezioni.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Accesso prioritario ai modelli linguistici più recenti.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Gruppo Community Telegram con i docenti.</span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => alert('Attivazione abbonamento Campus simulata (€9,90/mese con Stripe)')}
                  className="w-full py-2.5 rounded-lg text-xs font-semibold bg-white text-neutral-950 hover:bg-neutral-200 transition-colors"
                >
                  Attiva Abbonamento Campus
                </button>
              </div>

              {/* Opzione 2: BYOK Personale */}
              <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-6 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase bg-neutral-900 border border-neutral-800 text-neutral-400 px-2 py-0.5 rounded">
                    Per Utenti Avanzati
                  </span>
                  <h3 className="text-lg font-semibold text-white mt-2 mb-1">Porta la Tua Chiave (BYOK)</h3>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-3xl font-semibold text-white">Gratuito</span>
                    <span className="text-xs text-neutral-400">sulla nostra piattaforma</span>
                  </div>
                  <div className="text-xs text-neutral-400 mb-6">Paghi direttamente il fornitore al costo di costo.</div>

                  <ul className="space-y-2.5 text-xs text-neutral-300 mb-8">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-neutral-400 shrink-0" />
                      <span>Inserisci la tua chiave <strong>OpenRouter</strong> o <strong>DeepSeek</strong>.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-neutral-400 shrink-0" />
                      <span>Costo reale di circa <strong>0,0002€ a risposta</strong> (frazioni di centesimo).</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-neutral-400 shrink-0" />
                      <span>Nessuna commissione trattenuta da AIutiamoci.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-neutral-400 shrink-0" />
                      <span>La procedura viene spiegata passo-passo durante il corso.</span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => alert('Apertura pannello inserimento chiave personale')}
                  className="w-full py-2.5 rounded-lg text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors"
                >
                  Configura Chiave Personale (BYOK)
                </button>
              </div>
            </div>

            {/* Box Etico di Trasparenza */}
            <div className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/40 text-xs leading-relaxed text-neutral-400">
              <div className="font-semibold text-neutral-200 mb-1 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-white" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-xl rounded-2xl bg-neutral-900 border border-neutral-700 p-6 shadow-2xl my-8">
            
            {/* Header Modale */}
            <div className="flex items-start justify-between gap-3 mb-5 pb-4 border-b border-neutral-800">
              <div>
                <span className="text-[10px] font-mono uppercase text-neutral-300 bg-neutral-800 border border-neutral-700 px-2 py-0.5 rounded">
                  {activeModalTool.badge}
                </span>
                <h3 className="text-base font-semibold text-white mt-1.5 flex items-center gap-2">
                  {activeModalTool.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveModalTool(null)}
                className="text-neutral-400 hover:text-white text-sm p-1 rounded-md hover:bg-neutral-800 transition-colors"
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
