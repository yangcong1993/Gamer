'use client'
import React, { useRef, useState, useCallback, useEffect, useMemo } from 'react'
import {
  motion,
  useScroll,
  useMotionValue,
  useMotionValueEvent,
  animate,
  type MotionValue,
} from 'framer-motion'
import Image from 'next/image'
import CanvasMosaicOverlay from './CanvasMosaicOverlay'

// --- PROPS INTERFACE ---
interface GalleryProps {
  images: Array<{
    src: string
    alt?: string
    width?: number
    height?: number
  }>
  className?: string
  showCaption?: boolean
}

// --- HOOK for scroll mask effect ---
function useScrollOverflowMask(scrollXProgress: MotionValue<number>) {
  const left = '0%'
  const right = '100%'
  const leftInset = '20%'
  const rightInset = '80%'
  const transparent = 'rgba(0,0,0,0)'
  const opaque = 'rgba(0,0,0,1)'

  const maskImage = useMotionValue(
    `linear-gradient(90deg, ${opaque}, ${opaque} ${left}, ${opaque} ${rightInset}, ${transparent})`
  )

  useMotionValueEvent(scrollXProgress, 'change', (value) => {
    const prev = scrollXProgress.getPrevious()
    if (value === 0) {
      animate(
        maskImage,
        `linear-gradient(90deg, ${opaque}, ${opaque} ${left}, ${opaque} ${rightInset}, ${transparent})`
      )
    } else if (value === 1) {
      animate(
        maskImage,
        `linear-gradient(90deg, ${transparent}, ${opaque} ${leftInset}, ${opaque} ${right}, ${opaque})`
      )
    } else if (prev === 0 || prev === 1) {
      animate(
        maskImage,
        `linear-gradient(90deg, ${transparent}, ${opaque} ${leftInset}, ${opaque} ${rightInset}, ${transparent})`
      )
    }
  })

  return maskImage
}

const GalleryImage = React.memo(function GalleryImage({
  src,
  alt,
  width,
  height,
  index,
  onDimensionReady,
}: {
  src: string
  alt?: string
  width?: number
  height?: number
  index: number
  onDimensionReady: (index: number, dimensions: { width: number; height: number }) => void
}) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [isOverlayGone, setOverlayGone] = useState(false)
  const [naturalDimensions, setNaturalDimensions] = useState<{
    width: number
    height: number
  } | null>(null)

  const handleImageLoad = useCallback((event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget
    setNaturalDimensions({
      width: img.naturalWidth,
      height: img.naturalHeight,
    })
    setImageLoaded(true)
  }, [])

  const handleAnimationComplete = useCallback(() => {
    setOverlayGone(true)
  }, [])

  const displayDimensions = useMemo(() => {
    if (width && height) {
      return { width, height }
    }
    if (naturalDimensions) {
      const maxWidth = 800
      const maxHeight = 400
      const aspectRatio = naturalDimensions.width / naturalDimensions.height
      let calculatedWidth = maxWidth
      let calculatedHeight = calculatedWidth / aspectRatio

      if (calculatedHeight > maxHeight) {
        calculatedHeight = maxHeight
        calculatedWidth = calculatedHeight * aspectRatio
      }
      return { width: calculatedWidth, height: calculatedHeight }
    }
    return { width: 600, height: 337.5 }
  }, [width, height, naturalDimensions])

  useEffect(() => {
    onDimensionReady(index, displayDimensions)
  }, [displayDimensions, index, onDimensionReady])

  return (
    <motion.div
      className="relative flex-shrink-0 overflow-hidden"
      style={{
        width: displayDimensions.width,
        height: displayDimensions.height,
      }}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
    >
      {!isOverlayGone && (
        <div className="absolute inset-0 z-10">
          <CanvasMosaicOverlay
            rows={10}
            columns={15}
            isTriggered={imageLoaded}
            onAnimationComplete={handleAnimationComplete}
            expectedDimensions={displayDimensions}
          />
        </div>
      )}
      <Image
        src={src}
        alt={alt || `Image ${index + 1}`}
        fill
        className="object-contain transition-opacity duration-700 ease-out"
        style={{ opacity: imageLoaded ? 1 : 0 }}
        onLoad={handleImageLoad}
        sizes={`(max-width: 768px) 90vw, ${displayDimensions.width}px`}
      />
    </motion.div>
  )
})
GalleryImage.displayName = 'GalleryImage'

const Gallery = ({ images, className = '', showCaption = true }: GalleryProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollXProgress } = useScroll({ container: containerRef })
  const maskImage = useScrollOverflowMask(scrollXProgress)

  const [currentIndex, setCurrentIndex] = useState(0)
  const [activeHeight, setActiveHeight] = useState<number | 'auto'>('auto')
  const heightsRef = useRef<Record<number, number>>({})

  const handleDimensionReady = useCallback(
    (index: number, dimensions: { width: number; height: number }) => {
      heightsRef.current[index] = dimensions.height
      if (index === 0) {
        setActiveHeight(dimensions.height)
      }
    },
    [] // 空依赖数组是正确的，因为此回调的逻辑不依赖于任何 props 或 state
  )

  useMotionValueEvent(scrollXProgress, 'change', (latest) => {
    const newIndex = Math.round(latest * (images.length - 1))
    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex)
    }
  })

  useEffect(() => {
    const newHeight = heightsRef.current[currentIndex]
    if (newHeight) {
      setActiveHeight(newHeight)
    }
  }, [currentIndex])

  if (!images || images.length === 0) {
    return null
  }

  const handleDotClick = (index: number) => {
    const container = containerRef.current
    if (!container) return
    const scrollWidth = container.scrollWidth - container.clientWidth
    const targetScrollLeft = images.length > 1 ? (scrollWidth * index) / (images.length - 1) : 0
    container.scrollTo({ left: targetScrollLeft, behavior: 'smooth' })
  }

  const currentAltText = images[currentIndex]?.alt

  return (
    <figure className={`my-6 flex w-full flex-col items-center ${className}`}>
      <div className="relative w-full">
        <div className="absolute top-4 left-4 z-20 rounded bg-black/50 px-2 py-1 text-sm text-white">
          {currentIndex + 1} / {images.length}
        </div>

        <motion.div
          ref={containerRef}
          className="no-scrollbar flex gap-4 overflow-x-auto overflow-y-hidden"
          style={{
            maskImage,
            WebkitMaskImage: maskImage,
            height: typeof activeHeight === 'number' ? `${activeHeight + 16}px` : 'auto',
            transition: 'height 300ms ease-in-out',
          }}
        >
          {images.map((image, index) => (
            <GalleryImage
              key={index}
              {...image}
              index={index}
              onDimensionReady={handleDimensionReady}
            />
          ))}
        </motion.div>

        <div className="mt-4 flex justify-center gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              aria-label={`Go to image ${index + 1}`}
              onClick={() => handleDotClick(index)}
              className={`h-2 w-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'scale-125 bg-[#793EC3]'
                  : 'bg-gray-300 hover:bg-gray-400 dark:bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>

      {showCaption && (
        <figcaption className="mt-3 min-h-[1.25rem] px-4 text-center text-sm text-gray-600 dark:text-gray-400">
          {currentAltText}
        </figcaption>
      )}
    </figure>
  )
}

export default Gallery
