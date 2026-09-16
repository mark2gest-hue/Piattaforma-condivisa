'use client'

import { useState, useEffect } from 'react'
import { ShieldCheck, Cookie, X, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface LegalModalProps {
  isOpen: boolean
  onClose: () => void
  type: 'privacy' | 'cookies' | 'terms' | 'disclaimer' | null
}

export function LegalModal({ isOpen, onClose, type }: LegalModalProps) {
  if (!isOpen || !type) return null

  const titles = {
    privacy: 'Informativa sulla Privacy (GDPR UE 2016/679)',
    cookies: 'Cookie Policy & Tracciamento',
    terms: 'Termini e Condizioni d\'Uso del Servizio',
    disclaimer: 'Disclaimer Didattico & Dichiarazione di Non Responsabilità',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden text-slate-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-5 w-5 text-indigo-400" />
            <h3 className="font-bold text-base text-white">{titles[type]}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
          {type === 'privacy' && (
            <>
              <p className="text-slate-400 font-medium">Ultimo aggiornamento: Settembre 2026</p>
              <h4 className="font-bold text-white text-base">1. Titolare del Trattamento</h4>
              <p>
                Il portale <strong>aiutiamoci.cloud</strong> tratta i dati personali raccolti tramite questionari, registrazioni e comunicazioni email nel pieno rispetto del Regolamento Generale sulla Protezione dei Dati (GDPR - UE 2016/679).
              </p>
              <h4 className="font-bold text-white text-base">2. Tipologia di Dati Raccolti</h4>
              <p>
                Raccogliamo esclusivamente dati forniti volontariamente dall'utente: nome, indirizzo email, codice studente generato e preferenze espresse nei questionari formativi per la personalizzazione dell'esperienza didattica.
              </p>
              <h4 className="font-bold text-white text-base">3. Finalità e Base Giuridica</h4>
              <p>
                I dati sono trattati esclusivamente per: erogazione dei corsi, invio del codice di accesso, comunicazioni operative sulle lezioni e invio degli attestati. Non cediamo né vendiamo dati a terze parti commerciali.
              </p>
              <h4 className="font-bold text-white text-base">4. Diritti dell'Interessato</h4>
              <p>
                In qualsiasi momento puoi richiedere la verifica, modifica o cancellazione integrale dei tuoi dati scrivendo all'indirizzo dedicato: <span className="text-indigo-400 font-mono">info@aiutiamoci.cloud</span>.
              </p>
            </>
          )}

          {type === 'cookies' && (
            <>
              <p className="text-slate-400 font-medium">Ultimo aggiornamento: Settembre 2026</p>
              <h4 className="font-bold text-white text-base">1. Cosa sono i Cookie</h4>
              <p>
                I cookie sono piccoli file di testo salvati sul tuo dispositivo durante la navigazione su aiutiamoci.cloud per garantire il corretto funzionamento delle sessioni e salvare le preferenze dell'interfaccia.
              </p>
              <h4 className="font-bold text-white text-base">2. Cookie Tecnici Essenziali</h4>
              <p>
                Utilizziamo cookie tecnici strettamente necessari per gestire l'autenticazione degli studenti, il mantenimento del codice di accesso e le preferenze del tema (dark/light mode). Questi cookie non richiedono preventivo consenso esplicito poiché indispensabili all'erogazione del servizio.
              </p>
              <h4 className="font-bold text-white text-base">3. Cookie di Terze Parti</h4>
              <p>
                Non utilizziamo cookie di profilazione invasiva o tracciamento pubblicitario cross-site. Eventuali integrazioni video (es. player didattico) utilizzano parametri ad alta privacy.
              </p>
            </>
          )}

          {type === 'terms' && (
            <>
              <p className="text-slate-400 font-medium">Ultimo aggiornamento: Settembre 2026</p>
              <h4 className="font-bold text-white text-base">1. Oggetto del Servizio</h4>
              <p>
                aiutiamoci.cloud fornisce l'accesso a contenuti formativi digitali, video lezioni registrate, materiale di supporto in formato PDF, workspace interattivi e assistenti AI didattici.
              </p>
              <h4 className="font-bold text-white text-base">2. Codice di Accesso e Responsabilità</h4>
              <p>
                Il codice di accesso univoco (es. AI-START-XXXXX) è personale e non cedibile a terzi. L'utente è responsabile della custodia del proprio codice.
              </p>
              <h4 className="font-bold text-white text-base">3. Proprietà Intellettuale</h4>
              <p>
                Tutti i video, le dispense didattiche, i prompt e gli schemi operativi presenti sulla piattaforma sono di esclusiva proprietà intellettuale di aiutiamoci.cloud e dei rispettivi autori. È vietata la ridistribuzione pubblica o commerciale non autorizzata.
              </p>
            </>
          )}

          {type === 'disclaimer' && (
            <>
              <p className="text-slate-400 font-medium">Ultimo aggiornamento: Settembre 2026</p>
              <h4 className="font-bold text-white text-base">1. Scopo Informativo e Didattico</h4>
              <p>
                Tutti i percorsi formativi, le lezioni video, gli script e i prompt forniti sulla piattaforma hanno scopo esclusivamente formativo, divulgativo e didattico.
              </p>
              <h4 className="font-bold text-white text-base">2. Utilizzo dell'Intelligenza Artificiale</h4>
              <p>
                I modelli di Intelligenza Artificiale (LLM) possono occasionalmente generare imprecisioni od output non esaustivi. L'utente è sempre tenuto a verificare criticamente qualsiasi codice, testo o automazione prima di applicarla in contesti di produzione o ambienti aziendali critici.
              </p>
              <h4 className="font-bold text-white text-base">3. Limitazione di Responsabilità</h4>
              <p>
                aiutiamoci.cloud e i suoi docenti non rispondono di eventuali perdite di dati, interruzioni di servizio o danni indiretti derivanti dall'applicazione errata o incauta delle automazioni o degli strumenti terzi illustrati nei moduli.
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex justify-end">
          <Button onClick={onClose} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs h-9 px-5 rounded-xl">
            Chiudi Scheda
          </Button>
        </div>
      </div>
    </div>
  )
}

export function CookieBanner({ onOpenPolicy }: { onOpenPolicy: () => void }) {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    // Controlla se l'utente ha già salvato il consenso
    const consent = localStorage.getItem('aiutiamoci_cookie_consent')
    if (!consent) {
      // Ritarda leggermente la comparsa per un effetto fluido all'apertura
      const timer = setTimeout(() => setShowBanner(true), 800)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('aiutiamoci_cookie_consent', 'accepted')
    setShowBanner(false)
  }

  const handleTechnicalOnly = () => {
    localStorage.setItem('aiutiamoci_cookie_consent', 'essential_only')
    setShowBanner(false)
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 animate-in slide-in-from-bottom-5 duration-300">
      <div className="p-5 rounded-2xl bg-slate-900/95 border border-slate-700 shadow-2xl backdrop-blur-xl text-slate-100 flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 shrink-0 border border-indigo-500/30">
            <Cookie className="h-5 w-5" />
          </div>
          <div className="flex-1 text-xs text-slate-300 leading-relaxed">
            <strong className="text-white block text-sm font-semibold mb-1">Informativa Cookie & Privacy</strong>
            Utilizziamo cookie tecnici per garantirti il corretto funzionamento dell&apos;accesso ai corsi, il salvataggio dei progressi e le preferenze del tema.
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800">
          <button
            onClick={onOpenPolicy}
            className="text-[11px] text-slate-400 hover:text-indigo-300 underline underline-offset-2 transition-colors"
          >
            Personalizza / Leggi Cookie Policy
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleTechnicalOnly}
              className="text-[11px] px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300 font-medium transition-colors"
            >
              Solo Tecnici
            </button>
            <Button
              size="sm"
              onClick={handleAccept}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs h-7 px-3.5 rounded-lg shadow-xs"
            >
              Accetta Tutti
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
