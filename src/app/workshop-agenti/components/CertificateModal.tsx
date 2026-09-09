'use client'

import React from 'react'
import { Award, CheckCircle, ShieldCheck, Printer, X, Sparkles } from 'lucide-react'
import { StudentCertificateData } from '@/app/actions/student-workshop'

interface CertificateModalProps {
  certificate: StudentCertificateData
  onClose: () => void
}

export function CertificateModal({ certificate, onClose }: CertificateModalProps) {
  const isPro = certificate.courseTier === 'ai-pro'
  const courseName = isPro
    ? 'AI Pro - Architettura Agenti Autonomi & n8n'
    : 'AI Start - Domina l\'Intelligenza Artificiale da Zero'

  const formattedDate = new Date(certificate.issuedAt).toLocaleDateString('it-IT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-amber-500/40 rounded-3xl p-6 md:p-8 shadow-2xl shadow-amber-500/10 text-white print:p-0 print:border-none print:shadow-none">
        {/* Pulsante chiusura (nascosto in stampa) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors print:hidden"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cornice Attestato Formativo */}
        <div className="border-2 border-dashed border-amber-500/30 rounded-2xl p-6 text-center space-y-4 bg-gradient-to-b from-amber-500/5 via-transparent to-slate-950/80">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 mb-1">
            <Award className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-mono uppercase tracking-widest text-amber-400 font-bold">
              Certificato Ufficiale di Competenza Pratica
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              Attestato di Completamento
            </h2>
            <p className="text-xs text-slate-400">
              Rilasciato dal Laboratorio Didattico Permanente Ti AIuto & Mira Tutor
            </p>
          </div>

          <div className="py-2">
            <span className="text-xs text-slate-400 block mb-1">Si certifica che il corsista</span>
            <strong className="text-xl md:text-2xl font-serif text-amber-200 tracking-wide block">
              {certificate.studentName}
            </strong>
            <span className="text-[11px] text-slate-500 font-mono">{certificate.studentEmail}</span>
          </div>

          <p className="text-xs md:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
            Ha superato con successo tutte le 5 missioni pratiche e i test operativi del percorso:
            <br />
            <strong className="text-white font-semibold">{courseName}</strong>
          </p>

          {/* Dettagli e Voto */}
          <div className="grid grid-cols-3 gap-3 pt-2 max-w-md mx-auto">
            <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <span className="text-[10px] text-slate-400 block uppercase">Valutazione</span>
              <strong className="text-base text-emerald-400 font-bold font-mono">
                {certificate.averageScore}/100
              </strong>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <span className="text-[10px] text-slate-400 block uppercase">Data</span>
              <strong className="text-xs text-slate-200 font-semibold block mt-0.5">
                {formattedDate}
              </strong>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <span className="text-[10px] text-slate-400 block uppercase">Stato</span>
              <span className="inline-flex items-center gap-1 text-xs text-cyan-400 font-semibold mt-0.5">
                <CheckCircle className="w-3 h-3" /> Verificato
              </span>
            </div>
          </div>

          {/* Codice univoco crittografico */}
          <div className="pt-2 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-2 text-[11px] text-slate-500 font-mono">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              ID Certificato: <span className="text-slate-300 font-semibold">{certificate.certificateCode}</span>
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              Firmato digitalmente da Mira AI & Team Ti AIuto
            </span>
          </div>
        </div>

        {/* Azioni del modale (nascoste in stampa) */}
        <div className="mt-5 flex items-center justify-end gap-3 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Chiudi
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Stampa o Salva PDF</span>
          </button>
        </div>
      </div>
    </div>
  )
}
