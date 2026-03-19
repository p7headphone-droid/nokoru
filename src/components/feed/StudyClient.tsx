'use client'

import { useState } from 'react'
import Link from 'next/link'
import PostCard from '@/components/post/PostCard'
import type { Post } from '@/types'

const THEMES = [
  { value: 'all', label: 'すべて', emoji: '✨' },
  { value: 'IT',   label: 'IT',   emoji: '💻' },
  { value: '社会', label: '社会', emoji: '🌍' },
  { value: '恋愛', label: '恋愛', emoji: '💕' },
  { value: '読書', label: '読書', emoji: '📖' },
  { value: '映画', label: '映画', emoji: '🎬' },
]

interface StudyClientProps {
  posts: Post[]
  currentUserId: string
}

export default function StudyClient({ posts, currentUserId }: StudyClientProps) {
  const [themeFilter, setThemeFilter] = useState('all')

  const filtered = posts.filter(p =>
    themeFilter === 'all' || p.theme === themeFilter
  )

  const postHref =
    themeFilter === 'all'
      ? '/post/new?mode=note'
      : `/post/new?mode=note&theme=${themeFilter}`

  return (
    <div>
      {/* テーマフィルター */}
      <div className="overflow-x-auto mb-5 -mx-1 px-1">
        <div className="flex gap-2 flex-nowrap pb-1">
          {THEMES.map(t => (
            <button
              key={t.value}
              onClick={() => setThemeFilter(t.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                themeFilter === t.value
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600'
              }`}
            >
              {t.emoji} {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* 投稿ボタン */}
      <div className="flex justify-end mb-4">
        <Link
          href={postHref}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
        >
          ＋ 投稿する
        </Link>
      </div>

      {/* 投稿一覧 */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500 mb-4">
            {themeFilter === 'all'
              ? 'まだ学習ノートがありません。最初の投稿をしてみましょう！'
              : `${themeFilter}の投稿はまだありません`}
          </p>
          <Link
            href={postHref}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
          >
            投稿する
          </Link>
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
