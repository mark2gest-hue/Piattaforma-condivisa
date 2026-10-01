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
  Zap
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
}

interface SocialPost {
  id: string;
  channel: 'lorenzo_personal' | 'aiutiamoci_brand';
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
        action: 'Lorenzo con fascicolo cartaceo in mano.',
        audio: 'Ti hanno mai mandato un preventivo o un accordo di 30 pagine scritto fitto fitto e non hai tempo di leggerlo tutto?',
        caption: '30 PAGINE DA LEGGERE?'
      },
      {
        time: '00:05 - 00:20',
        action: 'Caricamento PDF su Claude con evidenziazione automatica dei rischi.',
        audio: 'Non firmare mai alla cieca. Trascini il file, usi questo prompt di verifica clausole e l\'AI ti segnala le penali nascoste.',
        caption: 'SCOVA LE PENALI NASCOSTE'
      },
      {
        time: '00:20 - 00:38',
        action: 'Sintesi esecutiva in 3 punti.',
        audio: 'In 30 secondi hai una sintesi esecutiva a punti con esattamente ciò che devi contestare prima di firmare.',
        caption: 'SINTESI ESECUTIVA IN 30 SECONDI'
      },
      {
        time: '00:38 - 00:50',
        action: 'Lorenzo invita a commentare.',
        audio: 'Vuoi imparare a proteggere il tuo lavoro senza dover diventare un avvocato? Commenta "CONTRATTO" e ti invio l\'accesso.',
        caption: 'COMMENTA "CONTRATTO"'
      }
    ],
    cta: 'Commenta "CONTRATTO" per il prompt anti-clausole e il link riservato',
    firstComment: '🔒 Per scoprire come analizzare bilanci, fatture e contratti senza errori: aiutiamoci.cloud/corso-base — Inserisci il codice SCONTO50 al checkout!'
  }
];

const PRESET_POSTS: SocialPost[] = [
  {
    id: 'post-1',
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
  }
];

