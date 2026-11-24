import { generateSpeech, transcribe } from 'ai'

export const maxDuration = 30

const TRANSCRIBE_MODEL = process.env.MILTON_STT_MODEL || 'openai/gpt-4o-mini-transcribe'
const SPEECH_MODEL = process.env.MILTON_TTS_MODEL || 'openai/tts-1'
const VOICE = process.env.MILTON_VOICE || 'alloy'
const MAX_AUDIO_BYTES = 8_000_000
const MAX_SPEECH_CHARS = 1200

async function listen(req) {
  const audio = new Uint8Array(await req.arrayBuffer())
  if (!audio.length) return Response.json({ text: '' })
  if (audio.length > MAX_AUDIO_BYTES) return new Response('That was too long. Try a shorter message.', { status: 413 })
  const { text } = await transcribe({ model: TRANSCRIBE_MODEL, audio })
  return Response.json({ text: (text || '').trim() })
}

async function speak(req) {
  let body
  try {
    body = await req.json()
  } catch {
    return new Response('Bad request', { status: 400 })
  }
  const text = String(body?.text || '').trim().slice(0, MAX_SPEECH_CHARS)
  if (!text) return new Response('Nothing to say', { status: 400 })
  const { audio } = await generateSpeech({ model: SPEECH_MODEL, text, voice: VOICE })
  return new Response(audio.uint8Array, {
    headers: { 'Content-Type': audio.mediaType || 'audio/mpeg', 'Cache-Control': 'no-store' },
  })
}

export async function POST(req) {
  const op = new URL(req.url).searchParams.get('op')
  try {
    if (op === 'listen') return await listen(req)
    if (op === 'speak') return await speak(req)
    return new Response('Unknown voice operation', { status: 400 })
  } catch (e) {
    console.error('[api/voice]', e?.message || e)
    return new Response('Voice is unavailable right now.', { status: 502 })
  }
}
