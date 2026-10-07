'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Video,
  FileText,
  Copy,
  Check,
  Play,
  Flame,
  Layers,
  Send,
  Sliders,
  Eye,
  Download,
  Share2,
  TrendingUp,
  CheckCircle2,
  Clock,
  User,
  Building2,
  Laptop,
  ArrowRight,
  ExternalLink,
  MessageSquare,
  RefreshCw,
  Film,
  Zap,
  ImageIcon,
  SendHorizontal
} from 'lucide-react';

interface ReelScript {
  id: string;
  title: string;
  hookAngle: string;
  target: 'over40' | 'pmi' | 'dipendenti';
  durationSeconds: number;
  hook: string;
  bodyVisuals: {
    time: string;
    action: string;
    audio: string;
    caption: string;
  }[];
  cta: string;
  firstComment: string;
  videoUrl?: string;
  imageUrl?: string;
}

interface SocialPost {
  id: string;
  channel: 'lorenzo_personal' | 'stefano_pmi' | 'aiutiamoci_brand';
  platform: 'instagram' | 'facebook' | 'linkedin';
  hookHeadline: string;
  copy: string;
  hashtags: string[];
  firstComment: string;
}

const PRESET_REELS: ReelScript[] = [
  {
    id: 'reel-1',
    title: 'La tabella Excel da 2 ore in 10 secondi',
    hookAngle: 'Frustrazione lavorativa & Risparmio Tempo',
    target: 'over40',
    durationSeconds: 45,
    hook: 'Se passi ancora le serate a sistemare tabelle Excel riga per riga, fermati un secondo: stai letteralmente regalando ore della tua vita.',
    bodyVisuals: [
      {
        time: '00:00 - 00:04',
        action: 'Lorenzo a mezzobusto che guarda dritto in camera, espressione seria ma empatica.',
        audio: 'Se passi ancora le serate a sistemare tabelle Excel riga per riga, fermati un secondo: stai letteralmente regalando ore della tua vita.',
        caption: 'STAI REGALANDO ORE DELLA TUA VITA'
      },
      {
        time: '00:04 - 00:15',
        action: 'Screencast fluido: Lorenzo incolla un testo disordinato su ChatGPT con un prompt a 3 righe.',
        audio: 'Guarda qui: ho un elenco disordinato con nomi, indirizzi e importi tutti attaccati. Invece di riscriverli uno ad uno...',
        caption: 'NON RISCRIVERE NULLA A MANO'
      },
      {
        time: '00:15 - 00:30',
        action: 'Zoom sullo schermo: l\'AI restituisce la tabella formattata e perfetta.',
        audio: '...gli do questo comando preciso e in 4 secondi ho la tabella pronta da scaricare.',
        caption: 'TABELLA PRONTA IN 4 SECONDI'
      },
      {
        time: '00:30 - 00:45',
        action: 'Lorenzo mostra l\'anteprima della piattaforma Aiutiamoci sullo smartphone / iPad.',
        audio: 'È esattamente quello che insegniamo nel corso pratico di 16 ore di Aiutiamoci. Scrivi "EXCEL" nei commenti e ti mando il link con il coupon del 50% attivo per oggi.',
        caption: 'COMMENTA "EXCEL" PER IL COUPON 50%'
      }
    ],
    cta: 'Commenta "EXCEL" per ricevere la guida al prompt e il coupon 50%',
    firstComment: '👉 Se vuoi imparare questo e altri 19 casi pratici d\'ufficio, trovi il corso completo di 16 ore con certificato qui: aiutiamoci.cloud/corso-base (Usa il coupon SCONTO50 per il 50% di sconto immediato!)'
  },
  {
    id: 'reel-2',
    title: 'Il trucco del Contratto da 30 pagine letto in 30 secondi',
    hookAngle: 'Sicurezza & Difesa da clausole nascoste',
    target: 'pmi',
    durationSeconds: 50,
    hook: 'Ti hanno mai mandato un preventivo o un accordo di 30 pagine scritto fitto fitto e non hai tempo di leggerlo tutto?',
    bodyVisuals: [
      {
        time: '00:00 - 00:05',
        action: 'Stefano con fascicolo cartaceo o laptop in ufficio.',
        audio: 'Ti hanno mai mandato un preventivo o un accordo di 30 pagine scritto fitto fitto e non hai tempo di leggerlo tutto?',
        caption: '30 PAGINE DA LEGGERE?'
      },
      {
        time: '00:05 - 00:20',
        action: 'Caricamento PDF con evidenziazione automatica dei rischi.',
        audio: 'Non firmare mai alla cieca. Trascini il file, usi questo prompt di verifica clausole e l\'AI ti segnala le penali nascoste.',
        caption: 'SCOVA LE PENALI NASCOSTE'
      },
      {
        time: '00:20 - 00:38',
        action: 'Sintesi esecutiva in 3 punti.',
        audio: 'In 30 secondi hai una sintesi esecutiva a punti con esattamente ciò che devi contestare prima di firmare.',
        caption: 'SINTESI IN 3 PUNTI'
      }
    ],
    cta: 'Commenta "CONTRATTO" per il prompt di controllo legale preventivo',
    firstComment: '🛡️ Evita cause e penali. Trovi tutti i template e il modulo contratti nel nostro Hub Imprese: aiutiamoci.cloud/servizi-ai'
  },
  {
    id: 'reel-3',
    title: 'Le Fiabe di Famiglia & Libretti Personalizzati',
    hookAngle: 'Emozione, Genitori & Nonni',
    target: 'over40',
    durationSeconds: 40,
    hook: 'I tuoi figli o nipoti ricorderanno per sempre il libro della buonanotte dove il protagonista sono proprio loro.',
    bodyVisuals: [
      {
        time: '00:00 - 00:05',
        action: 'Lorenzo mostra un libretto illustrato personalizzato per bambini.',
        audio: 'I tuoi figli o nipoti ricorderanno per sempre il libro della buonanotte dove il protagonista sono proprio loro.',
        caption: 'UN REGALO UNICO AL MONDO'
      },
      {
        time: '00:05 - 00:25',
        action: 'Generazione in 4 capitoli con illustrazioni acquerello su Aiutiamoci.',
        audio: 'Basta inserire il nome del bimbo e i suoi sogni: l\'AI crea 4 capitoli illustrati pronti da stampare come libretto.',
        caption: 'FAVOLA & ILLUSTRAZIONI IN 10 SECONDI'
      }
    ],
    cta: 'Commenta "FIABA" per provarlo gratis su Aiutiamoci',
    firstComment: '✨ Crea la fiaba per i tuoi figli o nipoti qui: https://aiutiamoci.cloud/servizi-ai'
  }
];

