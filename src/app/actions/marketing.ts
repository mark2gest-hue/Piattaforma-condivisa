'use server'

interface SocialContent {
  linkedin: string
  instagram: string
  tiktok: string
}

// 20 Moduli Video del Corso AI Start reali
const LESSON_DETAILS: Record<number, { title: string; desc: string }> = {
  1: { title: '1. Benvenuti nel Futuro', desc: 'Introduzione ai concetti chiave ed alla rivoluzione dell’Intelligenza Artificiale.' },
  2: { title: '2. Breve Storia dell\'Evoluzione', desc: 'Come l\'IA è evoluta e quali opportunità concrete offre oggi nel lavoro.' },
  3: { title: '3. Sconfiggere il Foglio Bianco', desc: 'Superare il blocco iniziale ed iniziare ad interagire subito con gli strumenti IA.' },
  4: { title: '4. Il Linguaggio della Chiarezza', desc: 'La struttura per comunicare in modo chiaro e preciso con i modelli IA.' },
  5: { title: '5. La Formula Segreta RCCF', desc: 'Ruolo, Contesto, Contenuto e Formato: la formula per prompt perfetti.' },
  6: { title: '6. Iterazione', desc: 'Affinare le risposte ed istruire l’IA attraverso dialoghi ed iterazioni successive.' },
  7: { title: '7. ChatGPT, Claude, Gemini, Perplexity', desc: 'Panoramica comparativa dei migliori modelli di IA generativa e quando usarli.' },
  8: { title: '8. Scrivere senza Sforzo', desc: 'Redazione rapida di email, post, testi formali e comunicazioni commerciali.' },
  9: { title: '9. Dipingere con le Parole', desc: 'Tecniche di prompting per la generazione di immagini e contenuti visivi.' },
  10: { title: '10. Anatomia di un Prompt Visivo', desc: 'Strutturare prompt grafici d\'impatto per slide, presentazioni e marketing.' },
  11: { title: '11. Presentazioni in 5 Minuti', desc: 'Creare slide e materiale per riunioni e clienti in tempo record con l\'IA.' },
  12: { title: '12. Analisi Dati per Excel', desc: 'Elaborazione dati, tabelle e grafici senza dover conoscere formule complesse.' },
  13: { title: '13. L\'Agenda Intelligente', desc: 'Pianificazione automatica delle priorità, del calendario e delle scadenze.' },
  14: { title: '14. Studiare e Imparare ELI5', desc: 'Apprendimento rapido e semplificazione di argomenti complessi con l\'IA.' },
  15: { title: '15. Allucinazioni: Quando l\'IA mente', desc: 'Come riconoscere gli errori dell\'IA e verificare le fonti in totale sicurezza.' },
  16: { title: '16. Privacy e Sicurezza', desc: 'Protezione dei dati aziendali e personali secondo le norme di sicurezza.' },
  17: { title: '17. Il Lavoro che Cambia', desc: 'L\'impatto dell\'IA sulle professioni e come posizionarsi per il futuro.' },
  18: { title: '18. Creare il proprio Workflow', desc: 'Strutturare un flusso di lavoro personalizzato ed automatizzato al 100%.' },
  19: { title: '19. La Tua Nuova Superpotenza', desc: 'Integrare l\'IA come alleato quotidiano per moltiplicare la produttività.' },
  20: { title: '20. Riepilogo Corso AI', desc: 'Sintesi del percorso formativo, attestato finale e prossimi passi.' },
}

