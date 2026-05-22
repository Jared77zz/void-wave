// src/hooks/useLyrics.ts
import { useState, useCallback, useEffect } from 'react'

export interface LyricLine {
  text: string
  time: number // en segundos, cuándo aparece
}

export function useLyrics() {
  const [lines, setLines] = useState<LyricLine[]>([])
  const [currentIndex, setCurrentIndex] = useState(-1)

  // recibe texto plano (una línea por verso) y la duración total
  // distribuye las letras automáticamente a lo largo de la canción
  const loadLyrics = useCallback((raw: string, duration: number) => {
    const parsed = raw
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean)

    if (!parsed.length || !duration) return

    const step = duration / (parsed.length + 1)
    const result: LyricLine[] = parsed.map((text, i) => ({
      text,
      time: step * (i + 1),
    }))

    setLines(result)
    setCurrentIndex(-1)
  }, [])

  // se llama en cada timeupdate del audio
  const updateTime = useCallback((currentTime: number) => {
    if (!lines.length) return

    let idx = -1
    for (let i = 0; i < lines.length; i++) {
      if (currentTime >= lines[i].time) idx = i
    }

    setCurrentIndex(idx)
  }, [lines])

  const clearLyrics = useCallback(() => {
    setLines([])
    setCurrentIndex(-1)
  }, [])

  // línea anterior y actual para mostrar en pantalla
  const prevLine = currentIndex > 0 ? lines[currentIndex - 1].text : ''
  const currentLine = currentIndex >= 0 ? lines[currentIndex].text : ''
  const nextLine = currentIndex < lines.length - 1 ? lines[currentIndex + 1]?.text : ''

  return {
    lines,
    currentIndex,
    prevLine,
    currentLine,
    nextLine,
    loadLyrics,
    updateTime,
    clearLyrics,
  }
}