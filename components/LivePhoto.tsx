// file: components/LivePhoto.tsx
'use-client'

import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'

const LIVEPHOTOSKIT_SRC = 'https://cdn.apple-livephotoskit.com/lpk/1/livephotoskit.js'

declare global {
  interface Window {
    LivePhotosKit: {
      augmentElementAsPlayer: (
        element: HTMLDivElement,
        options: { photoSrc: string; videoSrc: string; playbackStyle?: string }
      ) => void
    }
  }
}

interface LivePhotoProps {
  photoSrc: string
  videoSrc: string
  alt?: string
  className?: string
  style?: CSSProperties
  aspectRatio?: string
}

const LivePhoto = ({
  photoSrc,
  videoSrc,
  alt,
  className = '',
  style = {},
  aspectRatio = '4 / 3',
}: LivePhotoProps) => {
  const playerRef = useRef<HTMLDivElement>(null)
  const [isIntersecting, setIsIntersecting] = useState(false)
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true)
          if (playerRef.current) {
            observer.unobserve(playerRef.current)
          }
        }
      },
      {
        rootMargin: '200px',
      }
    )

    if (playerRef.current) {
      observer.observe(playerRef.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [])
  useEffect(() => {
    if (!isIntersecting || !playerRef.current) {
      return
    }

    const element = playerRef.current
    element.setAttribute('data-photo-src', photoSrc)
    element.setAttribute('data-video-src', videoSrc)

    let isMounted = true

    const initializePlayer = () => {
      if (!isMounted || !element || typeof window.LivePhotosKit === 'undefined') {
        return
      }
      window.LivePhotosKit.augmentElementAsPlayer(element, {
        photoSrc: photoSrc,
        videoSrc: videoSrc,
      })
    }

    loadScript().then((loaded) => {
      if (loaded && isMounted) {
        initializePlayer()
      }
    })

    return () => {
      isMounted = false
    }
  }, [isIntersecting, photoSrc, videoSrc])

  return (
    <div className="group relative w-full">
      <div
        ref={playerRef}
        className={`live-photo-container w-full ${className}`}
        style={{
          width: '100%',
          height: '75vh',
          ...style,
        }}
        data-live-photo
        aria-label={alt || 'Live Photo'}
      />
    </div>
  )
}

let scriptLoaded = false
let scriptLoading = false
let scriptLoadCallbacks: ((value: unknown) => void)[] = []

const loadScript = () => {
  if (scriptLoaded) {
    return Promise.resolve(true)
  }

  if (scriptLoading) {
    return new Promise((resolve) => {
      scriptLoadCallbacks.push(resolve)
    })
  }

  scriptLoading = true

  return new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = LIVEPHOTOSKIT_SRC
    script.async = true

    script.onload = () => {
      scriptLoaded = true
      scriptLoading = false
      resolve(true)
      scriptLoadCallbacks.forEach((callback) => callback(true))
      scriptLoadCallbacks = []
    }

    script.onerror = () => {
      console.error('Failed to load LivePhotosKit script.')
      scriptLoading = false
      resolve(false)
    }

    document.body.appendChild(script)
  })
}

export default LivePhoto
