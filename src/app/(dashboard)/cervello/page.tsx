'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  Sparkles,
  Search,
  Copy,
  Check,
  Download,
  Plus,
  Trash2,
  Terminal,
  BookOpen,
  FileSpreadsheet,
  Palette,
  Bot,
  Layers,
  Filter,
  ExternalLink,
  Loader2,
  X,
  Save,
  Tag,
  Share2,
  FolderDown,
  Info,
  LayoutGrid,
  Network,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { playNotificationSound } from '@/lib/notifications'
import { KnowledgeItem, DEFAULT_KNOWLEDGE_ITEMS } from '@/lib/knowledge-data'
import { KnowledgeGraphView } from '@/components/cervello/knowledge-graph-view'
import {
  getKnowledgeItemsAction,
  createKnowledgeItemAction,
  deleteKnowledgeItemAction,
  generateObsidianVaultBundleAction,
} from '@/app/actions/knowledge'

const CATEGORIES = [
  { id: 'all', label: 'Tutte le Risorse', icon: Layers, color: 'text-indigo-400' },
  { id: 'prompting', label: '🎯 Prompting & RCCF', icon: Terminal, color: 'text-amber-400' },
  { id: 'copywriting', label: '✉️ Copy & Email B2B', icon: BookOpen, color: 'text-blue-400' },
  { id: 'excel_data', label: '📊 Excel & Analisi Dati', icon: FileSpreadsheet, color: 'text-emerald-400' },
  { id: 'visual_media', label: '🎨 Immagini & Slide', icon: Palette, color: 'text-purple-400' },
  { id: 'agents_workflows', label: '🤖 Agenti & Automazioni', icon: Bot, color: 'text-pink-400' },
]

