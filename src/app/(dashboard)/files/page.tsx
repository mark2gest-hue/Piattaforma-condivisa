'use client'

import { useState, useEffect } from 'react'
import {
  FolderOpen,
  FolderPlus,
  Folder,
  UploadCloud,
  FileText,
  FileCode,
  FileSpreadsheet,
  Download,
  Trash2,
  Search,
  Loader2,
  Eye,
  X,
  ExternalLink,
  ImageIcon,
  ChevronRight,
  Home,
  Sparkles,
  Bot,
  ListPlus,
  CheckCircle2,
  Copy,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { formatBytes, formatDate } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { notifyFileUploadAction } from '@/app/actions/notifications'
import { analyzeFileWithAIAction, convertFileAnalysisToTaskAction, FileAnalysisResult } from '@/app/actions/file-ai'
import { FileItem, Profile } from '@/types/index'

type FileWithUploader = FileItem & { uploader?: Profile; parent_folder_id?: string | null }

interface FolderBreadcrumb {
  id: string | null
  name: string
}

export default function FilesManagerPage() {
  const [files, setFiles] = useState<FileWithUploader[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Folder & Breadcrumb Navigation State
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)
  const [breadcrumbs, setBreadcrumbs] = useState<FolderBreadcrumb[]>([
    { id: null, name: 'Archivio Principale' },
  ])

  // Modal Nuova Cartella
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [isCreatingFolder, setIsCreatingFolder] = useState(false)

  // Modal Anteprima
  const [previewFile, setPreviewFile] = useState<FileWithUploader | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)

  // AI Document Analysis State (Nemotron NIM)
  const [selectedFileForAi, setSelectedFileForAi] = useState<FileWithUploader | null>(null)
  const [isAiModalOpen, setIsAiModalOpen] = useState(false)
  const [aiAnalyzing, setAiAnalyzing] = useState(false)
  const [aiAnalysisResult, setAiAnalysisResult] = useState<FileAnalysisResult | null>(null)
  const [isCreatingTaskFromAi, setIsCreatingTaskFromAi] = useState(false)
  const [taskCreatedSuccess, setTaskCreatedSuccess] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    fetchFiles()
  }, [])

  const fetchFiles = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('files')
      .select('*, uploader:profiles(*)')
      .order('created_at', { ascending: false })

    if (data && !error) {
      setFiles(data)
    }
    setLoading(false)
  }

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newFolderName.trim() || isCreatingFolder) return

    setIsCreatingFolder(true)
    const { data: { user } } = await supabase.auth.getUser()

    const cleanName = newFolderName.trim().replace(/[^a-zA-Z0-9._\- ]/g, '_')
    const folderPath = currentFolderId
      ? `${currentFolderId}/folder_${Date.now()}_${cleanName}`
      : `folder_${Date.now()}_${cleanName}`

    const { data: dbFolder, error } = await (supabase as any)
      .from('files')
      .insert({
        name: newFolderName.trim(),
        storage_path: folderPath,
        size_bytes: 0,
        mime_type: 'folder',
        uploaded_by: user?.id || null,
        project_id: null,
      })
      .select('*, uploader:profiles(*)')
      .single()

    if (error) {
      console.error('Errore creazione cartella:', error)
      alert(`Errore creazione cartella: ${error.message}`)
    } else if (dbFolder) {
      setFiles((prev) => [dbFolder as any, ...prev])
      setIsFolderModalOpen(false)
      setNewFolderName('')
      
      // Notifica Telegram creazione cartella
      notifyFileUploadAction(dbFolder.name, true).catch((e) =>
        console.error('Errore notifica Telegram cartella:', e)
      )
    }

    setIsCreatingFolder(false)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files
    if (!uploadedFiles || uploadedFiles.length === 0) return

    setUploading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const newItems: FileWithUploader[] = []

      for (let i = 0; i < uploadedFiles.length; i++) {
        const selectedFile = uploadedFiles[i]
        const cleanFileName = selectedFile.name.replace(/[^a-zA-Z0-9._\-]/g, '_')
        const storagePath = currentFolderId
          ? `${currentFolderId}/${Date.now()}_${cleanFileName}`
          : `${Date.now()}_${cleanFileName}`

        // 1. Upload su Supabase Storage bucket 'team-files'
        const { error: storageError } = await supabase.storage
          .from('team-files')
          .upload(storagePath, selectedFile, {
            cacheControl: '3600',
            upsert: true,
          })

        if (storageError) {
          console.error('Errore Upload Storage:', storageError)
          alert(`Errore caricamento su Storage per "${selectedFile.name}": ${storageError.message}`)
          continue
        }

        // 2. Salva metadati nel Database (con project_id: null per evitare vincoli FK)
        const { data: dbFile, error: dbError } = await (supabase as any)
          .from('files')
          .insert({
            name: selectedFile.name,
            storage_path: storagePath,
            size_bytes: selectedFile.size,
            mime_type: selectedFile.type || 'application/octet-stream',
            uploaded_by: user?.id || null,
            project_id: null,
          })
          .select('*, uploader:profiles(*)')
          .single()

        if (dbError) {
          console.error('Errore salvataggio DB:', dbError)
          alert(`Errore registrazione database per "${selectedFile.name}": ${dbError.message}`)
        } else if (dbFile) {
          newItems.push(dbFile as any)
          
          // Notifica Telegram caricamento singolo file
          notifyFileUploadAction(selectedFile.name, false).catch((e) =>
            console.error('Errore notifica Telegram file:', e)
          )
        }
      }

      if (newItems.length > 0) {
        setFiles((prev) => [...newItems, ...prev])
      }
    } catch (err: any) {
      console.error('Errore generico upload:', err)
      alert(`Errore durante il caricamento: ${err?.message || 'Sconosciuto'}`)
    } finally {
      e.target.value = ''
      setUploading(false)
    }
  }

  const handleOpenFolder = (folder: FileWithUploader) => {
    setCurrentFolderId(folder.id)
    setBreadcrumbs([...breadcrumbs, { id: folder.id, name: folder.name }])
  }

  const handleNavigateBreadcrumb = (index: number) => {
    const target = breadcrumbs[index]
    setCurrentFolderId(target.id)
    setBreadcrumbs(breadcrumbs.slice(0, index + 1))
  }

  const handlePreviewFile = async (file: FileWithUploader) => {
    setPreviewFile(file)
    setPreviewLoading(true)
    setPreviewUrl(null)

    const { data, error } = await supabase.storage
      .from('team-files')
      .createSignedUrl(file.storage_path, 3600)

    if (data?.signedUrl) {
      setPreviewUrl(data.signedUrl)
    } else {
      console.error('Errore URL Anteprima:', error)
      alert('Impossibile generare l’anteprima per questo file.')
    }
    setPreviewLoading(false)
  }

  const handleDeleteItem = async (item: FileWithUploader) => {
    const isFolder = item.mime_type === 'folder'
    const label = isFolder ? `la cartella "${item.name}"` : `il file "${item.name}"`

    if (!confirm(`Sei sicuro di voler eliminare definitivamente ${label}?`)) return

    if (!isFolder) {
      await supabase.storage.from('team-files').remove([item.storage_path])
    } else {
      // Elimina anche i file contenuti nella cartella
      const childFiles = files.filter(
        (f) => f.storage_path.startsWith(`${item.id}/`) || f.storage_path.startsWith(`${item.storage_path}/`)
      )
      const childStoragePaths = childFiles.filter((f) => f.mime_type !== 'folder').map((f) => f.storage_path)
      if (childStoragePaths.length > 0) {
        await supabase.storage.from('team-files').remove(childStoragePaths)
      }
      const childIds = childFiles.map((f) => f.id)
      if (childIds.length > 0) {
        await supabase.from('files').delete().in('id', childIds)
      }
    }

    await supabase.from('files').delete().eq('id', item.id)
    setFiles((prev) => prev.filter((f) => f.id !== item.id && !f.storage_path.startsWith(`${item.id}/`)))

    if (previewFile?.id === item.id) {
      setPreviewFile(null)
    }
  }

  const handleDownloadFile = async (file: FileWithUploader) => {
    const { data, error } = await supabase.storage
      .from('team-files')
      .download(file.storage_path)

    if (error || !data) {
      alert('Impossibile scaricare il file.')
      return
    }

    const url = URL.createObjectURL(data)
    const a = document.createElement('a')
    a.href = url
    a.download = file.name
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const handleStartAiAnalysis = async (file: FileWithUploader) => {
    setSelectedFileForAi(file)
    setIsAiModalOpen(true)
    setAiAnalyzing(true)
    setAiAnalysisResult(null)
    setTaskCreatedSuccess(false)

    const res = await analyzeFileWithAIAction(file.id)
    if (res.success && res.analysis) {
      setAiAnalysisResult(res.analysis)
    } else {
      alert(`Errore durante l'analisi AI: ${res.error || 'Errore sconosciuto'}`)
      setIsAiModalOpen(false)
    }
    setAiAnalyzing(false)
  }

  const handleCreateTaskFromAi = async () => {
    if (!selectedFileForAi || !aiAnalysisResult || isCreatingTaskFromAi) return

    setIsCreatingTaskFromAi(true)
    const res = await convertFileAnalysisToTaskAction({
      title: aiAnalysisResult.suggestedTaskTitle,
      description: `${aiAnalysisResult.summary}\n\n📌 Punti Chiave:\n${aiAnalysisResult.keyPoints.map((p) => `- ${p}`).join('\n')}\n\n👉 Azione Proposta:\n${aiAnalysisResult.suggestedTaskDesc}`,
      fileId: selectedFileForAi.id,
      fileName: selectedFileForAi.name,
    })

    if (res.success) {
      setTaskCreatedSuccess(true)
    } else {
      alert(`Errore creazione compito: ${res.error}`)
    }
    setIsCreatingTaskFromAi(false)
  }

  const getFileIcon = (mime: string) => {
    if (mime === 'folder') return <Folder className="h-5 w-5 text-amber-500 fill-amber-500/20 shrink-0" />
    if (mime.includes('image')) return <ImageIcon className="h-5 w-5 text-purple-500 shrink-0" />
    if (mime.includes('pdf')) return <FileText className="h-5 w-5 text-red-500 shrink-0" />
    if (mime.includes('sheet') || mime.includes('excel')) return <FileSpreadsheet className="h-5 w-5 text-emerald-500 shrink-0" />
    return <FileCode className="h-5 w-5 text-blue-500 shrink-0" />
  }

  // Filtraggio file e cartelle del livello corrente
  const currentLevelItems = files.filter((f) => {
    let isCurrentLevel = false

    if (!currentFolderId) {
      // Livello Principale (Root):
      // elementi che non hanno prefisso di cartella (nessuno slash)
      const hasFolderPrefix = f.storage_path.includes('/')
      isCurrentLevel = !hasFolderPrefix
    } else {
      // Livello Interno alla cartella selezionata:
      const currentFolder = files.find((item) => item.id === currentFolderId)
      const currentFolderPath = currentFolder?.storage_path || ''

      const matchByFolderId = f.storage_path.startsWith(`${currentFolderId}/`)
      const matchByFolderPath = currentFolderPath ? f.storage_path.startsWith(`${currentFolderPath}/`) : false
      isCurrentLevel = matchByFolderId || matchByFolderPath
    }

    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase())
    return isCurrentLevel && matchesSearch
  })

  // Separiamo le cartelle dai file per mostrare le cartelle in cima
  const currentFolders = currentLevelItems.filter((i) => i.mime_type === 'folder')
  const currentFiles = currentLevelItems.filter((i) => i.mime_type !== 'folder')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <FolderOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            File & Risorse Condivise
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Gestione cartelle, file ed risorse con Supabase Storage e permessi RLS.
          </p>
        </div>

        {/* Action Buttons: Nuova Cartella + Carica File */}
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsFolderModalOpen(true)}
            variant="outline"
            className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 text-xs font-semibold h-10 px-4 rounded-xl shadow-xs"
          >
            <FolderPlus className="h-4 w-4 text-amber-500" />
            <span>Nuova Cartella</span>
          </Button>

          <label className="cursor-pointer">
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
            <span className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-xs h-10 shadow-xs transition-colors">
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Caricamento...
                </>
              ) : (
                <>
                  <UploadCloud className="h-4 w-4" />
                  Carica File Reale
                </>
              )}
            </span>
          </label>
        </div>
      </div>

      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-1 text-xs bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-x-auto">
        <Home className="h-4 w-4 text-slate-400 shrink-0" />
        {breadcrumbs.map((crumb, idx) => {
          const isLast = idx === breadcrumbs.length - 1
          return (
            <div key={crumb.id || 'root'} className="flex items-center gap-1 shrink-0">
              {idx > 0 && <ChevronRight className="h-3.5 w-3.5 text-slate-400" />}
              <button
                onClick={() => handleNavigateBreadcrumb(idx)}
                disabled={isLast}
                className={`font-semibold hover:underline transition-colors ${
                  isLast
                    ? 'text-slate-900 dark:text-white font-bold cursor-default'
                    : 'text-blue-600 dark:text-blue-400'
                }`}
              >
                {crumb.name}
              </button>
            </div>
          )
        })}
      </div>

      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 px-2">
          Elementi in questa sezione: <strong className="text-slate-900 dark:text-white ml-1">{currentLevelItems.length}</strong>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cerca file o cartelle..."
            className="w-full h-8 pl-9 pr-3 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Table List (Folders & Files) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Nome Elemento</th>
                <th className="py-3 px-4">Tipo / Dimensione</th>
                <th className="py-3 px-4">Creato Da</th>
                <th className="py-3 px-4">Data</th>
                <th className="py-3 px-4 text-right">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs text-slate-700 dark:text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <Loader2 className="h-6 w-6 text-blue-600 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : currentLevelItems.length > 0 ? (
                <>
                  {/* Rendering Cartelle */}
                  {currentFolders.map((folder) => (
                    <tr
                      key={folder.id}
                      onClick={() => handleOpenFolder(folder)}
                      className="hover:bg-amber-50/50 dark:hover:bg-amber-950/20 cursor-pointer transition-colors group"
                    >
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2.5">
                          {getFileIcon('folder')}
                          <span className="truncate max-w-xs group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {folder.name}
                          </span>
                          <Badge variant="outline" className="text-[9px] text-amber-600 border-amber-200 bg-amber-50">
                            Cartella
                          </Badge>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 font-mono">
                        —
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-medium">
                        {folder.uploader?.full_name || 'Membro del Team'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                        {formatDate(folder.created_at)}
                      </td>
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-slate-400 hover:text-red-600 dark:hover:text-red-400"
                            title="Elimina Cartella"
                            onClick={() => handleDeleteItem(folder)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {/* Rendering File */}
                  {currentFiles.map((f) => (
                    <tr
                      key={f.id}
                      onClick={() => handlePreviewFile(f)}
                      className="hover:bg-blue-50/50 dark:hover:bg-blue-950/20 cursor-pointer transition-colors group"
                    >
                      <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2.5">
                          {getFileIcon(f.mime_type)}
                          <span className="truncate max-w-xs group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors font-medium">
                            {f.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-mono">
                        {formatBytes(f.size_bytes)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-medium">
                        {f.uploader?.full_name || 'Membro del Team'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                        {formatDate(f.created_at)}
                      </td>
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-purple-600 hover:text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/30"
                            title="Sintetizza / Analizza con AI"
                            onClick={() => handleStartAiAnalysis(f)}
                          >
                            <Sparkles className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400"
                            title="Visualizza / Anteprima"
                            onClick={() => handlePreviewFile(f)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400"
                            title="Scarica"
                            onClick={() => handleDownloadFile(f)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-slate-400 hover:text-red-600 dark:hover:text-red-400"
                            title="Elimina"
                            onClick={() => handleDeleteItem(f)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </>
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-xs text-slate-400">
                    Questa sezione è vuota. Crea una cartella o carica un file con i pulsanti in alto!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nuova Cartella */}
      {isFolderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <FolderPlus className="h-5 w-5 text-amber-500" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Nuova Cartella</h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsFolderModalOpen(false)}
                className="h-7 w-7 text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleCreateFolder} className="p-5 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Nome Cartella *</label>
                <Input
                  autoFocus
                  required
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Es. Corsi 2026, Agenti AI, Documenti Clienti"
                  className="text-xs dark:bg-slate-800 dark:border-slate-700"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Button type="button" variant="outline" onClick={() => setIsFolderModalOpen(false)}>
                  Annulla
                </Button>
                <Button type="submit" disabled={isCreatingFolder} className="bg-amber-600 hover:bg-amber-700 text-white">
                  {isCreatingFolder ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                      Creazione...
                    </>
                  ) : (
                    'Crea Cartella'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Anteprima File senza scaricare */}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-5xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-3">
                {getFileIcon(previewFile.mime_type)}
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate max-w-md">
                    {previewFile.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {formatBytes(previewFile.size_bytes)} • Caricato da {previewFile.uploader?.full_name || 'Team'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStartAiAnalysis(previewFile)}
                  className="text-xs gap-1.5 h-8 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 hover:bg-purple-100 font-semibold"
                >
                  <Sparkles className="h-3.5 w-3.5 text-purple-600" />
                  Sintetizza con AI
                </Button>

                {previewUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(previewUrl, '_blank')}
                    className="text-xs gap-1.5 h-8 bg-white dark:bg-slate-800 font-semibold text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Apri a Schermo Intero
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setPreviewFile(null)}
                  className="h-8 w-8 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 flex-1 overflow-auto flex items-center justify-center min-h-[400px] bg-slate-100 dark:bg-slate-950">
              {previewLoading ? (
                <div className="flex flex-col items-center gap-2 text-slate-400">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  <span className="text-xs">Generazione anteprima in corso...</span>
                </div>
              ) : previewUrl ? (
                previewFile.mime_type.includes('image') ? (
                  <img
                    src={previewUrl}
                    alt={previewFile.name}
                    className="max-h-[70vh] w-auto max-w-full rounded-lg shadow-md object-contain"
                  />
                ) : previewFile.mime_type.includes('pdf') ? (
                  <iframe
                    src={previewUrl}
                    title={previewFile.name}
                    className="w-full h-[72vh] rounded-xl border border-slate-200 dark:border-slate-800 shadow-md bg-white"
                  />
                ) : previewFile.mime_type.includes('video') ? (
                  <video src={previewUrl} controls className="w-full max-h-[70vh] rounded-lg shadow-md" />
                ) : previewFile.mime_type.includes('audio') ? (
                  <audio src={previewUrl} controls className="w-full p-4" />
                ) : (
                  <div className="text-center space-y-4 p-8 max-w-sm">
                    <div className="h-16 w-16 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
                      {getFileIcon(previewFile.mime_type)}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        Anteprima integrata non disponibile per questo formato
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Puoi aprire il file direttamente in una scheda del browser senza scaricarlo sul computer.
                      </p>
                    </div>
                    <Button
                      onClick={() => window.open(previewUrl, '_blank')}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Visualizza nel Browser
                    </Button>
                  </div>
                )
              ) : (
                <div className="text-xs text-red-400">
                  Impossibile caricare l’anteprima del file.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Analisi Documentale AI (Nemotron NIM) */}
      {isAiModalOpen && selectedFileForAi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl border border-purple-200 dark:border-purple-900/60 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-4 border-b border-purple-100 dark:border-purple-900/40 bg-purple-50/50 dark:bg-purple-950/20 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
                  <Bot className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                    Analisi Documentale Nemotron AI
                    <Badge variant="purple" className="text-[9px]">550B NIM</Badge>
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-sm">
                    {selectedFileForAi.name}
                  </p>
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsAiModalOpen(false)}
                className="h-8 w-8 text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {aiAnalyzing ? (
                <div className="py-16 flex flex-col items-center justify-center text-center space-y-3">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      Nemotron sta analizzando il documento...
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Estrazione concetti, punti salienti e proposte operative per il team.
                    </p>
                  </div>
                </div>
              ) : aiAnalysisResult ? (
                <div className="space-y-4">
                  {/* Sintesi */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1">
                      <Sparkles className="h-3.5 w-3.5" />
                      Sintesi Esecutiva
                    </span>
                    <p className="text-xs leading-relaxed text-slate-800 dark:text-slate-200">
                      {aiAnalysisResult.summary}
                    </p>
                  </div>

                  {/* Punti Chiave */}
                  {aiAnalysisResult.keyPoints.length > 0 && (
                    <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        📌 Punti Salienti & Dati Rilevanti
                      </span>
                      <ul className="space-y-1.5">
                        {aiAnalysisResult.keyPoints.map((pt, i) => (
                          <li key={i} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                            <span className="h-1.5 w-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                            <span className="leading-normal">{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Proposta Compito per /lavori */}
                  <div className="p-4 rounded-xl bg-purple-50/40 dark:bg-purple-950/20 border border-purple-200/80 dark:border-purple-800/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300 flex items-center gap-1">
                        <ListPlus className="h-3.5 w-3.5" />
                        Compito Consigliato per il Team
                      </span>
                      <Badge variant="purple" className="text-[9px]">Priorità Alta</Badge>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-purple-100 dark:border-purple-900/40">
                      <h4 className="font-bold text-slate-900 dark:text-white text-xs">
                        {aiAnalysisResult.suggestedTaskTitle}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        {aiAnalysisResult.suggestedTaskDesc}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Footer */}
            {aiAnalysisResult && (
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(`${aiAnalysisResult.summary}\n\n${aiAnalysisResult.keyPoints.join('\n')}`)
                    alert('Sintesi copiata negli appunti!')
                  }}
                  className="text-xs gap-1.5"
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copia Sintesi
                </Button>

                {taskCreatedSuccess ? (
                  <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-lg border border-emerald-200">
                    <CheckCircle2 className="h-4 w-4" />
                    Compito creato su /lavori!
                  </div>
                ) : (
                  <Button
                    size="sm"
                    disabled={isCreatingTaskFromAi}
                    onClick={handleCreateTaskFromAi}
                    className="bg-purple-600 hover:bg-purple-700 text-white text-xs gap-1.5 shadow-xs font-semibold"
                  >
                    {isCreatingTaskFromAi ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Creazione compito...
                      </>
                    ) : (
                      <>
                        <ListPlus className="h-3.5 w-3.5" />
                        Crea Compito su /lavori
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
