'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  GraduationCap,
  BookOpen,
  Users,
  CheckCircle2,
  PlusCircle,
  Sparkles,
  Download,
  Mail,
  Send,
  Loader2,
  X,
  PlayCircle,
  Bot,
  Key,
  FileText,
  Lock,
  Unlock,
  Edit,
  Trash2,
  VideoIcon,
  ExternalLink,
  Plus,
  Save,
  Gift,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { playNotificationSound } from '@/lib/notifications'
import { sendSharedEmail } from '../posta/actions'
import { enrollStudentAction } from '@/app/actions/student'
import {
  generateSocialContentAction,
  getBufferProfilesAction,
  publishToBufferAction,
} from '@/app/actions/marketing'

interface CourseItem {
  id: string
  title: string
  category: 'ai' | 'consulting' | 'dev'
  description: string
  duration: string
  lessonsCount: number
  studentsCount: number
  price: string
  status: 'active' | 'draft' | 'archived'
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

interface ZoomRecording {
  id: string
  title: string
  date: string
  videoUrl: string
  description?: string
  order: number
}

interface CourseResource {
  id: string
  title: string
  category: string
  description: string
  fileUrl: string
  fileSize?: string
  createdAt: string
}

// Elenco Completo Reale delle Registrazioni Zoom di Malaradio.com (Zoom 1 - 10 + Bonus 1 & 2)
const REAL_ZOOM_RECORDINGS: ZoomRecording[] = [
  {
    id: 'z-1',
    title: 'Lezione 1 e 2',
    date: '05/05/2026',
    videoUrl: 'https://www.malaradio.com/CorsoAI/RegistrazioniZoom/Zoom1/GMT20260505-182955_Recording_2560x1440.mp4',
    description: 'Introduzione ai concetti chiave ed impostazione dei primi prompt professionali.',
    order: 1,
  },
  {
    id: 'z-2',
    title: 'Lezione 3 e 4',
    date: '07/05/2026',
    videoUrl: 'https://www.malaradio.com/CorsoAI/RegistrazioniZoom/Zoom2/GMT20260507-182806_Recording_gallery_2560x1440.mp4',
    description: 'Gestione e risposte automatiche email commerciali e delegare le task noiose.',
    order: 2,
  },
  {
    id: 'z-3',
    title: 'Lezione 5 e 6',
    date: '19/05/2026',
    videoUrl: 'https://www.malaradio.com/CorsoAI/RegistrazioniZoom/Zoom4/GMT20260519-183538_Recording_gallery_1976x1112.mp4',
    description: 'Creazione contenuti, sintesi PDF lunghi ed analisi dati.',
    order: 3,
  },
  {
    id: 'z-4',
    title: 'Lezione 7 e 8',
    date: '12/05/2026',
    videoUrl: 'https://www.malaradio.com/CorsoAI/RegistrazioniZoom/Zoom3/GMT20260512-182902_Recording_gallery_1992x1120.mp4',
    description: 'Organizzazione del tempo e fogli di calcolo intelligenti.',
    order: 4,
  },
  {
    id: 'z-5',
    title: 'Lezione 9 e 10',
    date: '26/05/2026',
    videoUrl: 'https://www.malaradio.com/CorsoAI/RegistrazioniZoom/Zoom5/GMT20260526-183343_Recording_gallery_1920x1080.mp4',
    description: 'Chat continua con assistente @AI ed Agenti personalizzati.',
    order: 5,
  },
  {
    id: 'z-6',
    title: 'Lezione 11 e 12',
    date: '04/06/2026',
    videoUrl: 'https://www.malaradio.com/CorsoAI/RegistrazioniZoom/Zoom6/GMT20260604-183228_Recording_gallery_1976x1112.mp4',
    description: 'Automazioni senza codice, trascrizione vocali e verbali.',
    order: 6,
  },
  {
    id: 'z-7',
    title: 'Lezioni 13 e 14',
    date: '09/06/2026',
    videoUrl: 'https://www.malaradio.com/CorsoAI/RegistrazioniZoom/Zoom7/GMT20260609-182902_Recording_gallery_1920x1080.mp4',
    description: 'Generazione immagini, grafica e preventivi B2B in tempo reale.',
    order: 7,
  },
  {
    id: 'z-8',
    title: 'Lezione 15 e 16',
    date: '16/06/2026',
    videoUrl: 'https://www.malaradio.com/CorsoAI/RegistrazioniZoom/Zoom8/GMT20260616-182736_Recording_gallery_1920x1112.mp4',
    description: 'Cybersecurity, privacy dati aziendali ed integrazione workflow team.',
    order: 8,
  },
  {
    id: 'z-9',
    title: 'Lezioni 17 e 18',
    date: '23/06/2026',
    videoUrl: 'https://www.malaradio.com/CorsoAI/RegistrazioniZoom/Zoom9/GMT20260623-183430_Recording_gallery_1920x1080.mp4',
    description: 'Analisi dei clienti, sentiment analysis ed automazione offerte.',
    order: 9,
  },
  {
    id: 'z-10',
    title: 'Lezione 19 e 20',
    date: '02/07/2026',
    videoUrl: 'https://www.malaradio.com/CorsoAI/RegistrazioniZoom/Zoom10/GMT20260702-180514_Recording_gallery_1992x1120.mp4',
    description: 'Workflow avanzati e preparazione esame finale.',
    order: 10,
  },
  {
    id: 'z-11',
    title: 'Bonus',
    date: '07/07/2026',
    videoUrl: 'https://www.malaradio.com/CorsoAI/RegistrazioniZoom/ZoomFinale/GMT20260707-183529_Recording_1920x1120.mp4',
    description: 'Sessione finale Q&A e strategie pratiche sul campo.',
    order: 11,
  },
  {
    id: 'z-12',
    title: 'Bonus 2',
    date: '16/07/2026',
    videoUrl: 'https://www.malaradio.com/CorsoAI/RegistrazioniZoom/GMT20260716-172248_Recording_gallery_1920x1120.mp4',
    description: 'Approfondimento agenti avanzati e risorse extra.',
    order: 12,
  },
]

// Mappatura precisa dei 20 Moduli Video del Corso AI Start con gli URL MP4 reali
const AI_START_LESSONS: Lesson[] = [
  { id: 1, title: '1 Benvenuti nel Futuro', duration: '10:30', completed: true, videoUrl: REAL_ZOOM_RECORDINGS[0].videoUrl },
  { id: 2, title: '2 Breve Storia dell\'Evoluzione', duration: '12:45', completed: true, videoUrl: REAL_ZOOM_RECORDINGS[0].videoUrl },
  { id: 3, title: '3 Sconfiggere il Foglio Bianco', duration: '15:20', completed: false, videoUrl: REAL_ZOOM_RECORDINGS[1].videoUrl },
  { id: 4, title: '4 Il Linguaggio della Chiarezza', duration: '14:10', completed: false, videoUrl: REAL_ZOOM_RECORDINGS[1].videoUrl },
  { id: 5, title: '5 La Formula Segreta RCCF', duration: '18:00', completed: false, videoUrl: REAL_ZOOM_RECORDINGS[2].videoUrl },
  { id: 6, title: '6 Iterazione', duration: '16:30', completed: false, videoUrl: REAL_ZOOM_RECORDINGS[2].videoUrl },
  { id: 7, title: '7 ChatGPT, Claude, Gemini, Perplexity', duration: '13:15', completed: false, videoUrl: REAL_ZOOM_RECORDINGS[3].videoUrl },
  { id: 8, title: '8 Scrivere senza Sforzo', duration: '19:40', completed: false, videoUrl: REAL_ZOOM_RECORDINGS[3].videoUrl },
  { id: 9, title: '9 Dipingere con le Parole', duration: '12:00', completed: false, videoUrl: REAL_ZOOM_RECORDINGS[4].videoUrl },
  { id: 10, title: '10 Anatomia di un Prompt Visivo', duration: '14:50', completed: false, videoUrl: REAL_ZOOM_RECORDINGS[4].videoUrl },
  { id: 11, title: '11 Presentazioni in 5 Minuti', duration: '22:10', completed: false, videoUrl: REAL_ZOOM_RECORDINGS[5].videoUrl },
  { id: 12, title: '12 Analisi Dati per Excel', duration: '25:00', completed: false, videoUrl: REAL_ZOOM_RECORDINGS[5].videoUrl },
  { id: 13, title: '13 L\'Agenda Intelligente', duration: '18:20', completed: false, videoUrl: REAL_ZOOM_RECORDINGS[6].videoUrl },
  { id: 14, title: '14 Studiare e Imparare ELI5', duration: '20:00', completed: false, videoUrl: REAL_ZOOM_RECORDINGS[6].videoUrl },
  { id: 15, title: '15 Allucinazioni: Quando l\'IA mente', duration: '15:30', completed: false, videoUrl: REAL_ZOOM_RECORDINGS[7].videoUrl },
  { id: 16, title: '16 Privacy e Sicurezza', duration: '18:45', completed: false, videoUrl: REAL_ZOOM_RECORDINGS[7].videoUrl },
  { id: 17, title: '17 Il Lavoro che Cambia', duration: '20:10', completed: false, videoUrl: REAL_ZOOM_RECORDINGS[8].videoUrl },
  { id: 18, title: '18 Creare il proprio Workflow', duration: '16:00', completed: false, videoUrl: REAL_ZOOM_RECORDINGS[8].videoUrl },
  { id: 19, title: '19 La Tua Nuova Superpotenza', duration: '24:30', completed: false, videoUrl: REAL_ZOOM_RECORDINGS[9].videoUrl },
  { id: 20, title: '20 Riepilogo Corso AI', duration: '15:00', completed: false, videoUrl: REAL_ZOOM_RECORDINGS[9].videoUrl },
]

function CorsiInnerContent() {
  const searchParams = useSearchParams()
  const supabase = createClient()

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
      description: 'Audit processi, integrazione agenti AI personalizzati e formazione staff aziendale.',
      duration: 'Percorso Personalizzato',
      lessonsCount: 12,
      studentsCount: 8,
      price: 'Su Misura',
      status: 'active',
    },
  ])

  // Lezioni attive
  const [lessons, setLessons] = useState<Lesson[]>(AI_START_LESSONS)
  const [activeLesson, setActiveLesson] = useState<Lesson>(lessons[0])

  // Registrazioni Zoom Live
  const [zoomRecordings, setZoomRecordings] = useState<ZoomRecording[]>(REAL_ZOOM_RECORDINGS)
  const [activeZoomVideo, setActiveZoomVideo] = useState<ZoomRecording | null>(null)
  const [isAddZoomModalOpen, setIsAddZoomModalOpen] = useState(false)

  // Risorse Bonus, PDF & Manuali
  const [resources, setResources] = useState<CourseResource[]>([
    {
      id: 'res-1',
      title: 'Cheatsheet Prompting in 3 Parti',
      category: 'Cheatsheet',
      description: 'Guida PDF tascabile per la stesura dei prompt.',
      fileUrl: 'https://www.malaradio.com/CorsoAI/Risorse/Cheatsheet_Prompting.pdf',
      fileSize: '1.2 MB',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'res-2',
      title: 'Template Email Commerciali AI',
      category: 'Template',
      description: '50 Modelli di email formali e risposte ad obiezioni.',
      fileUrl: 'https://www.malaradio.com/CorsoAI/Risorse/Template_Email_Commerciali.pdf',
      fileSize: '2.4 MB',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'res-3',
      title: 'Manuale Operativo Agenti AI B2B',
      category: 'Manuali',
      description: 'Documentazione completa sull’integrazione degli agenti aziendali.',
      fileUrl: 'https://www.malaradio.com/CorsoAI/Risorse/Manuale_Agenti_AI.pdf',
      fileSize: '4.8 MB',
      createdAt: new Date().toISOString(),
    },
  ])
  const [isAddResourceModalOpen, setIsAddResourceModalOpen] = useState(false)
  const [editingResourceId, setEditingResourceId] = useState<string | null>(null)
  const [resTitleInput, setResTitleInput] = useState('')
  const [resCategoryInput, setResCategoryInput] = useState('Manuali')
  const [resDescInput, setResDescInput] = useState('')
  const [resUrlInput, setResUrlInput] = useState('')
  const [resSizeInput, setResSizeInput] = useState('1.5 MB')

  // Form Aggiungi Registrazione Zoom
  const [zoomTitleInput, setZoomTitleInput] = useState('')
  const [zoomDateInput, setZoomDateInput] = useState('')
  const [zoomUrlInput, setZoomUrlInput] = useState('')
  const [zoomDescInput, setZoomDescInput] = useState('')
  const [zoomOrderInput, setZoomOrderInput] = useState<number>(zoomRecordings.length + 1)

  // Modal per inserire/modificare URL video custom della lezione
  const [isEditVideoModalOpen, setIsEditVideoModalOpen] = useState(false)
  const [customVideoUrlInput, setCustomVideoUrlInput] = useState('')

  // Stato Studente Loggato tramite Codice
  const [studentCodeInput, setStudentCodeInput] = useState('')
  const [activeStudent, setActiveStudent] = useState<{ name: string; code: string } | null>(null)
  const [codeError, setCodeError] = useState('')

  // Registrazioni Studenti
  const [registrations, setRegistrations] = useState<StudentRegistration[]>([
    {
      id: 'r-1',
      code: 'STUD-9842',
      studentName: 'Marco Rossi',
      studentEmail: 'marco.rossi@example.com',
      courseTitle: 'AI Start - Intelligenza Artificiale per Consulenti',
      status: 'in_progress',
      registeredAt: '2026-08-15',
    },
    {
      id: 'r-2',
      code: 'STUD-3105',
      studentName: 'Laura Bianchi',
      studentEmail: 'laura.b@example.com',
      courseTitle: 'AI Start - Intelligenza Artificiale per Consulenti',
      status: 'enrolled',
      registeredAt: '2026-08-17',
    },
  ])

  // Chat Studenti con Assistente @AI
  const [chatMessages, setChatMessages] = useState<Array<{ id: string; sender: string; isAi: boolean; text: string; time: string }>>([
    {
      id: 'm-1',
      sender: 'Marco (Studente)',
      isAi: false,
      text: 'Ciao! Ho un dubbio sulla lezione 2 riguardante il Prompt Engineering per le email commerciali.',
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

  const [activeTab, setActiveTab] = useState<'player' | 'zoom' | 'bonus' | 'catalog' | 'students' | 'marketing' | 'login'>('player')

  // Social Content Creator
  const [selectedSocialLessonId, setSelectedSocialLessonId] = useState<number>(1)
  const [selectedSocialPlatform, setSelectedSocialPlatform] = useState<'linkedin' | 'instagram' | 'tiktok'>('linkedin')
  const [selectedSocialTone, setSelectedSocialTone] = useState<'educational' | 'marketing' | 'engaging'>('educational')
  const [generatedSocialCopy, setGeneratedSocialCopy] = useState<string>('')
  const [isGeneratingSocial, setIsGeneratingSocial] = useState<boolean>(false)

  // Buffer Integration States
  const [bufferProfiles, setBufferProfiles] = useState<any[]>([])
  const [selectedBufferProfileIds, setSelectedBufferProfileIds] = useState<string[]>([])
  const [isPublishingBuffer, setIsPublishingBuffer] = useState<boolean>(false)
  const [isBufferLoading, setIsBufferLoading] = useState<boolean>(false)
  const [bufferError, setBufferError] = useState<string>('')
  const [publishSuccessMessage, setPublishSuccessMessage] = useState<string>('')

  // Caricamento persistente da localStorage all'avvio
  useEffect(() => {
    try {
      const savedRes = localStorage.getItem('ti_aiuto_course_resources')
      if (savedRes !== null) {
        const parsed = JSON.parse(savedRes)
        if (Array.isArray(parsed)) {
          setResources(parsed)
        }
      }

      const savedZoom = localStorage.getItem('ti_aiuto_zoom_recordings')
      if (savedZoom !== null) {
        const parsed = JSON.parse(savedZoom)
        if (Array.isArray(parsed)) {
          setZoomRecordings(parsed)
        }
      }

      const savedLessons = localStorage.getItem('ti_aiuto_lessons_custom')
      if (savedLessons !== null) {
        const parsed = JSON.parse(savedLessons)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setLessons(parsed)
          setActiveLesson((prev) => parsed.find((l: any) => l.id === prev.id) || parsed[0])
        }
      }
    } catch (e) {
      console.error('Errore lettura da localStorage:', e)
    }
  }, [])

  // Caricamento profili Buffer all'attivazione della tab marketing
  useEffect(() => {
    if (activeTab === 'marketing') {
      loadBufferProfiles()
    }
  }, [activeTab])

  const loadBufferProfiles = async () => {
    setIsBufferLoading(true)
    setBufferError('')
    try {
      const res = await getBufferProfilesAction()
      if (res.success && res.profiles) {
        setBufferProfiles(res.profiles)
      } else {
        setBufferError(res.error || 'Errore nel recupero profili Buffer.')
      }
    } catch (err: any) {
      setBufferError('Impossibile connettersi a Buffer.')
    } finally {
      setIsBufferLoading(false)
    }
  }

  const handlePublishToBuffer = async (now: boolean) => {
    if (!generatedSocialCopy.trim()) {
      alert('Nessun copy generato da pubblicare.')
      return
    }
    if (selectedBufferProfileIds.length === 0) {
      alert('Seleziona almeno un canale social.')
      return
    }

    setIsPublishingBuffer(true)
    setPublishSuccessMessage('')

    try {
      const res = await publishToBufferAction({
        text: generatedSocialCopy,
        profileIds: selectedBufferProfileIds,
        now,
      })

      if (res.success) {
        setPublishSuccessMessage(now ? 'Post pubblicato con successo sui canali selezionati!' : 'Post aggiunto alla coda di Buffer con successo!')
        setSelectedBufferProfileIds([])
      } else {
        alert(`Errore pubblicazione Buffer: ${res.error}`)
      }
    } catch (err: any) {
      alert(`Errore di rete: ${err.message}`)
    } finally {
      setIsPublishingBuffer(false)
    }
  }

  // Generatore di Card Promozionali HTML5 Canvas
  const handleDownloadSocialCard = () => {
    const activeLessonObj = lessons.find((l) => l.id === selectedSocialLessonId)
    const title = activeLessonObj ? activeLessonObj.title : `Modulo ${selectedSocialLessonId}`

    const canvas = document.createElement('canvas')
    canvas.width = 1080
    canvas.height = 1080
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 1. Sfondo sfumato Premium (Indigo a Deep Slate/Purple)
    const grad = ctx.createLinearGradient(0, 0, 1080, 1080)
    grad.addColorStop(0, '#1e1b4b') // Indigo scuro
    grad.addColorStop(0.5, '#0f172a') // Slate scuro
    grad.addColorStop(1, '#3b0764') // Purple scuro
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 1080, 1080)

    // 2. Griglia geometrica futuristica decorativa (linee di sfondo sottili)
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.1)'
    ctx.lineWidth = 2
    for (let i = 0; i < 1080; i += 120) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i, 1080)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(0, i)
      ctx.lineTo(1080, i)
      ctx.stroke()
    }

    // 3. Cerchi luminosi (bagliori sfocati)
    ctx.beginPath()
    const glowGrad = ctx.createRadialGradient(200, 200, 50, 200, 200, 400)
    glowGrad.addColorStop(0, 'rgba(139, 92, 246, 0.15)')
    glowGrad.addColorStop(1, 'rgba(139, 92, 246, 0)')
    ctx.fillStyle = glowGrad
    ctx.arc(200, 200, 400, 0, Math.PI * 2)
    ctx.fill()

    // 4. Logo / Intestazione "Ti AIuto"
    ctx.fillStyle = '#6366f1' // Indigo
    ctx.font = 'bold 36px sans-serif'
    ctx.fillText('⚡ TI AIUTO', 100, 150)
    
    ctx.fillStyle = '#cbd5e1'
    ctx.font = '32px sans-serif'
    ctx.fillText('aiutiamoci.cloud', 800, 150)

    // Divider
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(100, 200)
    ctx.lineTo(980, 200)
    ctx.stroke()

    // 5. Etichetta corso (AI Start)
    ctx.fillStyle = '#f59e0b' // Amber/Gold
    ctx.font = 'bold 28px sans-serif'
    ctx.fillText('PROGRAMMA FORMATIVO AI START', 100, 320)

    // 6. Titolo Lezione (Avvolto in più righe se troppo lungo)
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 60px sans-serif'
    
    // Funzione helper per scrivere testo su più righe
    const wrapText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
      const words = text.split(' ')
      let line = ''
      let currentY = y

      for (let n = 0; n < words.length; n++) {
        let testLine = line + words[n] + ' '
        let metrics = ctx.measureText(testLine)
        let testWidth = metrics.width
        if (testWidth > maxWidth && n > 0) {
          ctx.fillText(line, x, currentY)
          line = words[n] + ' '
          currentY += lineHeight
        } else {
          line = testLine
        }
      }
      ctx.fillText(line, x, currentY)
      return currentY
    }

    const nextY = wrapText(title, 100, 430, 880, 80)

    // 7. Sotto-didascalia o slogan
    ctx.fillStyle = '#94a3b8' // Slate 400
    ctx.font = '34px sans-serif'
    ctx.fillText('Disponibile ora nell\'Area Studenti', 100, nextY + 140)

    // 8. Call to Action grande
    ctx.fillStyle = 'rgba(99, 102, 241, 0.08)'
    ctx.beginPath()
    ctx.roundRect(100, 820, 880, 150, 30)
    ctx.fill()
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.25)'
    ctx.lineWidth = 2
    ctx.stroke()

    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 36px sans-serif'
    ctx.fillText('👉 Inserisci il tuo codice di accesso per guardare il video!', 150, 905)

    // 9. Scarica il file PNG
    const dataUrl = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.download = `ti-aiuto-lezione-${selectedSocialLessonId}.png`
    link.href = dataUrl
    link.click()
  }

  const handleGenerateSocialCopy = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsGeneratingSocial(true)
    setGeneratedSocialCopy('')

    try {
      const res = await generateSocialContentAction({
        lessonId: selectedSocialLessonId,
        platform: selectedSocialPlatform,
        tone: selectedSocialTone,
      })

      if (res.success && res.text) {
        setGeneratedSocialCopy(res.text)
      } else {
        alert(`Errore generazione: ${res.error}`)
      }
    } catch (err: any) {
      alert(`Errore di rete: ${err.message}`)
    } finally {
      setIsGeneratingSocial(false)
    }
  }

  // Modal Nuova Iscrizione Studente
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false)
  const [selectedCourseTitle, setSelectedCourseTitle] = useState(courses[0].title)
  const [studentName, setStudentName] = useState('')
  const [studentEmail, setStudentEmail] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)

  // Auto-verifica Codice da URL ?code=AI-START-XXXX
  useEffect(() => {
    const urlCode = searchParams?.get('code')
    if (urlCode) {
      verifyAndSetCode(urlCode)
    }
  }, [searchParams])

  const verifyAndSetCode = async (codeStr: string) => {
    const cleanCode = codeStr.trim().toUpperCase()
    setStudentCodeInput(cleanCode)

    // Usa RPC sicura per la verifica (nessun SELECT pubblico)
    const { data } = await (supabase as any).rpc('verify_student_code', { input_code: cleanCode })
    const dbStudent = data && (data as any[]).length > 0 ? (data as any[])[0] : null

    if (dbStudent) {
      setActiveStudent({ name: dbStudent.student_name, code: dbStudent.code })
      setActiveTab('player')
    } else {
      const found = registrations.find((r) => r.code === cleanCode)
      if (found) {
        setActiveStudent({ name: found.studentName, code: found.code })
        setActiveTab('player')
      } else if (cleanCode === 'DEMO2026' || cleanCode.startsWith('AI-START-')) {
        setActiveStudent({ name: 'Studente Autenticato', code: cleanCode })
        setActiveTab('player')
      }
    }
  }

  const generateUniqueCode = () => {
    const randomHex = Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase()
    return `AI-START-${randomHex}`
  }

  const handleVerifyStudentCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setCodeError('')

    const codeClean = studentCodeInput.trim().toUpperCase()
    if (!codeClean) return

    await verifyAndSetCode(codeClean)
  }

  const handleEnrollStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!studentName.trim() || !studentEmail.trim()) return

    setIsRegistering(true)

    // Esegui iscrizione sicura lato server tramite Server Action (supera RLS)
    const result = await enrollStudentAction({
      studentName: studentName.trim(),
      studentEmail: studentEmail.trim(),
      courseTitle: selectedCourseTitle,
      source: 'dashboard',
    })

    if (!result.success) {
      alert(`Errore durante l'iscrizione: ${result.error}`)
      setIsRegistering(false)
      return
    }

    const generatedCode = result.code || ''

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

    playNotificationSound('chat')
    alert(`Studente ${studentName} iscritto con successo! Codice generato: ${generatedCode}. Inviata mail via Resend!`)

    setIsRegistering(false)
    setIsEnrollModalOpen(false)
    setStudentName('')
    setStudentEmail('')
  }

  const handleDeleteStudent = async (studentId: string, name: string, code: string) => {
    if (!confirm(`Sei sicuro di voler eliminare lo studente "${name}" (Codice: ${code}) dal sistema?`)) return

    await supabase.from('student_codes').delete().eq('code', code)
    setRegistrations(registrations.filter((r) => r.id !== studentId))
  }

  const handleSaveZoomRecording = (e: React.FormEvent) => {
    e.preventDefault()
    if (!zoomTitleInput.trim() || !zoomUrlInput.trim()) return

    const newZoom: ZoomRecording = {
      id: `z-${Date.now()}`,
      title: zoomTitleInput.trim(),
      date: zoomDateInput.trim() || new Date().toLocaleDateString('it-IT'),
      videoUrl: zoomUrlInput.trim(),
      description: zoomDescInput.trim(),
      order: zoomOrderInput || zoomRecordings.length + 1,
    }

    const updatedZoom = [newZoom, ...zoomRecordings]
    setZoomRecordings(updatedZoom)
    try {
      localStorage.setItem('ti_aiuto_zoom_recordings', JSON.stringify(updatedZoom))
    } catch (e) {}

    setIsAddZoomModalOpen(false)
    setZoomTitleInput('')
    setZoomUrlInput('')
    setZoomDescInput('')
    alert(`Registrazione Zoom "${newZoom.title}" aggiunta con successo!`)
  }

  const handleDeleteZoom = (id: string, title: string) => {
    if (!confirm(`Sei sicuro di voler eliminare la registrazione "${title}"?`)) return
    const updatedZoom = zoomRecordings.filter((z) => z.id !== id)
    setZoomRecordings(updatedZoom)
    try {
      localStorage.setItem('ti_aiuto_zoom_recordings', JSON.stringify(updatedZoom))
    } catch (e) {}
  }

  const handleSaveResource = (e: React.FormEvent) => {
    e.preventDefault()
    if (!resTitleInput.trim() || !resUrlInput.trim()) return

    let updatedResources: CourseResource[]

    if (editingResourceId) {
      updatedResources = resources.map((r) =>
        r.id === editingResourceId
          ? {
              ...r,
              title: resTitleInput.trim(),
              category: resCategoryInput,
              description: resDescInput.trim(),
              fileUrl: resUrlInput.trim(),
              fileSize: resSizeInput.trim() || r.fileSize || '1.5 MB',
            }
          : r
      )
    } else {
      const newRes: CourseResource = {
        id: `res-${Date.now()}`,
        title: resTitleInput.trim(),
        category: resCategoryInput,
        description: resDescInput.trim(),
        fileUrl: resUrlInput.trim(),
        fileSize: resSizeInput.trim() || '1.5 MB',
        createdAt: new Date().toISOString(),
      }
      updatedResources = [newRes, ...resources]
    }

    setResources(updatedResources)
    try {
      localStorage.setItem('ti_aiuto_course_resources', JSON.stringify(updatedResources))
    } catch (e) {}

    setIsAddResourceModalOpen(false)
    setEditingResourceId(null)
    setResTitleInput('')
    setResUrlInput('')
    setResDescInput('')
    alert(editingResourceId ? 'Risorsa aggiornata con successo!' : `Risorsa/Manuale "${resTitleInput.trim()}" aggiunta con successo!`)
  }

  const handleEditResource = (res: CourseResource) => {
    setEditingResourceId(res.id)
    setResTitleInput(res.title)
    setResCategoryInput(res.category)
    setResDescInput(res.description)
    setResUrlInput(res.fileUrl)
    setResSizeInput(res.fileSize || '1.5 MB')
    setIsAddResourceModalOpen(true)
  }

  const handleDeleteResource = (id: string, title: string) => {
    if (!confirm(`Sei sicuro di voler eliminare la risorsa "${title}"?`)) return
    const updatedResources = resources.filter((r) => r.id !== id)
    setResources(updatedResources)
    try {
      localStorage.setItem('ti_aiuto_course_resources', JSON.stringify(updatedResources))
    } catch (e) {}
  }

  const handleSendStudentChat = (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim()) return

    const userText = chatInput.trim()
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    const userMsg = {
      id: `m-${Date.now()}`,
      sender: activeStudent ? `${activeStudent.name} (Studente)` : 'Marco (Studente)',
      isAi: false,
      text: userText,
      time: now,
    }

    setChatMessages((prev) => [...prev, userMsg])
    setChatInput('')

    if (userText.includes('@AI') || userText.includes('@ai') || userText.length > 5) {
      setIsAiThinking(true)
      setTimeout(() => {
        const aiMsg = {
          id: `m-ai-${Date.now()}`,
          sender: 'Assistente @AI Ti AIuto',
          isAi: true,
          text: `Ho ricevuto la tua richiesta! Nel percorso AI Start affrontiamo esattamente questo tema. Se hai dubbi su uno specifico dei 20 moduli video, fammelo sapere!`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
        setChatMessages((prev) => [...prev, aiMsg])
        setIsAiThinking(false)
        playNotificationSound('chat')
      }, 1000)
    }
  }

  const isLessonUnlocked = (index: number) => {
    if (!activeStudent || lessons.every((l) => l.completed)) return true
    if (index === 0) return true
    return lessons[index - 1].completed
  }

  const toggleLessonCompleted = (lessonId: number) => {
    const updatedLessons = lessons.map((l) => (l.id === lessonId ? { ...l, completed: !l.completed } : l))
    setLessons(updatedLessons)

    const currentIndex = lessons.findIndex((l) => l.id === lessonId)
    if (currentIndex >= 0 && currentIndex < lessons.length - 1) {
      const nextLesson = updatedLessons[currentIndex + 1]
      setActiveLesson(nextLesson)
    }
  }

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
            20 Lezioni Video AI Start, Registrazioni Zoom Live (12 Sessioni MP4), risorse PDF e supporto @AI.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeStudent ? (
            <div className="flex items-center gap-2">
              <Badge variant="success" className="py-1 px-3 flex items-center gap-1 text-xs">
                <Unlock className="h-3.5 w-3.5" />
                <span>Studente: <strong>{activeStudent.name}</strong> ({activeStudent.code})</span>
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveStudent(null)}
                className="text-xs text-slate-400 hover:text-white h-8"
              >
                Esci
              </Button>
            </div>
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

          {!activeStudent && (
            <Button
              onClick={() => setIsEnrollModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2 shadow-xs text-xs font-semibold h-10 px-4 rounded-xl"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Iscrivi Studente</span>
            </Button>
          )}
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
          <span>Player 20 Video Lezioni</span>
        </button>

        <button
          onClick={() => setActiveTab('zoom')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all shrink-0 ${
            activeTab === 'zoom'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <VideoIcon className="h-4 w-4" />
          <span>Registrazioni Zoom ({zoomRecordings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('bonus')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all shrink-0 ${
            activeTab === 'bonus'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Gift className="h-4 w-4" />
          <span>Risorse & Manuali ({resources.length})</span>
        </button>

        {!activeStudent && (
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
        )}

        {!activeStudent && (
          <button
            onClick={() => setActiveTab('students')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all shrink-0 ${
              activeTab === 'students'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Registro Codici & Studenti ({registrations.length})</span>
          </button>
        )}

        {!activeStudent && (
          <button
            onClick={() => setActiveTab('marketing')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all shrink-0 ${
              activeTab === 'marketing'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            <span>Social Creator @AI</span>
          </button>
        )}
      </div>

      {/* TAB: LOGIN CON CODICE STUDENTE */}
      {activeTab === 'login' && (
        <div className="max-w-md mx-auto bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 text-center">
          <div className="h-16 w-16 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto border border-indigo-200 dark:border-indigo-800">
            <Key className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Accedi come Studente</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Inserisci il tuo Codice Accesso Univoco per sbloccare le 20 lezioni video ed il supporto @AI.
            </p>
          </div>

          <form onSubmit={handleVerifyStudentCode} className="space-y-4">
            <Input
              autoFocus
              required
              value={studentCodeInput}
              onChange={(e) => setStudentCodeInput(e.target.value)}
              placeholder="Es. AI-START-8F92 oppure DEMO2026"
              className="text-center font-mono uppercase tracking-widest font-bold text-sm h-11 dark:bg-slate-800 dark:border-slate-700"
            />

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
            <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-xl overflow-hidden relative aspect-video flex items-center justify-center group">
              <video
                key={activeLesson.id}
                controls
                playsInline
                preload="metadata"
                controlsList="nodownload"
                onEnded={() => {
                  if (!activeLesson.completed) toggleLessonCompleted(activeLesson.id)
                }}
                src={activeLesson.videoUrl || REAL_ZOOM_RECORDINGS[0].videoUrl}
                className="w-full h-full object-cover rounded-2xl"
              >
                Il tuo browser non supporta il riproduttore video.
              </video>
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
                  {!activeStudent && (
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
                  )}

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
                  {lessons.map((lesson, idx) => {
                    const isUnlocked = isLessonUnlocked(idx)
                    return (
                      <div
                        key={lesson.id}
                        onClick={() => {
                          if (isUnlocked) {
                            setActiveLesson(lesson)
                          } else {
                            alert(`Devi prima completare la "${lessons[idx - 1].title}" per sbloccare questo modulo!`)
                          }
                        }}
                        className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                          !isUnlocked
                            ? 'opacity-60 bg-slate-100/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 cursor-not-allowed'
                            : activeLesson.id === lesson.id
                            ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 font-bold cursor-pointer'
                            : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center gap-3 truncate pr-2">
                          {isUnlocked ? (
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
                          ) : (
                            <div className="h-5 w-5 rounded-full border border-slate-300 dark:border-slate-700 bg-slate-200 dark:bg-slate-800 flex items-center justify-center shrink-0 text-slate-400">
                              <Lock className="h-3 w-3" />
                            </div>
                          )}

                          <span className={`text-xs truncate ${!isUnlocked ? 'text-slate-400 dark:text-slate-500' : activeLesson.id === lesson.id ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-700 dark:text-slate-300'}`}>
                            {lesson.title}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {!isUnlocked ? (
                            <Badge variant="secondary" className="text-[9px] px-1.5 py-0 gap-1 bg-slate-200 dark:bg-slate-800 text-slate-500">
                              <Lock className="h-2.5 w-2.5" />
                              <span>BLOCCATA</span>
                            </Badge>
                          ) : activeLesson.id === lesson.id ? (
                            <Badge variant="purple" className="text-[9px] px-1.5 py-0">IN RIPRODUZIONE</Badge>
                          ) : null}
                          <span className="text-[11px] text-slate-400 font-mono">
                            {lesson.duration}
                          </span>
                        </div>
                      </div>
                    )
                  })}
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
              <Badge variant="success" className="text-[9px] uppercase">Online 24/7</Badge>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3 rounded-xl max-w-[88%] space-y-1 ${
                    msg.isAi
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/80 text-slate-900 dark:text-slate-100 ml-0'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 ml-auto'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-[11px] text-indigo-600 dark:text-indigo-400">
                    <span className="flex items-center gap-1">
                      {msg.isAi && <Sparkles className="h-3 w-3 text-amber-500" />}
                      {msg.sender}
                    </span>
                    <span className="text-[9px] font-normal text-slate-400">{msg.time}</span>
                  </div>
                  <p className="leading-relaxed">{msg.text}</p>
                </div>
              ))}

              {isAiThinking && (
                <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-xs flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                  <span className="text-slate-400 font-mono text-[11px]">Assistente @AI sta elaborando...</span>
                </div>
              )}
            </div>

            <form onSubmit={handleSendStudentChat} className="p-3 border-t border-slate-200 dark:border-slate-800 flex gap-2">
              <Input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Scrivi una domanda o digita @AI..."
                className="text-xs h-10 dark:bg-slate-800 dark:border-slate-700"
              />
              <Button type="submit" size="icon" className="h-10 w-10 shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: REGISTRAZIONI ZOOM LIVE */}
      {activeTab === 'zoom' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <VideoIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                Registrazioni Zoom Live ({zoomRecordings.length})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Sessioni live registrate disponibili per i corsisti. Incolla il link diretto alla registrazione.
              </p>
            </div>

            {!activeStudent && (
              <Button
                onClick={() => setIsAddZoomModalOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs h-10 px-4 rounded-xl gap-2 shadow-xs"
              >
                <Plus className="h-4 w-4" />
                <span>Aggiungi Registrazione</span>
              </Button>
            )}
          </div>

          {/* RIPRODUTTORE VIDEO ZOOM ATTIVO */}
          {activeZoomVideo && (
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 shadow-2xl space-y-3">
              <div className="flex items-center justify-between text-white border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <PlayCircle className="h-5 w-5 text-indigo-400" />
                  <span className="font-bold text-sm">Riproduzione Live: {activeZoomVideo.title} ({activeZoomVideo.date})</span>
                </div>
                <Button size="sm" variant="ghost" onClick={() => setActiveZoomVideo(null)} className="text-xs text-slate-400 hover:text-white">
                  Chiudi Player
                </Button>
              </div>

              <div className="aspect-video w-full rounded-xl overflow-hidden bg-black">
                <video
                  key={activeZoomVideo.id}
                  controls
                  playsInline
                  preload="metadata"
                  src={activeZoomVideo.videoUrl}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {/* LISTA SCHEDE REGISTRAZIONI ZOOM */}
          <div className="space-y-3">
            {zoomRecordings.map((rec) => (
              <div
                key={rec.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-indigo-500/50 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <PlayCircle className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{rec.title}</span>
                      <span className="text-[10px] font-mono font-normal text-slate-400">({rec.date})</span>
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate max-w-xl">
                      {rec.videoUrl}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    onClick={() => setActiveZoomVideo(rec)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-9 px-4 rounded-xl gap-1.5 shadow-xs"
                  >
                    <PlayCircle className="h-4 w-4" />
                    <span>Guarda Video</span>
                  </Button>

                  <a href={rec.videoUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="text-xs h-9 gap-1.5 border-slate-200 dark:border-slate-800">
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>Apri Link</span>
                    </Button>
                  </a>

                  {!activeStudent && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteZoom(rec.id, rec.title)}
                      className="h-9 w-9 text-slate-400 hover:text-red-600 dark:hover:text-red-400"
                      title="Elimina Registrazione"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: RISORSE BONUS & MANUALI */}
      {activeTab === 'bonus' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Gift className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                Risorse Bonus, PDF & Manuali ({resources.length})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Documenti integrativi, template di prompt pronti all'uso e guide in formato PDF per gli studenti.
              </p>
            </div>

            {!activeStudent && (
              <Button
                onClick={() => {
                  setEditingResourceId(null)
                  setResTitleInput('')
                  setResUrlInput('')
                  setResDescInput('')
                  setResSizeInput('1.5 MB')
                  setIsAddResourceModalOpen(true)
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs h-10 px-4 rounded-xl gap-2 shadow-xs"
              >
                <Plus className="h-4 w-4" />
                <span>+ Carica Nuova Risorsa</span>
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resources.map((res) => (
              <div key={res.id} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 flex flex-col justify-between hover:border-indigo-500/50 transition-all">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="purple" className="text-[9px] uppercase">{res.category}</Badge>
                    <span className="text-[10px] text-slate-400 font-mono">{res.fileSize || 'PDF'}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <FileText className="h-6 w-6 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{res.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{res.description}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <a href={res.fileUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                    <Button variant="outline" size="sm" className="w-full text-xs gap-2 border-slate-200 dark:border-slate-700">
                      <Download className="h-3.5 w-3.5 text-indigo-600" />
                      <span>Scarica Documento ({res.fileSize || 'PDF'})</span>
                    </Button>
                  </a>

                  {!activeStudent && (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditResource(res)}
                        className="h-8 w-8 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                        title="Modifica Risorsa"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteResource(res.id, res.title)}
                        className="h-8 w-8 text-slate-400 hover:text-red-600 dark:hover:text-red-400"
                        title="Elimina Risorsa"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: CATALOGO CORSI */}
      {activeTab === 'catalog' && !activeStudent && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              Catalogo Corsi Formativi ({courses.length})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Elenco dei percorsi formativi attivi e prossimamente disponibili.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courses.map((course) => (
              <div key={course.id} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 hover:border-indigo-500/50 transition-all">
                <div className="flex items-center justify-between">
                  <Badge
                    variant={course.status === 'active' ? 'success' : 'secondary'}
                    className="text-[9px] uppercase"
                  >
                    {course.status === 'active' ? 'Attivo' : course.status === 'draft' ? 'Bozza' : 'Archiviato'}
                  </Badge>
                  <span className="text-xs font-mono text-slate-400">{course.duration}</span>
                </div>

                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{course.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{course.description}</p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <PlayCircle className="h-3.5 w-3.5 text-indigo-600" />
                      {course.lessonsCount} Lezioni
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5 text-indigo-600" />
                      {course.studentsCount} Studenti
                    </span>
                  </div>
                  <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{course.price}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: MARKETING / SOCIAL CREATOR */}
      {activeTab === 'marketing' && !activeStudent && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              AI Social Content Builder
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Genera post per i social media basandoti sui 20 moduli reali del corso AI Start per promuovere la piattaforma.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form parametri di generazione & Buffer */}
            <div className="space-y-6">
              {/* Form Parametri */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Parametri di Generazione</h4>
                
                <form onSubmit={handleGenerateSocialCopy} className="space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Seleziona la Lezione del Corso</label>
                    <select
                      value={selectedSocialLessonId}
                      onChange={(e) => setSelectedSocialLessonId(Number(e.target.value))}
                      className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-700 px-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      {lessons.map((lesson) => (
                        <option key={lesson.id} value={lesson.id}>
                          {lesson.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Piattaforma Social</label>
                    <select
                      value={selectedSocialPlatform}
                      onChange={(e) => setSelectedSocialPlatform(e.target.value as any)}
                      className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-700 px-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      <option value="linkedin">LinkedIn (Post Professionale)</option>
                      <option value="instagram">Instagram (Carosello / Copy Slide)</option>
                      <option value="tiktok">TikTok / Reel (Video Script)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Tono del Messaggio</label>
                    <select
                      value={selectedSocialTone}
                      onChange={(e) => setSelectedSocialTone(e.target.value as any)}
                      className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-700 px-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      <option value="educational">Educativo / Formativo</option>
                      <option value="marketing">Persuasivo / Orientato alle vendite</option>
                      <option value="engaging">Entusiasta / Coinvolgente</option>
                    </select>
                  </div>

                  <Button
                    type="submit"
                    disabled={isGeneratingSocial}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold gap-2 h-11 rounded-xl shadow-xs"
                  >
                    {isGeneratingSocial ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-white" />
                        <span>Generazione in corso...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 text-white" />
                        <span>Genera Post con @AI</span>
                      </>
                    )}
                  </Button>
                </form>
              </div>

              {/* Box Buffer */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <ExternalLink className="h-3.5 w-3.5 text-indigo-600" />
                  Pubblica con Buffer
                </h4>

                {isBufferLoading ? (
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                    <span>Connessione canali Buffer...</span>
                  </div>
                ) : bufferError ? (
                  <div className="p-3 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-xl text-[11px] leading-relaxed">
                    <p className="font-semibold mb-1">Integrazione Buffer non attiva:</p>
                    <p className="text-[10px] opacity-90">{bufferError}</p>
                    <p className="text-[10px] mt-2 font-mono bg-slate-900 text-slate-300 p-1.5 rounded">
                      Aggiungi BUFFER_ACCESS_TOKEN in .env.local
                    </p>
                  </div>
                ) : bufferProfiles.length === 0 ? (
                  <p className="text-xs text-slate-400">Nessun profilo social configurato su Buffer.</p>
                ) : (
                  <div className="space-y-4 text-xs">
                    <div className="space-y-2">
                      <label className="font-semibold text-slate-700 dark:text-slate-300">Seleziona Canali Social</label>
                      <div className="space-y-1.5 max-h-40 overflow-y-auto border border-slate-100 dark:border-slate-800 p-2 rounded-xl">
                        {bufferProfiles.map((profile) => {
                          const isChecked = selectedBufferProfileIds.includes(profile.id)
                          return (
                            <label key={profile.id} className="flex items-center gap-2 p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedBufferProfileIds([...selectedBufferProfileIds, profile.id])
                                  } else {
                                    setSelectedBufferProfileIds(selectedBufferProfileIds.filter((id) => id !== profile.id))
                                  }
                                }}
                                className="rounded text-indigo-600 border-slate-300 focus:ring-indigo-500"
                              />
                              <span className="font-mono text-[9px] uppercase bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded font-bold">
                                {profile.service}
                              </span>
                              <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 truncate">
                                {profile.formatted_username}
                              </span>
                            </label>
                          )
                        })}
                      </div>
                    </div>

                    {publishSuccessMessage && (
                      <p className="p-2.5 bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400 rounded-xl text-[11px]">
                        {publishSuccessMessage}
                      </p>
                    )}

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <Button
                        type="button"
                        disabled={isPublishingBuffer || !generatedSocialCopy}
                        onClick={() => handlePublishToBuffer(false)}
                        variant="outline"
                        className="text-xs h-9 border-slate-200 dark:border-slate-700 font-semibold"
                      >
                        {isPublishingBuffer ? 'Invio...' : 'Metti in Coda'}
                      </Button>
                      <Button
                        type="button"
                        disabled={isPublishingBuffer || !generatedSocialCopy}
                        onClick={() => handlePublishToBuffer(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs h-9 shadow-xs"
                      >
                        {isPublishingBuffer ? 'Invio...' : 'Pubblica Ora'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Output area & Canvas Preview */}
            <div className="lg:col-span-2 space-y-6">
              {/* Copy Output */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col min-h-[250px]">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Copy Social Generato</h4>
                  {generatedSocialCopy && (
                    <Button
                      onClick={() => {
                        navigator.clipboard.writeText(generatedSocialCopy)
                        alert('Copy copiato negli appunti!')
                      }}
                      variant="outline"
                      size="sm"
                      className="text-xs h-8 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 gap-1.5"
                    >
                      Copia Copy
                    </Button>
                  )}
                </div>

                <div className="flex-1 flex flex-col justify-center">
                  {generatedSocialCopy ? (
                    <pre className="text-xs font-sans text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed max-w-full overflow-x-auto select-all">
                      {generatedSocialCopy}
                    </pre>
                  ) : (
                    <div className="text-center space-y-2 text-slate-400 py-12">
                      <Sparkles className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-700 animate-pulse" />
                      <p className="text-[11px] font-mono">
                        Seleziona i parametri e clicca "Genera" per creare il tuo post social con l'Intelligenza Artificiale.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Canvas Card Generator Preview */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Grafica Promozionale</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Genera un'immagine banner ad alta risoluzione (1080x1080) per questo modulo.</p>
                  </div>
                  <Button
                    onClick={handleDownloadSocialCard}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-9 font-semibold px-4 rounded-xl gap-2 shadow-xs"
                  >
                    <Download className="h-4 w-4 text-white" />
                    Scarica PNG
                  </Button>
                </div>

                {/* Mockup visuale stilizzato della Card */}
                <div className="relative aspect-square max-w-[280px] mx-auto rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-lg bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 p-6 flex flex-col justify-between text-white font-sans">
                  {/* Griglia astratta decorativa */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:20px_20px]" />
                  <div className="absolute top-10 left-10 w-24 h-24 bg-violet-500/10 rounded-full blur-xl" />

                  <div className="flex justify-between items-center text-[10px] opacity-70 font-mono relative z-10">
                    <span>⚡ TI AIUTO</span>
                    <span>aiutiamoci.cloud</span>
                  </div>

                  <div className="space-y-2 relative z-10 my-auto">
                    <span className="text-[8px] font-bold text-amber-500 tracking-widest uppercase">CORSO AI START</span>
                    <h5 className="font-extrabold text-sm leading-tight text-white">
                      {lessons.find((l) => l.id === selectedSocialLessonId)?.title || `Modulo ${selectedSocialLessonId}`}
                    </h5>
                    <p className="text-[8px] text-slate-400">Area Studenti Ti AIuto</p>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-lg p-2.5 text-[8px] flex items-center justify-between relative z-10">
                    <span>👉 Inserisci il codice per sbloccare</span>
                    <span className="bg-indigo-600 px-1.5 py-0.5 rounded text-white font-bold">VAI</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: REGISTRO STUDENTI & CODICI */}
      {activeTab === 'students' && !activeStudent && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Registro Codici & Studenti Iscritti</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Elenco dei codici univoci generati e degli studenti accreditati.
              </p>
            </div>

            <Button
              onClick={() => setIsEnrollModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs h-10 px-4 rounded-xl gap-2 shadow-xs"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Iscrivi Nuovi Studente</span>
            </Button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase">
                  <tr>
                    <th className="py-3 px-4">Codice Accesso</th>
                    <th className="py-3 px-4">Nome Studente</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Corso Formativo</th>
                    <th className="py-3 px-4">Stato Iscrizione</th>
                    <th className="py-3 px-4 text-right">Azioni</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {registrations.map((reg) => (
                    <tr key={reg.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
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
                      <td className="py-3.5 px-4 text-right flex items-center justify-end gap-1">
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
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteStudent(reg.id, reg.studentName, reg.code)}
                          className="h-7 w-7 text-slate-400 hover:text-red-600 dark:hover:text-red-400"
                          title="Elimina Studente e Codice"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
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

      {/* Modal Aggiungi Registrazione Zoom */}
      {isAddZoomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <VideoIcon className="h-5 w-5 text-indigo-600" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Aggiungi Registrazione Zoom</h3>
              </div>
              <button onClick={() => setIsAddZoomModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveZoomRecording} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Titolo *</label>
                  <Input
                    required
                    value={zoomTitleInput}
                    onChange={(e) => setZoomTitleInput(e.target.value)}
                    placeholder="Es. Lezione 15 e 16"
                    className="dark:bg-slate-800 dark:border-slate-700"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Data registrazione</label>
                  <Input
                    value={zoomDateInput}
                    onChange={(e) => setZoomDateInput(e.target.value)}
                    placeholder="Es. 16/06/2026"
                    className="dark:bg-slate-800 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Link registrazione *</label>
                <Input
                  required
                  value={zoomUrlInput}
                  onChange={(e) => setZoomUrlInput(e.target.value)}
                  placeholder="https://www.malaradio.com/CorsoAI/RegistrazioniZoom/Zoom8/..."
                  className="font-mono text-[11px] dark:bg-slate-800 dark:border-slate-700"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Descrizione</label>
                <textarea
                  value={zoomDescInput}
                  onChange={(e) => setZoomDescInput(e.target.value)}
                  placeholder="Descrizione sintetica degli argomenti trattati nella registrazione..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsAddZoomModalOpen(false)}>
                  Annulla
                </Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold gap-2">
                  <Save className="h-4 w-4" />
                  Salva Registrazione
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Aggiungi Risorsa / Manuale PDF */}
      {isAddResourceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-indigo-600" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {editingResourceId ? 'Modifica Risorsa o Manuale' : 'Aggiungi Nuova Risorsa o Manuale'}
                </h3>
              </div>
              <button onClick={() => setIsAddResourceModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveResource} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Titolo Documento *</label>
                  <Input
                    required
                    value={resTitleInput}
                    onChange={(e) => setResTitleInput(e.target.value)}
                    placeholder="Es. Manuale Prompting Avanzato"
                    className="dark:bg-slate-800 dark:border-slate-700"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Categoria</label>
                  <select
                    value={resCategoryInput}
                    onChange={(e) => setResCategoryInput(e.target.value)}
                    className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-700 px-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Manuali">Manuali</option>
                    <option value="Cheatsheet">Cheatsheet</option>
                    <option value="Template">Template</option>
                    <option value="Risorse Bonus">Risorse Bonus</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Link URL del File PDF / Documento *</label>
                <Input
                  required
                  value={resUrlInput}
                  onChange={(e) => setResUrlInput(e.target.value)}
                  placeholder="https://www.malaradio.com/CorsoAI/Risorse/Manuale.pdf"
                  className="font-mono text-[11px] dark:bg-slate-800 dark:border-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Dimensione indicativa</label>
                  <Input
                    value={resSizeInput}
                    onChange={(e) => setResSizeInput(e.target.value)}
                    placeholder="Es. 2.5 MB"
                    className="dark:bg-slate-800 dark:border-slate-700"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Descrizione</label>
                  <Input
                    value={resDescInput}
                    onChange={(e) => setResDescInput(e.target.value)}
                    placeholder="Sintetica descrizione del contenuto..."
                    className="dark:bg-slate-800 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsAddResourceModalOpen(false)}>
                  Annulla
                </Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold gap-2">
                  <Save className="h-4 w-4" />
                  Salva Risorsa
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Iscrizione Studente */}
      {isEnrollModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <PlusCircle className="h-5 w-5 text-indigo-600" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Iscrivi Nuovo Studente</h3>
              </div>
              <button onClick={() => setIsEnrollModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEnrollStudent} className="p-6 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Nome e Cognome *</label>
                <Input
                  required
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Es. Giuseppe Rossi"
                  className="dark:bg-slate-800 dark:border-slate-700"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Email *</label>
                <Input
                  required
                  type="email"
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  placeholder="Es. g.rossi@azienda.it"
                  className="font-mono dark:bg-slate-800 dark:border-slate-700"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Corso</label>
                <select
                  value={selectedCourseTitle}
                  onChange={(e) => setSelectedCourseTitle(e.target.value)}
                  className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-700 px-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.title}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsEnrollModalOpen(false)}>
                  Annulla
                </Button>
                <Button
                  type="submit"
                  disabled={isRegistering}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold gap-2"
                >
                  {isRegistering ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {isRegistering ? 'Registrazione...' : 'Iscrivi & Genera Codice'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Modifica Titolo & Video Link */}
      {isEditVideoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <Edit className="h-5 w-5 text-indigo-600" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Modifica Video Link — Lezione {activeLesson.id}</h3>
              </div>
              <button onClick={() => setIsEditVideoModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (!customVideoUrlInput.trim()) return
                const updatedLessons = lessons.map((l) =>
                  l.id === activeLesson.id ? { ...l, videoUrl: customVideoUrlInput.trim() } : l
                )
                setLessons(updatedLessons)
                setActiveLesson({ ...activeLesson, videoUrl: customVideoUrlInput.trim() })
                try {
                  localStorage.setItem('ti_aiuto_lessons_custom', JSON.stringify(updatedLessons))
                } catch (e) {}
                setIsEditVideoModalOpen(false)
                alert(`Video link della Lezione ${activeLesson.id} aggiornato!`)
              }}
              className="p-6 space-y-4 text-xs"
            >
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Titolo Lezione</label>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{activeLesson.title}</p>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">URL Video (MP4 o embed) *</label>
                <Input
                  required
                  value={customVideoUrlInput}
                  onChange={(e) => setCustomVideoUrlInput(e.target.value)}
                  placeholder="https://www.malaradio.com/CorsoAI/..."
                  className="font-mono text-[11px] dark:bg-slate-800 dark:border-slate-700"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsEditVideoModalOpen(false)}>
                  Annulla
                </Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold gap-2">
                  <Save className="h-4 w-4" />
                  Salva Video Link
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default function CorsiPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center font-mono text-xs">Caricamento Portale Corsi...</div>}>
      <CorsiInnerContent />
    </Suspense>
  )
}