export default function GrowthFactoryStudio() {
  const [selectedTab, setSelectedTab] = useState<'reels' | 'posts' | 'generator'>('generator');
  const [selectedReel, setSelectedReel] = useState<ReelScript>(PRESET_REELS[0]);
  const [selectedPost, setSelectedPost] = useState<SocialPost>(PRESET_POSTS[0]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form per generatore personalizzato
  const [customTopic, setCustomTopic] = useState('Organizzare preventivi e fatture con AI');
  const [customTarget, setCustomTarget] = useState('over40');
  const [customTone, setCustomTone] = useState('lorenzo');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<any>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleGenerateVideo1Click = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTopic) return;
    setIsGenerating(true);
    setGeneratedResult(null);

    try {
      const res = await fetch('/api/ai/generate-reel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: customTopic,
          target: customTarget,
          tone: customTone
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Errore generazione');

      setGeneratedResult(data);

      const newReel: ReelScript = {
        id: data.videoId,
        title: data.title,
        hookAngle: 'Efficienza & Soluzione Immediata',
        target: customTarget as any,
        durationSeconds: data.duration,
        hook: data.hook,
        bodyVisuals: [
          {
            time: '00:00 - 00:05',
            action: 'Lorenzo con grafica cubitale di avvio.',
            audio: data.hook,
            caption: 'BASTA SPRECARE ORE'
          },
          {
            time: '00:05 - 00:20',
            action: 'Dimostrazione pratica a schermo del metodo.',
            audio: `Ecco come automatizzare ${data.title} in 3 semplici passaggi con l'AI.`,
            caption: 'SOLUZIONE IN 3 PASSAGGI'
          },
          {
            time: '00:20 - 00:35',
            action: 'Invito al corso 16 ore con coupon.',
            audio: 'Commenta GUIDA per ricevere il template e lo sconto del 50%.',
            caption: 'COMMENTA "GUIDA"'
          }
        ],
        cta: 'Commenta "GUIDA" per il template e il coupon SCONTO50',
        firstComment: data.firstComment,
        videoUrl: data.videoUrl
      };

      setSelectedReel(newReel);
    } catch (err: any) {
      alert(`Errore: ${err.message}`);
    } finally {
      setIsGenerating(false);
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
                PRODUZIONE AUTOPILOT 1-CLICK
              </span>
              <span className="text-xs text-slate-400">Zero Editing Manuale • FFmpeg + Audio + Copy</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Video Studio Factory & Copy Kit APEX
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Generatore automatico di Reel verticali 9:16 completi di video, audio parlato e post promozionale per Lorenzo.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/corso-base"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-slate-200 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <Eye className="w-4 h-4 text-emerald-400" />
              <span>Vedi Funnel `/corso-base`</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
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
            <span>Generatore 1-Click (Video MP4 + Copy)</span>
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
        {/* TAB: 1-CLICK GENERATOR */}
        {selectedTab === 'generator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Form Sinistra */}
            <div className="lg:col-span-5 bg-slate-950 rounded-2xl border border-slate-800 p-6 shadow-xl">
              <div className="mb-6">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Semplicità Totale per Lorenzo
                </span>
                <h2 className="text-xl font-black text-white mt-1">Genera Reel + Post Pronto</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Inserisci solo il tema o scegli un suggerimento rapido: il sistema monta il video MP4 e scrive il post.
                </p>
              </div>

              {/* Quick Preset Buttons */}
              <div className="mb-4">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Idee Veloci ad Alta Conversione:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Tabelle Excel da 2 ore in 10s',
                    'Contratto di 30 pagine letto in 30s',
                    'Email diplomatica al cliente arrabbiato',
                    'Bozza di preventivo in 3 clic'
                  ].map((idea, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCustomTopic(idea)}
                      className="text-xs px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-emerald-500/50 transition-colors"
                    >
                      {idea}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleGenerateVideo1Click} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Argomento del Video
                  </label>
                  <input
                    type="text"
                    required
                    value={customTopic}
                    onChange={(e) => setCustomTopic(e.target.value)}
                    placeholder="Es. Leggere fatture complesse con l'AI..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Pubblico Target
                    </label>
                    <select
                      value={customTarget}
                      onChange={(e) => setCustomTarget(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                    >
                      <option value="over40">Over-40 / Impiegati</option>
                      <option value="pmi">PMI / Negozi</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Voce Narrante
                    </label>
                    <select
                      value={customTone}
                      onChange={(e) => setCustomTone(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                    >
                      <option value="lorenzo">Italiano Naturale (Federica/Alice)</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isGenerating || !customTopic}
                  className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-emerald-500/30 transition-transform active:scale-[0.98] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 mt-4"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Montaggio Video MP4 & Audio in corso...</span>
                    </>
                  ) : (
                    <>
                      <Film className="w-4 h-4" />
                      <span>🎬 GENERA VIDEO MP4 & POST PRONTO</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Risultato Destra: Player Video & Copy */}
            <div className="lg:col-span-7 bg-slate-950 rounded-2xl border border-slate-800 p-6 shadow-xl flex flex-col justify-between">
              {generatedResult ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                        Video 9:16 Esportato con Successo! ({generatedResult.duration}s)
                      </span>
                    </div>

                    <a
                      href={generatedResult.videoUrl}
                      download={`reel-${Date.now()}.mp4`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-400 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Scarica MP4</span>
                    </a>
                  </div>

                  {/* 9:16 Video Player Preview */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                    <div className="md:col-span-5 flex justify-center">
                      <div className="w-[220px] aspect-[9/16] rounded-2xl overflow-hidden border-2 border-slate-700 bg-black shadow-2xl relative">
                        <video
                          src={generatedResult.videoUrl}
                          controls
                          autoPlay
                          loop
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    {/* Copy Post & Commento */}
                    <div className="md:col-span-7 space-y-4">
                      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                            Testo Post (Instagram / Facebook)
                          </span>
                          <button
                            onClick={() => handleCopy(generatedResult.postCopy, 'post-gen')}
                            className="text-xs text-emerald-400 font-bold hover:underline"
                          >
                            {copiedId === 'post-gen' ? 'Copiato!' : 'Copia Testo'}
                          </button>
                        </div>
                        <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed font-sans max-h-48 overflow-y-auto">
                          {generatedResult.postCopy}
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                            Primo Commento con Link Funnel
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
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-800 rounded-xl">
                  <Film className="w-12 h-12 text-slate-600 mb-3" />
                  <h3 className="text-base font-bold text-slate-300">Nessun video ancora generato</h3>
                  <p className="text-xs text-slate-500 max-w-sm mt-1">
                    Seleziona un&apos;idea a sinistra e clicca sul pulsante verde: vedrai apparire l&apos;anteprima del video montato con audio e testo pronto per la pubblicazione.
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
          <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6">
            <h2 className="text-lg font-bold text-white mb-4">Post Kit APEX per Social Media</h2>
            <div className="p-4 bg-slate-900 rounded-xl text-sm whitespace-pre-line text-slate-200">
              {PRESET_POSTS[0].copy}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
