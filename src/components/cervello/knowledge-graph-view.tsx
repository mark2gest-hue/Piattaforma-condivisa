'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import {
  Sparkles,
  Copy,
  Check,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Layers,
  Terminal,
  BookOpen,
  FileSpreadsheet,
  Palette,
  Bot,
  ExternalLink,
  Tag,
  Info,
  Maximize2,
  Minimize2,
  Search,
  X,
} from 'lucide-react'
import { KnowledgeItem } from '@/lib/knowledge-data'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { playNotificationSound } from '@/lib/notifications'

interface GraphNode {
  id: string
  label: string
  type: 'core' | 'category' | 'item' | 'tag'
  category?: string
  color: string
  glowColor: string
  radius: number
  x: number
  y: number
  vx: number
  vy: number
  itemData?: KnowledgeItem
  connections: string[]
}

interface GraphLink {
  source: string
  target: string
  color?: string
}

interface KnowledgeGraphViewProps {
  items: KnowledgeItem[]
  selectedCategory: string
  onSelectCategory: (catId: string) => void
  onCopyPrompt: (id: string, text: string) => void
  copiedId: string | null
}

const CATEGORY_CONFIG: Record<string, { label: string; color: string; glow: string; icon: any }> = {
  prompting: { label: '🎯 Prompting & RCCF', color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.4)', icon: Terminal },
  copywriting: { label: '✉️ Copy & Email B2B', color: '#3b82f6', glow: 'rgba(59, 130, 246, 0.4)', icon: BookOpen },
  excel_data: { label: '📊 Excel & Analisi Dati', color: '#10b981', glow: 'rgba(16, 185, 129, 0.4)', icon: FileSpreadsheet },
  visual_media: { label: '🎨 Immagini & Slide', color: '#a855f7', glow: 'rgba(168, 85, 247, 0.4)', icon: Palette },
  agents_workflows: { label: '🤖 Agenti & Automazioni', color: '#ec4899', glow: 'rgba(236, 72, 153, 0.4)', icon: Bot },
}

