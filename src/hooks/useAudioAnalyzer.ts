// src/hooks/useAudioAnalyzer.ts
import { useRef, useCallback, useState, useEffect } from 'react'

export interface AudioData {
  frequencyData: Uint8Array
  timeData: Uint8Array
  bass: number
  mid: number
  high: number
  energy: number
}

export function useAudioAnalyzer() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const ctxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const rafRef = useRef<number>(0)

  const [audioData, setAudioData] = useState<AudioData>({
    frequencyData: new Uint8Array(256),
    timeData: new Uint8Array(256),
    bass: 0, mid: 0, high: 0, energy: 0,
  })
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [trackName, setTrackName] = useState('')

  const loadAudio = useCallback((file: File) => {
    // limpia el audio anterior si existe
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ''
    }

    const audio = new Audio()
    audio.src = URL.createObjectURL(file)
    audio.crossOrigin = 'anonymous'
    audioRef.current = audio

    setTrackName(file.name.replace(/\.[^.]+$/, ''))
    setCurrentTime(0)
    setIsPlaying(false)

    audio.addEventListener('loadedmetadata', () => setDuration(audio.duration))
    audio.addEventListener('timeupdate', () => setCurrentTime(audio.currentTime))
    audio.addEventListener('ended', () => {
      setIsPlaying(false)
      cancelAnimationFrame(rafRef.current)
    })
  }, [])

  const tick = useCallback(() => {
    if (!analyserRef.current) return
    const analyser = analyserRef.current
    const freq = new Uint8Array(analyser.frequencyBinCount)
    const time = new Uint8Array(analyser.fftSize)
    analyser.getByteFrequencyData(freq)
    analyser.getByteTimeDomainData(time)

    const bin = freq.length
    const bEnd = Math.floor(bin * 0.08)
    const mEnd = Math.floor(bin * 0.40)
    let bSum = 0, mSum = 0, hSum = 0

    for (let i = 0; i < bin; i++) {
      if (i < bEnd) bSum += freq[i]
      else if (i < mEnd) mSum += freq[i]
      else hSum += freq[i]
    }

    const bass   = Math.round(bSum / bEnd)
    const mid    = Math.round(mSum / (mEnd - bEnd))
    const high   = Math.round(hSum / (bin - mEnd))
    const energy = Math.round(((bass + mid + high) / 3 / 255) * 100)

    setAudioData({ frequencyData: freq, timeData: time, bass, mid, high, energy })
    rafRef.current = requestAnimationFrame(tick)
  }, [])

  const play = useCallback(async () => {
    if (!audioRef.current) return

    // crea el contexto solo la primera vez (requiere gesto del usuario)
    if (!ctxRef.current) {
      const ctx = new AudioContext()
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 512
      analyser.smoothingTimeConstant = 0.82
      const source = ctx.createMediaElementSource(audioRef.current)
      source.connect(analyser)
      analyser.connect(ctx.destination)
      ctxRef.current = ctx
      analyserRef.current = analyser
    } else if (ctxRef.current.state === 'suspended') {
      await ctxRef.current.resume()
    }

    await audioRef.current.play()
    setIsPlaying(true)
    rafRef.current = requestAnimationFrame(tick)
  }, [tick])

  const pause = useCallback(() => {
    if (!audioRef.current) return
    audioRef.current.pause()
    setIsPlaying(false)
    cancelAnimationFrame(rafRef.current)
  }, [])

  const seek = useCallback((pct: number) => {
    if (!audioRef.current || !duration) return
    audioRef.current.currentTime = pct * duration
  }, [duration])

  const restart = useCallback(() => {
    if (!audioRef.current) return
    audioRef.current.currentTime = 0
  }, [])

  // limpia el raf al desmontar
  useEffect(() => () => cancelAnimationFrame(rafRef.current), [])

  return {
    loadAudio,
    play,
    pause,
    seek,
    restart,
    isPlaying,
    currentTime,
    duration,
    trackName,
    audioData,
  }
}