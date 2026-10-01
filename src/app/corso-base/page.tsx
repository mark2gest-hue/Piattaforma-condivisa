'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Play,
  ShieldCheck,
  Clock,
  Award,
  Sparkles,
  Users,
  ChevronDown,
  ArrowRight,
  Zap,
  Lock,
  MessageSquare,
  HelpCircle,
  FileCheck,
  Star,
  Check,
  AlertCircle
} from 'lucide-react';

export default function CorsoBaseFunnelPage() {
  const [couponCode, setCouponCode] = useState('SCONTO50');
  const [couponApplied, setCouponApplied] = useState(true);
  const [couponFeedback, setCouponFeedback] = useState<string>('Coupon attivo: 50% di sconto applicato!');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [isPlayingVsl, setIsPlayingVsl] = useState(false);

  // Prezzi calcolati
  const originalPrice = 298;
  const discountedPrice = couponApplied ? 149 : 298;
  const installmentPrice = (discountedPrice / 3).toFixed(2).replace('.', ',');

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.trim().toUpperCase() === 'SCONTO50' || couponCode.trim().toUpperCase() === 'LORENZO50') {
      setCouponApplied(true);
      setCouponFeedback('Sconto del 50% verificato con successo!');
    } else {
      setCouponApplied(false);
      setCouponFeedback('Codice non valido o scaduto.');
    }
  };

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#0A0D14] text-slate-100 selection:bg-emerald-500 selection:text-white font-sans antialiased">
      {/* Top Banner Scarsità & Promozione */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900/90 to-teal-950 border-b border-emerald-500/30 px-4 py-2.5 text-center text-xs sm:text-sm font-medium text-emerald-200 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex items-center justify-center gap-2 flex-wrap">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse">
            EDIZIONE SPECIALE
          </span>
          <span>
            Coupon di lancio <strong className="text-emerald-100 underline decoration-emerald-400 font-mono">SCONTO50</strong> attivo: risparmi il 50% sull&apos;iscrizione immediata.
          </span>
          <span className="hidden md:inline text-emerald-400/80">•</span>
          <span className="text-emerald-300/90 font-semibold">Posti rimasti per il tutoraggio live: solo 14</span>
        </div>
      </div>

      {/* Hero & VSL Section */}
      <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden">
        {/* Subtle Ambient Background Gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-emerald-600/10 blur-[130px] rounded-full pointer-events-none -z-10" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-teal-500/5 blur-[100px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Micro-label Header */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/80 shadow-inner mb-6">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Percorso Pratico per Persone Normali & Professionisti Over-40
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.15] mb-6">
            Impara a usare l&apos;Intelligenza Artificiale per il tuo lavoro <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200">senza formule matematiche</span> né gergo da programmatori.
          </h1>

          {/* Subheadline */}
          <p className="text-base sm:text-lg md:text-xl text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed mb-10">
            Dalle email alle relazioni, dalla lettura dei bilanci alla gestione clienti: 16 ore pratiche certificate (EQF/DigComp 2.2) con Lorenzo e il team di Aiutiamoci per risparmiare 2 ore al giorno da subito.
          </p>

          {/* VSL Player 16:9 Frame */}
          <div className="max-w-4xl mx-auto relative rounded-2xl p-1 sm:p-2 bg-gradient-to-b from-slate-700/50 via-slate-800/40 to-slate-900/80 border border-slate-700/60 shadow-2xl shadow-black/80">
            <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-950 flex flex-col items-center justify-center group">
              {!isPlayingVsl ? (
                <>
                  {/* Poster / Thumbnail Mock */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-slate-950/40 flex flex-col justify-between p-6 sm:p-8 text-left">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700/70 px-3 py-1 rounded-full text-xs font-medium text-slate-300">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                        Video di Presentazione Ufficiale (3 Min)
                      </div>
                      <div className="text-xs font-semibold text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-800">
                        HD 1080p
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Guarda la spiegazione di Lorenzo</span>
                      <h3 className="text-lg sm:text-2xl font-bold text-white mt-1">Cosa saprai fare davvero dopo 16 ore di corso pratico</h3>
                    </div>
                  </div>

                  {/* Big Play Button */}
                  <button
                    onClick={() => setIsPlayingVsl(true)}
                    aria-label="Avvia video presentazione"
                    className="relative z-10 w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center pl-1.5 shadow-xl shadow-emerald-500/40 transition-transform duration-200 hover:scale-110 active:scale-95 group-hover:bg-emerald-400 cursor-pointer"
                  >
                    <Play className="w-10 h-10 sm:w-12 sm:h-12 fill-slate-950" />
                  </button>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                  <div className="max-w-md p-6 bg-slate-900/90 rounded-xl border border-slate-700">
                    <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                    <h4 className="text-lg font-bold text-white">Video Presentazione in Caricamento</h4>
                    <p className="text-sm text-slate-300 mt-1">
                      Sessione di anteprima con Lorenzo • Se desideri saltare direttamente al programma completo, scorri verso il basso.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Social Proof Bar under VSL */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm text-slate-400 font-medium">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-7 h-7 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold text-slate-300">
                    {['MC', 'AB', 'LR', 'GF'][i - 1]}
                  </div>
                ))}
              </div>
              <span><strong className="text-slate-100">+240</strong> corsisti formati</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-400">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-slate-200 font-semibold">4.9/5</span>
              <span className="text-slate-400">(recensioni verificate)</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Garanzia 14 giorni soddisfatti o rimborsati</span>
            </div>
          </div>
        </div>
      </section>

      {/* Target Audience & Reality Check (Anti-Slop) */}
      <section className="py-16 bg-slate-900/60 border-y border-slate-800/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              A chi è rivolto questo percorso?
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-2">
              Abbiamo eliminato la teoria astratta e i gerghi complessi per concentrarci esclusivamente sull&apos;impatto operativo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Professionisti & Impiegati Over-40</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Chi lavora ogni giorno tra Word, Excel, email e documenti e vuole imparare a delegare le mansioni noiose e ripetitive in pochi clic.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Titolari di PMI & Liberi Professionisti</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Chi deve gestire preventivi, comunicazioni commerciali e sintesi di mercato senza budget milionari e senza dover assumere un programmatore.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Chi parte da zero e teme di restare indietro</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Chi non ha mai scritto una riga di codice, non vuole fare figuracce con i colleghi e cerca un metodo guidato passo passo in lingua italiana.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Programma Didattico 16 Ore Certificate EQF */}
      <section className="py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-4">
            Standard DigComp 2.2 • Blended Learning
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Cosa imparerai nelle 16 Ore di Formazione
          </h2>
          <p className="text-slate-300 text-base sm:text-lg mt-3">
            La combinazione perfetta tra video pillole on-demand, sessioni di tutoraggio dal vivo e missioni pratiche con correzione automatica.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pillar 1 */}
          <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/80 border border-slate-800 relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Modulo 1 • 4 Ore</span>
                <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded border border-slate-700">FAD Asincrona</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">20 Video Lezioni Pratiche (Microlearning)</h3>
              <p className="text-sm text-slate-300 leading-relaxed mb-4">
                Pillole da 10-12 minuti con condivisione schermo su ChatGPT, Claude e DeepSeek. Dalla scrittura del prompt professionale alla creazione di tabelle e report in pochi secondi.
              </p>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Metodo RCCF (Ruolo, Contesto, Compito, Formato)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Analisi immediata di PDF, contratti e bilanci</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Come eliminare del tutto le &quot;allucinazioni&quot; dell&apos;AI</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/80 border border-slate-800 relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-400">Modulo 2 • 4 Ore</span>
                <span className="text-xs bg-teal-950/80 text-teal-300 px-2.5 py-1 rounded border border-teal-800/60">Live Interattivo</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Live Workshop & Q&A con Lorenzo</h3>
              <p className="text-sm text-slate-300 leading-relaxed mb-4">
                Sessioni dal vivo su Google Meet per fare domande dirette, risolvere i casi specifici della tua professione e vedere correzioni in tempo reale dei tuoi prompt.
              </p>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>Laboratorio sui tuoi casi aziendali reali</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>Registrazioni integrali sempre disponibili per il ripasso</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>Gruppo riservato di supporto tra colleghi</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/80 border border-slate-800 relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Modulo 3 • 6 Ore</span>
                <span className="text-xs bg-cyan-950/80 text-cyan-300 px-2.5 py-1 rounded border border-cyan-800/60">Simulatore Interattivo</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Laboratorio Guidato: 5 Missioni Pratiche</h3>
              <p className="text-sm text-slate-300 leading-relaxed mb-4">
                La &quot;Zona Compiti&quot; interattiva della piattaforma: metti alla prova le tue abilità creando agenti e prompt con il Tutor AI che ti corregge all&apos;istante.
              </p>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Feedback immediato e punteggio di accuratezza</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Costruzione di assistenti per email, preventivi e sintesi</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Esercizi salvati nel tuo portfolio personale</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Pillar 4 */}
          <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/80 border border-slate-800 relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Modulo 4 • 2 Ore</span>
                <span className="text-xs bg-amber-950/80 text-amber-300 px-2.5 py-1 rounded border border-amber-800/60">Esame & Attestato</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Dispense PDF & Certificato Ufficiale</h3>
              <p className="text-sm text-slate-300 leading-relaxed mb-4">
                Manuali operativi pronti da stampare con tutti i template di prompt, test di valutazione finale da 20 quesiti e rilascio attestato con codice univoco verificabile.
              </p>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Certificato 16 Ore con QR Code anti-contraffazione</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Riconoscimento delle competenze su LinkedIn e CV</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Accesso a vita a tutti gli aggiornamenti futuri</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing / Checkout Offer Box */}
      <section id="iscriviti" className="py-16 bg-gradient-to-b from-slate-900 to-[#0A0D14] border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
              Iscrizione Immediata • Garanzia Totale
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mt-2">
              Inizia oggi il tuo percorso pratico
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-2">
              Scegli il pagamento in un&apos;unica soluzione o in 3 comode rate a tasso zero con Klarna/PayPal.
            </p>
          </div>

          <div className="relative rounded-3xl bg-slate-950 border-2 border-emerald-500/40 p-6 sm:p-10 shadow-2xl shadow-emerald-950/40">
            {/* Top Badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-slate-950 text-xs font-extrabold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
              Offerta Lancio Ufficiale
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Details */}
              <div className="lg:col-span-7 space-y-4">
                <h3 className="text-2xl font-bold text-white">Pacchetto Completo &quot;AI Pratica 16h&quot;</h3>
                <p className="text-sm text-slate-300">
                  Tutto ciò che ti serve per padroneggiare l&apos;AI nel tuo lavoro quotidiano, senza abbonamenti ricorrenti nascosti.
                </p>

                <div className="space-y-2.5 pt-2">
                  {[
                    '20 Video Lezioni Asincrone ad alta definizione (4 Ore)',
                    'Sessioni Live Webinar & Q&A con Lorenzo (4 Ore)',
                    'Accesso al Simulatore & Laboratorio 5 Missioni (6 Ore)',
                    'Dispense operative PDF e Prompt Kit pronti all\'uso',
                    'Esame Finale e Attestato Ufficiale di 16 Ore con QR Code',
                    'Accesso Illimitato e a vita alla piattaforma',
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-sm text-slate-200">
                      <Check className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                {/* Coupon Input */}
                <form onSubmit={handleApplyCoupon} className="pt-4 flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Codice Coupon (es. SCONTO50)"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 uppercase tracking-wider font-mono font-bold"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold uppercase rounded-xl border border-slate-600 transition-colors cursor-pointer"
                  >
                    Applica
                  </button>
                </form>
                {couponFeedback && (
                  <p className={`text-xs font-semibold ${couponApplied ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {couponFeedback}
                  </p>
                )}
              </div>

              {/* Right Price Card */}
              <div className="lg:col-span-5 bg-slate-900/90 rounded-2xl p-6 border border-slate-800 text-center flex flex-col justify-between h-full">
                <div>
                  <div className="text-slate-400 text-xs font-medium uppercase tracking-wider">Prezzo di Listino</div>
                  <div className="text-slate-500 line-through text-lg font-bold">€{originalPrice},00</div>

                  <div className="mt-2 text-4xl sm:text-5xl font-black text-white tracking-tight">
                    €{discountedPrice}
                    <span className="text-base font-normal text-slate-400"> / una tantum</span>
                  </div>

                  <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold">
                    <Zap className="w-3.5 h-3.5" />
                    <span>oppure in 3 rate da <strong>€{installmentPrice}</strong></span>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <Link
                    href={`/checkout?course=corso-base&coupon=${couponApplied ? couponCode : ''}`}
                    className="w-full inline-flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-base shadow-lg shadow-emerald-500/30 transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <span>ISCRIVITI AL CORSO ORA</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>

                  <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Pagamento sicuro crittografato SSL 256-bit</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Domande Frequenti</h2>
          <p className="text-slate-400 text-sm mt-1">Tutto quello che c&apos;è da sapere prima di iniziare.</p>
        </div>

        <div className="space-y-3">
          {[
            {
              q: 'Non ho mai usato l\'intelligenza artificiale: riuscirò a seguire?',
              a: 'Assolutamente sì. Il corso è progettato specificamente per chi parte da zero o ha solo provato ChatGPT per curiosità. Non useremo formule matematiche o codice: vedrai solo esempi pratici applicabili al lavoro d\'ufficio quotidiano.'
            },
            {
              q: 'Come funzionano le 16 ore certificate?',
              a: 'Il monte ore è strutturato secondo il modello Blended Learning: 4 ore di video lezioni asincrone on-demand, 4 ore di workshop live e Q&A con Lorenzo, 6 ore di laboratorio pratico con missioni guidate e 2 ore dedicate allo studio dispense e test finale.'
            },
            {
              q: 'Se non posso partecipare alle sessioni live, perdo le ore?',
              a: 'No! Tutte le sessioni dal vivo vengono registrate e caricate in alta definizione nella tua area riservata entro poche ore, con possibilità di inviare domande al docente in qualsiasi momento.'
            },
            {
              q: 'Qual è la politica di rimborso?',
              a: 'Hai 14 giorni di tempo dall\'acquisto per provare la piattaforma. Se ritieni che il corso non faccia al caso tuo, ti basta inviarci un\'email e ti rimborseremo il 100% dell\'importo pagato, senza domande.'
            },
            {
              q: 'L\'attestato è valido per il curriculum vitae e LinkedIn?',
              a: 'Sì. Al superamento del test finale riceverai un certificato nominativo con monte ore (16h), competenze acquisite e codice univoco con QR Code per la verifica istantanea da parte di datori di lavoro o committenti.'
            }
          ].map((faq, idx) => (
            <div
              key={idx}
              className="rounded-xl bg-slate-900/70 border border-slate-800 overflow-hidden transition-colors"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full px-5 py-4 text-left font-semibold text-sm sm:text-base text-white flex items-center justify-between gap-4 cursor-pointer"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-slate-400 transition-transform duration-200 shrink-0 ${
                    activeFaq === idx ? 'rotate-180 text-emerald-400' : ''
                  }`}
                />
              </button>
              {activeFaq === idx && (
                <div className="px-5 pb-4 text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer Minimal Funnel */}
      <footer className="py-8 border-t border-slate-900 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto px-4 space-y-2">
          <p>© {new Date().getFullYear()} Aiutiamoci.cloud • Piattaforma di Formazione Pratica all&apos;Intelligenza Artificiale.</p>
          <div className="flex items-center justify-center gap-4 text-slate-400">
            <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
            <span>•</span>
            <Link href="/termini" className="hover:underline">Termini di Servizio</Link>
            <span>•</span>
            <a href="mailto:supporto@aiutiamoci.cloud" className="hover:underline">Assistenza</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
