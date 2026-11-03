'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  Users,
  Search,
  Plus,
  Mail,
  Phone,
  Building,
  MapPin,
  Sparkles,
  GraduationCap,
  Briefcase,
  ExternalLink,
  Edit2,
  Trash2,
  Share2,
  CheckCircle2,
  X,
  Copy,
  Check,
  Send,
  Filter,
  Download,
  Upload,
  Layers,
  TrendingUp,
  Trophy,
  ArrowLeft,
  ArrowRight,
  Kanban,
  List,
  MessageSquare,
  Euro,
  Flame,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { playNotificationSound } from '@/lib/notifications'

type PipelineStage = 'nuovo_lead' | 'call_fissata' | 'preventivo' | 'vinto'

interface PipelineColumnDef {
  id: PipelineStage
  title: string
  subtitle: string
  badgeColor: string
  borderColor: string
  accentColor: string
  headerBg: string
}

const PIPELINE_COLUMNS: PipelineColumnDef[] = [
  {
    id: 'nuovo_lead',
    title: 'Nuovo Lead',
    subtitle: 'Da qualificare',
    badgeColor: 'bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-500/20',
    borderColor: 'border-slate-200 dark:border-slate-800',
    accentColor: 'bg-slate-500',
    headerBg: 'bg-slate-100/70 dark:bg-slate-800/60',
  },
  {
    id: 'call_fissata',
    title: 'Call Fissata',
    subtitle: 'Discovery / Demo',
    badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    borderColor: 'border-amber-200 dark:border-amber-900/40',
    accentColor: 'bg-amber-500',
    headerBg: 'bg-amber-500/5 dark:bg-amber-500/10',
  },
  {
    id: 'preventivo',
    title: 'Proposta / Preventivo',
    subtitle: 'Offerta inviata',
    badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    borderColor: 'border-indigo-200 dark:border-indigo-900/40',
    accentColor: 'bg-indigo-500',
    headerBg: 'bg-indigo-500/5 dark:bg-indigo-500/10',
  },
  {
    id: 'vinto',
    title: 'Cliente Vinto',
    subtitle: 'Accordo chiuso',
    badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    borderColor: 'border-emerald-200 dark:border-emerald-900/40',
    accentColor: 'bg-emerald-500',
    headerBg: 'bg-emerald-500/5 dark:bg-emerald-500/10',
  },
]

interface ClientRecord {
  id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  company?: string
  category: 'academy' | 'business' | 'partner' | 'lead'
  address?: string
  city?: string
  province?: string
  postal_code?: string
  notes?: string
  status: 'active' | 'prospect' | 'inactive'
  created_at?: string
  updated_at?: string
}

// Parser del tag trasparente: [STAGE:<stage>|VAL:<dealValue>]
function parseClientMeta(client: ClientRecord): {
  stage: PipelineStage
  dealValue: number
  cleanNotes: string
} {
  const rawNotes = client.notes || ''
  const match = rawNotes.match(/^\[STAGE:([a-z_]+)\|VAL:([0-9.]+)\]\s*/i)
  if (match) {
    const parsedStage = match[1] as PipelineStage
    const validStages: PipelineStage[] = ['nuovo_lead', 'call_fissata', 'preventivo', 'vinto']
    const stage = validStages.includes(parsedStage) ? parsedStage : 'nuovo_lead'
    const dealValue = parseFloat(match[2]) || 0
    const cleanNotes = rawNotes.replace(match[0], '').trim()
    return { stage, dealValue, cleanNotes }
  }

  // Fallback per contatti storici
  let defaultStage: PipelineStage = 'nuovo_lead'
  if (client.status === 'active') defaultStage = 'vinto'
  else if (client.category === 'lead' || client.status === 'prospect') defaultStage = 'nuovo_lead'

  let defaultVal = 0
  if (client.category === 'academy') defaultVal = 199
  else if (client.category === 'business') defaultVal = 1500

  return {
    stage: defaultStage,
    dealValue: defaultVal,
    cleanNotes: rawNotes.trim(),
  }
}

