'use client'

import { useState } from 'react'
import PostCard from '@/components/post/PostCard'
import type { Post } from '@/types'

type MoodFilter = 'all' | 'happy' | 'sad' | 'positive'

const MOOD_OPTIONS: { value: MoodFilter; label: string; emoji: string }[] = [
  { value: 'all',      label: 'すべて', emoji: '✨' },
  { value: 'happy',    label: '楽しい', emoji: '♬' },
  { value: 'sad',      label: 'かなしい', emoji: '☁' },
  { value: 'positive', label: 'がんばる', emoji: '💪' },
]

const ACTIVE_STYLES: Record<MoodFilter, string> = {
  all:      'bg-indigo-600 text-white shadow-indigo-200',
  happy:    'bg-yellow-400 text-yellow-900 shadow-yellow-200',
  sad:      'bg-violet-600 text-white shadow-violet-200',
  positive: 'bg-orange-500 text-white shadow-orange-200',
}

interface FeedClientProps {
  posts: Post[]
  currentUserId?: string
}

export default function FeedClient({ posts, currentUserId }: FeedClientProps) {
  const [moodFilter, setMoodFilter] = useState<MoodFilter>('all')

  const filteredPosts = posts.filter(post => {
    if (moodFilter === 'all') return true
    // Notes always shown only in "all"
    if (post.mode === 'note') return false
    return post.mood === moodFilter
  })

  return (
    <div>
      {filteredPosts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500">
            {moodFilter === 'all'
              ? 'まだ投稿がありません。最初の学習ノートを書いてみましょう！'
              : `${MOOD_OPTIONS.find(o => o.value === moodFilter)?.label}な日記はまだありません`}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 pb-28">
          {filteredPosts.map(post => (
            <PostCard key={post.id} post={post} currentUserId={currentUserId} />
          ))}
        </div>
      )}

      {/* Mood filter — fixed bottom-right */}
      <div className="fixed bottom-6 right-5 flex flex-col gap-2 z-50">
        {MOOD_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => setMoodFilter(opt.value)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold shadow-lg transition-all active:scale-95 ${
              moodFilter === opt.value
                ? `${ACTIVE_STYLES[opt.value]} shadow-lg`
                : 'bg-white text-gray-600 hover:bg-gray-50 shadow-md'
            }`}
          >
            <span className="text-base leading-none">{opt.emoji}</span>
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
