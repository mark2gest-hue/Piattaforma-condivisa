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
  RefreshCw,
  Info,
  LayoutGrid,
  Network,
  FileText,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
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
  syncLocalObsidianVaultAction,
} from '@/app/actions/knowledge'

const CATEGORIES = [
  { id: 'all', label: 'Tutte le Risorse', icon: Layers, color: 'text-[#6366f1]' },
  { id: 'course_notes', label: 'Documenti & File AI', icon: FileText, color: 'text-cyan-600 dark:text-cyan-400' },
  { id: 'agents_workflows', label: 'Agenti & Automazioni', icon: Bot, color: 'text-pink-600 dark:text-pink-400' },
  { id: 'prompting', label: 'Prompting & RCCF', icon: Terminal, color: 'text-amber-600 dark:text-amber-400' },
  { id: 'copywriting', label: 'Copy & Email B2B', icon: BookOpen, color: 'text-blue-600 dark:text-blue-400' },
  { id: 'excel_data', label: 'Excel & Analisi Dati', icon: FileSpreadsheet, color: 'text-emerald-600 dark:text-emerald-400' },
  { id: 'visual_media', label: 'Immagini & Slide', icon: Palette, color: 'text-purple-600 dark:text-purple-400' },
]

export default function CervelloKnowledgePage() {
  const [items, setItems] = useState<KnowledgeItem[]>(DEFAULT_KNOWLEDGE_ITEMS)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
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

  // Estrazione dinamica dei tag più rilevanti con conteggio
  const availableTags = useMemo(() => {
    const list = Array.isArray(items) && items.length > 0 ? items : DEFAULT_KNOWLEDGE_ITEMS
    const tagCounts: Record<string, number> = {}
    list.forEach((item) => {
      if (Array.isArray(item?.tags)) {
        item.tags.forEach((t) => {
          if (typeof t === 'string' && t.trim()) {
            const clean = t.trim().toLowerCase()
            tagCounts[clean] = (tagCounts[clean] || 0) + 1
          }
        })
      }
    })
    return Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 16)
      .map(([tag, count]) => ({ tag, count }))
  }, [items])

  // Filtraggio istantaneo locale per categoria, tag e ricerca full-text
  const displayedItems = useMemo(() => {
    const list = Array.isArray(items) && items.length > 0 ? items : DEFAULT_KNOWLEDGE_ITEMS
    return list.filter((i) => {
      if (!i) return false
      if (selectedCategory && selectedCategory !== 'all' && i.category !== selectedCategory) {
        return false
      }
      if (selectedTag) {
        const hasTag = Array.isArray(i.tags) && i.tags.some((t) => typeof t === 'string' && t.toLowerCase() === selectedTag.toLowerCase())
        if (!hasTag) return false
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
  }, [items, selectedCategory, selectedTag, searchQuery])

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

    const [isSyncingLocal, setIsSyncingLocal] = useState(false)
  const [syncModalOpen, setSyncModalOpen] = useState(false)
  const [syncedCount, setSyncedCount] = useState(0)

  const handleSyncLocalObsidian = async () => {
    setIsSyncingLocal(true)
    try {
      const res = await syncLocalObsidianVaultAction()
      if (res && res.success) {
        setSyncedCount(res.count || 0)
        setSyncModalOpen(true)
        playNotificationSound("chat")
      } else {
        alert(res?.error || "Errore durante la sincronizzazione con Obsidian")
      }
    } catch (err: any) {
      console.error("Errore sync locale Obsidian:", err)
      alert("Errore di sincronizzazione: " + (err.message || "Server non raggiungibile"))
    } finally {
      setIsSyncingLocal(false)
    }
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
    <div className="h-full flex flex-col overflow-hidden bg-[#f7f6f3] dark:bg-[#0d0d0f] text-[#111113] dark:text-[#f4f4f5]">
      {/* Command Bar */}
      <div className="min-h-[52px] px-5 py-2 border-b border-[#e5e3dc] dark:border-white/[0.08] bg-[#ffffff] dark:bg-[#111114] flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <Sparkles className="h-4 w-4 text-[#6366f1] shrink-0" />
          <h1 className="text-sm font-semibold tracking-tight text-[#111113] dark:text-[#f4f4f5] font-[family-name:var(--font-jakarta)] truncate">
            Secondo Cervello & Prompt Library
          </h1>
          <span className="hidden sm:inline-block text-[11px] font-[family-name:var(--font-mono)] text-zinc-500 dark:text-zinc-400 border-l border-[#e5e3dc] dark:border-white/[0.08] pl-3">
            {displayedItems.length} / {items.length} note
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Search Input */}
          <div className="relative w-48 sm:w-64">
            <Search className="h-3.5 w-3.5 text-zinc-400 absolute left-2.5 top-2.5 pointer-events-none" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cerca prompt, formula o tag..."
              className="pl-8 pr-7 h-8 text-xs bg-[#f7f6f3] dark:bg-[#141417] border-[#e5e3dc] dark:border-white/[0.08] rounded-md text-[#111113] dark:text-[#f4f4f5] placeholder:text-zinc-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-2 text-zinc-400 hover:text-[#111113] dark:hover:text-[#f4f4f5] cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* View Mode Toggle: Schede vs Grafo */}
          <div className="flex items-center gap-0.5 p-0.5 bg-[#f7f6f3] dark:bg-[#141417] border border-[#e5e3dc] dark:border-white/[0.08] rounded-md">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer',
                viewMode === 'grid'
                  ? 'bg-[#111113] text-white dark:bg-[#f4f4f5] dark:text-[#0d0d0f]'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-[#111113] dark:hover:text-[#f4f4f5]'
              )}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Schede</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('graph')}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer',
                viewMode === 'graph'
                  ? 'bg-[#111113] text-white dark:bg-[#f4f4f5] dark:text-[#0d0d0f]'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-[#111113] dark:hover:text-[#f4f4f5]'
              )}
            >
              <Network className="h-3.5 w-3.5" />
              <span>Grafo</span>
            </button>
          </div>

          <a
            href="https://drive.proton.me/urls/XF6PZNAD84#yrottI5pvplQ"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2.5 text-xs font-medium rounded-md border-[#e5e3dc] dark:border-white/[0.08] bg-[#ffffff] dark:bg-[#141417] hover:bg-[#f7f6f3] dark:hover:bg-white/[0.04] text-[#111113] dark:text-[#f4f4f5] gap-1.5 cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span className="hidden xl:inline">Skills Hub</span>
            </Button>
          </a>

          <a
            href="https://drive.proton.me/urls/92VERQ5CQR#EP0hzsSBpyiY"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2.5 text-xs font-medium rounded-md border-[#e5e3dc] dark:border-white/[0.08] bg-[#ffffff] dark:bg-[#141417] hover:bg-[#f7f6f3] dark:hover:bg-white/[0.04] text-[#111113] dark:text-[#f4f4f5] gap-1.5 cursor-pointer"
            >
              <ExternalLink className="h-3.5 w-3.5 text-[#6366f1]" />
              <span className="hidden xl:inline">20 PDF Corsi</span>
            </Button>
          </a>

          <Button
            onClick={handleSyncLocalObsidian}
            disabled={isSyncingLocal}
            variant="outline"
            size="sm"
            className="h-8 px-2.5 text-xs font-medium rounded-md border-[#e5e3dc] dark:border-white/[0.08] bg-[#ffffff] dark:bg-[#141417] hover:bg-[#f7f6f3] dark:hover:bg-white/[0.04] text-[#111113] dark:text-[#f4f4f5] gap-1.5 cursor-pointer"
            title="Sincronizza direttamente nel Vault Obsidian locale su Mac e iCloud"
          >
            {isSyncingLocal ? <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-500" /> : <RefreshCw className="h-3.5 w-3.5 text-emerald-500" />}
            <span className="hidden lg:inline">Sincronizza Obsidian</span>
          </Button>

          <Button
            onClick={handleDownloadObsidianVault}
            disabled={isExporting}
            variant="outline"
            size="sm"
            className="h-8 px-2.5 text-xs font-medium rounded-md border-[#e5e3dc] dark:border-white/[0.08] bg-[#ffffff] dark:bg-[#141417] hover:bg-[#f7f6f3] dark:hover:bg-white/[0.04] text-[#111113] dark:text-[#f4f4f5] gap-1.5 cursor-pointer"
            title="Scarica Vault Obsidian (.md)"
          >
            {isExporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FolderDown className="h-3.5 w-3.5 text-[#6366f1]" />}
            <span className="hidden lg:inline">Esporta .md</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="h-8 px-3 text-xs font-medium rounded-md bg-[#111113] hover:bg-[#111113]/90 text-white dark:bg-[#f4f4f5] dark:hover:bg-[#f4f4f5]/90 dark:text-[#0d0d0f] gap-1.5 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Nuovo Prompt</span>
          </Button>
        </div>
      </div>

      {/* Category Tab Strip — Swiss Hairline */}
      <div className="px-5 border-b border-[#e5e3dc] dark:border-white/[0.08] bg-[#ffffff] dark:bg-[#111114] flex items-center gap-1 overflow-x-auto shrink-0">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id
          const Icon = cat.icon
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-colors shrink-0 border-b-2 cursor-pointer ${
                isSelected
                  ? 'border-[#6366f1] text-[#111113] dark:text-[#f4f4f5]'
                  : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-[#111113] dark:hover:text-[#f4f4f5]'
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${isSelected ? 'text-[#6366f1]' : cat.color}`} />
              <span>{cat.label}</span>
            </button>
          )
        })}
      </div>

      {/* Quick Tag Strip + Active Filters */}
      {(availableTags.length > 0 || selectedCategory !== 'all' || selectedTag || searchQuery) && (
        <div className="px-5 py-2 border-b border-[#e5e3dc] dark:border-white/[0.08] bg-[#f7f6f3] dark:bg-[#0d0d0f] flex flex-col gap-2 shrink-0">
          {availableTags.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
              <span className="text-[10px] font-[family-name:var(--font-mono)] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1 shrink-0 mr-1">
                <Tag className="h-3 w-3 text-[#6366f1]" />
                Tag
              </span>
              <button
                type="button"
                onClick={() => setSelectedTag(null)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors shrink-0 cursor-pointer border ${
                  !selectedTag
                    ? 'bg-[#111113] text-white border-[#111113] dark:bg-[#f4f4f5] dark:text-[#0d0d0f] dark:border-[#f4f4f5]'
                    : 'bg-[#ffffff] dark:bg-[#141417] border-[#e5e3dc] dark:border-white/[0.08] text-zinc-600 dark:text-zinc-400 hover:text-[#111113] dark:hover:text-[#f4f4f5]'
                }`}
              >
                Tutti
              </button>
              {availableTags.map(({ tag, count }) => {
                const isTagActive = selectedTag === tag
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSelectedTag(isTagActive ? null : tag)}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors shrink-0 flex items-center gap-1 cursor-pointer border ${
                      isTagActive
                        ? 'bg-[#6366f1] text-white border-[#6366f1]'
                        : 'bg-[#ffffff] dark:bg-[#141417] border-[#e5e3dc] dark:border-white/[0.08] text-zinc-600 dark:text-zinc-400 hover:text-[#111113] dark:hover:text-[#f4f4f5]'
                    }`}
                  >
                    <span>#{tag}</span>
                    <span
                      className={`text-[10px] font-[family-name:var(--font-mono)] ${
                        isTagActive ? 'text-white/80' : 'text-zinc-400 dark:text-zinc-500'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>
          )}

          {(selectedCategory !== 'all' || selectedTag || searchQuery) && (
            <div className="flex items-center justify-between pt-1.5 border-t border-[#e5e3dc] dark:border-white/[0.08] text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Filtri attivi:</span>
                {selectedCategory !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-[#6366f1]/30 bg-[#6366f1]/10 text-[#6366f1] text-[11px]">
                    {CATEGORIES.find((c) => c.id === selectedCategory)?.label || selectedCategory}
                    <button type="button" onClick={() => setSelectedCategory('all')} className="hover:text-red-500 cursor-pointer">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {selectedTag && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-[#6366f1]/30 bg-[#6366f1]/10 text-[#6366f1] text-[11px]">
                    #{selectedTag}
                    <button type="button" onClick={() => setSelectedTag(null)} className="hover:text-red-500 cursor-pointer">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {searchQuery && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-[#6366f1]/30 bg-[#6366f1]/10 text-[#6366f1] text-[11px]">
                    &ldquo;{searchQuery}&rdquo;
                    <button type="button" onClick={() => setSearchQuery('')} className="hover:text-red-500 cursor-pointer">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                <span className="text-zinc-500 dark:text-zinc-400 text-[11px] font-[family-name:var(--font-mono)]">
                  ({displayedItems.length})
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all')
                  setSelectedTag(null)
                  setSearchQuery('')
                }}
                className="text-[11px] font-medium text-[#6366f1] hover:underline shrink-0 cursor-pointer"
              >
                Azzera filtri
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main Content Area: Grafo Neurale oppure Griglia Hairline */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {viewMode === 'graph' ? (
          <div className="p-4 sm:p-5 h-full">
            <KnowledgeGraphView
              items={displayedItems}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              onCopyPrompt={handleCopy}
              copiedId={copiedId}
            />
          </div>
        ) : displayedItems.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-12 text-center space-y-3">
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Nessun prompt o risorsa trovata per questa categoria/ricerca.
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSelectedCategory('all')
                setSelectedTag(null)
                setSearchQuery('')
              }}
              className="h-8 text-xs bg-[#ffffff] dark:bg-[#141417] border-[#e5e3dc] dark:border-white/[0.08]"
            >
              Reimposta Filtri
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[#e5e3dc] dark:bg-white/[0.08] border-b border-[#e5e3dc] dark:border-white/[0.08]">
            {displayedItems.map((item: KnowledgeItem) => {
              const isCopied = copiedId === item.id

              return (
                <div
                  key={item.id}
                  className="bg-[#ffffff] dark:bg-[#111114] hover:bg-[#f7f6f3]/70 dark:hover:bg-[#141417] transition-colors p-5 flex flex-col justify-between gap-4 group"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-[family-name:var(--font-mono)] uppercase font-medium tracking-wider text-[#6366f1] bg-[#6366f1]/10 px-2 py-0.5 rounded border border-[#6366f1]/25">
                        {(item.category || 'prompting').replace('_', ' ')}
                      </span>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id, item.title || 'elemento')}
                          className="p-1 text-zinc-400 hover:text-red-500 rounded cursor-pointer"
                          title="Elimina"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <h2 className="text-sm font-semibold text-[#111113] dark:text-[#f4f4f5] leading-snug line-clamp-2 font-[family-name:var(--font-jakarta)]">
                      {item.title || 'Prompt Risorsa'}
                    </h2>

                    {item.description && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    {/* Content Code Preview */}
                    <pre className="p-3 rounded-md bg-[#f7f6f3] dark:bg-[#0d0d0f] border border-[#e5e3dc] dark:border-white/[0.08] text-[11px] font-[family-name:var(--font-mono)] text-[#111113] dark:text-zinc-300 overflow-hidden line-clamp-6 leading-relaxed whitespace-pre-wrap select-all">
                      {item.content || ''}
                    </pre>

                    {/* Tags */}
                    {Array.isArray(item.tags) && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {item.tags.map((t: string, idx: number) => {
                          const clean = typeof t === 'string' ? t.trim().toLowerCase() : ''
                          if (!clean) return null
                          const isThisTagActive = selectedTag === clean
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedTag(isThisTagActive ? null : clean)
                              }}
                              className={`text-[10px] font-[family-name:var(--font-mono)] px-1.5 py-0.5 rounded transition-colors cursor-pointer border ${
                                isThisTagActive
                                  ? 'bg-[#6366f1] text-white border-[#6366f1]'
                                  : 'text-zinc-500 dark:text-zinc-400 bg-[#f7f6f3] dark:bg-[#141417] border-[#e5e3dc] dark:border-white/[0.08] hover:border-[#6366f1]/40 hover:text-[#6366f1]'
                              }`}
                              title={`Filtra per #${clean}`}
                            >
                              #{clean}
                            </button>
                          )
                        })}
                      </div>
                    )}

                    {/* Actions Bar */}
                    <div className="pt-2.5 border-t border-[#e5e3dc] dark:border-white/[0.08] flex items-center justify-between">
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-[family-name:var(--font-mono)]">
                        {item.lesson_id ? `Modulo ${item.lesson_id}` : 'Generale'}
                      </span>

                      <Button
                        size="sm"
                        onClick={() => handleCopy(item.id, item.content || '')}
                        className={`text-xs h-7 px-2.5 rounded-md gap-1.5 font-medium transition-colors cursor-pointer ${
                          isCopied
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                            : 'bg-[#111113] hover:bg-[#111113]/90 text-white dark:bg-[#f4f4f5] dark:hover:bg-[#f4f4f5]/90 dark:text-[#0d0d0f]'
                        }`}
                      >
                        {isCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        <span>{isCopied ? 'Copiato' : 'Copia Prompt'}</span>
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* MODAL: Nuovo Prompt / Risorsa */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-[#ffffff] dark:bg-[#111114] rounded-lg w-full max-w-lg border border-[#e5e3dc] dark:border-white/[0.08] overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#e5e3dc] dark:border-white/[0.08] flex items-center justify-between bg-[#f7f6f3] dark:bg-[#141417]">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#6366f1]" />
                <h3 className="font-semibold text-sm text-[#111113] dark:text-[#f4f4f5] font-[family-name:var(--font-jakarta)]">
                  Aggiungi al Secondo Cervello
                </h3>
              </div>
              <button type="button" onClick={() => setIsModalOpen(false)} className="p-1 text-zinc-400 hover:text-[#111113] dark:hover:text-[#f4f4f5] cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePrompt} className="p-5 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-medium text-zinc-700 dark:text-zinc-300">Titolo del Prompt / Risorsa *</label>
                <Input
                  autoFocus
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Es. Formula Prompt per Email di Follow-up B2B"
                  className="text-xs h-9 bg-[#f7f6f3] dark:bg-[#141417] border-[#e5e3dc] dark:border-white/[0.08]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-medium text-zinc-700 dark:text-zinc-300">Categoria</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full h-9 rounded-md border border-[#e5e3dc] dark:border-white/[0.08] bg-[#f7f6f3] dark:bg-[#141417] px-3 text-xs text-[#111113] dark:text-[#f4f4f5] focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-[#6366f1]"
                  >
                    <option value="prompting">Prompting & RCCF</option>
                    <option value="copywriting">Copy & Email B2B</option>
                    <option value="excel_data">Excel & Analisi Dati</option>
                    <option value="visual_media">Immagini & Slide</option>
                    <option value="agents_workflows">Agenti & Automazioni</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-medium text-zinc-700 dark:text-zinc-300">Tag (Separati da virgola)</label>
                  <Input
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    placeholder="es. email, b2b, rccf"
                    className="text-xs h-9 bg-[#f7f6f3] dark:bg-[#141417] border-[#e5e3dc] dark:border-white/[0.08]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-medium text-zinc-700 dark:text-zinc-300">Breve Descrizione</label>
                <Input
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Quando usare questo prompt e obiettivo finale..."
                  className="text-xs h-9 bg-[#f7f6f3] dark:bg-[#141417] border-[#e5e3dc] dark:border-white/[0.08]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-medium text-zinc-700 dark:text-zinc-300">Testo del Prompt / Markdown *</label>
                <textarea
                  rows={6}
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Incolla il testo completo del prompt con le variabili tra parentesi quadre..."
                  className="w-full rounded-md border border-[#e5e3dc] dark:border-white/[0.08] bg-[#f7f6f3] dark:bg-[#141417] p-3 text-xs text-[#111113] dark:text-[#f4f4f5] font-[family-name:var(--font-mono)] focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-[#6366f1]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e5e3dc] dark:border-white/[0.08]">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="h-8 text-xs border-[#e5e3dc] dark:border-white/[0.08] bg-[#ffffff] dark:bg-[#141417]"
                >
                  Annulla
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-8 text-xs bg-[#111113] hover:bg-[#111113]/90 text-white dark:bg-[#f4f4f5] dark:hover:bg-[#f4f4f5]/90 dark:text-[#0d0d0f] font-medium gap-1.5 cursor-pointer"
                >
                  {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  <span>Salva nel Cervello</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Guida all'uso di Obsidian & Proton Drive */}
      {syncModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-[#ffffff] dark:bg-[#111114] rounded-lg w-full max-w-md border border-[#e5e3dc] dark:border-white/[0.08] p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/25 flex items-center justify-center shrink-0">
                <Check className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-[#111113] dark:text-[#f4f4f5] font-[family-name:var(--font-jakarta)]">
                  Vault Obsidian Sincronizzato
                </h3>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-[family-name:var(--font-mono)]">
                  {syncedCount} note aggiornate in tempo reale
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-md bg-[#f7f6f3] dark:bg-[#141417] border border-[#e5e3dc] dark:border-white/[0.08] text-xs text-zinc-600 dark:text-zinc-300 space-y-2 leading-relaxed">
              <p className="font-medium text-[#111113] dark:text-[#f4f4f5] flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 text-emerald-500" />
                Aggiornamento Diretto su Mac & iCloud
              </p>
              <p>
                Tutte le note del Secondo Cervello sono state scritte nella cartella:
                <br />
                <code className="text-[11px] bg-[#ffffff] dark:bg-[#0d0d0f] border border-[#e5e3dc] dark:border-white/[0.08] px-1.5 py-0.5 rounded font-[family-name:var(--font-mono)] text-emerald-600 dark:text-emerald-400 inline-block mt-1">
                  KnowledgeBase/07_Secondo_Cervello_Aiutiamoci/
                </code>
              </p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                I file sono visibili e sincronizzati istantaneamente su Obsidian (Mac, iPad e iPhone).
              </p>
            </div>

            <Button
              onClick={() => setSyncModalOpen(false)}
              className="w-full bg-[#111113] hover:bg-[#111113]/90 text-white dark:bg-[#f4f4f5] dark:hover:bg-[#f4f4f5]/90 dark:text-[#0d0d0f] font-medium text-xs h-9 rounded-md cursor-pointer"
            >
              Chiudi
            </Button>
          </div>
        </div>
      )}

      {exportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-[#ffffff] dark:bg-[#111114] rounded-lg w-full max-w-md border border-[#e5e3dc] dark:border-white/[0.08] p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-md bg-[#6366f1]/10 text-[#6366f1] border border-[#6366f1]/25 flex items-center justify-center shrink-0">
                <Check className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-[#111113] dark:text-[#f4f4f5] font-[family-name:var(--font-jakarta)]">
                  Vault Markdown Scaricato
                </h3>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-[family-name:var(--font-mono)]">
                  {exportedFilesCount} file interconnessi esportati
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-md bg-[#f7f6f3] dark:bg-[#141417] border border-[#e5e3dc] dark:border-white/[0.08] text-xs text-zinc-600 dark:text-zinc-300 space-y-2 leading-relaxed">
              <p className="font-medium text-[#111113] dark:text-[#f4f4f5] flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 text-[#6366f1]" />
                <span>Come usare questo file:</span>
              </p>
              <ul className="list-disc pl-4 space-y-1 text-[11px]">
                <li><strong>Su Obsidian</strong>: Apri o trascina il file nella cartella del tuo Vault per visualizzare subito i collegamenti bidirezionali.</li>
                <li><strong>Su Proton Drive</strong>: Salvalo nella tua cartella sincronizzata per averlo accessibile e crittografato su tutti i dispositivi.</li>
              </ul>
            </div>

            <Button
              onClick={() => setExportModalOpen(false)}
              className="w-full bg-[#111113] hover:bg-[#111113]/90 text-white dark:bg-[#f4f4f5] dark:hover:bg-[#f4f4f5]/90 dark:text-[#0d0d0f] font-medium text-xs h-9 rounded-md cursor-pointer"
            >
              Chiudi
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
