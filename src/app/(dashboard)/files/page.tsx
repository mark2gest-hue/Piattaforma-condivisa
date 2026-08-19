'use client'

import { useState } from 'react'
import {
  FolderOpen,
  UploadCloud,
  FileText,
  FileCode,
  FileSpreadsheet,
  Download,
  Trash2,
  Search,
  CheckCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { formatBytes, formatDate } from '@/lib/utils'

interface TeamFile {
  id: string
  name: string
  category: 'course' | 'consulting' | 'ai_agent'
  sizeBytes: number
  mimeType: string
  uploadedBy: string
  createdAt: string
}

const mockFiles: TeamFile[] = [
  {
    id: 'f-1',
    name: 'Modulo_3_RAG_Embeddings_Slide.pdf',
    category: 'course',
    sizeBytes: 4820000,
    mimeType: 'application/pdf',
    uploadedBy: 'Marco (Dev)',
    createdAt: '2026-08-18T14:20:00Z',
  },
  {
    id: 'f-2',
    name: 'Specifiche_Agente_CustomerSupport_v1.docx',
    category: 'ai_agent',
    sizeBytes: 1250000,
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    uploadedBy: 'Luca (Dev)',
    createdAt: '2026-08-17T11:00:00Z',
  },
  {
    id: 'f-3',
    name: 'Offerta_Consulenza_AlfaCorp_2026.pdf',
    category: 'consulting',
    sizeBytes: 950000,
    mimeType: 'application/pdf',
    uploadedBy: 'Elena (Admin)',
    createdAt: '2026-08-16T16:45:00Z',
  },
  {
    id: 'f-4',
    name: 'Elenco_Iscritti_Masterclass_Q3.xlsx',
    category: 'course',
    sizeBytes: 340000,
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    uploadedBy: 'Sara (Ops)',
    createdAt: '2026-08-15T09:30:00Z',
  },
]

export default function FilesManagerPage() {
  const [files, setFiles] = useState<TeamFile[]>(mockFiles)
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredFiles = files.filter((f) => {
    const matchesCategory = filterCategory === 'all' || f.category === filterCategory
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const getFileIcon = (mime: string) => {
    if (mime.includes('pdf')) return <FileText className="h-5 w-5 text-red-500" />
    if (mime.includes('sheet') || mime.includes('excel')) return <FileSpreadsheet className="h-5 w-5 text-emerald-500" />
    return <FileCode className="h-5 w-5 text-blue-500" />
  }

  const handleUploadSimulated = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.onchange = (e: any) => {
      const file = e.target.files?.[0]
      if (file) {
        const newFile: TeamFile = {
          id: `f-${Date.now()}`,
          name: file.name,
          category: 'ai_agent',
          sizeBytes: file.size,
          mimeType: file.type || 'application/octet-stream',
          uploadedBy: 'Marco (Dev)',
          createdAt: new Date().toISOString(),
        }
        setFiles([newFile, ...files])
        alert(`File "${file.name}" caricato con successo nel bucket Supabase Storage!`)
      }
    }
    input.click()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <FolderOpen className="h-6 w-6 text-blue-600" />
            File & Risorse Condivise
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Archivio centralizzato su Supabase Storage con permessi RLS per il team.
          </p>
        </div>

        <Button
          onClick={handleUploadSimulated}
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 shadow-xs"
        >
          <UploadCloud className="h-4 w-4" />
          <span>Carica File</span>
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <Button
            variant={filterCategory === 'all' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilterCategory('all')}
            className={filterCategory === 'all' ? 'bg-blue-600 text-white' : 'text-slate-600'}
          >
            Tutti ({files.length})
          </Button>
          <Button
            variant={filterCategory === 'course' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilterCategory('course')}
            className={filterCategory === 'course' ? 'bg-purple-600 text-white' : 'text-slate-600'}
          >
            Corsi
          </Button>
          <Button
            variant={filterCategory === 'consulting' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilterCategory('consulting')}
            className={filterCategory === 'consulting' ? 'bg-sky-600 text-white' : 'text-slate-600'}
          >
            Consulenze
          </Button>
          <Button
            variant={filterCategory === 'ai_agent' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilterCategory('ai_agent')}
            className={filterCategory === 'ai_agent' ? 'bg-amber-600 text-white' : 'text-slate-600'}
          >
            Agenti AI
          </Button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filtra per nome file..."
            className="w-full h-8 pl-9 pr-3 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Files Table / List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Nome File</th>
                <th className="py-3 px-4">Ambito</th>
                <th className="py-3 px-4">Dimensione</th>
                <th className="py-3 px-4">Caricato Da</th>
                <th className="py-3 px-4">Data</th>
                <th className="py-3 px-4 text-right">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredFiles.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    <div className="flex items-center gap-2.5">
                      {getFileIcon(f.mimeType)}
                      <span className="truncate max-w-xs">{f.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge
                      variant={
                        f.category === 'course'
                          ? 'purple'
                          : f.category === 'consulting'
                          ? 'info'
                          : 'warning'
                      }
                      className="text-[10px] capitalize"
                    >
                      {f.category.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 font-mono">
                    {formatBytes(f.sizeBytes)}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium">
                    {f.uploadedBy}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">
                    {formatDate(f.createdAt)}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-slate-500 hover:text-blue-600"
                        title="Scarica"
                        onClick={() => alert(`Download avviato per ${f.name}`)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-slate-400 hover:text-red-600"
                        title="Elimina"
                        onClick={() => setFiles(files.filter((item) => item.id !== f.id))}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredFiles.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-slate-400">
                    Nessun file trovato corrispondente ai criteri selezionati.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
