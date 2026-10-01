'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
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
  Award,
  HelpCircle,
  TrendingUp,
  UserCheck,
  FileSpreadsheet,
  Share2,
  Clock,
  ClipboardList,
  RefreshCw,
  Copy,
  Check,
  Search,
  Sun,
  Moon,
} from 'lucide-react'
import { useTheme } from '@/components/theme-provider'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { playNotificationSound } from '@/lib/notifications'
import { sendSharedEmail } from '../posta/actions'
import { encodeReferralCode } from '@/lib/referral-mask'
import {
  enrollStudentAction,
  bulkEnrollStudentsAction,
  getWaitlistLeadsAction,
  convertWaitlistLeadAction,
  getCourseRegistrationsAction,
  approveCourseRegistrationAction,
  deleteCourseRegistrationAction,
  getStudentCodesAction,
  deleteStudentCodeAction,
  verifyStudentCodeAction,
  validateStudentActiveSessionAction,
  upgradeStudentTierAction,
} from '@/app/actions/student'
import {
  LESSON_SUMMARIES,
  CHECKPOINT_TESTS,
  LESSON_SUMMARIES_PRO,
  CHECKPOINT_TESTS_PRO,
  CheckpointTest,
  PRACTICAL_GUIDES,
  PracticalGuide,
} from '@/lib/course-data'
import { askStudentAiAction, generateLessonQuizAction, QuizQuestion } from '@/app/actions/ai'
import { CourseRegistration } from '@/types/index'
import { StudentTasksZone } from '@/app/workshop-agenti/components/StudentTasksZone'

interface StudentRegistration {
  id: string
  code: string
  studentName: string
  studentEmail: string
  courseTitle: string
  registeredAt: string
  status: 'enrolled' | 'completed' | 'in_progress'
  accessTier?: 'ai-start' | 'ai-pro' | 'both'
}

interface WaitlistLead {
  id: string
  email: string
  name?: string
  course_interest: string
  converted_to_student: boolean
  created_at: string
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

export interface BonusVideoItem {
  id: string
  title: string
  category: 'News' | 'Tutorial' | 'Approfondimento' | 'Tool AI'
  duration: string
  videoUrl: string
  description?: string
  date: string
  resourcesUrl?: string
}

// Lista iniziale di default per Video Bonus, News & Tutorial (Aggiornata settimanalmente)
const INITIAL_BONUS_VIDEOS: BonusVideoItem[] = [
  {
    id: 'news-2026-w38-1',
    title: 'Claude 3.7 Sonnet & Extended Thinking: Quando Attivare il Ragionamento Ibrido',
    category: 'News',
    duration: '12:15',
    date: '23/09/2026',
    videoUrl: 'https://aiutiamoci.cloud/videos/lesson_07_full_production.mp4',
    description: 'Come sfruttare la nuova modalità ibrida di Anthropic: risposte istantanee per copy veloce vs catene di pensiero profondo per contratti e logica.',
  },
  {
    id: 'news-2026-w38-2',
    title: 'Gemini 2.5 Flash & Live Audio: Analizzare Documenti e Video in Tempo Reale',
    category: 'News',
    duration: '10:40',
    date: '21/09/2026',
    videoUrl: 'https://aiutiamoci.cloud/videos/lesson_09_full_production.mp4',
    description: 'Panoramica sui nuovi contesti da 1M token e sull\'elaborazione in tempo reale di audio, tabelle complesse e scansioni.',
  },
  {
    id: 'tutorial-2026-w38-3',
    title: 'Tutorial Pratico: Costruire un Agente n8n per Smistamento Email & Preventivi',
    category: 'Tutorial',
    duration: '16:30',
    date: '18/09/2026',
    videoUrl: 'https://aiutiamoci.cloud/videos/lesson_18_full_production.mp4',
    description: 'Guida operativa: collegare un Webhook n8n ad un modello AI per leggere email in arrivo, estrarre i dati e compilare una bozza di preventivo.',
  },
  {
    id: 'bonus-v-1',
    title: 'DeepSeek R1 & Modelli Open Source: Come Cambia il Prompting Aziendale',
    category: 'Approfondimento',
    duration: '14:20',
    date: '10/09/2026',
    videoUrl: 'https://aiutiamoci.cloud/videos/lesson_01_full_production.mp4',
    description: 'Analisi dei modelli a basso costo per l\'infrastruttura locale e integrazione con la privacy dei dati.',
  },
  {
    id: 'bonus-v-2',
    title: 'Tutorial Pratico: Ricerca di Mercato e Analisi Competitor con Perplexity',
    category: 'Tool AI',
    duration: '18:45',
    date: '08/09/2026',
    videoUrl: 'https://aiutiamoci.cloud/videos/lesson_05_full_production.mp4',
    description: 'Guida passo-passo per impostare ricerche con citazione fonti e sintetizzare dossier aziendali in 5 minuti.',
  }
]


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

// Mappatura precisa dei 20 Moduli Video del Corso AI Start con gli URL MP4 Full HD 60fps serviti da VPS e dispense PDF locali ufficiali
const AI_START_LESSONS: Lesson[] = [
  { id: 1, title: '1 Benvenuti nel Futuro', duration: '10:18', completed: false, videoUrl: 'https://aiutiamoci.cloud/videos/lesson_01_full_production.mp4?v=20260923_master_v3', resourcesPdfUrl: '/dispense/DISPENSA_STUDENTE_MODULO_01.pdf' },
  { id: 2, title: '2 Breve Storia dell\'Evoluzione', duration: '10:31', completed: false, videoUrl: 'https://aiutiamoci.cloud/videos/lesson_02_full_production.mp4?v=20260923_master_v3', resourcesPdfUrl: '/dispense/DISPENSA_STUDENTE_MODULO_02.pdf' },
  { id: 3, title: '3 Sconfiggere il Foglio Bianco', duration: '08:59', completed: false, videoUrl: 'https://aiutiamoci.cloud/videos/lesson_03_full_production.mp4?v=20260923_master_v3', resourcesPdfUrl: '/dispense/DISPENSA_STUDENTE_MODULO_03.pdf' },
  { id: 4, title: '4 Il Linguaggio della Chiarezza', duration: '08:40', completed: false, videoUrl: 'https://aiutiamoci.cloud/videos/lesson_04_full_production.mp4?v=20260923_master_v3', resourcesPdfUrl: '/dispense/DISPENSA_STUDENTE_MODULO_04.pdf' },
  { id: 5, title: '5 La Formula Segreta RCCF', duration: '10:09', completed: false, videoUrl: 'https://aiutiamoci.cloud/videos/lesson_05_full_production.mp4?v=20260923_master_v3', resourcesPdfUrl: '/dispense/DISPENSA_STUDENTE_MODULO_05.pdf' },
  { id: 6, title: '6 Iterazione', duration: '08:15', completed: false, videoUrl: 'https://aiutiamoci.cloud/videos/lesson_06_full_production.mp4?v=20260923_master_v3', resourcesPdfUrl: '/dispense/DISPENSA_STUDENTE_MODULO_06.pdf' },
  { id: 7, title: '7 ChatGPT, Claude, Gemini, Perplexity', duration: '09:45', completed: false, videoUrl: 'https://aiutiamoci.cloud/videos/lesson_07_full_production.mp4?v=20260923_master_v3', resourcesPdfUrl: '/dispense/DISPENSA_STUDENTE_MODULO_07.pdf' },
  { id: 8, title: '8 Scrivere senza Sforzo', duration: '08:41', completed: false, videoUrl: 'https://aiutiamoci.cloud/videos/lesson_08_full_production.mp4?v=20260923_master_v3', resourcesPdfUrl: '/dispense/DISPENSA_STUDENTE_MODULO_08.pdf' },
  { id: 9, title: '9 Dipingere con le Parole', duration: '11:08', completed: false, videoUrl: 'https://aiutiamoci.cloud/videos/lesson_09_full_production.mp4?v=20260923_master_v3', resourcesPdfUrl: '/dispense/DISPENSA_STUDENTE_MODULO_09.pdf' },
  { id: 10, title: '10 Anatomia di un Prompt Visivo', duration: '09:52', completed: false, videoUrl: 'https://aiutiamoci.cloud/videos/lesson_10_full_production.mp4?v=20260923_master_v3', resourcesPdfUrl: '/dispense/DISPENSA_STUDENTE_MODULO_10.pdf' },
  { id: 11, title: '11 Presentazioni in 5 Minuti', duration: '09:08', completed: false, videoUrl: 'https://aiutiamoci.cloud/videos/lesson_11_full_production.mp4?v=20260923_master_v3', resourcesPdfUrl: '/dispense/DISPENSA_STUDENTE_MODULO_11.pdf' },
  { id: 12, title: '12 Analisi Dati per Excel', duration: '09:37', completed: false, videoUrl: 'https://aiutiamoci.cloud/videos/lesson_12_full_production.mp4?v=20260923_master_v3', resourcesPdfUrl: '/dispense/DISPENSA_STUDENTE_MODULO_12.pdf' },
  { id: 13, title: '13 L\'Agenda Intelligente', duration: '10:39', completed: false, videoUrl: 'https://aiutiamoci.cloud/videos/lesson_13_full_production.mp4?v=20260923_master_v3', resourcesPdfUrl: '/dispense/DISPENSA_STUDENTE_MODULO_13.pdf' },
  { id: 14, title: '14 Studiare e Imparare ELI5', duration: '09:11', completed: false, videoUrl: 'https://aiutiamoci.cloud/videos/lesson_14_full_production.mp4?v=20260923_master_v3', resourcesPdfUrl: '/dispense/DISPENSA_STUDENTE_MODULO_14.pdf' },
  { id: 15, title: '15 Allucinazioni: Quando l\'IA mente', duration: '08:41', completed: false, videoUrl: 'https://aiutiamoci.cloud/videos/lesson_15_full_production.mp4?v=20260923_master_v3', resourcesPdfUrl: '/dispense/DISPENSA_STUDENTE_MODULO_15.pdf' },
  { id: 16, title: '16 Privacy e Sicurezza', duration: '09:41', completed: false, videoUrl: 'https://aiutiamoci.cloud/videos/lesson_16_full_production.mp4?v=20260923_master_v3', resourcesPdfUrl: '/dispense/DISPENSA_STUDENTE_MODULO_16.pdf' },
  { id: 17, title: '17 Il Lavoro che Cambia', duration: '09:39', completed: false, videoUrl: 'https://aiutiamoci.cloud/videos/lesson_17_full_production.mp4?v=20260923_master_v3', resourcesPdfUrl: '/dispense/DISPENSA_STUDENTE_MODULO_17.pdf' },
  { id: 18, title: '18 Creare il proprio Workflow', duration: '09:41', completed: false, videoUrl: 'https://aiutiamoci.cloud/videos/lesson_18_full_production.mp4?v=20260923_master_v3', resourcesPdfUrl: '/dispense/DISPENSA_STUDENTE_MODULO_18.pdf' },
  { id: 19, title: '19 La Tua Nuova Superpotenza', duration: '09:05', completed: false, videoUrl: 'https://aiutiamoci.cloud/videos/lesson_19_full_production.mp4?v=20260923_master_v3', resourcesPdfUrl: '/dispense/DISPENSA_STUDENTE_MODULO_19.pdf' },
  { id: 20, title: '20 Riepilogo Corso AI', duration: '10:08', completed: false, videoUrl: 'https://aiutiamoci.cloud/videos/lesson_20_full_production.mp4?v=20260923_master_v3', resourcesPdfUrl: '/dispense/DISPENSA_STUDENTE_MODULO_20.pdf' },
]


// 20 Moduli Completi del Secondo Corso: AI Pro (Automazioni & Agenti Autonomi)
const AI_PRO_LESSONS: Lesson[] = [
  { id: 1, title: '1. Da Cartella Vuota al Primo Agente (Google Antigravity)', duration: '15:00', completed: false, videoUrl: '', resourcesPdfUrl: '/dispense/DISPENSA_STUDENTE_MODULO_01.pdf' },
  { id: 2, title: '2. La Costituzione dell\'Agente: Regole, Memoria e AGENTS.md', duration: '14:30', completed: false, videoUrl: '', resourcesPdfUrl: '/dispense/DISPENSA_STUDENTE_MODULO_02.pdf' },
  { id: 3, title: '3. Come Pensa un Agente: Thinking, File ed Error-Correction', duration: '16:00', completed: false, videoUrl: '', resourcesPdfUrl: '/dispense/DISPENSA_STUDENTE_MODULO_03.pdf' },
  { id: 4, title: '4. Compiti Autonomi & Tool Isolati: Esecuzione Sicura', duration: '12:00', completed: false, videoUrl: '', resourcesPdfUrl: '/dispense/DISPENSA_STUDENTE_MODULO_04.pdf' },
  { id: 5, title: '5. Cosa sono le API: Il Cameriere Digitale & Chat vs Backend', duration: '15:00', completed: false, videoUrl: '', resourcesPdfUrl: '/dispense/DISPENSA_STUDENTE_MODULO_05.pdf' },
  { id: 6, title: '6. Google AI Studio: Generare la Prima Chiave Gratuita (Gemini 2.5 Flash)', duration: '18:00', completed: false, videoUrl: '', resourcesPdfUrl: '/dispense/DISPENSA_STUDENTE_MODULO_06.pdf' },
  { id: 7, title: '7. OpenAI Platform: Limiti di Spesa (5€ Cap), Modelli & Playground', duration: '17:30', completed: false, videoUrl: '', resourcesPdfUrl: '/dispense/DISPENSA_STUDENTE_MODULO_07.pdf' },
  { id: 8, title: '8. JSON & Risposte Strutturate: Costringere l\'AI a non Divagare', duration: '16:15', completed: false, videoUrl: '', resourcesPdfUrl: '/dispense/DISPENSA_STUDENTE_MODULO_08.pdf' },
  { id: 9, title: '9. Benvenuti in n8n: L\'Interfaccia Visuale, Trigger & Nodi', duration: '20:00', completed: false, videoUrl: '', resourcesPdfUrl: '/dispense/DISPENSA_STUDENTE_MODULO_09.pdf' },
  { id: 10, title: '10. Il Primo Webhook: Ricevere Dati in Tempo Reale', duration: '15:00', completed: false, videoUrl: '', resourcesPdfUrl: '/dispense/DISPENSA_STUDENTE_MODULO_10.pdf' },
  { id: 11, title: '11. Collegare l\'AI al Webhook: Elaborazione Dati Automatica', duration: '22:00', completed: false, videoUrl: '', resourcesPdfUrl: '/dispense/DISPENSA_STUDENTE_MODULO_11.pdf' },
  { id: 12, title: '12. Fogli di Calcolo Automatici: Google Sheets & Excel senza Codice', duration: '19:30', completed: false, videoUrl: '', resourcesPdfUrl: '/dispense/DISPENSA_STUDENTE_MODULO_12.pdf' },
  { id: 13, title: '13. Smistatore Email Intelligente: Triage della Posta & Filtro Lead', duration: '24:00', completed: false, videoUrl: '', resourcesPdfUrl: '/dispense/DISPENSA_STUDENTE_MODULO_13.pdf' },
  { id: 14, title: '14. L\'Assistente Preventivi: Dal Listino Prezzi alla Proposta PDF', duration: '26:00', completed: false, videoUrl: '', resourcesPdfUrl: '/dispense/DISPENSA_STUDENTE_MODULO_14.pdf' },
  { id: 15, title: '15. RAG Aziendale (Parte 1): Caricare Cataloghi, Manuali e Procedure', duration: '21:00', completed: false, videoUrl: '', resourcesPdfUrl: '/dispense/DISPENSA_STUDENTE_MODULO_15.pdf' },
  { id: 16, title: '16. RAG Aziendale (Parte 2): Interrogazione PDF con Fonti e Citazioni', duration: '23:30', completed: false, videoUrl: '', resourcesPdfUrl: '/dispense/DISPENSA_STUDENTE_MODULO_16.pdf' },
  { id: 17, title: '17. Human-in-the-Loop su Telegram: Approvazione Preventivi con Tasti OK/NO', duration: '25:00', completed: false, videoUrl: '', resourcesPdfUrl: '/dispense/DISPENSA_STUDENTE_MODULO_17.pdf' },
  { id: 18, title: '18. Trascrizione Audio & Verbali di Riunione da Vocali WhatsApp', duration: '18:45', completed: false, videoUrl: '', resourcesPdfUrl: '/dispense/DISPENSA_STUDENTE_MODULO_18.pdf' },
  { id: 19, title: '19. Sicurezza, Privacy Dati Aziendali & Gestione Errori (Fallback)', duration: '17:00', completed: false, videoUrl: '', resourcesPdfUrl: '/dispense/DISPENSA_STUDENTE_MODULO_19.pdf' },
  { id: 20, title: '20. Deploy h24, Manutenzione Workflow & Certificazione AI Pro', duration: '30:00', completed: false, videoUrl: '', resourcesPdfUrl: '/dispense/DISPENSA_STUDENTE_MODULO_20.pdf' },
]

function generateCertificateDataUrl(studentName: string, dateStr: string, certCode: string, courseTitleStr?: string): string {
  if (typeof document === 'undefined') return ''
  const canvas = document.createElement('canvas')
  canvas.width = 1920
  canvas.height = 1080
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''

  const isPro = certCode.includes('PRO') || (courseTitleStr && courseTitleStr.includes('Pro'))

  // Background - Dark luxury slate navy gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 1920, 1080)
  bgGrad.addColorStop(0, '#090d16')
  bgGrad.addColorStop(0.5, isPro ? '#1e1035' : '#0f172a')
  bgGrad.addColorStop(1, isPro ? '#3b0764' : '#1e1b4b')
  ctx.fillStyle = bgGrad
  ctx.fillRect(0, 0, 1920, 1080)

  // Outer Gold Border
  ctx.strokeStyle = '#eab308'
  ctx.lineWidth = 14
  ctx.strokeRect(40, 40, 1840, 1000)

  // Inner Subtle Gold Border
  ctx.strokeStyle = 'rgba(234, 179, 8, 0.4)'
  ctx.lineWidth = 4
  ctx.strokeRect(60, 60, 1800, 960)

  // Header Institution
  ctx.fillStyle = '#94a3b8'
  ctx.font = 'bold 24px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('AIUTIAMOCI • PIATTAFORMA DI FORMAZIONE DIGITALE (AIUTIAMOCI.CLOUD)', 960, 140)

  // Certificate Title
  ctx.fillStyle = '#f8fafc'
  ctx.font = 'bold 50px serif'
  ctx.fillText('ATTESTATO DI ECCELLENZA E COMPLETAMENTO', 960, 240)

  // Subtitle
  ctx.fillStyle = '#ca8a04'
  ctx.font = 'italic 26px serif'
  ctx.fillText('Si certifica con onore che il corsista', 960, 320)

  // Student Name
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 60px sans-serif'
  ctx.fillText(studentName.toUpperCase(), 960, 420)

  // Underline for name
  const nameWidth = ctx.measureText(studentName.toUpperCase()).width
  ctx.strokeStyle = '#eab308'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(960 - Math.max(300, nameWidth / 2 + 40), 450)
  ctx.lineTo(960 + Math.max(300, nameWidth / 2 + 40), 450)
  ctx.stroke()

  // Achievement Description
  ctx.fillStyle = '#cbd5e1'
  ctx.font = '24px sans-serif'
  ctx.fillText(isPro ? 'ha completato con successo l’intero percorso avanzato di 20 Ore Certificate:' : 'ha completato con successo l’intero percorso formativo di 16 Ore Certificate (20 Moduli + Live):', 960, 530)

  // Course Name
  ctx.fillStyle = isPro ? '#c084fc' : '#60a5fa'
  ctx.font = 'bold 36px sans-serif'
  ctx.fillText(isPro ? 'AI PRO — AUTOMAZIONI AVANZATE & AGENTI INTELLIGENTI' : 'AI START — DOMINA L’INTELLIGENZA ARTIFICIALE DA ZERO', 960, 600)

  ctx.fillStyle = '#94a3b8'
  ctx.font = '20px sans-serif'
  ctx.fillText(isPro ? 'Integrazione API • Agenti Autonomi • Automazione Processi Aziendali' : 'Prompt Engineering Avanzato • Flussi Operativi • Automazioni & Sicurezza Dati', 960, 650)

  // Seal / Badge
  ctx.fillStyle = 'rgba(234, 179, 8, 0.15)'
  ctx.beginPath()
  ctx.arc(960, 790, 70, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#eab308'
  ctx.lineWidth = 4
  ctx.stroke()

  ctx.fillStyle = '#eab308'
  ctx.font = 'bold 18px sans-serif'
  ctx.fillText('VERIFIED', 960, 785)
  ctx.font = 'bold 13px sans-serif'
  ctx.fillText('AIUTIAMOCI OFFICIAL', 960, 808)

  // Left Footer: Date
  ctx.textAlign = 'left'
  ctx.fillStyle = '#94a3b8'
  ctx.font = '18px sans-serif'
  ctx.fillText(`Data di Rilascio: ${dateStr}`, 140, 940)
  ctx.fillText(`Piattaforma: aiutiamoci.cloud`, 140, 970)

  // Right Footer: Certificate ID & Signature
  ctx.textAlign = 'right'
  ctx.fillStyle = '#94a3b8'
  ctx.font = '18px sans-serif'
  ctx.fillText(`Certificato ID: ${certCode}`, 1780, 940)
  ctx.fillStyle = '#eab308'
  ctx.font = 'bold 18px serif'
  ctx.fillText('Direzione Didattica & Formazione AI', 1780, 970)

  return canvas.toDataURL('image/png')
}


function CorsiInnerContent() {
  const searchParams = useSearchParams()
  const supabase = createClient()

  // Selettore Corso Attivo (AI Start vs AI Pro)
  const [selectedCourseId, setSelectedCourseId] = useState<'ai-start' | 'ai-pro'>('ai-start')

  // Lezioni attive AI Start (Corso Base)
  const [lessons, setLessons] = useState<Lesson[]>(AI_START_LESSONS)
  const [activeLesson, setActiveLesson] = useState<Lesson>(lessons[0])

  // Lezioni attive AI Pro (Corso Avanzato)
  const [lessonsPro, setLessonsPro] = useState<Lesson[]>(AI_PRO_LESSONS)
  const [activeLessonPro, setActiveLessonPro] = useState<Lesson>(lessonsPro[0])


  // Registrazioni Zoom Live
  const [zoomRecordings, setZoomRecordings] = useState<ZoomRecording[]>(REAL_ZOOM_RECORDINGS)
  const [activeZoomVideo, setActiveZoomVideo] = useState<ZoomRecording | null>(null)
  const [isAddZoomModalOpen, setIsAddZoomModalOpen] = useState(false)

  // Video Bonus, News & Tutorial
  const [bonusVideos, setBonusVideos] = useState<BonusVideoItem[]>(INITIAL_BONUS_VIDEOS)
  const [activeBonusVideo, setActiveBonusVideo] = useState<BonusVideoItem | null>(null)
  const [isAddBonusVideoModalOpen, setIsAddBonusVideoModalOpen] = useState(false)
  const [bonusTitleInput, setBonusTitleInput] = useState('')
  const [bonusCategoryInput, setBonusCategoryInput] = useState<'News' | 'Tutorial' | 'Approfondimento' | 'Tool AI'>('News')
  const [bonusUrlInput, setBonusUrlInput] = useState('')
  const [bonusDurationInput, setBonusDurationInput] = useState('15:00')
  const [bonusDescInput, setBonusDescInput] = useState('')
  const [bonusDateInput, setBonusDateInput] = useState('')
  const [bonusResUrlInput, setBonusResUrlInput] = useState('')

  // Risorse Bonus, PDF & Manuali Caricati
  const [resources, setResources] = useState<CourseResource[]>([])
  const [selectedGuide, setSelectedGuide] = useState<PracticalGuide | null>(null)
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
  const { theme, setTheme } = useTheme()
  const [studentCodeInput, setStudentCodeInput] = useState('')
  const [activeStudent, setActiveStudent] = useState<{ name: string; code: string; accessTier?: 'ai-start' | 'ai-pro' | 'both'; sessionToken?: string } | null>(null)
  const [isTeamMember, setIsTeamMember] = useState<boolean>(false)
  const [isHelpModalOpen, setIsHelpModalOpen] = useState<boolean>(false)
  const [authChecked, setAuthChecked] = useState<boolean>(false)

  // Subtab Registro: 'registrations' | 'active' | 'pro_students' | 'waitlist'
  const [studentSubTab, setStudentSubTab] = useState<'registrations' | 'active' | 'pro_students' | 'waitlist'>('registrations')
  const [courseRegistrations, setCourseRegistrations] = useState<CourseRegistration[]>([])
  const [loadingRegistrations, setLoadingRegistrations] = useState<boolean>(false)
  const [copiedEmailKey, setCopiedEmailKey] = useState<string | null>(null)
  const [isApprovingId, setIsApprovingId] = useState<string | null>(null)
  const [regSearchQuery, setRegSearchQuery] = useState<string>('')
  const [regStatusFilter, setRegStatusFilter] = useState<'all' | 'pending' | 'approved'>('all')
  const [waitlistLeads, setWaitlistLeads] = useState<WaitlistLead[]>([])
  const [isConvertingLeadId, setIsConvertingLeadId] = useState<string | null>(null)


  // Controllo Accessi Granulare
  const hasCourseAccess = (courseId: 'ai-start' | 'ai-pro') => {
    if (isTeamMember) return true // Admin / Team ha sempre accesso
    if (!activeStudent) return false // Studente senza codice non ha accesso
    const tier = activeStudent.accessTier || (activeStudent.code.startsWith('AI-PRO-') ? 'ai-pro' : activeStudent.code.startsWith('AI-ALL-') ? 'both' : 'ai-start')
    if (tier === 'both') return true
    return tier === courseId
  }

  const hasAccessToCurrentCourse = () => hasCourseAccess(selectedCourseId)

  const [codeError, setCodeError] = useState('')

  // Registrazioni Studenti (Codici Attivi nel Database)
  const [registrations, setRegistrations] = useState<StudentRegistration[]>([])
  const [activeTierFilter, setActiveTierFilter] = useState<'all' | 'ai-start' | 'ai-pro' | 'both'>('all')
  const [activeSearchQuery, setActiveSearchQuery] = useState('')


  // Chat Studenti con Assistente @AI
  const [chatMessages, setChatMessages] = useState<Array<{ id: string; sender: string; isAi: boolean; text: string; time: string }>>([
    {
      id: 'welcome-tutor',
      sender: 'Assistente @AI aiutiamoci',
      isAi: true,
      text: 'Ciao! Benvenuto nel percorso formativo. Durante la visione delle lezioni puoi chiedermi chiarimenti sui concetti, consigli sui prompt o spiegazioni pratiche. Come posso aiutarti?',
      time: 'Oggi',
    },
  ])
  const [chatInput, setChatInput] = useState('')
  const [isAiThinking, setIsAiThinking] = useState(false)

  const [activeTab, setActiveTab] = useState<'player' | 'news-tutorial' | 'zoom' | 'bonus' | 'tasks' | 'students' | 'login'>('player')

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

      const savedBonusVideos = localStorage.getItem('ti_aiuto_bonus_videos')
      if (savedBonusVideos !== null) {
        const parsed = JSON.parse(savedBonusVideos)
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Unione: mantieni i video di default freschi e aggiungi eventuali video custom dell'utente
          const merged = [...INITIAL_BONUS_VIDEOS]
          parsed.forEach((customItem: any) => {
            if (!merged.some((m) => m.id === customItem.id)) {
              merged.push(customItem)
            }
          })
          setBonusVideos(merged)
        } else {
          setBonusVideos(INITIAL_BONUS_VIDEOS)
        }
      } else {
        setBonusVideos(INITIAL_BONUS_VIDEOS)
      }


      // Lettura preventiva stato test checkpoint salvati
      let isEntryTestPassed = false
      try {
        const savedTestsRaw = localStorage.getItem('ti_aiuto_checkpoint_tests')
        if (savedTestsRaw) {
          const parsedTests = JSON.parse(savedTestsRaw)
          if (parsedTests && parsedTests.entry) isEntryTestPassed = true
        }
      } catch (e) {}

      const savedLessons = localStorage.getItem('ti_aiuto_lessons_custom')
      if (savedLessons !== null) {
        try {
          const parsed = JSON.parse(savedLessons)
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Abbina lo stato di completamento dell'utente ma sanifica la vecchia anomalia delle prime 2 lezioni
            const updated = AI_START_LESSONS.map((official) => {
              const saved = parsed.find((s: any) => s.id === official.id)
              let isCompleted = saved ? !!saved.completed : official.completed
              // Se il test d'ingresso non è mai stato superato, il modulo 2 e superiori NON possono essere completati
              if (official.id >= 2 && !isEntryTestPassed) {
                isCompleted = false
              }
              // Se l'utente non ha superato il test d'ingresso e il modulo 1 risultava completed, verifica se è anomalia
              return {
                ...official,
                completed: isCompleted
              }
            })
            setLessons(updated)
            setActiveLesson((prev) => updated.find((l: any) => l.id === prev.id) || updated[0])
            localStorage.setItem('ti_aiuto_lessons_custom', JSON.stringify(updated))
          } else {
            setLessons(AI_START_LESSONS)
            setActiveLesson(AI_START_LESSONS[0])
          }
        } catch (e) {
          setLessons(AI_START_LESSONS)
          setActiveLesson(AI_START_LESSONS[0])
        }
      } else {
        setLessons(AI_START_LESSONS)
        setActiveLesson(AI_START_LESSONS[0])
      }

