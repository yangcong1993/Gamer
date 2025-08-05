// components/MDXComponents.tsx
import { lazy, Suspense } from 'react'
import TOCInline from 'pliny/ui/TOCInline'
import BlogNewsletterForm from 'pliny/ui/BlogNewsletterForm'
import type { MDXComponents } from 'mdx/types'
import CustomLink from './Link'
import TableWrapper from './TableWrapper'
import type { LivePhotoProps } from './LivePhotoWrapper'
import { DividerLarge, DividerSmall } from './CustomDivider'
const LazyGallery = lazy(() => import('@/components/Gallery'))
const LazyProgressiveImage = lazy(() => import('./ProgressiveImage'))
const LazyLivePhotoWrapper = lazy(() => import('./LivePhotoWrapper'))
const LazyVideoPlayer = lazy(() => import('@/components/RetroVideoPlayer'))
const LazyAudioPlayer = lazy(() => import('@/components/RetroAudioPlayer'))
const LazyHanddrawnPre = lazy(() => import('./HanddrawnPre'))
const LoadingPlaceholder = ({ type = '内容' }) => (
  <div className="my-4 flex min-h-[100px] w-full items-center justify-center rounded-lg bg-gray-100 p-4 text-sm text-gray-400 dark:bg-gray-800 dark:text-gray-500">
    {type}加载中...
  </div>
)

export const components: MDXComponents = {
  Image: ({ ...props }) => {
    const isLivePhoto =
      props.src?.includes('.mov') || props.src?.includes('.heic') || props['data-live-photo']

    if (isLivePhoto) {
      return (
        <div className="relative my-6">
          <Suspense fallback={<LoadingPlaceholder type="实时照片" />}>
            <LazyLivePhotoWrapper
              photoSrc={props.src?.replace('.mov', '.jpg') || props.src}
              videoSrc={props.src}
              className="rounded-lg"
              alt={props.alt || 'Live Photo'}
            />
          </Suspense>
        </div>
      )
    }

    // 普通图片...
    return (
      <div className="relative my-6 lg:aspect-auto">
        <Suspense fallback={<LoadingPlaceholder type="图片" />}>
          <LazyProgressiveImage
            src={props.src}
            alt={props.alt || ''}
            className="object-contain"
            width={props.width ?? 800}
            height={props.height ?? 600}
          />
        </Suspense>
      </div>
    )
  },

  LivePhoto: (props) => (
    <div className="relative my-6">
      <Suspense fallback={<LoadingPlaceholder type="实时照片" />}>
        <LazyLivePhotoWrapper {...(props as LivePhotoProps)} />
      </Suspense>
    </div>
  ),

  VideoPlayer: (props) => (
    <Suspense fallback={<LoadingPlaceholder type="视频播放器" />}>
      <LazyVideoPlayer {...props} />
    </Suspense>
  ),
  AudioPlayer: (props) => (
    <Suspense fallback={<LoadingPlaceholder type="音频播放器" />}>
      <LazyAudioPlayer {...props} />
    </Suspense>
  ),
  TOCInline,
  a: CustomLink,
  pre: (props) => (
    <Suspense fallback={<pre>{props.children}</pre>}>
      <LazyHanddrawnPre {...props} />
    </Suspense>
  ),
  table: TableWrapper,
  BlogNewsletterForm,
  Gallery: (props) => (
    <Suspense fallback={<LoadingPlaceholder type="图库" />}>
      <LazyGallery {...props} />
    </Suspense>
  ),
  DividerLarge,
  DividerSmall,
}
