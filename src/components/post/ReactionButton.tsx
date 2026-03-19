'use client'

import { useState, useTransition } from 'react'
import { toggleReaction } from '@/app/actions/reactions'
import type { ReactionType } from '@/types'

const REACTIONS: { type: ReactionType; label: string; emoji: string }[] = [
  { type: 'wakaru', label: 'わかる', emoji: '💡' },
  { type: 'omoshiroi', label: '面白い', emoji: '✨' },
  { type: 'ki_ni_naru', label: '気になる', emoji: '🔍' },
]

interface ReactionButtonsProps {
  postId: string
  counts: Record<ReactionType, number>
  userReactions: ReactionType[]
  isLoggedIn: boolean
  isDiary?: boolean
}

export default function ReactionButtons({
  postId,
  counts: initialCounts,
  userReactions: initialUserReactions,
  isLoggedIn,
  isDiary = false,
}: ReactionButtonsProps) {
  // 日記モードでは「面白い」を非表示にする
  const visibleReactions = isDiary
    ? REACTIONS.filter(r => r.type !== 'omoshiroi')
    : REACTIONS
  const [counts, setCounts] = useState(initialCounts)
  const [userReactions, setUserReactions] = useState(initialUserReactions)
  const [isPending, startTransition] = useTransition()

  const handleToggle = (type: ReactionType) => {
    if (!isLoggedIn || isPending) return

    const hasReaction = userReactions.includes(type)
    setCounts(prev => ({
      ...prev,
      [type]: hasReaction ? prev[type] - 1 : prev[type] + 1,
    }))
    setUserReactions(prev =>
      hasReaction ? prev.filter(r => r !== type) : [...prev, type]
    )

    startTransition(async () => {
      await toggleReaction(postId, type)
    })
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {visibleReactions.map(({ type, label, emoji }) => {
        const active = userReactions.includes(type)
        return (
          <button
            key={type}
            onClick={() => handleToggle(type)}
            disabled={!isLoggedIn || isPending}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium transition-all border
              ${active
                ? 'border-indigo-400 bg-indigo-50 text-indigo-700'
                : 'border-gray-200 bg-white text-gray-600 hover:border-indigo-300 hover:bg-indigo-50'
              }
              ${!isLoggedIn ? 'cursor-default opacity-80' : 'cursor-pointer'}
            `}
          >
            <span>{emoji}</span>
            <span>{label}</span>
            <span className="font-mono text-xs ml-0.5">{counts[type]}</span>
          </button>
        )
      })}
    </div>
  )
}
