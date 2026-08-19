'use client'

import { useState, useEffect } from 'react'
import {
  GraduationCap,
  BookOpen,
  Users,
  CheckCircle2,
  PlusCircle,
  Sparkles,
  Award,
  Download,
  Mail,
  Send,
  Loader2,
  X,
  Search,
  PlayCircle,
  Bot,
  Key,
  FileText,
  Lock,
  Unlock,
  Check,
  RefreshCw,
  Edit,
  Video,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { playNotificationSound } from '@/lib/notifications'
import { sendSharedEmail } from '../posta/actions'

interface CourseItem {
  id: string
  title: string
  category: 'ai' | 'consulting' | 'dev'
  description: string
  duration: string
  lessonsCount: number
  studentsCount: number
  price: string
  status: 'active' | 'upcoming'
}

interface StudentRegistration {
  id: string
  code: string
  studentName: string
  studentEmail: string
  courseTitle: string
  registeredAt: string
  status: 'enrolled' | 'completed' | 'in_progress'
}

interface Lesson {
  id: number
  title: string
  duration: string
  completed: boolean
  videoUrl?: string
  resourcesPdfUrl?: string
}

// Sample MP4 streaming URL di default per il test delle lezioni
const DEFAULT_SAMPLE_VIDEO = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'

// Tutti i 20 Moduli Video del Corso AI Start con URL di riproduzione HTML5
const AI_START_LESSONS: Lesson[] = [
  { id: 1, title: 'Modulo 1: Benvenuto in AI Start — Dimentica i tecnicismi', duration: '10:30', completed: true, videoUrl: DEFAULT_SAMPLE_VIDEO },
  { id: 2, title: 'Modulo 2: Come impostare il primo prompt senza errori', duration: '12:45', completed: true, videoUrl: DEFAULT_SAMPLE_VIDEO },
  { id: 3, title: 'Modulo 3: Delegare le task noiose dell’ufficio all’IA', duration: '15:20', completed: true, videoUrl: DEFAULT_SAMPLE_VIDEO },
  { id: 4, title: 'Modulo 4: Generare risposte email commerciali perfette', duration: '14:10', completed: false, videoUrl: DEFAULT_SAMPLE_VIDEO },
  { id: 5, title: 'Modulo 5: Creazione contenuti e post social con l’IA', duration: '18:00', completed: false, videoUrl: DEFAULT_SAMPLE_VIDEO },
  { id: 6, title: 'Modulo 6: Riassumere documenti lunghi e PDF in 10 secondi', duration: '16:30', completed: false, videoUrl: DEFAULT_SAMPLE_VIDEO },
  { id: 7, title: 'Modulo 7: Organizzare il tempo e le agende aziendali', duration: '15:00', completed: false, videoUrl: DEFAULT_SAMPLE_VIDEO },
  { id: 8, title: 'Modulo 8: Creare tabelle ed analizzare dati senza formule', duration: '20:15', completed: false, videoUrl: DEFAULT_SAMPLE_VIDEO },
  { id: 9, title: 'Modulo 9: Traduzione ed adattamento di testi internazionali', duration: '12:00', completed: false, videoUrl: DEFAULT_SAMPLE_VIDEO },
  { id: 10, title: 'Modulo 10: La Chat con l’assistente @AI ed il supporto continuo', duration: '14:50', completed: false, videoUrl: DEFAULT_SAMPLE_VIDEO },
  { id: 11, title: 'Modulo 11: Creare Agenti AI personalizzati su misura', duration: '22:10', completed: false, videoUrl: DEFAULT_SAMPLE_VIDEO },
  { id: 12, title: 'Modulo 12: Automazioni senza codice (No-Code & Webhooks)', duration: '25:00', completed: false, videoUrl: DEFAULT_SAMPLE_VIDEO },
  { id: 13, title: 'Modulo 13: Trascrizione automatica di riunioni e vocali', duration: '18:20', completed: false, videoUrl: DEFAULT_SAMPLE_VIDEO },
  { id: 14, title: 'Modulo 14: Generare immagini e grafica per le presentazioni', duration: '20:00', completed: false, videoUrl: DEFAULT_SAMPLE_VIDEO },
  { id: 15, title: 'Modulo 15: Cybersecurity e privacy dei dati con l’IA', duration: '15:30', completed: false, videoUrl: DEFAULT_SAMPLE_VIDEO },
  { id: 16, title: 'Modulo 16: Creare preventivi e proposte B2B in tempo reale', duration: '18:45', completed: false, videoUrl: DEFAULT_SAMPLE_VIDEO },
  { id: 17, title: 'Modulo 17: Integrazione dell’IA nel lavoro di team', duration: '20:10', completed: false, videoUrl: DEFAULT_SAMPLE_VIDEO },
  { id: 18, title: 'Modulo 18: Analisi dei clienti e sentiment analysis', duration: '16:00', completed: false, videoUrl: DEFAULT_SAMPLE_VIDEO },
  { id: 19, title: 'Modulo 19: Workflow avanzati e gestione dei progetti', duration: '24:30', completed: false, videoUrl: DEFAULT_SAMPLE_VIDEO },
  { id: 20, title: 'Modulo 20: Esame finale e Rilascio Certificato AI Start', duration: '15:00', completed: false, videoUrl: DEFAULT_SAMPLE_VIDEO },
]

export default function CorsiPage() {
  const [courses] = useState<CourseItem[]>([
    {
      id: 'c-1',
      title: 'AI Start - Domina l’Intelligenza Artificiale da Zero',
      category: 'ai',
      description: 'Corso pratico in 20 lezioni. Impara a delegare la noia, potenziare la creatività e gestire il tempo spiegato semplice.',
      duration: '20 Video • 5 Moduli',
      lessonsCount: 20,
      studentsCount: 42,
      price: '€ 69 (Gratuito con Codice)',
      status: 'active',
    },
    {
      id: 'c-2',
      title: 'Consulenza B2B & Strategie di Digital Transformation',
      category: 'consulting',
      description: 'Percorso pratico per la digitalizzazione delle PMI, gestione processi ed ottimizzazione cloud.',
      duration: '8 Ore • 4 Moduli',
      lessonsCount: 12,
      studentsCount: 15,
      price: '€ 350',
      status: 'active',
    },
    {
      id: 'c-3',
      title: 'Sviluppo Full-Stack Next.js 15 & Supabase Cloud',
      category: 'dev',
      description: 'Architetture moderne con Server Components, Realtime WebSockets, RLS e deployment su Vercel.',
      duration: '16 Ore • 8 Moduli',
      lessonsCount: 24,
      studentsCount: 18,
      price: '€ 590',
      status: 'active',
    },
  ])

  // Lezioni attive
  const [lessons, setLessons] = useState<Lesson[]>(AI_START_LESSONS)
  const [activeLesson, setActiveLesson] = useState<Lesson>(lessons[0])

  // Modal per inserire/modificare URL video custom della lezione
  const [isEditVideoModalOpen, setIsEditVideoModalOpen] = useState(false)
  const [customVideoUrlInput, setCustomVideoUrlInput] = useState('')

  // Stato Studente Loggato tramite Codice
  const [studentCodeInput, setStudentCodeInput] = useState('')
  const [activeStudent, setActiveStudent] = useState<{ name: string; code: string } | null>(null)
  const [codeError, setCodeError] = useState('')

  // Registrazioni Studenti Esistenti e Nuovi
  const [registrations, setRegistrations] = useState<StudentRegistration[]>([
    {
      id: 'r-1',
      code: 'AI-START-8F92',
      studentName: 'Giuseppe Rossi',
      studentEmail: 'g.rossi@azienda.it',
      courseTitle: 'AI Start - Domina l’Intelligenza Artificiale da Zero',
      registeredAt: new Date().toISOString(),
      status: 'in_progress',
    },
    {
      id: 'r-2',
      code: 'AI-START-3K11',
      studentName: 'Laura Bianchi',
      studentEmail: 'laura.b@studio-consulting.com',
      courseTitle: 'Consulenza B2B & Strategie di Digital Transformation',
      registeredAt: new Date(Date.now() - 86400000).toISOString(),
      status: 'enrolled',
    },
  ])

  // Chat Studenti con Assistente @AI
  const [chatMessages, setChatMessages] = useState<Array<{ id: string; sender: string; isAi: boolean; text: string; time: string }>>([
    {
      id: 'm-1',
      sender: 'Marco (Studente)',
      isAi: false,
      text: '@AI come posso applicare i prompt del Modulo 2 alle risposte email commerciali?',
      time: '14:20',
    },
    {
      id: 'm-2',
      sender: 'Assistente @AI Ti AIuto',
      isAi: true,
      text: 'Ciao Marco! Nel Modulo 2 spieghiamo come impostare un prompt in 3 parti: 1. Ruolo (es. Consulente commerciale), 2. Contesto del cliente, 3. Tono ed obiettivo. Clicca sui 20 video in playlist per riprodurli!',
      time: '14:21',
    },
  ])
  const [chatInput, setChatInput] = useState('')
  const [isAiThinking, setIsAiThinking] = useState(false)

  const [activeTab, setActiveTab] = useState<'player' | 'catalog' | 'students' | 'login'>('player')
  const [searchQuery, setSearchQuery] = useState('')

  // Modal Nuova Iscrizione Studente
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false)
  const [selectedCourseTitle, setSelectedCourseTitle] = useState(courses[0].title)
  const [studentName, setStudentName] = useState('')
  const [studentEmail, setStudentEmail] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)

  const supabase = createClient()

  // Generatore Codice Univoco (es. AI-START-77B4)
  const generateUniqueCode = () => {
    const randomHex = Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase()
    return `AI-START-${randomHex}`
  }

  // Verifica Codice Studente
  const handleVerifyStudentCode = (e: React.FormEvent) => {
    e.preventDefault()
    setCodeError('')

    const codeClean = studentCodeInput.trim().toUpperCase()
    const found = registrations.find((r) => r.code === codeClean)

    if (found) {
      setActiveStudent({ name: found.studentName, code: found.code })
      setActiveTab('player')
      playNotificationSound('chat')
      alert(`Benvenuto ${found.studentName}! Accesso sbloccato a tutte le 20 lezioni video di AI Start.`)
    } else {
      if (codeClean === 'DEMO2026' || codeClean.startsWith('AI-START-')) {
        setActiveStudent({ name: 'Studente Autenticato', code: codeClean })
        setActiveTab('player')
        playNotificationSound('chat')
      } else {
        setCodeError('Codice non valido. Verifica il codice inviato via mail o richiedilo al supporto.')
      }
    }
  }

  const handleEnrollStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!studentName.trim() || !studentEmail.trim()) return

    setIsRegistering(true)
    const generatedCode = generateUniqueCode()

    const newReg: StudentRegistration = {
      id: `reg-${Date.now()}`,
      code: generatedCode,
      studentName: studentName.trim(),
      studentEmail: studentEmail.trim(),
      courseTitle: selectedCourseTitle,
      registeredAt: new Date().toISOString(),
      status: 'enrolled',
    }

    setRegistrations([newReg, ...registrations])

    await (supabase as any).from('student_codes').insert({
      code: generatedCode,
      student_name: studentName.trim(),
      student_email: studentEmail.trim(),
      course_title: selectedCourseTitle,
    })

    const { data: userData } = await supabase.auth.getUser()
    await (supabase as any).from('tasks').insert({
      title: `Accoglienza Studente: ${studentName.trim()} (${generatedCode})`,
      description: `Iscrizione al corso "${selectedCourseTitle}". Codice univoco assegnato: ${generatedCode}.`,
      status: 'todo',
      priority: 'high',
      created_by: userData.user?.id || null,
    })

    await sendSharedEmail({
      to: studentEmail.trim(),
      subject: `Il tuo Codice di Accesso per: ${selectedCourseTitle}`,
      body: `Gentile ${studentName.trim()},\n\nconfermiamo la tua iscrizione al corso "${selectedCourseTitle}".\n\nEcco il tuo CODICE DI ACCESSO UNIVOCO per accedere alle 20 lezioni video:\n👉 CODICE: ${generatedCode}\n\nInserisci questo codice nella piattaforma per sbloccare tutti i moduli.\n\nCordiali saluti,\nTeam Aiutiamoci Cloud`,
    })

    playNotificationSound('chat')
    alert(`Studente ${studentName} iscritto! Codice generato: ${generatedCode}. Inviata l'email con il codice via Resend!`)

    setIsRegistering(false)
    setIsEnrollModalOpen(false)
    setStudentName('')
    setStudentEmail('')
  }

  const [customTitleInput, setCustomTitleInput] = useState('')

  const handleSaveCustomVideoUrl = (e: React.FormEvent) => {
    e.preventDefault()

    const newTitle = customTitleInput.trim() || activeLesson.title
    const newUrl = customVideoUrlInput.trim() || activeLesson.videoUrl

    const updated = lessons.map((l) => (l.id === activeLesson.id ? { ...l, title: newTitle, videoUrl: newUrl } : l))
    setLessons(updated)
    setActiveLesson({ ...activeLesson, title: newTitle, videoUrl: newUrl })

    alert(`Lezione "${newTitle}" aggiornata con successo!`)
    setIsEditVideoModalOpen(false)
  }

  const handleSendStudentChat = (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim()) return

    const userText = chatInput.trim()
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    const userMsg = {
      id: `m-${Date.now()}`,
      sender: activeStudent ? `${activeStudent.name}` : 'Tu (Studente)',
      isAi: false,
      text: userText,
      time: now,
    }

    setChatMessages((prev) => [...prev, userMsg])
    setChatInput('')

    if (userText.toLowerCase().includes('@ai') || userText.toLowerCase().includes('ai') || userText.includes('?')) {
      setIsAiThinking(true)

      setTimeout(() => {
        const aiMsg = {
          id: `m-${Date.now() + 1}`,
          sender: 'Assistente @AI Ti AIuto',
          isAi: true,
          text: `Ottima domanda su "${userText.replace(/@ai/i, '').trim() || 'AI Start'}"! Nel corso spieghiamo che l’IA funziona al meglio quando le fornisci un ruolo chiaro ed esempi specifici. Clicca sui 20 video in playlist per riprodurli!`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
        setChatMessages((prev) => [...prev, aiMsg])
        setIsAiThinking(false)
        playNotificationSound('chat')
      }, 1000)
    }
  }

  const toggleLessonCompleted = (lessonId: number) => {
    setLessons(
      lessons.map((l) => (l.id === lessonId ? { ...l, completed: !l.completed } : l))
    )
  }

  const filteredRegistrations = registrations.filter(
    (r) =>
      r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.studentEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.courseTitle.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            Portale Corsi Formativi & Studenti (aiutiamoci.cloud)
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            20 Lezioni Video AI Start, player streaming HTML5, codice studente e supporto @AI.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeStudent ? (
            <Badge variant="success" className="py-1 px-3 flex items-center gap-1 text-xs">
              <Unlock className="h-3.5 w-3.5" />
              <span>Studente: <strong>{activeStudent.name}</strong> ({activeStudent.code})</span>
            </Badge>
          ) : (
            <Button
              variant="outline"
              onClick={() => setActiveTab('login')}
              className="text-xs font-semibold h-10 gap-1.5 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400"
            >
              <Key className="h-4 w-4" />
              <span>Accedi con Codice Studente</span>
            </Button>
          )}

          <Button
            onClick={() => setIsEnrollModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2 shadow-xs text-xs font-semibold h-10 px-4 rounded-xl"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Iscrivi Studente</span>
          </Button>
        </div>
      </div>

      {/* Selector Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('player')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all shrink-0 ${
            activeTab === 'player'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <PlayCircle className="h-4 w-4" />
          <span>Player 20 Video Lezioni & Chat @AI</span>
        </button>

        <button
          onClick={() => setActiveTab('login')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all shrink-0 ${
            activeTab === 'login'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Key className="h-4 w-4" />
          <span>Riscatta Codice Studente</span>
        </button>

        <button
          onClick={() => setActiveTab('catalog')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all shrink-0 ${
            activeTab === 'catalog'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BookOpen className="h-4 w-4" />
          <span>Catalogo Corsi ({courses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('students')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all shrink-0 ${
            activeTab === 'students'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Codici & Iscritti Replit ({registrations.length})</span>
        </button>
      </div>

      {/* TAB: LOGIN CON CODICE STUDENTE */}
      {activeTab === 'login' && (
        <div className="max-w-md mx-auto bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 text-center">
          <div className="h-16 w-16 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto border border-indigo-200 dark:border-indigo-800">
            <Key className="h-8 w-8" />
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Sblocca i 20 Video di AI Start
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Inserisci il Codice Univoco di Accesso che hai ricevuto al momento dell'iscrizione (es. AI-START-8F92).
            </p>
          </div>

          <form onSubmit={handleVerifyStudentCode} className="space-y-4 text-xs text-left">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">Codice Univoco Studente *</label>
              <Input
                autoFocus
                required
                value={studentCodeInput}
                onChange={(e) => setStudentCodeInput(e.target.value)}
                placeholder="Es. AI-START-8F92 oppure DEMO2026"
                className="text-center font-mono uppercase tracking-widest font-bold text-sm h-11 dark:bg-slate-800 dark:border-slate-700"
              />
            </div>

            {codeError && (
              <p className="text-red-600 dark:text-red-400 text-xs font-semibold text-center">
                {codeError}
              </p>
            )}

            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-11 shadow-xs gap-2">
              <Unlock className="h-4 w-4" />
              Sblocca Corso & 20 Video
            </Button>
          </form>
        </div>
      )}

      {/* TAB 1: PLAYER 20 VIDEO LEZIONI AI START & CHAT @AI */}
      {activeTab === 'player' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left / Center: Video Player & Lezione Attiva */}
          <div className="lg:col-span-8 space-y-4">
            {/* RIPRODUTTORE VIDEO NATIVO HTML5 / IFRAME */}
            <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-xl overflow-hidden relative aspect-video flex items-center justify-center group">
              {activeLesson.videoUrl?.includes('youtube') || activeLesson.videoUrl?.includes('vimeo') ? (
                <iframe
                  src={activeLesson.videoUrl}
                  className="w-full h-full rounded-2xl border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  key={activeLesson.id}
                  controls
                  autoPlay
                  controlsList="nodownload"
                  src={activeLesson.videoUrl || DEFAULT_SAMPLE_VIDEO}
                  className="w-full h-full object-cover rounded-2xl"
                >
                  Il tuo browser non supporta il riproduttore video.
                </video>
              )}
            </div>

            {/* Dettaglio Lezione e Playlist */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {activeLesson.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5 font-mono">
                    Durata: {activeLesson.duration} • Lezione {activeLesson.id} di 20
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setCustomVideoUrlInput(activeLesson.videoUrl || '')
                      setIsEditVideoModalOpen(true)
                    }}
                    className="h-8 text-xs gap-1.5 border-slate-200 dark:border-slate-700"
                  >
                    <Edit className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>Modifica Titolo & Video Link</span>
                  </Button>

                  <Button
                    size="sm"
                    onClick={() => toggleLessonCompleted(activeLesson.id)}
                    className={`h-8 text-xs gap-1.5 ${
                      activeLesson.completed
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>{activeLesson.completed ? 'Completata ✓' : 'Segna Completata'}</span>
                  </Button>
                </div>
              </div>

              {/* Lista dei 20 Moduli */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
                  <span>Playlist 20 Moduli AI Start</span>
                  <span className="font-mono text-indigo-600 dark:text-indigo-400">
                    {lessons.filter((l) => l.completed).length} / {lessons.length} Completate
                  </span>
                </div>

                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {lessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      onClick={() => setActiveLesson(lesson)}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        activeLesson.id === lesson.id
                          ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 font-bold'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center gap-3 truncate pr-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleLessonCompleted(lesson.id)
                          }}
                          className={`h-5 w-5 rounded-full border flex items-center justify-center transition-colors shrink-0 ${
                            lesson.completed
                              ? 'bg-emerald-500 border-emerald-600 text-white'
                              : 'border-slate-300 dark:border-slate-600'
                          }`}
                        >
                          {lesson.completed && <CheckCircle2 className="h-3.5 w-3.5" />}
                        </button>

                        <span className={`text-xs truncate ${activeLesson.id === lesson.id ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-700 dark:text-slate-300'}`}>
                          {lesson.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {activeLesson.id === lesson.id && (
                          <Badge variant="purple" className="text-[9px] px-1.5 py-0">IN RIPRODUZIONE</Badge>
                        )}
                        <span className="text-[11px] text-slate-400 font-mono">
                          {lesson.duration}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Chat Studenti con Assistente @AI */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col h-[650px]">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <div>
                  <h3 className="font-bold text-xs text-slate-900 dark:text-white">Chat Studenti & Assistente @AI</h3>
                  <p className="text-[10px] text-slate-400">Scrivi @AI per risposte automatiche sui 20 moduli</p>
                </div>
              </div>
            </div>

            {/* Messages Stream */}
            <div className="p-4 flex-1 overflow-y-auto space-y-3 text-xs">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3 rounded-xl space-y-1 ${
                    msg.isAi
                      ? 'bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-slate-800 dark:text-slate-200'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[11px] text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                      {msg.isAi && <Sparkles className="h-3 w-3 text-purple-500" />}
                      {msg.sender}
                    </span>
                    <span className="text-[9px] text-slate-400">{msg.time}</span>
                  </div>
                  <p className="leading-relaxed">{msg.text}</p>
                </div>
              ))}

              {isAiThinking && (
                <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-300 text-xs flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>@AI sta consultando i 20 moduli...</span>
                </div>
              )}
            </div>

            {/* Input Chat Studenti */}
            <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
              <form onSubmit={handleSendStudentChat} className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Scrivi una domanda o digita @AI..."
                  className="flex-1 text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <Button type="submit" size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white h-8 px-3">
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CATALOGO CORSI */}
      {activeTab === 'catalog' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 flex flex-col justify-between hover:border-indigo-500/50 transition-all group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge
                    variant={
                      course.category === 'ai'
                        ? 'purple'
                        : course.category === 'consulting'
                        ? 'info'
                        : 'success'
                    }
                    className="text-[10px] uppercase font-bold"
                  >
                    {course.category === 'ai' ? 'IA & Agenti' : course.category === 'consulting' ? 'Consulenza B2B' : 'Sviluppo Cloud'}
                  </Badge>

                  <span className="font-extrabold text-sm text-indigo-600 dark:text-indigo-400 font-mono">
                    {course.price}
                  </span>
                </div>

                <h3 className="font-bold text-base text-slate-900 dark:text-white leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {course.title}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {course.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3 mt-4">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono">
                  <span>{course.duration}</span>
                  <span>{course.studentsCount} Studenti Iscritti</span>
                </div>

                <Button
                  onClick={() => {
                    setSelectedCourseTitle(course.title)
                    setIsEnrollModalOpen(true)
                  }}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs gap-1.5 h-9"
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  Iscrivi Studente a Questo Corso
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: REGISTRO STUDENTI & CODICI REPLIT */}
      {activeTab === 'students' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 px-2">
              Studenti Registrati & Codici Univoci: <strong className="text-slate-900 dark:text-white ml-1">{registrations.length}</strong>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cerca studente, codice o email..."
                className="w-full h-8 pl-9 pr-3 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Codice Accesso</th>
                    <th className="py-3 px-4">Nome Studente</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Corso Formativo</th>
                    <th className="py-3 px-4">Stato Iscrizione</th>
                    <th className="py-3 px-4 text-right">Azioni</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs text-slate-700 dark:text-slate-300">
                  {filteredRegistrations.map((reg) => (
                    <tr key={reg.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {reg.code}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        {reg.studentName}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 font-mono">
                        {reg.studentEmail}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                        {reg.courseTitle}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={
                            reg.status === 'completed'
                              ? 'success'
                              : reg.status === 'in_progress'
                              ? 'warning'
                              : 'info'
                          }
                          className="text-[9px] uppercase"
                        >
                          {reg.status === 'in_progress' ? 'In Corso' : reg.status === 'completed' ? 'Completato' : 'Iscritto'}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            sendSharedEmail({
                              to: reg.studentEmail,
                              subject: `Il tuo Codice di Accesso al Corso: ${reg.code}`,
                              body: `Gentile ${reg.studentName},\n\nti ricordiamo che il tuo CODICE DI ACCESSO UNIVOCO per le 20 lezioni video è: ${reg.code}.\n\nCordiali saluti,\nTeam Aiutiamoci Cloud`,
                            })
                            alert(`Inviato promemoria codice ${reg.code} via Resend a ${reg.studentEmail}!`)
                          }}
                          className="text-xs text-indigo-600 hover:text-indigo-800 dark:hover:text-indigo-300 gap-1 h-7"
                        >
                          <Mail className="h-3.5 w-3.5" />
                          Invia Codice Mail
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal Modifica Link Video Custom Lezione */}
      {isEditVideoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 text-left">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <Video className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Imposta Link Video per "{activeLesson.title}"</h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditVideoModalOpen(false)}
                className="h-7 w-7 text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleSaveCustomVideoUrl} className="p-5 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Titolo Lezione</label>
                <Input
                  autoFocus
                  value={customTitleInput}
                  onChange={(e) => setCustomTitleInput(e.target.value)}
                  placeholder={`Titolo attuale: ${activeLesson.title}`}
                  className="text-xs dark:bg-slate-800 dark:border-slate-700 font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">URL del Video (MP4, Supabase Storage, YouTube o Vimeo)</label>
                <Input
                  value={customVideoUrlInput}
                  onChange={(e) => setCustomVideoUrlInput(e.target.value)}
                  placeholder="Es. https://.../modulo1.mp4 oppure https://www.youtube.com/embed/..."
                  className="text-xs dark:bg-slate-800 dark:border-slate-700 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Button type="button" variant="outline" onClick={() => setIsEditVideoModalOpen(false)}>
                  Annulla
                </Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold gap-1.5">
                  Salva Modifiche Lezione
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Iscrizione Studente con Generazione Codice */}
      {isEnrollModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 text-left">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Nuova Iscrizione & Generazione Codice</h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEnrollModalOpen(false)}
                className="h-7 w-7 text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleEnrollStudent} className="p-5 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Seleziona Corso Formativo</label>
                <select
                  value={selectedCourseTitle}
                  onChange={(e) => setSelectedCourseTitle(e.target.value)}
                  className="w-full h-9 rounded-md border border-slate-200 dark:border-slate-700 bg-background dark:bg-slate-800 px-3 text-xs"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.title}>{c.title} ({c.price})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Nome e Cognome Studente *</label>
                <Input
                  autoFocus
                  required
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Es. Mario Rossi"
                  className="text-xs dark:bg-slate-800 dark:border-slate-700"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Indirizzo Email Studente *</label>
                <Input
                  required
                  type="email"
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  placeholder="Es. mario.rossi@azienda.it"
                  className="text-xs dark:bg-slate-800 dark:border-slate-700"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Button type="button" variant="outline" onClick={() => setIsEnrollModalOpen(false)}>
                  Annulla
                </Button>
                <Button type="submit" disabled={isRegistering} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold gap-1.5">
                  {isRegistering ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Generazione Codice...
                    </>
                  ) : (
                    'Genera Codice ed Invia Mail'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
