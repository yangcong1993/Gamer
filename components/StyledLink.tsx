// ./components/StyledLink.tsx

'use-client'

import React from 'react'
import Link, { LinkProps } from 'next/link'
import { useClickFeedback } from '@/contexts/ClickFeedbackProvider'
import { format } from 'url'

type StyledLinkProps = Omit<React.ComponentPropsWithoutRef<'a'>, keyof LinkProps> &
  LinkProps & {
    onSoundClick?: () => void
  }

export default function StyledLink({
  children,
  className,
  prefetch = true,
  onSoundClick,
  ...props
}: StyledLinkProps) {
  const { clickedHref, setClickedHref } = useClickFeedback()

  const hrefAsString =
    typeof props.href === 'object' && props.href !== null ? format(props.href) : props.href

  const isClicked = clickedHref === hrefAsString

  const handleClick: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
    onSoundClick?.()
    props.onClick?.(e)
    if (hrefAsString) {
      setClickedHref(hrefAsString)
    }
  }

  return (
    <Link
      {...props}
      prefetch={prefetch}
      onClick={handleClick}
      className={`${className ?? ''} ${isClicked ? 'link-is-loading' : ''}`}
    >
      {children}
    </Link>
  )
}
