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
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

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

    // 1. Upload file to Supabase Storage bucket 'team-files'
    const fileExt = selectedFile.name.split('.').pop()
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

    // 2. Insert metadata into Supabase 'files' table
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

  const handleDeleteFile = async (file: FileWithUploader) => {
    if (!confirm(`Sei sicuro di voler eliminare definitivamente "${file.name}"?`)) return

    // 1. Delete from Supabase Storage
    await supabase.storage.from('team-files').remove([file.storage_path])

    // 2. Delete from Supabase 'files' table
    await supabase.from('files').delete().eq('id', file.id)

    // 3. Update local state
    setFiles(files.filter((f) => f.id !== file.id))
  }

  const handleDownloadFile = async (file: FileWithUploader) => {
    const { data, error } = await supabase.storage
      .from('team-files')
      .download(file.storage_path)

    if (error || !data) {
      alert('Impossibile scaricare il file. Verifica che il file esista su Supabase Storage.')
      return
    }

    // Create temporary download URL
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
    if (mime.includes('pdf')) return <FileText className="h-5 w-5 text-red-500 shrink-0" />
    if (mime.includes('sheet') || mime.includes('excel')) return <FileSpreadsheet className="h-5 w-5 text-emerald-500 shrink-0" />
    return <FileCode className="h-5 w-5 text-blue-500 shrink-0" />
  }

  const filteredFiles = files.filter((f) => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
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
            Archivio centralizzato integrato con Supabase Storage e RLS.
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
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400"
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
                    Nessun file presente nell'archivio. Carica il tuo primo file con il pulsante in alto!
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
