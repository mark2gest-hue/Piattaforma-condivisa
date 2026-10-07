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
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { playNotificationSound } from '@/lib/notifications'

export interface ClientRecord {
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

export default function ClientiRubricaPage() {
  const [clients, setClients] = useState<ClientRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null)
  
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
    setIsModalOpen(true)
  }

  const openEditModal = (client: ClientRecord) => {
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
    setFormNotes(client.notes || '')
    setFormStatus(client.status || 'active')
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
      const clientPayload = {
        first_name: formFirstName.trim(),
        last_name: formLastName.trim(),
        email: formEmail.trim().toLowerCase(),
        phone: formPhone.trim(),
        company: formCompany.trim(),
        category: formCategory,
        address: formAddress.trim(),
        city: formCity.trim(),
        province: formProvince.trim().toUpperCase(),
        notes: formNotes.trim(),
        status: formStatus,
      }

      if (editingClient) {
        // Aggiorna
        const { error } = await supabase
          .from('clients')
          .update(clientPayload)
          .eq('id', editingClient.id)

        if (error) throw error

        setClients(clients.map((c) => (c.id === editingClient.id ? { ...c, ...clientPayload } : c)))
        playNotificationSound('chat')
      } else {
        // Inserisci nuovo
        const { data, error } = await supabase
          .from('clients')
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            Rubrica & Anagrafica Clienti
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Gestione centralizzata e ricerca istantanea di corsisti Academy, aziende partner e clienti Business.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={openCreateModal}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 shadow-xs text-xs font-semibold h-10 px-4 rounded-xl cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Nuovo Contatto</span>
          </Button>
        </div>
      </div>

      {/* Barra di Ricerca Globale & Filtri */}
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

      {/* Tabella & Schede Contatti */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">
            Caricamento anagrafica in corso...
          </div>
        ) : filteredClients.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Contatto / Nome</th>
                  <th className="py-3 px-4">Azienda & Ruolo</th>
                  <th className="py-3 px-4">Email & Recapiti</th>
                  <th className="py-3 px-4">Categoria</th>
                  <th className="py-3 px-4">Città / Sede</th>
                  <th className="py-3 px-4 text-right">Azioni Rapide</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredClients.map((client) => {
                  const fullName = `${client.first_name || ''} ${client.last_name || ''}`.trim() || 'Contatto senza nome'
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
                            {client.notes && (
                              <span className="text-[11px] text-slate-400 line-clamp-1 max-w-[200px]">
                                {client.notes}
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
                          {/* Copia Rapida Email */}
                          <button
                            type="button"
                            onClick={() => handleCopyEmail(client.email)}
                            className={`h-8 px-2.5 rounded-lg border font-semibold text-[11px] flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                              copiedEmail === client.email
                                ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-500 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400'
                            }`}
                            title="Copia indirizzo email negli appunti per incollarlo in Calendario"
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

                          {/* WhatsApp se c'è telefono */}
                          {client.phone && (
                            <button
                              type="button"
                              onClick={() => {
                                const cleanPhone = client.phone?.replace(/[^0-9+]/g, '') || ''
                                window.open(`https://wa.me/${cleanPhone}`, '_blank')
                              }}
                              className="h-8 w-8 rounded-lg border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 flex items-center justify-center transition-all cursor-pointer"
                              title="Apri WhatsApp"
                            >
                              <Share2 className="h-3.5 w-3.5" />
                            </button>
                          )}

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
                    {editingClient ? 'Modifica Anagrafica Contatto' : 'Nuovo Contatto in Rubrica'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Dati anagrafici, recapiti e profilo cliente
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
                  placeholder="Informazioni aggiuntive, preferenze, accordi..."
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
