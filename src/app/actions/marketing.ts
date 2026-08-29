'use server'

import { createClient } from '@/lib/supabase/server'
import { callGemini } from './ai'

export interface MarketingBriefInput {
  title: string
  productName: string
  price: number
  targetAvatar: string
  awarenessLevel: 'Unaware' | 'Problem-Aware' | 'Solution-Aware' | 'Product-Aware' | 'Most-Aware'
  coreDesire: string
  corePain: string
  budgetDaily: number
  platforms: string[]
  kpiCpaTarget?: number
  kpiRoasTarget?: number
}

export interface MarketingAngle {
  id: string
  title: string
  hook: string
  creativeType: 'UGC Video' | 'Carosello' | 'Immagine Statica' | 'Screen Record Demo'
  bodyCopy: string
  callToAction: string
  framework: 'PAS' | 'AIDA' | 'Hormozi Value' | 'Pattern Interrupt'
}

export interface MarketingFunnelStep {
  stepNumber: number
  phase: string
  assetName: string
  goal: string
  croChecklist: string[]
}

export interface MarketingEditorialPost {
  id?: string
  day: string
  postType: 'carosello' | 'reel' | 'lead-magnet' | 'mindset' | 'statico'
  typeLabel?: string
  title: string
  summary: string
  fullCopy: string
  tag: string
  cta: string
  platform: string
  scheduledAt?: string
  status?: 'draft' | 'queued' | 'published' | 'failed'
}

export interface MarketingGeneratedPlan {
  bigIdea: string
  uniqueMechanism: string
  grandSlamOffer: {
    dreamOutcome: string
    perceivedLikelihood: string
    timeDelayReduction: string
    effortSacrificeReduction: string
    bonuses: string[]
    guarantee: string
  }
  angles: MarketingAngle[]
  funnelSteps: MarketingFunnelStep[]
  editorialPosts: MarketingEditorialPost[]
  launchChecklist: string[]
  stopLossRules: string[]
}

