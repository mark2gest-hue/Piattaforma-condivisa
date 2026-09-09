/**
 * Helper e widget interattivo per la gestione di Google Meet Pro & Schedulazione Calendario.
 */

export interface GoogleMeetEventParams {
  title: string
  description?: string
  date: string // YYYY-MM-DD
  time: string // HH:mm
  durationMinutes?: number
}

/**
 * Genera l'URL universale per aggiungere l'evento a Google Calendar con 1 clic
 * con Google Meet pre-impostato come location.
 */
export function buildGoogleCalendarUrl(params: GoogleMeetEventParams): string {
  const { title, description = '', date, time, durationMinutes = 45 } = params

  try {
    const [year, month, day] = date.split('-').map(Number)
    const [hours, minutes] = time.split(':').map(Number)

    const startDate = new Date(year, month - 1, day, hours, minutes)
    const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000)

    const formatGCalDate = (d: Date) => {
      return d.toISOString().replace(/-|:|\.\d+/g, '')
    }

    const startIso = formatGCalDate(startDate)
    const endIso = formatGCalDate(endDate)

    const fullDetails = `${description}\n\n🔗 Riunione Google Meet: https://meet.google.com/new\nOrganizzato da Piattaforma AiUtiamoci Cloud`.trim()

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      title
    )}&dates=${startIso}/${endIso}&details=${encodeURIComponent(
      fullDetails
    )}&location=${encodeURIComponent('Google Meet (https://meet.google.com/new)')}`
  } catch {
    return 'https://calendar.google.com/'
  }
}

/**
 * Genera il widget HTML completo e interattivo di Google Meet Pro per il Banco di Lavoro di Mira.
 */
export function generateGoogleMeetCardHtml(params: GoogleMeetEventParams): string {
  const gcalUrl = buildGoogleCalendarUrl(params)
  const meetUrl = 'https://meet.google.com/new'

  return `
<div style="background: linear-gradient(135deg, #090d16, #0f172a); border-radius: 20px; border: 1.5px solid #0284c7; padding: 24px; color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; box-shadow: 0 15px 35px rgba(2,132,199,0.25);">
  
  <!-- Header Google Meet Pro -->
  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; border-bottom: 1px solid #1e293b; padding-bottom: 12px;">
    <div style="display: flex; align-items: center; gap: 10px;">
      <div style="background: #0284c7; color: white; width: 34px; height: 34px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; box-shadow: 0 0 14px rgba(2,132,199,0.5);">
        📹
      </div>
      <div>
        <div style="font-size: 14px; font-weight: 800; color: #f1f5f9; display: flex; align-items: center; gap: 6px;">
          Google Meet Pro
          <span style="background: #0369a1; color: #e0f2fe; font-size: 10px; padding: 2px 7px; border-radius: 999px; font-weight: 700;">
            ★ Account Pro Attivo
          </span>
        </div>
        <div style="font-size: 11px; color: #64748b;">Sincronizzato con il Calendario Team</div>
      </div>
    </div>
    <div style="background: #022c22; border: 1px solid #059669; color: #34d399; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 999px;">
      ● Evento Confermato
    </div>
  </div>

  <!-- Dettagli Riunione -->
  <div style="background: #020617; border: 1px solid #1e293b; border-radius: 14px; padding: 16px; margin-bottom: 18px;">
    <h3 style="font-size: 17px; font-weight: 700; color: #38bdf8; margin: 0 0 8px 0;">${params.title}</h3>
    
    <div style="display: flex; flex-wrap: wrap; gap: 16px; font-size: 12px; color: #cbd5e1; margin-bottom: 10px;">
      <div style="display: flex; align-items: center; gap: 6px;">
        <span style="color: #38bdf8;">📅</span>
        <strong>Data:</strong> ${params.date}
      </div>
      <div style="display: flex; align-items: center; gap: 6px;">
        <span style="color: #38bdf8;">⏰</span>
        <strong>Orario:</strong> ${params.time} (${params.durationMinutes || 45} min)
      </div>
      <div style="display: flex; align-items: center; gap: 6px;">
        <span style="color: #38bdf8;">👥</span>
        <strong>Team:</strong> Soci & Collaboratori
      </div>
    </div>

    ${
      params.description
        ? `<p style="font-size: 12px; color: #94a3b8; margin: 0; line-height: 1.4; border-top: 1px dashed #1e293b; padding-top: 8px;">${params.description}</p>`
        : ''
    }
  </div>

  <!-- Azioni Rapide 1-Click -->
  <div style="display: flex; flex-wrap: wrap; gap: 10px; align-items: center;">
    <a href="${meetUrl}" target="_blank" rel="noopener noreferrer" style="background: linear-gradient(135deg, #0284c7, #0369a1); color: white; text-decoration: none; padding: 10px 18px; border-radius: 10px; font-size: 13px; font-weight: 700; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 0 16px rgba(2,132,199,0.4); transition: transform 0.15s;">
      <span>🟢 Entra in Google Meet</span>
      <span style="font-size: 11px; opacity: 0.8;">↗</span>
    </a>

    <a href="${gcalUrl}" target="_blank" rel="noopener noreferrer" style="background: #1e293b; color: #f8fafc; border: 1px solid #334155; text-decoration: none; padding: 10px 16px; border-radius: 10px; font-size: 12px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px;">
      <span>📅 Aggiungi a Google Calendar</span>
      <span style="font-size: 11px; opacity: 0.7;">↗</span>
    </a>

    <button onclick="navigator.clipboard.writeText('${meetUrl}'); alert('Link Google Meet copiato negli appunti! Pronto da incollare su WhatsApp o Telegram.');" style="background: #0f172a; color: #94a3b8; border: 1px solid #1e293b; padding: 10px 14px; border-radius: 10px; font-size: 12px; font-weight: 600; cursor: pointer;">
      📋 Copia Link
    </button>
  </div>

  <!-- Footer Link a Calendario -->
  <div style="margin-top: 14px; font-size: 11px; color: #64748b; display: flex; justify-content: space-between; align-items: center;">
    <span>Registrato nel database Supabase (tabella calendar_events)</span>
    <a href="/calendario" style="color: #38bdf8; text-decoration: none; font-weight: 600;">Vai a /calendario ➔</a>
  </div>
</div>
  `.trim()
}
