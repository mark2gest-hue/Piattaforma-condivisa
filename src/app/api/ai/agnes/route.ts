import { NextResponse } from 'next/server';

const AGNES_API_KEY = process.env.AGNES_AI_API_KEY || 'sk-fmPPvOhtTYzKVNnwnHISSRIW9q3DghRukVd4UweDPQ3hhWOl';
const AGNES_BASE_URL = 'https://apihub.agnes-ai.com/v1';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, prompt, model, size, taskId, messages, aspectRatio, mode } = body;

    // 1. CHAT / COPY & HOOK GENERATION
    if (action === 'chat' || (!action && messages)) {
      const chatModel = model || 'agnes-3.0-flash';
      const payloadMessages = messages || [{ role: 'user', content: prompt }];

      const response = await fetch(`${AGNES_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AGNES_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: chatModel,
          messages: payloadMessages,
          temperature: 0.7,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        return NextResponse.json({ error: data.error?.message || data.message || 'Errore Agnes Chat API' }, { status: response.status });
      }

      const reply = data.choices?.[0]?.message?.content || '';
      return NextResponse.json({ success: true, type: 'chat', reply, raw: data });
    }

    // 2. IMAGE GENERATION (POST /v1/images/generations)
    if (action === 'image') {
      if (!prompt) {
        return NextResponse.json({ error: 'Prompt obbligatorio per la generazione immagini' }, { status: 400 });
      }

      const imgModel = model || 'agnes-image-2.5-flash';
      const imgSize = size || '1024x1024';

      const response = await fetch(`${AGNES_BASE_URL}/images/generations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AGNES_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: imgModel,
          prompt,
          n: 1,
          size: imgSize,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        return NextResponse.json({ error: data.error?.message || data.message || 'Errore Agnes Image API' }, { status: response.status });
      }

      const imageUrl = data.data?.[0]?.url || null;
      return NextResponse.json({
        success: true,
        type: 'image',
        imageUrl,
        taskId: data.task_id,
        raw: data,
      });
    }

    // 3. VIDEO GENERATION TASK (POST /v1/videos)
    if (action === 'video') {
      if (!prompt) {
        return NextResponse.json({ error: 'Prompt obbligatorio per la generazione video' }, { status: 400 });
      }

      const videoModel = model || 'agnes-video-2.5';
      const videoMode = mode || 'text';
      const videoRatio = aspectRatio || '9:16';
      const videoSize = size || '720P';

      const response = await fetch(`${AGNES_BASE_URL}/videos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AGNES_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: videoModel,
          prompt,
          mode: videoMode,
          size: videoSize,
          aspect_ratio: videoRatio,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        return NextResponse.json({ error: data.error?.message || data.message || 'Errore Agnes Video API' }, { status: response.status });
      }

      return NextResponse.json({
        success: true,
        type: 'video_queued',
        taskId: data.task_id || data.id,
        status: data.status || 'processing',
        raw: data,
      });
    }

    // 4. TASK STATUS CHECK (GET /v1/tasks/:id)
    if (action === 'status' && taskId) {
      const response = await fetch(`${AGNES_BASE_URL}/tasks/${taskId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${AGNES_API_KEY}`,
        },
      });

      const data = await response.json();
      return NextResponse.json({ success: true, data });
    }

    return NextResponse.json({ error: 'Azione non supportata.' }, { status: 400 });
  } catch (err: any) {
    console.error('Errore API Agnes:', err);
    return NextResponse.json({ error: err.message || 'Errore interno del server' }, { status: 500 });
  }
}
