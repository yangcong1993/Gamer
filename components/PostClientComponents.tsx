// app/components/PostClientComponents.tsx
'use client'

import dynamic from 'next/dynamic'
import siteMetadata from '@/data/siteMetadata'
const CommentSection = dynamic(() => import('@/components/CommentSection'), {
  ssr: false,
  loading: () => <div className="p-8 text-center">加载评论中...</div>,
})
const PhotoSwipeLightbox = dynamic(() => import('@/components/PhotoSwipeLightbox'), { ssr: false })

interface Props {
  slug: string
}

export default function PostClientComponents({ slug }: Props) {
  return (
    <>
      <div id="comment" className="pt-6 pb-8 text-center text-gray-700 dark:text-gray-300">
        <CommentSection postSlug={slug} />
      </div>
      <PhotoSwipeLightbox galleryID="#post-content" />
    </>
  )
}