export default function CervelloKnowledgePage() {
  const [items, setItems] = useState<KnowledgeItem[]>(DEFAULT_KNOWLEDGE_ITEMS)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'graph'>('graph')
  const [loading, setLoading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newCategory, setNewCategory] = useState<KnowledgeItem['category']>('prompting')
  const [newDescription, setNewDescription] = useState('')
  const [newContent, setNewContent] = useState('')
  const [newTags, setNewTags] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Obsidian Export State
  const [isExporting, setIsExporting] = useState(false)
  const [exportModalOpen, setExportModalOpen] = useState(false)
  const [exportedFilesCount, setExportedFilesCount] = useState(0)

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      const res = await getKnowledgeItemsAction()
      if (res && res.success && Array.isArray(res.items) && res.items.length > 0) {
        setItems(res.items)
      }
    } catch (err) {
      // Se la Server Action fallisce (DB non raggiungibile), usa il catalogo predefinito
      console.warn('Knowledge items: uso catalogo predefinito (DB non raggiungibile)', err)
    }
  }

  // Filtraggio istantaneo locale super-sicuro senza attese
  const displayedItems = useMemo(() => {
    const list = Array.isArray(items) && items.length > 0 ? items : DEFAULT_KNOWLEDGE_ITEMS
    return list.filter((i) => {
      if (!i) return false
      if (selectedCategory && selectedCategory !== 'all' && i.category !== selectedCategory) {
        return false
      }
      if (searchQuery && searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchTitle = Boolean(i.title && i.title.toLowerCase().includes(q))
        const matchContent = Boolean(i.content && i.content.toLowerCase().includes(q))
        const matchDesc = Boolean(i.description && i.description.toLowerCase().includes(q))
        const matchTags = Array.isArray(i.tags) && i.tags.some((t) => typeof t === 'string' && t.toLowerCase().includes(q))
        return matchTitle || matchContent || matchDesc || matchTags
      }
      return true
    })
  }, [items, selectedCategory, searchQuery])

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    playNotificationSound('chat')
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleCreatePrompt = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim() || !newContent.trim() || isSubmitting) return

    setIsSubmitting(true)

    const tagsArray = newTags
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0)

    const res = await createKnowledgeItemAction({
      title: newTitle,
      category: newCategory,
      description: newDescription,
      content: newContent,
      tags: tagsArray,
    })

    if (res.success && res.item) {
      setItems((prev) => [res.item, ...prev])
      playNotificationSound('chat')
      setIsModalOpen(false)
      setNewTitle('')
      setNewDescription('')
      setNewContent('')
      setNewTags('')
    } else {
      alert(`Errore: ${res.error}`)
    }

    setIsSubmitting(false)
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Sei sicuro di voler eliminare "${title}"?`)) return
    setItems((prev) => prev.filter((i) => i.id !== id))
    await deleteKnowledgeItemAction(id)
  }

  const handleDownloadObsidianVault = async () => {
    setIsExporting(true)
    try {
      const res = await generateObsidianVaultBundleAction()
      if (res.success && res.files) {
        setExportedFilesCount(res.files.length)
        
        // Crea un file unico o scarica i markdown
        // Scarichiamo il file Markdown principale e le istruzioni
        const fullMarkdownDump = res.files
          .map((f) => `\n\n<!-- FILE: ${f.path} -->\n${f.content}`)
          .join('\n\n========================================\n')

        const blob = new Blob([fullMarkdownDump], { type: 'text/markdown;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `Aiutiamoci_Obsidian_Vault_${new Date().toISOString().split('T')[0]}.md`
        a.click()
        URL.revokeObjectURL(url)

        setExportModalOpen(true)
        playNotificationSound('chat')
      }
    } catch (err) {
      console.error('Errore export Obsidian:', err)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-6 flex flex-col min-h-[calc(100vh-8rem)]">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-6 sm:p-8 rounded-3xl border border-indigo-500/20 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 text-white flex items-center justify-center shadow-md">
              <Sparkles className="h-4 w-4" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Secondo Cervello & Prompt Library
            </h1>
            <Badge variant="purple" className="text-[10px] font-mono uppercase">
              Obsidian & Proton Ready
            </Badge>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            L'archivio centrale di conoscenza condivisa: copia formule di prompting verificate, consulta le dispense delle 20 lezioni ed esporta tutto il Vault in formato Markdown per Obsidian o Proton Drive.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10 flex-wrap">
          <a
            href="https://drive.proton.me/urls/XF6PZNAD84#yrottI5pvplQ"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              variant="outline"
              className="h-10 px-4 text-xs font-bold rounded-xl border-amber-500/30 bg-amber-950/30 hover:bg-amber-900/50 text-amber-200 gap-2"
            >
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span>Skills Hub (Proton Drive)</span>
            </Button>
          </a>

          <a
            href="https://drive.proton.me/urls/92VERQ5CQR#EP0hzsSBpyiY"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              variant="outline"
              className="h-10 px-4 text-xs font-bold rounded-xl border-purple-500/30 bg-purple-950/30 hover:bg-purple-900/50 text-purple-200 gap-2"
            >
              <ExternalLink className="h-4 w-4 text-purple-400" />
              <span>20 PDF Corsi (Proton Drive)</span>
            </Button>
          </a>

          <Button
            onClick={handleDownloadObsidianVault}
            disabled={isExporting}
            variant="outline"
            className="h-10 px-4 text-xs font-bold rounded-xl border-indigo-500/30 bg-indigo-950/30 hover:bg-indigo-900/50 text-indigo-200 gap-2"
          >
            {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FolderDown className="h-4 w-4 text-indigo-400" />}
            <span>Scarica Vault Obsidian (.md)</span>
          </Button>

          <Button
            onClick={() => setIsModalOpen(true)}
            className="h-10 px-5 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white gap-2 shadow-lg shadow-indigo-600/30"
          >
            <Plus className="h-4 w-4" />
            <span>Nuovo Prompt / Nota</span>
          </Button>
        </div>
      </div>

      {/* Search, Category Filter Pills & View Switcher */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Search Bar */}
          <div className="relative max-w-md w-full">
            <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-3" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cerca prompt per titolo, formula o tag (es. RCCF, Excel, Midjourney)..."
              className="pl-10 h-10 text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* View Mode Toggle: Schede vs Grafo */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={cn(
                'flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all',
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              <LayoutGrid className="h-4 w-4" />
              <span>Vista Schede</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('graph')}
              className={cn(
                'flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all',
                viewMode === 'graph'
                  ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              <Network className="h-4 w-4 text-indigo-300" />
              <span>Vista Grafo Neurale</span>
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id
            const Icon = cat.icon
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex-shrink-0 border ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isSelected ? 'text-white' : cat.color}`} />
                <span>{cat.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Content Area: Grafo Neurale oppure Griglia Schede */}
      {viewMode === 'graph' ? (
        <KnowledgeGraphView
          items={displayedItems}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          onCopyPrompt={handleCopy}
          copiedId={copiedId}
        />
      ) : displayedItems.length === 0 ? (
        <div className="p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
          <p className="text-sm font-semibold text-slate-400">Nessun prompt o risorsa trovata per questa categoria/ricerca.</p>
          <Button size="sm" variant="ghost" onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}>
            Reimposta Filtri
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedItems.map((item: KnowledgeItem) => {
            const isCopied = copiedId === item.id

            return (
              <Card
                key={item.id}
                className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs hover:shadow-md hover:border-indigo-400 dark:hover:border-indigo-500/50 transition-all flex flex-col justify-between overflow-hidden group"
              >
                <CardHeader className="p-5 pb-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800/50">
                      {(item.category || 'prompting').replace('_', ' ')}
                    </span>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleDelete(item.id, item.title || 'elemento')}
                        className="p-1 text-slate-400 hover:text-red-500 rounded-md"
                        title="Elimina"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <CardTitle className="text-sm font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">
                    {item.title || 'Prompt Risorsa'}
                  </CardTitle>

                  {item.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                </CardHeader>

                <CardContent className="p-5 pt-0 space-y-3">
                  {/* Content Code Preview */}
                  <div className="relative">
                    <pre className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 text-[11px] font-mono text-slate-800 dark:text-slate-300 overflow-hidden line-clamp-6 leading-relaxed whitespace-pre-wrap select-all">
                      {item.content || ''}
                    </pre>
                  </div>

                  {/* Tags */}
                  {Array.isArray(item.tags) && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.tags.map((t: string, idx: number) => (
                        <span
                          key={idx}
                          className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800/60 px-1.5 py-0.5 rounded"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Actions Bar */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-mono">
                      {item.lesson_id ? `Modulo ${item.lesson_id}` : 'Generale'}
                    </span>

                    <Button
                      size="sm"
                      onClick={() => handleCopy(item.id, item.content || '')}
                      className={`text-xs h-8 px-3 rounded-lg gap-1.5 font-bold transition-all ${
                        isCopied
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                      }`}
                    >
                      {isCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{isCopied ? 'Copiato!' : 'Copia Prompt'}</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* MODAL: Nuovo Prompt / Risorsa */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-600" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Aggiungi al Secondo Cervello
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePrompt} className="p-6 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Titolo del Prompt / Risorsa *</label>
                <Input
                  autoFocus
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Es. Formula Prompt per Email di Follow-up B2B"
                  className="text-xs dark:bg-slate-800 dark:border-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Categoria</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs text-slate-900 dark:text-white shadow-xs focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500"
                  >
                    <option value="prompting">🎯 Prompting & RCCF</option>
                    <option value="copywriting">✉️ Copy & Email B2B</option>
                    <option value="excel_data">📊 Excel & Analisi Dati</option>
                    <option value="visual_media">🎨 Immagini & Slide</option>
                    <option value="agents_workflows">🤖 Agenti & Automazioni</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Tag (Separati da virgola)</label>
                  <Input
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    placeholder="es. email, b2b, rccf"
                    className="text-xs dark:bg-slate-800 dark:border-slate-700 h-9"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Breve Descrizione</label>
                <Input
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Quando usare questo prompt e obiettivo finale..."
                  className="text-xs dark:bg-slate-800 dark:border-slate-700"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Testo del Prompt / Markdown *</label>
                <textarea
                  rows={6}
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Incolla il testo completo del prompt con le variabili tra parentesi quadre..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-xs text-slate-900 dark:text-white font-mono shadow-xs focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Annulla
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold gap-2"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  <span>Salva nel Cervello</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Guida all'uso di Obsidian & Proton Drive */}
      {exportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                <Check className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Vault Markdown Scaricato!</h3>
                <span className="text-[10px] text-slate-400 font-mono">{exportedFilesCount} file interconnessi esportati</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 space-y-2 leading-relaxed">
              <p className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Info className="h-4 w-4 text-indigo-400" />
                <span>Come usare questo file:</span>
              </p>
              <ul className="list-disc pl-4 space-y-1 text-[11px]">
                <li><strong>Su Obsidian</strong>: Apri o trascina il file nella cartella del tuo Vault per visualizzare subito i collegamenti bidirezionali.</li>
                <li><strong>Su Proton Drive</strong>: Salvalo nella tua cartella sincronizzata per averlo accessibile e crittografato su tutti i dispositivi.</li>
              </ul>
            </div>

            <Button onClick={() => setExportModalOpen(false)} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold">
              Ho Capito, Perfetto!
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
