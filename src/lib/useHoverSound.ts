// src/lib/useHoverSound.ts
'use client'
import { useCallback, useEffect, useRef } from 'react'

export default function useHoverSound(url: string) {
  const ctxRef = useRef<AudioContext | null>(null)
  const bufRef = useRef<AudioBuffer | null>(null)
  const readyRef = useRef(false)

  const loadingRef = useRef<Promise<void> | null>(null)

  const unlock = useCallback(() => {
    if (ctxRef.current) return
    ctxRef.current = new window.AudioContext({
      latencyHint: 'interactive',
    })
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume()
    }
  }, [])

  const play = useCallback(() => {
    if (!ctxRef.current) return
    const ctx = ctxRef.current

    if (!readyRef.current && !loadingRef.current) {
      loadingRef.current = fetch(url, { cache: 'force-cache' })
        .then((r) => r.arrayBuffer())
        .then((buf) => ctx.decodeAudioData(buf))
        .then((decoded) => {
          bufRef.current = decoded
          readyRef.current = true
        })
        .finally(() => (loadingRef.current = null))
    }

    if (!readyRef.current || !bufRef.current) return

    const src = ctx.createBufferSource()
    src.buffer = bufRef.current
    src.connect(ctx.destination)
    src.start()
  }, [url])

  useEffect(() => {
    return () => {
      if (ctxRef.current) {
        ctxRef.current.close().catch((e) => console.error('Error closing AudioContext:', e))
      }
    }
  }, [])

  return { unlock, play }
}