// Database di fallback di copy di alta qualità precompilati per le 20 lezioni
const FALLBACK_POSTS: Record<number, SocialContent> = {
  1: {
    linkedin: `🚀 L'Intelligenza Artificiale non è più fantascienza, è il motore del lavoro moderno.\n\nNel Modulo 1 di AI Start analizziamo la rivoluzione in atto e le fondamenta teoriche necessarie per non restare indietro.\n\nScopri di più su aiutiamoci.cloud!\n\n#AIStart #IntelligenzaArtificiale #FuturoDelLavoro`,
    instagram: `💡 Modulo 1: Benvenuti nel Futuro!\n\nL'IA sta ridefinendo ogni professione. Nel primo modulo di AI Start gettiamo le basi di questa incredibile rivoluzione.\n\nScorri per scoprire di più ➡️\n\n#aistart #digitalmarketing #innovazione`,
    tiktok: `🎬 [VIDEO SCRIPT - REEL/TIKTOK]\n\n[Scena 1 - Inquadratura ravvicinata del volto, espressione sorpresa]\nAudio: "Pensi che l'Intelligenza Artificiale ti ruberà il lavoro? Ti sbagli. Chi imparerà ad usarla prenderà il sopravvento!"\n\n[Scena 2 - Mostra lo schermo del PC con il portale corsi]\nAudio: "Nel primo modulo del nostro corso partiamo dalle basi per darti le chiavi di questa svolta."\n\n#aistart #tecnologia #lavoro`
  },
  5: {
    linkedin: `🔥 Ti sei mai chiesto perché le risposte dell'IA a volte sembrano banali o generiche?\n\nLa risposta sta nel prompt. Nel modulo 5 analizziamo la formula segreta RCCF:\n📌 Ruolo\n📌 Contesto\n📌 Contenuto\n📌 Formato\n\nApplica questa struttura e trasforma i tuoi risultati da standard a eccezionali.\n\n#PromptEngineering #RCCF #ChatGPT`,
    instagram: `🧪 La Formula Segreta RCCF!\n\nVuoi risposte perfette da ChatGPT? Usa questo schema:\n\n1️⃣ Ruolo\n2️⃣ Contesto\n3️⃣ Contenuto\n4️⃣ Formato\n\nTrovi la guida pratica nel modulo 5 di AI Start su aiutiamoci.cloud! 💻\n\n#prompting #chatgpt #lavorointelligente`,
    tiktok: `🎬 [VIDEO SCRIPT - REEL/TIKTOK]\n\n[Scena 1 - Tu che digiti velocemente sulla tastiera]\nAudio: "Smetti di scrivere prompt a caso! Usa la formula RCCF!"\n\n[Scena 2 - Indica la lavagna o testo in sovrimpressione: Ruolo, Contesto, Contenuto, Formato]\nAudio: "Ruolo, contesto, contenuto e formato. Questa è l'unica guida che ti serve per domare l'IA."\n\n#rccf #prompting #tips`
  }
}

// Generatore generico per lezioni senza un copy manuale specifico nel fallback
function generateDynamicFallback(lessonId: number, platform: string, tone: string): string {
  const details = LESSON_DETAILS[lessonId] || { title: `Lezione ${lessonId}`, desc: 'Approfondimento del percorso formativo.' }
  
  if (platform === 'linkedin') {
    return `📈 **Formazione AI Start — Lezione ${lessonId}**\n\nOggi parliamo di: *${details.title}*\n👉 ${details.desc}\n\nUn tema fondamentale per chi vuole integrare l'Intelligenza Artificiale nel proprio flusso di lavoro quotidiano per aumentare l'efficienza e abbattere i tempi morti.\n\nTu a che punto sei del percorso? Faccelo sapere nei commenti!\n\n🚀 Scopri il programma completo su aiutiamoci.cloud\n\n#AIStart #FormazioneDigitale #Produttivita`
  } else if (platform === 'instagram') {
    return `⚡ Lezione ${lessonId}: ${details.title}\n\nNel percorso AI Start andiamo dritti al punto:\n📌 ${details.desc}\n\nNessuna teoria inutile, solo esempi pratici da applicare subito nel tuo lavoro per risparmiare ore ogni settimana. 🔥\n\n💡 Link in bio per accedere alla piattaforma!\n\n#aistart #digitalinnovation #corsi`
  } else {
    return `🎬 [VIDEO SCRIPT - REEL/TIKTOK]\n\n[Scena 1 - Inquadratura frontale, indichi lo schermo]\nAudio: "Oggi ti parlo di una risorsa pazzesca per il tuo lavoro: ${details.title}!"\n\n[Scena 2 - Zoom sullo schermo che mostra la lezione video]\nAudio: "Si tratta di: ${details.desc}. La trovi nel portale di aiutiamoci.cloud!"\n\n#aistart #formazione #workhack`
  }
}

