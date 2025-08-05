'use client'
import Image from 'next/image'
import { useTooltip } from '@/contexts/TooltipProvider'
import { motion } from 'framer-motion'

const contactLinks = [
  {
    name: 'rss',
    iconSrc: '/static/images/rss.svg',
    href: 'https://hiripple.com/feed.xml',
    tooltip: 'RSS',
  },
  {
    name: 'mail',
    iconSrc: '/static/images/mail.svg',
    href: 'mailto:me@hiripple.com',
    tooltip: 'me@hiripple.com',
  },
  {
    name: 'game',
    iconSrc: '/static/images/game.svg',
    href: 'https://steamcommunity.com/profiles/76561198218409829',
    tooltip: `Nintendo: SW-6702-3803-7997
PlayStation: Rippthegamer
Xbox: Ripple7772#9764
Steam: 258144101`,
  },
  {
    name: 'twitter',
    iconSrc: '/static/images/twitter.svg',
    href: 'https://x.com/Ripplethegamer_',
    tooltip: 'X（Twitter）',
  },
  {
    name: 'github',
    iconSrc: '/static/images/github.svg',
    href: 'https://github.com/CelestialRipple',
    tooltip: 'Github',
  },
  {
    name: 'Travelling',
    iconSrc: '/static/images/Travelling.svg',
    href: 'https://www.travellings.cn/coder-1024.html',
    tooltip: 'Travelling',
  },
]

export default function Footer() {
  const { showTooltip, hideTooltip } = useTooltip()

  const handleIconMouseEnter = (tooltipText: string) => (e: React.MouseEvent<HTMLElement>) => {
    showTooltip(tooltipText, e)
  }

  const footerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.3,
      },
    },
  }

  const lineVariants = {
    hidden: { scaleX: 0, transformOrigin: 'left' },
    visible: {
      scaleX: 1,
      transformOrigin: 'left',
      transition: {
        duration: 0.7,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  }

  return (
    <motion.div
      className="description-footer-wrapper relative mt-auto pt-8"
      variants={footerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.5 }}
    >
      {/* 分割线 */}
      <motion.div
        className="mx-auto mb-4 h-0.5 w-2/3 bg-[#6b7280] dark:bg-[#d1d5db]"
        variants={lineVariants}
      />

      <motion.div
        className="contact-links mb-2"
        variants={{
          visible: { transition: { staggerChildren: 0.1 } },
        }}
      >
        {contactLinks.map(({ name, iconSrc, href, tooltip }) => (
          <motion.a
            key={name}
            href={href ?? undefined}
            target="_blank"
            rel="noopener noreferrer"
            className={`contact-link ${!href ? 'disabled' : ''}`}
            onMouseEnter={handleIconMouseEnter(tooltip)}
            onMouseLeave={hideTooltip}
            variants={itemVariants}
          >
            <Image src={iconSrc} alt={name} width={24} height={24} />
          </motion.a>
        ))}
      </motion.div>

      <motion.div className="theme-footer -mt-2" variants={itemVariants}>
        BLOG MADE WITH&nbsp;
        <Image src="/static/images/love.gif" alt="love" width={14} height={14} unoptimized />
        &nbsp;GAMER © 2025
      </motion.div>
    </motion.div>
  )
}
