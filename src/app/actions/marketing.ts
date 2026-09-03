'use server'

import { createClient } from '@/lib/supabase/server'
import { callGemini } from './ai'
import { autoIndexToSecondBrain } from './knowledge'

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
    const systemPrompt = `Sei l'architetto strategico di marketing di AIutiamoci ("Umani nel pensiero. Smart nell'azione.").
Il tuo compito è elaborare una strategia di comunicazione profondamente UMANA, empatica, rassicurante e ad altissima fiducia.

REGOLE FONDAMENTALI DI TONO E COPYWRITING PER AIUTIAMOCI:
1. NO AL LINGUAGGIO DA "MARKETER": bandite formule fredde o aggressive ("perdere ore preziose", "task quotidiane", "produttività aziendale", "ti costa il triplo", "raddoppiare il fatturato").
2. COMPRENDI LA VERA PAURA DEL TARGET (non-nativi digitali, professionisti, over 40-50): non hanno paura della "produttività", hanno paura di rimanere indietro, sentirsi esclusi, fare figure di non capire o buttare soldi in strumenti inutili.
3. POSIZIONAMENTO DI AIUTIAMOCI: semplicità, accompagnamento passo-passo, calma, rispetto, zero gergo tecnico, "finalmente qualcuno che non mi tratta da incapace".
4. LA PRIMA CONVERSIONE È LA FIDUCIA: la prima cosa da trasmettere NON è la vendita di un corso, ma la convinzione: "Non sei in ritardo. Ti hanno solo spiegato l'AI nel modo sbagliato. Posso farcela anch'io."
5. GANCIO FORTE E DIRETTO: usa hook come "NON SEI IN RITARDO. TI HANNO SOLO SPIEGATO L'AI NEL MODO SBAGLIATO." oppure "L'AI ti incuriosisce, ma ogni volta che provi a capirci qualcosa ti senti già in ritardo?".

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
          title: 'Angolo 1: Rassicurazione & Rottura Falso Mito ("Non sei in ritardo")',
          hook: 'NON SEI IN RITARDO. TI HANNO SOLO SPIEGATO L’AI NEL MODO SBAGLIATO.',
          creativeType: 'UGC Video',
          bodyCopy: `Ogni giorno esce un nuovo strumento, un nuovo video, qualcuno che promette di rivoluzionarti il lavoro in cinque minuti.\n\nRisultato? Più cerchi di capire, più rischi di sentirti confuso ed escluso.\n\nE magari pensi:\n“Non fa per me.”\n“Ormai sono troppo indietro.”\n“Devo essere un programmatore.”\n\nNo. Per iniziare non devi diventare un tecnico e non devi imparare cento strumenti. Devi solo capire quali poche cose ti servono davvero e imparare a usarle con calma e con una guida umana al tuo fianco.\n\nUmani nel pensiero. Smart nell'azione.`,
          callToAction: 'Se vuoi capire da dove iniziare con calma, scrivici in privato o commenta "GUIDA".',
          framework: 'PAS'
        },
        {
          id: 'angle-2',
          title: 'Angolo 2: Accompagnamento & Pratica Guidata',
          hook: 'L’AI ti incuriosisce, ma ogni volta che provi a capirci qualcosa ti sembra tutto troppo complicato?',
          creativeType: 'Carosello',
          bodyCopy: `Non è colpa tua: la maggior parte dei corsi parla una lingua per soli tecnici. In AIutiamoci abbiamo creato un metodo passo-passo pensato per professionisti che vogliono risultati concreti senza stress.`,
          callToAction: 'Scopri il metodo semplice e umano di AIutiamoci',
          framework: 'AIDA'
        },
        {
          id: 'angle-3',
          title: 'Angolo 3: Trasformazione Concreta ("Posso farcela anch\'io")',
          hook: '“Pensavo fosse troppo tardi per imparare: mi sbagliavo.”',
          creativeType: 'Immagine Statica',
          bodyCopy: `La storia di chi è partito da zero senza alcuna base tecnica e oggi usa l'Intelligenza Artificiale ogni giorno per risparmiare tempo e lavorare meglio.`,
          callToAction: 'Unisciti alla nostra community',
          framework: 'Hormozi Value'
        }
      ],
      funnelSteps: [
        {
          stepNumber: 1,
          phase: 'Top of Funnel (Attraction)',
          assetName: 'Landing Page Empatica & Questionario',
          goal: `Rassicurare l'utente (${brief.targetAvatar}) ed eliminare la paura di non farcela`,
          croChecklist: [
            'Headline focalizzata su chiarezza, calma e zero gergo tecnico',
            'Questionario guidato per capire il livello di partenza',
            'Testimonianze reali di colleghi partiti da zero'
          ]
        },
        {
          stepNumber: 2,
          phase: 'Middle of Funnel (Indoctrination)',
          assetName: 'Video Accoglienza & Dimostrazione Pratica',
          goal: `Dimostrare con esempi quotidiani che chiunque può usare l'AI`,
          croChecklist: [
            'Video caloroso da 5 minuti con linguaggio semplice e chiaro',
            'Esempi pratici immediati su email, documenti ed Excel',
            'Supporto umano del team ben evidenziato'
          ]
        },
        {
          stepNumber: 3,
          phase: 'Bottom of Funnel (Conversion)',
          assetName: 'Iscrizione Protetta con Garanzia Rassicurante',
          goal: 'Offrire un percorso sereno con garanzia totale e supporto',
          croChecklist: [
            'Processo di iscrizione in 1 minuto',
            'Assistenza diretta via chat con persone reali',
            'Garanzia soddisfatti o rimborsati senza condizioni'
          ]
        }
      ],
      editorialPosts: [
        {
          day: 'Giorno 1',
          postType: 'mindset',
          title: 'Non sei in ritardo. Ti hanno solo spiegato l’AI nel modo sbagliato.',
          summary: 'Post manifesto per abbattere l’ansia e posizionare AIutiamoci come guida umana',
          fullCopy: `NON SEI IN RITARDO.\nTI HANNO SOLO SPIEGATO L’AI NEL MODO SBAGLIATO.\n\nOgni giorno esce un nuovo strumento, un nuovo video, qualcuno che promette di rivoluzionarti il lavoro in cinque minuti.\n\nRisultato?\nPiù cerchi di capire, più rischi di sentirti confuso.\n\nE magari pensi:\n“Non fa per me.”\n“Ormai sono troppo indietro.”\n“Devo essere bravo con la tecnologia.”\n\nNo.\n\nPer iniziare non devi diventare un tecnico e non devi imparare cento strumenti.\n\nDevi capire quali poche cose possono esserti davvero utili nella vita e nel lavoro e imparare a usarle con calma, facendo pratica.\n\nÈ esattamente da qui che nasce AIutiamoci.\nUn percorso pensato soprattutto per chi non è nato digitale, ma non ha nessuna intenzione di restare a guardare.\n\nUmani nel pensiero. Smart nell’azione.\n\nSe vuoi capire da dove iniziare, scrivimi nei messaggi o lascia un commento.`,
          tag: 'Manifesto & Fiducia',
          cta: 'Scrivici in privato per iniziare con calma',
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

    // Inserimento automatico nel Secondo Cervello (knowledge_items)
    const strategyContent = `### 🚀 Campagna: ${brief.title || brief.productName}
**Prodotto/Offerta:** ${brief.productName} (€${brief.price})
**Target:** ${brief.targetAvatar}
**Livello Consapevolezza:** ${brief.awarenessLevel}

---
### 💡 Big Idea & Posizionamento
${plan.bigIdea}

### ⚙️ Meccanismo Unico
${plan.uniqueMechanism}

---
### 🎁 Offerta Irresistibile (Grand Slam Offer)
- **Risultato Desiderato:** ${plan.grandSlamOffer.dreamOutcome}
- **Riprova e Certezza:** ${plan.grandSlamOffer.perceivedLikelihood}
- **Riduzione Fatiche:** ${plan.grandSlamOffer.effortSacrificeReduction}
- **Garanzia:** ${plan.grandSlamOffer.guarantee}
- **Bonus Inclusi:**
${plan.grandSlamOffer.bonuses.map((b) => `  - ${b}`).join('\n')}

---
### 📢 Angoli Pubblicitari & Copy
${plan.angles.map((a) => `#### ${a.title} (${a.creativeType})\n**Hook:** ${a.hook}\n**Body:**\n${a.bodyCopy}\n**CTA:** ${a.callToAction}\n`).join('\n---\n')}

---
### 📅 Post Editoriali Generati (${plan.editorialPosts.length})
${plan.editorialPosts.map((p) => `- **${p.day} (${p.platform} - ${p.postType})**: ${p.title}\n  *CTA:* ${p.cta}`).join('\n')}`

    autoIndexToSecondBrain({
      title: `[Marketing] ${brief.title || brief.productName}`,
      category: 'copywriting',
      description: `Strategia Marketing & Funnel: ${brief.targetAvatar} • Prezzo €${brief.price}`,
      content: strategyContent,
      tags: ['marketing', 'campagna', 'copywriting', 'funnel', 'apex'],
    }).catch((e) => console.warn('Errore auto-index marketing:', e))

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

    if (accessToken) {
      // 1. Prova con la Nuova Buffer API (GraphQL: root channels query)
      try {
        const graphqlQuery = {
          query: `
            query {
              channels(input: {}) {
                id
                name
                service
                organizationId
              }
            }
          `,
        }

        const gqlRes = await fetch('https://api.buffer.com', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(graphqlQuery),
        })

        if (gqlRes.ok) {
          const gqlData = await gqlRes.json()
          const channels = gqlData?.data?.channels
          if (Array.isArray(channels) && channels.length > 0) {
            const formatted = channels.map((c: any) => ({
              id: c.id,
              service: c.service || 'social',
              formatted_username: c.name || `@${c.service}`,
            }))
            return { success: true, profiles: formatted }
          }
        }
      } catch (gqlErr) {
        console.warn('[Buffer GraphQL channels query]:', gqlErr)
      }

      // 2. Fallback con endpoint Channels REST o Legacy
      try {
        const res = await fetch('https://api.bufferapp.com/1/profiles.json', {
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
      } catch (legacyErr) {
        console.warn('[Buffer Legacy Profiles]:', legacyErr)
      }
    }

    // Default configuration profiles fallback
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

    if (!accessToken) {
      return {
        success: true,
        simulated: true,
        message: 'Post pronto per Buffer! Configura BUFFER_ACCESS_TOKEN nelle variabili d’ambiente per inviare direttamente al tuo account Buffer.',
      }
    }

    // 1. Canale target configurato tramite BUFFER_CHANNEL_ID (env var)
    const targetChannelId = process.env.BUFFER_CHANNEL_ID?.trim()
    const channelName = 'Facebook (AI utiamoci)'

    if (!targetChannelId) {
      return {
        success: false,
        error: 'BUFFER_CHANNEL_ID non configurato nelle variabili d\'ambiente di Vercel.',
      }
    }

    let successResponse: any = null
    let lastErrorMessage = ''

    // Helper per estrarre in sicurezza il JSON o il testo della risposta
    const safeParseResponse = async (res: Response) => {
      const rawText = await res.text()
      if (!rawText || !rawText.trim()) return { ok: res.ok, data: null, rawText: '' }
      try {
        const json = JSON.parse(rawText)
        return { ok: res.ok, data: json, rawText }
      } catch {
        return { ok: res.ok, data: null, rawText }
      }
    }

    // Creazione Post nel Canale Facebook (createPost) — schema verificato via introspection
    // createDraft NON ESISTE nello schema Buffer. Si usa createPost con saveToDraft: true
    // Campi obbligatori: channelId!, assets!, mode!, needsApproval!, schedulingType!
    // text è opzionale e va direttamente nell'input (NON dentro content)
    try {
      const postMutation = {
        query: `
          mutation CreatePost($input: CreatePostInput!) {
            createPost(input: $input) {
              ... on PostActionSuccess {
                post {
                  id
                }
              }
              ... on InvalidInputError {
                message
              }
              ... on UnauthorizedError {
                message
              }
              ... on UnexpectedError {
                message
              }
            }
          }
        `,
        variables: {
          input: {
            channelId: targetChannelId,
            text: formData.text,
            assets: [],
            mode: 'addToQueue',
            needsApproval: false,
            schedulingType: 'automatic',
            saveToDraft: false,
            metadata: {
              facebook: {
                type: 'post',
              },
            },
          },
        },
      }

      const postRes = await fetch('https://api.buffer.com', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(postMutation),
      })

      const parsedPost = await safeParseResponse(postRes)
      const postData = parsedPost.data?.data?.createPost
      if (parsedPost.ok && !parsedPost.data?.errors && postData?.post) {
        successResponse = { id: postData.post.id, type: 'post', target: channelName }
      } else if (postData?.message) {
        lastErrorMessage = postData.message
      } else if (parsedPost.data?.errors && parsedPost.data.errors.length > 0) {
        lastErrorMessage = parsedPost.data.errors[0].message
      }
    } catch (postErr: any) {
      lastErrorMessage = postErr.message
    }

    if (!successResponse) {
      return {
        success: false,
        error: `Buffer GraphQL API: ${lastErrorMessage || 'Errore durante la creazione del post'}.`,
      }
    }

    // Se associato a un post del database, aggiorna lo stato su marketing_posts
    if (formData.postId) {
      const supabase = await createClient()
      await (supabase as any)
        .from('marketing_posts')
        .update({
          status: formData.scheduledAt ? 'queued' : 'published',
          n8n_response: { buffer: successResponse },
          updated_at: new Date().toISOString(),
        })
        .eq('id', formData.postId)
    }

    const destName = successResponse?.target || channelName || 'Buffer'
    return {
      success: true,
      simulated: false,
      message: `Post inviato con successo a Buffer su "${destName}"!`,
      data: successResponse,
    }
  } catch (err: any) {
    return { success: false, error: err.message || 'Errore durante la pubblicazione su Buffer' }
  }
}


