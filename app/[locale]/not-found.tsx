import Link from 'next/link'
import Image from 'next/image'
import '@/css/404-styles.css'

export default function NotFound() {
  return (
    <div className="not-found-fullscreen-container">
      <Image
        src="/static/images/404.png"
        alt="404 Not Found"
        fill
        style={{ objectFit: 'contain' }}
        priority
      />
      <Link href="/" className="return-link-overlay">
        Return
      </Link>
    </div>
  )
}
