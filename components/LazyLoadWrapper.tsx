// file: components/LazyLoadWrapper.tsx
'use client'

import { useState, useRef, useEffect, type ReactNode } from 'react'

interface LazyLoadWrapperProps {
  children: ReactNode
  //
  placeholderHeight?: string | number
}

const LazyLoadWrapper = ({ children, placeholderHeight = '50vh' }: LazyLoadWrapperProps) => {
  const [isInView, setIsInView] = useState(false)
  const observerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsInView(true)
          if (observerRef.current) {
            observer.unobserve(observerRef.current)
          }
        }
      },
      {
        rootMargin: '200px',
      }
    )

    const currentObserverRef = observerRef.current

    if (currentObserverRef) {
      observer.observe(currentObserverRef)
    }

    return () => {
      if (currentObserverRef) {
        observer.unobserve(currentObserverRef)
      }
      observer.disconnect()
    }
  }, [])

  return (
    <div ref={observerRef} style={{ minHeight: !isInView ? placeholderHeight : undefined }}>
      {isInView ? children : null}
    </div>
  )
}

export default LazyLoadWrapper
