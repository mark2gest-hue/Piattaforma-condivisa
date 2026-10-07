import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';

const execAsync = promisify(exec);

export async function POST(req: Request) {
  try {
    const {
      title,
      hook,
      bullet1,
      bullet2,
      bullet3,
      cta,
      badge,
      target,
      tone
    } = await req.json();

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

    const cleanTitle = title.trim();
    const cleanBadge = badge ? badge.trim() : 'AIUTIAMOCI.CLOUD • SOLUZIONI PRATICHE';
    const cleanHook = hook ? hook.trim() : `Come risolvere ${cleanTitle} in pochi secondi con l'AI`;
    const cleanB1 = bullet1 ? bullet1.trim() : '⚡ 1. Risparmia fino a 2 ore al giorno';
    const cleanB2 = bullet2 ? bullet2.trim() : '📊 2. Zero errori e formule complesse';
    const cleanB3 = bullet3 ? bullet3.trim() : '🛡️ 3. Risultati immediati testati sul campo';
    const cleanCta = cta ? cta.trim() : 'COMMENTA "GUIDA" SOTTO 👇';

    // 1. Sintesi Vocale Audio Cross-Platform
    const audioPath = path.join(publicVideosDir, `${videoId}.aiff`);
    const wavPath = path.join(publicVideosDir, `${videoId}.wav`);
    
    const voiceScript = `${cleanHook}. ${cleanB1}. ${cleanB2}. ${cleanB3}. ${cleanCta}`;
    const cleanScript = voiceScript.replace(/["'`\\]/g, '').replace(/\n/g, ' ');
    
    let audioGenerated = false;

    // Tentativo 1: macOS say
    try {
      await execAsync(`say -v Federica -r 170 -o "${audioPath}" "${cleanScript}"`);
      await execAsync(`ffmpeg -y -i "${audioPath}" -ar 44100 -ac 2 "${wavPath}"`);
      audioGenerated = true;
    } catch (_) {
      try {
        await execAsync(`say -r 170 -o "${audioPath}" "${cleanScript}"`);
        await execAsync(`ffmpeg -y -i "${audioPath}" -ar 44100 -ac 2 "${wavPath}"`);
        audioGenerated = true;
      } catch (_) {}
    }

    // Tentativo 2: Linux edge-tts / espeak
    if (!audioGenerated) {
      try {
        await execAsync(`edge-tts --voice it-IT-DiegoNeural --text "${cleanScript}" --write-media "${wavPath}"`);
        audioGenerated = true;
      } catch (_) {
        try {
          await execAsync(`espeak -v it -s 150 -w "${wavPath}" "${cleanScript}"`);
          audioGenerated = true;
        } catch (_) {}
      }
    }

    // Tentativo 3: Fallback silenzioso sincronizzato 15s
    if (!audioGenerated) {
      await execAsync(`ffmpeg -y -f lavfi -i anullsrc=r=44100:cl=stereo -t 15 "${wavPath}"`);
    }

    // 2. Durata audio
    const durationCmd = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${wavPath}"`;
    const { stdout: durationStdout } = await execAsync(durationCmd);
    const audioDuration = parseFloat(durationStdout.trim()) || 15;

    // 3. Rendering Grafico Pulito & Minimale 1080x1920 con Playwright
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
          background: #07090E;
          background-image: 
            radial-gradient(at 50% 15%, rgba(16, 185, 129, 0.12) 0px, transparent 60%),
            radial-gradient(at 50% 85%, rgba(79, 70, 229, 0.15) 0px, transparent 60%);
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          color: #F8FAFC;
          padding: 100px 75px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        
        .top-badge {
          align-self: center;
          background: rgba(16, 185, 129, 0.12);
          border: 2px solid rgba(16, 185, 129, 0.4);
          color: #34D399;
          font-size: 26px;
          font-weight: 800;
          letter-spacing: 3px;
          padding: 14px 40px;
          border-radius: 999px;
          text-transform: uppercase;
        }

        .main-card {
          background: rgba(15, 23, 42, 0.85);
          border: 2px solid rgba(51, 65, 85, 0.9);
          border-radius: 40px;
          padding: 60px 50px;
          box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.7);
        }

        .title {
          font-size: 54px;
          font-weight: 900;
          line-height: 1.15;
          letter-spacing: -0.5px;
          color: #FFFFFF;
          margin-bottom: 24px;
          text-transform: uppercase;
        }

        .hook-box {
          background: rgba(30, 41, 59, 0.8);
          border-left: 6px solid #F59E0B;
          border-radius: 16px;
          padding: 24px 30px;
          font-size: 30px;
          font-weight: 600;
          line-height: 1.35;
          color: #E2E8F0;
          margin-bottom: 40px;
        }

        .bullets-list {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .bullet-row {
          background: rgba(15, 23, 42, 0.6);
          border: 1.5px solid rgba(51, 65, 85, 0.6);
          border-radius: 20px;
          padding: 24px 30px;
          font-size: 32px;
          font-weight: 700;
          color: #F1F5F9;
          display: flex;
          align-items: center;
        }

        .cta-box {
          background: linear-gradient(135deg, #10B981 0%, #06B6D4 100%);
          border-radius: 36px;
          padding: 44px 30px;
          text-align: center;
          color: #04130E;
          box-shadow: 0 20px 40px rgba(16, 185, 129, 0.3);
        }

        .cta-title {
          font-size: 46px;
          font-weight: 900;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .cta-sub {
          font-size: 26px;
          font-weight: 700;
          color: #064E3B;
          margin-top: 10px;
        }
      </style>
    </head>
    <body>
      <div class="top-badge">${cleanBadge}</div>

      <div class="main-card">
        <div class="title">${cleanTitle}</div>
        <div class="hook-box">💡 ${cleanHook}</div>

        <div class="bullets-list">
          <div class="bullet-row">${cleanB1}</div>
          <div class="bullet-row">${cleanB2}</div>
          <div class="bullet-row">${cleanB3}</div>
        </div>
      </div>

      <div class="cta-box">
        <div class="cta-title">${cleanCta}</div>
        <div class="cta-sub">Per ricevere la guida pratica e il coupon 50%</div>
      </div>
    </body>
    </html>
    `;

    await page.setContent(htmlContent);
    await page.screenshot({ path: framePngPath });
    await browser.close();

    // 4. Montaggio Video MP4 ad Alta Definizione
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
      hook: cleanHook,
      duration: Math.round(audioDuration),
      postCopy: `Se passi ancora le tue giornate a fare compiti ripetitivi su ${cleanTitle}, stai letteralmente regalando ore della tua vita.\n\nEcco cosa puoi fare oggi stesso con l'Intelligenza Artificiale:\n✅ ${cleanB1}\n✅ ${cleanB2}\n✅ ${cleanB3}\n\n👉 ${cleanCta} qui sotto e ti invio in privato il prompt completo e il coupon speciale!`,
      firstComment: `🚀 Accedi a tutti i template e al corso su https://aiutiamoci.cloud/servizi-ai (Usa il coupon SCONTO50)`,
      hashtags: ['#Aiutiamoci', '#Produttività', '#FormazioneAI', '#PMI']
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