// 1. Generazione della Strategia Completa con l'Agente APEX Growth Architect
export async function generateMarketingCampaignAction(brief: MarketingBriefInput): Promise<{
  success: boolean
  plan?: MarketingGeneratedPlan
  error?: string
}> {
  try {
    const systemPrompt = `Sei APEX Growth Architect, l'agente di intelligenza artificiale d'élite specializzato nell'ingegneria del marketing a risposta diretta (Hormozi, Brunson, Schwartz, Kennedy, Hopkins).
Il tuo obiettivo è elaborare una strategia di marketing scientifica, persuasiva, ad altissima conversione e pronta all'uso a partire dal brief fornito.

DEVI RESTITUIRE ESCLUSIVAMENTE UN JSON VALIDO (senza markdown o testo extra) con questa struttura esatta:
{
  "bigIdea": "L'idea magnetica centrale che differenzia radicalmente l'offerta sul mercato",
  "uniqueMechanism": "Il nome e la spiegazione del meccanismo unico esclusivo che garantisce il risultato",
  "grandSlamOffer": {
    "dreamOutcome": "Cosa ottiene il cliente ideale al suo massimo potenziale",
    "perceivedLikelihood": "Elementi di certezza e riprova sociale che alzano la fiducia",
    "timeDelayReduction": "Come viene azzerato o ridotto il tempo per vedere i primi risultati",
    "effortSacrificeReduction": "Come eliminiamo ogni fatica o complessità per il cliente",
    "bonuses": [
      "Bonus 1: Nome e valore percepito",
      "Bonus 2: Nome e valore percepito",
      "Bonus 3: Nome e valore percepito"
    ],
    "guarantee": "Garanzia audace 'Rischio Zero' (es. 30 giorni soddisfatti o 100% rimborsati)"
  },
  "angles": [
    {
      "id": "angle-1",
      "title": "Angolo 1: Dolore Viscerale & Frustrazione",
      "hook": "Gancio magnetico primi 3 secondi o prima riga di testo",
      "creativeType": "UGC Video",
      "bodyCopy": "Copy ad alta risposta diretta completo di body e benefici",
      "callToAction": "Invito all'azione chiaro e orientato al valore",
      "framework": "PAS"
    },
    {
      "id": "angle-2",
      "title": "Angolo 2: Meccanismo Unico & Dimostrazione",
      "hook": "Gancio focalizzato sulla scoperta contro-intuitiva",
      "creativeType": "Carosello",
      "bodyCopy": "Copy focalizzato sul meccanismo e su come funziona",
      "callToAction": "Invito all'azione",
      "framework": "AIDA"
    },
    {
      "id": "angle-3",
      "title": "Angolo 3: Riprova Sociale & Trasformazione",
      "hook": "Gancio basato sul case study o risultato tangibile",
      "creativeType": "Immagine Statica",
      "bodyCopy": "Copy focalizzato sulla trasformazione Before-After",
      "callToAction": "Invito all'azione",
      "framework": "Hormozi Value"
    }
  ],
  "funnelSteps": [
    {
      "stepNumber": 1,
      "phase": "Top of Funnel (Attraction)",
      "assetName": "Landing Page / Opt-in Magnetico",
      "goal": "Catturare lead con zero frizione e qualificazione preliminare",
      "croChecklist": [
        "Headline sopra la piega con beneficio in <3s",
        "Form essenziale (solo Email/WhatsApp)",
        "Social Proof immediata"
      ]
    },
    {
      "stepNumber": 2,
      "phase": "Middle of Funnel (Indoctrination)",
      "assetName": "Video Sales Letter (VSL) / Demo Interattiva",
      "goal": "Educare sul meccanismo unico e smontare le 3 obiezioni primarie",
      "croChecklist": [
        "Hook video 0-60 secondi ad alto tasso di retention",
        "Comparsa del bottone d'acquisto sincronizzata con il pitch",
        "Sezione FAQ e Garanzia ben visibili"
      ]
    },
    {
      "stepNumber": 3,
      "phase": "Bottom of Funnel (Conversion)",
      "assetName": "Checkout Ottimizzato + 1-Click Upsell (OTO)",
      "goal": "Massimizzare il Customer Lifetime Value (AOV) e ridurre il tasso di abbandono",
      "croChecklist": [
        "Order bump pre-acquisto ad alta conversione",
        "Badge SSL e Stripe a vista",
        "Sequenza email recupero carrello entro 1 ora"
      ]
    }
  ],
  "editorialPosts": [
    {
      "day": "Giorno 1",
      "postType": "carosello",
      "title": "I 3 Errori che Bloccano i Tuoi Risultati",
      "summary": "Carosello educativo per spezzare falsi miti del settore",
      "fullCopy": "Testo persuasivo completo per il post con emoji e struttura a punti...",
      "tag": "Educazione & Mindset",
      "cta": "Salva il post e commenta 'GUIDA' per ricevere l'approfondimento",
      "platform": "Instagram"
    },
    {
      "day": "Giorno 2",
      "postType": "reel",
      "title": "Come Applicare il Meccanismo in 3 Minuti",
      "summary": "Micro-tutorial pratico passo passo con screen record",
      "fullCopy": "Script video/Reel completo con hook, body e call to action...",
      "tag": "Tutorial Pratico",
      "cta": "Condividi con un collega",
      "platform": "Instagram"
    },
    {
      "day": "Giorno 3",
      "postType": "lead-magnet",
      "title": "Checklist Esclusiva in PDF Gratuito",
      "summary": "Offerta di una risorsa magnetica per generare lead qualificati",
      "fullCopy": "Copy per cattura contatti e trigger DM...",
      "tag": "Lead Generation",
      "cta": "Scrivi 'START' nei commenti e te la invio in DM",
      "platform": "Instagram"
    },
    {
      "day": "Giorno 4",
      "postType": "statico",
      "title": "Case Study & Risultati Concreti",
      "summary": "Grafica ad alto contrasto con numeri reali e testimonianza",
      "fullCopy": "Copy focalizzato sui dati e sul ROI ottenuto...",
      "tag": "Riprova Sociale",
      "cta": "Link in bio per leggere il caso studio completo",
      "platform": "LinkedIn"
    },
    {
      "day": "Giorno 5",
      "postType": "mindset",
      "title": "Perché il Vecchio Metodo non Funziona Più",
      "summary": "Post polarizzante sul cambio di paradigma di mercato",
      "fullCopy": "Copy stimolante e di rottura...",
      "tag": "Visione & Trend",
      "cta": "Tu da che parte stai? Dimmelo nei commenti",
      "platform": "Instagram"
    },
    {
      "day": "Giorno 6",
      "postType": "reel",
      "title": "Dietro le Quinte: Ecco Come Lavoriamo",
      "summary": "Video autentico per instaurare fiducia e autorevolezza",
      "fullCopy": "Script backstage con spiegazione del workflow...",
      "tag": "Dietro le Quinte",
      "cta": "Segui la pagina per altri contenuti esclusivi",
      "platform": "Instagram"
    },
    {
      "day": "Giorno 7",
      "postType": "carosello",
      "title": "Offerta Speciale di Lancio: Tutto Ciò che Devi Sapere",
      "summary": "Riepilogo dell'offerta Grand Slam con scarsità e garanzia",
      "fullCopy": "Copy promozionale finale di conversione...",
      "tag": "Lancio & Offerta",
      "cta": "Clicca sul link in bio per accedere con i bonus inclusi",
      "platform": "Instagram"
    }
  ],
  "launchChecklist": [
    "Pixel & Conversion API configurati con Event Quality Match > 8/10",
    "Messaggio di Headline della Landing Page 100% allineato all'angolo dell'annuncio",
    "3 creatività con formati distinti caricate nel set di test",
    "Flusso di benvenuto email e notifica lead configurati su n8n",
    "Tracciamento parametri UTM per ogni canale impostato"
  ],
  "stopLossRules": [
    "Spegni automaticamente l'ad set se spende 1.5x il CPA target con 0 conversioni",
    "Hook Rate < 25% dopo 500 impressions: sostituisci i primi 3 secondi del video",
    "Se la Landing Page converte a meno del 2%, testa una nuova headline sopra la piega",
    "Scala il budget del 20% ogni 48 ore solo sugli annunci con ROAS vincente"
  ]
}`

    const userPrompt = `CREA LA STRATEGIA DI MARKETING COMPLETA PER QUESTO PRODOTTO:
- Nome Prodotto/Servizio: ${brief.productName}
- Prezzo Offerta: €${brief.price}
- Target / Buyer Persona: ${brief.targetAvatar}
- Livello Consapevolezza (Schwartz): ${brief.awarenessLevel}
- Desiderio Principale: ${brief.coreDesire}
- Dolore/Ostacolo Principale: ${brief.corePain}
- Budget Giornaliero: €${brief.budgetDaily}
- Canali Pubblicitari Selezionati: ${brief.platforms.join(', ')}
- CPA Target: €${brief.kpiCpaTarget || 20}
- ROAS Target: ${brief.kpiRoasTarget || 2.5}x`

    const rawAIResponse = await callGemini(systemPrompt, userPrompt)

    if (rawAIResponse) {
      try {
        const cleaned = rawAIResponse.replace(/```json/gi, '').replace(/```/g, '').trim()
        const parsed: MarketingGeneratedPlan = JSON.parse(cleaned)
        if (parsed.bigIdea && parsed.angles && parsed.editorialPosts) {
          return { success: true, plan: parsed }
        }
      } catch (err) {
        console.warn('Errore parsing JSON Marketing Plan da Gemini, fallback su generatore strutturato:', err)
      }
    }

    // Fallback di alto livello basato sui principi APEX
    const fallbackPlan: MarketingGeneratedPlan = {
      bigIdea: `Il Protocollo Accelerato per ${brief.productName}: Ottieni "${brief.coreDesire}" eliminando definitivamente "${brief.corePain}"`,
      uniqueMechanism: `Sistema Operativo Integrato & Automazione Ad Alto Rendimento per ${brief.productName}`,
      grandSlamOffer: {
        dreamOutcome: `Raggiungere ${brief.coreDesire} in tempi record con supporto operativo e strumenti pronti.`,
        perceivedLikelihood: `Metodologia testata sul campo con modelli pronti all'uso e garanzia di conformità.`,
        timeDelayReduction: `Accesso immediato agli asset operativi e onboarding in meno di 24 ore.`,
        effortSacrificeReduction: `Template pre-configurati e automazioni per azzerare il lavoro manuale ripetitivo.`,
        bonuses: [
          `Bonus #1: Toolkit Operativo & Swipe File Completo (Valore: €197)`,
          `Bonus #2: Sessione Strategica di Allineamento e Setup (Valore: €250)`,
          `Bonus #3: Canale Diretto di Assistenza Prioritaria via Chat (Valore: €97)`
        ],
        guarantee: `Garanzia Incondizionata 30 Giorni: se non ottieni il valore promesso, ricevi il 100% del rimborso senza domande.`
      },
      angles: [
        {
          id: 'angle-1',
          title: 'Angolo 1: Dolore Viscerale & Frustrazione Attuale',
          hook: `Stai ancora perdendo ore preziose a lottare con ${brief.corePain}?`,
          creativeType: 'UGC Video',
          bodyCopy: `La verità è che continuare con il vecchio metodo ti costa il triplo del tempo e del budget. Con ${brief.productName} abbiamo isolato esattamente la causa del blocco per farti ottenere ${brief.coreDesire} senza complicazioni.`,
          callToAction: `Scopri la soluzione definitiva a soli €${brief.price}`,
          framework: 'PAS'
        },
        {
          id: 'angle-2',
          title: 'Angolo 2: Il Meccanismo Contro-Intuitivo',
          hook: `Ecco perché il 90% di chi cerca di ottenere ${brief.coreDesire} sbaglia approccio...`,
          creativeType: 'Carosello',
          bodyCopy: `Non è colpa tua: i metodi tradizionali ignorano l'ingegneria del risultato. Scopri il nostro meccanismo proprietario implementato in ${brief.productName}.`,
          callToAction: `Accedi al sistema passo-passo`,
          framework: 'AIDA'
        },
        {
          id: 'angle-3',
          title: 'Angolo 3: Riprova Sociale & Trasformazione',
          hook: `Da zero a risultati tangibili in 14 giorni: ecco la roadmap esatta.`,
          creativeType: 'Immagine Statica',
          bodyCopy: `Guarda come la nostra community sta trasformando il proprio flusso di lavoro con ${brief.productName}. Prezzo di lancio speciale: €${brief.price}.`,
          callToAction: `Unisciti ora con tutti i bonus inclusi`,
          framework: 'Hormozi Value'
        }
      ],
      funnelSteps: [
        {
          stepNumber: 1,
          phase: 'Top of Funnel (Attraction)',
          assetName: 'Landing Page di Presentazione e Cattura',
          goal: `Catturare l'attenzione dell'avatar (${brief.targetAvatar}) ed evidenziare ${brief.coreDesire}`,
          croChecklist: [
            'Headline sopra la piega con beneficio immediato',
            'Call to Action chiara a forte contrasto visivo',
            'Badge di sicurezza e testimonianze ben visibili'
          ]
        },
        {
          stepNumber: 2,
          phase: 'Middle of Funnel (Indoctrination)',
          assetName: 'VSL & Demo Interattiva',
          goal: `Dimostrare il funzionamento di ${brief.productName} e abbattere l'obiezione sul prezzo (€${brief.price})`,
          croChecklist: [
            'Video esplicativo da 5-10 minuti focalizzato sulla trasformazione',
            'Pulsante di sblocco offerta sincronizzato con la call to action',
            'Dettaglio completo dei 3 bonus inclusi'
          ]
        },
        {
          stepNumber: 3,
          phase: 'Bottom of Funnel (Conversion)',
          assetName: 'Checkout a Bassa Frizione & Order Bump',
          goal: 'Finalizzare la transazione e incrementare il valore medio del carrello',
          croChecklist: [
            'Opzioni di pagamento flessibili (Stripe / Carta / Rate)',
            'Order bump complementare a €17-€37',
            'Garanzia 30 giorni evidenziata accanto al totale'
          ]
        }
      ],
      editorialPosts: [
        {
          day: 'Giorno 1',
          postType: 'carosello',
          title: `3 Errori che ti Impediscono di Ottenere ${brief.coreDesire}`,
          summary: 'Carosello didattico per educare il pubblico sul problema principale',
          fullCopy: `❌ Stai ancora facendo questi 3 errori?\n\n1. Ignorare il costo di ${brief.corePain}\n2. Usare strumenti non automatizzati\n3. Non avere un protocollo chiaro\n\n👉 Scopri come invertire la rotta nei commenti!`,
          tag: 'Educazione',
          cta: 'Salva il post per non perderlo',
          platform: 'Instagram'
        },
        {
          day: 'Giorno 2',
          postType: 'reel',
          title: `Ecco la Soluzione per ${brief.corePain}`,
          summary: 'Reel pratico di spiegazione rapida in 45 secondi',
          fullCopy: `🎥 Se anche tu vuoi raggiungere ${brief.coreDesire}, ecco il trucco che quasi nessuno condivide...\n\nCon ${brief.productName} abbiamo semplificato tutto in 3 step.`,
          tag: 'Tutorial',
          cta: 'Commenta "INFO" per il link di accesso',
          platform: 'Instagram'
        },
        {
          day: 'Giorno 3',
          postType: 'lead-magnet',
          title: 'Guida Gratuita + Template Operativo',
          summary: 'Post di acquisizione lead con trigger commenti',
          fullCopy: `🎁 Abbiamo preparato la risorsa definitiva per chi vuole accelerare con ${brief.productName}.\n\nScrivi "GUIDA" nei commenti e ricevi il PDF direttamente nei messaggi!`,
          tag: 'Lead Magnet',
          cta: 'Commenta "GUIDA" ora',
          platform: 'Instagram'
        },
        {
          day: 'Giorno 4',
          postType: 'statico',
          title: `Risultati Reali con ${brief.productName}`,
          summary: 'Post con screenshot e testimonianza verificata',
          fullCopy: `I numeri parlano chiaro: chi ha adottato il nuovo sistema ha ridotto drasticamente ${brief.corePain}.\n\nScopri tutti i dettagli al link in bio.`,
          tag: 'Riprova Sociale',
          cta: 'Visita il link in bio',
          platform: 'LinkedIn'
        },
        {
          day: 'Giorno 5',
          postType: 'mindset',
          title: 'Il Futuro del Settore è Qui',
          summary: 'Post di posizionamento e visione',
          fullCopy: `💡 Il mercato non aspetta. Chi si adatta per primo ottiene il massimo vantaggio competitivo.\n\nNon restare indietro: ${brief.productName} è pronto per te.`,
          tag: 'Visione',
          cta: 'Condividi la tua opinione nei commenti',
          platform: 'Instagram'
        },
        {
          day: 'Giorno 6',
          postType: 'reel',
          title: 'Cosa C\'è Dentro: Tour Esclusivo',
          summary: 'Video walkthrough dell\'esperienza d\'uso',
          fullCopy: `👀 Diamo uno sguardo all'interno di ${brief.productName}. Tutto è pensato per farti risparmiare tempo e massimizzare l'efficacia.`,
          tag: 'Demo',
          cta: 'Link in bio per provarlo subito',
          platform: 'Instagram'
        },
        {
          day: 'Giorno 7',
          postType: 'carosello',
          title: 'Ultima Chiamata: Offerta di Lancio Speciale',
          summary: 'Carosello conclusivo con offerta, garanzia e bonus',
          fullCopy: `⚡ L'offerta speciale a €${brief.price} scade a breve!\n\nIncluso nel pacchetto:\n✅ ${brief.productName} completo\n✅ 3 Bonus Esclusivi\n✅ Garanzia 100% Rischio Zero\n\n👉 Clicca nel link in bio prima della chiusura!`,
          tag: 'Offerta & Scarcity',
          cta: 'Accedi ora prima della scadenza',
          platform: 'Instagram'
        }
      ],
      launchChecklist: [
        'Pixel & Conversion API configurati con Event Quality Match > 8/10',
        'Headline della Landing Page 100% allineata con l\'angolo dell\'annuncio',
        '3 varianti di annuncio caricate nel gruppo di test Meta/Google',
        'Webhook n8n di pubblicazione social testato con successo',
        'Parametri UTM configurati per il tracciamento delle conversioni'
      ],
      stopLossRules: [
        `Spegni l'annuncio se spende oltre €${brief.kpiCpaTarget || 20} senza alcuna conversione registrata`,
        'Hook Rate < 25% sui video: sostituisci l\'aggancio visivo dei primi 3 secondi',
        'Se il CTR outbound è inferiore all\'1.2%, riscrivi la call to action e l\'headline primaria',
        `Aumenta il budget del 20% ogni 48 ore solo per gli ad set con ROAS > ${brief.kpiRoasTarget || 2.5}x`
      ]
    }

    return { success: true, plan: fallbackPlan }
  } catch (err: any) {
    return { success: false, error: err.message || 'Errore durante la generazione della campagna marketing' }
  }
}

