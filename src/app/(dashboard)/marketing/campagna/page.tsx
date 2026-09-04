'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Rocket,
  Layers,
  Calendar,
  Copy,
  Check,
  Save,
  Download,
  Send,
  Loader2,
  ShieldAlert,
  Clock,
  Flame,
  Video,
  Layout,
  ExternalLink,
  Target,
  Palette,
  Brain,
  Globe,
  GraduationCap,
  Building2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { LocandinaGeneratorModal } from '@/components/marketing/locandina-generator-modal'
import { CarouselGeneratorModal } from '@/components/marketing/carousel-generator-modal'
import { ReelVideoGeneratorModal } from '@/components/marketing/reel-video-generator-modal'
import {
  generateMarketingCampaignAction,
  saveMarketingCampaignAction,
  getMarketingCampaignByIdAction,
  publishToBufferAction,
  generateExpressSocialPostAction,
  MarketingBriefInput,
  MarketingGeneratedPlan,
  MarketingEditorialPost,
  ExpressSocialContent,
} from '@/app/actions/marketing'
import { playNotificationSound } from '@/lib/notifications'

const PLATFORM_OPTIONS = ['Instagram', 'Meta Ads (Facebook)', 'LinkedIn', 'TikTok', 'Google Search / PMax', 'YouTube']

const AWARENESS_OPTIONS: Array<{ value: MarketingBriefInput['awarenessLevel']; label: string; desc: string }> = [
  { value: 'Unaware', label: '1. Inconsapevole (Unaware)', desc: 'Non sa ancora di avere un problema specifico.' },
  { value: 'Problem-Aware', label: '2. Consapevole del Problema', desc: 'Sente il dolore ma non conosce le soluzioni possibili.' },
  { value: 'Solution-Aware', label: '3. Consapevole della Soluzione', desc: 'Cerca attivamente strumenti per risolvere il problema.' },
  { value: 'Product-Aware', label: '4. Consapevole del Prodotto', desc: 'Conosce la tua offerta ma la sta confrontando.' },
  { value: 'Most-Aware', label: '5. Ultra Consapevole (Most Aware)', desc: 'Pronto all\'acquisto, necessita solo di offerta/incentivo.' },
]

function CampaignWizardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const campaignIdParam = searchParams.get('id')

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [activePostEditingIndex, setActivePostEditingIndex] = useState<number | null>(null)
  const [isPublishingPostId, setIsPublishingPostId] = useState<string | null>(null)
  const [savedSuccessMsg, setSavedSuccessMsg] = useState<string | null>(null)
  const [isPosterModalOpen, setIsPosterModalOpen] = useState(false)
  const [posterData, setPosterData] = useState<{ title: string; hook: string; body: string; cta: string }>({
    title: '',
    hook: '',
    body: '',
    cta: '',
  })

  // Express Social Generator State (Zero tempo perso, Second Brain + Buffer)
  const [expressPrompt, setExpressPrompt] = useState(
    "Superare la paura di essere in ritardo con l'AI: il corso pensato per chi parte da zero senza gergo tecnico"
  )
  const [expressTargetFocus, setExpressTargetFocus] = useState<'studenti' | 'pmi' | 'misto'>('studenti')
  const [expressUseSecondBrain, setExpressUseSecondBrain] = useState(true)
  const [expressUseWebTrends, setExpressUseWebTrends] = useState(true)
  const [isGeneratingExpress, setIsGeneratingExpress] = useState(false)
  const [expressResult, setExpressResult] = useState<ExpressSocialContent | null>(null)
  const [editableExpressFbCopy, setEditableExpressFbCopy] = useState('')
  const [isPublishingExpressBuffer, setIsPublishingExpressBuffer] = useState(false)
  const [expressSuccessMsg, setExpressSuccessMsg] = useState<string | null>(null)
  const [isCarouselModalOpen, setIsCarouselModalOpen] = useState(false)
  const [isReelVideoModalOpen, setIsReelVideoModalOpen] = useState(false)
  const [showAdvancedWizard, setShowAdvancedWizard] = useState(false)
  const [isSavingExpressToLibrary, setIsSavingExpressToLibrary] = useState(false)
  const [expressSavedToLibrary, setExpressSavedToLibrary] = useState(false)

  // 1. Brief State
  const [brief, setBrief] = useState<MarketingBriefInput>({
    title: 'Lancio Corso AI Start & Consulenze B2B',
    productName: 'AI Start: Percorso Completo',
    price: 97,
    targetAvatar: 'Imprenditori, liberi professionisti e manager che vogliono integrare l\'AI nei flussi di lavoro',
    awarenessLevel: 'Problem-Aware',
    coreDesire: 'Automatizzare le task quotidiane e raddoppiare la produttività aziendale senza saper programmare',
    corePain: 'Perdere ore in compiti ripetitivi e sentirsi sopraffatti dalla rapida evoluzione tecnologica',
    budgetDaily: 30,
    platforms: ['Instagram', 'Meta Ads (Facebook)', 'LinkedIn'],
    kpiCpaTarget: 18,
    kpiRoasTarget: 3.2,
  })

  // 2. Plan State (Generato dall'Agente APEX)
  const [plan, setPlan] = useState<MarketingGeneratedPlan | null>(null)

  // Caricamento campagna esistente se passata nei query params
  useEffect(() => {
    if (campaignIdParam) {
      loadExistingCampaign(campaignIdParam)
    }
  }, [campaignIdParam])

  const loadExistingCampaign = async (id: string) => {
    const res = await getMarketingCampaignByIdAction(id)
    if (res.success && res.campaign) {
      const c = res.campaign
      setBrief({
        title: c.title,
        productName: c.product_name,
        price: Number(c.price) || 97,
        targetAvatar: c.target_avatar || '',
        awarenessLevel: c.awareness_level || 'Problem-Aware',
        coreDesire: c.core_desire || '',
        corePain: c.core_pain || '',
        budgetDaily: Number(c.budget_daily) || 20,
        platforms: Array.isArray(c.platforms) ? c.platforms : ['Instagram', 'Meta Ads (Facebook)'],
        kpiCpaTarget: c.kpi_cpa ? Number(c.kpi_cpa) : 20,
        kpiRoasTarget: c.kpi_roas ? Number(c.kpi_roas) : 2.5,
      })

      if (c.funnel_blueprint) {
        const fb = c.funnel_blueprint
        setPlan({
          bigIdea: c.big_idea || '',
          uniqueMechanism: c.unique_mechanism || '',
          grandSlamOffer: fb.grandSlamOffer || {
            dreamOutcome: '',
            perceivedLikelihood: '',
            timeDelayReduction: '',
            effortSacrificeReduction: '',
            bonuses: [],
            guarantee: c.guarantee || '',
          },
          angles: fb.angles || [],
          funnelSteps: fb.funnelSteps || [],
          editorialPosts: (res.posts || []).map((p: any) => ({
            id: p.id,
            day: p.day,
            postType: p.post_type,
            title: p.title,
            summary: p.summary || '',
            fullCopy: p.full_copy || '',
            tag: p.tag || '',
            cta: p.cta || '',
            platform: p.platform || 'Instagram',
            status: p.status || 'draft',
          })),
          launchChecklist: fb.launchChecklist || [],
          stopLossRules: fb.stopLossRules || [],
        })
      }
    }
  }

  // Toggle Piattaforme
  const togglePlatform = (p: string) => {
    setBrief((prev) => {
      const exists = prev.platforms.includes(p)
      return {
        ...prev,
        platforms: exists ? prev.platforms.filter((item) => item !== p) : [...prev.platforms, p],
      }
    })
  }

  // Genera Strategia con APEX AI
  const handleGenerateStrategy = async () => {
    if (!brief.productName.trim() || isGenerating) return
    setIsGenerating(true)
    setSavedSuccessMsg(null)

    try {
      const res = await generateMarketingCampaignAction(brief)
      if (res.success && res.plan) {
        setPlan(res.plan)
        setCurrentStep(2)
        playNotificationSound('chat')
      } else {
        alert(`Errore generazione: ${res.error || 'Impossibile elaborare il piano'}`)
      }
    } catch (err: any) {
      alert(`Errore di rete: ${err.message}`)
    } finally {
      setIsGenerating(false)
    }
  }

  // Copia negli appunti con feedback
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2500)
  }

  // Salva su Supabase
  const handleSaveCampaign = async () => {
    if (!plan) return
    setIsSaving(true)
    setSavedSuccessMsg(null)

    const res = await saveMarketingCampaignAction(brief, plan, campaignIdParam || undefined)
    if (res.success) {
      setSavedSuccessMsg('✅ Campagna e calendario editoriale salvati con successo su Supabase!')
      if (!campaignIdParam && res.campaignId) {
        router.replace(`/marketing/campagna?id=${res.campaignId}`)
      }
    } else {
      alert(`Errore durante il salvataggio: ${res.error}`)
    }
    setIsSaving(false)
  }

  // Dispatch post direttamente a Buffer (con supporto re-invio e cambio canale)
  const handlePublishPostToBuffer = async (post: MarketingEditorialPost, index: number) => {
    const targetKey = post.id || `temp-${index}`
    setIsPublishingPostId(targetKey)

    const res = await publishToBufferAction({
      postId: post.id,
      text: post.fullCopy,
      platform: post.platform || 'Facebook',
      now: false, // Inserimento nella coda programmata di Buffer
    })

    if (res.success) {
      playNotificationSound('chat')
      alert(`🚀 ${res.message}`)
      // Aggiorna stato locale post
      if (plan) {
        const updatedPosts = [...plan.editorialPosts]
        updatedPosts[index] = { ...updatedPosts[index], status: 'published' }
        setPlan({ ...plan, editorialPosts: updatedPosts })
      }
    } else {
      alert(`Errore invio a Buffer: ${res.error}`)
    }

    setIsPublishingPostId(null)
  }

  // Salva il contenuto Express nella libreria campagne (Supabase)
  const handleSaveExpressToLibrary = async () => {
    if (!expressResult || isSavingExpressToLibrary) return
    setIsSavingExpressToLibrary(true)

    const expressBrief: MarketingBriefInput = {
      title: expressResult.topic,
      productName: 'AI Start: Percorso Completo',
      price: 97,
      targetAvatar: expressResult.targetAudience,
      awarenessLevel: 'Problem-Aware',
      coreDesire: '',
      corePain: '',
      budgetDaily: 0,
      platforms: ['Meta Ads (Facebook)', 'Instagram'],
      kpiCpaTarget: 0,
      kpiRoasTarget: 0,
    }

    const expressMinimalPlan = {
      bigIdea: expressResult.topic,
      uniqueMechanism: '',
      grandSlamOffer: {
        dreamOutcome: '',
        perceivedLikelihood: '',
        timeDelayReduction: '',
        effortSacrificeReduction: '',
        bonuses: [],
        guarantee: '',
      },
      angles: [],
      funnelSteps: [],
      editorialPosts: [
        {
          id: undefined,
          day: new Date().toLocaleDateString('it-IT'),
          postType: 'statico' as const,
          title: expressResult.topic,
          summary: expressResult.facebookPost.hook,
          fullCopy: editableExpressFbCopy || expressResult.facebookPost.fullCopy,
          tag: expressResult.targetAudience,
          cta: expressResult.facebookPost.cta,
          platform: 'Meta Ads (Facebook)',
          status: 'draft' as const,
        },
      ],
      launchChecklist: [],
      stopLossRules: [],
    }

    const res = await saveMarketingCampaignAction(expressBrief, expressMinimalPlan)
    if (res.success) {
      setExpressSavedToLibrary(true)
      setExpressSuccessMsg('✅ Post salvato nella libreria campagne — lo ritrovi in Marketing Hub.')
    } else {
      alert(`Errore salvataggio: ${res.error}`)
    }
    setIsSavingExpressToLibrary(false)
  }

  // Genera Contenuti Express (Second Brain + Web Grounding + Corso AI Start)
  const handleGenerateExpress = async () => {
    if (!expressPrompt.trim() || isGeneratingExpress) return
    setIsGeneratingExpress(true)
    setExpressSuccessMsg(null)

    try {
      const res = await generateExpressSocialPostAction({
        prompt: expressPrompt,
        targetFocus: expressTargetFocus,
        includeSecondBrain: expressUseSecondBrain,
        includeWebTrends: expressUseWebTrends,
      })

      if (res.success && res.content) {
        setExpressResult(res.content)
        setEditableExpressFbCopy(res.content.facebookPost.fullCopy)
        playNotificationSound('chat')
      } else {
        alert(`Errore generazione express: ${res.error || 'Impossibile completare la richiesta'}`)
      }
    } catch (err: any) {
      alert(`Errore di connessione: ${err.message}`)
    } finally {
      setIsGeneratingExpress(false)
    }
  }

  // Autorizza e pubblica su Buffer direttamente dal Generatore Express
  const handlePublishExpressToBuffer = async () => {
    if (!expressResult) return
    setIsPublishingExpressBuffer(true)
    setExpressSuccessMsg(null)

    try {
      const textToPublish = editableExpressFbCopy.trim() || expressResult.facebookPost.fullCopy
      const res = await publishToBufferAction({
        text: textToPublish,
        platform: 'Facebook',
        now: false,
      })

      if (res.success) {
        playNotificationSound('chat')
        setExpressSuccessMsg(res.message || '🚀 Post inviato con successo alla coda programmata di Buffer!')
      } else {
        alert(`Errore invio a Buffer: ${res.error}`)
      }
    } catch (err: any) {
      alert(`Errore durante la pubblicazione: ${err.message}`)
    } finally {
      setIsPublishingExpressBuffer(false)
    }
  }

  // Modifica piattaforma o formato del post
  const handleUpdatePostField = (index: number, field: 'platform' | 'postType' | 'status', value: string) => {
    if (!plan) return
    const updatedPosts = [...plan.editorialPosts]
    updatedPosts[index] = { ...updatedPosts[index], [field]: value }
    setPlan({ ...plan, editorialPosts: updatedPosts })
  }

  // Modifica campi dell'angolo (Hook, Body, CTA)
  const handleUpdateAngleField = (index: number, field: 'hook' | 'bodyCopy' | 'callToAction' | 'title', value: string) => {
    if (!plan) return
    const updatedAngles = [...plan.angles]
    updatedAngles[index] = { ...updatedAngles[index], [field]: value }
    setPlan({ ...plan, angles: updatedAngles })
  }

  // Esporta Piano in Markdown
  const handleExportMarkdown = () => {
    if (!plan) return
    const md = `# Piano Strategico di Marketing & Conversione: ${brief.title}

Data Generazione: ${new Date().toLocaleDateString('it-IT')}
Prodotto / Servizio: ${brief.productName} (€${brief.price})
Target Avatar: ${brief.targetAvatar}
Livello Consapevolezza: ${brief.awarenessLevel}

---

## 1. BIG IDEA & MECCANISMO UNICO
- **Big Idea**: ${plan.bigIdea}
- **Meccanismo Unico**: ${plan.uniqueMechanism}
- **Garanzia Rischio Zero**: ${plan.grandSlamOffer.guarantee}

---

## 2. GRAND SLAM OFFER ($100M OFFERS ARCHITECTURE)
- **Dream Outcome**: ${plan.grandSlamOffer.dreamOutcome}
- **Riprova & Certezza**: ${plan.grandSlamOffer.perceivedLikelihood}
- **Azzeramento Ritardo Temporale**: ${plan.grandSlamOffer.timeDelayReduction}
- **Azzeramento Sforzo & Sacrificio**: ${plan.grandSlamOffer.effortSacrificeReduction}

### Bonus Stack Inclusi:
${plan.grandSlamOffer.bonuses.map((b) => `- ${b}`).join('\n')}

---

## 3. MATRICE DEGLI ANGOLI PUBBLICITARI (3:2:2 FRAMEWORK)
${plan.angles
  .map(
    (a, idx) => `### Angolo #${idx + 1}: ${a.title} (${a.creativeType} - Framework ${a.framework})
- **Gancio (Hook)**: "${a.hook}"
- **Body Copy**:
${a.bodyCopy}
- **Call to Action**: ${a.callToAction}
`
  )
  .join('\n---\n')}

---

## 4. ARCHITETTURA DEL FUNNEL (CONVERSION BLUEPRINT)
${plan.funnelSteps
  .map(
    (s) => `### Step ${s.stepNumber}: ${s.phase}
- **Asset**: ${s.assetName}
- **Obiettivo**: ${s.goal}
- **Checklist CRO**:
${s.croChecklist.map((c) => `  - [ ] ${c}`).join('\n')}
`
  )
  .join('\n')}

---

## 5. CALENDARIO EDITORIALE SOCIAL (${plan.editorialPosts.length} Post)
${plan.editorialPosts
  .map(
    (p) => `### [${p.day}] ${p.title} (${p.platform} - ${p.tag})
- **Sintesi**: ${p.summary}
- **CTA**: ${p.cta}
- **Copy Completo**:
${p.fullCopy}
`
  )
  .join('\n---\n')}

---

## 6. REGOLE SCIENTIFICHE DI STOP-LOSS & BUDGET SCALING
${plan.stopLossRules.map((r) => `- [ ] ${r}`).join('\n')}

Generato dall'Agente APEX Growth Architect per ${brief.productName}.`

    const blob = new Blob([md], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `piano_marketing_${brief.productName.toLowerCase().replace(/[^a-z0-9]/g, '_')}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6 pb-16 max-w-6xl mx-auto">
      {/* Top Header Pulito & Intuitivo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link href="/marketing" className="hover:text-blue-400 transition-colors">
              Marketing Hub
            </Link>
            <span>/</span>
            <span className="text-slate-200 font-medium">Contenuti & Campagne Social</span>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-100 flex items-center gap-2.5">
            <Rocket className="h-6 w-6 text-blue-400" />
            Social Post & Video Express
          </h1>
          <p className="text-xs text-slate-400">
            Crea in un clic post Facebook, grafiche per Instagram e script video reel per il corso AI Start o le consulenze PMI.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {plan && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportMarkdown}
                className="border-slate-700 hover:bg-slate-800 text-xs flex items-center gap-1.5"
              >
                <Download className="h-3.5 w-3.5" />
                Esporta .MD
              </Button>
              <Button
                size="sm"
                onClick={handleSaveCampaign}
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs flex items-center gap-1.5 font-semibold"
              >
                {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                Salva Campagna
              </Button>
            </>
          )}
        </div>
      </div>

      {savedSuccessMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{savedSuccessMsg}</span>
        </div>
      )}

      {/* Navigatore compatto contestuale attivo SOLO se è stato generato un piano strategico esteso */}
      {plan && (
        <div className="flex items-center justify-between p-2 bg-slate-900/60 rounded-xl border border-slate-800 text-xs">
          <div className="flex items-center gap-2 text-slate-300 font-medium px-2">
            <Target className="h-4 w-4 text-blue-400" />
            <span>Piano Strategico Generato:</span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              onClick={() => setCurrentStep(1)}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                currentStep === 1 ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Generatore Express
            </button>
            <button
              onClick={() => setCurrentStep(2)}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                currentStep === 2 ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Offerta & Angoli
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                currentStep === 3 ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Landing Page
            </button>
            <button
              onClick={() => setCurrentStep(4)}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                currentStep === 4 ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Calendario Social
            </button>
            <button
              onClick={() => setCurrentStep(5)}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                currentStep === 5 ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Checklist Lancio
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SEZIONE PRINCIPALE: GENERATORE EXPRESS SOCIAL             */}
      {/* ========================================================= */}
      {currentStep === 1 && (
        <div className="space-y-6">
          {/* FAST-TRACK CARD: Generatore Express (Zero perdite di tempo) */}
          <Card className="p-6 bg-gradient-to-b from-slate-900 via-slate-900/90 to-indigo-950/30 border-blue-500/40 rounded-2xl space-y-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs font-semibold px-2.5 py-0.5">
                    ⚡ Modalità Rapida • Guadagna Tempo
                  </Badge>
                  <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30 text-xs">
                    Buffer Diretto
                  </Badge>
                </div>
                <h2 className="text-lg md:text-xl font-extrabold text-slate-100 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-400" />
                  Post Facebook & Reel in 1 Click (Second Brain + Web)
                </h2>
                <p className="text-xs text-slate-300 max-w-2xl">
                  Non perdere tempo a compilare form: scegli o modifica un'idea, l'AI attinge dal <strong>Second Brain</strong> e dalle <strong>20 lezioni del corso AI Start</strong> per preparare subito il testo, la locandina grafica e il reel pronto per l'approvazione e l'invio a Buffer.
                </p>
              </div>

              {/* Selettore Target Focus */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-xl border border-slate-800 shrink-0 self-start sm:self-center">
                <button
                  type="button"
                  onClick={() => setExpressTargetFocus('studenti')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    expressTargetFocus === 'studenti'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <GraduationCap className="h-3.5 w-3.5" />
                  Studenti Corso
                </button>
                <button
                  type="button"
                  onClick={() => setExpressTargetFocus('pmi')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    expressTargetFocus === 'pmi'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Building2 className="h-3.5 w-3.5" />
                  PMI & Studi
                </button>
                <button
                  type="button"
                  onClick={() => setExpressTargetFocus('misto')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    expressTargetFocus === 'misto'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Misto
                </button>
              </div>
            </div>

            {/* Prompt Chips - Idee pronte all'uso per Studenti & PMI */}
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                💡 Idee Pratiche Suggerite (Clicca per inserire al volo nel prompt):
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  {
                    icon: GraduationCap,
                    label: '🎓 Per chi parte da zero (Studenti)',
                    focus: 'studenti' as const,
                    prompt: "Superare la paura di essere in ritardo con l'AI: spiegare perché chi parte da zero impara più in fretta con esempi di vita quotidiana e invito al corso AI Start",
                  },
                  {
                    icon: Sparkles,
                    label: '💡 Micro-lezione RCCF (Mod. 5)',
                    focus: 'studenti' as const,
                    prompt: "Micro-lezione dal corso: la Formula RCCF (Ruolo, Contesto, Contenuto, Formato) per non farsi dare risposte banali o generiche da ChatGPT",
                  },
                  {
                    icon: Clock,
                    label: '⏱️ Risparmiare 5 Ore (Mod. 8)',
                    focus: 'misto' as const,
                    prompt: "Come risparmiare 5 ore a settimana su email, riassunti di documenti e preventivi usando l'AI con metodo guidato e zero stress",
                  },
                  {
                    icon: Brain,
                    label: '🧭 Guida Modelli: ChatGPT vs Claude (Mod. 7)',
                    focus: 'studenti' as const,
                    prompt: "Guida pratica per non-tecnici: ChatGPT vs Claude vs Gemini, quale scegliere per il lavoro quotidiano senza spendere soldi a vuoto",
                  },
                  {
                    icon: Building2,
                    label: '🏢 AI per PMI senza programmatori',
                    focus: 'pmi' as const,
                    prompt: "Perché una piccola impresa o uno studio professionale può iniziare ad automatizzare le task d'ufficio senza dover assumere sviluppatori",
                  },
                ].map((p, idx) => {
                  const Icon = p.icon
                  const isSelected = expressPrompt === p.prompt
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setExpressPrompt(p.prompt)
                        setExpressTargetFocus(p.focus)
                      }}
                      className={`text-xs px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-blue-600/30 border-blue-400 text-blue-200 font-semibold shadow-sm shadow-blue-500/20'
                          : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                      <span>{p.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Input Prompt Modificabile */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-200 flex items-center justify-between">
                <span>Prompt / Argomento del Post (Modificabile liberamente):</span>
                <span className="text-[11px] text-slate-400 font-normal">Puoi personalizzarlo con parole tue</span>
              </label>
              <textarea
                rows={2}
                value={expressPrompt}
                onChange={(e) => setExpressPrompt(e.target.value)}
                placeholder="Es. Spiega come fare ordine nelle email con ChatGPT con un tono calmo e rassicurante..."
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 shadow-inner leading-relaxed"
              />
            </div>

            {/* Opzioni di Grounding & CTA Generazione */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setExpressUseSecondBrain(!expressUseSecondBrain)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${
                    expressUseSecondBrain
                      ? 'bg-purple-600/20 border-purple-500/40 text-purple-200 font-medium'
                      : 'bg-slate-950 border-slate-800 text-slate-500'
                  }`}
                >
                  <Brain className="h-3.5 w-3.5 text-purple-400" />
                  <span>Second Brain & 20 Moduli Corso {expressUseSecondBrain ? '✓' : '✗'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setExpressUseWebTrends(!expressUseWebTrends)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${
                    expressUseWebTrends
                      ? 'bg-blue-600/20 border-blue-500/40 text-blue-200 font-medium'
                      : 'bg-slate-950 border-slate-800 text-slate-500'
                  }`}
                >
                  <Globe className="h-3.5 w-3.5 text-blue-400" />
                  <span>Idee & Trend sul Web {expressUseWebTrends ? '✓' : '✗'}</span>
                </button>
              </div>

              <Button
                onClick={handleGenerateExpress}
                disabled={isGeneratingExpress || !expressPrompt.trim()}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-blue-500/25 flex items-center gap-2 shrink-0 text-xs"
              >
                {isGeneratingExpress ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>APEX sta preparando i post...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 text-amber-300" />
                    <span>Prepara Post & Reel Pronti</span>
                    <ArrowRight className="h-4 w-4 ml-0.5" />
                  </>
                )}
              </Button>
            </div>

            {/* Success feedback per Buffer */}
            {expressSuccessMsg && (
              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                <span>{expressSuccessMsg}</span>
              </div>
            )}

            {/* RISULTATO GENERATO EXPRESS: Griglia a 2 Colonne */}
            {expressResult && (
              <div className="pt-4 border-t border-slate-800 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      Contenuti Pronti per la Pubblicazione
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Topic: <span className="text-slate-200 font-medium">{expressResult.topic}</span> • Target: <span className="text-blue-300">{expressResult.targetAudience}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[11px] border-emerald-500/30 text-emerald-400 font-mono">
                      ✓ Buffer Ready
                    </Badge>
                    <Badge variant="outline" className="text-[11px] border-purple-500/40 text-purple-300 font-mono flex items-center gap-1">
                      <Brain className="h-3 w-3 text-purple-400" />
                      Salvato nel Second Brain
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {/* SCHEDA 1: POST FACEBOOK */}
                  <Card className="p-4 bg-slate-950/80 border-slate-800 rounded-xl space-y-3.5 flex flex-col justify-between">
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <Badge className="bg-blue-600 text-white text-[11px] font-bold">
                          📘 Post Facebook
                        </Badge>
                        <span className="text-[11px] text-slate-400 font-mono">Pronto per Buffer</span>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
                          <span>Testo Completo (Modificabile prima dell'invio):</span>
                          <span className="text-[10px] text-slate-500">Puoi ritoccare qualsiasi parola</span>
                        </label>
                        <textarea
                          rows={8}
                          value={editableExpressFbCopy}
                          onChange={(e) => setEditableExpressFbCopy(e.target.value)}
                          className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 leading-relaxed font-sans focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      {/* Locandina Grafica Suggerita */}
                      <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-800 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Locandina Consigliata per questo Post:
                          </span>
                          <div className="flex items-center gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setPosterData(expressResult.facebookPost.posterSuggestion)
                                setIsPosterModalOpen(true)
                              }}
                              className="h-6 px-2 text-[11px] border-blue-500/40 bg-blue-950/40 text-blue-300 hover:text-white hover:border-blue-400"
                            >
                              <Palette className="h-3 w-3 mr-1 text-blue-400" />
                              Locandina PNG
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setIsCarouselModalOpen(true)}
                              className="h-6 px-2 text-[11px] border-purple-500/40 bg-purple-950/40 text-purple-300 hover:text-white hover:border-purple-400"
                            >
                              <Layers className="h-3 w-3 mr-1 text-purple-400" />
                              Carosello ({expressResult.carouselSlides?.length || 5} Slide)
                            </Button>
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-300 font-medium italic">
                          "{expressResult.facebookPost.posterSuggestion.title}"
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCopy(editableExpressFbCopy, 'express-fb')}
                        className="h-8 px-2.5 text-xs text-slate-400 hover:text-white"
                      >
                        {copiedId === 'express-fb' ? <Check className="h-3.5 w-3.5 text-emerald-400 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                        Copia Testo
                      </Button>

                      <div className="flex items-center gap-1.5">
                        {/* Salva nella libreria */}
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isSavingExpressToLibrary || expressSavedToLibrary}
                          onClick={handleSaveExpressToLibrary}
                          className={`h-8 px-3 text-xs font-semibold border flex items-center gap-1.5 transition-all ${
                            expressSavedToLibrary
                              ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10 cursor-default'
                              : 'border-slate-700 text-slate-300 hover:border-emerald-500/50 hover:text-emerald-300 hover:bg-emerald-500/10'
                          }`}
                        >
                          {isSavingExpressToLibrary ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : expressSavedToLibrary ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                          ) : (
                            <Save className="h-3.5 w-3.5" />
                          )}
                          <span>{expressSavedToLibrary ? 'Salvato' : 'Salva nella libreria'}</span>
                        </Button>

                        {/* CTA Invio a Buffer */}
                        <Button
                          size="sm"
                          disabled={isPublishingExpressBuffer}
                          onClick={handlePublishExpressToBuffer}
                          className="h-8 px-3.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 flex items-center gap-1.5"
                        >
                          {isPublishingExpressBuffer ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Send className="h-3.5 w-3.5" />
                          )}
                          <span>Pubblica su Buffer</span>
                        </Button>
                      </div>
                    </div>
                  </Card>

                  {/* SCHEDA 2: REEL SCRIPT / VIDEO BREVE */}
                  <Card className="p-4 bg-slate-950/80 border-slate-800 rounded-xl space-y-3.5 flex flex-col justify-between">
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <Badge className="bg-pink-600 text-white text-[11px] font-bold">
                          🎬 Script Reel / TikTok (9:16)
                        </Badge>
                        <span className="text-[11px] text-slate-400 font-mono">30-45 sec</span>
                      </div>

                      <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-800 space-y-1">
                        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                          Hook Primi 3 Secondi (Visivo & Parlato):
                        </span>
                        <p className="text-xs text-slate-200 font-medium italic">
                          "{expressResult.reelScript.hookVisualAndAudio}"
                        </p>
                      </div>

                      <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Timeline Scene:
                        </span>
                        {expressResult.reelScript.scenes.map((s, idx) => (
                          <div key={idx} className="p-2 bg-slate-900/40 rounded border border-slate-800/80 text-[11px] space-y-1">
                            <div className="flex items-center justify-between font-mono text-[10px] text-blue-400 font-bold">
                              <span>⏱️ {s.time}</span>
                            </div>
                            <div className="text-slate-400 text-[11px]"><strong className="text-slate-300">Visivo:</strong> {s.visual}</div>
                            <div className="text-slate-200 text-[11px] font-medium"><strong className="text-slate-300">Audio:</strong> "{s.audioText}"</div>
                          </div>
                        ))}
                      </div>

                      <div className="text-[11px] text-slate-400 italic">
                        🎵 Mood musicale: {expressResult.reelScript.musicTone}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-1.5">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          const scriptText = `TITOLO: ${expressResult.reelScript.title}\nHOOK: ${expressResult.reelScript.hookVisualAndAudio}\n\nSCENE:\n${expressResult.reelScript.scenes.map(s => `[${s.time}]\nVISUAL: ${s.visual}\nAUDIO: ${s.audioText}`).join('\n\n')}\n\nCTA: ${expressResult.reelScript.cta}`
                          handleCopy(scriptText, 'express-reel')
                        }}
                        className="h-8 px-2.5 text-xs text-slate-400 hover:text-white"
                      >
                        {copiedId === 'express-reel' ? <Check className="h-3.5 w-3.5 text-emerald-400 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                        Copia Script
                      </Button>

                      <div className="flex items-center gap-1.5 ml-auto">
                        <Button
                          size="sm"
                          onClick={() => setIsReelVideoModalOpen(true)}
                          className="h-8 px-2.5 text-[11px] bg-pink-600 hover:bg-pink-500 text-white font-semibold shadow-sm shadow-pink-600/25 flex items-center gap-1"
                        >
                          <Video className="h-3.5 w-3.5" />
                          <span>Video Reel (9:16)</span>
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setPosterData({
                              title: expressResult.reelScript.title,
                              hook: expressResult.reelScript.hookVisualAndAudio.slice(0, 70),
                              body: expressResult.reelScript.captionText.slice(0, 150),
                              cta: expressResult.reelScript.cta,
                            })
                            setIsPosterModalOpen(true)
                          }}
                          className="h-8 px-2 text-[11px] border-slate-700 bg-slate-900 text-slate-300 hover:text-white"
                        >
                          <Palette className="h-3 w-3 mr-1 text-pink-400" />
                          Cover 9:16
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const scriptText = expressResult.reelScript.scenes.map(s => s.audioText).join(' ')
                            handleCopy(scriptText, 'capcut-reel')
                            window.open('https://www.capcut.com/tools/script-to-video', '_blank')
                          }}
                          className="h-8 px-2 text-[11px] border-slate-700 bg-slate-900 text-slate-300 hover:text-white hover:border-pink-500/60"
                        >
                          <Sparkles className="h-3 w-3 mr-1 text-pink-400" />
                          CapCut
                          <ExternalLink className="h-2 w-2 ml-1 text-slate-500" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            )}
          </Card>

          {/* TOGGLE PER IL FORM AVANZATO (11 CAMPI APEX) */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowAdvancedWizard(!showAdvancedWizard)}
              className="w-full flex items-center justify-between p-3.5 bg-slate-900/40 hover:bg-slate-900/80 border border-slate-800/80 rounded-2xl text-xs font-semibold text-slate-300 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-400" />
                <span>Vuoi configurare una Campagna Funnel Completa APEX a 5 Step?</span>
                <Badge variant="outline" className="text-[10px] border-slate-700 text-slate-400 font-normal">
                  {showAdvancedWizard ? 'Nascondi Form Esteso' : 'Opzionale (11 Campi Media Buying)'}
                </Badge>
              </div>
              <span className="text-blue-400 text-xs font-medium">
                {showAdvancedWizard ? '▲ Nascondi Form Avanzato' : '▼ Mostra Form Avanzato'}
              </span>
            </button>
          </div>

          {/* Form Avanzato Condizionale */}
          {showAdvancedWizard && (
            <Card className="p-6 bg-slate-900/60 border-slate-800 rounded-2xl space-y-6 animate-in fade-in duration-200">
              <div className="space-y-1">
                <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-400" />
                  1. Informazioni Generali & Avatar Target
                </h2>
                <p className="text-xs text-slate-400">
                  Definisci il prodotto, l'offerta e la psicologia del target secondo i principi di Eugene Schwartz.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">Titolo Interno Campagna</label>
                  <Input
                    value={brief.title}
                    onChange={(e) => setBrief({ ...brief, title: e.target.value })}
                    placeholder="Es. Lancio Q4 Corso AI Start"
                    className="bg-slate-950 border-slate-700 text-xs text-slate-100 placeholder:text-slate-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">Nome Prodotto/Servizio</label>
                    <Input
                      value={brief.productName}
                      onChange={(e) => setBrief({ ...brief, productName: e.target.value })}
                      placeholder="Es. AI Start"
                      className="bg-slate-950 border-slate-700 text-xs text-slate-100 placeholder:text-slate-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">Prezzo Offerta (€)</label>
                    <Input
                      type="number"
                      value={brief.price}
                      onChange={(e) => setBrief({ ...brief, price: Number(e.target.value) || 0 })}
                      className="bg-slate-950 border-slate-700 text-xs text-slate-100 placeholder:text-slate-500"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Avatar Target (Buyer Persona & Contesto)
                  </label>
                  <textarea
                    value={brief.targetAvatar}
                    onChange={(e) => setBrief({ ...brief, targetAvatar: e.target.value })}
                    rows={2}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                    placeholder="Descrivi chi acquista: età, ruolo, paure e contesto professionale..."
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Dolore Viscerale Primario (Nightmare)
                  </label>
                  <textarea
                    value={brief.corePain}
                    onChange={(e) => setBrief({ ...brief, corePain: e.target.value })}
                    rows={2}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                    placeholder="Cosa non li fa dormire la notte o quale ostacolo li blocca..."
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Desiderio Trasformativo (Dream Outcome)
                  </label>
                  <textarea
                    value={brief.coreDesire}
                    onChange={(e) => setBrief({ ...brief, coreDesire: e.target.value })}
                    rows={2}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                    placeholder="Il risultato ideale che desiderano raggiungere sopra ogni cosa..."
                  />
                </div>
              </div>

              {/* Livello di Consapevolezza (Schwartz) */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="text-xs font-semibold text-slate-300 block">
                  Livello di Consapevolezza del Pubblico Target (Eugene Schwartz)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {AWARENESS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setBrief({ ...brief, awarenessLevel: opt.value })}
                      className={`p-3 rounded-xl text-left text-xs transition-all border ${
                        brief.awarenessLevel === opt.value
                          ? 'bg-blue-600/15 border-blue-500 text-white font-medium shadow-sm'
                          : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-semibold text-slate-200">{opt.label}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Canali & Parametri Budget */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <label className="text-xs font-semibold text-slate-300 block">Canali di Pubblicazione & Advertising</label>
                <div className="flex flex-wrap gap-2">
                  {PLATFORM_OPTIONS.map((p) => {
                    const active = brief.platforms.includes(p)
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => togglePlatform(p)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          active
                            ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                            : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                        }`}
                      >
                        {p}
                      </button>
                    )
                  })}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Budget Giornaliero (€/giorno)</label>
                    <Input
                      type="number"
                      value={brief.budgetDaily}
                      onChange={(e) => setBrief({ ...brief, budgetDaily: Number(e.target.value) || 0 })}
                      className="bg-slate-950 border-slate-700 text-xs text-slate-100 placeholder:text-slate-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">CPA Massimo Target (€)</label>
                    <Input
                      type="number"
                      value={brief.kpiCpaTarget}
                      onChange={(e) => setBrief({ ...brief, kpiCpaTarget: Number(e.target.value) || 0 })}
                      className="bg-slate-950 border-slate-700 text-xs text-slate-100 placeholder:text-slate-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">ROAS Minimo Atteso</label>
                    <Input
                      type="number"
                      step="0.1"
                      value={brief.kpiRoasTarget}
                      onChange={(e) => setBrief({ ...brief, kpiRoasTarget: Number(e.target.value) || 0 })}
                      className="bg-slate-950 border-slate-700 text-xs text-slate-100 placeholder:text-slate-500"
                    />
                  </div>
                </div>
              </div>

              {/* CTA Genera con APEX AI */}
              <div className="pt-4 flex justify-end">
                <Button
                  onClick={handleGenerateStrategy}
                  disabled={isGenerating || !brief.productName.trim()}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-5 rounded-xl shadow-lg shadow-blue-500/25 flex items-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>APEX Architect sta elaborando la strategia...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 text-blue-300" />
                      <span>Genera Strategia Completa con APEX AI</span>
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </>
                  )}
                </Button>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* STEP 2: OFFERTA GRAND SLAM & MATRICE ANGOLI 3:2:2         */}
      {/* ========================================================= */}
      {currentStep === 2 && plan && (
        <div className="space-y-6">
          {/* Big Idea & Meccanismo Unico */}
          <Card className="p-6 bg-slate-900/80 border-blue-500/30 rounded-2xl space-y-4 shadow-xl">
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30 font-semibold px-2.5 py-0.5">
                La Big Idea Magnetica
              </Badge>
            </div>
            <h2 className="text-lg md:text-xl font-extrabold text-slate-100">{plan.bigIdea}</h2>

            <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1.5">
              <div className="text-xs font-semibold text-blue-400">Meccanismo Unico Proprietario:</div>
              <p className="text-xs text-slate-300 leading-relaxed">{plan.uniqueMechanism}</p>
            </div>
          </Card>

          {/* Grand Slam Offer Matrix (Hormozi Value Equation) */}
          <Card className="p-6 bg-slate-900/60 border-slate-800 rounded-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Flame className="h-5 w-5 text-amber-400" />
                Grand Slam Offer ($100M Value Equation)
              </h3>
              <Badge variant="outline" className="text-xs font-mono border-amber-500/30 text-amber-300">
                Massimo Valore Percepito
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="font-semibold text-emerald-400 block mb-1">🎯 Dream Outcome (Risultato da Sogno)</span>
                <p className="text-slate-300">{plan.grandSlamOffer.dreamOutcome}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="font-semibold text-blue-400 block mb-1">🛡️ Probabilità Percepita di Successo</span>
                <p className="text-slate-300">{plan.grandSlamOffer.perceivedLikelihood}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="font-semibold text-indigo-400 block mb-1">⚡ Azzeramento Ritardo Temporale</span>
                <p className="text-slate-300">{plan.grandSlamOffer.timeDelayReduction}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="font-semibold text-purple-400 block mb-1">✨ Azzeramento Sforzo & Sacrificio</span>
                <p className="text-slate-300">{plan.grandSlamOffer.effortSacrificeReduction}</p>
              </div>
            </div>

            {/* Bonus Stack & Garanzia */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
              <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800/80">
                <h4 className="text-xs font-bold text-slate-200 mb-2">🎁 Bonus Stack Inclusi:</h4>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {plan.grandSlamOffer.bonuses.map((b, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-emerald-950/20 rounded-xl border border-emerald-500/30 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-emerald-300 mb-1.5 flex items-center gap-1.5">
                    <ShieldAlert className="h-4 w-4 text-emerald-400" />
                    Garanzia Audace "Rischio Zero"
                  </h4>
                  <p className="text-xs text-emerald-100/80 leading-relaxed">{plan.grandSlamOffer.guarantee}</p>
                </div>
                <div className="text-[11px] text-emerald-400/70 mt-2 font-mono">100% Risk Reversal applicato</div>
              </div>
            </div>
          </Card>

          {/* Matrice dei 3 Angoli di Comunicazione */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Layout className="h-5 w-5 text-blue-400" />
              Matrice Creativa 3:2:2 (3 Angoli Differenziati)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plan.angles.map((angle, idx) => (
                <Card key={angle.id || idx} className="p-5 bg-slate-900/70 border-slate-800 rounded-2xl flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-blue-500/15 text-blue-400 border-blue-500/20 text-[11px]">
                        {angle.creativeType}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] font-mono border-slate-700 text-slate-400">
                        {angle.framework}
                      </Badge>
                    </div>

                    <input
                      type="text"
                      value={angle.title}
                      onChange={(e) => handleUpdateAngleField(idx, 'title', e.target.value)}
                      className="font-bold text-sm text-slate-100 bg-transparent border-b border-transparent hover:border-slate-700 focus:border-blue-500 focus:outline-none w-full py-0.5"
                    />

                    {/* Gancio Modificabile */}
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider block">
                        Gancio (Primi 3 Secondi / Hook):
                      </span>
                      <textarea
                        rows={2}
                        value={angle.hook}
                        onChange={(e) => handleUpdateAngleField(idx, 'hook', e.target.value)}
                        className="text-xs text-slate-200 italic font-medium bg-transparent border-none resize-none focus:outline-none w-full leading-relaxed"
                        placeholder="Inserisci il gancio iniziale..."
                      />
                    </div>

                    {/* Corpo Copy Modificabile */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                        Script / Corpo del Messaggio:
                      </span>
                      <textarea
                        rows={5}
                        value={angle.bodyCopy}
                        onChange={(e) => handleUpdateAngleField(idx, 'bodyCopy', e.target.value)}
                        className="text-xs text-slate-300 leading-relaxed bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80 resize-none focus:border-blue-500 focus:outline-none w-full font-sans"
                        placeholder="Inserisci lo script..."
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 space-y-2">
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-blue-400 shrink-0">👉</span>
                      <input
                        type="text"
                        value={angle.callToAction}
                        onChange={(e) => handleUpdateAngleField(idx, 'callToAction', e.target.value)}
                        placeholder="Call To Action..."
                        className="text-[11px] text-blue-300 font-semibold bg-transparent border-b border-transparent hover:border-slate-700 focus:border-blue-500 focus:outline-none w-full py-0.5"
                      />
                    </div>
                    
                    <div className="flex flex-wrap items-center justify-end gap-1.5 pt-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCopy(`${angle.hook}\n\n${angle.bodyCopy}\n\n${angle.callToAction}`, angle.id)}
                        className="h-7 px-2 text-xs text-slate-400 hover:text-white"
                        title="Copia Script Completo"
                      >
                        {copiedId === angle.id ? <Check className="h-3.5 w-3.5 text-emerald-400 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                        Copia
                      </Button>

                      {/* Tool Video / Script Ad su CapCut */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          handleCopy(`HOOK (3 sec):\n${angle.hook}\n\nCORPO:\n${angle.bodyCopy}\n\nCALL TO ACTION:\n${angle.callToAction}`, angle.id)
                          window.open('https://www.capcut.com/tools/script-to-video', '_blank')
                        }}
                        title="Copia script e crea Video Ad su CapCut AI"
                        className="h-7 px-2 text-[11px] border-slate-700 bg-slate-950/60 text-slate-300 hover:text-white hover:border-pink-500/60 transition-colors"
                      >
                        <Video className="h-3 w-3 mr-1 text-pink-400" />
                        CapCut Ad
                        <ExternalLink className="h-2.5 w-2.5 ml-1 text-slate-500" />
                      </Button>

                      {/* Tool Visual Ad su Canva */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          handleCopy(`${angle.hook}\n\n${angle.bodyCopy}`, angle.id)
                          window.open('https://www.canva.com', '_blank')
                        }}
                        title="Copia copy e apri Canva per creare il visual"
                        className="h-7 px-2 text-[11px] border-slate-700 bg-slate-950/60 text-slate-300 hover:text-white hover:border-blue-500/60 transition-colors"
                      >
                        <Layout className="h-3 w-3 mr-1 text-blue-400" />
                        Canva
                        <ExternalLink className="h-2.5 w-2.5 ml-1 text-slate-500" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Navigation Step */}
          <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4">
            <Button variant="outline" onClick={() => setCurrentStep(1)} className="border-slate-700 text-xs">
              <ArrowLeft className="h-3.5 w-3.5 mr-1" />
              Modifica Brief
            </Button>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setCurrentStep(3)} className="border-slate-700 hover:bg-slate-800 text-slate-300 text-xs">
                Vedi Struttura Landing Page
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
              <Button onClick={() => setCurrentStep(4)} className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-600/20">
                🚀 Vai Subito al Calendario Social
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* STEP 3: FUNNEL BLUEPRINT & CRO ARCHITECTURE               */}
      {/* ========================================================= */}
      {currentStep === 3 && plan && (
        <div className="space-y-6">
          {/* Banner Informativo per il Collaboratore */}
          <div className="p-4 bg-blue-950/40 border border-blue-800/60 rounded-2xl flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-sm shrink-0">
                ℹ️
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-blue-200">Guida di Riferimento per la Landing Page (aiutiamoci.cloud)</h4>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Questa sezione è <strong>consultiva</strong>: mostra come è strutturata l'offerta sulla pagina di vendita del corso. Non è richiesta alcuna azione tecnica qui se la landing page è già online. Puoi usare le regole CRO qui sotto per verificare o ottimizzare i testi del sito.
                </p>
              </div>
            </div>

            <Button
              size="sm"
              onClick={() => setCurrentStep(4)}
              className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shrink-0 shadow-sm shadow-purple-500/20"
            >
              🚀 Vai ai Post Social
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>

          <Card className="p-6 bg-slate-900/60 border-slate-800 rounded-2xl space-y-6">
            <div className="space-y-1">
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Layers className="h-5 w-5 text-purple-400" />
                Architettura della Pagina & Flusso di Vendita
              </h2>
              <p className="text-xs text-slate-400">
                Mappa passo-passo per guidare il traffico dai social alla landing page fino all'iscrizione.
              </p>
            </div>

            {/* Funnel Steps Flow */}
            <div className="space-y-4">
              {plan.funnelSteps.map((step, idx) => (
                <div
                  key={step.stepNumber || idx}
                  className="p-5 bg-slate-950/70 border border-slate-800 rounded-xl relative overflow-hidden flex flex-col md:flex-row md:items-start justify-between gap-4"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-9 h-9 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold font-mono text-sm shrink-0">
                      0{step.stepNumber}
                    </div>
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className="bg-purple-500/15 text-purple-300 border-purple-500/20 text-[10px]">
                          {step.phase}
                        </Badge>
                        <h4 className="font-bold text-sm text-slate-100">{step.assetName}</h4>
                      </div>
                      <p className="text-xs text-slate-300">{step.goal}</p>

                      <div className="pt-2 flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCopy(`FASE: ${step.phase}\nASSET: ${step.assetName}\nOBIETTIVO: ${step.goal}\n\nCHECKLIST CRO:\n${step.croChecklist.map(c => `- ${c}`).join('\n')}`, `funnel-${idx}`)}
                          className="h-7 px-2 text-xs text-slate-400 hover:text-white"
                        >
                          {copiedId === `funnel-${idx}` ? (
                            <Check className="h-3.5 w-3.5 text-emerald-400 mr-1" />
                          ) : (
                            <Copy className="h-3.5 w-3.5 mr-1" />
                          )}
                          Copia Specifiche Pagina
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-900/80 rounded-lg border border-slate-800/80 md:w-80 shrink-0 space-y-1.5">
                    <div className="text-[11px] font-semibold text-slate-300">Regole CRO & Above-The-Fold:</div>
                    <ul className="space-y-1 text-[11px] text-slate-400">
                      {step.croChecklist.map((item, cIdx) => (
                        <li key={cIdx} className="flex items-center gap-1.5">
                          <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Navigation Step */}
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => setCurrentStep(2)} className="border-slate-700 text-xs">
              <ArrowLeft className="h-3.5 w-3.5 mr-1" />
              Torna a Offerta & Angoli
            </Button>
            <Button onClick={() => setCurrentStep(4)} className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold">
              Vai al Calendario Social & n8n
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* STEP 4: CALENDARIO EDITORIALE & SOCIAL DISPATCHER          */}
      {/* ========================================================= */}
      {currentStep === 4 && plan && (
        <div className="space-y-6">
          {/* Header Calendario */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-400" />
                Calendario Editoriale Strategico ({plan.editorialPosts.length} Post)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Pianificazione organica e di retargeting per Instagram, Facebook e LinkedIn.
              </p>
            </div>
          </div>

          {/* Griglia Post */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plan.editorialPosts.map((post, idx) => {
              const isPublishing = isPublishingPostId === (post.id || `temp-${idx}`)
              const isPublished = post.status === 'published'

              return (
                <Card
                  key={post.id || idx}
                  className={`p-5 bg-slate-900/70 border rounded-2xl flex flex-col justify-between space-y-4 transition-all ${
                    isPublished ? 'border-emerald-500/40 bg-emerald-950/10' : 'border-slate-800'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge className="bg-blue-600 text-white font-mono text-[11px]">{post.day}</Badge>
                        
                        {/* Selettore Formato Post */}
                        <select
                          value={post.postType || 'carosello'}
                          onChange={(e) => handleUpdatePostField(idx, 'postType', e.target.value)}
                          className="bg-slate-950 border border-slate-800 text-slate-300 rounded-md text-[11px] px-2 py-0.5 outline-none cursor-pointer hover:border-slate-700 transition-colors"
                        >
                          <option value="carosello">Carosello</option>
                          <option value="reel">Reel</option>
                          <option value="statico">Statico</option>
                          <option value="lead-magnet">Lead Magnet</option>
                          <option value="storia">Storia</option>
                        </select>
                      </div>

                      {/* Selettore Canale Social */}
                      <div className="flex items-center gap-1">
                        <select
                          value={post.platform || 'Facebook'}
                          onChange={(e) => handleUpdatePostField(idx, 'platform', e.target.value)}
                          className="bg-slate-950 border border-slate-800 text-slate-200 rounded-md text-[11px] font-semibold px-2 py-0.5 outline-none cursor-pointer hover:border-purple-500/50 transition-colors"
                        >
                          <option value="Facebook">📘 Facebook</option>
                          <option value="Instagram">📸 Instagram</option>
                          <option value="LinkedIn">💼 LinkedIn</option>
                          <option value="TikTok">🎵 TikTok</option>
                        </select>

                        {isPublished && (
                          <button
                            type="button"
                            title="Clicca per reimpostare su 'Da inviare'"
                            onClick={() => handleUpdatePostField(idx, 'status', 'draft')}
                            className="text-[10px] bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/30 px-1.5 py-0.5 rounded border border-emerald-500/30 transition-colors"
                          >
                            ✓ Inviato
                          </button>
                        )}
                      </div>
                    </div>

                    <h4 className="font-bold text-sm text-slate-100">{post.title}</h4>
                    <p className="text-xs text-slate-400 line-clamp-2">{post.summary}</p>

                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 font-mono whitespace-pre-line max-h-36 overflow-y-auto">
                      {post.fullCopy}
                    </div>

                    <div className="text-[11px] text-amber-300/80 font-medium">
                      🎯 <span className="text-slate-400">CTA:</span> {post.cta}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                    {/* Gruppo Azioni Rapide Contenuto */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCopy(post.fullCopy, `post-${idx}`)}
                        className="h-7 px-2 text-xs text-slate-400 hover:text-white"
                      >
                        {copiedId === `post-${idx}` ? (
                          <Check className="h-3.5 w-3.5 text-emerald-400 mr-1" />
                        ) : (
                          <Copy className="h-3.5 w-3.5 mr-1" />
                        )}
                        Copia
                      </Button>

                      {/* Tool Generatore Caroselli */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          handleCopy(post.fullCopy, `post-${idx}`)
                          window.open('https://taplio.com/carousel', '_blank')
                        }}
                        title="Copia il testo e apri il generatore di caroselli gratuito"
                        className="h-7 px-2 text-[11px] border-slate-700 bg-slate-950/60 text-slate-300 hover:text-white hover:border-purple-500/60 transition-colors"
                      >
                        <Layout className="h-3 w-3 mr-1 text-purple-400" />
                        Crea Carosello
                        <ExternalLink className="h-2.5 w-2.5 ml-1 text-slate-500" />
                      </Button>

                      {/* Tool Generatore Reel (CapCut Script to Video) */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          handleCopy(post.fullCopy, `post-${idx}`)
                          window.open('https://www.capcut.com/tools/script-to-video', '_blank')
                        }}
                        title="Copia lo script e apri l'AI video generator gratuito di CapCut"
                        className="h-7 px-2 text-[11px] border-slate-700 bg-slate-950/60 text-slate-300 hover:text-white hover:border-pink-500/60 transition-colors"
                      >
                        <Video className="h-3 w-3 mr-1 text-pink-400" />
                        Crea Reel (CapCut)
                        <ExternalLink className="h-2.5 w-2.5 ml-1 text-slate-500" />
                      </Button>

                      {/* Tool Generatore Locandina Grafica */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setPosterData({
                            title: post.title,
                            hook: plan.bigIdea || 'Umani nel pensiero. Smart nell’azione.',
                            body: post.summary || post.fullCopy.slice(0, 180),
                            cta: post.cta || 'Scrivici nei messaggi per iniziare',
                          })
                          setIsPosterModalOpen(true)
                        }}
                        title="Genera ed esporta la locandina grafica PNG per questo post"
                        className="h-7 px-2 text-[11px] border-slate-700 bg-slate-950/60 text-blue-300 hover:text-white hover:border-blue-500/60 transition-colors"
                      >
                        <Palette className="h-3 w-3 mr-1 text-blue-400" />
                        Crea Locandina PNG
                      </Button>
                    </div>

                    {/* Invio a Buffer */}
                    <div className="flex items-center gap-1.5 ml-auto">
                      <Button
                        size="sm"
                        disabled={isPublishing}
                        onClick={() => handlePublishPostToBuffer(post, idx)}
                        className={`h-8 text-xs font-semibold flex items-center gap-1.5 ${
                          isPublished
                            ? 'bg-slate-800 hover:bg-purple-600 text-slate-300 hover:text-white border border-slate-700'
                            : 'bg-purple-600 hover:bg-purple-500 text-white shadow-sm shadow-purple-500/20'
                        }`}
                      >
                        {isPublishing ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Send className="h-3.5 w-3.5" />
                        )}
                        <span>{isPublished ? 'Re-invia a Buffer' : 'Invia a Buffer'}</span>
                      </Button>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>

          {/* Navigation Step */}
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => setCurrentStep(3)} className="border-slate-700 text-xs">
              <ArrowLeft className="h-3.5 w-3.5 mr-1" />
              Torna al Funnel
            </Button>
            <Button onClick={() => setCurrentStep(5)} className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold">
              Checklist Lancio & Regole Stop-Loss
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* STEP 5: LANCIO, REGOLE STOP-LOSS & EXPORT                  */}
      {/* ========================================================= */}
      {currentStep === 5 && plan && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Checklist Pre-Lancio */}
            <Card className="p-6 bg-slate-900/60 border-slate-800 rounded-2xl space-y-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-emerald-400" />
                <h3 className="font-bold text-sm text-slate-100">Checklist di Validazione Pre-Lancio</h3>
              </div>
              <p className="text-xs text-slate-400">Verifica ogni punto prima di attivare le campagne e spendere budget.</p>

              <div className="space-y-2.5 pt-2">
                {plan.launchChecklist.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                    <input type="checkbox" className="mt-0.5 rounded accent-blue-500" defaultChecked={idx < 2} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Regole Scientifiche di Stop-Loss & Scaling */}
            <Card className="p-6 bg-slate-900/60 border-slate-800 rounded-2xl space-y-4">
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-amber-400" />
                <h3 className="font-bold text-sm text-slate-100">Regole di Salvaguardia & Scaling Budget</h3>
              </div>
              <p className="text-xs text-slate-400">Spegni i perdenti ed incrementa il budget solo sui vincitori comprovati.</p>

              <div className="space-y-2.5 pt-2">
                {plan.stopLossRules.map((rule, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                    <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>{rule}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Action Footer Finale */}
          <Card className="p-6 bg-gradient-to-r from-blue-950 via-slate-900 to-slate-950 border-blue-800/40 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-base text-slate-100">Pronto per il Lancio della Campagna</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Salva la campagna su Supabase per sincronizzarla con tutto il team o scarica il file Markdown.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Button
                variant="outline"
                onClick={handleExportMarkdown}
                className="border-slate-700 text-xs flex items-center gap-1.5"
              >
                <Download className="h-3.5 w-3.5" />
                Scarica Piano (.md)
              </Button>
              <Button
                onClick={handleSaveCampaign}
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-5 py-2.5 flex items-center gap-1.5"
              >
                {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                Salva Campagna su Supabase
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Modal Generatore di Locandine Grafiche PNG */}
      <LocandinaGeneratorModal
        isOpen={isPosterModalOpen}
        onClose={() => setIsPosterModalOpen(false)}
        initialTitle={posterData.title}
        initialHook={posterData.hook}
        initialBody={posterData.body}
        initialCta={posterData.cta}
      />

      {/* Modal Generatore di Caroselli Multi-Slide (4:5) */}
      <CarouselGeneratorModal
        isOpen={isCarouselModalOpen}
        onClose={() => setIsCarouselModalOpen(false)}
        initialSlides={expressResult?.carouselSlides}
        topic={expressResult?.topic}
      />

      {/* Modal Generatore & Render Video Reel (9:16) */}
      <ReelVideoGeneratorModal
        isOpen={isReelVideoModalOpen}
        onClose={() => setIsReelVideoModalOpen(false)}
        title={expressResult?.reelScript?.title}
        hook={expressResult?.reelScript?.hookVisualAndAudio}
        scenes={expressResult?.reelScript?.scenes}
        cta={expressResult?.reelScript?.cta}
        captionText={expressResult?.reelScript?.captionText}
      />
    </div>
  )
}

export default function CampaignWizardPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Caricamento workspace...</div>}>
      <CampaignWizardContent />
    </Suspense>
  )
}
