'use client'

import { useState } from 'react'
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
  MessageSquare,
  Bot,
  Volume2,
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
  videoUrl?: string
  completed: boolean
}

export default function CorsiPage() {
  const [courses] = useState<CourseItem[]>([
    {
      id: 'c-1',
      title: 'AI Start - Domina l’Intelligenza Artificiale da Zero',
      category: 'ai',
      description: 'Corso pratico in 20 lezioni. Impara a delegare la noia, potenziare la creatività e gestire il tempo spiegato semplice.',
      duration: '20 Video • 5 Moduli',
      lessonsCount: 20,
      studentsCount: 38,
      price: '€ 290',
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

  // Lezioni del corso AI Start (Riproduttore Integrato)
  const [lessons, setLessons] = useState<Lesson[]>([
    { id: 1, title: 'Modulo 1: Introduzione all’IA — Dimentica i tecnicismi e parti da zero', duration: '12:40', completed: true },
    { id: 2, title: 'Modulo 2: Come delegare la noia con i Prompt Efficaci', duration: '15:20', completed: true },
    { id: 3, title: 'Modulo 3: Potenziare la creatività e la scrittura dei contenuti', duration: '18:15', completed: false },
    { id: 4, title: 'Modulo 4: Gestione del tempo ed organizzazione con gli Agenti AI', duration: '20:00', completed: false },
    { id: 5, title: 'Modulo 5: Integrazione pratica nel lavoro quotidiano di team', duration: '25:10', completed: false },
  ])

  const [activeLesson, setActiveLesson] = useState<Lesson>(lessons[0])

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
      text: 'Ciao Marco! Nel Modulo 2 spieghiamo come impostare un prompt in 3 parti: 1. Ruolo (es. Consulente commerciale), 2. Contesto del cliente, 3. Tono ed obiettivo (es. Professionale e sintetico). Puoi anche usare l’Hub Agenti della piattaforma!',
      time: '14:21',
    },
  ])
  const [chatInput, setChatInput] = useState('')
  const [isAiThinking, setIsAiThinking] = useState(false)

  const [registrations, setRegistrations] = useState<StudentRegistration[]>([
    {
      id: 'r-1',
      studentName: 'Giuseppe Rossi',
      studentEmail: 'g.rossi@azienda.it',
      courseTitle: 'AI Start - Domina l’Intelligenza Artificiale da Zero',
      registeredAt: new Date().toISOString(),
      status: 'in_progress',
    },
    {
      id: 'r-2',
      studentName: 'Laura Bianchi',
      studentEmail: 'laura.b@studio-consulting.com',
      courseTitle: 'Consulenza B2B & Strategie di Digital Transformation',
      registeredAt: new Date(Date.now() - 86400000).toISOString(),
      status: 'enrolled',
    },
  ])

  const [activeTab, setActiveTab] = useState<'player' | 'catalog' | 'students'>('player')
  const [searchQuery, setSearchQuery] = useState('')

  // Modal Nuova Iscrizione Studente
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false)
  const [selectedCourseTitle, setSelectedCourseTitle] = useState(courses[0].title)
  const [studentName, setStudentName] = useState('')
  const [studentEmail, setStudentEmail] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)

  const supabase = createClient()

  const handleEnrollStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!studentName.trim() || !studentEmail.trim()) return

    setIsRegistering(true)

    const newReg: StudentRegistration = {
      id: `reg-${Date.now()}`,
      studentName: studentName.trim(),
      studentEmail: studentEmail.trim(),
      courseTitle: selectedCourseTitle,
      registeredAt: new Date().toISOString(),
      status: 'enrolled',
    }

    setRegistrations([newReg, ...registrations])

    const { data: userData } = await supabase.auth.getUser()
    await (supabase as any).from('tasks').insert({
      title: `Accoglienza Studente: ${studentName.trim()}`,
      description: `Nuova iscrizione al corso "${selectedCourseTitle}". Inviare materiale didattico a ${studentEmail.trim()}.`,
      status: 'todo',
      priority: 'high',
      created_by: userData.user?.id || null,
    })

    await sendSharedEmail({
      to: studentEmail.trim(),
      subject: `Conferma Iscrizione: ${selectedCourseTitle}`,
      body: `Gentile ${studentName.trim()},\n\nconfermiamo con piacere la tua iscrizione al corso "${selectedCourseTitle}".\n\nPuoi accedere ai materiali ed ai video delle lezioni direttamente dalla Piattaforma Condivisa.\n\nCordiali saluti,\nTeam Aiutiamoci Cloud`,
    })

    playNotificationSound('chat')
    alert(`Studente ${studentName} iscritto con successo! Creata la scheda nel Kanban ed inviata l'email via Resend!`)

    setIsRegistering(false)
    setIsEnrollModalOpen(false)
    setStudentName('')
    setStudentEmail('')
  }

  const handleSendStudentChat = (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim()) return

    const userText = chatInput.trim()
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    const userMsg = {
      id: `m-${Date.now()}`,
      sender: 'Tu (Studente)',
      isAi: false,
      text: userText,
      time: now,
    }

    setChatMessages((prev) => [...prev, userMsg])
    setChatInput('')

    // Se l'utente scrive o cita @AI o chiede spiegazioni
    if (userText.toLowerCase().includes('@ai') || userText.toLowerCase().includes('ai') || userText.includes('?')) {
      setIsAiThinking(true)

      setTimeout(() => {
        const aiMsg = {
          id: `m-${Date.now() + 1}`,
          sender: 'Assistente @AI Ti AIuto',
          isAi: true,
          text: `Ottima domanda su "${userText.replace(/@ai/i, '').trim() || 'AI Start'}"! Nel corso spieghiamo che l’IA funziona al meglio quando le fornisci un ruolo chiaro ed esempi specifici. Vuoi che ti generi una bozza o un esercizio pratico?`,
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
            Fruizione lezioni video/audio, assistente @AI in chat e gestione iscritti.
          </p>
        </div>

        <Button
          onClick={() => setIsEnrollModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2 shadow-xs text-xs font-semibold h-10 px-4 rounded-xl"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Iscrivi Nuovo Studente</span>
        </Button>
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
          <span>Player Lezioni Video & Chat @AI</span>
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
          <span>Registro Studenti Iscritti ({registrations.length})</span>
        </button>
      </div>

      {/* TAB 1: PLAYER VIDEO LEZIONI AI START & CHAT @AI */}
      {activeTab === 'player' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left / Center: Video Player & Lezione Attiva */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-xl overflow-hidden relative aspect-video flex items-center justify-center">
              {/* Simulator Player Video HTML5 */}
              <div className="text-center space-y-3 p-6">
                <div className="h-16 w-16 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mx-auto shadow-inner">
                  <PlayCircle className="h-8 w-8 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">
                    {activeLesson.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Durata: {activeLesson.duration} • Player HTML5 HD senza tracciamenti di terze parti
                  </p>
                </div>
                <Badge variant="purple" className="text-[10px] uppercase">
                  Riproduzione in Corso
                </Badge>
              </div>
            </div>

            {/* Dettaglio Lezione e Playlist */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Programma Lezioni: AI Start - Domina l'IA da Zero
                </h3>
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  {lessons.filter((l) => l.completed).length} / {lessons.length} Completate
                </span>
              </div>

              <div className="space-y-2">
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
                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleLessonCompleted(lesson.id)
                        }}
                        className={`h-5 w-5 rounded-full border flex items-center justify-center transition-colors ${
                          lesson.completed
                            ? 'bg-emerald-500 border-emerald-600 text-white'
                            : 'border-slate-300 dark:border-slate-600'
                        }`}
                      >
                        {lesson.completed && <CheckCircle2 className="h-3.5 w-3.5" />}
                      </button>

                      <span className={`text-xs ${activeLesson.id === lesson.id ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-700 dark:text-slate-300'}`}>
                        {lesson.title}
                      </span>
                    </div>

                    <span className="text-[11px] text-slate-400 font-mono">
                      {lesson.duration}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Chat Studenti con Assistente @AI */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col h-[600px]">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <div>
                  <h3 className="font-bold text-xs text-slate-900 dark:text-white">Chat Studenti & Assistente @AI</h3>
                  <p className="text-[10px] text-slate-400">Scrivi @AI per ricevere assistenza istantanea</p>
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
                  <span>@AI sta elaborando la risposta...</span>
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

      {/* TAB 3: REGISTRO STUDENTI ISCRITTI */}
      {activeTab === 'students' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 px-2">
              Studenti Registrati: <strong className="text-slate-900 dark:text-white ml-1">{registrations.length}</strong>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cerca studente o corso..."
                className="w-full h-8 pl-9 pr-3 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
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
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        {reg.studentName}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 font-mono">
                        {reg.studentEmail}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-indigo-600 dark:text-indigo-400">
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
                              subject: `Aggiornamento Corso: ${reg.courseTitle}`,
                              body: `Gentile ${reg.studentName},\n\nti inviamo un aggiornamento relativo alle prossime lezioni del corso ${reg.courseTitle}.\n\nCordiali saluti,\nTeam Aiutiamoci Cloud`,
                            })
                            alert(`Inviato promemoria via Resend a ${reg.studentEmail}!`)
                          }}
                          className="text-xs text-indigo-600 hover:text-indigo-800 dark:hover:text-indigo-300 gap-1 h-7"
                        >
                          <Mail className="h-3.5 w-3.5" />
                          Invia Mail
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

      {/* Modal Iscrizione Studente */}
      {isEnrollModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 text-left">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Nuova Iscrizione al Corso</h3>
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
                      Registrazione...
                    </>
                  ) : (
                    'Conferma ed Invia Mail'
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
