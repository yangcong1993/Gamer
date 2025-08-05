// /lib/useFloatingSword.ts

import { useLayoutEffect, useRef } from 'react'

/**
 * @param {boolean} [enabled=true] - Hook 的总开关。
 * @param {boolean} [followMouse=true] - 控制元素是否跟随鼠标指针。
 * @returns {React.RefObject<HTMLElement | null>} - 一个 ref 对象。
 */
export default function useFloatingSword(
  enabled: boolean = true,
  followMouse: boolean = true
): React.RefObject<HTMLDivElement | null> {
  const ref = useRef<HTMLDivElement | null>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return

    if (!enabled) {
      el.style.transform = ''
      return
    }

    const MAX_SHIFT = 100
    const MOUSE_LERP_K = 0.04
    const BOB_AMP = 3
    const BOB_FREQ = 1

    const MASS = 40
    const STIFFNESS = 0.05
    const DAMPING = 1

    let targetX = 0,
      targetY = 0
    let currentX = 0,
      currentY = 0

    let inertiaX = 0,
      inertiaY = 0
    let velocityX = 0,
      velocityY = 0
    let lastScreenX = window.screenX,
      lastScreenY = window.screenY

    let mainRafId = 0,
      physicsRafId = 0
    const startTime = performance.now()

    const loop = () => {
      const elapsed = performance.now() - startTime
      const bobbingY = BOB_AMP * Math.sin((elapsed / 1000) * BOB_FREQ * Math.PI)

      if (followMouse) {
        currentX += (targetX - currentX) * MOUSE_LERP_K
        currentY += (targetY - currentY) * MOUSE_LERP_K
      } else {
        currentX += (0 - currentX) * MOUSE_LERP_K
        currentY += (0 - currentY) * MOUSE_LERP_K
      }

      el.style.transform = `translate(
        ${currentX + inertiaX}px, 
        ${currentY + bobbingY + inertiaY}px
      )`

      mainRafId = requestAnimationFrame(loop)
    }

    const physicsLoop = () => {
      const { screenX, screenY } = window
      const deltaX = screenX - lastScreenX
      const deltaY = screenY - lastScreenY

      const springForceX = -STIFFNESS * inertiaX
      const springForceY = -STIFFNESS * inertiaY

      const dampingForceX = -DAMPING * velocityX
      const dampingForceY = -DAMPING * velocityY

      const accelX = (springForceX + dampingForceX) / MASS
      const accelY = (springForceY + dampingForceY) / MASS

      velocityX += accelX
      velocityY += accelY

      velocityX -= deltaX / MASS
      velocityY -= deltaY / MASS

      inertiaX += velocityX
      inertiaY += velocityY

      lastScreenX = screenX
      lastScreenY = screenY

      physicsRafId = requestAnimationFrame(physicsLoop)
    }

    const handlePointerMove = (e: PointerEvent) => {
      if (followMouse) {
        const normalizedX = (e.clientX / window.innerWidth) * 2 - 1
        const normalizedY = (e.clientY / window.innerHeight) * 2 - 1
        targetX = normalizedX * MAX_SHIFT
        targetY = normalizedY * MAX_SHIFT
      }
    }

    const handlePointerLeave = () => {
      targetX = 0
      targetY = 0
    }

    if (!followMouse) {
      targetX = 0
      targetY = 0
    }

    mainRafId = requestAnimationFrame(loop)
    physicsRafId = requestAnimationFrame(physicsLoop)

    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    document.addEventListener('mouseleave', handlePointerLeave)

    return () => {
      cancelAnimationFrame(mainRafId)
      cancelAnimationFrame(physicsRafId)
      window.removeEventListener('pointermove', handlePointerMove)
      document.removeEventListener('mouseleave', handlePointerLeave)
    }
  }, [enabled, followMouse])

  return ref
}
