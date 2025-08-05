// file: components/LoadingOverlay.tsx

import Image from 'next/image'

const LoadingOverlay = () => {
  return (
    <div
      className="loading-overlay-background absolute inset-0 z-50 flex items-center justify-center"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex flex-col items-center justify-center">
        <Image
          src="/static/images/loading.gif"
          alt="Loading..."
          width={96}
          height={96}
          unoptimized={true}
          priority={true}
        />
        <p className="mt-4 text-sm text-[color:var(--text-primary)]">Loading...</p>
      </div>
    </div>
  )
}

export default LoadingOverlay
