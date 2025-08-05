// components/RouteTransition.tsx
'use client'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, ReactNode, useCallback } from 'react'

type Props = { children: ReactNode }

export default function RouteTransition({ children }: Props) {
  const pathname = usePathname()
  const fromRef = useRef<HTMLDivElement>(null)
  const toRef = useRef<HTMLDivElement>(null)
  const fromRectRef = useRef<DOMRect | null>(null)
  const toRectRef = useRef<DOMRect | null>(null)

  const animateLeave = useCallback((el: HTMLElement, done: () => void) => {
    if (!fromRectRef.current || !toRectRef.current) return

    const d = delta(fromRectRef.current, toRectRef.current)
    el.style.transition = 'transform 1.3s ease, opacity 1.3s ease'
    el.style.transform = `
      translate(${d.x}px, ${d.y}px)
      scale(${d.sx}, ${d.sy})
      rotateX(180deg) rotateZ(-180deg)
    `
    el.style.opacity = '0'
    el.addEventListener('transitionend', (e) => e.propertyName === 'transform' && done(), {
      once: true,
    })
  }, [])

  const animateEnter = useCallback((el: HTMLElement, done: () => void) => {
    if (!fromRectRef.current || !toRectRef.current) return

    const d = delta(toRectRef.current, fromRectRef.current)
    el.style.transition = 'none'
    el.style.transform = `
      translate(${d.x}px, ${d.y}px)
      scale(${d.sx}, ${d.sy})
      rotateX(-180deg) rotateZ(-180deg)
    `
    el.style.opacity = '0'
    requestAnimationFrame(() => {
      el.style.transition = 'transform 1.3s ease, opacity 1.3s ease'
      el.style.transform = ''
      el.style.opacity = '1'
      el.addEventListener('transitionend', (e) => e.propertyName === 'transform' && done(), {
        once: true,
      })
    })
  }, [])

  useEffect(() => {
    const wrapper = fromRef.current
    const newPage = toRef.current

    if (!wrapper || !newPage) return
    fromRectRef.current = wrapper.getBoundingClientRect()
    requestAnimationFrame(() => {
      newPage.style.visibility = 'hidden'
      document.body.appendChild(newPage)
      toRectRef.current = newPage.getBoundingClientRect()
      document.body.removeChild(newPage)
      newPage.style.visibility = ''

      animateLeave(wrapper, () => {
        // 4. 再进场
        animateEnter(newPage, () => {
          // 5. 清理
          wrapper.style.transition = ''
          newPage.style.transition = ''
        })
      })
    })
  }, [pathname, animateEnter, animateLeave])

  function delta(a: DOMRect, b: DOMRect) {
    return {
      x: b.left - a.left,
      y: b.top - a.top,
      sx: b.width / a.width,
      sy: b.height / a.height,
    }
  }

  return (
    <div className="route-transition-container">
      <div className="route-transition-wrapper" ref={fromRef}>
        <div key={pathname} ref={toRef}>
          {children}
        </div>
      </div>
    </div>
  )
}
