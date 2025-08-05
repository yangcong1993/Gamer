'use client'

import { useState, useEffect, useRef } from 'react'

const FOOTPRINT_INTERVAL_DISTANCE = 30 // 脚印间隔
const FOOTPRINT_LIFESPAN = 2000 // 脚印生命周期 (2秒)

interface Footprint {
  id: number
  x: number
  y: number
  rotation: number
  isLeft: boolean
  createdAt: number
}

interface FootprintsProps {
  characterPosition: { x: number; y: number }
  isWalking: boolean
  direction: 'up' | 'down' | 'left' | 'right'
  isActive: boolean
}

const Footprints: React.FC<FootprintsProps> = ({
  characterPosition,
  isWalking,
  direction,
  isActive,
}) => {
  const [footprints, setFootprints] = useState<Footprint[]>([])
  const footprintId = useRef(0)
  const lastFootprintPos = useRef(characterPosition)
  const isLeftFoot = useRef(true)

  useEffect(() => {
    if (!isActive) {
      setFootprints([])
      lastFootprintPos.current = characterPosition
    }
  }, [isActive, characterPosition])

  useEffect(() => {
    if (!isWalking || !isActive) return

    const currentPos = characterPosition
    const lastPos = lastFootprintPos.current
    const distance = Math.hypot(currentPos.x - lastPos.x, currentPos.y - lastPos.y)

    if (distance > FOOTPRINT_INTERVAL_DISTANCE) {
      let baseRotation = 0
      switch (direction) {
        case 'up':
          baseRotation = 0
          break
        case 'down':
          baseRotation = 180
          break
        case 'left':
          baseRotation = -90
          break
        case 'right':
          baseRotation = 90
          break
      }
      const randomRotation = baseRotation + (Math.random() - 0.5) * 30
      const sideOffset = isLeftFoot.current ? -8 : 8
      let footX = currentPos.x + 24
      let footY = currentPos.y + 48
      if (direction === 'left' || direction === 'right') {
        footY += sideOffset
      } else {
        footX += sideOffset
      }

      const newFootprint: Footprint = {
        id: footprintId.current++,
        x: footX,
        y: footY,
        rotation: randomRotation,
        isLeft: isLeftFoot.current,
        createdAt: Date.now(),
      }

      setFootprints((prev) => [...prev, newFootprint])
      lastFootprintPos.current = currentPos
      isLeftFoot.current = !isLeftFoot.current
    }
  }, [characterPosition, isWalking, direction, isActive])

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      setFootprints((prev) => prev.filter((fp) => now - fp.createdAt < FOOTPRINT_LIFESPAN))
    }, 500)

    return () => clearInterval(interval)
  }, [])

  return (
    <>
      {footprints.map((footprint) => {
        const age = Date.now() - footprint.createdAt
        const opacity = Math.max(0, 1 - age / FOOTPRINT_LIFESPAN)

        return (
          <div
            key={footprint.id}
            className="footprint"
            style={{
              opacity: opacity,
              transform: `translate3d(${footprint.x}px, ${footprint.y}px, 0) rotate(${footprint.rotation}deg)`,
            }}
          />
        )
      })}
    </>
  )
}

export default Footprints