const PRESET_POSTS: SocialPost[] = [
  {
    id: 'post-lorenzo-1',
    channel: 'lorenzo_personal',
    platform: 'facebook',
    hookHeadline: 'Ho visto persone di 50 anni sentirsi "superate" solo perché nessuno gli ha mai spiegato l\'AI in italiano semplice.',
    copy: `Ho visto persone di 50 anni sentirsi "superate" solo perché nessuno gli ha mai spiegato l'AI in italiano semplice.

La verità? Non serve sapere cosa sia un "Large Language Model" o saper programmare in Python.

Al lavoro ti serve solo sapere:
1. Come farti fare una bozza di preventivo mentre prendi un caffè.
2. Come trovare errori in una fattura senza perdere la vista.
3. Come riassumere 40 pagine di documenti prima di una riunione.

Con la scuola di Aiutiamoci abbiamo creato un percorso di 16 ore certificate pensato esattamente per chi lavora ogni giorno in azienda e non ha tempo da perdere in teorie astratte.

Per la nuova edizione abbiamo attivato un coupon del 50% valido per i primi iscritti.

Chi vuole dare un'occhiata al programma completo trova il link diretto nel primo commento qui sotto 👇`,
    hashtags: ['#FormazioneAI', '#Produttività', '#PiccoleMedieImprese', '#LavoroPratico', '#Aiutiamoci'],
    firstComment: '🔗 Ecco il link al programma e all\'offerta con coupon SCONTO50: https://aiutiamoci.cloud/corso-base (Posti con live tutoraggio limitati)'
  },
  {
    id: 'post-stefano-1',
    channel: 'stefano_pmi',
    platform: 'linkedin',
    hookHeadline: 'Nelle PMI italiane il 30% del tempo di un titolare o impiegato se ne va in scartoffie evitabili.',
    copy: `Nelle PMI italiane il 30% del tempo di un titolare o impiegato se ne va in scartoffie evitabili.

Leggere bandi regionali da 80 pagine, ricopiare fatture su fogli di calcolo, inseguire clienti con solleciti via email.

Nel 2026 tutto questo non ha più senso economico. Con i tool pratici di Aiutiamoci abbiamo integrato motori AI che:
• Estraggono i requisiti di un bando ministeriale in 60 secondi
• Generano preventivi blindati con clausole anti-fuori-sacco
• Trasformano messaggi vocali disordinati di WhatsApp in ordini di lavoro precisi

Zero codice. Solo automazione concreta per far lavorare l'azienda a regime pieno.

Scopri i servizi attivi su: aiutiamoci.cloud/servizi-ai`,
    hashtags: ['#PMI', '#ImpresaDigitale', '#AutomazioneB2B', '#EfficienzaAziendale', '#Aiutiamoci'],
    firstComment: '💼 Per una sessione di audit o dimostrazione per il tuo team: https://aiutiamoci.cloud/servizi-ai'
  }
];