// 2. Salvataggio Campagna e Post su Supabase
export async function saveMarketingCampaignAction(
  brief: MarketingBriefInput,
  plan: MarketingGeneratedPlan,
  campaignId?: string
) {
  try {
    const supabase = await createClient()

    let targetCampaignId = campaignId

    if (targetCampaignId) {
      // Aggiornamento campagna esistente
      const { error: updateError } = await (supabase as any)
        .from('marketing_campaigns')
        .update({
          title: brief.title || brief.productName,
          product_name: brief.productName,
          price: brief.price,
          target_avatar: brief.targetAvatar,
          awareness_level: brief.awarenessLevel,
          core_desire: brief.coreDesire,
          core_pain: brief.corePain,
          big_idea: plan.bigIdea,
          unique_mechanism: plan.uniqueMechanism,
          guarantee: plan.grandSlamOffer.guarantee,
          budget_daily: brief.budgetDaily,
          platforms: brief.platforms,
          kpi_cpa: brief.kpiCpaTarget,
          kpi_roas: brief.kpiRoasTarget,
          funnel_blueprint: {
            grandSlamOffer: plan.grandSlamOffer,
            angles: plan.angles,
            funnelSteps: plan.funnelSteps,
            launchChecklist: plan.launchChecklist,
            stopLossRules: plan.stopLossRules,
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', targetCampaignId)

      if (updateError) {
        console.warn('Errore aggiornamento campagna marketing:', updateError)
      }
    } else {
      // Creazione nuova campagna
      const { data: newCampaign, error: insertError } = await (supabase as any)
        .from('marketing_campaigns')
        .insert({
          title: brief.title || `Campagna: ${brief.productName}`,
          product_name: brief.productName,
          price: brief.price,
          target_avatar: brief.targetAvatar,
          awareness_level: brief.awarenessLevel,
          core_desire: brief.coreDesire,
          core_pain: brief.corePain,
          big_idea: plan.bigIdea,
          unique_mechanism: plan.uniqueMechanism,
          guarantee: plan.grandSlamOffer.guarantee,
          budget_daily: brief.budgetDaily,
          platforms: brief.platforms,
          kpi_cpa: brief.kpiCpaTarget,
          kpi_roas: brief.kpiRoasTarget,
          status: 'draft',
          funnel_blueprint: {
            grandSlamOffer: plan.grandSlamOffer,
            angles: plan.angles,
            funnelSteps: plan.funnelSteps,
            launchChecklist: plan.launchChecklist,
            stopLossRules: plan.stopLossRules,
          },
        })
        .select('id')
        .single()

      if (insertError) {
        console.warn('Errore inserimento nuova campagna marketing:', insertError)
      } else if (newCampaign) {
        targetCampaignId = (newCampaign as any).id
      }
    }

    // Inserimento o aggiornamento dei post del calendario editoriale
    if (targetCampaignId && plan.editorialPosts && plan.editorialPosts.length > 0) {
      await (supabase as any).from('marketing_posts').delete().eq('campaign_id', targetCampaignId)

      const postsToInsert = plan.editorialPosts.map((post) => ({
        campaign_id: targetCampaignId,
        day: post.day,
        post_type: post.postType,
        title: post.title,
        summary: post.summary,
        full_copy: post.fullCopy,
        tag: post.tag,
        cta: post.cta,
        platform: post.platform || 'Instagram',
        status: post.status || 'draft',
      }))

      const { error: postsError } = await (supabase as any).from('marketing_posts').insert(postsToInsert)
      if (postsError) {
        console.warn('Errore salvataggio post marketing:', postsError)
      }
    }

    return { success: true, campaignId: targetCampaignId }
  } catch (err: any) {
    return { success: false, error: err.message || 'Errore salvataggio campagna' }
  }
}

// 3. Recupera tutte le campagne marketing
export async function getMarketingCampaignsAction() {
  try {
    const supabase = await createClient()
    const { data, error } = await (supabase as any)
      .from('marketing_campaigns')
      .select('*, marketing_posts(count)')
      .order('created_at', { ascending: false })

    if (error) {
      return { success: false, error: error.message, campaigns: [] }
    }

    return { success: true, campaigns: data || [] }
  } catch (err: any) {
    return { success: false, error: err.message, campaigns: [] }
  }
}

// 4. Recupera una campagna specifica con i suoi post
export async function getMarketingCampaignByIdAction(campaignId: string): Promise<{
  success: boolean
  campaign?: any
  posts?: any[]
  error?: string
}> {
  try {
    const supabase = await createClient()
    const { data: campaign, error: cError } = await (supabase as any)
      .from('marketing_campaigns')
      .select('*')
      .eq('id', campaignId)
      .single()

    if (cError || !campaign) {
      return { success: false, error: cError?.message || 'Campagna non trovata' }
    }

    const { data: posts, error: pError } = await (supabase as any)
      .from('marketing_posts')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: true })

    return {
      success: true,
      campaign,
      posts: posts || [],
    }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

// 5. Pubblica Post via Webhook n8n (verso Buffer / Social)
export async function publishPostViaN8nAction(formData: {
  postId?: string
  title: string
  copy: string
  platform: string
  scheduledAt?: string
  mediaUrl?: string
  customWebhookUrl?: string
}) {
  try {
    const n8nWebhookUrl =
      formData.customWebhookUrl ||
      process.env.N8N_MARKETING_WEBHOOK_URL ||
      process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL ||
      ''

    const payload = {
      event: 'publish_marketing_post',
      postId: formData.postId,
      title: formData.title,
      text: formData.copy,
      platform: formData.platform,
      scheduledAt: formData.scheduledAt || new Date().toISOString(),
      mediaUrl: formData.mediaUrl || null,
      timestamp: new Date().toISOString(),
    }

    if (!n8nWebhookUrl) {
      return {
        success: true,
        simulated: true,
        message: 'Payload formattato pronto per n8n. Configura N8N_MARKETING_WEBHOOK_URL per inviare in tempo reale.',
        payload,
      }
    }

    const res = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      return {
        success: false,
        error: `Webhook n8n ha risposto con codice di errore ${res.status}: ${res.statusText}`,
      }
    }

    let responseData = null
    try {
      responseData = await res.json()
    } catch {
      responseData = { status: 'sent' }
    }

    if (formData.postId) {
      const supabase = await createClient()
      await (supabase as any)
        .from('marketing_posts')
        .update({
          status: formData.scheduledAt ? 'queued' : 'published',
          n8n_response: responseData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', formData.postId)
    }

    return {
      success: true,
      simulated: false,
      message: 'Post inviato con successo al webhook di n8n per la pubblicazione su Buffer!',
      data: responseData,
    }
  } catch (err: any) {
    return { success: false, error: err.message || 'Errore durante la chiamata al webhook n8n' }
  }
}

// 6. Elimina campagna marketing
export async function deleteMarketingCampaignAction(campaignId: string) {
  try {
    const supabase = await createClient()
    const { error } = await (supabase as any).from('marketing_campaigns').delete().eq('id', campaignId)
    if (error) {
      return { success: false, error: error.message }
    }
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

// =========================================================================
// FUNZIONI DI RETROCOMPATIBILITÀ SOCIAL CREATOR & BUFFER
// =========================================================================

export async function generateSocialContentAction(formData: {
  topic?: string
  platform: string
  postType?: 'story' | 'feed' | 'carousel' | 'reel_script' | string
  tone?: string
  lessonId?: number
}) {
  try {
    const lessonTitle = formData.lessonId ? `Lezione ${formData.lessonId}` : 'Percorso Formativo AI'
    const targetTopic = formData.topic || lessonTitle
    const targetPostType = formData.postType || 'feed'
    const prompt = `Genera un post persuasivo ad alta conversione per ${formData.platform} sul tema "${targetTopic}". Formato: ${targetPostType}. Tono: ${formData.tone || 'professionale e coinvolgente'}.`
    const system = 'Sei un copywriter e social media strategist esperto. Scrivi il testo completo con emoji, hook iniziale e call to action.'
    
    const text = await callGemini(system, prompt)
    if (text) {
      return { success: true, text }
    }
    return {
      success: true,
      text: `🚀 ${targetTopic}\n\nScopri come padroneggiare l'Intelligenza Artificiale nel nostro corso pratico.\n\n👉 Clicca sul link in bio per accedere ai 20 moduli!`,
    }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function getBufferProfilesAction(): Promise<{
  success: boolean
  profiles?: Array<{ id: string; service: string; formatted_username: string }>
  error?: string
}> {
  try {
    const rawToken = process.env.BUFFER_ACCESS_TOKEN
    const accessToken = rawToken ? rawToken.trim() : ''

    // Se il token è configurato, recupera i profili reali da Buffer API
    if (accessToken) {
      const res = await fetch(`https://api.bufferapp.com/1/profiles.json?access_token=${encodeURIComponent(accessToken)}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      })
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) {
          const formattedProfiles = data.map((p: any) => ({
            id: p.id || p._id,
            service: p.service,
            formatted_username: p.formatted_username || `@${p.service_username || p.service}`,
          }))
          return { success: true, profiles: formattedProfiles }
        }
      }
    }

    // Fallback con profili di configurazione di default
    return {
      success: true,
      profiles: [
        { id: 'ig-1', service: 'instagram', formatted_username: '@ti.aiuto_official' },
        { id: 'li-1', service: 'linkedin', formatted_username: 'Ti AIuto Community' },
        { id: 'fb-1', service: 'facebook', formatted_username: 'Ti AIuto Platform' },
      ],
    }
  } catch (err: any) {
    return {
      success: true,
      profiles: [
        { id: 'ig-1', service: 'instagram', formatted_username: '@ti.aiuto_official' },
        { id: 'li-1', service: 'linkedin', formatted_username: 'Ti AIuto Community' },
        { id: 'fb-1', service: 'facebook', formatted_username: 'Ti AIuto Platform' },
      ],
    }
  }
}

export async function publishToBufferAction(formData: {
  postId?: string
  text: string
  profileIds?: string[]
  platform?: string
  now?: boolean
  scheduledAt?: string
  mediaUrl?: string
}) {
  try {
    const rawToken = process.env.BUFFER_ACCESS_TOKEN
    const accessToken = rawToken ? rawToken.trim() : ''

    // Se non è configurato il token di Buffer, forniamo risposta controllata con istruzioni
    if (!accessToken) {
      return {
        success: true,
        simulated: true,
        message: 'Post pronto per Buffer! Configura BUFFER_ACCESS_TOKEN nelle variabili d’ambiente per inviare direttamente al tuo account Buffer.',
      }
    }

    // Recupera profili se non specificati
    let targetProfileIds = formData.profileIds || []
    if (targetProfileIds.length === 0) {
      const profilesRes = await getBufferProfilesAction()
      if (profilesRes.success && profilesRes.profiles && profilesRes.profiles.length > 0) {
        // Se c'è una piattaforma preferita (es. Instagram o LinkedIn), filtra
        if (formData.platform) {
          const plat = formData.platform.toLowerCase()
          const matched = profilesRes.profiles.filter(p => plat.includes(p.service.toLowerCase()))
          targetProfileIds = matched.length > 0 ? matched.map(m => m.id) : [profilesRes.profiles[0].id]
        } else {
          targetProfileIds = [profilesRes.profiles[0].id]
        }
      }
    }

    // Costruzione payload x-www-form-urlencoded per l'API ufficiale di Buffer
    const bodyParams = new URLSearchParams()
    bodyParams.append('text', formData.text)
    bodyParams.append('now', formData.now ? 'true' : 'false')
    bodyParams.append('access_token', accessToken)

    if (formData.scheduledAt) {
      bodyParams.append('scheduled_at', formData.scheduledAt)
    }

    targetProfileIds.forEach((pid) => {
      bodyParams.append('profile_ids[]', pid)
    })

    if (formData.mediaUrl) {
      bodyParams.append('media[photo]', formData.mediaUrl)
    }

    const response = await fetch(`https://api.bufferapp.com/1/updates/create.json?access_token=${encodeURIComponent(accessToken)}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: bodyParams.toString(),
    })

    let responseData: any = null
    try {
      responseData = await response.json()
    } catch {
      responseData = { message: `Risposta non-JSON da Buffer (HTTP ${response.status})` }
    }

    if (!response.ok) {
      const errorMsg = responseData?.message || `Errore Buffer API (${response.status}): ${response.statusText}. Verifica la validità del token BUFFER_ACCESS_TOKEN su https://buffer.com/developers/apps.`
      return {
        success: false,
        error: errorMsg,
      }
    }

    // Se associato a un post del database, aggiorna lo stato su marketing_posts
    if (formData.postId) {
      const supabase = await createClient()
      await (supabase as any)
        .from('marketing_posts')
        .update({
          status: formData.scheduledAt ? 'queued' : 'published',
          n8n_response: { buffer: responseData },
          updated_at: new Date().toISOString(),
        })
        .eq('id', formData.postId)
    }

    return {
      success: true,
      simulated: false,
      message: 'Post inviato e pianificato con successo su Buffer!',
      data: responseData,
    }
  } catch (err: any) {
    return { success: false, error: err.message || 'Errore durante la pubblicazione su Buffer' }
  }
}
