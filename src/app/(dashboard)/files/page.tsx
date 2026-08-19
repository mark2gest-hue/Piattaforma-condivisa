'use client'

import { useState, useEffect } from 'react'
import {
  FolderOpen,
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
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatBytes, formatDate } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { FileItem, Profile } from '@/types/index'

type FileWithUploader = FileItem & { uploader?: Profile }

export default function FilesManagerPage() {
  const [files, setFiles] = useState<FileWithUploader[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Modal Anteprima
  const [previewFile, setPreviewFile] = useState<FileWithUploader | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setUploading(true)
    const { data: { user } } = await supabase.auth.getUser()

    const storagePath = `${Date.now()}_${selectedFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`

    const { error: storageError } = await supabase.storage
      .from('team-files')
      .upload(storagePath, selectedFile)

    if (storageError) {
      console.error('Errore Upload Storage:', storageError)
      alert(`Errore nel caricamento del file: ${storageError.message}`)
      setUploading(false)
      return
    }

    const { data: dbFile, error: dbError } = await (supabase as any)
      .from('files')
      .insert({
        name: selectedFile.name,
        storage_path: storagePath,
        size_bytes: selectedFile.size,
        mime_type: selectedFile.type || 'application/octet-stream',
        uploaded_by: user?.id || null,
      })
      .select('*, uploader:profiles(*)')
      .single()

    if (dbError) {
      console.error('Errore salvataggio file in DB:', dbError)
    } else if (dbFile) {
      setFiles([dbFile, ...files])
    }

    setUploading(false)
  }

  const handlePreviewFile = async (file: FileWithUploader) => {
    setPreviewFile(file)
    setPreviewLoading(true)
    setPreviewUrl(null)

    // Genera URL firmato temporaneo da Supabase Storage (valido 1 ora)
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

  const handleDeleteFile = async (file: FileWithUploader) => {
    if (!confirm(`Sei sicuro di voler eliminare definitivamente "${file.name}"?`)) return

    await supabase.storage.from('team-files').remove([file.storage_path])
    await supabase.from('files').delete().eq('id', file.id)

    setFiles(files.filter((f) => f.id !== file.id))
    if (previewFile?.id === file.id) {
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

  const getFileIcon = (mime: string) => {
    if (mime.includes('image')) return <ImageIcon className="h-5 w-5 text-purple-500 shrink-0" />
    if (mime.includes('pdf')) return <FileText className="h-5 w-5 text-red-500 shrink-0" />
    if (mime.includes('sheet') || mime.includes('excel')) return <FileSpreadsheet className="h-5 w-5 text-emerald-500 shrink-0" />
    return <FileCode className="h-5 w-5 text-blue-500 shrink-0" />
  }

  const filteredFiles = files.filter((f) => {
    return f.name.toLowerCase().includes(searchQuery.toLowerCase())
  })

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
            Archivio centralizzato integrato con Supabase Storage con anteprima e RLS.
          </p>
        </div>

        <label className="cursor-pointer">
          <input
            type="file"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
          />
          <span className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm shadow-xs transition-colors">
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Caricamento in corso...
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

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 px-2">
          File salvati su Supabase: <strong className="text-slate-900 dark:text-white ml-1">{files.length}</strong>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filtra per nome file..."
            className="w-full h-8 pl-9 pr-3 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Files Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Nome File</th>
                <th className="py-3 px-4">Dimensione</th>
                <th className="py-3 px-4">Caricato Da</th>
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
              ) : filteredFiles.length > 0 ? (
                filteredFiles.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2.5">
                        {getFileIcon(f.mime_type)}
                        <span className="truncate max-w-xs">{f.name}</span>
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
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Pulsante Anteprima */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400"
                          title="Anteprima Senza Scaricare"
                          onClick={() => handlePreviewFile(f)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        {/* Pulsante Download */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400"
                          title="Scarica"
                          onClick={() => handleDownloadFile(f)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>

                        {/* Pulsante Elimina */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-slate-400 hover:text-red-600 dark:hover:text-red-400"
                          title="Elimina"
                          onClick={() => handleDeleteFile(f)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-xs text-slate-400">
                    Nessun file presente nell'archivio. Carica il tuo primo file col pulsante in alto!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Anteprima File senza scaricare */}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
            
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
                {previewUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(previewUrl, '_blank')}
                    className="text-xs gap-1.5 h-8 bg-white dark:bg-slate-800"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Apri in Scheda
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

            {/* Modal Body: Viewer dinamico */}
            <div className="p-4 flex-1 overflow-auto flex items-center justify-center min-h-[350px] bg-slate-100 dark:bg-slate-950">
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
                    className="max-h-[600px] w-auto max-w-full rounded-lg shadow-md object-contain"
                  />
                ) : previewFile.mime_type.includes('pdf') ? (
                  <iframe
                    src={previewUrl}
                    className="w-full h-[600px] rounded-lg border-0 shadow-md"
                  />
                ) : previewFile.mime_type.includes('video') ? (
                  <video src={previewUrl} controls className="w-full max-h-[600px] rounded-lg shadow-md" />
                ) : previewFile.mime_type.includes('audio') ? (
                  <audio src={previewUrl} controls className="w-full p-4" />
                ) : (
                  /* Fallback Viewer per documenti non direttamente renderizzabili */
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
    </div>
  )
}
