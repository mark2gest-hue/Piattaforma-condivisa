import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';

async function recordAiutiamociPromo() {
  const outputDir = path.join(process.cwd(), 'recordings');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('🚀 Avvio browser Playwright (1920x1080) per demo promozionale AIutiamoci...');
  const browser = await chromium.launch({
    headless: true
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: {
      dir: outputDir,
      size: { width: 1920, height: 1080 }
    }
  });

  const page = await context.newPage();

  // 1. Apertura e Hero iniziale
  console.log('🌐 Connessione a https://aiutiamoci.cloud...');
  await page.goto('https://aiutiamoci.cloud', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);

  // 2. TIPO 1: Modal "Inizia il Corso Completo / Registrati qui" (Modulo dati)
  console.log('📝 Apertura Modal 1: Registrazione e inserimento dati...');
  const enrollBtn = page.locator('button:has-text("Inizia il Corso Completo")').first();
  await enrollBtn.scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
  await enrollBtn.click();
  await page.waitForTimeout(2000);

  // Compilazione guidata fluida dei dati
  const nameInput = page.locator('input[placeholder*="Mario Rossi"]');
  if (await nameInput.count() > 0) {
    await nameInput.click();
    await nameInput.type('Marco Gest', { delay: 80 });
  }

  const emailInput = page.locator('input[placeholder*="mario@"]');
  if (await emailInput.count() > 0) {
    await emailInput.click();
    await emailInput.type('marco@aiutiamoci.cloud', { delay: 70 });
  }
  await page.waitForTimeout(2500);

  // Chiusura modale registrazione
  console.log('✖️ Chiusura modale registrazione...');
  const closeBtn1 = page.locator('button:has(svg.lucide-x)').first();
  if (await closeBtn1.count() > 0) {
    await closeBtn1.click();
  } else {
    await page.keyboard.press('Escape');
  }
  await page.waitForTimeout(1500);

  // 3. TIPO 2: Modal "Hai già il codice? Entra qui" (Accesso rapido con codice)
  console.log('🔑 Apertura Modal 2: Accesso con Codice Univoco...');
  const codeBtn = page.locator('button:has-text("Hai già il codice? Entra qui")').first();
  await codeBtn.click();
  await page.waitForTimeout(2000);

  const codeInput = page.locator('input[placeholder*="AI-START-"]');
  if (await codeInput.count() > 0) {
    await codeInput.click();
    await codeInput.type('AI-START-MARK2', { delay: 90 });
  }
  await page.waitForTimeout(2500);

  // Chiusura modale codice
  console.log('✖️ Chiusura modale codice...');
  const closeBtn2 = page.locator('button:has(svg.lucide-x)').first();
  if (await closeBtn2.count() > 0) {
    await closeBtn2.click();
  } else {
    await page.keyboard.press('Escape');
  }
  await page.waitForTimeout(1500);

  // 4. Scroll fluido verso il Selettore Corsi (Card 1 vs Card 2 Viola)
  console.log('📜 Scroll verso la card del nuovo corso avanzato...');
  for (let i = 0; i < 4; i++) {
    await page.mouse.wheel(0, 300);
    await page.waitForTimeout(600);
  }
  await page.waitForTimeout(1500);

  // 5. TIPO 3: Card Viola "AI Pro & Agenti Autonomi B2B - Lista d'Attesa"
  console.log('💜 Apertura Modal 3: Lista d\'Attesa per il nuovo corso...');
  const waitlistBtn = page.locator('button:has-text("Iscriviti alla Lista d\'Attesa")').first();
  await waitlistBtn.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);
  await waitlistBtn.click();
  await page.waitForTimeout(2000);

  const waitlistInput = page.locator('input[placeholder*="tua.email@"]');
  if (await waitlistInput.count() > 0) {
    await waitlistInput.click();
    await waitlistInput.type('team@azienda.it', { delay: 80 });
  }
  await page.waitForTimeout(3000);

  // Chiusura finale
  const closeBtn3 = page.locator('button:has(svg.lucide-x)').first();
  if (await closeBtn3.count() > 0) {
    await closeBtn3.click();
  } else {
    await page.keyboard.press('Escape');
  }
  await page.waitForTimeout(1500);

  console.log('💾 Chiusura sessione e finalizzazione video...');
  await page.close();
  await context.close();
  await browser.close();

  const files = fs.readdirSync(outputDir).filter(f => f.endsWith('.webm'));
  if (files.length > 0) {
    const rawWebm = path.join(outputDir, files[files.length - 1]);
    const mp4Out = path.join(outputDir, 'promo_aiutiamoci_cloud.mp4');
    console.log('🎬 Conversione in MP4 Full HD con FFmpeg...');
    execSync(`ffmpeg -y -i "${rawWebm}" -c:v libx264 -pix_fmt yuv420p -preset fast -crf 21 "${mp4Out}"`);
    console.log(`✅ VIDEO PROMO PRONTO: ${mp4Out}`);
  }
}

recordAiutiamociPromo().catch(err => {
  console.error('❌ Errore:', err);
  process.exit(1);
});
