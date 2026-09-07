const { chromium } = require('playwright');
const fs = require('fs');

async function recordDemo() {
  console.log('Avvio browser per registrazione screencast Agenti Autonomi...');
  const browser = await chromium.launch({
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: {
      dir: 'public/screencasts',
      size: { width: 1920, height: 1080 },
    },
  });

  const page = await context.newPage();

  console.log('Navigazione verso http://localhost:3000/demo-screencast...');
  await page.goto('http://localhost:3000/demo-screencast', { waitUntil: 'networkidle' });

  // Attendi lo svolgimento dell'animazione autonoma dell'agente (40 secondi)
  console.log('Registrazione in corso (40 secondi di interazione agentica)...');
  await page.waitForTimeout(40000);

  await page.close();
  await context.close();
  await browser.close();

  console.log('Registrazione completata!');
}

recordDemo().catch(err => {
  console.error('Errore durante la registrazione:', err);
  process.exit(1);
});