export default function GrowthFactoryStudio() {
  const [selectedTab, setSelectedTab] = useState<'generator' | 'reels' | 'posts'>('generator');
  const [creatorProfile, setCreatorProfile] = useState<'lorenzo' | 'stefano'>('lorenzo');
  const [selectedReel, setSelectedReel] = useState<ReelScript>(PRESET_REELS[0]);
  const [selectedPost, setSelectedPost] = useState<SocialPost>(PRESET_POSTS[0]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form generatore con campi personalizzabili
  const [customTopic, setCustomTopic] = useState('Archivio Ricordi e Restauro Foto');
  const [customBadge, setCustomBadge] = useState('AIUTIAMOCI.CLOUD • MEMORIE DI FAMIGLIA');
  const [customHook, setCustomHook] = useState('Rinnova vecchie foto di famiglia in bianco e nero o rovinate');
  const [customB1, setCustomB1] = useState('📸 1. Pulizia graffi da scansione');
  const [customB2, setCustomB2] = useState('🎨 2. Colorazione realistica dei volti');
  const [customB3, setCustomB3] = useState('🎁 3. File in alta definizione pronto da stampare');
  const [customCta, setCustomCta] = useState('COMMENTA "RICORDO" SOTTO 👇');
  const [customTarget, setCustomTarget] = useState('over40');
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [isGeneratingVisual, setIsGeneratingVisual] = useState(false);
  const [isSendingTelegram, setIsSendingTelegram] = useState(false);
  const [telegramStatus, setTelegramStatus] = useState<string | null>(null);
  const [generatedResult, setGeneratedResult] = useState<any>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // 1. Genera Video MP4 con Pipeline Locale Playwright + FFmpeg
  const handleGenerateVideo1Click = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!customTopic) return;
    setIsGeneratingVideo(true);
    setTelegramStatus(null);

    try {
      const res = await fetch('/api/ai/generate-reel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: customTopic,
          badge: customBadge,
          hook: customHook,
          bullet1: customB1,
          bullet2: customB2,
          bullet3: customB3,
          cta: customCta,
          target: customTarget,
          tone: creatorProfile === 'stefano' ? 'stefano' : 'lorenzo'
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Errore generazione video');

      setGeneratedResult((prev: any) => ({
        ...prev,
        ...data,
        videoUrl: data.videoUrl,
        postCopy: data.postCopy,
        firstComment: data.firstComment,
        title: data.title
      }));
    } catch (err: any) {
      alert(`Errore Video: ${err.message}`);
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  // 2. Genera Visual 4K con Agnes AI
  const handleGenerateVisualAgnes = async () => {
    if (!customTopic) return;
    setIsGeneratingVisual(true);
    setTelegramStatus(null);

    try {
      const promptVisual = creatorProfile === 'stefano'
        ? `Caucasian Italian male entrepreneur in a modern bright Italian office analyzing business documents on laptop, high-end professional lighting, authentic Italian corporate environment, photorealistic, 4k: ${customTopic}`
        : `Caucasian Italian family, friendly smiling person holding smartphone with illustrated fairy tale or practical guide, warm Tuscan lighting, high quality photorealistic, 4k: ${customTopic}`;

      const res = await fetch('/api/ai/agnes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'image',
          prompt: promptVisual,
          model: 'agnes-image-2.5-flash',
          size: '1024x1024'
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Errore generazione visual');

      setGeneratedResult((prev: any) => ({
        ...prev,
        imageUrl: data.imageUrl,
        title: prev?.title || customTopic
      }));
    } catch (err: any) {
      alert(`Errore Visual Agnes AI: ${err.message}`);
    } finally {
      setIsGeneratingVisual(false);
    }
  };

  // 3. Invio 1-Click al Canale Telegram Soci Aiutiamoci
  const handleDispatchToTelegram = async () => {
    if (!generatedResult) return;
    setIsSendingTelegram(true);
    setTelegramStatus(null);

    try {
      const res = await fetch('/api/marketing/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: generatedResult.title || customTopic,
          creator: creatorProfile,
          target: customTarget === 'pmi' ? 'PMI & Imprenditori' : 'Over-40 & Famiglie',
          postCopy: generatedResult.postCopy || PRESET_POSTS[0].copy,
          firstComment: generatedResult.firstComment || PRESET_POSTS[0].firstComment,
          imageUrl: generatedResult.imageUrl,
          videoUrl: generatedResult.videoUrl
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Errore invio Telegram');

      setTelegramStatus('✅ Inviato con successo al canale Telegram dei Soci!');
      setTimeout(() => setTelegramStatus(null), 5000);
    } catch (err: any) {
      alert(`Errore Telegram: ${err.message}`);
    } finally {
      setIsSendingTelegram(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090C10] text-slate-100 font-sans antialiased p-4 sm:p-6 lg:p-8">
      {/* Top Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                CABINA DI REGIA SOCIAL & MEDIA AUTOPILOT
              </span>
              <span className="text-xs text-slate-400">Lorenzo & Stefano • Agnes AI + FFmpeg + Telegram</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Growth Studio & Dispatch Social 1-Click
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Genera Reel 9:16, Visual 4K, Copy APEX e inviali direttamente sul gruppo Telegram di Aiutiamoci pronti per essere pubblicati.
            </p>
          </div>

          {/* Selettore Profilo Creatore */}
          <div className="flex items-center p-1.5 bg-slate-900 border border-slate-700 rounded-2xl gap-1">
            <button
              onClick={() => {
                setCreatorProfile('lorenzo');
                setCustomTarget('over40');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                creatorProfile === 'lorenzo'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>🧑‍💻 Profilo Lorenzo (Community/Corsi)</span>
            </button>

            <button
              onClick={() => {
                setCreatorProfile('stefano');
                setCustomTarget('pmi');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                creatorProfile === 'stefano'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>👔 Profilo Stefano (B2B & PMI)</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-6 border-b border-slate-800/60 pb-1">
          <button
            onClick={() => setSelectedTab('generator')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${
              selectedTab === 'generator'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Generatore Autopilot (Video + Visual + Copy)</span>
          </button>

          <button
            onClick={() => setSelectedTab('reels')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${
              selectedTab === 'reels'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>Archivio Reel 9:16</span>
          </button>

          <button
            onClick={() => setSelectedTab('posts')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${
              selectedTab === 'posts'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Post Kit APEX</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto">
        {selectedTab === 'generator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Form Sinistra */}
            <div className="lg:col-span-5 bg-slate-950 rounded-2xl border border-slate-800 p-6 shadow-xl flex flex-col justify-between">
              <div>
                <div className="mb-5">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    {creatorProfile === 'stefano' ? 'Target: Imprese & Professionisti' : 'Target: Famiglie, Corsisti & Over-40'}
                  </span>
                  <h2 className="text-xl font-black text-white mt-1">Crea Contenuto Promozionale</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Seleziona un argomento pronto o scrivine uno personalizzato per generare tutti gli asset.
                  </p>
                </div>

                {/* Quick Preset Buttons */}
                <div className="mb-5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Suggerimenti Rapidi ad Alta Conversione:
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {(creatorProfile === 'stefano'
                      ? [
                          'Bandi regionali e fondo perduto PMI in 60s',
                          'Contratto da 30 pagine verificato con AI',
                          'Preventivo blindato senza contestazioni',
                          'Scanner fatture e scontrini in Excel'
                        ]
                      : [
                          'Tabelle Excel da 2 ore in 10s',
                          'Fiabe illustrate personalizzate per bambini',
                          'Archivio ricordi e restauro foto di famiglia',
                          'Lettere burocratiche INPS spiegate facile'
                        ]
                    ).map((idea, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCustomTopic(idea)}
                        className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-emerald-500/50 transition-colors cursor-pointer"
                      >
                        {idea}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                      1. Titolo Principale del Reel
                    </label>
                    <input
                      type="text"
                      required
                      value={customTopic}
                      onChange={(e) => setCustomTopic(e.target.value)}
                      placeholder="Es. Archivio Ricordi e Restauro Foto..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-amber-400 mb-1">
                      2. Gancio Parlato (Frase d&apos;impatto iniziale)
                    </label>
                    <input
                      type="text"
                      value={customHook}
                      onChange={(e) => setCustomHook(e.target.value)}
                      placeholder="Es. Rinnova vecchie foto di famiglia rovinate..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2">
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      3. I 3 Punti Chiave a Schermo
                    </span>
                    <input
                      type="text"
                      value={customB1}
                      onChange={(e) => setCustomB1(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                      placeholder="Punto 1..."
                    />
                    <input
                      type="text"
                      value={customB2}
                      onChange={(e) => setCustomB2(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                      placeholder="Punto 2..."
                    />
                    <input
                      type="text"
                      value={customB3}
                      onChange={(e) => setCustomB3(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                      placeholder="Punto 3..."
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-emerald-400 mb-1">
                      4. Chiamata all&apos;Azione (CTA Banner)
                    </label>
                    <input
                      type="text"
                      value={customCta}
                      onChange={(e) => setCustomCta(e.target.value)}
                      placeholder='Es. COMMENTA "RICORDO" SOTTO 👇'
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-emerald-300 font-bold placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Bottoni Generazione */}
              <div className="pt-6 space-y-2.5 border-t border-slate-800/80 mt-6">
                <button
                  type="button"
                  onClick={handleGenerateVideo1Click}
                  disabled={isGeneratingVideo || !customTopic}
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition-transform active:scale-[0.98] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                >
                  {isGeneratingVideo ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Montaggio Video 9:16 in corso...</span>
                    </>
                  ) : (
                    <>
                      <Film className="w-4 h-4" />
                      <span>🎬 1. GENERA REEL 9:16 + COPY COMPLETO</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleGenerateVisualAgnes}
                  disabled={isGeneratingVisual || !customTopic}
                  className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-indigo-500/40 text-indigo-300 font-bold text-xs uppercase tracking-wider shadow-lg transition-transform active:scale-[0.98] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                >
                  {isGeneratingVisual ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Generazione Immagine Agnes AI (4K)...</span>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-4 h-4 text-indigo-400" />
                      <span>🖼️ 2. GENERA VISUAL / COPERTINA 4K (AGNES AI)</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Risultato Destra: Player Video, Visual & Dispatch Telegram */}
            <div className="lg:col-span-7 bg-slate-950 rounded-2xl border border-slate-800 p-6 shadow-xl flex flex-col justify-between">
              {generatedResult ? (
                <div className="space-y-6">
                  {/* Header Risultato con Invio Telegram */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                        Asset Generati con Successo
                      </span>
                      <h3 className="text-base font-bold text-white mt-0.5">{generatedResult.title}</h3>
                    </div>

                    <button
                      onClick={handleDispatchToTelegram}
                      disabled={isSendingTelegram}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-blue-600/30 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                    >
                      {isSendingTelegram ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Inviando al canale...</span>
                        </>
                      ) : (
                        <>
                          <SendHorizontal className="w-3.5 h-3.5" />
                          <span>📱 INVIA SUL TELEGRAM DEI SOCI</span>
                        </>
                      )}
                    </button>
                  </div>

                  {telegramStatus && (
                    <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-xs font-bold text-emerald-300 text-center animate-fade-in">
                      {telegramStatus}
                    </div>
                  )}

                  {/* Media Grid: Video + Immagine Agnes */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                    {/* Video Player se presente */}
                    {generatedResult.videoUrl && (
                      <div className="md:col-span-5 flex flex-col items-center">
                        <div className="w-[190px] aspect-[9/16] rounded-2xl overflow-hidden border-2 border-slate-700 bg-black shadow-2xl relative">
                          <video
                            src={generatedResult.videoUrl}
                            controls
                            autoPlay
                            loop
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <a
                          href={generatedResult.videoUrl}
                          download={`reel-${Date.now()}.mp4`}
                          className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 text-xs font-bold hover:text-white transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Scarica Video MP4</span>
                        </a>
                      </div>
                    )}

                    {/* Immagine Agnes AI se presente */}
                    {generatedResult.imageUrl && (
                      <div className={`${generatedResult.videoUrl ? 'md:col-span-7' : 'md:col-span-12'} flex flex-col`}>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 mb-1.5">
                          Visual 4K Agnes AI (Copertina Post / Banner)
                        </span>
                        <div className="rounded-xl overflow-hidden border border-slate-700 shadow-xl bg-slate-900 relative">
                          <img
                            src={generatedResult.imageUrl}
                            alt="Visual Promozionale"
                            className="w-full h-48 sm:h-56 object-cover"
                          />
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <a
                            href={generatedResult.imageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-indigo-400 hover:underline flex items-center gap-1 font-semibold"
                          >
                            <span>Visualizza alta risoluzione</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Copy & Commento */}
                  <div className="space-y-4 pt-2 border-t border-slate-800">
                    <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                          Testo Post (Instagram / Facebook / LinkedIn)
                        </span>
                        <button
                          onClick={() => handleCopy(generatedResult.postCopy, 'post-gen')}
                          className="text-xs text-emerald-400 font-bold hover:underline"
                        >
                          {copiedId === 'post-gen' ? 'Copiato!' : 'Copia Testo'}
                        </button>
                      </div>
                      <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed font-sans max-h-40 overflow-y-auto">
                        {generatedResult.postCopy}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                          Primo Commento (con Link e Coupon)
                        </span>
                        <button
                          onClick={() => handleCopy(generatedResult.firstComment, 'comm-gen')}
                          className="text-xs text-slate-400 font-bold hover:text-white"
                        >
                          {copiedId === 'comm-gen' ? 'Copiato!' : 'Copia'}
                        </button>
                      </div>
                      <p className="text-xs font-mono text-slate-300 bg-slate-950 p-2 rounded border border-slate-800">
                        {generatedResult.firstComment}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-800 rounded-xl">
                  <Sparkles className="w-12 h-12 text-slate-600 mb-3" />
                  <h3 className="text-base font-bold text-slate-300">Nessun contenuto ancora generato</h3>
                  <p className="text-xs text-slate-500 max-w-sm mt-1">
                    Scegli un profilo (Lorenzo o Stefano), clicca su Genera e troverai qui il video, l&apos;immagine 4K e il post pronto da inviare con 1 clic su Telegram.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: ARCHIVIO REELS */}
        {selectedTab === 'reels' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 space-y-3">
              {PRESET_REELS.map((reel) => (
                <div
                  key={reel.id}
                  onClick={() => setSelectedReel(reel)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedReel.id === reel.id
                      ? 'bg-slate-900/90 border-emerald-500/50'
                      : 'bg-slate-950/60 border-slate-800'
                  }`}
                >
                  <span className="text-xs text-emerald-400 font-bold">{reel.hookAngle}</span>
                  <h4 className="text-sm font-bold text-white mt-1">{reel.title}</h4>
                </div>
              ))}
            </div>

            <div className="lg:col-span-8 bg-slate-950 rounded-2xl border border-slate-800 p-6">
              <h2 className="text-xl font-bold text-white mb-4">{selectedReel.title}</h2>
              <div className="space-y-3">
                {selectedReel.bodyVisuals.map((v, i) => (
                  <div key={i} className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-xs">
                    <span className="font-mono text-emerald-400 font-bold">{v.time}</span> • {v.audio}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB: POSTS */}
        {selectedTab === 'posts' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {PRESET_POSTS.map((post) => (
              <div key={post.id} className="bg-slate-950 rounded-2xl border border-slate-800 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    post.channel === 'stefano_pmi' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-indigo-950 text-indigo-400 border border-indigo-800'
                  }`}>
                    {post.channel === 'stefano_pmi' ? '👔 Stefano (PMI / B2B)' : '🧑‍💻 Lorenzo (Community)'}
                  </span>
                  <button
                    onClick={() => handleCopy(post.copy, post.id)}
                    className="text-xs text-emerald-400 font-bold hover:underline cursor-pointer"
                  >
                    {copiedId === post.id ? 'Copiato!' : 'Copia Post'}
                  </button>
                </div>
                <h3 className="text-sm font-bold text-white">{post.hookHeadline}</h3>
                <div className="p-4 bg-slate-900 rounded-xl text-xs whitespace-pre-line text-slate-300 leading-relaxed max-h-60 overflow-y-auto">
                  {post.copy}
                </div>
                <div className="text-[11px] font-mono text-slate-400 bg-slate-900 p-2.5 rounded border border-slate-800">
                  {post.firstComment}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
