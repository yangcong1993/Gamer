// components/HanddrawnPre.tsx
import { ReactNode, ComponentProps } from 'react'

type HanddrawnPreProps = ComponentProps<'pre'>

const HanddrawnPre = ({ children, className = '', ...props }: HanddrawnPreProps) => {
  return (
    <div className="relative my-6">
      <div
        className="relative rounded-xl p-3"
        style={{
          background: 'transparent',
          border: '4px solid #52288C',
          borderRadius: '16px',
          borderImage: 'none',
          filter: 'drop-shadow(0 2px 8px rgba(139, 92, 246, 0.15))',
        }}
      >
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          style={{
            zIndex: 10,
            overflow: 'hidden',
          }}
        >
          <defs>
            <filter id="roughPaper" x="0%" y="0%" width="100%" height="100%">
              <feTurbulence result="noise" baseFrequency="0.04" numOctaves="3" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="1" />
            </filter>
          </defs>
          <circle cx="10" cy="10" r="2" fill="#8b5cf6" opacity="0.6" />
          <circle cx="calc(100% - 10px)" cy="10" r="2" fill="#8b5cf6" opacity="0.6" />
          <circle cx="10" cy="calc(100% - 10px)" r="2" fill="#8b5cf6" opacity="0.6" />
          <circle
            cx="calc(100% - 10px)"
            cy="calc(100% - 10px)"
            r="2"
            fill="#8b5cf6"
            opacity="0.6"
          />
          <circle cx="30" cy="20" r="1" fill="#8b5cf6" opacity="0.3" />
          <circle cx="calc(100% - 30px)" cy="calc(100% - 20px)" r="1" fill="#8b5cf6" opacity="1" />
        </svg>
        <pre
          className={`relative overflow-x-auto rounded-lg p-4 ${className}`}
          style={{
            zIndex: 1,
            margin: 0,
          }}
          {...props}
        >
          {children}
        </pre>
      </div>
    </div>
  )
}

export default HanddrawnPre
