'use client'
import { useEffect, useRef } from 'react'

const shuffle = <T,>(array: T[]): T[] => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

interface Block {
  x: number
  y: number
  blockWidth: number
  blockHeight: number
}

interface CanvasMosaicOverlayProps {
  rows?: number
  columns?: number
  isTriggered: boolean
  onAnimationComplete: () => void
  expectedDimensions?: { width: number; height: number } | null
}

const CanvasMosaicOverlay = ({
  rows = 15,
  columns = 15,
  isTriggered,
  onAnimationComplete,
  expectedDimensions,
}: CanvasMosaicOverlayProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameId = useRef<number | null>(null)
  const blocksRef = useRef<Block[]>([])
  const hasInitialDraw = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const drawMosaic = (width: number, height: number) => {
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const dpr = window.devicePixelRatio || 1
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.scale(dpr, dpr)

      const blockWidth = Math.floor(width / columns)
      const blockHeight = Math.floor(height / rows)

      const localBlocks: Block[] = []
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
          const shade = Math.floor(Math.random() * 80) + 20
          ctx.fillStyle = `rgb(${shade}, ${shade}, ${shade})`
          const x = c * blockWidth
          const y = r * blockHeight
          ctx.fillRect(x, y, blockWidth + 1, blockHeight + 1)
          localBlocks.push({ x, y, blockWidth, blockHeight })
        }
      }
      blocksRef.current = localBlocks
      hasInitialDraw.current = true
    }

    // 如果有预期尺寸，立即绘制马赛克
    if (expectedDimensions && !hasInitialDraw.current) {
      drawMosaic(expectedDimensions.width, expectedDimensions.height)
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry) {
        const { width, height } = entry.contentRect
        if (width > 0 && height > 0) {
          const currentWidth = canvas.width / (window.devicePixelRatio || 1)
          const currentHeight = canvas.height / (window.devicePixelRatio || 1)

          if (Math.abs(currentWidth - width) > 5 || Math.abs(currentHeight - height) > 5) {
            drawMosaic(width, height)
          }
        }
      }
    })

    observer.observe(canvas)
    return () => observer.disconnect()
  }, [rows, columns, expectedDimensions])

  useEffect(() => {
    if (!isTriggered) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    if (blocksRef.current.length === 0) {
      onAnimationComplete()
      return
    }

    const shuffledBlocks = shuffle([...blocksRef.current])
    const blocksToClearPerFrame = Math.max(1, Math.floor(shuffledBlocks.length / 30))

    const animate = () => {
      if (shuffledBlocks.length === 0) {
        if (animationFrameId.current) {
          cancelAnimationFrame(animationFrameId.current)
        }
        onAnimationComplete()
        return
      }

      for (let i = 0; i < blocksToClearPerFrame && shuffledBlocks.length > 0; i++) {
        const block = shuffledBlocks.pop()
        if (block) {
          ctx.clearRect(block.x, block.y, block.blockWidth, block.blockHeight)
        }
      }

      animationFrameId.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }
    }
  }, [isTriggered, onAnimationComplete])

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
}

export default CanvasMosaicOverlay
