'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  Calendar,
  Clock,
  Video,
  CheckCircle2,
  Briefcase,
  GraduationCap,
  Sparkles,
  ArrowRight,
  Copy,
  Check,
  ExternalLink,
  Building,
  User,
  Mail,
  Phone,
  MessageSquare,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type CallType = 'business' | 'academy'

interface DayOption {
  dateStr: string // YYYY-MM-DD
  dayName: string // es. "Mercoledì"
  dayShort: string // es. "Mer"
  dayNumber: number // es. 4
  monthShort: string // es. "Nov"
}

export default function PrenotaCallPage() {
  const [callType, setCallType] = useState<CallType>('business')
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [selectedTime, setSelectedTime] = useState<string>('')
  
  // Form fields
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [company, setCompany] = useState('')
  const [notes, setNotes] = useState('')
  
  // Submission & Success state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [bookingResult, setBookingResult] = useState<{
    meetUrl: string
    date: string
    time: string
    callTypeLabel: string
  } | null>(null)
  const [copiedMeet, setCopiedMeet] = useState(false)

  // Calcola i prossimi 10 giorni lavorativi (Lun - Ven)
  const availableDays: DayOption[] = useMemo(() => {
    const days: DayOption[] = []
    const current = new Date()
    
    // Se siamo già nel pomeriggio/sera (dopo le 17:30), inizia da domani
    if (current.getHours() >= 18) {
      current.setDate(current.getDate() + 1)
    }

    const monthNames = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic']
    const dayNames = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato']
    const dayShorts = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab']

    while (days.length < 10) {
      const dayOfWeek = current.getDay()
      // Escludi Sabato (6) e Domenica (0)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        const yyyy = current.getFullYear()
        const mm = String(current.getMonth() + 1).padStart(2, '0')
        const dd = String(current.getDate()).padStart(2, '0')
        const dateStr = `${yyyy}-${mm}-${dd}`

        days.push({
          dateStr,
          dayName: dayNames[dayOfWeek],
          dayShort: dayShorts[dayOfWeek],
          dayNumber: current.getDate(),
          monthShort: monthNames[current.getMonth()],
        })
      }
      current.setDate(current.getDate() + 1)
    }
    return days
  }, [])

  // Seleziona il primo giorno di default
  useEffect(() => {
    if (availableDays.length > 0 && !selectedDate) {
      setSelectedDate(availableDays[0].dateStr)
    }
  }, [availableDays, selectedDate])

  // Carica gli orari liberi per il giorno selezionato
  useEffect(() => {
    if (!selectedDate) return

    async function fetchAvailability() {
      setLoadingSlots(true)
      setSelectedTime('')
      setErrorMessage(null)
      try {
        const res = await fetch(`/api/calendar/availability?date=${selectedDate}`)
        const data = await res.json()
        if (data.availableSlots) {
          setAvailableSlots(data.availableSlots)
          if (data.availableSlots.length > 0) {
            setSelectedTime(data.availableSlots[0])
          }
        } else {
          setAvailableSlots([])
        }
      } catch (err) {
        console.error('Errore fetch slot:', err)
        setAvailableSlots([])
      } finally {
        setLoadingSlots(false)
      }
    }

    fetchAvailability()
  }, [selectedDate])

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !phone.trim() || !selectedDate || !selectedTime) {
      setErrorMessage('Compila tutti i campi obbligatori (Nome, Email, Telefono, Data e Orario).')
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      const res = await fetch('/api/calendar/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          company: company.trim(),
          date: selectedDate,
          time: selectedTime,
          notes: notes.trim(),
          callType,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Errore durante la prenotazione. Riprova.')
      }

      setBookingResult({
        meetUrl: data.meetUrl || (callType === 'academy' ? 'https://meet.google.com/wsv-bqxm-bvr' : 'https://meet.google.com/yme-pyws-osa'),
        date: data.date,
        time: data.time,
        callTypeLabel: data.callTypeLabel || (callType === 'academy' ? 'Orientamento Academy Corsi AI' : 'Consulenza B2B & Automazione AI'),
      })
    } catch (err: any) {
      setErrorMessage(err.message || 'Si è verificato un errore imprevisto.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCopyMeet = () => {
    if (bookingResult?.meetUrl) {
      navigator.clipboard.writeText(bookingResult.meetUrl)
      setCopiedMeet(true)
      setTimeout(() => setCopiedMeet(false), 2500)
    }
  }

  // Schermata di Conferma Prenotazione
  if (bookingResult) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-xl w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center shadow-lg">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Prenotazione Confermata
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              La tua Call è Fissata!
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
              Abbiamo inserito l'appuntamento nel calendario del team. Ti aspettiamo online all'orario indicato.
            </p>
          </div>

          {/* Dettagli della call */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 space-y-3 text-left">
            <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-700/60">
              <span className="text-slate-400">Tipo Sessione:</span>
              <span className="font-bold text-white">{bookingResult.callTypeLabel}</span>
            </div>
            <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-700/60">
              <span className="text-slate-400">Data & Orario:</span>
              <span className="font-mono font-bold text-emerald-400">
                {bookingResult.date} alle ore {bookingResult.time}
              </span>
            </div>
            <div className="space-y-1.5 pt-1">
              <span className="text-xs text-slate-400 block">Stanza Google Meet:</span>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={bookingResult.meetUrl}
                  className="w-full text-xs font-mono bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 select-all"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCopyMeet}
                  className="shrink-0 h-9 px-3 rounded-xl border-slate-700 hover:bg-slate-800 text-xs font-medium cursor-pointer"
                >
                  {copiedMeet ? <Check className="w-3.5 h-3.5 text-emerald-400 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                  {copiedMeet ? 'Copiato!' : 'Copia'}
                </Button>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <a
              href={bookingResult.meetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs h-11 px-6 rounded-xl transition-all shadow-lg cursor-pointer"
            >
              <Video className="w-4 h-4" />
              <span>Accedi a Google Meet</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>
            <Button
              variant="outline"
              onClick={() => {
                setBookingResult(null)
                setName('')
                setEmail('')
                setPhone('')
                setCompany('')
                setNotes('')
              }}
              className="w-full sm:w-auto border-slate-700 hover:bg-slate-800 text-slate-300 text-xs h-11 px-5 rounded-xl cursor-pointer"
            >
              Nuova Prenotazione
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md">
              A
            </div>
            <div>
              <span className="font-black text-sm tracking-tight text-white block">
                Aiutiamoci
              </span>
              <span className="text-[10px] text-slate-400 block -mt-0.5">
                AI Solutions & Academy
              </span>
            </div>
          </div>
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
            Prenotazione 1-Click
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 py-8 sm:py-12 w-full space-y-8">
        {/* Intro */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-[11px] text-slate-300 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Calendario Ufficiale del Team</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Fissa una Call Diretta
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Scegli il percorso che fa per te, seleziona data e orario e incontra direttamente Marco, Lorenzo o Stefano su Google Meet.
          </p>
        </div>

        {/* STEP 1: Selezione Tipo Sessione */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
          {/* Card B2B */}
          <button
            type="button"
            onClick={() => setCallType('business')}
            className={`p-5 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
              callType === 'business'
                ? 'bg-blue-950/30 border-blue-500/80 ring-2 ring-blue-500/20 shadow-lg'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
                <Briefcase className="w-5 h-5" />
              </div>
              {callType === 'business' && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500 text-white">
                  Selezionato
                </span>
              )}
            </div>
            <h3 className="font-bold text-sm text-white mt-3">
              Consulenza B2B & Automazione AI
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Per aziende, PMI e professionisti: integrazione agenti AI, flussi n8n, CRM e trasformazione digitale.
            </p>
            <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-3 font-mono">
              <span>⏱ 45 min</span>
              <span>•</span>
              <span>📹 Google Meet</span>
            </div>
          </button>

          {/* Card Academy */}
          <button
            type="button"
            onClick={() => setCallType('academy')}
            className={`p-5 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
              callType === 'academy'
                ? 'bg-blue-950/30 border-blue-500/80 ring-2 ring-blue-500/20 shadow-lg'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
              {callType === 'academy' && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500 text-white">
                  Selezionato
                </span>
              )}
            </div>
            <h3 className="font-bold text-sm text-white mt-3">
              Orientamento Corsi & Academy AI
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Per corsisti e privati: scopri il programma pratico di 20 lezioni, prompt engineering e workflow AI personali.
            </p>
            <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-3 font-mono">
              <span>⏱ 30 min</span>
              <span>•</span>
              <span>📹 Google Meet</span>
            </div>
          </button>
        </div>

        {/* STEP 2 & 3: Selezione Data, Orario & Form */}
        <div className="max-w-3xl mx-auto bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-7 space-y-6 shadow-xl">
          {/* Selettore Giorno */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              <span>1. Scegli il Giorno</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {availableDays.map((day) => {
                const isSelected = selectedDate === day.dateStr
                return (
                  <button
                    key={day.dateStr}
                    type="button"
                    onClick={() => setSelectedDate(day.dateStr)}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-600/20'
                        : 'bg-slate-850 border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white'
                    }`}
                  >
                    <span className="block text-[11px] font-semibold uppercase opacity-80">
                      {day.dayShort}
                    </span>
                    <span className="block text-lg font-black my-0.5 font-mono">
                      {day.dayNumber}
                    </span>
                    <span className="block text-[10px] opacity-75">
                      {day.monthShort}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Selettore Orario */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span>2. Scegli l'Orario Disponibile</span>
            </label>

            {loadingSlots ? (
              <div className="p-6 text-center text-xs text-slate-400 bg-slate-950/40 rounded-2xl border border-slate-800">
                Verifica disponibilità in tempo reale...
              </div>
            ) : availableSlots.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 bg-slate-950/40 rounded-2xl border border-slate-800">
                Nessun orario libero per questo giorno. Prova a selezionare un'altra data.
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {availableSlots.map((time) => {
                  const isSelected = selectedTime === time
                  return (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setSelectedTime(time)}
                      className={`py-2 px-3 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-600 border-emerald-500 text-white shadow-md shadow-emerald-600/20'
                          : 'bg-slate-850 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                      }`}
                    >
                      {time}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Form Dati Referente */}
          <form onSubmit={handleBooking} className="space-y-4 pt-4 border-t border-slate-800">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-400" />
                <span>3. I Tuoi Recapiti</span>
              </span>
              <p className="text-[11px] text-slate-500">
                Inserisci i dati per ricevere la conferma e il promemoria della call.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">
                  Nome e Cognome *
                </label>
                <Input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Es. Mario Rossi"
                  className="h-10 text-xs bg-slate-950/80 border-slate-800 text-white placeholder:text-slate-600 rounded-xl focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">
                  Email *
                </label>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="mario.rossi@azienda.it"
                  className="h-10 text-xs bg-slate-950/80 border-slate-800 text-white placeholder:text-slate-600 rounded-xl focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">
                  Telefono / WhatsApp *
                </label>
                <Input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+39 340 1234567"
                  className="h-10 text-xs bg-slate-950/80 border-slate-800 text-white placeholder:text-slate-600 rounded-xl focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">
                  Azienda / Società (opzionale)
                </label>
                <Input
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Es. Acme S.r.l."
                  className="h-10 text-xs bg-slate-950/80 border-slate-800 text-white placeholder:text-slate-600 rounded-xl focus:border-blue-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300">
                Argomento principale della call (opzionale)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Descrivi brevemente il tuo progetto, i processi che vorresti automatizzare o cosa vorresti imparare..."
                className="w-full text-xs p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                {errorMessage}
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting || !selectedTime}
              className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                'Prenotazione in corso...'
              ) : (
                <>
                  <span>Conferma Prenotazione per il {selectedDate} alle {selectedTime || '--:--'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        <p>© 2026 Aiutiamoci — Piattaforma Lavoro Condivisa & Academy AI. Tutti i diritti riservati.</p>
      </footer>
    </div>
  )
}