      const savedLessonsPro = localStorage.getItem('ti_aiuto_lessons_custom_pro')
      if (savedLessonsPro !== null) {
        try {
          const parsedPro = JSON.parse(savedLessonsPro)
          if (Array.isArray(parsedPro) && parsedPro.length > 0) {
            const updatedPro = AI_PRO_LESSONS.map((official) => {
              const saved = parsedPro.find((s: any) => s.id === official.id)
              return {
                ...official,
                completed: saved ? !!saved.completed : official.completed
              }
            })
            setLessonsPro(updatedPro)
            setActiveLessonPro((prev) => updatedPro.find((l: any) => l.id === prev.id) || updatedPro[0])
          }
        } catch (e) {}
      }

      const savedStudent = localStorage.getItem('ti_aiuto_active_student')
      if (savedStudent) {
        const parsedStudent = JSON.parse(savedStudent)
        if (parsedStudent && parsedStudent.code) {
          setActiveStudent(parsedStudent)
          if (parsedStudent.accessTier === 'ai-pro') {
            setSelectedCourseId('ai-pro')
          }
          // Allineamento stato studente all'avvio
          if (parsedStudent.sessionToken) {
            validateStudentActiveSessionAction(parsedStudent.code, parsedStudent.sessionToken).then((check) => {
              if (check && !check.valid && check.reason && check.reason.includes('disattivato')) {
                alert(`⚠️ ${check.reason}`)
                setActiveStudent(null)
                localStorage.removeItem('ti_aiuto_active_student')
              }
            }).catch(() => {})
          }
        }
      }

