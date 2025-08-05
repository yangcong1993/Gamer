// file: components/PhotoSwipeLightbox.tsx
'use client'

import { useEffect } from 'react'
import PhotoSwipe from 'photoswipe'
import 'photoswipe/dist/photoswipe.css'

export default function PhotoSwipeLightbox({ galleryID }) {
  useEffect(() => {
    let lightbox: PhotoSwipe | null = null
    const galleryContainer = document.querySelector(galleryID)
    if (!galleryContainer) {
      return
    }
    const handleClick = (e: Event) => {
      const target = e.target as HTMLElement
      if (target.tagName !== 'IMG') {
        return
      }
      e.preventDefault()
      const allImages = Array.from(galleryContainer.querySelectorAll('img')) as HTMLImageElement[]
      const clickedIndex = allImages.findIndex((img) => img === target)

      const dataSource = allImages.map((img: HTMLImageElement) => {
        const width = img.naturalWidth || Number(img.getAttribute('width')) || 1024
        const height = img.naturalHeight || Number(img.getAttribute('height')) || 768
        const title = img.getAttribute('alt') || 'Image'
        const description = img.getAttribute('data-description') || ''

        return {
          src: img.src,
          w: width,
          h: height,
          alt: title,
        }
      })

      if (lightbox) {
        lightbox.destroy()
      }
      lightbox = new PhotoSwipe({
        dataSource: dataSource,
        index: clickedIndex,
        showHideAnimationType: 'fade',
        bgOpacity: 0.9,
      })

      lightbox.on('uiRegister', function () {
        lightbox!.ui!.registerElement({
          name: 'custom-caption',
          order: 9,
          isButton: false,
          appendTo: 'root',
          html: '',
          onInit: (el, pswp) => {
            pswp.on('change', () => {
              const currSlide = pswp.currSlide?.data
              el.innerHTML = currSlide?.html || ''
            })
          },
        })
      })

      lightbox.init()
    }
    galleryContainer.addEventListener('click', handleClick)
    return () => {
      galleryContainer.removeEventListener('click', handleClick)
      if (lightbox) {
        lightbox.destroy()
        lightbox = null
      }
    }
  }, [galleryID])

  return null
}
