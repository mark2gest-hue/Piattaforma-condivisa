import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';

const execAsync = promisify(exec);

export async function POST(req: Request) {
  try {
    const { title, hook, target, tone } = await req.json();

    if (!title) {
      return NextResponse.json({ error: 'Titolo/argomento obbligatorio' }, { status: 400 });
    }

    const publicVideosDir = path.join(process.cwd(), 'public', 'generated-reels');
    if (!fs.existsSync(publicVideosDir)) {
      fs.mkdirSync(publicVideosDir, { recursive: true });
    }

    const videoId = `reel-${Date.now()}`;
    const outputFilename = `${videoId}.mp4`;
    const outputPath = path.join(publicVideosDir, outputFilename);
    const framePngPath = path.join(publicVideosDir, `${videoId}-frame.png`);

    const cleanTitle = title.replace(/[^a-zA-Z0-9 àèéìòùÀÈÉÌÒÙ]/g, ' ').replace(/\s+/g, ' ').trim();
    const hookText = (hook || `Se passi ancora ore su ${cleanTitle} fermati stai sprecando tempo`)
      .replace(/[^a-zA-Z0-9 àèéìòùÀÈÉÌÒÙ]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const scene1 = `Ecco come risolvere ${cleanTitle} in 3 semplici passaggi con l intelligenza artificiale.`;
    const scene2 = `Zero formule matematiche, zero codice. Solo comandi pratici in italiano.`;
    const ctaText = `Commenta GUIDA per ricevere il template e lo sconto del 50 per cento.`;

    // 1. Sintesi Vocale Audio con macOS TTS
    const audioPath = path.join(publicVideosDir, `${videoId}.aiff`);
    const wavPath = path.join(publicVideosDir, `${videoId}.wav`);
    
    const voiceScript = `${hookText}. ${scene1}. ${scene2}. ${ctaText}`;
    try {
      await execAsync(`say -v Federica -r 170 -o "${audioPath}" "${voiceScript.replace(/"/g, '')}"`);
      await execAsync(`ffmpeg -y -i "${audioPath}" -ar 44100 -ac 2 "${wavPath}"`);
    } catch (e) {
      await execAsync(`say -r 170 -o "${audioPath}" "${voiceScript.replace(/"/g, '')}"`);
      await execAsync(`ffmpeg -y -i "${audioPath}" -ar 44100 -ac 2 "${wavPath}"`);
    }

    // 2. Durata audio
    const durationCmd = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${wavPath}"`;
    const { stdout: durationStdout } = await execAsync(durationCmd);
    const audioDuration = parseFloat(durationStdout.trim()) || 15;

    // 3. Rendering Grafico Perfetto 1080x1920 con Playwright (Anti-Slop, Ultra-Definito)
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({
      viewport: { width: 1080, height: 1920 },
      deviceScaleFactor: 1
    });

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          width: 1080px;
          height: 1920px;
          background: linear-gradient(180deg, #090D16 0%, #0F172A 50%, #06090E 100%);
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          color: #F8FAFC;
          padding: 80px 70px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .top-badge {
          align-self: center;
          background: rgba(16, 185, 129, 0.15);
          border: 2px solid rgba(16, 185, 129, 0.4);
          color: #34D399;
          font-size: 30px;
          font-weight: 800;
          letter-spacing: 2px;
          padding: 16px 40px;
          border-radius: 999px;
          text-align: center;
        }
        .hero-card {
          background: rgba(30, 41, 59, 0.95);
          border: 3px solid #334155;
          border-radius: 36px;
          padding: 44px;
          text-align: center;
        }
        .hero-title {
          font-size: 48px;
          font-weight: 900;
          color: #FFFFFF;
          line-height: 1.2;
          text-transform: uppercase;
        }
        .hero-sub {
          font-size: 30px;
          font-weight: 600;
          color: #94A3B8;
          margin-top: 14px;
        }
        .hook-pill {
          background: #0F172A;
          border-radius: 20px;
          padding: 20px 30px;
          margin-top: 24px;
          font-size: 28px;
          font-weight: 700;
          color: #F59E0B;
        }
        .content-card {
          background: rgba(15, 23, 42, 0.98);
          border: 3px solid rgba(16, 185, 129, 0.4);
          border-radius: 36px;
          padding: 50px 44px;
        }
        .content-card h3 {
          font-size: 34px;
          font-weight: 800;
          color: #10B981;
          margin-bottom: 34px;
          letter-spacing: 1px;
        }
        .step-item {
          font-size: 32px;
          font-weight: 600;
          margin-bottom: 28px;
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .step-cert {
          color: #38BDF8;
        }
        .cta-banner {
          background: linear-gradient(90deg, #10B981 0%, #06B6D4 100%);
          border-radius: 36px;
          padding: 40px;
          text-align: center;
          color: #090C10;
        }
        .cta-title {
          font-size: 44px;
          font-weight: 900;
          letter-spacing: 1px;
        }
        .cta-sub {
          font-size: 28px;
          font-weight: 800;
          color: #064E3B;
          margin-top: 10px;
        }
      </style>
    </head>
    <body>
      <div class="top-badge">AIUTIAMOCI.CLOUD • SCUOLA PRATICA AI</div>

      <div class="hero-card">
        <div class="hero-title">${cleanTitle}</div>
        <div class="hero-sub">Guida Rapida in 3 Passaggi</div>
        <div class="hook-pill">💡 Gancio: ${hookText.slice(0, 44)}...</div>
      </div>

      <div class="content-card">
        <h3>COSA IMPARI IN QUESTO VIDEO:</h3>
        <div class="step-item">⚡ 1. Delegare compiti ripetitivi in 10 secondi</div>
        <div class="step-item">📊 2. Creare tabelle e bozze senza errori</div>
        <div class="step-item">🛡️ 3. Prompt pronti testati anti-allucinazione</div>
        <div class="step-item step-cert">🎓 4. 16 Ore Certificate EQF DigComp 2.2</div>
        <div class="step-item">👥 5. Live Q&A e correzione diretta con i docenti</div>
      </div>

      <div class="cta-banner">
        <div class="cta-title">COMMENTA "GUIDA" SOTTO 👇</div>
        <div class="cta-sub">Per ricevere il coupon 50% e i prompt gratuiti</div>
      </div>
    </body>
    </html>
    `;

    await page.setContent(htmlContent);
    await page.screenshot({ path: framePngPath });
    await browser.close();

    // 4. Montaggio Video MP4 ad Alta Definizione (H.264 + AAC)
    const ffmpegCommand = `ffmpeg -y -loop 1 -i "${framePngPath}" -i "${wavPath}" -c:v libx264 -tune stillimage -c:a aac -b:a 192k -pix_fmt yuv420p -shortest "${outputPath}"`;
    await execAsync(ffmpegCommand);

    // Pulizia file intermedi
    try {
      if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
      if (fs.existsSync(wavPath)) fs.unlinkSync(wavPath);
      if (fs.existsSync(framePngPath)) fs.unlinkSync(framePngPath);
    } catch (_) {}

    const result = {
      success: true,
      videoId,
      videoUrl: `/generated-reels/${outputFilename}`,
      title: cleanTitle,
      hook: hookText,
      duration: Math.round(audioDuration),
      postCopy: `Se passi ancora le tue giornate lavorative a fare compiti ripetitivi su ${cleanTitle}, stai letteralmente regalando ore della tua vita.\n\nEcco cosa puoi fare oggi stesso con l'Intelligenza Artificiale:\n✅ Automatizzare la formattazione e le bozze in 10 secondi\n✅ Eliminare la paura di sbagliare formule o testi\n✅ Risparmiare fino a 2 ore al giorno da dedicare a ciò che conta davvero\n\nNel percorso pratico di 16 ore di Aiutiamoci insegniamo esattamente questo a chi parte da zero.\n\n👉 Commenta con la parola "GUIDA" qui sotto e ti invio in privato il prompt completo e il coupon speciale del 50%!`,
      firstComment: `🚀 Accedi al programma completo e al coupon SCONTO50 qui: https://aiutiamoci.cloud/corso-base (Posti limitati con tutoraggio live)`,
      hashtags: ['#Aiutiamoci', '#FormazioneAI', '#Produttività', '#PiccoleMedieImprese', '#Over40AI']
    };

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Errore generazione reel:', error);
    return NextResponse.json(
      { error: error.message || 'Errore interno durante il rendering del video' },
      { status: 500 }
    );
  }
}
