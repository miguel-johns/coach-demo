/*
 * Hands-free voice loop for Milton.
 * listening -> (you speak, then pause) -> thinking -> speaking -> listening.
 * Talking over Milton while he speaks stops him and starts a new turn.
 */

const SILENCE_MS = 850
const MIN_SPEECH_MS = 250
const BARGE_IN_MS = 280
const MAX_TURN_MS = 30_000
const IDLE_RESTART_MS = 12_000

const plain = (text) =>
  text
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*_#>|~]+/g, ' ')
    .replace(/^\s*[-•]\s+/gm, '')
    .replace(/\s+\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .trim()

/* Groups sentences into chunks so the first one plays quickly and the rest stream behind it. */
function chunks(text) {
  const sentences = plain(text).match(/[^.!?\n]+[.!?]*|\n+/g) || []
  const out = []
  let cur = ''
  for (const s of sentences) {
    const t = s.trim()
    if (!t) continue
    const limit = out.length === 0 ? 140 : 400
    if (cur && (cur + ' ' + t).length > limit) {
      out.push(cur)
      cur = t
    } else cur = cur ? `${cur} ${t}` : t
  }
  if (cur) out.push(cur)
  return out
}

function pickMime() {
  const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus']
  return types.find((t) => window.MediaRecorder?.isTypeSupported?.(t)) || ''
}

export function voiceSupported() {
  return Boolean(navigator.mediaDevices?.getUserMedia && window.MediaRecorder && (window.AudioContext || window.webkitAudioContext))
}

export function createVoice({ onState, onTranscript, onLevel, onError }) {
  let state = 'off'
  let stream = null
  let ctx = null
  let analyser = null
  let buf = null
  let raf = 0
  let recorder = null
  let parts = []
  let floor = 0.01
  let calibrateUntil = 0
  let speechStart = 0
  let lastVoice = 0
  let recordStart = 0
  let loudSince = 0
  let audio = null
  let speakToken = 0
  let speakAbort = null
  const mime = pickMime()

  const set = (s) => {
    if (state === s) return
    state = s
    onState?.(s)
  }

  function level() {
    analyser.getFloatTimeDomainData(buf)
    let sum = 0
    for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i]
    return Math.sqrt(sum / buf.length)
  }

  function startRecorder() {
    stopRecorder(true)
    parts = []
    recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined)
    recorder.ondataavailable = (e) => e.data.size && parts.push(e.data)
    recorder.start(250)
    recordStart = performance.now()
    speechStart = 0
    lastVoice = 0
  }

  function stopRecorder(discard) {
    if (!recorder) return Promise.resolve(null)
    const r = recorder
    recorder = null
    if (r.state === 'inactive') return Promise.resolve(discard ? null : new Blob(parts, { type: r.mimeType }))
    return new Promise((resolve) => {
      r.onstop = () => resolve(discard ? null : new Blob(parts, { type: r.mimeType }))
      r.stop()
    })
  }

  async function finishTurn() {
    set('thinking')
    const blob = await stopRecorder(false)
    if (!blob || blob.size < 2000) return listen()
    try {
      const res = await fetch('/api/voice?op=listen', {
        method: 'POST',
        headers: { 'Content-Type': blob.type || 'audio/webm' },
        body: blob,
      })
      if (!res.ok) throw new Error(await res.text())
      const { text } = await res.json()
      if (state === 'off') return
      if (!text || text.replace(/[^a-z0-9]/gi, '').length < 2) return listen()
      onTranscript?.(text)
    } catch (e) {
      if (state === 'off') return
      onError?.(e.message || 'Milton could not hear that.')
      listen()
    }
  }

  function tick() {
    raf = requestAnimationFrame(tick)
    const now = performance.now()
    const rms = level()
    onLevel?.(rms)

    if (now < calibrateUntil) {
      floor = Math.max(floor * 0.8 + rms * 0.2, 0.004)
      return
    }
    const talkAt = Math.max(0.018, floor * 3)

    if (state === 'listening') {
      if (rms > talkAt) {
        lastVoice = now
        if (!speechStart) speechStart = now
      } else if (!speechStart) {
        floor = floor * 0.995 + rms * 0.005
        if (now - recordStart > IDLE_RESTART_MS) startRecorder()
      }
      const spoke = speechStart && lastVoice - speechStart > MIN_SPEECH_MS
      if (spoke && now - lastVoice > SILENCE_MS) finishTurn()
      else if (speechStart && now - speechStart > MAX_TURN_MS) finishTurn()
      else if (speechStart && !spoke && now - lastVoice > SILENCE_MS) speechStart = 0
    } else if (state === 'speaking') {
      /* Echo cancellation keeps Milton's own voice quiet, so a sustained loud signal is you. */
      const bargeAt = Math.max(0.05, floor * 6)
      if (rms > bargeAt) {
        if (!loudSince) loudSince = now
        if (now - loudSince > BARGE_IN_MS) {
          loudSince = 0
          stopSpeaking()
          listen()
          speechStart = now - BARGE_IN_MS
          lastVoice = now
        }
      } else loudSince = 0
    }
  }

  function listen() {
    if (state === 'off') return
    set('listening')
    startRecorder()
  }

  async function start() {
    if (state !== 'off') return
    set('starting')
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      })
    } catch (e) {
      set('off')
      onError?.(e.name === 'NotAllowedError' ? 'Microphone access was blocked. Allow it in your browser to talk to Milton.' : 'No microphone was found.')
      return false
    }
    const AC = window.AudioContext || window.webkitAudioContext
    ctx = new AC()
    analyser = ctx.createAnalyser()
    analyser.fftSize = 1024
    buf = new Float32Array(analyser.fftSize)
    ctx.createMediaStreamSource(stream).connect(analyser)
    calibrateUntil = performance.now() + 400
    state = 'starting'
    listen()
    tick()
    return true
  }

  function stopSpeaking() {
    speakToken++
    speakAbort?.abort()
    speakAbort = null
    if (audio) {
      audio.pause()
      URL.revokeObjectURL(audio.src)
      audio = null
    }
  }

  const fetchClip = (text, signal) =>
    fetch('/api/voice?op=speak', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
      signal,
    }).then((r) => {
      if (!r.ok) throw new Error('Milton could not speak that.')
      return r.blob()
    })

  /* Speaks a reply, then goes back to listening. Resolves false if you interrupted. */
  async function say(text) {
    if (state === 'off') return false
    const list = chunks(text)
    if (!list.length) {
      listen()
      return true
    }
    stopSpeaking()
    const token = speakToken
    speakAbort = new AbortController()
    const signal = speakAbort.signal
    stopRecorder(true)
    set('speaking')
    try {
      let next = fetchClip(list[0], signal)
      for (let i = 0; i < list.length; i++) {
        const blob = await next
        if (token !== speakToken) return false
        next = i + 1 < list.length ? fetchClip(list[i + 1], signal) : null
        next?.catch(() => {})
        audio = new Audio(URL.createObjectURL(blob))
        await new Promise((resolve, reject) => {
          audio.onended = resolve
          audio.onerror = () => reject(new Error('Playback failed'))
          audio.play().catch(reject)
        })
        if (token !== speakToken) return false
        URL.revokeObjectURL(audio.src)
        audio = null
      }
    } catch (e) {
      if (token !== speakToken || e.name === 'AbortError') return false
      onError?.(e.message)
    }
    if (token !== speakToken) return false
    listen()
    return true
  }

  function stop() {
    stopSpeaking()
    stopRecorder(true)
    cancelAnimationFrame(raf)
    stream?.getTracks().forEach((t) => t.stop())
    ctx?.close()
    stream = ctx = analyser = null
    set('off')
  }

  return {
    start,
    stop,
    say,
    listen,
    stopSpeaking,
    /* Holds the mic while Milton is working so background noise is not sent. */
    hold: () => {
      if (state === 'off') return
      stopRecorder(true)
      set('thinking')
    },
    get state() {
      return state
    },
  }
}