export function KnowledgeGraphView({
  items,
  selectedCategory,
  onSelectCategory,
  onCopyPrompt,
  copiedId,
}: KnowledgeGraphViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [activeFilter, setActiveFilter] = useState<'all' | 'prompts' | 'modules'>('all')

  // Dimensioni canvas virtuale
  const width = 1000
  const height = 650
  const centerX = width / 2
  const centerY = height / 2

  // Genera nodi e link del grafo
  const { nodes, links } = useMemo(() => {
    const nodeList: GraphNode[] = []
    const linkList: GraphLink[] = []

    // 1. Nodo Centrale (Nucleo del Secondo Cervello)
    const coreId = 'node-core'
    nodeList.push({
      id: coreId,
      label: '🧠 Secondo Cervello',
      type: 'core',
      color: '#6366f1',
      glowColor: 'rgba(99, 102, 241, 0.5)',
      radius: 36,
      x: centerX,
      y: centerY,
      vx: 0,
      vy: 0,
      connections: [],
    })

    // 2. Nodi Categoria (Orbitanti attorno al Core)
    const catKeys = Object.keys(CATEGORY_CONFIG)
    const catRadius = 160

    catKeys.forEach((catKey, idx) => {
      const angle = (idx / catKeys.length) * Math.PI * 2 - Math.PI / 2
      const catId = `cat-${catKey}`
      const config = CATEGORY_CONFIG[catKey]

      const catX = centerX + Math.cos(angle) * catRadius
      const catY = centerY + Math.sin(angle) * catRadius

      nodeList.push({
        id: catId,
        label: config.label,
        type: 'category',
        category: catKey,
        color: config.color,
        glowColor: config.glow,
        radius: 24,
        x: catX,
        y: catY,
        vx: 0,
        vy: 0,
        connections: [coreId],
      })

      // Link Core <-> Categoria
      linkList.push({
        source: coreId,
        target: catId,
        color: config.color,
      })
    })

    // 3. Nodi Item / Prompt (Distribuiti attorno alla loro Categoria)
    const itemsToRender = items.filter((item) => {
      if (!selectedCategory || selectedCategory === 'all') return true
      return item.category === selectedCategory
    })

    // Raggruppa items per categoria per calcolare gli angoli dei satelliti
    const itemsByCat: Record<string, KnowledgeItem[]> = {}
    itemsToRender.forEach((item) => {
      const cat = item.category || 'prompting'
      if (!itemsByCat[cat]) itemsByCat[cat] = []
      itemsByCat[cat].push(item)
    })

    Object.entries(itemsByCat).forEach(([catKey, catItems]) => {
      const catNode = nodeList.find((n) => n.id === `cat-${catKey}`)
      const catX = catNode ? catNode.x : centerX
      const catY = catNode ? catNode.y : centerY
      const config = CATEGORY_CONFIG[catKey] || CATEGORY_CONFIG.prompting

      const itemDistance = 110

      catItems.forEach((item, itemIdx) => {
        const catAngle = Math.atan2(catY - centerY, catX - centerX)
        const spreadAngle = 1.6 // Ampiezza ventaglio
        const itemAngle =
          catItems.length === 1
            ? catAngle
            : catAngle - spreadAngle / 2 + (itemIdx / (catItems.length - 1)) * spreadAngle

        const itemX = catX + Math.cos(itemAngle) * itemDistance
        const itemY = catY + Math.sin(itemAngle) * itemDistance
        const itemId = `item-${item.id}`

        nodeList.push({
          id: itemId,
          label: item.title,
          type: 'item',
          category: item.category,
          color: config.color,
          glowColor: config.glow,
          radius: item.is_featured ? 18 : 14,
          x: itemX,
          y: itemY,
          vx: 0,
          vy: 0,
          itemData: item,
          connections: [`cat-${catKey}`],
        })

        // Link Categoria <-> Prompt
        linkList.push({
          source: `cat-${catKey}`,
          target: itemId,
          color: 'rgba(148, 163, 184, 0.25)',
        })
      })
    })

    return { nodes: nodeList, links: linkList }
  }, [items, selectedCategory, centerX, centerY])

  // Drag & Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, .inspector-panel')) return
    setIsDragging(true)
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const resetView = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
    setSelectedNode(null)
  }

  // Trova le connessioni attive per il nodo selezionato o hovered
  const activeConnections = useMemo(() => {
    const targetId = hoveredNodeId || selectedNode?.id
    if (!targetId) return new Set<string>()

    const set = new Set<string>()
    set.add(targetId)

    links.forEach((l) => {
      if (l.source === targetId) set.add(l.target)
      if (l.target === targetId) set.add(l.source)
    })

    return set
  }, [hoveredNodeId, selectedNode, links])

  return (
    <div
      ref={containerRef}
      className={`relative rounded-3xl border border-indigo-500/20 bg-slate-950 overflow-hidden select-none transition-all ${
        isFullscreen ? 'fixed inset-4 z-50 shadow-2xl' : 'h-[650px] shadow-xl'
      }`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />

      {/* Top Left Toolbar Info */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl px-4 py-2 flex items-center gap-2 shadow-lg">
          <Sparkles className="h-4 w-4 text-indigo-400 animate-pulse" />
          <span className="text-xs font-bold text-white">Mappa Sinaptica Connessioni</span>
          <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 text-[10px] uppercase font-mono">
            {nodes.filter((n) => n.type === 'item').length} Nodi Attivi
          </Badge>
        </div>
      </div>

      {/* Top Right Zoom Controls */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-1 shadow-lg">
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setZoom((z) => Math.min(z + 0.2, 2))}
          className="h-8 w-8 text-slate-400 hover:text-white rounded-xl"
          title="Zoom In"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setZoom((z) => Math.max(z - 0.2, 0.5))}
          className="h-8 w-8 text-slate-400 hover:text-white rounded-xl"
          title="Zoom Out"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={resetView}
          className="h-8 w-8 text-slate-400 hover:text-white rounded-xl"
          title="Centra Vista"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="h-8 w-8 text-slate-400 hover:text-white rounded-xl"
          title={isFullscreen ? 'Riduci' : 'Schermo Intero'}
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>
      </div>

      {/* SVG Canvas for Links & Nodes */}
      <svg
        className="w-full h-full cursor-grab active:cursor-grabbing"
        viewBox={`0 0 ${width} ${height}`}
      >
        <g
          transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}
          style={{ transformOrigin: `${centerX}px ${centerY}px` }}
        >
          {/* Sfumature ed effetti Glow */}
          <defs>
            <filter id="glow-core" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <radialGradient id="grad-core" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#4f46e5" />
            </radialGradient>
          </defs>

          {/* Anelli Orbitali Concentrici */}
          <circle
            cx={centerX}
            cy={centerY}
            r={160}
            fill="none"
            stroke="rgba(99, 102, 241, 0.12)"
            strokeWidth="1.5"
            strokeDasharray="4 6"
            className="animate-spin opacity-40"
            style={{ animationDuration: '60s', transformOrigin: `${centerX}px ${centerY}px` }}
          />
          <circle
            cx={centerX}
            cy={centerY}
            r={270}
            fill="none"
            stroke="rgba(148, 163, 184, 0.08)"
            strokeWidth="1"
            strokeDasharray="6 8"
            className="animate-spin opacity-30"
            style={{ animationDuration: '100s', animationDirection: 'reverse', transformOrigin: `${centerX}px ${centerY}px` }}
          />

          {/* Linee di Connessione (Links) */}
          {links.map((link, idx) => {
            const sourceNode = nodes.find((n) => n.id === link.source)
            const targetNode = nodes.find((n) => n.id === link.target)
            if (!sourceNode || !targetNode) return null

            const isHighlighted =
              activeConnections.has(sourceNode.id) && activeConnections.has(targetNode.id)

            return (
              <line
                key={idx}
                x1={sourceNode.x}
                y1={sourceNode.y}
                x2={targetNode.x}
                y2={targetNode.y}
                stroke={isHighlighted ? (link.color || '#818cf8') : 'rgba(71, 85, 105, 0.3)'}
                strokeWidth={isHighlighted ? 2.5 : 1}
                strokeOpacity={isHighlighted ? 1 : 0.5}
                className="transition-all duration-300"
              />
            )
          })}

          {/* Nodi (Nodes) */}
          {nodes.map((node) => {
            const isSelected = selectedNode?.id === node.id
            const isHovered = hoveredNodeId === node.id
            const isConnected = activeConnections.size === 0 || activeConnections.has(node.id)

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedNode(node)
                  if (node.type === 'category' && node.category) {
                    onSelectCategory(node.category)
                  }
                  playNotificationSound('chat')
                }}
                onMouseEnter={() => setHoveredNodeId(node.id)}
                onMouseLeave={() => setHoveredNodeId(null)}
                className="cursor-pointer transition-transform duration-200"
                style={{
                  opacity: isConnected ? 1 : 0.25,
                  transform: `translate(${node.x}px, ${node.y}px) scale(${
                    isSelected ? 1.25 : isHovered ? 1.15 : 1
                  })`,
                  transformOrigin: '0 0',
                }}
              >
                {/* Glow ring on hover/selection */}
                {(isSelected || isHovered) && (
                  <circle
                    r={node.radius + 8}
                    fill="none"
                    stroke={node.color}
                    strokeWidth="2"
                    strokeOpacity="0.6"
                    className="animate-ping opacity-60"
                  />
                )}

                {/* Node Outer Halo */}
                <circle
                  r={node.radius + 3}
                  fill={node.glowColor}
                  opacity={isSelected || isHovered ? 0.8 : 0.3}
                />

                {/* Main Node Body */}
                <circle
                  r={node.radius}
                  fill={node.type === 'core' ? 'url(#grad-core)' : '#0f172a'}
                  stroke={node.color}
                  strokeWidth={node.type === 'core' ? 3 : node.type === 'category' ? 2.5 : 1.5}
                  filter={node.type === 'core' ? 'url(#glow-core)' : undefined}
                />

                {/* Node Text Label */}
                <text
                  y={node.radius + 14}
                  textAnchor="middle"
                  fill={isSelected ? '#ffffff' : '#cbd5e1'}
                  fontSize={node.type === 'core' ? 12 : node.type === 'category' ? 11 : 9}
                  fontWeight={node.type === 'core' || node.type === 'category' ? 'bold' : 'normal'}
                  className="font-sans pointer-events-none select-none drop-shadow-md"
                >
                  {node.label.length > 26 ? `${node.label.slice(0, 24)}…` : node.label}
                </text>

                {/* Subtag/Module info under item nodes */}
                {node.itemData?.lesson_id && (
                  <text
                    y={node.radius + 25}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize={7.5}
                    fontFamily="monospace"
                    className="pointer-events-none select-none opacity-80"
                  >
                    Mod. {node.itemData.lesson_id}
                  </text>
                )}
              </g>
            )
          })}
        </g>
      </svg>

      {/* Bottom Floating Legend / Quick Helper */}
      <div className="absolute bottom-4 left-4 z-20 hidden sm:flex items-center gap-3 bg-slate-900/90 backdrop-blur-md border border-slate-800 px-4 py-2 rounded-2xl text-[11px] text-slate-400 shadow-lg">
        <span className="flex items-center gap-1.5 font-bold text-slate-300">
          <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
          Guida al Grafo:
        </span>
        <span>• Clicca un nodo per ispezionare il prompt</span>
        <span>• Trascina per esplorare la mappa</span>
      </div>

      {/* Slide-out Inspector Drawer when a Node is clicked */}
      {selectedNode && (
        <div className="inspector-panel absolute top-4 right-4 bottom-4 w-96 max-w-[calc(100%-2rem)] bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-3xl p-5 shadow-2xl z-30 flex flex-col justify-between animate-in slide-in-from-right duration-200">
          <div className="space-y-4 overflow-y-auto pr-1">
            {/* Header with Close */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div
                  className="h-8 w-8 rounded-xl flex items-center justify-center text-white shadow-md"
                  style={{ backgroundColor: selectedNode.color }}
                >
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                    {selectedNode.type === 'core'
                      ? 'Nucleo Centrale'
                      : selectedNode.type === 'category'
                      ? 'Categoria di Conoscenza'
                      : 'Prompt & Risorsa'}
                  </span>
                  <h3 className="font-bold text-sm text-white leading-tight">
                    {selectedNode.label}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setSelectedNode(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content for Item Nodes */}
            {selectedNode.itemData ? (
              <div className="space-y-3 text-xs">
                {selectedNode.itemData.description && (
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    {selectedNode.itemData.description}
                  </p>
                )}

                {/* Prompt Preview Code Block */}
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">
                    Testo Formula / Prompt:
                  </span>
                  <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-200 overflow-x-auto max-h-56 leading-relaxed whitespace-pre-wrap select-all">
                    {selectedNode.itemData.content}
                  </pre>
                </div>

                {/* Tags */}
                {Array.isArray(selectedNode.itemData.tags) &&
                  selectedNode.itemData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {selectedNode.itemData.tags.map((t, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}

                {/* Module Link info */}
                {selectedNode.itemData.lesson_id && (
                  <div className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-[11px] text-indigo-300 flex items-center justify-between">
                    <span>Collegato alla <strong>Lezione {selectedNode.itemData.lesson_id}</strong></span>
                    <Badge variant="purple" className="text-[9px]">AI Start</Badge>
                  </div>
                )}
              </div>
            ) : selectedNode.type === 'category' ? (
              <div className="space-y-3 text-xs text-slate-300">
                <p>
                  Categoria tematica che raggruppa tutti i prompt ed i framework correlati.
                </p>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px]">
                  <strong>Nodi collegati:</strong>{' '}
                  {
                    items.filter((i) => i.category === selectedNode.category).length
                  }{' '}
                  risorse attive in questa sezione.
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs text-slate-300">
                <p>
                  Il nodo centrale che coordina l'intero grafo della conoscenza condivisa di Ti AIuto.
                </p>
                <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-[11px] text-indigo-200">
                  Tutte le note sono sincronizzate e pronte per l'esportazione verso <strong>Obsidian</strong> e <strong>Proton Drive</strong>.
                </div>
              </div>
            )}
          </div>

          {/* Bottom Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
            {selectedNode.itemData ? (
              <Button
                onClick={() =>
                  onCopyPrompt(selectedNode.itemData!.id, selectedNode.itemData!.content)
                }
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold h-9 text-xs gap-1.5 rounded-xl shadow-lg shadow-indigo-600/30"
              >
                {copiedId === selectedNode.itemData.id ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    <span>Copiato negli Appunti!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copia Prompt</span>
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={() => setSelectedNode(null)}
                variant="outline"
                className="w-full border-slate-700 text-xs rounded-xl"
              >
                Chiudi Ispettore
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