      // Mostra guida/istruzioni se prima visita dello studente o all'accesso
      const hasSeenHelp = localStorage.getItem('ti_aiuto_has_seen_help_guide_v1')
      if (!hasSeenHelp) {
        setIsHelpModalOpen(true)
      }
    } catch (e) {
      console.error('Errore lettura da localStorage:', e)
      setLessons(AI_START_LESSONS)
      setActiveLesson(AI_START_LESSONS[0])
    }
  }, [])

  // Aggiornamento heartbeat periodico non bloccante per mantenere attiva la presenza
  useEffect(() => {
    if (!activeStudent?.code || !activeStudent?.sessionToken) return

    const interval = setInterval(async () => {
      try {
        const check = await validateStudentActiveSessionAction(activeStudent.code, activeStudent.sessionToken!)
        if (check && !check.valid && check.reason && check.reason.includes('disattivato')) {
          alert(`⚠️ ${check.reason}`)
          setActiveStudent(null)
          localStorage.removeItem('ti_aiuto_active_student')
        }
      } catch (err) {
        // Ignora silenziosamente errori di connessione o cambi rete
      }
    }, 180000) // Heartbeat ogni 3 minuti senza disconnessioni aggressive

    return () => clearInterval(interval)
  }, [activeStudent?.code, activeStudent?.sessionToken])

  // Verifica autenticazione e caricamento dati riservati solo se membro del team (in dev abilitato per preview IDE)
  useEffect(() => {
    const checkTeamAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        const isTeam = !!user || process.env.NODE_ENV !== 'production'
        setIsTeamMember(isTeam)
        setAuthChecked(true)

        if (isTeam) {
          loadCourseRegistrations()
          loadStudentCodes()
          loadWaitlistLeads()
        }
      } catch (err) {
        console.error('Errore verifica autenticazione team:', err)
        setAuthChecked(true)
      }
    }

    checkTeamAuth()
  }, [])

  // Realtime solo per membri del team autenticati
  useEffect(() => {
    if (!isTeamMember) return

    const channel = supabase
      .channel('public:courses_live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'course_registrations' }, () => {
        loadCourseRegistrations()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'student_codes' }, () => {
        loadStudentCodes()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [isTeamMember])

  useEffect(() => {
    if (activeTab === 'students' && isTeamMember) {
      loadCourseRegistrations()
      loadStudentCodes()
      loadWaitlistLeads()
    }
  }, [activeTab, isTeamMember])

  const loadStudentCodes = async () => {
    const res = await getStudentCodesAction()
    if (res.success && res.studentCodes) {
      const formatted: StudentRegistration[] = res.studentCodes.map((sc: any) => ({
        id: sc.id,
        code: sc.code,
        studentName: sc.student_name,
        studentEmail: sc.student_email,
        courseTitle: sc.course_title,
        accessTier: sc.access_tier,
        registeredAt: sc.created_at,
        status: 'enrolled',
      }))
      setRegistrations(formatted)
    }
  }

  const loadCourseRegistrations = async () => {
    setLoadingRegistrations(true)
    const res = await getCourseRegistrationsAction()
    if (res.success && res.registrations) {
      setCourseRegistrations(res.registrations)
    }
    setLoadingRegistrations(false)
  }

  const handleApproveRegistration = async (reg: CourseRegistration, targetTier: 'ai-start' | 'ai-pro' | 'both' = 'ai-start') => {
    setIsApprovingId(reg.id)
    const res = await approveCourseRegistrationAction(reg.id, targetTier)
    if (res.success && res.code) {
      playNotificationSound('chat')
      const tierName = targetTier === 'ai-pro' ? 'AI Pro (Corso Avanzato)' : targetTier === 'both' ? 'Bundle Completo (Start + Pro)' : 'AI Start'
      alert(`🎉 Registrazione per ${reg.name} APPROVATA per ${tierName}!\nCodice generato: ${res.code}\nEmail con istruzioni inviata a ${reg.email}.`)
      await loadCourseRegistrations()
      await loadStudentCodes()
    } else {
      alert(`Errore approvazione: ${res.error}`)
    }
    setIsApprovingId(null)
  }

  const handleUpgradeStudent = async (student: StudentRegistration, targetTier: 'ai-pro' | 'both') => {
    const tierName = targetTier === 'both' ? 'Bundle Completo (Start + Pro)' : 'AI Pro (Avanzato)'
    if (!confirm(`Vuoi abilitare ${student.studentName} all'accesso ${tierName}? Verrà inviata una notifica automatica via email.`)) return

    const res = await upgradeStudentTierAction(student.id, targetTier)
    if (res.success) {
      playNotificationSound('chat')
      alert(`🚀 Upgrade completato per ${student.studentName}!\nNuovo livello: ${tierName}.\nEmail di notifica inviata con successo a ${student.studentEmail}.`)
      await loadStudentCodes()
    } else {
      alert(`Errore upgrade: ${res.error}`)
    }
  }

  const handleDeleteRegistration = async (id: string, name: string) => {
    if (!confirm(`Sei sicuro di voler eliminare la richiesta di registrazione per ${name}?`)) return
    const res = await deleteCourseRegistrationAction(id)
    if (res.success) {
      setCourseRegistrations((prev) => prev.filter((r) => r.id !== id))
    } else {
      alert(`Errore eliminazione: ${res.error}`)
    }
  }

  const copyEmailToClipboard = (email: string, key: string) => {
    navigator.clipboard.writeText(email)
    setCopiedEmailKey(key)
    setTimeout(() => setCopiedEmailKey(null), 2000)
  }

  const loadWaitlistLeads = async () => {
    const res = await getWaitlistLeadsAction()
    if (res.success && res.leads) {
      setWaitlistLeads((res.leads ?? []).map((l) => ({ ...l, name: l.name ?? undefined })))
    }
  }

  const handleConvertLead = async (lead: WaitlistLead) => {
    setIsConvertingLeadId(lead.id)
    const res = await convertWaitlistLeadAction(lead.id, lead.email, lead.name)
    if (res.success && res.code) {
      alert(`Successo! Lead ${lead.email} convertito in studente AI Pro con codice: ${res.code} ed email inviata!`)
      loadWaitlistLeads()
      const newReg: StudentRegistration = {
        id: `reg-lead-${Date.now()}`,
        code: res.code,
        studentName: lead.name || lead.email.split('@')[0],
        studentEmail: lead.email,
        courseTitle: 'AI Pro - Automazioni & Agenti AI',
        accessTier: 'ai-pro',
        registeredAt: new Date().toISOString(),
        status: 'enrolled',
      }
      setRegistrations((prev) => [newReg, ...prev])
    } else {
      alert(`Errore conversione lead: ${res.error}`)
    }
    setIsConvertingLeadId(null)
  }




  // Modal Nuova Iscrizione Studente
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false)
  const [enrollAccessTier, setEnrollAccessTier] = useState<'ai-start' | 'ai-pro' | 'both'>('ai-start')
  const [studentName, setStudentName] = useState('')
  const [studentEmail, setStudentEmail] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)

  // State Attestato di Completamento
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false)
  const [certificateStudentName, setCertificateStudentName] = useState('')
  const [certificateCode, setCertificateCode] = useState('')
  const [certificateDataUrl, setCertificateDataUrl] = useState('')

  const handleOpenCertificate = (name?: string, code?: string) => {
    const student = name || activeStudent?.name || 'Marco (Corsista)'
    const certCode = code || activeStudent?.code || `CERT-${selectedCourseId === 'ai-pro' ? 'PRO' : 'AI'}-${Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase()}`
    const dateStr = new Date().toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })

    setCertificateStudentName(student)
    setCertificateCode(certCode)
    const dataUrl = generateCertificateDataUrl(student, dateStr, certCode, selectedCourseId === 'ai-pro' ? 'AI Pro' : 'AI Start')
    setCertificateDataUrl(dataUrl)
    setIsCertificateModalOpen(true)
  }

  const handleDownloadCertificate = () => {
    if (!certificateDataUrl) return
    const a = document.createElement('a')
    a.href = certificateDataUrl
    a.download = `Attestato_${selectedCourseId === 'ai-pro' ? 'AI_Pro' : 'AI_Start'}_${certificateStudentName.replace(/\s+/g, '_')}.png`
    a.click()
  }

  const handleShareLinkedIn = () => {
    const courseName = selectedCourseId === 'ai-pro' ? 'AI Pro: Automazioni Avanzate & Agenti Intelligenti' : 'AI Start: Domina l\'Intelligenza Artificiale da Zero'
    const shareText = encodeURIComponent(`🎉 Ho completato con successo l'intero percorso formativo "${courseName}" su aiutiamoci.cloud! 🚀\n\nAttestato Ufficiale Verificato: ${certificateCode}`)
    const url = encodeURIComponent('https://aiutiamoci.cloud')
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}&summary=${shareText}`, '_blank')
  }

  // State Quiz @AI di Modulo
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false)
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false)
  const [currentQuizQuestions, setCurrentQuizQuestions] = useState<QuizQuestion[]>([])
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({})
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [quizTargetLesson, setQuizTargetLesson] = useState<Lesson>(lessons[0])

  // Tracciamento visione video obbligatoria (Solo studenti)
  const [videoMaxTimeWatched, setVideoMaxTimeWatched] = useState<number>(0)
  const [videoCanComplete, setVideoCanComplete] = useState<boolean>(false)

  // State 3 Test Checkpoint Obbligatori (AI Start) & 4 Test Checkpoint (AI Pro)
  const [activeCheckpointTest, setActiveCheckpointTest] = useState<CheckpointTest | null>(null)
  const [isCheckpointModalOpen, setIsCheckpointModalOpen] = useState(false)
  const [checkpointAnswers, setCheckpointAnswers] = useState<Record<number, number>>({})
  const [checkpointSubmitted, setCheckpointSubmitted] = useState(false)
  const [passedTests, setPassedTests] = useState<Record<'entry' | 'midterm' | 'final', boolean>>({
    entry: false,
    midterm: false,
    final: false,
  })
  const [passedTestsPro, setPassedTestsPro] = useState<Record<'pro_chk1' | 'pro_chk2' | 'pro_chk3' | 'pro_final', boolean>>({
    pro_chk1: false,
    pro_chk2: false,
    pro_chk3: false,
    pro_final: false,
  })

  // Caricamento test superati da localStorage
  useEffect(() => {
    try {
      const savedTests = localStorage.getItem('ti_aiuto_checkpoint_tests')
      if (savedTests) {
        setPassedTests(JSON.parse(savedTests))
      }
      const savedTestsPro = localStorage.getItem('ti_aiuto_checkpoint_tests_pro')
      if (savedTestsPro) {
        setPassedTestsPro(JSON.parse(savedTestsPro))
      }
    } catch (e) {
      console.error('Errore lettura test checkpoint:', e)
    }
  }, [])

  const handleOpenCheckpointTest = (testId: 'entry' | 'midterm' | 'final' | 'pro_chk1' | 'pro_chk2' | 'pro_chk3' | 'pro_final') => {
    // Blocco temporaneo Esame Finale per integrazione con piattaforma Atoma
    if (testId === 'final') {
      alert(
        "🎓 ESAME FINALE & CERTIFICAZIONE UFFICIALE ATOMA\n\n" +
        "Come da accordi formativi, il test finale di valutazione e rilascio dell'Attestato Ufficiale di Certificazione sarà svolto direttamente sulla piattaforma formativa Atoma.\n\n" +
        "Riceverai il link di accesso diretto e le relative credenziali per sostenere la prova e scaricare il certificato riconosciuto."
      )
      return
    }

    const test = (CHECKPOINT_TESTS as any)[testId] || (CHECKPOINT_TESTS_PRO as any)[testId]
    if (!test) return
    setActiveCheckpointTest(test)
    setCheckpointAnswers({})
    setCheckpointSubmitted(false)
    setIsCheckpointModalOpen(true)
  }

  const handleCompleteCheckpointTest = () => {
    if (!activeCheckpointTest) return
    const total = activeCheckpointTest.questions.length
    let correct = 0
    activeCheckpointTest.questions.forEach((q, idx) => {
      if (checkpointAnswers[idx] === q.correctIndex) correct++
    })
    const scorePct = Math.round((correct / total) * 100)
    const passed = scorePct >= activeCheckpointTest.passThresholdPercent

    if (passed) {
      if (activeCheckpointTest.id.toString().startsWith('pro_')) {
        const updated = { ...passedTestsPro, [activeCheckpointTest.id]: true }
        setPassedTestsPro(updated as any)
        try {
          localStorage.setItem('ti_aiuto_checkpoint_tests_pro', JSON.stringify(updated))
        } catch (e) {
          console.error(e)
        }
      } else {
        const updated = { ...passedTests, [activeCheckpointTest.id]: true }
        setPassedTests(updated as any)
        try {
          localStorage.setItem('ti_aiuto_checkpoint_tests', JSON.stringify(updated))
        } catch (e) {
          console.error(e)
        }
        if (activeCheckpointTest.id === 'entry') {
          // Segna il Modulo 1 come completato ufficialmente
          const updatedLessons = lessons.map((l) => (l.id === 1 ? { ...l, completed: true } : l))
          setLessons(updatedLessons)
          try {
            localStorage.setItem('ti_aiuto_lessons_custom', JSON.stringify(updatedLessons))
          } catch (e) {}

          const mod2 = updatedLessons.find((l) => l.id === 2)
          if (mod2) setActiveLesson(mod2)
        } else if (activeCheckpointTest.id === 'midterm') {
          const updatedLessons = lessons.map((l) => (l.id === 10 ? { ...l, completed: true } : l))
          setLessons(updatedLessons)
          try {
            localStorage.setItem('ti_aiuto_lessons_custom', JSON.stringify(updatedLessons))
          } catch (e) {}

          const mod11 = updatedLessons.find((l) => l.id === 11)
          if (mod11) setActiveLesson(mod11)
        }
      }
      playNotificationSound('chat')
    }
    setCheckpointSubmitted(true)
  }

  const handleOpenQuizForLesson = async (lesson: Lesson) => {
    setQuizTargetLesson(lesson)
    setIsQuizModalOpen(true)
    setIsGeneratingQuiz(true)
    setQuizSubmitted(false)
    setQuizAnswers({})

    try {
      const res = await generateLessonQuizAction(lesson.id, lesson.title)
      if (res.success && res.quiz && res.quiz.length > 0) {
        setCurrentQuizQuestions(res.quiz)
      } else {
        setCurrentQuizQuestions([
          {
            question: `Qual è il principio chiave affrontato nella ${lesson.title}?`,
            options: [
              'Applicare il metodo e le strategie operative spiegate nel video',
              'Ignorare le istruzioni e procedere senza un metodo strutturato',
              'Evitare di fare pratica e di testare i prompt',
              'Non impostare mai contesti o ruoli specifici',
            ],
            correctIndex: 0,
            explanation: 'La chiarezza, la struttura e la pratica costante sono le fondamenta per padroneggiare l’IA.',
          },
        ])
      }
    } catch (e) {
      console.error('Errore quiz:', e)
      setCurrentQuizQuestions([
        {
          question: `Qual è il principio chiave affrontato nella ${lesson.title}?`,
          options: [
            'Applicare il metodo e le strategie operative spiegate nel video',
            'Ignorare le istruzioni e procedere senza un metodo strutturato',
            'Evitare di fare pratica e di testare i prompt',
            'Non impostare mai contesti o ruoli specifici',
          ],
          correctIndex: 0,
          explanation: 'La chiarezza, la struttura e la pratica costante sono le fondamenta per padroneggiare l’IA.',
        },
      ])
    } finally {
      setIsGeneratingQuiz(false)
    }
  }

  // State Importatore Massivo Studenti
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false)
  const [bulkInputText, setBulkInputText] = useState('')
  const [bulkAccessTier, setBulkAccessTier] = useState<'ai-start' | 'ai-pro' | 'both'>('ai-start')
  const [bulkSendEmail, setBulkSendEmail] = useState(false)
  const [isBulkImporting, setIsBulkImporting] = useState(false)

  const handleBulkImport = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!bulkInputText.trim() || isBulkImporting) return

    setIsBulkImporting(true)
    const lines = bulkInputText.split('\n').map((l) => l.trim()).filter(Boolean)
    const parsedStudents: Array<{ name: string; email: string }> = []

    for (const line of lines) {
      const parts = line.split(/[,;\t]/).map((p) => p.trim())
      if (parts.length >= 2) {
        parsedStudents.push({ name: parts[0], email: parts[1] })
      } else if (parts.length === 1 && parts[0].includes('@')) {
        parsedStudents.push({ name: parts[0].split('@')[0], email: parts[0] })
      }
    }

    if (parsedStudents.length === 0) {
      alert('Nessun contatto valido trovato. Inserisci righe nel formato: Nome Cognome, email@dominio.it')
      setIsBulkImporting(false)
      return
    }

    const res = await bulkEnrollStudentsAction(parsedStudents, bulkSendEmail, bulkAccessTier)
    if (res.success && res.students) {
      const defaultCourseTitle = bulkAccessTier === 'ai-pro'
        ? 'AI Pro - Automazioni & Agenti AI'
        : bulkAccessTier === 'both'
          ? 'Bundle Completo: AI Start + AI Pro'
          : 'AI Start - Domina l’Intelligenza Artificiale da Zero'

      const newItems: StudentRegistration[] = res.students.map((s, idx) => ({
        id: `reg-bulk-${Date.now()}-${idx}`,
        code: s.code,
        studentName: s.name,
        studentEmail: s.email,
        courseTitle: defaultCourseTitle,
        accessTier: bulkAccessTier,
        registeredAt: new Date().toISOString(),
        status: 'enrolled',
      }))
      setRegistrations([...newItems, ...registrations])
      setIsBulkModalOpen(false)
      setBulkInputText('')
      alert(`Successo! Importati ${res.count} studenti abilitati per ${bulkAccessTier.toUpperCase()} con codici generati su Supabase!`)
    } else {
      alert(`Errore importazione: ${res.error}`)
    }
    setIsBulkImporting(false)
  }

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
    setCodeError('')

    if (cleanCode.startsWith('REF-')) {
      setCodeError('Questo è un link/token di invito referral, non un codice di accesso valido. Per accedere usa il codice univoco personale ricevuto via email.')
      return
    }

    const res = await verifyStudentCodeAction(cleanCode)

    if (res.success && res.student) {
      const dbStudent = res.student
      const rawTier = dbStudent.access_tier
      const tier: 'ai-start' | 'ai-pro' | 'both' =
        rawTier === 'ai-start' || rawTier === 'ai-pro' || rawTier === 'both'
          ? rawTier
          : dbStudent.code.startsWith('AI-PRO-')
            ? 'ai-pro'
            : dbStudent.code.startsWith('AI-ALL-')
              ? 'both'
              : 'ai-start'
      const studentObj = {
        name: dbStudent.student_name,
        code: dbStudent.code,
        accessTier: tier,
        sessionToken: res.sessionToken,
      }
      setActiveStudent(studentObj)
      try {
        localStorage.setItem('ti_aiuto_active_student', JSON.stringify(studentObj))
      } catch (err) {
        console.error('Errore salvataggio sessione studente:', err)
      }
      if (tier === 'ai-pro') {
        setSelectedCourseId('ai-pro')
      } else {
        setSelectedCourseId('ai-start')
      }
      setActiveTab('player')
    } else {
      setCodeError(res.error || 'Codice non valido o non trovato. Controlla il codice ricevuto.')
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

    const defaultTitle = enrollAccessTier === 'ai-pro'
      ? 'AI Pro - Automazioni & Agenti AI'
      : enrollAccessTier === 'both'
        ? 'Bundle Completo: AI Start + AI Pro'
        : 'AI Start - Domina l’Intelligenza Artificiale da Zero'

    // Esegui iscrizione sicura lato server tramite Server Action (supera RLS)
    const result = await enrollStudentAction({
      studentName: studentName.trim(),
      studentEmail: studentEmail.trim(),
      courseTitle: defaultTitle,
      accessTier: enrollAccessTier,
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
      courseTitle: defaultTitle,
      accessTier: enrollAccessTier,
      registeredAt: new Date().toISOString(),
      status: 'enrolled',
    }

    setRegistrations([newReg, ...registrations])

    playNotificationSound('chat')
    alert(`Studente ${studentName} iscritto con successo!\nAssegnato codice ${generatedCode} (Accesso: ${enrollAccessTier.toUpperCase()}).\nEmail inviata via Resend!`)

    setIsRegistering(false)
    setIsEnrollModalOpen(false)
    setStudentName('')
    setStudentEmail('')
  }

  const handleDeleteStudent = async (studentId: string, name: string, code: string) => {
    if (!confirm(`Sei sicuro di voler eliminare lo studente "${name}" (Codice: ${code}) dal sistema?`)) return

    await deleteStudentCodeAction(studentId)
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
    } catch (e) { }

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
    } catch (e) { }
  }

  const handleSaveBonusVideo = (e: React.FormEvent) => {
    e.preventDefault()
    if (!bonusTitleInput.trim() || !bonusUrlInput.trim()) return

    const newVideo: BonusVideoItem = {
      id: `bv-${Date.now()}`,
      title: bonusTitleInput.trim(),
      category: bonusCategoryInput,
      duration: bonusDurationInput.trim() || '10:00',
      date: bonusDateInput.trim() || new Date().toLocaleDateString('it-IT'),
      videoUrl: bonusUrlInput.trim(),
      description: bonusDescInput.trim(),
      resourcesUrl: bonusResUrlInput.trim() || undefined,
    }

    const updatedVideos = [newVideo, ...bonusVideos]
    setBonusVideos(updatedVideos)
    try {
      localStorage.setItem('ti_aiuto_bonus_videos', JSON.stringify(updatedVideos))
    } catch (e) { }

    setIsAddBonusVideoModalOpen(false)
    setBonusTitleInput('')
    setBonusUrlInput('')
    setBonusDescInput('')
    setBonusDateInput('')
    setBonusResUrlInput('')
    alert(`Video "${newVideo.title}" aggiunto con successo alla sezione News & Tutorial!`)
  }

  const handleDeleteBonusVideo = (id: string, title: string) => {
    if (!confirm(`Sei sicuro di voler eliminare il video "${title}"?`)) return
    const updatedVideos = bonusVideos.filter((v) => v.id !== id)
    setBonusVideos(updatedVideos)
    if (activeBonusVideo?.id === id) {
      setActiveBonusVideo(null)
    }
    try {
      localStorage.setItem('ti_aiuto_bonus_videos', JSON.stringify(updatedVideos))
    } catch (e) { }
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
    } catch (e) { }

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
    } catch (e) { }
  }

  const handleSendStudentChat = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim() || isAiThinking) return

    const userText = chatInput.trim()
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    const userMsg = {
      id: `m-${Date.now()}`,
      sender: activeStudent ? `${activeStudent.name} (Studente)` : 'Marco (Studente)',
      isAi: false,
      text: userText,
      time: now,
    }

    const updatedHistory = [...chatMessages, userMsg]
    setChatMessages(updatedHistory)
    setChatInput('')

    setIsAiThinking(true)

    try {
      const res = await askStudentAiAction(updatedHistory, activeLesson.id)
      const aiMsg = {
        id: `m-ai-${Date.now()}`,
        sender: 'Assistente @AI aiutiamoci',
        isAi: true,
        text: res.success && res.text ? res.text : 'Grazie per la domanda! Ho preso nota del tuo quesito sul modulo attivo.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setChatMessages((prev) => [...prev, aiMsg])
      playNotificationSound('chat')
    } catch (err: any) {
      console.error('Errore chat AI:', err)
    } finally {
      setIsAiThinking(false)
    }
  }

  const isLessonUnlocked = (index: number) => {
    const list = selectedCourseId === 'ai-start' ? lessons : lessonsPro
    if (isTeamMember || list.every((l) => l.completed)) return true
    if (index === 0) return true
    
    // Per AI Start applichiamo i checkpoint obbligatori
    if (selectedCourseId === 'ai-start') {
      // Moduli 2-10 richiedono il superamento del Test d'Ingresso (dopo modulo 1)
      if (index >= 1 && !passedTests.entry) {
        return false
      }
      // Moduli 11-20 richiedono il superamento del Test Intermedio (dopo modulo 10)
      if (index >= 10 && !passedTests.midterm) {
        return false
      }
    }

    // Per AI Pro applichiamo i 4 checkpoint obbligatori (ogni 5 moduli)
    if (selectedCourseId === 'ai-pro') {
      // Moduli 06-10 richiedono Checkpoint 1 (dopo modulo 5)
      if (index >= 5 && !passedTestsPro.pro_chk1) {
        return false
      }
      // Moduli 11-15 richiedono Checkpoint 2 (dopo modulo 10)
      if (index >= 10 && !passedTestsPro.pro_chk2) {
        return false
      }
      // Moduli 16-20 richiedono Checkpoint 3 (dopo modulo 15)
      if (index >= 15 && !passedTestsPro.pro_chk3) {
        return false
      }
    }

    return list[index - 1].completed
  }

  const toggleLessonCompleted = (lessonId: number) => {
    if (selectedCourseId === 'ai-start') {
      const target = lessons.find((l) => l.id === lessonId)
      const willBeCompleted = target ? !target.completed : true
      const updatedLessons = lessons.map((l) => (l.id === lessonId ? { ...l, completed: willBeCompleted } : l))
      setLessons(updatedLessons)
      try {
        localStorage.setItem('ti_aiuto_lessons_custom', JSON.stringify(updatedLessons))
      } catch (e) {}

      // Se ha appena completato il Modulo 1 e NON ha ancora superato il Test d'Ingresso:
      if (lessonId === 1 && willBeCompleted && !passedTests.entry) {
        handleOpenCheckpointTest('entry')
        return
      }

      // Se ha appena completato il Modulo 10 e NON ha ancora superato il Test Intermedio:
      if (lessonId === 10 && willBeCompleted && !passedTests.midterm) {
        handleOpenCheckpointTest('midterm')
        return
      }

      const currentIndex = lessons.findIndex((l) => l.id === lessonId)
      if (currentIndex >= 0 && currentIndex < lessons.length - 1) {
        const nextIndex = currentIndex + 1
        if (isLessonUnlocked(nextIndex)) {
          setActiveLesson(updatedLessons[nextIndex])
        }
      }
    } else {
      const target = lessonsPro.find((l) => l.id === lessonId)
      const willBeCompleted = target ? !target.completed : true
      const updatedLessonsPro = lessonsPro.map((l) => (l.id === lessonId ? { ...l, completed: willBeCompleted } : l))
      setLessonsPro(updatedLessonsPro)
      try {
        localStorage.setItem('ti_aiuto_lessons_custom_pro', JSON.stringify(updatedLessonsPro))
      } catch (e) {}

      if (lessonId === 5 && willBeCompleted && !passedTestsPro.pro_chk1) {
        handleOpenCheckpointTest('pro_chk1')
        return
      }
      if (lessonId === 10 && willBeCompleted && !passedTestsPro.pro_chk2) {
        handleOpenCheckpointTest('pro_chk2')
        return
      }
      if (lessonId === 15 && willBeCompleted && !passedTestsPro.pro_chk3) {
        handleOpenCheckpointTest('pro_chk3')
        return
      }

      const currentIndex = lessonsPro.findIndex((l) => l.id === lessonId)
      if (currentIndex >= 0 && currentIndex < lessonsPro.length - 1) {
        const nextIndex = currentIndex + 1
        if (isLessonUnlocked(nextIndex)) {
          setActiveLessonPro(updatedLessonsPro[nextIndex])
        }
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header & Course Switcher */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              Accademia & Formazione AI
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Percorsi formativi guidati: Corso Base AI Start & Corso Avanzato AI Pro (Automazioni & Agenti).
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isTeamMember ? (
              <div className="flex items-center gap-2">
                <Badge variant="purple" className="py-1 px-3 flex items-center gap-1.5 text-xs font-semibold">
                  <Award className="h-3.5 w-3.5" />
                  <span>Docente / Team</span>
                </Badge>
                <Button
                  onClick={() => setIsEnrollModalOpen(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2 shadow-xs text-xs font-semibold h-10 px-4 rounded-xl"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Iscrivi Studente</span>
                </Button>
              </div>
            ) : activeStudent ? (
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="success" className="py-1 px-3 flex items-center gap-1 text-xs">
                  <Unlock className="h-3.5 w-3.5" />
                  <span>
                    Studente: <strong>{activeStudent.name}</strong> ({activeStudent.code})
                  </span>
                </Badge>
                <a
                  href="https://t.me/+QSql9PpGLlMzYmI0"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs h-8 px-3 rounded-xl gap-1.5 border border-sky-500/40 bg-sky-950/40 hover:bg-sky-900/60 text-sky-300 font-semibold shadow-xs inline-flex items-center transition-all shrink-0"
                  title="Entra nella Community Telegram Ufficiale con il Tutor AI h24"
                >
                  <Send className="h-3.5 w-3.5 text-sky-400" />
                  <span>Community Telegram & Tutor AI</span>
                </a>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const maskedToken = encodeReferralCode(activeStudent.code)
                    const link = `https://aiutiamoci.cloud/?ref=${encodeURIComponent(maskedToken)}`
                    navigator.clipboard.writeText(link)
                    playNotificationSound('chat')
                    alert(`🔗 Il tuo Link d'Invito personale è stato copiato negli appunti!\n\n${link}\n\nCondividilo con colleghi o amici: quando si candidano, il sistema registrerà in automatico che sono stati presentati da te senza mostrare il tuo codice di accesso!`)
                  }}
                  className="text-xs h-8 gap-1.5 border-purple-500/40 text-purple-400 hover:bg-purple-950/30 font-semibold shadow-xs"
                  title="Copia il tuo link personale d'invito protetto"
                >
                  <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                  <span>Copia Link Referral</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsHelpModalOpen(true)}
                  className="h-8 text-xs font-semibold gap-1.5 border-amber-500/40 text-amber-500 hover:bg-amber-500/10 shadow-xs"
                  title="Apri la Guida Rapida e Istruzioni d'Uso della Piattaforma"
                >
                  <HelpCircle className="h-3.5 w-3.5 text-amber-500" />
                  <span>Guida & Istruzioni</span>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="h-8 w-8 rounded-xl border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  title={theme === 'dark' ? 'Passa al Tema Chiaro (Light Mode)' : 'Passa al Tema Scuro (Dark Mode)'}
                >
                  {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-600" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setActiveStudent(null)
                    try {
                      localStorage.removeItem('ti_aiuto_active_student')
                    } catch (e) {}
                  }}
                  className="text-xs text-slate-400 hover:text-white h-8"
                >
                  Esci
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsHelpModalOpen(true)}
                  className="h-9 text-xs font-semibold gap-1.5 border-amber-500/40 text-amber-500 hover:bg-amber-500/10 shadow-xs"
                  title="Apri la Guida Rapida e Istruzioni d'Uso"
                >
                  <HelpCircle className="h-4 w-4 text-amber-500" />
                  <span>Guida & Istruzioni</span>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="h-9 w-9 rounded-xl border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  title={theme === 'dark' ? 'Passa al Tema Chiaro (Light Mode)' : 'Passa al Tema Scuro (Dark Mode)'}
                >
                  {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-600" />}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setActiveTab('login')}
                  className="text-xs font-semibold h-10 gap-1.5 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400"
                >
                  <Key className="h-4 w-4" />
                  <span>Accedi con Codice Studente</span>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Course Switcher Pills / Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-1.5 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setSelectedCourseId('ai-start')}
            className={`p-3.5 rounded-xl text-left transition-all flex items-center justify-between cursor-pointer ${selectedCourseId === 'ai-start'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs border border-indigo-500/30'
                : 'opacity-70 hover:opacity-100 hover:bg-white/50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 border border-transparent'
              }`}
          >
            <div className="flex items-center gap-3">
              <div className={`h-9 w-9 rounded-xl flex items-center justify-center font-bold text-sm ${selectedCourseId === 'ai-start' ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>
                01
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-xs sm:text-sm">📘 AI Start (Masterclass 20 Moduli)</h4>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold">16h Certificate</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">20 Video Full HD • Checkpoint Test & Attestato Ufficiale</p>
              </div>
            </div>
            <Badge variant={selectedCourseId === 'ai-start' ? "success" : "outline"} className="text-[9px]">
              {selectedCourseId === 'ai-start' ? 'CORSO ATTIVO' : 'SELEZIONA'}
            </Badge>
          </button>

          <button
            onClick={() => setSelectedCourseId('ai-pro')}
            className={`p-3.5 rounded-xl text-left transition-all flex items-center justify-between cursor-pointer ${selectedCourseId === 'ai-pro'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs border border-purple-500/30'
                : 'opacity-70 hover:opacity-100 hover:bg-white/50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 border border-transparent'
              }`}
          >
            <div className="flex items-center gap-3">
              <div className={`h-9 w-9 rounded-xl flex items-center justify-center font-bold text-sm ${selectedCourseId === 'ai-pro' ? 'bg-purple-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>
                02
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-xs sm:text-sm">🚀 AI Pro (Automazioni & Agenti)</h4>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 font-bold">20h Certificate</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">20 Moduli Pratici • 4 Checkpoint Test & Attestato AI Pro</p>
              </div>
            </div>
            <Badge variant={selectedCourseId === 'ai-pro' ? "purple" : "outline"} className="text-[9px]">
              {selectedCourseId === 'ai-pro' ? 'CORSO ATTIVO' : 'SELEZIONA'}
            </Badge>
          </button>
        </div>
      </div>

      {/* Banner Video di Benvenuto Studente (Visibile per tutti gli iscritti) */}
      <div className="bg-gradient-to-r from-indigo-950/70 via-slate-900/90 to-purple-950/70 border border-indigo-500/30 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row items-center gap-5">
        <div className="w-full md:w-72 aspect-video rounded-xl overflow-hidden bg-black border border-indigo-500/40 shrink-0 shadow-md">
          <video
            controls
            playsInline
            preload="metadata"
            src="/video_benvenuto_studente.mp4"
            className="w-full h-full object-cover"
          >
            Il tuo browser non supporta il video.
          </video>
        </div>
        <div className="space-y-2 flex-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
            <Badge variant="purple" className="text-[10px] uppercase font-bold px-2 py-0.5">
              👋 Prima di Iniziare
            </Badge>
            <span className="text-xs text-amber-400 font-bold font-mono">Video Introduttivo di Benvenuto</span>
          </div>
          <h3 className="text-base sm:text-lg font-extrabold text-white">
            Benvenuto nella Masterclass AIutiamoci!
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Guarda questo breve video di benvenuto per scoprire come sfruttare al massimo le 20 lezioni, interagire con il Tutor AI <strong className="text-white">@AI</strong> e completare i compiti pratici.
          </p>
        </div>
      </div>

      {/* Selector Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('player')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all shrink-0 ${activeTab === 'player'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
        >
          <PlayCircle className="h-4 w-4" />
          <span>Player {selectedCourseId === 'ai-pro' ? 'AI Pro (20 Moduli)' : 'AI Start (20 Lezioni)'}</span>
        </button>

        <button
          onClick={() => setActiveTab('news-tutorial')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all shrink-0 ${activeTab === 'news-tutorial'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
        >
          <Sparkles className="h-4 w-4 text-amber-400" />
          <span>News & Tutorial ({bonusVideos.length})</span>
          <span className="px-1.5 py-0.5 text-[9px] font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-full">Bonus</span>
        </button>

        {isTeamMember && (
          <button
            onClick={() => setActiveTab('zoom')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all shrink-0 ${activeTab === 'zoom'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
          >
            <VideoIcon className="h-4 w-4" />
            <span>Registrazioni Zoom ({zoomRecordings.length})</span>
            <span className="px-1.5 py-0.5 text-[9px] font-bold bg-purple-500/20 text-purple-400 rounded-full">Admin</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('bonus')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all shrink-0 ${activeTab === 'bonus'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
        >
          <Gift className="h-4 w-4" />
          <span>Risorse & Manuali ({resources.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all shrink-0 cursor-pointer ${activeTab === 'tasks'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
        >
          <GraduationCap className="h-4 w-4 text-amber-400" />
          <span>I Miei Compiti & Attestato</span>
        </button>



        <Link
          href="/servizi-ai"
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all shrink-0 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 border border-indigo-200 dark:border-indigo-800/60 shadow-xs"
        >
          <Sparkles className="h-4 w-4 text-amber-500" />
          <span>Servizi AI & Soluzioni PMI</span>
          <ExternalLink className="h-3 w-3 opacity-60" />
        </Link>

        {isTeamMember && (
          <button
            onClick={() => {
              setActiveTab('students')
              loadCourseRegistrations()
              loadStudentCodes()
            }}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all shrink-0 ${activeTab === 'students'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
          >
            <Users className="h-4 w-4" />
            <span>Registro Codici & Studenti ({courseRegistrations.length || registrations.length})</span>
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

      {/* TAB 1: PLAYER VIDEO LEZIONI (AI START & AI PRO) & CHAT @AI */}
      {activeTab === 'player' && (
        !hasAccessToCurrentCourse() ? (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 max-w-2xl mx-auto my-8">
            <div className="h-16 w-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto border border-amber-500/20">
              <Lock className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <Badge variant="purple" className="text-xs uppercase font-mono px-2.5 py-0.5">
                {selectedCourseId === 'ai-pro' ? 'Percorso Avanzato AI Pro' : 'Percorso Base AI Start'}
              </Badge>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Accesso Riservato al Corso {selectedCourseId === 'ai-pro' ? 'AI Pro' : 'AI Start'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                Il tuo codice attuale (<code>{activeStudent?.code}</code>) è abilitato per {activeStudent?.accessTier === 'ai-start' ? 'AI Start (Corso Base)' : 'AI Pro'}.
                Per sbloccare anche questo percorso, richiedi il codice di upgrade al team.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center gap-3">
              <Button
                onClick={() => setSelectedCourseId(selectedCourseId === 'ai-pro' ? 'ai-start' : 'ai-pro')}
                variant="outline"
                className="text-xs"
              >
                Vai al corso abilitato ({selectedCourseId === 'ai-pro' ? 'AI Start' : 'AI Pro'})
              </Button>
              <Button
                onClick={() => {
                  window.open('mailto:info@aiutiamoci.cloud?subject=Richiesta Upgrade Corso AI Pro&body=Gentile Team, richiedo l\'upgrade del mio codice per il secondo corso.', '_blank')
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs gap-1.5"
              >
                <Mail className="h-3.5 w-3.5" />
                Richiedi Upgrade Accesso
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left / Center: Video Player & Lezione Attiva */}
            {(() => {
              const activeList = selectedCourseId === 'ai-start' ? lessons : lessonsPro
              const currentActive = selectedCourseId === 'ai-start' ? activeLesson : activeLessonPro
              const activeIndex = activeList.findIndex((l) => l.id === currentActive.id)
              const isCurrentUnlocked = isLessonUnlocked(activeIndex >= 0 ? activeIndex : 0)

              return (
                <div className="lg:col-span-8 space-y-4">
                  <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-xl overflow-hidden relative aspect-video flex items-center justify-center group">
                    {!isCurrentUnlocked ? (
                      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-slate-950/95 text-white space-y-4">
                        <div className="h-14 w-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                          <Lock className="h-7 w-7" />
                        </div>
                        <div className="space-y-1.5 max-w-md">
                          <h4 className="font-bold text-base text-white">
                            Modulo {currentActive.id} Bloccato
                          </h4>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            {selectedCourseId === 'ai-start' && activeIndex >= 1 && !passedTests.entry
                              ? "Per accedere a questa lezione devi prima completare il Modulo 1 e superare il Test d'Ingresso obbligatorio."
                              : selectedCourseId === 'ai-start' && activeIndex >= 10 && !passedTests.midterm
                              ? "Per accedere a questa lezione devi prima superare il Test Metà Corso obbligatorio (dopo il Modulo 10)."
                              : selectedCourseId === 'ai-pro' && activeIndex >= 5 && !passedTestsPro.pro_chk1
                              ? "Per accedere a questa lezione devi prima superare il Checkpoint 1 (dopo il Modulo 5)."
                              : selectedCourseId === 'ai-pro' && activeIndex >= 10 && !passedTestsPro.pro_chk2
                              ? "Per accedere a questa lezione devi prima superare il Checkpoint 2 (dopo il Modulo 10)."
                              : selectedCourseId === 'ai-pro' && activeIndex >= 15 && !passedTestsPro.pro_chk3
                              ? "Per accedere a questa lezione devi prima superare il Checkpoint 3 (dopo il Modulo 15)."
                              : "Per accedere a questa lezione devi prima completare il modulo precedente."}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                          {selectedCourseId === 'ai-start' && activeIndex >= 1 && !passedTests.entry && (
                            <Button
                              size="sm"
                              onClick={() => handleOpenCheckpointTest('entry')}
                              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs h-9 px-4 gap-2 rounded-xl"
                            >
                              <span>📝 Esegui Test d'Ingresso Ora</span>
                            </Button>
                          )}
                          {selectedCourseId === 'ai-start' && activeIndex >= 10 && !passedTests.midterm && (
                            <Button
                              size="sm"
                              onClick={() => handleOpenCheckpointTest('midterm')}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-9 px-4 gap-2 rounded-xl"
                            >
                              <span>📝 Esegui Test Metà Corso Ora</span>
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              if (selectedCourseId === 'ai-start') {
                                setActiveLesson(lessons[0])
                              } else {
                                setActiveLessonPro(lessonsPro[0])
                              }
                            }}
                            className="border-slate-700 text-slate-300 hover:bg-slate-800 text-xs h-9 px-4 rounded-xl"
                          >
                            <span>Torna al Modulo Iniziale</span>
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <video
                        key={`${currentActive.id}-${currentActive.videoUrl}`}
                        controls
                        playsInline
                        preload="metadata"
                        controlsList="nodownload"
                        onLoadedMetadata={(e) => {
                          // Resetta il tempo massimo visto al cambio lezione se non già completata
                          if (!currentActive.completed && !isTeamMember) {
                            setVideoMaxTimeWatched(0)
                            setVideoCanComplete(false)
                          } else {
                            setVideoCanComplete(true)
                          }
                        }}
                        onTimeUpdate={(e) => {
                          const video = e.currentTarget
                          if (isTeamMember) return
                          
                          // Aggiorna il punto massimo raggiunto se si guarda avanti naturalmente
                          if (video.currentTime > videoMaxTimeWatched) {
                            setVideoMaxTimeWatched(video.currentTime)
                          }

                          // Se ha visto almeno l'88% della durata totale, abilita il completamento
                          if (video.duration > 0 && (video.currentTime / video.duration >= 0.88 || videoMaxTimeWatched / video.duration >= 0.88)) {
                            if (!videoCanComplete) setVideoCanComplete(true)
                          }
                        }}
                        onSeeking={(e) => {
                          const video = e.currentTarget
                          if (isTeamMember || currentActive.completed) return

                          // Se lo studente prova a saltare più di 2 secondi oltre il punto massimo già visto, lo riporta indietro
                          if (video.currentTime > videoMaxTimeWatched + 2) {
                            video.currentTime = videoMaxTimeWatched
                          }
                        }}
                        onEnded={() => {
                          setVideoCanComplete(true)
                          if (!currentActive.completed) toggleLessonCompleted(currentActive.id)
                        }}
                        src={currentActive.videoUrl || ''}
                        className="w-full h-full object-cover rounded-2xl"
                      >
                        Il tuo browser non supporta il riproduttore video.
                      </video>
                    )}
                  </div>

                  {/* Dettaglio Lezione e Playlist */}
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 space-y-5">
                    {/* Header Titolo e Info Modulo */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <Badge variant="purple" className="text-[10px] uppercase font-mono px-2.5 py-0.5">
                          Modulo {currentActive.id} di {activeList.length}
                        </Badge>
                        <span className="text-xs text-slate-400 font-mono font-medium">
                          Durata: {currentActive.duration}
                        </span>
                      </div>
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">
                        {currentActive.title}
                      </h3>
                    </div>

                    {/* Barra Azioni Rapide a 4 Colonne Uniformi e Identiche per Tutti i Video */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 border-t border-slate-100 dark:border-slate-800">
                      {isTeamMember ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setCustomVideoUrlInput(currentActive.videoUrl || '')
                            setIsEditVideoModalOpen(true)
                          }}
                          className="w-full h-9 text-xs font-semibold gap-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl"
                        >
                          <Edit className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                          <span className="truncate">Modifica Video</span>
                        </Button>
                      ) : (
                        <div className="w-full h-9 flex items-center justify-center px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-500 text-xs font-medium gap-1.5">
                          <BookOpen className="h-3.5 w-3.5 text-indigo-500" />
                          <span>Modulo {currentActive.id}</span>
                        </div>
                      )}

                      <a
                        href={currentActive.resourcesPdfUrl || '/dispense/dispensa-modulo-1.pdf'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full"
                      >
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full h-9 text-xs font-semibold gap-2 border-purple-400/40 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40 rounded-xl"
                          title={`Apri la Dispensa PDF del Modulo ${currentActive.id}`}
                        >
                          <FileText className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                          <span className="truncate">Dispensa PDF</span>
                        </Button>
                      </a>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenQuizForLesson(currentActive)}
                        className="w-full h-9 text-xs font-semibold gap-2 border-indigo-400/40 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 rounded-xl"
                      >
                        <HelpCircle className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                        <span className="truncate">Quiz @AI</span>
                      </Button>

                      <Button
                        size="sm"
                        disabled={!isCurrentUnlocked || (!isTeamMember && !currentActive.completed && !videoCanComplete)}
                        onClick={() => {
                          if (isCurrentUnlocked) {
                            if (!isTeamMember && !currentActive.completed && !videoCanComplete) {
                              alert('Per favore guarda la video-lezione per completare il modulo.')
                              return
                            }
                            toggleLessonCompleted(currentActive.id)
                          }
                        }}
                        className={`w-full h-9 text-xs font-bold gap-2 rounded-xl shadow-xs transition-all ${
                          !isCurrentUnlocked
                            ? 'opacity-50 cursor-not-allowed bg-slate-200 dark:bg-slate-800 text-slate-400 border border-slate-300 dark:border-slate-700'
                            : currentActive.completed
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : !isTeamMember && !videoCanComplete
                            ? 'opacity-60 bg-slate-200 dark:bg-slate-800 text-slate-500 border border-slate-300 dark:border-slate-700 cursor-not-allowed'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        }`}
                        title={!isTeamMember && !currentActive.completed && !videoCanComplete ? 'Guarda almeno l\'88% del video per completare' : ''}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">
                          {!isCurrentUnlocked
                            ? 'Modulo Bloccato'
                            : currentActive.completed
                            ? 'Completata ✓'
                            : !isTeamMember && !videoCanComplete
                            ? 'In visione...'
                            : 'Segna Completata'}
                        </span>
                      </Button>
                    </div>

                {/* Banner 3 Checkpoint Obbligatori (AI Start) - POSIZIONATO IN ALTO */}
                {selectedCourseId === 'ai-start' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                    {/* 1. Test Iniziale */}
                    <div className={`p-2.5 rounded-xl border flex flex-col justify-between gap-2 transition-all ${passedTests.entry ? 'border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-950/20' : 'border-amber-500/50 bg-amber-50/30 dark:bg-amber-950/20'}`}>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Modulo 1</span>
                        {passedTests.entry ? (
                          <Badge className="bg-emerald-500 text-white text-[9px] px-1.5 py-0 gap-1">
                            <CheckCircle2 className="h-2.5 w-2.5" /> SUPERATO
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-amber-600 border-amber-500 text-[9px] px-1.5 py-0">
                            OBBLIGATORIO
                          </Badge>
                        )}
                      </div>
                      <div>
                        <h5 className="font-bold text-xs text-slate-900 dark:text-white">🏁 Test d'Ingresso</h5>
                        <p className="text-[10px] text-slate-500 line-clamp-1">Sblocca i Moduli 2-10</p>
                      </div>
                      <Button
                        size="sm"
                        variant={passedTests.entry ? "outline" : "default"}
                        onClick={() => handleOpenCheckpointTest('entry')}
                        className={`w-full text-[11px] h-7 font-bold ${passedTests.entry ? 'text-emerald-700 dark:text-emerald-300' : 'bg-amber-500 hover:bg-amber-600 text-slate-950'}`}
                      >
                        {passedTests.entry ? 'Rivedi Test ✓' : 'Esegui Test'}
                      </Button>
                    </div>

                    {/* 2. Test Intermedio */}
                    <div className={`p-2.5 rounded-xl border flex flex-col justify-between gap-2 transition-all ${passedTests.midterm ? 'border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-950/20' : !lessons.slice(0, 10).every(l => l.completed) ? 'opacity-60 border-slate-200 dark:border-slate-800' : 'border-indigo-500/50 bg-indigo-50/30 dark:bg-indigo-950/20'}`}>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Modulo 10</span>
                        {passedTests.midterm ? (
                          <Badge className="bg-emerald-500 text-white text-[9px] px-1.5 py-0 gap-1">
                            <CheckCircle2 className="h-2.5 w-2.5" /> SUPERATO
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-indigo-600 border-indigo-500 text-[9px] px-1.5 py-0">
                            OBBLIGATORIO
                          </Badge>
                        )}
                      </div>
                      <div>
                        <h5 className="font-bold text-xs text-slate-900 dark:text-white">⚖️ Test Metà Corso</h5>
                        <p className="text-[10px] text-slate-500 line-clamp-1">Sblocca i Moduli 11-20</p>
                      </div>
                      <Button
                        size="sm"
                        disabled={!lessons.slice(0, 10).every(l => l.completed) && !isTeamMember}
                        variant={passedTests.midterm ? "outline" : "default"}
                        onClick={() => handleOpenCheckpointTest('midterm')}
                        className={`w-full text-[11px] h-7 font-bold ${passedTests.midterm ? 'text-emerald-700 dark:text-emerald-300' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
                      >
                        {passedTests.midterm ? 'Rivedi Test ✓' : 'Esegui Test'}
                      </Button>
                    </div>

                    {/* 3. Esame Finale */}
                    <div className={`p-2.5 rounded-xl border flex flex-col justify-between gap-2 transition-all ${passedTests.final ? 'border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-950/20' : !lessons.every(l => l.completed) ? 'opacity-60 border-slate-200 dark:border-slate-800' : 'border-purple-500/50 bg-purple-50/30 dark:bg-purple-950/20'}`}>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Modulo 20</span>
                        <Badge variant="outline" className="text-purple-600 border-purple-500 text-[9px] px-1.5 py-0">
                          PIATTAFORMA ATOMA
                        </Badge>
                      </div>
                      <div>
                        <h5 className="font-bold text-xs text-slate-900 dark:text-white">🎓 Esame Finale & Certificazione</h5>
                        <p className="text-[10px] text-slate-500 line-clamp-1">Su Piattaforma Formativa Atoma</p>
                      </div>
                      <Button
                        size="sm"
                        disabled={!lessons.every(l => l.completed) && !isTeamMember}
                        variant="default"
                        onClick={() => handleOpenCheckpointTest('final')}
                        className="w-full text-[11px] h-7 font-bold bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        Info Esame Atoma
                      </Button>
                    </div>
                  </div>
                )}

                {/* Banner 4 Checkpoint Obbligatori (AI Pro) - Ogni 5 Lezioni */}
                {selectedCourseId === 'ai-pro' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 p-3 rounded-2xl bg-purple-950/20 border border-purple-900/40">
                    {/* 1. Checkpoint 1 (Mod 5) */}
                    <div className={`p-2.5 rounded-xl border flex flex-col justify-between gap-2 transition-all ${passedTestsPro.pro_chk1 ? 'border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-950/20' : 'border-purple-500/50 bg-purple-50/30 dark:bg-purple-950/30'}`}>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">Modulo 05</span>
                        {passedTestsPro.pro_chk1 ? (
                          <Badge className="bg-emerald-500 text-white text-[9px] px-1.5 py-0 gap-1">
                            <CheckCircle2 className="h-2.5 w-2.5" /> SUPERATO
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-purple-400 border-purple-500 text-[9px] px-1.5 py-0">
                            CHECKPOINT 1
                          </Badge>
                        )}
                      </div>
                      <div>
                        <h5 className="font-bold text-xs text-slate-900 dark:text-white">🤖 Agenti & File</h5>
                        <p className="text-[10px] text-slate-500 line-clamp-1">Sblocca i Moduli 06-10</p>
                      </div>
                      <Button
                        size="sm"
                        disabled={!lessonsPro.slice(0, 5).every(l => l.completed) && !isTeamMember}
                        variant={passedTestsPro.pro_chk1 ? "outline" : "default"}
                        onClick={() => handleOpenCheckpointTest('pro_chk1')}
                        className={`w-full text-[11px] h-7 font-bold ${passedTestsPro.pro_chk1 ? 'text-emerald-700 dark:text-emerald-300' : 'bg-purple-600 hover:bg-purple-700 text-white'}`}
                      >
                        {passedTestsPro.pro_chk1 ? 'Rivedi Test ✓' : 'Esegui Test'}
                      </Button>
                    </div>

                    {/* 2. Checkpoint 2 (Mod 10) */}
                    <div className={`p-2.5 rounded-xl border flex flex-col justify-between gap-2 transition-all ${passedTestsPro.pro_chk2 ? 'border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-950/20' : !lessonsPro.slice(0, 10).every(l => l.completed) ? 'opacity-60 border-slate-200 dark:border-slate-800' : 'border-indigo-500/50 bg-indigo-50/30 dark:bg-indigo-950/30'}`}>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Modulo 10</span>
                        {passedTestsPro.pro_chk2 ? (
                          <Badge className="bg-emerald-500 text-white text-[9px] px-1.5 py-0 gap-1">
                            <CheckCircle2 className="h-2.5 w-2.5" /> SUPERATO
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-indigo-400 border-indigo-500 text-[9px] px-1.5 py-0">
                            CHECKPOINT 2
                          </Badge>
                        )}
                      </div>
                      <div>
                        <h5 className="font-bold text-xs text-slate-900 dark:text-white">🔌 API & Webhook</h5>
                        <p className="text-[10px] text-slate-500 line-clamp-1">Sblocca i Moduli 11-15</p>
                      </div>
                      <Button
                        size="sm"
                        disabled={!lessonsPro.slice(0, 10).every(l => l.completed) && !isTeamMember}
                        variant={passedTestsPro.pro_chk2 ? "outline" : "default"}
                        onClick={() => handleOpenCheckpointTest('pro_chk2')}
                        className={`w-full text-[11px] h-7 font-bold ${passedTestsPro.pro_chk2 ? 'text-emerald-700 dark:text-emerald-300' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
                      >
                        {passedTestsPro.pro_chk2 ? 'Rivedi Test ✓' : 'Esegui Test'}
                      </Button>
                    </div>

                    {/* 3. Checkpoint 3 (Mod 15) */}
                    <div className={`p-2.5 rounded-xl border flex flex-col justify-between gap-2 transition-all ${passedTestsPro.pro_chk3 ? 'border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-950/20' : !lessonsPro.slice(0, 15).every(l => l.completed) ? 'opacity-60 border-slate-200 dark:border-slate-800' : 'border-amber-500/50 bg-amber-50/30 dark:bg-amber-950/30'}`}>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Modulo 15</span>
                        {passedTestsPro.pro_chk3 ? (
                          <Badge className="bg-emerald-500 text-white text-[9px] px-1.5 py-0 gap-1">
                            <CheckCircle2 className="h-2.5 w-2.5" /> SUPERATO
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-amber-400 border-amber-500 text-[9px] px-1.5 py-0">
                            CHECKPOINT 3
                          </Badge>
                        )}
                      </div>
                      <div>
                        <h5 className="font-bold text-xs text-slate-900 dark:text-white">⚙️ n8n & RAG Base</h5>
                        <p className="text-[10px] text-slate-500 line-clamp-1">Sblocca i Moduli 16-20</p>
                      </div>
                      <Button
                        size="sm"
                        disabled={!lessonsPro.slice(0, 15).every(l => l.completed) && !isTeamMember}
                        variant={passedTestsPro.pro_chk3 ? "outline" : "default"}
                        onClick={() => handleOpenCheckpointTest('pro_chk3')}
                        className={`w-full text-[11px] h-7 font-bold ${passedTestsPro.pro_chk3 ? 'text-emerald-700 dark:text-emerald-300' : 'bg-amber-600 hover:bg-amber-700 text-white'}`}
                      >
                        {passedTestsPro.pro_chk3 ? 'Rivedi Test ✓' : 'Esegui Test'}
                      </Button>
                    </div>

                    {/* 4. Esame Finale AI Pro (Mod 20) */}
                    <div className={`p-2.5 rounded-xl border flex flex-col justify-between gap-2 transition-all ${passedTestsPro.pro_final ? 'border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-950/20' : !lessonsPro.every(l => l.completed) ? 'opacity-60 border-slate-200 dark:border-slate-800' : 'border-purple-500/50 bg-purple-50/30 dark:bg-purple-950/30'}`}>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">Modulo 20</span>
                        {passedTestsPro.pro_final ? (
                          <Badge className="bg-emerald-500 text-white text-[9px] px-1.5 py-0 gap-1">
                            <CheckCircle2 className="h-2.5 w-2.5" /> SUPERATO
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-purple-400 border-purple-500 text-[9px] px-1.5 py-0">
                            CERTIFICAZIONE PRO
                          </Badge>
                        )}
                      </div>
                      <div>
                        <h5 className="font-bold text-xs text-slate-900 dark:text-white">🎓 Esame Finale 20 Ore</h5>
                        <p className="text-[10px] text-slate-500 line-clamp-1">Sblocca Attestato AI Pro</p>
                      </div>
                      <Button
                        size="sm"
                        disabled={!lessonsPro.every(l => l.completed) && !isTeamMember}
                        variant={passedTestsPro.pro_final ? "outline" : "default"}
                        onClick={() => handleOpenCheckpointTest('pro_final')}
                        className={`w-full text-[11px] h-7 font-bold ${passedTestsPro.pro_final ? 'text-emerald-700 dark:text-emerald-300' : 'bg-purple-600 hover:bg-purple-700 text-white'}`}
                      >
                        {passedTestsPro.pro_final ? 'Rivedi Esame ✓' : 'Sostieni Esame'}
                      </Button>
                    </div>
                  </div>
                )}

                {/* SCHEDA DIDATTICA INTERATTIVA: SINTESI, PUNTI CHIAVE & ESERCIZIO DI QUESTO MODULO */}
                {((selectedCourseId === 'ai-start' && LESSON_SUMMARIES[activeLesson.id]) ||
                  (selectedCourseId === 'ai-pro' && LESSON_SUMMARIES_PRO[activeLessonPro.id])) && (
                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">
                          {selectedCourseId === 'ai-pro' ? 'Scheda Tecnica & Punti Chiave • Modulo ' : 'Dispensa & Punti Chiave • Modulo '}
                          {(selectedCourseId === 'ai-start' ? activeLesson : activeLessonPro).id}
                        </h4>
                      </div>
                      <Link
                        href="/cervello"
                        className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                      >
                        <span>Vedi nel Secondo Cervello</span>
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {(selectedCourseId === 'ai-start' ? LESSON_SUMMARIES[activeLesson.id] : LESSON_SUMMARIES_PRO[activeLessonPro.id]).summary}
                    </p>

                    <div className="space-y-2 pt-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        🔑 Concetti Chiave del Modulo:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {(selectedCourseId === 'ai-start' ? LESSON_SUMMARIES[activeLesson.id] : LESSON_SUMMARIES_PRO[activeLessonPro.id]).takeaways.map((takeaway, tIdx) => (
                          <div
                            key={tIdx}
                            className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                            <span className="leading-snug">{takeaway}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="space-y-0.5">
                        <span className="font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                          <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                          Esercizio Pratico Consigliato:
                        </span>
                        <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                          {(selectedCourseId === 'ai-start' ? LESSON_SUMMARIES[activeLesson.id] : LESSON_SUMMARIES_PRO[activeLessonPro.id]).exercise}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={(selectedCourseId === 'ai-start' ? activeLesson.resourcesPdfUrl : activeLessonPro.resourcesPdfUrl) || '/dispense/dispensa-modulo-1.pdf'}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-[11px] h-7 px-3 rounded-lg border-indigo-300 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 gap-1 bg-white dark:bg-slate-900 font-semibold"
                          >
                            <FileText className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
                            <span>Dispensa PDF</span>
                          </Button>
                        </a>

                        <Button
                          size="sm"
                          onClick={() => {
                            const inputEl = document.querySelector('input[placeholder*="Scrivi una domanda"]') as HTMLInputElement
                            if (inputEl) {
                              const currExercise = (selectedCourseId === 'ai-start' ? LESSON_SUMMARIES[activeLesson.id] : LESSON_SUMMARIES_PRO[activeLessonPro.id]).exercise
                              inputEl.value = `Ho una domanda sull'esercizio del Modulo ${(selectedCourseId === 'ai-start' ? activeLesson : activeLessonPro).id}: "${currExercise}"`
                              inputEl.focus()
                            }
                          }}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] h-7 px-3 rounded-lg gap-1"
                        >
                          <span>Chiedi a @AI</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Banner Completamento & Attestato */}
                {((selectedCourseId === 'ai-start' && lessons.every((l) => l.completed) && passedTests.final) ||
                  (selectedCourseId === 'ai-pro' && lessonsPro.every((l) => l.completed))) && (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-indigo-500/20 to-purple-500/20 border border-amber-500/40 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-amber-500/30 flex items-center justify-center text-amber-500 shrink-0">
                        <Award className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                          🎉 Complimenti! Hai completato e superato con successo {selectedCourseId === 'ai-pro' ? 'AI Pro' : 'AI Start (16 Ore Certificate)'}!
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Il tuo Attestato Ufficiale di Completamento è pronto per essere scaricato.
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleOpenCertificate(activeStudent?.name, activeStudent?.code)}
                      className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs h-9 px-4 gap-1.5 shrink-0 shadow-xs"
                    >
                      <Award className="h-4 w-4" />
                      <span>Scarica Attestato Ufficiale</span>
                    </Button>
                  </div>
                )}

                {/* Lista dei Moduli del Corso Selezionato */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
                    <span>Playlist {selectedCourseId === 'ai-pro' ? '10 Moduli AI Pro (Automazioni)' : '20 Moduli AI Start'}</span>
                    <span className="font-mono text-indigo-600 dark:text-indigo-400">
                      {(selectedCourseId === 'ai-start' ? lessons : lessonsPro).filter((l) => l.completed).length} / {(selectedCourseId === 'ai-start' ? lessons : lessonsPro).length} Completate
                    </span>
                  </div>

                  <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                    {(selectedCourseId === 'ai-start' ? lessons : lessonsPro).map((lesson, idx) => {
                      const isUnlocked = isLessonUnlocked(idx)
                      const isSelected = (selectedCourseId === 'ai-start' ? activeLesson : activeLessonPro).id === lesson.id
                      return (
                        <div
                          key={lesson.id}
                          onClick={() => {
                            if (isUnlocked) {
                              if (selectedCourseId === 'ai-start') {
                                setActiveLesson(lesson)
                              } else {
                                setActiveLessonPro(lesson)
                              }
                            } else {
                              if (selectedCourseId === 'ai-start' && idx >= 1 && !passedTests.entry) {
                                handleOpenCheckpointTest('entry')
                              } else if (selectedCourseId === 'ai-start' && idx >= 10 && !passedTests.midterm) {
                                handleOpenCheckpointTest('midterm')
                              } else if (selectedCourseId === 'ai-pro' && idx >= 5 && !passedTestsPro.pro_chk1) {
                                handleOpenCheckpointTest('pro_chk1')
                              } else if (selectedCourseId === 'ai-pro' && idx >= 10 && !passedTestsPro.pro_chk2) {
                                handleOpenCheckpointTest('pro_chk2')
                              } else if (selectedCourseId === 'ai-pro' && idx >= 15 && !passedTestsPro.pro_chk3) {
                                handleOpenCheckpointTest('pro_chk3')
                              } else {
                                alert(`Devi prima completare il modulo precedente per sbloccare questo argomento!`)
                              }
                            }
                          }}
                          className={`p-3 rounded-xl border flex items-center justify-between transition-all ${!isUnlocked
                              ? 'opacity-60 bg-slate-100/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 cursor-pointer'
                              : isSelected
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
                                className={`h-5 w-5 rounded-full border flex items-center justify-center transition-colors shrink-0 ${lesson.completed
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

                            <span className={`text-xs truncate ${!isUnlocked ? 'text-slate-400 dark:text-slate-500' : isSelected ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-700 dark:text-slate-300'}`}>
                              {lesson.title}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {lesson.resourcesPdfUrl && isUnlocked && (
                              <a
                                href={lesson.resourcesPdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                title={`Scarica Dispensa PDF (Modulo ${lesson.id})`}
                                className="p-1 rounded-md text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/50 transition-colors"
                              >
                                <FileText className="h-3.5 w-3.5" />
                              </a>
                            )}
                            {!isUnlocked ? (
                              <Badge variant="secondary" className="text-[9px] px-1.5 py-0 gap-1 bg-slate-200 dark:bg-slate-800 text-slate-500">
                                <Lock className="h-2.5 w-2.5" />
                                <span>BLOCCATA</span>
                              </Badge>
                            ) : isSelected ? (
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
              )
            })()}

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
                <div className="flex items-center gap-2">
                  <a
                    href="https://t.me/Corsi_Masterclass_bot"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 text-[10px] font-bold transition-all"
                    title="Apri il Tutor AI h24 su Telegram (@Corsi_Masterclass_bot)"
                  >
                    <Send className="h-3 w-3" />
                    <span>Tutor Telegram</span>
                  </a>
                  <Badge variant="success" className="text-[9px] uppercase">Online 24/7</Badge>
                </div>
              </div>

              <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-3 rounded-xl max-w-[88%] space-y-1 ${msg.isAi
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
        </div>
        )
      )}

      {/* TAB: NEWS & TUTORIAL BONUS */}
      {activeTab === 'news-tutorial' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="purple" className="text-[10px] uppercase tracking-wider font-mono">Extra & Aggiornamenti</Badge>
                <span className="text-xs text-slate-400 font-mono">• {bonusVideos.length} Video Disponibili</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mt-1">
                <Sparkles className="h-5 w-5 text-amber-500" />
                News, Tutorial & Approfondimenti Continui
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Nuove pillole video, novità sui modelli IA (ChatGPT, Claude, Gemini, DeepSeek) e tutorial pratici oltre i 20 moduli base.
              </p>
            </div>

            {isTeamMember && (
              <Button
                onClick={() => {
                  setBonusTitleInput('')
                  setBonusUrlInput('')
                  setBonusDescInput('')
                  setBonusDateInput(new Date().toLocaleDateString('it-IT'))
                  setBonusDurationInput('12:00')
                  setBonusResUrlInput('')
                  setIsAddBonusVideoModalOpen(true)
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-10 px-4 rounded-xl gap-2 shadow-xs shrink-0"
              >
                <Plus className="h-4 w-4" />
                <span>+ Aggiungi Video Bonus</span>
              </Button>
            )}
          </div>

          {/* PLAYER ATTIVO VIDEO BONUS */}
          {activeBonusVideo && (
            <div className="bg-slate-950 p-5 rounded-2xl border border-indigo-500/30 shadow-2xl space-y-4 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-white border-b border-slate-800 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={activeBonusVideo.category === 'News' ? 'secondary' : 'purple'} className="text-[10px]">
                      {activeBonusVideo.category}
                    </Badge>
                    <span className="text-xs text-slate-400 font-mono">Durata: {activeBonusVideo.duration} • Data: {activeBonusVideo.date}</span>
                  </div>
                  <h4 className="font-bold text-base text-white flex items-center gap-2">
                    <PlayCircle className="h-5 w-5 text-indigo-400" />
                    {activeBonusVideo.title}
                  </h4>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {activeBonusVideo.resourcesUrl && (
                    <a
                      href={activeBonusVideo.resourcesUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-950 border border-indigo-700 text-indigo-300 hover:bg-indigo-900 text-xs font-semibold"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Risorse collegate
                    </a>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => setActiveBonusVideo(null)} className="text-xs text-slate-400 hover:text-white">
                    Chiudi Player
                  </Button>
                </div>
              </div>

              <div className="aspect-video w-full rounded-xl overflow-hidden bg-black border border-slate-800">
                <video
                  key={activeBonusVideo.id}
                  controls
                  playsInline
                  preload="metadata"
                  src={activeBonusVideo.videoUrl}
                  className="w-full h-full object-cover"
                />
              </div>

              {activeBonusVideo.description && (
                <p className="text-xs text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 leading-relaxed">
                  💡 {activeBonusVideo.description}
                </p>
              )}
            </div>
          )}

          {/* GRIGLIA VIDEO BONUS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bonusVideos.map((video) => {
              const isPlaying = activeBonusVideo?.id === video.id
              return (
                <div
                  key={video.id}
                  className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border transition-all flex flex-col justify-between gap-4 ${
                    isPlaying
                      ? 'border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 shadow-xs'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          video.category === 'News'
                            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                            : video.category === 'Tutorial'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            : 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                        }`}>
                          {video.category}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">{video.duration}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">{video.date}</span>
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                        {video.title}
                      </h4>
                      {video.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {video.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/60">
                    <Button
                      size="sm"
                      onClick={() => setActiveBonusVideo(video)}
                      className={`font-bold text-xs h-9 px-4 rounded-xl gap-2 shadow-xs ${
                        isPlaying
                          ? 'bg-slate-800 text-white hover:bg-slate-700'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      }`}
                    >
                      <PlayCircle className="h-4 w-4" />
                      <span>{isPlaying ? 'In Riproduzione' : 'Guarda Video'}</span>
                    </Button>

                    <div className="flex items-center gap-1">
                      {video.resourcesUrl && (
                        <a
                          href={video.resourcesUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="h-8 px-2.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-xs flex items-center gap-1 transition-colors"
                          title="Risorse Collegate"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          <span className="text-[11px]">Link</span>
                        </a>
                      )}

                      {isTeamMember && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteBonusVideo(video.id, video.title)}
                          className="h-8 w-8 text-slate-400 hover:text-red-600 dark:hover:text-red-400"
                          title="Elimina Video"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* TAB 2: REGISTRAZIONI ZOOM LIVE */}
      {activeTab === 'zoom' && (
        !hasAccessToCurrentCourse() ? (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 max-w-2xl mx-auto my-8">
            <div className="h-16 w-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto border border-amber-500/20">
              <Lock className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <Badge variant="purple" className="text-xs uppercase font-mono px-2.5 py-0.5">
                {selectedCourseId === 'ai-pro' ? 'Registrazioni AI Pro' : 'Registrazioni AI Start'}
              </Badge>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Contenuto Riservato
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                Le registrazioni Zoom di questo percorso sono accessibili solo con il codice abilitato.
              </p>
            </div>
          </div>
        ) : (
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

              {isTeamMember && (
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
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Registrazione ufficiale della lezione
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

                    {isTeamMember && (
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
        )
      )}

      {/* TAB 3: RISORSE BONUS & MANUALI */}
      {activeTab === 'bonus' && (
        !hasAccessToCurrentCourse() ? (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 max-w-2xl mx-auto my-8">
            <div className="h-16 w-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto border border-amber-500/20">
              <Lock className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <Badge variant="purple" className="text-xs uppercase font-mono px-2.5 py-0.5">
                {selectedCourseId === 'ai-pro' ? 'Risorse AI Pro' : 'Risorse AI Start'}
              </Badge>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Contenuto Riservato
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                I manuali e le risorse di questo percorso sono accessibili solo con il codice abilitato.
              </p>
            </div>
          </div>
        ) : (
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

              {isTeamMember && (
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

            {/* Box Informativo: Dispense Integrate in Ciascun Modulo */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/30 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-md">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/40 flex items-center justify-center shrink-0 shadow-md">
                  <BookOpen className="h-7 w-7" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="info" className="text-[9px] uppercase font-mono">Materiali Didattici Integrati</Badge>
                    <span className="text-[10px] text-emerald-400 font-mono font-semibold">20/20 Moduli Disponibili</span>
                  </div>
                  <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                    📚 Schede Didattiche, Punti Chiave & Dispense nel Player
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
                    Tutte le sintesi concettuali, i punti chiave, le checklist e gli esercizi pratici sono consultabili direttamente sotto a ciascun video nel tab <strong>"Player Video & Lezioni"</strong>.
                  </p>
                </div>
              </div>

              <Button
                onClick={() => setActiveTab('player')}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs h-11 px-5 rounded-xl gap-2 shadow-lg shadow-indigo-600/30 shrink-0 cursor-pointer"
              >
                <PlayCircle className="h-4 w-4" />
                <span>Vai alle Lezioni & Dispense</span>
              </Button>
            </div>

            {/* 4 SCHEDE MANUALI PRATICHE INTERATTIVE: FREE VS PAGAMENTO & PERSONALIZZAZIONE */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    Manuali Operativi & Guide di Personalizzazione (4 Tool a Confronto)
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Come configurare le impostazioni avanzate, i prompt di sistema e cosa puoi fare con la versione Gratuita vs a Pagamento.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PRACTICAL_GUIDES.map((guide) => (
                  <div
                    key={guide.id}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between hover:border-indigo-500/60 hover:shadow-md transition-all group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="purple" className="text-[9px] uppercase font-mono font-bold tracking-wider">
                          {guide.badge}
                        </Badge>
                        <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {guide.readTime}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {guide.title}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                          {guide.description}
                        </p>
                      </div>

                      {/* Mini preview Free vs Paid */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                        <div className="bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl">
                          <span className="font-bold text-emerald-600 dark:text-emerald-400 block mb-1">🟢 Piano Free</span>
                          <span className="text-slate-600 dark:text-slate-400 line-clamp-2">{guide.freeFeatures[0]}</span>
                        </div>
                        <div className="bg-purple-500/5 dark:bg-purple-500/10 border border-purple-500/20 p-2.5 rounded-xl">
                          <span className="font-bold text-purple-600 dark:text-purple-400 block mb-1">⭐ Piano Pro / Plus</span>
                          <span className="text-slate-600 dark:text-slate-400 line-clamp-2">{guide.paidFeatures[0]}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 mt-2">
                      <Button
                        onClick={() => setSelectedGuide(guide)}
                        className="w-full bg-slate-900 dark:bg-slate-800 hover:bg-indigo-600 text-white font-bold text-xs h-10 rounded-xl gap-2 shadow-xs transition-all cursor-pointer"
                      >
                        <BookOpen className="h-3.5 w-3.5" />
                        <span>Leggi Manuale & Prompt di Configurazione</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SEZIONE FILE EXTRA CARICATI DAL TEAM */}
            {resources.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Altri Documenti Allegati</h4>
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

                        {isTeamMember && (
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
          </div>
        )
      )}

      {/* TAB: I MIEI COMPITI PERSONALI & ATTESTATO (AREA RISERVATA ALLO STUDENTE) */}
      {activeTab === 'tasks' && (
        <div className="py-2">
          <StudentTasksZone
            provider="gemini"
            initialTier={selectedCourseId === 'ai-pro' ? 'ai-pro' : 'ai-start'}
          />
        </div>
      )}

      {/* TAB 4: REGISTRO STUDENTI & CODICI & LISTA D'ATTESA */}
      {activeTab === 'students' && isTeamMember && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Registro Studenti & Lista d'Attesa</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Gestione codici corsisti accreditati e leads in lista d'attesa per i prossimi corsi.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setIsBulkModalOpen(true)}
                className="text-xs h-10 px-3.5 rounded-xl gap-2 border-slate-200 dark:border-slate-700"
              >
                <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                <span>Importa Massivo (CSV)</span>
              </Button>
              <Button
                onClick={() => setIsEnrollModalOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs h-10 px-4 rounded-xl gap-2 shadow-xs"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Iscrivi Singolo Studente</span>
              </Button>
            </div>
          </div>

          {/* Sotto-Schede: In Attesa vs Studenti Corso 1 vs Iscritti Corso 2 vs Lista d'Attesa */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setStudentSubTab('registrations')}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition-all ${studentSubTab === 'registrations'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
              >
                <ClipboardList className="h-4 w-4" />
                <span>⏳ In Attesa ({courseRegistrations.filter(r => !r.approved && r.status !== 'approved').length})</span>
                {courseRegistrations.filter(r => !r.approved && r.status !== 'approved').length > 0 && (
                  <span className="px-1.5 py-0.2 bg-white text-amber-700 text-[10px] rounded-full font-black">
                    NEW
                  </span>
                )}
              </button>

              <button
                onClick={() => setStudentSubTab('active')}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition-all ${studentSubTab === 'active'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
              >
                <Users className="h-4 w-4" />
                <span>🎓 Studenti Corso 1 - AI Start ({registrations.filter(r => r.accessTier === 'ai-start' || !r.accessTier).length})</span>
              </button>

              <button
                onClick={() => setStudentSubTab('pro_students')}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition-all ${studentSubTab === 'pro_students'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
              >
                <Sparkles className="h-4 w-4" />
                <span>🚀 Iscritti Corso 2 - AI Pro ({registrations.filter(r => r.accessTier === 'ai-pro' || r.accessTier === 'both').length})</span>
              </button>

              <button
                onClick={() => {
                  setStudentSubTab('waitlist')
                  loadWaitlistLeads()
                }}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition-all ${studentSubTab === 'waitlist'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
              >
                <Clock className="h-4 w-4" />
                <span>📋 Lista d'Attesa Leads ({waitlistLeads.length})</span>
              </button>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={loadCourseRegistrations}
              className="text-xs h-8 gap-1.5 border-slate-200 dark:border-slate-700"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loadingRegistrations ? 'animate-spin' : ''}`} />
              <span>Ricarica</span>
            </Button>
          </div>

          {/* TABELLA 1: REGISTRAZIONI & QUESTIONARIO (COME NELLA FOTO) */}
          {studentSubTab === 'registrations' && (
            <div className="space-y-4">
              {/* Barra Filtri e Ricerca */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="relative w-full sm:w-80">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={regSearchQuery}
                    onChange={(e) => setRegSearchQuery(e.target.value)}
                    placeholder="Cerca per nome, email o obiettivo..."
                    className="pl-9 text-xs h-9 bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                  {regSearchQuery && (
                    <button
                      onClick={() => setRegSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
                  <button
                    onClick={() => setRegStatusFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${regStatusFilter === 'all'
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                  >
                    Tutti ({courseRegistrations.length})
                  </button>
                  <button
                    onClick={() => setRegStatusFilter('pending')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${regStatusFilter === 'pending'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                  >
                    In Attesa ({courseRegistrations.filter(r => !r.approved && r.status !== 'approved').length})
                  </button>
                  <button
                    onClick={() => setRegStatusFilter('approved')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${regStatusFilter === 'approved'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                  >
                    Approvati ({courseRegistrations.filter(r => r.approved || r.status === 'approved').length})
                  </button>
                </div>
              </div>

              {/* Tabella Registrazioni */}
              <div className="bg-[#0f172a] rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#1e293b]/70 border-b border-slate-800 text-slate-400 font-semibold">
                      <tr>
                        <th className="py-3 px-4 min-w-[140px]">Nome</th>
                        <th className="py-3 px-4 min-w-[200px]">Email</th>
                        <th className="py-3 px-4 min-w-[160px]">Esperienza AI</th>
                        <th className="py-3 px-4 min-w-[170px]">Obiettivo</th>
                        <th className="py-3 px-4 min-w-[160px]">Blocco</th>
                        <th className="py-3 px-4 min-w-[160px]">Aspettativa</th>
                        <th className="py-3 px-4 min-w-[180px]">Fonte / Referral</th>
                        <th className="py-3 px-4 min-w-[130px]">Data</th>
                        <th className="py-3 px-4 min-w-[140px] text-right">Stato</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {courseRegistrations
                        .filter((reg) => {
                          const isAppr = reg.approved === true || reg.status === 'approved'
                          if (regStatusFilter === 'pending' && isAppr) return false
                          if (regStatusFilter === 'approved' && !isAppr) return false

                          if (regSearchQuery.trim()) {
                            const q = regSearchQuery.toLowerCase()
                            const mName = reg.name.toLowerCase().includes(q)
                            const mEmail = reg.email.toLowerCase().includes(q)
                            const mObj = (reg.objective || '').toLowerCase().includes(q)
                            const mExp = (reg.ai_experience || '').toLowerCase().includes(q)
                            const mBlk = (reg.blocker || '').toLowerCase().includes(q)
                            const raw = (reg.raw_answers as any) || {}
                            const mRef = ((raw.referred_by || '') + ' ' + (raw.referral_source || raw.source || '')).toLowerCase().includes(q)
                            return mName || mEmail || mObj || mExp || mBlk || mRef
                          }
                          return true
                        })
                        .map((reg) => {
                          const isAppr = reg.approved === true || reg.status === 'approved'
                          const raw = (reg.raw_answers as any) || {}
                          const src = raw.referral_source || raw.source
                          const ref = raw.referred_by
                          return (
                            <tr key={reg.id} className="hover:bg-slate-800/40 transition-colors">
                              <td className="py-3.5 px-4 font-bold text-slate-100">
                                {reg.name}
                              </td>

                              <td className="py-3.5 px-4 font-mono text-blue-400">
                                <div className="flex items-center gap-1.5 group">
                                  <span className="truncate max-w-[180px]">{reg.email}</span>
                                  <button
                                    onClick={() => copyEmailToClipboard(reg.email, reg.id)}
                                    className="text-slate-500 hover:text-slate-300 transition-colors"
                                    title="Copia Email"
                                  >
                                    {copiedEmailKey === reg.id ? (
                                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                                    ) : (
                                      <Copy className="h-3.5 w-3.5" />
                                    )}
                                  </button>
                                </div>
                              </td>

                              <td className="py-3.5 px-4 text-slate-300 truncate max-w-[160px]" title={reg.ai_experience || ''}>
                                {reg.ai_experience || '—'}
                              </td>

                              <td className="py-3.5 px-4 text-slate-300 truncate max-w-[170px]" title={reg.objective || ''}>
                                {reg.objective || '—'}
                              </td>

                              <td className="py-3.5 px-4 text-slate-400 truncate max-w-[160px]" title={reg.blocker || ''}>
                                {reg.blocker || '—'}
                              </td>

                              <td className="py-3.5 px-4 text-slate-400 truncate max-w-[160px]" title={reg.expectation || ''}>
                                {reg.expectation || '—'}
                              </td>

                              <td className="py-3.5 px-4 text-slate-300">
                                {!src && !ref ? (
                                  <span className="text-slate-500">—</span>
                                ) : (
                                  <div className="flex flex-col gap-1 max-w-[170px]">
                                    {src && (
                                      <span className="text-[11px] font-semibold text-indigo-400 truncate" title={src}>
                                        {src}
                                      </span>
                                    )}
                                    {ref && (
                                      <span className="text-[10px] text-amber-300 font-mono bg-amber-950/40 border border-amber-800/60 px-1.5 py-0.5 rounded-md inline-flex items-center gap-1 w-fit" title={ref}>
                                        👤 Da: {ref}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </td>

                              <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                                {new Date(reg.created_at).toLocaleString('it-IT', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </td>

                              <td className="py-3.5 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  {isAppr ? (
                                    <div className="flex items-center gap-2">
                                      <div className="flex flex-col items-end">
                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-400 font-semibold text-[11px]">
                                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                                          <span>Approvato</span>
                                        </div>
                                        {reg.approved_at && (
                                          <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                                            {new Date(reg.approved_at).toLocaleString('it-IT', {
                                              day: '2-digit',
                                              month: '2-digit',
                                              year: 'numeric',
                                              hour: '2-digit',
                                              minute: '2-digit',
                                            })}
                                          </span>
                                        )}
                                        {reg.access_code && (
                                          <span className="text-[10px] text-indigo-400 font-mono">
                                            {reg.access_code}
                                          </span>
                                        )}
                                      </div>

                                      {(() => {
                                        const matchingStudent = registrations.find(s => s.code === reg.access_code || s.studentEmail === reg.email)
                                        if (matchingStudent && matchingStudent.accessTier !== 'ai-pro' && matchingStudent.accessTier !== 'both') {
                                          return (
                                            <Button
                                              size="sm"
                                              onClick={() => handleUpgradeStudent(matchingStudent, 'both')}
                                              className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] h-7 px-2 rounded-lg gap-1 shadow-xs shrink-0"
                                              title="Promuovi questo corsista ad AI Pro (Corso 2) senza reiscrizione"
                                            >
                                              <Sparkles className="h-3 w-3" />
                                              <span>Upgrade Pro</span>
                                            </Button>
                                          )
                                        }
                                        return null
                                      })()}
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-1.5">
                                      <Button
                                        size="sm"
                                        disabled={isApprovingId === reg.id}
                                        onClick={() => handleApproveRegistration(reg, 'ai-start')}
                                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] h-7 px-2.5 rounded-lg gap-1 shadow-xs"
                                        title="Approva e invia accesso ad AI Start (Corso 1)"
                                      >
                                        {isApprovingId === reg.id ? (
                                          <Loader2 className="h-3 w-3 animate-spin" />
                                        ) : (
                                          <CheckCircle2 className="h-3 w-3" />
                                        )}
                                        <span>Approva Start</span>
                                      </Button>

                                      <Button
                                        size="sm"
                                        disabled={isApprovingId === reg.id}
                                        onClick={() => handleApproveRegistration(reg, 'ai-pro')}
                                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] h-7 px-2.5 rounded-lg gap-1 shadow-xs"
                                        title="Approva direttamente per AI Pro (Corso 2) senza reiscrizione"
                                      >
                                        <Sparkles className="h-3 w-3" />
                                        <span>Approva Pro</span>
                                      </Button>
                                    </div>
                                  )}

                                  <button
                                    onClick={() => handleDeleteRegistration(reg.id, reg.name)}
                                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                    title="Elimina richiesta (Cestina)"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                    </tbody>
                  </table>
                </div>

                {courseRegistrations.length === 0 && (
                  <div className="p-12 text-center text-slate-400 text-xs space-y-2">
                    <ClipboardList className="h-8 w-8 mx-auto text-slate-600" />
                    <p>Nessuna registrazione al momento. Tutte le richieste compilate dalla landing page compariranno qui.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TABELLA 2: STUDENTI ATTIVI ACCREDITATI */}
          {studentSubTab === 'active' && (
            <div className="space-y-4">
              {/* Barra Filtri Rapidi Corso 1 / Corso 2 e Ricerca */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="relative w-full sm:w-80">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={activeSearchQuery}
                    onChange={(e) => setActiveSearchQuery(e.target.value)}
                    placeholder="Cerca studente per nome, email o codice..."
                    className="pl-9 text-xs h-9 bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                  {activeSearchQuery && (
                    <button
                      onClick={() => setActiveSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
                  <button
                    onClick={() => setActiveTierFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTierFilter === 'all'
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                  >
                    Tutti ({registrations.length})
                  </button>

                  <button
                    onClick={() => setActiveTierFilter('ai-start')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${activeTierFilter === 'ai-start'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                  >
                    <span>📘 Corso 1: AI Start</span>
                    <span className="px-1.5 py-0.2 bg-blue-500/30 rounded-full text-[10px] font-bold">
                      {registrations.filter(r => !r.accessTier || r.accessTier === 'ai-start' || r.code.startsWith('AI-START-') || (!r.code.startsWith('AI-PRO-') && !r.code.startsWith('AI-ALL-'))).length}
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTierFilter('ai-pro')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${activeTierFilter === 'ai-pro'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                  >
                    <span>🚀 Corso 2: AI Pro (Agenti)</span>
                    <span className="px-1.5 py-0.2 bg-purple-500/30 rounded-full text-[10px] font-bold">
                      {registrations.filter(r => r.accessTier === 'ai-pro' || r.code.startsWith('AI-PRO-')).length}
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTierFilter('both')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${activeTierFilter === 'both'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                  >
                    <span>🌟 Bundle Completo</span>
                    <span className="px-1.5 py-0.2 bg-amber-500/30 rounded-full text-[10px] font-bold">
                      {registrations.filter(r => r.accessTier === 'both' || r.code.startsWith('AI-ALL-')).length}
                    </span>
                  </button>
                </div>
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
                      {registrations
                        .filter((reg) => {
                          // Filtro di ricerca
                          if (activeSearchQuery.trim()) {
                            const q = activeSearchQuery.toLowerCase()
                            const matchesName = reg.studentName.toLowerCase().includes(q)
                            const matchesEmail = reg.studentEmail.toLowerCase().includes(q)
                            const matchesCode = reg.code.toLowerCase().includes(q)
                            if (!matchesName && !matchesEmail && !matchesCode) return false
                          }
                          // Filtro per Corso
                          const isPro = reg.accessTier === 'ai-pro' || reg.code.startsWith('AI-PRO-')
                          const isBoth = reg.accessTier === 'both' || reg.code.startsWith('AI-ALL-')
                          const isStart = !isPro && !isBoth

                          if (activeTierFilter === 'ai-start') return isStart
                          if (activeTierFilter === 'ai-pro') return isPro
                          if (activeTierFilter === 'both') return isBoth
                          return true
                        })
                        .map((reg) => (
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
                              <div className="flex flex-col gap-1">
                                <span>{reg.courseTitle}</span>
                                <div className="flex items-center gap-1.5">
                                  {reg.accessTier === 'both' ? (
                                    <Badge variant="purple" className="text-[8px] font-mono">🌟 FULL ACCESS (BASE + PRO)</Badge>
                                  ) : reg.accessTier === 'ai-pro' ? (
                                    <Badge variant="purple" className="text-[8px] font-mono">🚀 SOLO AI PRO</Badge>
                                  ) : (
                                    <Badge variant="info" className="text-[8px] font-mono">📘 SOLO AI START</Badge>
                                  )}
                                </div>
                              </div>
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
                              {reg.accessTier !== 'ai-pro' && reg.accessTier !== 'both' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleUpgradeStudent(reg, 'both')}
                                  className="text-xs text-purple-600 hover:text-purple-700 dark:text-purple-400 gap-1 h-7 font-semibold"
                                  title="Promuovi questo studente anche a Corso 2 (AI Pro) senza reiscrizione"
                                >
                                  <Sparkles className="h-3.5 w-3.5" />
                                  Upgrade Pro
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenCertificate(reg.studentName, reg.code)}
                                className="text-xs text-amber-600 hover:text-amber-700 dark:text-amber-400 gap-1 h-7 font-semibold"
                              >
                                <Award className="h-3.5 w-3.5" />
                                Attestato
                              </Button>
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
                                Invia Mail
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

          {/* TABELLA 3: ISCRITTI UFFICIALI CORSO 2 (AI PRO) */}
          {studentSubTab === 'pro_students' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="relative w-full sm:w-80">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={activeSearchQuery}
                    onChange={(e) => setActiveSearchQuery(e.target.value)}
                    placeholder="Cerca studente Pro per nome o email..."
                    className="pl-9 text-xs h-9 bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500">
                    Totale Iscritti Corso 2:{' '}
                    <strong className="text-indigo-600 dark:text-indigo-400">
                      {registrations.filter((r) => r.accessTier === 'ai-pro' || r.accessTier === 'both').length}
                    </strong>
                  </span>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="py-3 px-4">Codice Univoco</th>
                        <th className="py-3 px-4">Nome Studente</th>
                        <th className="py-3 px-4">Email</th>
                        <th className="py-3 px-4">Livello d'Accesso</th>
                        <th className="py-3 px-4">Stato</th>
                        <th className="py-3 px-4 text-right">Azioni</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {registrations
                        .filter((r) => r.accessTier === 'ai-pro' || r.accessTier === 'both')
                        .filter((r) => {
                          if (!activeSearchQuery) return true
                          const q = activeSearchQuery.toLowerCase()
                          return r.studentName.toLowerCase().includes(q) || r.studentEmail.toLowerCase().includes(q) || r.code.toLowerCase().includes(q)
                        })
                        .map((reg) => (
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
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-1.5">
                                {reg.accessTier === 'both' ? (
                                  <Badge variant="purple" className="text-[9px] font-mono">🌟 FULL ACCESS (BASE + PRO)</Badge>
                                ) : (
                                  <Badge variant="purple" className="text-[9px] font-mono">🚀 SOLO AI PRO</Badge>
                                )}
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <Badge variant="success" className="text-[9px] uppercase">
                                Iscritto Ufficiale
                              </Badge>
                            </td>
                            <td className="py-3.5 px-4 text-right flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  sendSharedEmail({
                                    to: reg.studentEmail,
                                    subject: `Accesso Ufficiale AI Pro (Corso 2) - Codice: ${reg.code}`,
                                    body: `Gentile ${reg.studentName},\n\nti confermiamo che il tuo accesso al CORSO 2 (AI Pro - Automazioni & Agenti AI) è ATTIVO!\n\nIl tuo codice di accesso univoco è: ${reg.code}.\n\nAccedi alla piattaforma su https://piattaforma.aiutiamoci.cloud/corsi e inserisci il codice per sbloccare tutti i moduli avanzati.\n\nCordiali saluti,\nTeam Aiutiamoci Cloud`,
                                  })
                                  alert(`Inviata email con codice AI Pro a ${reg.studentEmail}!`)
                                }}
                                className="text-xs text-indigo-600 hover:text-indigo-800 dark:hover:text-indigo-300 gap-1 h-7"
                              >
                                <Mail className="h-3.5 w-3.5" />
                                Invia Mail
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

                {registrations.filter((r) => r.accessTier === 'ai-pro' || r.accessTier === 'both').length === 0 && (
                  <div className="p-10 text-center text-slate-400 text-xs space-y-2">
                    <Sparkles className="h-8 w-8 mx-auto text-indigo-400 opacity-60" />
                    <p className="font-semibold text-slate-300">Nessuno studente iscritto a Corso 2 al momento.</p>
                    <p className="text-slate-500">Puoi approvare le registrazioni come AI Pro o fare l'upgrade immediato dagli studenti di Corso 1.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TABELLA 4: LISTA D'ATTESA AI PRO */}
          {studentSubTab === 'waitlist' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs space-y-4 p-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-purple-600" />
                  Leads Iscritti alla Lista d'Attesa (Landing Page)
                </h4>
                <Button size="sm" variant="outline" onClick={loadWaitlistLeads} className="text-xs h-8">
                  Aggiorna Lista
                </Button>
              </div>

              {waitlistLeads.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Nessun contatto registrato in lista d'attesa al momento.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase">
                      <tr>
                        <th className="py-3 px-4">Email</th>
                        <th className="py-3 px-4">Nome</th>
                        <th className="py-3 px-4">Corso Richiesto</th>
                        <th className="py-3 px-4">Data Iscrizione</th>
                        <th className="py-3 px-4">Stato</th>
                        <th className="py-3 px-4 text-right">Azioni Rapide</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {waitlistLeads.map((lead) => (
                        <tr key={lead.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                            {lead.email}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                            {lead.name || '—'}
                          </td>
                          <td className="py-3.5 px-4 font-medium text-purple-600 dark:text-purple-400">
                            {lead.course_interest}
                          </td>
                          <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                            {new Date(lead.created_at).toLocaleString('it-IT')}
                          </td>
                          <td className="py-3.5 px-4">
                            {lead.converted_to_student ? (
                              <Badge variant="success" className="text-[9px] uppercase font-mono">
                                Sbloccato / Studente
                              </Badge>
                            ) : (
                              <Badge variant="warning" className="text-[9px] uppercase font-mono">
                                ⏳ In Attesa
                              </Badge>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {!lead.converted_to_student ? (
                              <Button
                                size="sm"
                                disabled={isConvertingLeadId === lead.id}
                                onClick={() => handleConvertLead(lead)}
                                className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] h-7 px-3 rounded-lg gap-1.5 shadow-xs"
                              >
                                {isConvertingLeadId === lead.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="h-3 w-3" />
                                )}
                                <span>Converti in Corsista AI Pro</span>
                              </Button>
                            ) : (
                              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                                Già Abilitato ✓
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modal Aggiungi Video Bonus, News & Tutorial */}
      {isAddBonusVideoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Aggiungi Video Bonus / Tutorial</h3>
              </div>
              <button onClick={() => setIsAddBonusVideoModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBonusVideo} className="p-6 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Titolo Video *</label>
                <Input
                  required
                  value={bonusTitleInput}
                  onChange={(e) => setBonusTitleInput(e.target.value)}
                  placeholder="Es. Novità DeepSeek R1 & Tecniche di Prompting"
                  className="dark:bg-slate-800 dark:border-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Categoria *</label>
                  <select
                    value={bonusCategoryInput}
                    onChange={(e) => setBonusCategoryInput(e.target.value as any)}
                    className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-700 px-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="News">News & Novità</option>
                    <option value="Tutorial">Tutorial Pratico</option>
                    <option value="Approfondimento">Approfondimento</option>
                    <option value="Tool AI">Nuovo Tool AI</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Durata stimata</label>
                  <Input
                    value={bonusDurationInput}
                    onChange={(e) => setBonusDurationInput(e.target.value)}
                    placeholder="Es. 15:30"
                    className="dark:bg-slate-800 dark:border-slate-700 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Link Video (MP4 / Stream / URL) *</label>
                <Input
                  required
                  value={bonusUrlInput}
                  onChange={(e) => setBonusUrlInput(e.target.value)}
                  placeholder="https://www.malaradio.com/CorsoAI/...mp4"
                  className="font-mono text-[11px] dark:bg-slate-800 dark:border-slate-700"
                />
                <span className="text-[10px] text-slate-400">Basta inserire il link diretto al video: il player integrato lo riprodurrà all'istante.</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Data Pubblicazione</label>
                  <Input
                    value={bonusDateInput}
                    onChange={(e) => setBonusDateInput(e.target.value)}
                    placeholder="Es. 10/09/2026"
                    className="dark:bg-slate-800 dark:border-slate-700"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Link Risorse Collegate (opzionale)</label>
                  <Input
                    value={bonusResUrlInput}
                    onChange={(e) => setBonusResUrlInput(e.target.value)}
                    placeholder="https://..."
                    className="font-mono text-[11px] dark:bg-slate-800 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Descrizione sintetica (opzionale)</label>
                <textarea
                  value={bonusDescInput}
                  onChange={(e) => setBonusDescInput(e.target.value)}
                  placeholder="Breve spiegazione di cosa mostra il tutorial o la novità..."
                  rows={2}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Button type="button" variant="outline" onClick={() => setIsAddBonusVideoModalOpen(false)}>
                  Annulla
                </Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold gap-2">
                  <Save className="h-4 w-4" />
                  Pubblica Video Bonus
                </Button>
              </div>
            </form>
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
                <label className="font-semibold text-slate-700 dark:text-slate-300">Livello di Accesso Abilitato</label>
                <select
                  value={enrollAccessTier}
                  onChange={(e) => setEnrollAccessTier(e.target.value as any)}
                  className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-700 px-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="ai-start">📘 Solo Corso Base (AI Start - 20 Lezioni)</option>
                  <option value="ai-pro">🚀 Solo Corso Avanzato (AI Pro - Automazioni & Agenti)</option>
                  <option value="both">🌟 Pacchetto Completo (AI Start + AI Pro)</option>
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
                } catch (e) { }
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

      {/* Modal Attestato Ufficiale di Completamento */}
      {isCertificateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-4xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-500" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Attestato Ufficiale di Completamento — {certificateStudentName}
                </h3>
              </div>
              <button onClick={() => setIsCertificateModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {certificateDataUrl ? (
                <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={certificateDataUrl}
                    alt="Attestato di Completamento"
                    className="w-full h-auto object-contain"
                  />
                </div>
              ) : (
                <div className="p-12 text-center text-slate-400">Generazione attestato in corso...</div>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <div className="text-xs text-slate-500 font-mono">
                  Certificato ID: <strong className="text-indigo-600 dark:text-indigo-400">{certificateCode}</strong>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={handleShareLinkedIn}
                    className="text-xs gap-1.5 text-blue-600 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    Condividi su LinkedIn
                  </Button>
                  <Button
                    onClick={handleDownloadCertificate}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs gap-1.5 shadow-xs"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Scarica Certificato PNG
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Quiz @AI di Lezione */}
      {isQuizModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-purple-600" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Quiz Autovalutazione @AI — Lezione {quizTargetLesson.id}
                </h3>
              </div>
              <button onClick={() => setIsQuizModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {isGeneratingQuiz ? (
                <div className="p-12 text-center space-y-3">
                  <Loader2 className="h-8 w-8 text-purple-600 animate-spin mx-auto" />
                  <p className="text-xs text-slate-500 font-medium">Gemini sta creando 3 domande personalizzate per questa lezione...</p>
                </div>
              ) : currentQuizQuestions.length > 0 ? (
                <div className="space-y-6">
                  {currentQuizQuestions.map((q, qIdx) => (
                    <div key={qIdx} className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        {qIdx + 1}. {q.question}
                      </p>

                      <div className="space-y-2">
                        {q.options.map((opt, optIdx) => {
                          const isSelected = quizAnswers[qIdx] === optIdx
                          const isCorrect = q.correctIndex === optIdx
                          let buttonClass = 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'

                          if (quizSubmitted) {
                            if (isCorrect) {
                              buttonClass = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold'
                            } else if (isSelected && !isCorrect) {
                              buttonClass = 'border-red-500 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 font-bold'
                            }
                          } else if (isSelected) {
                            buttonClass = 'border-purple-600 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-semibold'
                          }

                          return (
                            <button
                              key={optIdx}
                              disabled={quizSubmitted}
                              onClick={() => setQuizAnswers({ ...quizAnswers, [qIdx]: optIdx })}
                              className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between ${buttonClass}`}
                            >
                              <span>{opt}</span>
                              {quizSubmitted && isCorrect && <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />}
                              {quizSubmitted && isSelected && !isCorrect && <X className="h-4 w-4 text-red-600 shrink-0" />}
                            </button>
                          )
                        })}
                      </div>

                      {quizSubmitted && (
                        <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-[11px] text-purple-900 dark:text-purple-200">
                          💡 <strong>Spiegazione:</strong> {q.explanation}
                        </div>
                      )}
                    </div>
                  ))}

                  <div className="flex justify-end gap-2 pt-2">
                    {!quizSubmitted ? (
                      <Button
                        disabled={Object.keys(quizAnswers).length < currentQuizQuestions.length}
                        onClick={() => {
                          setQuizSubmitted(true)
                          playNotificationSound('chat')
                        }}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs"
                      >
                        Verifica Risposte
                      </Button>
                    ) : (
                      <Button
                        onClick={() => setIsQuizModalOpen(false)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
                      >
                        Completa e Chiudi
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center text-slate-500 text-xs">Nessuna domanda disponibile per questa lezione.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal 3 Test Checkpoint Obbligatori (Inizio, Metà, Fine) */}
      {isCheckpointModalOpen && activeCheckpointTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh]">
            {/* Header Modal */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 shrink-0">
              <div className="flex items-center gap-2.5">
                <Award className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {activeCheckpointTest.title}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {activeCheckpointTest.subtitle} • Soglia minima: {activeCheckpointTest.passThresholdPercent}%
                  </p>
                </div>
              </div>
              <button onClick={() => setIsCheckpointModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body Domande */}
            <div className="p-6 space-y-5 overflow-y-auto">
              {activeCheckpointTest.questions.map((q, qIdx) => {
                const isAnswered = checkpointAnswers[qIdx] !== undefined
                return (
                  <div key={qIdx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      {qIdx + 1}. {q.question}
                    </p>

                    <div className="space-y-2">
                      {q.options.map((opt, optIdx) => {
                        const isSelected = checkpointAnswers[qIdx] === optIdx
                        const isCorrect = q.correctIndex === optIdx
                        let btnStyle = 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'

                        if (checkpointSubmitted) {
                          if (isCorrect) {
                            btnStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold'
                          } else if (isSelected && !isCorrect) {
                            btnStyle = 'border-red-500 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 font-bold'
                          }
                        } else if (isSelected) {
                          btnStyle = 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-semibold'
                        }

                        return (
                          <button
                            key={optIdx}
                            disabled={checkpointSubmitted}
                            onClick={() => setCheckpointAnswers({ ...checkpointAnswers, [qIdx]: optIdx })}
                            className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between ${btnStyle}`}
                          >
                            <span>{opt}</span>
                            {checkpointSubmitted && isCorrect && <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />}
                            {checkpointSubmitted && isSelected && !isCorrect && <X className="h-4 w-4 text-red-600 shrink-0" />}
                          </button>
                        )
                      })}
                    </div>

                    {checkpointSubmitted && (
                      <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-[11px] text-indigo-900 dark:text-indigo-200">
                        💡 <strong>Spiegazione:</strong> {q.explanation}
                      </div>
                    )}
                  </div>
                )
              })}

              {/* Box Esito del Test */}
              {checkpointSubmitted && (
                <div className="p-4 rounded-2xl border text-center space-y-2 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
                  {(() => {
                    const total = activeCheckpointTest.questions.length
                    let correct = 0
                    activeCheckpointTest.questions.forEach((q, i) => {
                      if (checkpointAnswers[i] === q.correctIndex) correct++
                    })
                    const score = Math.round((correct / total) * 100)
                    const passed = score >= activeCheckpointTest.passThresholdPercent

                    return (
                      <>
                        <div className="text-2xl font-black">
                          {passed ? '🎉 TEST SUPERATO!' : '⚠️ TEST NON SUPERATO'}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300">
                          Punteggio conseguito: <strong>{correct}/{total}</strong> ({score}%) • Soglia minima: {activeCheckpointTest.passThresholdPercent}%
                        </p>
                        {passed ? (
                          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                            Il checkpoint è stato registrato con successo. I moduli collegati sono stati sbloccati!
                          </p>
                        ) : (
                          <p className="text-[11px] text-red-500 font-semibold">
                            Rivedi i concetti delle lezioni e riprova il test per proseguire il percorso.
                          </p>
                        )}
                      </>
                    )
                  })()}
                </div>
              )}
            </div>

            {/* Footer Modal */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 shrink-0">
              <span className="text-[11px] text-slate-500">
                {Object.keys(checkpointAnswers).length} di {activeCheckpointTest.questions.length} risposte selezionate
              </span>
              <div className="flex gap-2">
                {!checkpointSubmitted ? (
                  <Button
                    disabled={Object.keys(checkpointAnswers).length < activeCheckpointTest.questions.length}
                    onClick={handleCompleteCheckpointTest}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-9 px-4"
                  >
                    Valuta Risposte
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setCheckpointAnswers({})
                        setCheckpointSubmitted(false)
                      }}
                      className="text-xs h-9 px-3"
                    >
                      Ripeti Test
                    </Button>
                    <Button
                      onClick={() => setIsCheckpointModalOpen(false)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-9 px-4"
                    >
                      Chiudi e Continua
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Importazione Massiva Studenti */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Importazione Massiva Studenti (CSV / Incolla)
                </h3>
              </div>
              <button onClick={() => setIsBulkModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleBulkImport} className="p-6 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Livello di Accesso per questa Importazione
                </label>
                <select
                  value={bulkAccessTier}
                  onChange={(e) => setBulkAccessTier(e.target.value as any)}
                  className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-700 px-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                >
                  <option value="ai-start">📘 Solo Corso Base (AI Start)</option>
                  <option value="ai-pro">🚀 Solo Corso Avanzato (AI Pro: Automazioni & Agenti)</option>
                  <option value="both">🌟 Pacchetto Completo (AI Start + AI Pro)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Incolla Lista Studenti (1 per riga) *
                </label>
                <p className="text-[11px] text-slate-400">
                  Formato: <code>Nome Cognome, email@dominio.it</code>
                </p>
                <textarea
                  required
                  rows={5}
                  value={bulkInputText}
                  onChange={(e) => setBulkInputText(e.target.value)}
                  placeholder="Mario Rossi, mario.rossi@email.com&#10;Luigi Verdi, luigi.verdi@email.com&#10;Giulia Bianchi, giulia@azienda.it"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="bulkEmailCheckbox"
                  checked={bulkSendEmail}
                  onChange={(e) => setBulkSendEmail(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                />
                <label htmlFor="bulkEmailCheckbox" className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                  Invia subito email di benvenuto con codice univoco via Resend
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsBulkModalOpen(false)}>
                  Annulla
                </Button>
                <Button
                  type="submit"
                  disabled={isBulkImporting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2"
                >
                  {isBulkImporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSpreadsheet className="h-4 w-4" />}
                  {isBulkImporting ? 'Importazione in corso...' : 'Importa e Genera Codici'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* MODAL DETTAGLIATO: LETTURA MANUALE & PROMPT OPERATIVI */}
      {selectedGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-4xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Header Modal */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60 shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="purple" className="text-[9px] uppercase font-mono font-bold">{selectedGuide.badge}</Badge>
                    <span className="text-[11px] text-slate-400 font-medium">{selectedGuide.readTime}</span>
                  </div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white mt-0.5">
                    {selectedGuide.title}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedGuide(null)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body Scorrevole */}
            <div className="p-6 overflow-y-auto space-y-6 text-slate-800 dark:text-slate-200">
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                {selectedGuide.description}
              </p>

              {/* CONFRONTO COMPLETO: PIANO FREE VS PAGAMENTO */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-3">
                  <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                    <h4 className="font-bold text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                      <span>🟢 Cosa Puoi Fare con il Piano GRATUITO</span>
                    </h4>
                    <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full font-bold">Free Tier</span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                    {selectedGuide.freeFeatures.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-5 rounded-2xl bg-purple-500/5 border border-purple-500/20 space-y-3">
                  <div className="flex items-center justify-between border-b border-purple-500/20 pb-2">
                    <h4 className="font-bold text-sm text-purple-600 dark:text-purple-400 flex items-center gap-2">
                      <span>⭐ Vantaggi del Piano a PAGAMENTO (Pro/Plus/Advanced)</span>
                    </h4>
                    <span className="text-[10px] font-mono bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full font-bold">Subscription</span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                    {selectedGuide.paidFeatures.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Sparkles className="h-4 w-4 text-purple-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* GUIDA PASSO-PASSO DI PERSONALIZZAZIONE CON PROMPT COPIABILI */}
              <div className="space-y-4 pt-2">
                <h4 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-indigo-500" />
                  Procedura Passo-Passo per la Massima Personalizzazione
                </h4>

                <div className="space-y-4">
                  {selectedGuide.customizationSteps.map((step, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3">
                      <h5 className="font-bold text-xs sm:text-sm text-indigo-600 dark:text-indigo-400">
                        {step.title}
                      </h5>
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        {step.instruction}
                      </p>

                      {step.promptExample && (
                        <div className="space-y-2 pt-1">
                          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                            <span>Prompt / Configurazione Consigliata:</span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(step.promptExample || '')
                                alert('Prompt copiato negli appunti!')
                              }}
                              className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline font-bold"
                            >
                              <Copy className="h-3 w-3" />
                              <span>Copia Testo</span>
                            </button>
                          </div>
                          <pre className="p-3.5 rounded-xl bg-slate-900 text-slate-200 text-xs font-mono whitespace-pre-wrap leading-relaxed border border-slate-800">
                            {step.promptExample}
                          </pre>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* CONSIGLI OPERATIVI BEST PRACTICE */}
              <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/40 space-y-2">
                <h5 className="font-bold text-xs uppercase tracking-wider text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  Best Practice & Impostazioni Consigliate per Professionisti
                </h5>
                <ul className="space-y-1.5 text-xs text-indigo-900 dark:text-indigo-200">
                  {selectedGuide.recommendedSettings.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-indigo-500 font-bold">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60 shrink-0">
              <span className="text-xs text-slate-400">Piattaforma Corsi Aiutiamoci • Manuale Operativo</span>
              <Button
                onClick={() => setSelectedGuide(null)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-9 px-5 rounded-xl"
              >
                Chiudi Manuale
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* MODAL GUIDA RAPIDA & ISTRUZIONI PIATTAFORMA STUDENTE */}
      {isHelpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header Modal */}
            <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-indigo-950/50 via-slate-900/80 to-purple-950/50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <HelpCircle className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="purple" className="text-[10px] uppercase font-mono px-2 py-0.5">
                      🎓 Guida Corsista
                    </Badge>
                    <span className="text-xs text-amber-400 font-semibold font-mono">Masterclass AIutiamoci</span>
                  </div>
                  <h3 className="font-bold text-base sm:text-lg text-white">
                    Istruzioni & Funzioni della Piattaforma
                  </h3>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setIsHelpModalOpen(false)
                  try {
                    localStorage.setItem('ti_aiuto_has_seen_help_guide_v1', 'true')
                  } catch (e) {}
                }}
                className="h-8 w-8 rounded-full text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Contenuto Istruzioni Step by Step */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs text-slate-600 dark:text-slate-300">
              {/* Box Benvenuto */}
              <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 flex items-start gap-3.5">
                <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <div className="space-y-1 text-slate-900 dark:text-slate-200">
                  <h4 className="font-extrabold text-xs sm:text-sm">Come seguire il corso in 4 semplici passi:</h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    Tutto il percorso è strutturato per darti il massimo della concretezza con 20 video Full HD, checkpoint obbligatori e compiti pratici.
                  </p>
                </div>
              </div>

              {/* Guida alle sezioni e ai pulsanti */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Step 1: Video Player & Lezioni */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                      1
                    </div>
                    <h5 className="font-bold text-slate-900 dark:text-white text-xs">🎬 Player Video & Moduli</h5>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Guarda i video in ordine. A destra trovi la scaletta di tutte le 20 lezioni con durate e dispense PDF allegate per ogni modulo.
                  </p>
                </div>

                {/* Step 2: Checkpoint & Test */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                      2
                    </div>
                    <h5 className="font-bold text-slate-900 dark:text-white text-xs">🏁 3 Checkpoint Obbligatori</h5>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Sotto il video trovi i 3 test: <strong>Test Ingresso (Mod 1)</strong>, <strong>Test Metà Corso (Mod 10)</strong> ed <strong>Esame Finale (Mod 20)</strong> per sbloccare l'attestato ufficiale.
                  </p>
                </div>

                {/* Step 3: Tutor AI */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                      3
                    </div>
                    <h5 className="font-bold text-slate-900 dark:text-white text-xs">🤖 Assistente @AI & Telegram</h5>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Nella colonna a destra puoi chattare in diretta con l'assistente @AI o usare il bot h24 su Telegram per dubbi sui prompt e casi reali.
                  </p>
                </div>

                {/* Step 4: Compiti & Attestato */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs">
                      4
                    </div>
                    <h5 className="font-bold text-slate-900 dark:text-white text-xs">🎓 Compiti & Attestato</h5>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Nel tab <strong>I Miei Compiti & Attestato</strong> puoi inviare le tue consegne pratiche e scaricare il certificato nominale ad alta risoluzione.
                  </p>
                </div>
              </div>

              {/* Spiegazione Tasti Chiave */}
              <div className="space-y-2 p-4 rounded-2xl bg-slate-900 text-white border border-slate-800">
                <h5 className="font-bold text-xs uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Key className="h-3.5 w-3.5" />
                  Funzioni dei Tasti Principali:
                </h5>
                <ul className="space-y-2 text-[11px] text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong className="text-white">Segna Completata:</strong> Salva i tuoi progressi e aggiorna la barra di completamento.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-indigo-400 shrink-0 mt-0.5" />
                    <span><strong className="text-white">Quiz di Modulo:</strong> Genera un rapido quiz interattivo creato dall'AI per testare quello che hai appena appreso.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Download className="h-3.5 w-3.5 text-purple-400 shrink-0 mt-0.5" />
                    <span><strong className="text-white">Dispensa PDF:</strong> Scarica la guida rapida e i prompt pronti della lezione attiva.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <HelpCircle className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span><strong className="text-white">Guida & Istruzioni (in alto a destra):</strong> Puoi riaprire questa finestra in qualsiasi momento quando ne hai bisogno.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60 shrink-0">
              <span className="text-[11px] text-slate-400">Masterclass AI • Aiutiamoci.cloud</span>
              <Button
                onClick={() => {
                  setIsHelpModalOpen(false)
                  try {
                    localStorage.setItem('ti_aiuto_has_seen_help_guide_v1', 'true')
                  } catch (e) {}
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-9 px-6 rounded-xl shadow-xs"
              >
                Ho Capito, Inizia il Corso 🚀
              </Button>
            </div>
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
