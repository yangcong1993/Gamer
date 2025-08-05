'use client'

import Image from './Image'

/**
 * 样式一：带有交错线段的大分割线
 */
export const DividerLarge = () => (
  <div className="flex w-full items-center py-8" aria-hidden="true">
    <Image
      src="/static/images/left.avif"
      alt=""
      width={732}
      height={289}
      className="pointer-events-none h-auto w-24 shrink-0 md:w-40"
      onContextMenu={(e) => e.preventDefault()}
    />
    <div className="flex grow items-center gap-1 px-1">
      <div className="h-[3px] grow bg-[rgb(45,56,45)]"></div>
      <div className="h-[3px] grow translate-y-1 bg-[rgb(45,57,47)]"></div>
      <div className="h-[3px] grow bg-[rgb(45,56,45)]"></div>
      <div className="hidden h-[3px] grow translate-y-1 bg-[rgb(45,57,47)] md:block"></div>
      <div className="hidden h-[3px] grow bg-[rgb(45,56,45)] md:block"></div>
    </div>
    <Image
      src="/static/images/right.avif"
      alt=""
      width={738}
      height={289}
      className="pointer-events-none h-auto w-24 shrink-0 md:w-40"
      onContextMenu={(e) => e.preventDefault()}
    />
  </div>
)

/**
 * 样式二：只有左右两端图片的小分割线
 */
export const DividerSmall = () => (
  <div className="flex w-full items-center justify-between py-4" aria-hidden="true">
    <Image
      src="/static/images/left2.avif"
      alt=""
      width={300}
      height={60}
      className="pointer-events-none h-auto w-32 shrink-0 md:w-56"
      onContextMenu={(e) => e.preventDefault()}
    />
    <Image
      src="/static/images/right2.avif"
      alt=""
      width={300}
      height={60}
      className="pointer-events-none h-auto w-32 shrink-0 md:w-56"
      onContextMenu={(e) => e.preventDefault()}
    />
  </div>
)
