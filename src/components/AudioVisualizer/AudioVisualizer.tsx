// src/components/AudioVisualizer/AudioVisualizer.tsx
import { useRef, useEffect } from 'react'
import type { AudioData } from '../../hooks/useAudioAnalyzer'

interface Props {
  audioData: AudioData
  isPlaying: boolean
}

// paleta de colores para las barras — cada barra rota entre estos
const BAR_COLORS = [
  '#ff6b6b', '#ff8e53', '#ffd166',
  '#06d6a0', '#06b6d4', '#4cc9f0',
  '#a855f7', '#ec4899', '#f472b6',
  '#00f5ff', '#b700ff', '#00ff88',
]

export function AudioVisualizer({ audioData, isPlaying }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    const draw = () => {
      const W = canvas.width = canvas.offsetWidth
      const H = canvas.height = canvas.offsetHeight
      ctx.clearRect(0, 0, W, H)

      const { frequencyData, timeData } = audioData
      const barCount = 64
      const barW = W / barCount

      // --- barras de frecuencia ---
      for (let i = 0; i < barCount; i++) {
        const binIdx = Math.floor((i / barCount) * frequencyData.length)
        const val = frequencyData[binIdx] / 255
        const barH = val * H * 0.85
        const color = BAR_COLORS[i % BAR_COLORS.length]

        // barra principal
        ctx.globalAlpha = 0.15 + val * 0.85
        ctx.fillStyle = color
        ctx.fillRect(i * barW + 1, H - barH, barW - 2, barH)

        // línea brillante en el tope de cada barra
        ctx.globalAlpha = 0.8 + val * 0.2
        ctx.fillRect(i * barW + 1, H - barH, barW - 2, 2)
      }

      // --- waveform encima ---
      ctx.globalAlpha = 0.35
      ctx.strokeStyle = '#00f5ff'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      const sliceW = W / timeData.length
      for (let i = 0; i < timeData.length; i++) {
        const y = (timeData[i] / 128) * (H * 0.25) + (H * 0.5)
        i === 0 ? ctx.moveTo(i * sliceW, y) : ctx.lineTo(i * sliceW, y)
      }
      ctx.stroke()
      ctx.globalAlpha = 1
    }

    // si no está reproduciendo dibuja barras idle animadas
    let idleT = 0
    const idle = () => {
      const W = canvas.width = canvas.offsetWidth
      const H = canvas.height = canvas.offsetHeight
      ctx.clearRect(0, 0, W, H)
      idleT += 0.03
      const barCount = 64
      const barW = W / barCount
      for (let i = 0; i < barCount; i++) {
        const val = (Math.sin(idleT + i * 0.25) + 1) / 2 * 0.15
        const barH = val * H
        ctx.globalAlpha = 0.3
        ctx.fillStyle = BAR_COLORS[i % BAR_COLORS.length]
        ctx.fillRect(i * barW + 1, H - barH, barW - 2, barH)
      }
      ctx.globalAlpha = 1
      rafRef.current = requestAnimationFrame(idle)
    }

    if (isPlaying) {
      cancelAnimationFrame(rafRef.current)
      draw()
    } else {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(idle)
    }

    return () => cancelAnimationFrame(rafRef.current)
  }, [audioData, isPlaying])

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  )
}