function serializeNotesWithMeta(
  stage: PipelineStage,
  dealValue: number,
  cleanNotes: string
): string {
  const tag = `[STAGE:${stage}|VAL:${dealValue || 0}]`
  const trimmed = (cleanNotes || '').trim()
  return trimmed ? `${tag}\n${trimmed}` : tag
}

export default function ClientiRubricaPage() {
  const [clients, setClients] = useState<ClientRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban')
  
  // Modal State (Creazione / Modifica)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<ClientRecord | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Form fields
  const [formFirstName, setFormFirstName] = useState('')
  const [formLastName, setFormLastName] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formCompany, setFormCompany] = useState('')
  const [formCategory, setFormCategory] = useState<'academy' | 'business' | 'partner' | 'lead'>('academy')
  const [formAddress, setFormAddress] = useState('')
  const [formCity, setFormCity] = useState('')
  const [formProvince, setFormProvince] = useState('')
  const [formNotes, setFormNotes] = useState('')
  const [formStatus, setFormStatus] = useState<'active' | 'prospect' | 'inactive'>('active')
  const [formStage, setFormStage] = useState<PipelineStage>('nuovo_lead')
  const [formDealValue, setFormDealValue] = useState<string | number>(199)

  const supabase = createClient()

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Errore fetch clienti:', error)
      } else if (data) {
        setClients(data as ClientRecord[])
      }
    } catch (err) {
      console.error('Errore imprevisto fetch clienti:', err)
    } finally {
      setLoading(false)
    }
  }

  // KPI Commerciali Aggregati
  const kpiData = useMemo(() => {
    let pipelineTotal = 0
    let wonTotal = 0
    let hotDealsCount = 0

    clients.forEach((c) => {
      const meta = parseClientMeta(c)
      if (meta.stage === 'vinto') {
        wonTotal += meta.dealValue
      } else {
        pipelineTotal += meta.dealValue
        if (meta.stage === 'call_fissata' || meta.stage === 'preventivo') {
          hotDealsCount += 1
        }
      }
    })

    return { pipelineTotal, wonTotal, hotDealsCount }
  }, [clients])

  const handleMoveStage = async (client: ClientRecord, targetStage: PipelineStage) => {
    const meta = parseClientMeta(client)
    const newNotes = serializeNotesWithMeta(targetStage, meta.dealValue, meta.cleanNotes)
    const newStatus = targetStage === 'vinto' ? 'active' : 'prospect'

    // Aggiornamento ottimistico stato locale
    setClients((prev) =>
      prev.map((c) => (c.id === client.id ? { ...c, notes: newNotes, status: newStatus } : c))
    )

    try {
      const { error } = await (supabase.from('clients') as any)
        .update({ notes: newNotes, status: newStatus })
        .eq('id', client.id)

      if (error) {
        console.error('Errore update stage:', error)
        fetchClients()
      } else {
        playNotificationSound('chat')
      }
    } catch (err) {
      console.error('Errore imprevisto update stage:', err)
      fetchClients()
    }
  }

  const openWhatsApp = (phone?: string, name?: string) => {
    if (!phone) return
    const cleanPhone = phone.replace(/[^0-9+]/g, '')
    const firstName = name ? name.split(' ')[0] : 'Ciao'
    const defaultText = encodeURIComponent(`Ciao ${firstName}, ti contatto da Aiutiamoci per il tuo percorso con noi.`)
    window.open(`https://wa.me/${cleanPhone}?text=${defaultText}`, '_blank')
  }

  const openCreateModal = () => {
    setEditingClient(null)
    setFormFirstName('')
    setFormLastName('')
    setFormEmail('')
    setFormPhone('')
    setFormCompany('')
    setFormCategory('academy')
    setFormAddress('')
    setFormCity('')
    setFormProvince('')
    setFormNotes('')
    setFormStatus('active')
    setFormStage('nuovo_lead')
    setFormDealValue(199)
    setIsModalOpen(true)
  }

  const openEditModal = (client: ClientRecord) => {
    const meta = parseClientMeta(client)
    setEditingClient(client)
    setFormFirstName(client.first_name || '')
    setFormLastName(client.last_name || '')
    setFormEmail(client.email || '')
    setFormPhone(client.phone || '')
    setFormCompany(client.company || '')
    setFormCategory(client.category || 'academy')
    setFormAddress(client.address || '')
    setFormCity(client.city || '')
    setFormProvince(client.province || '')
    setFormNotes(meta.cleanNotes)
    setFormStatus(client.status || 'active')
    setFormStage(meta.stage)
    setFormDealValue(meta.dealValue)
    setIsModalOpen(true)
  }

  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formEmail.trim()) {
      alert('Inserisci un indirizzo email valido.')
      return
    }

    setIsSaving(true)
    try {
      const valNum = Number(formDealValue) || 0
      const serializedNotes = serializeNotesWithMeta(formStage, valNum, formNotes.trim())
      const calculatedStatus: 'active' | 'prospect' = formStage === 'vinto' ? 'active' : 'prospect'

      const clientPayload: Omit<ClientRecord, 'id' | 'created_at' | 'updated_at'> = {
        first_name: formFirstName.trim(),
        last_name: formLastName.trim(),
        email: formEmail.trim().toLowerCase(),
        phone: formPhone.trim(),
        company: formCompany.trim(),
        category: formCategory,
        address: formAddress.trim(),
        city: formCity.trim(),
        province: formProvince.trim().toUpperCase(),
        notes: serializedNotes,
        status: calculatedStatus,
      }

      if (editingClient) {
        // Aggiorna
        const { error } = await (supabase
          .from('clients') as any)
          .update(clientPayload)
          .eq('id', editingClient.id)

        if (error) throw error

        setClients(clients.map((c) => (c.id === editingClient.id ? { ...c, ...clientPayload } : c)))
        playNotificationSound('chat')
      } else {
        // Inserisci nuovo
        const { data, error } = await (supabase
          .from('clients') as any)
          .insert([clientPayload])
          .select()
          .single()

        if (error) throw error

        if (data) {
          setClients([data as ClientRecord, ...clients])
        }
        playNotificationSound('chat')
      }

      setIsModalOpen(false)
    } catch (err: any) {
      console.error('Errore salvataggio contatto:', err)
      alert(`Errore salvataggio: ${err.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteClient = async (id: string, name: string) => {
    if (!confirm(`Sei sicuro di voler eliminare il contatto "${name}" dalla rubrica?`)) return

    try {
      const { error } = await supabase.from('clients').delete().eq('id', id)
      if (error) throw error
      setClients(clients.filter((c) => c.id !== id))
    } catch (err: any) {
      alert(`Errore eliminazione: ${err.message}`)
    }
  }

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email)
    setCopiedEmail(email)
    setTimeout(() => setCopiedEmail(null), 2000)
  }

  // Filtro di ricerca globale (su Nome, Cognome, Email, Azienda, Città, Note)
  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      const q = searchQuery.toLowerCase().trim()
      const matchSearch =
        !q ||
        (c.first_name && c.first_name.toLowerCase().includes(q)) ||
        (c.last_name && c.last_name.toLowerCase().includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.company && c.company.toLowerCase().includes(q)) ||
        (c.city && c.city.toLowerCase().includes(q)) ||
        (c.notes && c.notes.toLowerCase().includes(q)) ||
        (c.phone && c.phone.toLowerCase().includes(q))

      const matchCategory =
        selectedCategory === 'all' || c.category === selectedCategory

      return matchSearch && matchCategory
    })
  }, [clients, searchQuery, selectedCategory])

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'academy':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <GraduationCap className="h-3 w-3" />
            Academy / Corsista
          </span>
        )
      case 'business':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
            <Briefcase className="h-3 w-3" />
            Business / PMI
          </span>
        )
      case 'partner':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <Sparkles className="h-3 w-3" />
            Partner / Fornitore
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
            Lead / Contatto
          </span>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Header con Titolo & Switcher Vista */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            Rubrica Clienti & Pipeline Vendite
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            CRM commerciale integrato: gestisci opportunità in trattativa, chiusure e anagrafica contatti.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Switcher Vista */}
          <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Kanban className="h-3.5 w-3.5" />
              <span>Pipeline Vendite</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <List className="h-3.5 w-3.5" />
              <span>Lista Contatti</span>
            </button>
          </div>

          <Button
            onClick={openCreateModal}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 shadow-xs text-xs font-semibold h-10 px-4 rounded-xl cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Nuovo Contatto</span>
          </Button>
        </div>
      </div>

      {/* 3 KPI Cards Commerciali */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* KPI 1: Pipeline in Trattativa */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
              Pipeline in Trattativa
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1 font-mono">
              {kpiData.pipelineTotal.toLocaleString('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block">
              Valore totale opportunità aperte
            </span>
          </div>
          <div className="h-11 w-11 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>

        {/* KPI 2: Fatturato Acquisito */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
              Fatturato Chiuso (Vinto)
            </span>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
              {kpiData.wonTotal.toLocaleString('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block">
              Accordi conclusi e incassati
            </span>
          </div>
          <div className="h-11 w-11 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
            <Trophy className="h-5 w-5" />
          </div>
        </div>

        {/* KPI 3: Trattative & Call Calde */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
              Call & Proposte Calde
            </span>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 font-mono">
              {kpiData.hotDealsCount} <span className="text-xs font-semibold text-slate-400">attive</span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block">
              Fase avanzata (Demo & Offerte)
            </span>
          </div>
          <div className="h-11 w-11 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
            <Flame className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Barra di Ricerca Globale & Filtri Categorie */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Input Ricerca Globale */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cerca per Nome, Cognome, Email, Azienda, Città o Note..."
              className="pl-10 h-11 text-xs bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 rounded-xl focus:ring-2 focus:ring-blue-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Chips Categorie */}
          <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {[
              { id: 'all', label: `Tutti (${clients.length})` },
              { id: 'academy', label: `🎓 Academy (${clients.filter((c) => c.category === 'academy').length})` },
              { id: 'business', label: `💼 Business (${clients.filter((c) => c.category === 'business').length})` },
              { id: 'partner', label: `🤝 Partner (${clients.filter((c) => c.category === 'partner').length})` },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Selettore Contenuto: Kanban Pipeline vs Tabella Anagrafica */}
      {loading ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-16 text-center text-xs text-slate-400">
          Caricamento dati CRM in corso...
        </div>
      ) : viewMode === 'kanban' ? (
        /* VISTA KANBAN A 4 COLONNE COMMERCIALI */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
          {PIPELINE_COLUMNS.map((col, colIdx) => {
            const colClients = filteredClients.filter((c) => parseClientMeta(c).stage === col.id)
            const colTotalValue = colClients.reduce((sum, c) => sum + parseClientMeta(c).dealValue, 0)

            return (
              <div
                key={col.id}
                className={`flex flex-col rounded-2xl border ${col.borderColor} bg-slate-50/50 dark:bg-slate-900/60 overflow-hidden shadow-2xs`}
              >
                {/* Header Colonna */}
                <div className={`p-3.5 border-b ${col.borderColor} ${col.headerBg}`}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${col.accentColor}`} />
                      <h3 className="font-bold text-xs text-slate-900 dark:text-white">
                        {col.title}
                      </h3>
                    </div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-2xs">
                      {colClients.length}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-800/60 text-slate-500 dark:text-slate-400">
                    <span>{col.subtitle}</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      {colTotalValue.toLocaleString('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>

                {/* Lista Schede Contatto */}
                <div className="p-3 space-y-3 min-h-[420px] max-h-[calc(100vh-320px)] overflow-y-auto">
                  {colClients.length === 0 ? (
                    <div className="p-8 text-center text-[11px] text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                      Nessun contatto in questa fase
                    </div>
                  ) : (
                    colClients.map((client) => {
                      const meta = parseClientMeta(client)
                      const fullName = `${client.first_name || ''} ${client.last_name || ''}`.trim() || 'Contatto senza nome'

                      return (
                        <div
                          key={client.id}
                          className="bg-white dark:bg-slate-900 rounded-xl p-3.5 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-blue-400/60 dark:hover:border-blue-500/40 transition-all space-y-2.5"
                        >
                          {/* Top: Nome e Categoria */}
                          <div className="flex items-start justify-between gap-2">
                            <button
                              type="button"
                              onClick={() => openEditModal(client)}
                              className="font-bold text-xs text-left text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-1 cursor-pointer"
                              title="Modifica contatto"
                            >
                              {fullName}
                            </button>
                            <span className="shrink-0">{getCategoryBadge(client.category)}</span>
                          </div>

                          {/* Azienda & Città */}
                          {(client.company || client.city) && (
                            <div className="space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                              {client.company && (
                                <div className="flex items-center gap-1.5 line-clamp-1">
                                  <Building className="h-3 w-3 text-slate-400 shrink-0" />
                                  <span className="font-medium text-slate-700 dark:text-slate-300">
                                    {client.company}
                                  </span>
                                </div>
                              )}
                              {client.city && (
                                <div className="flex items-center gap-1.5">
                                  <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                                  <span>{client.city} {client.province ? `(${client.province})` : ''}</span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Valore Opportunità & Note Pulite */}
                          <div className="flex items-center justify-between pt-1">
                            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-[11px] font-mono font-bold">
                              <Euro className="h-3 w-3" />
                              <span>{meta.dealValue.toLocaleString('it-IT')} €</span>
                            </div>

                            {client.email && (
                              <button
                                type="button"
                                onClick={() => handleCopyEmail(client.email)}
                                className="text-slate-400 hover:text-blue-600 transition-colors p-1 rounded cursor-pointer"
                                title={`Copia email: ${client.email}`}
                              >
                                {copiedEmail === client.email ? (
                                  <Check className="h-3 w-3 text-emerald-500" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </button>
                            )}
                          </div>

                          {meta.cleanNotes && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 italic bg-slate-50 dark:bg-slate-800/40 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                              "{meta.cleanNotes}"
                            </p>
                          )}

                          {/* Footer Card: WhatsApp 1-Click & Spostamento Fasi */}
                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 gap-1.5">
                            {/* Tasto Verde WhatsApp 1-Click */}
                            {client.phone ? (
                              <button
                                type="button"
                                onClick={() => openWhatsApp(client.phone, fullName)}
                                className="h-7 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                                title={`Apri WhatsApp con ${fullName}`}
                              >
                                <Share2 className="h-3 w-3" />
                                <span>WhatsApp</span>
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-300 dark:text-slate-600 italic">
                                No tel
                              </span>
                            )}

                            {/* Frecce Rapide Cambio Fase */}
                            <div className="flex items-center gap-1">
                              {colIdx > 0 && (
                                <button
                                  type="button"
                                  onClick={() => handleMoveStage(client, PIPELINE_COLUMNS[colIdx - 1].id)}
                                  className="h-7 w-7 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-all cursor-pointer"
                                  title={`Arretra a: ${PIPELINE_COLUMNS[colIdx - 1].title}`}
                                >
                                  <ArrowLeft className="h-3.5 w-3.5" />
                                </button>
                              )}

                              {colIdx < PIPELINE_COLUMNS.length - 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleMoveStage(client, PIPELINE_COLUMNS[colIdx + 1].id)}
                                  className="h-7 w-7 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-all cursor-pointer"
                                  title={`Avanza a: ${PIPELINE_COLUMNS[colIdx + 1].title}`}
                                >
                                  <ArrowRight className="h-3.5 w-3.5" />
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => openEditModal(client)}
                                className="h-7 w-7 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-all cursor-pointer ml-1"
                                title="Modifica"
                              >
                                <Edit2 className="h-3 w-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteClient(client.id, fullName)}
                                className="h-7 w-7 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center justify-center transition-all cursor-pointer"
                                title="Elimina"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* VISTA TABELLA ANAGRAFICA ARRICCHITA */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          {filteredClients.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Contatto / Nome</th>
                    <th className="py-3 px-4">Azienda & Ruolo</th>
                    <th className="py-3 px-4">Email & Recapiti</th>
                    <th className="py-3 px-4">Fase Pipeline & Valore</th>
                    <th className="py-3 px-4">Categoria</th>
                    <th className="py-3 px-4">Città / Sede</th>
                    <th className="py-3 px-4 text-right">Azioni Rapide</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredClients.map((client) => {
                    const meta = parseClientMeta(client)
                    const fullName = `${client.first_name || ''} ${client.last_name || ''}`.trim() || 'Contatto senza nome'
                    const stageCol = PIPELINE_COLUMNS.find((col) => col.id === meta.stage) || PIPELINE_COLUMNS[0]

                    return (
                      <tr
                        key={client.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                      >
                        {/* Nome */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                              {client.first_name ? client.first_name[0] : (client.company ? client.company[0] : 'C')}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 dark:text-white block text-[13px]">
                                {fullName}
                              </span>
                              {meta.cleanNotes && (
                                <span className="text-[11px] text-slate-400 line-clamp-1 max-w-[200px]">
                                  {meta.cleanNotes}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Azienda */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
                            <Building className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span>{client.company || '—'}</span>
                          </div>
                        </td>

                        {/* Email & Telefono */}
                        <td className="py-3 px-4 space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-slate-800 dark:text-slate-200 font-medium select-all">
                              {client.email}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyEmail(client.email)}
                              className="text-slate-400 hover:text-blue-600 transition-colors p-0.5 rounded cursor-pointer"
                              title="Copia Email"
                            >
                              {copiedEmail === client.email ? (
                                <Check className="h-3 w-3 text-emerald-500" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </button>
                          </div>
                          {client.phone && (
                            <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                              <Phone className="h-3 w-3 text-slate-400" />
                              <span>{client.phone}</span>
                            </div>
                          )}
                        </td>

                        {/* Fase Pipeline & Valore */}
                        <td className="py-3 px-4 space-y-1">
                          <div>
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border ${stageCol.badgeColor}`}>
                              {stageCol.title}
                            </span>
                          </div>
                          <div className="text-[11px] font-mono font-bold text-slate-900 dark:text-white">
                            {meta.dealValue.toLocaleString('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
                          </div>
                        </td>

                        {/* Categoria */}
                        <td className="py-3 px-4">
                          {getCategoryBadge(client.category)}
                        </td>

                        {/* Città */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 text-[11px]">
                            {client.city ? (
                              <>
                                <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                <span>
                                  {client.city} {client.province ? `(${client.province})` : ''}
                                </span>
                              </>
                            ) : (
                              <span className="text-slate-300 dark:text-slate-600">—</span>
                            )}
                          </div>
                        </td>

                        {/* Azioni Rapide */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* WhatsApp 1-Click */}
                            {client.phone && (
                              <button
                                type="button"
                                onClick={() => openWhatsApp(client.phone, fullName)}
                                className="h-8 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                                title="Apri WhatsApp con messaggio pronto"
                              >
                                <Share2 className="h-3.5 w-3.5" />
                                <span>WhatsApp</span>
                              </button>
                            )}

                            {/* Copia Rapida Email */}
                            <button
                              type="button"
                              onClick={() => handleCopyEmail(client.email)}
                              className={`h-8 px-2.5 rounded-lg border font-semibold text-[11px] flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                                copiedEmail === client.email
                                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-500 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400'
                              }`}
                              title="Copia indirizzo email"
                            >
                              {copiedEmail === client.email ? (
                                <>
                                  <Check className="h-3.5 w-3.5 text-white" />
                                  <span>Copiata!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3.5 w-3.5 text-slate-400" />
                                  <span>Copia Email</span>
                                </>
                              )}
                            </button>

                            {/* Modifica */}
                            <button
                              type="button"
                              onClick={() => openEditModal(client)}
                              className="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-all cursor-pointer"
                              title="Modifica Contatto"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>

                            {/* Elimina */}
                            <button
                              type="button"
                              onClick={() => handleDeleteClient(client.id, fullName)}
                              className="h-8 w-8 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center justify-center transition-all cursor-pointer"
                              title="Elimina Contatto"
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
          ) : (
            <div className="p-16 text-center space-y-3">
              <Users className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto" />
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                Nessun contatto trovato
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Nessun cliente corrisponde ai criteri di ricerca. Prova a modificare i filtri o aggiungi una nuova anagrafica.
              </p>
              <Button size="sm" onClick={openCreateModal} className="text-xs bg-blue-600 hover:bg-blue-700 text-white mt-2">
                <Plus className="h-3.5 w-3.5 mr-1" /> Aggiungi Contatto
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Modal Aggiungi / Modifica Contatto */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false)
          }}
        >
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header Fisso */}
            <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/80 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {editingClient ? 'Modifica Anagrafica & Pipeline' : 'Nuovo Contatto in Pipeline'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Dati anagrafici, fase commerciale e valore opportunità
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsModalOpen(false)}
                className="h-8 w-8 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Form Body Scrollabile */}
            <form onSubmit={handleSaveClient} className="p-5 space-y-4 text-xs overflow-y-auto flex-1">
              {/* Box Commerciale: Fase & Valore Deal */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40">
                <div className="space-y-1.5">
                  <label className="font-semibold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                    <Kanban className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                    Fase Commerciale
                  </label>
                  <select
                    value={formStage}
                    onChange={(e: any) => setFormStage(e.target.value)}
                    className="w-full h-9 rounded-md border border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-900 px-3 text-xs font-medium"
                  >
                    <option value="nuovo_lead">🎯 Nuovo Lead</option>
                    <option value="call_fissata">📞 Call Fissata</option>
                    <option value="preventivo">📄 Proposta / Preventivo</option>
                    <option value="vinto">🏆 Cliente Vinto</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                    <Euro className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    Valore Deal (€)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="10"
                    value={formDealValue}
                    onChange={(e) => setFormDealValue(e.target.value)}
                    placeholder="Es. 1500"
                    className="text-xs bg-white dark:bg-slate-900 dark:border-blue-800 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Nome</label>
                  <Input
                    value={formFirstName}
                    onChange={(e) => setFormFirstName(e.target.value)}
                    placeholder="Es. Mario"
                    className="text-xs dark:bg-slate-800 dark:border-slate-700"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Cognome</label>
                  <Input
                    value={formLastName}
                    onChange={(e) => setFormLastName(e.target.value)}
                    placeholder="Es. Rossi"
                    className="text-xs dark:bg-slate-800 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Email *</label>
                  <Input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="mario.rossi@azienda.it"
                    className="text-xs dark:bg-slate-800 dark:border-slate-700"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Telefono / Cellulare</label>
                  <Input
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+39 340 1234567"
                    className="text-xs dark:bg-slate-800 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Azienda / Società</label>
                  <Input
                    value={formCompany}
                    onChange={(e) => setFormCompany(e.target.value)}
                    placeholder="Es. Acme S.r.l."
                    className="text-xs dark:bg-slate-800 dark:border-slate-700"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Categoria</label>
                  <select
                    value={formCategory}
                    onChange={(e: any) => setFormCategory(e.target.value)}
                    className="w-full h-9 rounded-md border border-slate-200 dark:border-slate-700 bg-background dark:bg-slate-800 px-3 text-xs"
                  >
                    <option value="academy">🎓 Academy / Corsista</option>
                    <option value="business">💼 Business / Cliente PMI</option>
                    <option value="partner">🤝 Partner / Fornitore</option>
                    <option value="lead">📋 Lead / Contatto</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Indirizzo</label>
                  <Input
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
                    placeholder="Via Roma 12"
                    className="text-xs dark:bg-slate-800 dark:border-slate-700"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Città</label>
                  <Input
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    placeholder="Milano"
                    className="text-xs dark:bg-slate-800 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Note & Dettagli</label>
                <textarea
                  rows={3}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Informazioni aggiuntive, accordi commerciali..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                  className="text-xs cursor-pointer"
                >
                  Annulla
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs h-9 px-4 cursor-pointer shadow-xs"
                >
                  {isSaving ? 'Salvataggio...' : editingClient ? 'Salva Modifiche' : 'Crea Contatto'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
