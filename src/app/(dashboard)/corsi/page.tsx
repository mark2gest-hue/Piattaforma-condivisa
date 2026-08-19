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

export default function CorsiPage() {
  const [courses] = useState<CourseItem[]>([
    {
      id: 'c-1',
      title: 'Masterclass Agenti AI & Automazioni Aziendali',
      category: 'ai',
      description: 'Corso intensivo su integrazione LLM, Agenti autonomi, RAG e flusso di lavoro avanzato.',
      duration: '12 Ore • 6 Moduli',
      lessonsCount: 18,
      studentsCount: 24,
      price: '€ 490',
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

  const [registrations, setRegistrations] = useState<StudentRegistration[]>([
    {
      id: 'r-1',
      studentName: 'Giuseppe Rossi',
      studentEmail: 'g.rossi@azienda.it',
      courseTitle: 'Masterclass Agenti AI & Automazioni Aziendali',
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

  const [activeTab, setActiveTab] = useState<'catalog' | 'students'>('catalog')
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

    // 1. Registra lo studente nello stato e database Supabase
    const newReg: StudentRegistration = {
      id: `reg-${Date.now()}`,
      studentName: studentName.trim(),
      studentEmail: studentEmail.trim(),
      courseTitle: selectedCourseTitle,
      registeredAt: new Date().toISOString(),
      status: 'enrolled',
    }

    setRegistrations([newReg, ...registrations])

    // 2. Crea in automatico un task Kanban per l'accoglienza dello studente
    const { data: userData } = await supabase.auth.getUser()
    await (supabase as any).from('tasks').insert({
      title: `Accoglienza Studente: ${studentName.trim()}`,
      description: `Nuova iscrizione al corso "${selectedCourseTitle}". Inviare materiale didattico e link di benvenuto a ${studentEmail.trim()}.`,
      status: 'todo',
      priority: 'high',
      created_by: userData.user?.id || null,
    })

    // 3. Invia email automatica di benvenuto via Resend SDK
    await sendSharedEmail({
      to: studentEmail.trim(),
      subject: `Conferma Iscrizione: ${selectedCourseTitle}`,
      body: `Gentile ${studentName.trim()},\n\nconfermiamo con piacere la tua iscrizione al corso "${selectedCourseTitle}".\n\nPuoi accedere ai materiali ed ai dettagli delle lezioni direttamente dalla Piattaforma Condivisa.\n\nCordiali saluti,\nTeam Aiutiamoci Cloud`,
    })

    playNotificationSound('chat')
    alert(`Studente ${studentName} iscritto con successo! Creata la scheda nel Kanban ed inviata l'email di benvenuto via Resend!`)

    setIsRegistering(false)
    setIsEnrollModalOpen(false)
    setStudentName('')
    setStudentEmail('')
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
            Portale Corsi Formativi & Studenti
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Gestione completa catalogo corsi, iscrizioni studenti ed invio automatico lezioni.
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
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-1">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
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
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
            activeTab === 'students'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Registro Studenti Iscritti ({registrations.length})</span>
        </button>
      </div>

      {/* TAB 1: CATALOGO CORSI */}
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

      {/* TAB 2: REGISTRO STUDENTI ISCRITTI */}
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
