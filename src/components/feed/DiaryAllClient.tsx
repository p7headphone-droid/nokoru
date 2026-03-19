'use client'

import { useState } from 'react'
import PostCard from '@/components/post/PostCard'
import type { Post } from '@/types'

type MoodFilter = 'all' | 'happy' | 'sad' | 'positive'

const MOOD_OPTIONS: { value: MoodFilter; label: string; emoji: string; activeClass: string }[] = [
  { value: 'all',      label: 'すべて',   emoji: '✨', activeClass: 'bg-indigo-600 text-white' },
  { value: 'happy',    label: '楽しい',   emoji: '♬', activeClass: 'bg-yellow-400 text-yellow-900' },
  { value: 'sad',      label: 'かなしい', emoji: '☁', activeClass: 'bg-violet-600 text-white' },
  { value: 'positive', label: 'がんばる', emoji: '💪', activeClass: 'bg-orange-500 text-white' },
]

interface DiaryAllClientProps {
  posts: Post[]
  currentUserId?: string
}

export default function DiaryAllClient({ posts, currentUserId }: DiaryAllClientProps) {
  const [moodFilter, setMoodFilter] = useState<MoodFilter>('all')

  const filtered = posts.filter(p =>
    moodFilter === 'all' || p.mood === moodFilter
  )

  return (
    <div>
      {/* moodフィルター */}
      <div className="flex gap-2 flex-wrap mb-5">
        {MOOD_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => setMoodFilter(opt.value)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold shadow-sm transition-all active:scale-95 ${
              moodFilter === opt.value
                ? opt.activeClass
                : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            <span>{opt.emoji}</span>
            {opt.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500">
            {moodFilter === 'all'
              ? 'まだ日記がありません'
              : `${MOOD_OPTIONS.find(o => o.value === moodFilter)?.label}な日記はまだありません`}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map(post => (
            <PostCard key={post.id} post={post} currentUserId={currentUserId} />
          ))}
        </div>
      )}
    </div>
  )
}
