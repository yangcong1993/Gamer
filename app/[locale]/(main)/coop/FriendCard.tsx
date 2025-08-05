// file: app/[locale]/(main)/friends/FriendCard.tsx

'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import type { Friend } from './data'

function RankIndicator({ rank }: { rank: number }) {
  const TOTAL = 10
  return (
    <div className="relative mt-auto flex h-8 w-full items-end justify-between overflow-visible rounded bg-purple-600 px-2">
      <span className="flex items-baseline gap-1.5 pb-1 text-white">
        <span className="text-base font-bold">Rank</span>
        <span className="relative -top-3 text-5xl leading-none font-bold">{rank}</span>
      </span>

      <div className="flex min-w-0 flex-1 items-center gap-1.5 pb-2 pl-4">
        {Array.from({ length: TOTAL }).map((_, idx) => (
          <span
            key={idx}
            className={`h-2.5 max-w-[24px] flex-1 rounded-full border border-white ${
              idx < rank ? 'bg-white' : 'bg-purple-800'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

export default function FriendCard({ friend }: { friend: Friend }) {
  return (
    <motion.a
      href={friend.href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-col gap-4 rounded-lg border-2 border-purple-500 bg-gray-900 p-4 transition-transform duration-300 ease-in-out hover:scale-105 hover:border-purple-400"
      initial={{ y: 50, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
    >
      <div className="flex items-start gap-4">
        <Image
          src={friend.avatar}
          alt={`${friend.name} avatar`}
          width={64}
          height={64}
          className="h-16 w-16 flex-shrink-0 rounded-full object-cover"
        />
        <div className="flex flex-1 flex-col">
          <h4 className="text-lg font-bold text-purple-400">{friend.name}</h4>
          <p className="mt-1 line-clamp-3 min-h-[60px] text-sm text-purple-500">
            {friend.description}
          </p>
        </div>
      </div>
      <RankIndicator rank={friend.rank} />
    </motion.a>
  )
}
