import { NextResponse } from 'next/server';
import { sendTelegramMessage, sendTelegramPhoto, sendTelegramVideo, escapeHtml } from '@/lib/telegram';

export async function POST(req: Request) {
  try {
    const { title, creator, target, postCopy, firstComment, imageUrl, videoUrl } = await req.json();

    const creatorBadge = creator === 'stefano' ? '👔 STEFANO (B2B & PMI)' : '🧑‍💻 LORENZO (Community & Corsi)';
    
    const messageHeader = 
      `🚀 <b>NUOVO PACCHETTO PROMO PRONTO PER LA PUBBLICAZIONE</b>\n\n` +
      `👤 <b>Autore:</b> ${creatorBadge}\n` +
      `🎯 <b>Target:</b> ${escapeHtml(target || 'Generale')}\n` +
      `📌 <b>Titolo:</b> <b>${escapeHtml(title || 'Post Promozionale')}</b>\n\n` +
      `📝 <b>TESTO DEL POST (da copiare):</b>\n` +
      `-----------------------------------------\n` +
      `${escapeHtml(postCopy || '')}\n` +
      `-----------------------------------------\n\n` +
      `💬 <b>PRIMO COMMENTO (con link):</b>\n` +
      `<code>${escapeHtml(firstComment || '')}</code>`;

    // 1. Se c'è un'immagine, mandiamo la foto con il testo come caption (o messaggio successivo se troppo lungo)
    if (imageUrl) {
      if (messageHeader.length <= 1000) {
        await sendTelegramPhoto(imageUrl, messageHeader);
      } else {
        await sendTelegramPhoto(imageUrl, `📸 <b>Visual 4K per: ${escapeHtml(title)}</b>`);
        await sendTelegramMessage(messageHeader);
      }
    } else {
      await sendTelegramMessage(messageHeader);
    }

    return NextResponse.json({ success: true, message: 'Inviato con successo al canale Telegram dei soci!' });
  } catch (err: any) {
    console.error('Errore dispatch marketing:', err);
    return NextResponse.json({ error: err.message || 'Errore invio notifica Telegram' }, { status: 500 });
  }
}
