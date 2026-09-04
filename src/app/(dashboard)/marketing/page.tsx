'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Rocket,
  PlusCircle,
  Calendar,
  ArrowRight,
  Share2,
  DollarSign,
  BarChart3,
  ShieldCheck,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { getMarketingCampaignsAction, deleteMarketingCampaignAction } from '@/app/actions/marketing'

export default function MarketingHubPage() {
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Calcolatore Economico APEX Growth
  const [simTargetFollowers, setSimTargetFollowers] = useState(5000)
  const [simCpc, setSimCpc] = useState(0.45)
  const [simCvr, setSimCvr] = useState(3.5)
  const [simPrice, setSimPrice] = useState(97)

  useEffect(() => {
    loadCampaigns()
  }, [])

  const loadCampaigns = async () => {
    setIsLoading(true)
    const res = await getMarketingCampaignsAction()
    if (res.success && res.campaigns) {
      setCampaigns(res.campaigns)
    }
    setIsLoading(false)
  }

  const handleDeleteCampaign = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Sei sicuro di voler eliminare questa campagna e tutti i suoi post?')) return
    const res = await deleteMarketingCampaignAction(id)
    if (res.success) {
      setCampaigns((prev) => prev.filter((c) => c.id !== id))
    } else {
      alert('Errore durante l\'eliminazione della campagna')
    }
  }

  // Calcoli Simulatore
  const totalAdSpend = Math.round(simTargetFollowers * simCpc)
  const buyersCount = Math.round(simTargetFollowers * (simCvr / 100))
  const grossRevenue = Math.round(buyersCount * simPrice)
  const netProfit = grossRevenue - totalAdSpend
  const estimatedRoas = totalAdSpend > 0 ? (grossRevenue / totalAdSpend).toFixed(2) : '0'

  return (
    <div className="space-y-6 pb-12">
      {/* Header Pulito & Diretto */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-100 flex items-center gap-2.5">
              <Rocket className="h-6 w-6 text-blue-400" />
              Marketing & Campagne Social
            </h1>
            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs">
              Buffer & Second Brain
            </Badge>
          </div>
          <p className="text-xs text-slate-400">
            Pianificazione contenuti per il corso AI Start, simulazione economica ROAS e generazione post Facebook, Reel e caroselli.
          </p>
        </div>

        <Link href="/marketing/campagna">
          <Button className="bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md shadow-blue-500/20 text-xs px-4 py-2 rounded-xl flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            <span>Nuova Campagna / Post Express</span>
          </Button>
        </Link>
      </div>

      {/* Sezione Principale: Elenco Campagne + Simulatore Economico */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Colonna Sinistra (2/3): Campagne Salva / Recenti */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-100">Le Tue Campagne</h2>
              <Badge variant="outline" className="text-xs font-mono border-slate-700 text-slate-300">
                {campaigns.length} totali
              </Badge>
            </div>
            <Link href="/marketing/campagna">
              <Button variant="outline" size="sm" className="border-slate-700 hover:bg-slate-800 text-xs">
                Crea con Wizard AI
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-slate-400 bg-slate-900/40 rounded-xl border border-slate-800">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-3" />
              <p className="text-sm">Caricamento delle campagne in corso...</p>
            </div>
          ) : campaigns.length === 0 ? (
            <Card className="p-8 text-center bg-slate-900/40 border-slate-800/80 rounded-2xl">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-blue-600/10 text-blue-400 flex items-center justify-center mb-4">
                <Rocket className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-200">Nessuna campagna attiva</h3>
              <p className="text-sm text-slate-400 max-w-md mx-auto mt-1.5 mb-6">
                Avvia il Wizard a 5 Fasi per generare una strategia completa con l'Agente APEX: dal brief alla Grand Slam Offer, fino al piano editoriale e alla pubblicazione su n8n.
              </p>
              <Link href="/marketing/campagna">
                <Button className="bg-blue-600 hover:bg-blue-500 text-white font-semibold">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Avvia la Prima Campagna
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-3">
              {campaigns.map((camp) => (
                <div
                  key={camp.id}
                  className="group relative p-5 bg-slate-900/70 hover:bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-xl transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-bold text-base text-slate-100 truncate">{camp.title}</span>
                      <Badge className="bg-blue-500/15 text-blue-400 border-blue-500/20 text-xs">
                        €{camp.price}
                      </Badge>
                      <Badge variant="outline" className="text-[11px] text-slate-400 border-slate-700">
                        {camp.awareness_level || 'Problem-Aware'}
                      </Badge>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-1">
                      {camp.big_idea || `Avatar: ${camp.target_avatar || 'Non specificato'}`}
                    </p>

                    <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1">
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3 text-emerald-400" />
                        Budget: €{camp.budget_daily}/giorno
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-blue-400" />
                        Creato il: {new Date(camp.created_at).toLocaleDateString('it-IT')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                    <Link href={`/marketing/campagna?id=${camp.id}`}>
                      <Button size="sm" className="bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 text-xs font-semibold">
                        Apri Workspace
                        <ArrowRight className="h-3.5 w-3.5 ml-1" />
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 h-8 w-8 p-0"
                      onClick={(e) => handleDeleteCampaign(camp.id, e)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Colonna Destra (1/3): Simulatore Economico ROI & Conversioni */}
        <div className="space-y-6">
          <Card className="p-6 bg-slate-900/80 border-slate-800 rounded-2xl shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-100">Simulatore Economico</h3>
                  <p className="text-[11px] text-slate-400">Modello Conversioni & ROAS</p>
                </div>
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 font-mono text-xs">
                Live
              </Badge>
            </div>

            {/* Input Parametri */}
            <div className="space-y-3.5 text-xs">
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Target Follower / Lead</span>
                  <span className="font-mono font-bold text-blue-400">{simTargetFollowers.toLocaleString()}</span>
                </div>
                <Input
                  type="number"
                  value={simTargetFollowers}
                  onChange={(e) => setSimTargetFollowers(Number(e.target.value) || 0)}
                  className="h-8 text-xs bg-slate-950 border-slate-700 text-slate-100 placeholder:text-slate-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 text-[11px] block mb-1">Costo Contatto (€)</label>
                  <Input
                    type="number"
                    step="0.05"
                    value={simCpc}
                    onChange={(e) => setSimCpc(Number(e.target.value) || 0)}
                    className="h-8 text-xs bg-slate-950 border-slate-700 text-slate-100 placeholder:text-slate-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-[11px] block mb-1">Prezzo Offerta (€)</label>
                  <Input
                    type="number"
                    value={simPrice}
                    onChange={(e) => setSimPrice(Number(e.target.value) || 0)}
                    className="h-8 text-xs bg-slate-950 border-slate-700 text-slate-100 placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Tasso di Conversione stimato (CVR)</span>
                  <span className="font-mono font-bold text-amber-400">{simCvr}%</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="10"
                  step="0.1"
                  value={simCvr}
                  onChange={(e) => setSimCvr(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>
            </div>

            {/* Output Risultati */}
            <div className="mt-5 pt-4 border-t border-slate-800/80 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Budget Ads Necessario:</span>
                <span className="font-mono font-bold text-slate-200">€ {totalAdSpend.toLocaleString('it-IT')}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Clienti Acquisiti:</span>
                <span className="font-mono font-bold text-blue-400">{buyersCount.toLocaleString('it-IT')}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Fatturato Lordo Stimato:</span>
                <span className="font-mono font-bold text-emerald-400">€ {grossRevenue.toLocaleString('it-IT')}</span>
              </div>
              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
                <span className="text-slate-300 font-semibold">Utile Netto (Margine):</span>
                <span className={`font-mono font-extrabold ${netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  € {netProfit.toLocaleString('it-IT')}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-semibold">ROAS Atteso:</span>
                <span className="font-mono font-extrabold text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded">
                  {estimatedRoas}x
                </span>
              </div>
            </div>
          </Card>

          {/* Quick Integration Card: Buffer API */}
          <Card className="p-5 bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800 rounded-2xl">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                <Share2 className="h-4 w-4" />
              </div>
              <h4 className="font-semibold text-xs text-slate-200">Integrazione Diretta Buffer</h4>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Il dispatcher della piattaforma pubblica e pianifica i post del piano editoriale direttamente sul tuo account Buffer tramite API ufficiale, per Instagram, Facebook e LinkedIn.
            </p>
            <div className="mt-3 flex items-center justify-between text-[11px] text-blue-400 font-medium">
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                Pronto per pubblicazione
              </span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
