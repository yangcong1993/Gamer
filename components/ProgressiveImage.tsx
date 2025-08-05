'use client'
import Image, { type ImageProps as NextImageProps } from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'
import CanvasMosaicOverlay from './CanvasMosaicOverlay'

interface BaseProps {
  className?: string
  showCaption?: boolean
  mosaicSize?: number
}

type CustomImageProps = BaseProps &
  (
    | { width: number; height: number; fill?: never }
    | { width?: never; height?: never; fill: true }
  ) &
  Omit<NextImageProps, 'placeholder' | 'blurDataURL'>

const ProgressiveImage = ({
  alt,
  className = '',
  showCaption = true,
  src,
  width,
  height,
  fill,
  ...rest
}: CustomImageProps) => {
  const imageRef = useRef<HTMLDivElement>(null)
  const [isInView, setIsInView] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [isOverlayGone, setOverlayGone] = useState(false)
  const [imageNaturalDimensions, setImageNaturalDimensions] = useState<{
    width: number
    height: number
  } | null>(null)

  const getContainerDimensions = useCallback(() => {
    if (!imageRef.current) return null

    const containerWidth = imageRef.current.offsetWidth
    if (containerWidth === 0) return null // 确保容器有宽度

    if (fill) {
      return {
        width: containerWidth,
        height: imageRef.current.offsetHeight || containerWidth * 0.6,
      }
    }

    if (width && height) {
      const aspectRatio = height / width
      return {
        width: containerWidth,
        height: containerWidth * aspectRatio,
      }
    }

    if (imageNaturalDimensions) {
      const aspectRatio = imageNaturalDimensions.height / imageNaturalDimensions.width
      return {
        width: containerWidth,
        height: containerWidth * aspectRatio,
      }
    }

    return {
      width: containerWidth,
      height: containerWidth * (9 / 16),
    }
  }, [fill, width, height, imageNaturalDimensions])

  useEffect(() => {
    if (!imageRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.unobserve(entry.target)
        }
      },
      { rootMargin: '150px' }
    )

    observer.observe(imageRef.current)
    return () => observer.disconnect()
  }, [])

  const handleImageLoad = useCallback((event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget
    setImageNaturalDimensions({
      width: img.naturalWidth,
      height: img.naturalHeight,
    })
    setImageLoaded(true)
  }, [])

  const handleAnimationComplete = useCallback(() => {
    setOverlayGone(true)
  }, [])

  const containerStyle = useCallback(() => {
    if (imageLoaded || fill) {
      return {}
    }

    const dimensions = getContainerDimensions()
    if (!dimensions) return {}
    return {
      minHeight: dimensions.height,
    }
  }, [getContainerDimensions, fill, imageLoaded])

  return (
    <figure className="flex w-full flex-col items-center">
      <div ref={imageRef} className="relative w-full" style={containerStyle()}>
        {!isOverlayGone && (
          <div className="absolute inset-0 z-10">
            <CanvasMosaicOverlay
              rows={10}
              columns={15}
              isTriggered={imageLoaded}
              onAnimationComplete={handleAnimationComplete}
              expectedDimensions={getContainerDimensions()}
            />
          </div>
        )}

        {isInView && src && (
          <Image
            alt={alt}
            src={src}
            onLoad={handleImageLoad}
            className={`${className} transition-opacity duration-1000 ease-out`}
            style={{
              opacity: imageLoaded ? 1 : 0,
            }}
            width={width}
            height={height}
            fill={fill}
            {...rest}
          />
        )}
      </div>

      {showCaption && alt && (
        <figcaption className="text-muted mt-2 text-center text-sm">{alt}</figcaption>
      )}
    </figure>
  )
}

export default ProgressiveImage