export async function generateSocialContentAction(formData: {
  lessonId: number
  platform: 'linkedin' | 'instagram' | 'tiktok'
  tone: 'educational' | 'marketing' | 'engaging'
}) {
  try {
    const lesson = LESSON_DETAILS[formData.lessonId]
    if (!lesson) {
      return { success: false, error: 'Lezione non trovata.' }
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || ''

    if (apiKey) {
      const prompt = `Sei un esperto copywriter di marketing digitale e social media manager per la piattaforma "Ti AIuto" (aiutiamoci.cloud).
Genera un post promozionale accattivante per promuovere la lezione "${lesson.title}" (Lezione ${formData.lessonId} del corso "AI Start").
Dettagli lezione: ${lesson.desc}

Piattaforma social richiesta: ${formData.platform === 'linkedin' ? 'LinkedIn' : formData.platform === 'instagram' ? 'Carosello Instagram' : 'Script Video Breve (Reel/TikTok)'}
Tono richiesto: ${formData.tone === 'educational' ? 'Educativo e formativo' : formData.tone === 'marketing' ? 'Persuasivo e orientato alle vendite' : 'Coinvolgente ed entusiasta'}

Requisiti:
- Scrivi in italiano.
- Usa emoji appropriate e spaziature pulite per facilitare la lettura.
- Includi 3 hashtag rilevanti alla fine.
- Se la piattaforma è TikTok/Reel, fornisci uno script diviso in scene (es. [Scena 1], [Audio]) con indicazioni visive e di recitazione.
- Non aggiungere introduzioni meta-testuali come "Ecco il post richiesto:". Restituisci direttamente il testo del post pronto da pubblicare.`

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      })

      if (response.ok) {
        const data = await response.json()
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text
        if (text) {
          return { success: true, text: text.trim() }
        }
      }
      console.warn('Errore o risposta non valida da Gemini API, uso fallback.')
    }

    // Fallback locale in assenza di API key o errore API
    const fallbackSource = FALLBACK_POSTS[formData.lessonId]
    let generatedText = ''
    if (fallbackSource) {
      generatedText = fallbackSource[formData.platform]
    } else {
      generatedText = generateDynamicFallback(formData.lessonId, formData.platform, formData.tone)
    }

    return { success: true, text: generatedText }
  } catch (error: any) {
    console.error('Errore generico in generateSocialContentAction:', error)
    return { success: false, error: error.message || 'Errore interno' }
  }
}

export async function getBufferProfilesAction() {
  try {
    const token = process.env.BUFFER_ACCESS_TOKEN || ''
    if (!token) {
      return { success: false, error: 'Token non configurato in .env.local.' }
    }

    const res = await fetch(`https://api.bufferapp.com/1/profiles.json?access_token=${token}`)
    if (!res.ok) {
      const errText = await res.text()
      return { success: false, error: `Buffer API Error: ${errText}` }
    }

    const data = await res.json()
    return { success: true, profiles: data }
  } catch (err: any) {
    return { success: false, error: err.message || 'Errore di connessione a Buffer' }
  }
}

export async function publishToBufferAction(formData: {
  text: string
  profileIds: string[]
  now: boolean
}) {
  try {
    const token = process.env.BUFFER_ACCESS_TOKEN || ''
    if (!token) {
      return { success: false, error: 'Token Buffer non configurato.' }
    }

    if (!formData.profileIds || formData.profileIds.length === 0) {
      return { success: false, error: 'Seleziona almeno un canale social.' }
    }

    const bodyParams = new URLSearchParams()
    bodyParams.append('text', formData.text)
    bodyParams.append('shorten', 'false')
    if (formData.now) {
      bodyParams.append('now', 'true')
    }
    formData.profileIds.forEach((id) => {
      bodyParams.append('profile_ids[]', id)
    })

    const res = await fetch(`https://api.bufferapp.com/1/updates/create.json?access_token=${token}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: bodyParams.toString(),
    })

    if (!res.ok) {
      const errText = await res.text()
      return { success: false, error: `Buffer Publish Error: ${errText}` }
    }

    const result = await res.json()
    return { success: true, result }
  } catch (err: any) {
    return { success: false, error: err.message || 'Errore durante la pubblicazione.' }
  }
}

