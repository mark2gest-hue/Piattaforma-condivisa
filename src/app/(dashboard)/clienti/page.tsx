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
  Edit2,
  Trash2,
  Share2,
  X,
  Copy,
  Check,
  Kanban,
  List,
  Euro,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { playNotificationSound } from '@/lib/notifications'

type PipelineStage = 'nuovo_lead' | 'call_fissata' | 'preventivo' | 'vinto'

interface PipelineColumnDef {
  id: PipelineStage
  title: string
  shortTitle: string
  subtitle: string
  badgeColor: string
  accentColor: string
}

const PIPELINE_COLUMNS: PipelineColumnDef[] = [
  {
    id: 'nuovo_lead',
    title: 'Nuovo Lead',
    shortTitle: 'Lead',
    subtitle: 'Da qualificare',
    badgeColor:
      'bg-zinc-500/10 text-zinc-600 dark:text-zinc-300 border-zinc-500/20 dark:border-white/[0.1]',
    accentColor: 'bg-zinc-500',
  },
  {
    id: 'call_fissata',
    title: 'Call Fissata',
    shortTitle: 'Call',
    subtitle: 'Discovery / Demo',
    badgeColor:
      'bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/20 dark:border-amber-500/25',
    accentColor: 'bg-amber-500',
  },
  {
    id: 'preventivo',
    title: 'Proposta / Preventivo',
    shortTitle: 'Preventivo',
    subtitle: 'Offerta inviata',
    badgeColor:
      'bg-[#6366f1]/10 text-[#6366f1] border-[#6366f1]/25',
    accentColor: 'bg-[#6366f1]',
  },
  {
    id: 'vinto',
    title: 'Cliente Vinto',
    shortTitle: 'Vinto',
    subtitle: 'Accordo chiuso',
    badgeColor:
      'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20 dark:border-emerald-500/25',
    accentColor: 'bg-[#10b981]',
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

  // Right Inspector State
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)

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

  const [isAdmin, setIsAdmin] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchClients()
    const checkRole = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) return
        const { data: profile } = await (supabase.from('profiles') as any)
          .select('role')
          .eq('id', user.id)
          .single()
        const role = profile?.role || user.user_metadata?.role
        setIsAdmin(role === 'admin' || role === 'dev')
      } catch {}
    }
    checkRole()
  }, [])

  // Escape chiude Right Inspector
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedClientId && !isModalOpen) {
        setSelectedClientId(null)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [selectedClientId, isModalOpen])

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
    const defaultText = encodeURIComponent(
      `Ciao ${firstName}, ti contatto da Aiutiamoci per il tuo percorso con noi.`
    )
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
        const { error } = await (supabase.from('clients') as any)
          .update(clientPayload)
          .eq('id', editingClient.id)

        if (error) throw error

        setClients(clients.map((c) => (c.id === editingClient.id ? { ...c, ...clientPayload } : c)))
        playNotificationSound('chat')
      } else {
        const { data, error } = await (supabase.from('clients') as any)
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
      if (selectedClientId === id) {
        setSelectedClientId(null)
      }
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

      const matchCategory = selectedCategory === 'all' || c.category === selectedCategory

      return matchSearch && matchCategory
    })
  }, [clients, searchQuery, selectedCategory])

  const selectedClient = clients.find((c) => c.id === selectedClientId) || null
  const selectedClientMeta = selectedClient ? parseClientMeta(selectedClient) : null
  const selectedClientFullName = selectedClient
    ? `${selectedClient.first_name || ''} ${selectedClient.last_name || ''}`.trim() ||
      'Contatto senza nome'
    : ''

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'academy':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-sm bg-[#6366f1]/10 text-[#6366f1] border border-[#6366f1]/20">
            <GraduationCap className="h-2.5 w-2.5" />
            Academy
          </span>
        )
      case 'business':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-sm bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/20">
            <Briefcase className="h-2.5 w-2.5" />
            Business
          </span>
        )
      case 'partner':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-sm bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/20">
            <Sparkles className="h-2.5 w-2.5" />
            Partner
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-sm bg-zinc-500/10 text-zinc-600 dark:text-zinc-300 border border-zinc-500/20">
            Lead
          </span>
        )
    }
  }

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[#f7f6f3] dark:bg-[#0d0d0f] text-[#111113] dark:text-[#f4f4f5]">
      {/* A) COMMAND BAR */}
      <div className="min-h-[52px] px-4 sm:px-5 py-2 border-b border-[#e5e3dc] dark:border-white/[0.08] bg-white dark:bg-[#0d0d0f] flex flex-wrap items-center justify-between gap-3 shrink-0">
        {/* Left: Title + 3 Inline Monospace Metrics */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-5 min-w-0">
          <h1
            className="text-[15px] font-bold tracking-tight text-[#111113] dark:text-[#f4f4f5] shrink-0"
            style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}
          >
            Rubrica &amp; CRM
          </h1>

          <div
            className="flex flex-wrap items-center gap-3 sm:gap-4 text-[11px]"
            style={{ fontFamily: 'var(--font-mono), monospace' }}
          >
            <span className="inline-flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
              <span className="h-1.5 w-1.5 rounded-full bg-[#6366f1]" />
              <span>Pipeline</span>
              <span className="font-semibold text-[#111113] dark:text-[#f4f4f5] tabular-nums">
                {kpiData.pipelineTotal.toLocaleString('it-IT', {
                  style: 'currency',
                  currency: 'EUR',
                  maximumFractionDigits: 0,
                })}
              </span>
            </span>

            <span className="inline-flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
              <span className="h-1.5 w-1.5 rounded-full bg-[#10b981]" />
              <span>Vinti</span>
              <span className="font-semibold text-emerald-600 dark:text-[#10b981] tabular-nums">
                {kpiData.wonTotal.toLocaleString('it-IT', {
                  style: 'currency',
                  currency: 'EUR',
                  maximumFractionDigits: 0,
                })}
              </span>
            </span>

            <span className="inline-flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              <span>Attive</span>
              <span className="font-semibold text-[#111113] dark:text-[#f4f4f5] tabular-nums">
                {kpiData.hotDealsCount}
              </span>
            </span>
          </div>
        </div>

        {/* Right: Search + Segmented View Switcher + CTA */}
        <div className="flex flex-wrap items-center gap-2 ml-auto">
          <div className="relative w-48 sm:w-56">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cerca contatti..."
              className="pl-8 pr-7 h-8 text-xs bg-[#f7f6f3] dark:bg-[#141417] border-[#e5e3dc] dark:border-white/[0.08] rounded-md"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-[#111113] dark:hover:text-[#f4f4f5] cursor-pointer"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          <div className="inline-flex items-center bg-[#f7f6f3] dark:bg-[#141417] border border-[#e5e3dc] dark:border-white/[0.08] p-0.5 rounded-md">
            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              className={`inline-flex items-center gap-1.5 px-2.5 h-7 text-[11px] font-semibold rounded-sm transition-colors cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-white dark:bg-[#222228] text-[#111113] dark:text-[#f4f4f5] shadow-2xs'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-[#111113] dark:hover:text-[#f4f4f5]'
              }`}
            >
              <Kanban className="h-3.5 w-3.5" />
              <span>Pipeline</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`inline-flex items-center gap-1.5 px-2.5 h-7 text-[11px] font-semibold rounded-sm transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-[#222228] text-[#111113] dark:text-[#f4f4f5] shadow-2xs'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-[#111113] dark:hover:text-[#f4f4f5]'
              }`}
            >
              <List className="h-3.5 w-3.5" />
              <span>Lista</span>
            </button>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="bg-[#111113] hover:bg-zinc-800 text-white dark:bg-[#f4f4f5] dark:hover:bg-white dark:text-[#0d0d0f] h-8 px-3 rounded-md text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Nuovo Contatto</span>
          </button>
        </div>
      </div>

      {/* B) TAB STRIP CATEGORIE */}
      <div className="px-4 sm:px-5 border-b border-[#e5e3dc] dark:border-white/[0.08] bg-white/80 dark:bg-[#0d0d0f] flex items-center gap-5 overflow-x-auto shrink-0">
        {[
          { id: 'all', label: 'Tutti', count: clients.length },
          { id: 'academy', label: 'Academy', count: clients.filter((c) => c.category === 'academy').length },
          { id: 'business', label: 'Business', count: clients.filter((c) => c.category === 'business').length },
          { id: 'partner', label: 'Partner', count: clients.filter((c) => c.category === 'partner').length },
        ].map((cat) => {
          const active = selectedCategory === cat.id
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`h-9 inline-flex items-center gap-1.5 text-xs border-b-2 transition-colors shrink-0 cursor-pointer ${
                active
                  ? 'border-[#111113] dark:border-[#f4f4f5] text-[#111113] dark:text-[#f4f4f5] font-semibold'
                  : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-[#111113] dark:hover:text-[#f4f4f5]'
              }`}
            >
              <span>{cat.label}</span>
              <span
                className="text-[10px] text-zinc-400 dark:text-zinc-500 tabular-nums"
                style={{ fontFamily: 'var(--font-mono), monospace' }}
              >
                {cat.count}
              </span>
            </button>
          )
        })}
      </div>

      {/* C) CORPO SPLIT (MAIN PANE + RIGHT INSPECTOR) */}
      <div className="flex-1 min-h-0 flex overflow-hidden relative">
        <div className="flex-1 min-w-0 h-full overflow-auto">
          {loading ? (
            <div className="h-full flex items-center justify-center p-12 text-xs text-zinc-400 dark:text-zinc-500">
              Caricamento dati CRM in corso...
            </div>
          ) : viewMode === 'kanban' ? (
            /* VISTA PIPELINE A 4 CORSIE APERTE FULL-BLEED */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 min-h-full divide-y md:divide-y-0 md:divide-x divide-[#e5e3dc] dark:divide-white/[0.08]">
              {PIPELINE_COLUMNS.map((col) => {
                const colClients = filteredClients.filter((c) => parseClientMeta(c).stage === col.id)
                const colTotalValue = colClients.reduce((sum, c) => sum + parseClientMeta(c).dealValue, 0)

                return (
                  <div key={col.id} className="flex flex-col min-w-0">
                    {/* Sticky Hairline Column Header */}
                    <div className="px-4 py-2.5 border-b border-[#e5e3dc] dark:border-white/[0.08] bg-[#f7f6f3]/95 dark:bg-[#0d0d0f]/95 backdrop-blur-xs sticky top-0 z-10 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`h-2 w-2 rounded-full shrink-0 ${col.accentColor}`} />
                          <h3
                            className="font-bold text-xs uppercase tracking-wider text-[#111113] dark:text-[#f4f4f5] truncate"
                            style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}
                          >
                            {col.title}
                          </h3>
                        </div>
                        <span
                          className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 tabular-nums shrink-0"
                          style={{ fontFamily: 'var(--font-mono), monospace' }}
                        >
                          {colClients.length}
                        </span>
                      </div>

                      <div
                        className="flex items-center justify-between text-[10px] text-zinc-400 dark:text-zinc-500"
                        style={{ fontFamily: 'var(--font-mono), monospace' }}
                      >
                        <span>{col.subtitle}</span>
                        <span className="font-semibold text-[#111113] dark:text-[#f4f4f5] tabular-nums">
                          {colTotalValue.toLocaleString('it-IT', {
                            style: 'currency',
                            currency: 'EUR',
                            maximumFractionDigits: 0,
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Lista Righe Contatto */}
                    <div className="flex-1 flex flex-col">
                      {colClients.length === 0 ? (
                        <div className="py-12 px-4 text-center text-[11px] text-zinc-400 dark:text-zinc-600">
                          Nessun contatto in questa fase
                        </div>
                      ) : (
                        colClients.map((client) => {
                          const meta = parseClientMeta(client)
                          const fullName =
                            `${client.first_name || ''} ${client.last_name || ''}`.trim() ||
                            'Contatto senza nome'
                          const isSelected = selectedClientId === client.id

                          return (
                            <div
                              key={client.id}
                              onClick={() => setSelectedClientId(client.id)}
                              className={`border-b border-[#e5e3dc] dark:border-white/[0.06] px-4 py-3.5 cursor-pointer transition-colors space-y-2 border-l-2 ${
                                isSelected
                                  ? 'bg-[#f7f6f3] dark:bg-[#18181f] border-l-[#6366f1]'
                                  : 'bg-white dark:bg-[#111114] hover:bg-[#fafaf8] dark:hover:bg-[#16161b] border-l-transparent'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <span className="font-semibold text-[13px] text-[#111113] dark:text-[#f4f4f5] leading-snug line-clamp-1">
                                  {fullName}
                                </span>
                                <span className="shrink-0">{getCategoryBadge(client.category)}</span>
                              </div>

                              {(client.company || client.city) && (
                                <div className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-2 truncate">
                                  {client.company && (
                                    <span className="inline-flex items-center gap-1 truncate">
                                      <Building className="h-3 w-3 shrink-0 text-zinc-400" />
                                      <span className="truncate">{client.company}</span>
                                    </span>
                                  )}
                                  {client.city && (
                                    <span className="inline-flex items-center gap-1 shrink-0 text-zinc-400">
                                      <MapPin className="h-2.5 w-2.5 shrink-0" />
                                      <span>{client.city}</span>
                                    </span>
                                  )}
                                </div>
                              )}

                              {meta.cleanNotes && (
                                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1">
                                  {meta.cleanNotes}
                                </p>
                              )}

                              <div className="flex items-center justify-between pt-1">
                                <span
                                  className="text-[11px] font-semibold text-emerald-600 dark:text-[#10b981] tabular-nums"
                                  style={{ fontFamily: 'var(--font-mono), monospace' }}
                                >
                                  {meta.dealValue.toLocaleString('it-IT', {
                                    style: 'currency',
                                    currency: 'EUR',
                                    maximumFractionDigits: 0,
                                  })}
                                </span>

                                <div
                                  className="flex items-center gap-1"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {client.phone && (
                                    <button
                                      type="button"
                                      onClick={() => openWhatsApp(client.phone, fullName)}
                                      className="h-6 px-2 rounded-sm bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
                                      title={`WhatsApp ${fullName}`}
                                    >
                                      <Share2 className="h-2.5 w-2.5" />
                                      <span>WA</span>
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => openEditModal(client)}
                                    className="h-6 w-6 rounded-sm text-zinc-400 hover:text-[#111113] dark:hover:text-[#f4f4f5] hover:bg-[#f7f6f3] dark:hover:bg-white/[0.08] inline-flex items-center justify-center cursor-pointer"
                                    title="Modifica contatto"
                                  >
                                    <Edit2 className="h-3 w-3" />
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
            /* VISTA LISTA FULL-BLEED */
            <div className="bg-white dark:bg-[#0d0d0f] min-h-full">
              {filteredClients.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse min-w-[780px]">
                    <thead>
                      <tr
                        className="h-9 border-b border-[#e5e3dc] dark:border-white/[0.08] bg-[#f7f6f3] dark:bg-[#111114] text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider text-[10px] sticky top-0 z-10"
                        style={{ fontFamily: 'var(--font-mono), monospace' }}
                      >
                        <th className="py-2 px-4">Contatto</th>
                        <th className="py-2 px-4">Azienda</th>
                        <th className="py-2 px-4">Recapiti</th>
                        <th className="py-2 px-4">Fase &amp; Valore</th>
                        <th className="py-2 px-4">Categoria</th>
                        <th className="py-2 px-4">Città</th>
                        <th className="py-2 px-4 text-right">Azioni</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e5e3dc] dark:divide-white/[0.07]">
                      {filteredClients.map((client) => {
                        const meta = parseClientMeta(client)
                        const fullName =
                          `${client.first_name || ''} ${client.last_name || ''}`.trim() ||
                          'Contatto senza nome'
                        const stageCol =
                          PIPELINE_COLUMNS.find((col) => col.id === meta.stage) || PIPELINE_COLUMNS[0]
                        const isSelected = selectedClientId === client.id

                        return (
                          <tr
                            key={client.id}
                            onClick={() => setSelectedClientId(client.id)}
                            className={`transition-colors cursor-pointer border-l-2 ${
                              isSelected
                                ? 'bg-[#f7f6f3] dark:bg-[#18181f] border-l-[#6366f1]'
                                : 'hover:bg-[#fafaf8] dark:hover:bg-[#141418] border-l-transparent'
                            }`}
                          >
                            <td className="py-2.5 px-4">
                              <div className="font-semibold text-[#111113] dark:text-[#f4f4f5] text-[13px]">
                                {fullName}
                              </div>
                              {meta.cleanNotes && (
                                <div className="text-[11px] text-zinc-400 dark:text-zinc-500 line-clamp-1 max-w-[220px]">
                                  {meta.cleanNotes}
                                </div>
                              )}
                            </td>

                            <td className="py-2.5 px-4 text-zinc-600 dark:text-zinc-300">
                              {client.company || '—'}
                            </td>

                            <td className="py-2.5 px-4 space-y-0.5">
                              <div
                                className="text-[11px] text-[#111113] dark:text-[#f4f4f5]"
                                style={{ fontFamily: 'var(--font-mono), monospace' }}
                              >
                                {client.email}
                              </div>
                              {client.phone && (
                                <div
                                  className="text-[11px] text-zinc-400 dark:text-zinc-500"
                                  style={{ fontFamily: 'var(--font-mono), monospace' }}
                                >
                                  {client.phone}
                                </div>
                              )}
                            </td>

                            <td className="py-2.5 px-4 space-y-1">
                              <span
                                className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-sm border ${stageCol.badgeColor}`}
                              >
                                <span className={`h-1.5 w-1.5 rounded-full ${stageCol.accentColor}`} />
                                {stageCol.title}
                              </span>
                              <div
                                className="text-[11px] font-semibold text-[#111113] dark:text-[#f4f4f5] tabular-nums"
                                style={{ fontFamily: 'var(--font-mono), monospace' }}
                              >
                                {meta.dealValue.toLocaleString('it-IT', {
                                  style: 'currency',
                                  currency: 'EUR',
                                  maximumFractionDigits: 0,
                                })}
                              </div>
                            </td>

                            <td className="py-2.5 px-4">{getCategoryBadge(client.category)}</td>

                            <td className="py-2.5 px-4 text-[11px] text-zinc-500 dark:text-zinc-400">
                              {client.city
                                ? `${client.city}${client.province ? ` (${client.province})` : ''}`
                                : '—'}
                            </td>

                            <td
                              className="py-2.5 px-4 text-right"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="inline-flex items-center justify-end gap-1">
                                {client.phone && (
                                  <button
                                    type="button"
                                    onClick={() => openWhatsApp(client.phone, fullName)}
                                    className="h-7 px-2 rounded-sm bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[10px] inline-flex items-center gap-1 transition-colors cursor-pointer"
                                    title="WhatsApp"
                                  >
                                    <Share2 className="h-3 w-3" />
                                    <span>WA</span>
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => handleCopyEmail(client.email)}
                                  className="h-7 w-7 rounded-sm border border-[#e5e3dc] dark:border-white/[0.08] text-zinc-500 hover:text-[#6366f1] inline-flex items-center justify-center cursor-pointer"
                                  title="Copia Email"
                                >
                                  {copiedEmail === client.email ? (
                                    <Check className="h-3 w-3 text-[#10b981]" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => openEditModal(client)}
                                  className="h-7 w-7 rounded-sm text-zinc-400 hover:text-[#111113] dark:hover:text-[#f4f4f5] hover:bg-[#f7f6f3] dark:hover:bg-white/[0.08] inline-flex items-center justify-center cursor-pointer"
                                  title="Modifica Contatto"
                                >
                                  <Edit2 className="h-3 w-3" />
                                </button>

                                {isAdmin && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteClient(client.id, fullName)}
                                    className="h-7 w-7 rounded-sm text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 inline-flex items-center justify-center cursor-pointer"
                                    title="Elimina Contatto"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                )}
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
                  <Users className="h-8 w-8 text-zinc-300 dark:text-zinc-600 mx-auto" />
                  <h3 className="font-bold text-sm text-[#111113] dark:text-[#f4f4f5]">
                    Nessun contatto trovato
                  </h3>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 max-w-sm mx-auto">
                    Nessun cliente corrisponde ai criteri di ricerca.
                  </p>
                  <button
                    type="button"
                    onClick={openCreateModal}
                    className="bg-[#111113] hover:bg-zinc-800 text-white dark:bg-[#f4f4f5] dark:hover:bg-white dark:text-[#0d0d0f] h-8 px-3 rounded-md text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" /> Aggiungi Contatto
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* D) RIGHT SLIDE-OVER INSPECTOR */}
        {selectedClient && selectedClientMeta && (
          <>
            <div
              onClick={() => setSelectedClientId(null)}
              className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            />
            <aside className="fixed inset-y-0 right-0 z-40 w-full max-w-[420px] shadow-2xl lg:static lg:shadow-none lg:w-[400px] xl:w-[430px] shrink-0 border-l border-[#e5e3dc] dark:border-white/[0.08] bg-white dark:bg-[#111114] h-full flex flex-col overflow-hidden">
              {/* Header Inspector: Categoria + 1-click Stage Switcher + Close */}
              <div className="px-4 py-3 border-b border-[#e5e3dc] dark:border-white/[0.08] bg-[#f7f6f3] dark:bg-[#141417] space-y-2.5 shrink-0">
                <div className="flex items-center justify-between gap-2">
                  {getCategoryBadge(selectedClient.category)}

                  <button
                    type="button"
                    onClick={() => setSelectedClientId(null)}
                    className="h-7 w-7 inline-flex items-center justify-center rounded-sm text-zinc-400 hover:text-[#111113] dark:hover:text-[#f4f4f5] hover:bg-black/5 dark:hover:bg-white/[0.08] cursor-pointer"
                    title="Chiudi Inspector (Esc)"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* 4 Stage 1-Click Switcher */}
                <div className="grid grid-cols-4 gap-1">
                  {PIPELINE_COLUMNS.map((stage) => {
                    const active = selectedClientMeta.stage === stage.id
                    return (
                      <button
                        key={stage.id}
                        type="button"
                        onClick={() => handleMoveStage(selectedClient, stage.id)}
                        className={`h-7 px-1.5 rounded-sm text-[11px] font-semibold inline-flex items-center justify-center gap-1 border transition-colors cursor-pointer truncate ${
                          active
                            ? 'bg-[#111113] text-white border-[#111113] dark:bg-[#f4f4f5] dark:text-[#0d0d0f] dark:border-[#f4f4f5]'
                            : 'bg-white dark:bg-[#18181c] text-zinc-600 dark:text-zinc-400 border-[#e5e3dc] dark:border-white/[0.08] hover:text-[#111113] dark:hover:text-[#f4f4f5]'
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${stage.accentColor}`} />
                        <span className="truncate">{stage.shortTitle}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Body Scrollabile Inspector */}
              <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs">
                <div>
                  <h2
                    className="text-base font-bold text-[#111113] dark:text-[#f4f4f5]"
                    style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}
                  >
                    {selectedClientFullName}
                  </h2>
                  {selectedClient.company && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 flex items-center gap-1.5">
                      <Building className="h-3.5 w-3.5 text-zinc-400" />
                      <span>{selectedClient.company}</span>
                    </p>
                  )}
                </div>

                {/* Azioni Dirette */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {selectedClient.phone && (
                    <button
                      type="button"
                      onClick={() => openWhatsApp(selectedClient.phone, selectedClientFullName)}
                      className="h-8 px-2.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                      <span>WhatsApp</span>
                    </button>
                  )}

                  {selectedClient.email && (
                    <a
                      href={`mailto:${selectedClient.email}`}
                      className="h-8 px-2.5 rounded-md border border-[#e5e3dc] dark:border-white/[0.08] bg-[#f7f6f3] dark:bg-[#18181c] text-[#111113] dark:text-[#f4f4f5] hover:border-[#6366f1] text-xs font-semibold inline-flex items-center gap-1.5"
                    >
                      <Mail className="h-3.5 w-3.5 text-[#6366f1]" />
                      <span>Email</span>
                    </a>
                  )}

                  {selectedClient.email && (
                    <button
                      type="button"
                      onClick={() => handleCopyEmail(selectedClient.email)}
                      className="h-8 px-2.5 rounded-md border border-[#e5e3dc] dark:border-white/[0.08] bg-white dark:bg-[#18181c] text-zinc-600 dark:text-zinc-300 hover:border-[#6366f1] text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedEmail === selectedClient.email ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-[#10b981]" />
                          <span>Copiata</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copia</span>
                        </>
                      )}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => openEditModal(selectedClient)}
                    className="h-8 px-2.5 rounded-md border border-[#e5e3dc] dark:border-white/[0.08] bg-white dark:bg-[#18181c] text-[#111113] dark:text-[#f4f4f5] hover:border-[#6366f1] text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    <span>Modifica</span>
                  </button>
                </div>

                {/* Griglia Dettagli Cliente */}
                <div className="divide-y divide-[#e5e3dc] dark:divide-white/[0.06] border-y border-[#e5e3dc] dark:border-white/[0.08]">
                  <div className="py-2.5 flex items-center justify-between gap-3">
                    <span className="text-zinc-400 dark:text-zinc-500">Valore trattativa</span>
                    <span
                      className="font-bold text-emerald-600 dark:text-[#10b981] tabular-nums"
                      style={{ fontFamily: 'var(--font-mono), monospace' }}
                    >
                      {selectedClientMeta.dealValue.toLocaleString('it-IT', {
                        style: 'currency',
                        currency: 'EUR',
                        maximumFractionDigits: 0,
                      })}
                    </span>
                  </div>

                  <div className="py-2.5 flex items-center justify-between gap-3">
                    <span className="text-zinc-400 dark:text-zinc-500">Email</span>
                    <span
                      className="text-[#111113] dark:text-[#f4f4f5] truncate max-w-[230px] select-all"
                      style={{ fontFamily: 'var(--font-mono), monospace' }}
                    >
                      {selectedClient.email}
                    </span>
                  </div>

                  <div className="py-2.5 flex items-center justify-between gap-3">
                    <span className="text-zinc-400 dark:text-zinc-500">Telefono</span>
                    <span
                      className="text-[#111113] dark:text-[#f4f4f5]"
                      style={{ fontFamily: 'var(--font-mono), monospace' }}
                    >
                      {selectedClient.phone || '—'}
                    </span>
                  </div>

                  <div className="py-2.5 flex items-center justify-between gap-3">
                    <span className="text-zinc-400 dark:text-zinc-500">Azienda</span>
                    <span className="text-[#111113] dark:text-[#f4f4f5] text-right">
                      {selectedClient.company || '—'}
                    </span>
                  </div>

                  <div className="py-2.5 flex items-center justify-between gap-3">
                    <span className="text-zinc-400 dark:text-zinc-500">Località</span>
                    <span className="text-[#111113] dark:text-[#f4f4f5] text-right">
                      {[
                        selectedClient.address,
                        selectedClient.city,
                        selectedClient.province ? `(${selectedClient.province})` : '',
                      ]
                        .filter(Boolean)
                        .join(' ') || '—'}
                    </span>
                  </div>
                </div>

                {/* Note */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block">
                    Note &amp; Accordi
                  </span>
                  <div className="p-3 rounded-md border border-[#e5e3dc] dark:border-white/[0.08] bg-[#f7f6f3] dark:bg-[#0d0d0f] text-xs text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">
                    {selectedClientMeta.cleanNotes || 'Nessuna nota registrata.'}
                  </div>
                </div>
              </div>

              {/* Footer Inspector */}
              <div className="px-4 py-3 border-t border-[#e5e3dc] dark:border-white/[0.08] bg-[#f7f6f3] dark:bg-[#141417] flex items-center justify-between text-[11px] text-zinc-400 dark:text-zinc-500 shrink-0">
                <span style={{ fontFamily: 'var(--font-mono), monospace' }}>
                  {selectedClient.created_at
                    ? `Creato il ${new Date(selectedClient.created_at).toLocaleDateString('it-IT')}`
                    : 'Anagrafica CRM'}
                </span>

                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => handleDeleteClient(selectedClient.id, selectedClientFullName)}
                    className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 hover:underline font-semibold cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Elimina</span>
                  </button>
                )}
              </div>
            </aside>
          </>
        )}
      </div>

      {/* Modal Aggiungi / Modifica Contatto */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false)
          }}
        >
          <div className="bg-white dark:bg-[#141417] rounded-lg shadow-2xl w-full max-w-lg border border-[#e5e3dc] dark:border-white/[0.1] flex flex-col max-h-[92vh] overflow-hidden">
            {/* Header Fisso */}
            <div className="px-5 py-3.5 border-b border-[#e5e3dc] dark:border-white/[0.08] flex items-center justify-between bg-[#f7f6f3] dark:bg-[#141417] shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-md bg-[#6366f1]/15 text-[#6366f1] flex items-center justify-center font-bold">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <h3
                    className="font-bold text-sm text-[#111113] dark:text-[#f4f4f5]"
                    style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}
                  >
                    {editingClient ? 'Modifica Anagrafica & Pipeline' : 'Nuovo Contatto in Pipeline'}
                  </h3>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Dati anagrafici, fase commerciale e valore opportunità
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsModalOpen(false)}
                className="h-8 w-8 rounded-md text-zinc-400 hover:text-[#111113] dark:hover:text-[#f4f4f5]"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Form Body Scrollabile */}
            <form onSubmit={handleSaveClient} className="p-5 space-y-4 text-xs overflow-y-auto flex-1">
              {/* Box Commerciale: Fase & Valore Deal */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-md bg-[#f7f6f3] dark:bg-[#0d0d0f] border border-[#e5e3dc] dark:border-white/[0.08]">
                <div className="space-y-1.5">
                  <label className="font-semibold text-[#111113] dark:text-[#f4f4f5] flex items-center gap-1.5">
                    <Kanban className="h-3.5 w-3.5 text-[#6366f1]" />
                    Fase Commerciale
                  </label>
                  <select
                    value={formStage}
                    onChange={(e: any) => setFormStage(e.target.value)}
                    className="w-full h-9 rounded-md border border-[#e5e3dc] dark:border-white/[0.1] bg-white dark:bg-[#141417] px-3 text-xs font-medium text-[#111113] dark:text-[#f4f4f5]"
                  >
                    <option value="nuovo_lead">Nuovo Lead</option>
                    <option value="call_fissata">Call Fissata</option>
                    <option value="preventivo">Proposta / Preventivo</option>
                    <option value="vinto">Cliente Vinto</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-[#111113] dark:text-[#f4f4f5] flex items-center gap-1.5">
                    <Euro className="h-3.5 w-3.5 text-[#10b981]" />
                    Valore Deal (€)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="10"
                    value={formDealValue}
                    onChange={(e) => setFormDealValue(e.target.value)}
                    placeholder="Es. 1500"
                    className="text-xs bg-white dark:bg-[#141417] border-[#e5e3dc] dark:border-white/[0.1] font-mono font-bold rounded-md"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-zinc-700 dark:text-zinc-300">Nome</label>
                  <Input
                    value={formFirstName}
                    onChange={(e) => setFormFirstName(e.target.value)}
                    placeholder="Es. Mario"
                    className="text-xs bg-[#f7f6f3] dark:bg-[#0d0d0f] border-[#e5e3dc] dark:border-white/[0.1] rounded-md"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-zinc-700 dark:text-zinc-300">Cognome</label>
                  <Input
                    value={formLastName}
                    onChange={(e) => setFormLastName(e.target.value)}
                    placeholder="Es. Rossi"
                    className="text-xs bg-[#f7f6f3] dark:bg-[#0d0d0f] border-[#e5e3dc] dark:border-white/[0.1] rounded-md"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-zinc-700 dark:text-zinc-300">Email *</label>
                  <Input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="mario.rossi@azienda.it"
                    className="text-xs bg-[#f7f6f3] dark:bg-[#0d0d0f] border-[#e5e3dc] dark:border-white/[0.1] rounded-md"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                    Telefono / Cellulare
                  </label>
                  <Input
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+39 340 1234567"
                    className="text-xs bg-[#f7f6f3] dark:bg-[#0d0d0f] border-[#e5e3dc] dark:border-white/[0.1] rounded-md"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                    Azienda / Società
                  </label>
                  <Input
                    value={formCompany}
                    onChange={(e) => setFormCompany(e.target.value)}
                    placeholder="Es. Acme S.r.l."
                    className="text-xs bg-[#f7f6f3] dark:bg-[#0d0d0f] border-[#e5e3dc] dark:border-white/[0.1] rounded-md"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                    Categoria
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e: any) => setFormCategory(e.target.value)}
                    className="w-full h-9 rounded-md border border-[#e5e3dc] dark:border-white/[0.1] bg-[#f7f6f3] dark:bg-[#0d0d0f] px-3 text-xs text-[#111113] dark:text-[#f4f4f5]"
                  >
                    <option value="academy">Academy / Corsista</option>
                    <option value="business">Business / Cliente PMI</option>
                    <option value="partner">Partner / Fornitore</option>
                    <option value="lead">Lead / Contatto</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-1.5">
                  <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                    Indirizzo
                  </label>
                  <Input
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
                    placeholder="Via Roma 12"
                    className="text-xs bg-[#f7f6f3] dark:bg-[#0d0d0f] border-[#e5e3dc] dark:border-white/[0.1] rounded-md"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-zinc-700 dark:text-zinc-300">Città</label>
                  <Input
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    placeholder="Milano"
                    className="text-xs bg-[#f7f6f3] dark:bg-[#0d0d0f] border-[#e5e3dc] dark:border-white/[0.1] rounded-md"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                  Note &amp; Dettagli
                </label>
                <textarea
                  rows={3}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Informazioni aggiuntive, accordi commerciali..."
                  className="w-full text-xs p-2.5 rounded-md border border-[#e5e3dc] dark:border-white/[0.1] bg-[#f7f6f3] dark:bg-[#0d0d0f] text-[#111113] dark:text-[#f4f4f5] focus:outline-none focus:ring-1 focus:ring-[#6366f1] resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e5e3dc] dark:border-white/[0.08]">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                  className="text-xs cursor-pointer rounded-md border-[#e5e3dc] dark:border-white/[0.1]"
                >
                  Annulla
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="bg-[#111113] hover:bg-zinc-800 text-white dark:bg-[#f4f4f5] dark:hover:bg-white dark:text-[#0d0d0f] font-semibold text-xs h-9 px-4 rounded-md cursor-pointer border-0"
                >
                  {isSaving
                    ? 'Salvataggio...'
                    : editingClient
                      ? 'Salva Modifiche'
                      : 'Crea Contatto'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
