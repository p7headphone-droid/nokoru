'use client'

import { useState, useTransition, useRef } from 'react'
import dynamic from 'next/dynamic'
import TagInput from './TagInput'
import { createPost } from '@/app/actions/posts'

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })

type Visibility = 'public' | 'friends' | 'private'
type PostMode = 'note' | 'diary'

function getTodayTitle() {
  const now = new Date()
  return `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`
}

const VISIBILITY_OPTIONS: { value: Visibility; label: string; icon: string; description: string }[] = [
  { value: 'public',  label: '全体公開', icon: '🌐', description: '' },
  { value: 'friends', label: '友達限定', icon: '👥', description: '相互フォローの友達にのみ表示されます' },
  { value: 'private', label: '非公開',   icon: '🔒', description: '自分だけが見られます' },
]

export default function PostForm() {
  const [mode, setMode] = useState<PostMode>('note')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [visibility, setVisibility] = useState<Visibility>('public')
  const [mood, setMood] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const autoFilledTitle = useRef(false)

  const switchMode = (newMode: PostMode) => {
    setMode(newMode)
    if (newMode === 'diary') {
      if (!title) {
        setTitle(getTodayTitle())
        autoFilledTitle.current = true
      }
      setVisibility('friends')
    } else {
      if (autoFilledTitle.current) {
        setTitle('')
        autoFilledTitle.current = false
      }
      setVisibility('public')
      setMood(null)
    }
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value)
    autoFilledTitle.current = false
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) { setError('タイトルを入力してください'); return }
    if (!content.trim()) { setError('本文を入力してください'); return }
    setError(null)
    startTransition(async () => {
      const result = await createPost({
        title: title.trim(),
        content: content.trim(),
        tags,
        mode,
        visibility,
        mood: mode === 'diary' ? mood : null,
      })
      if (result && !result.success) setError(result.error ?? '投稿に失敗しました')
    })
  }

  const isDiary = mode === 'diary'
  const contentPlaceholder = isDiary
    ? '今日はどんな一日でしたか？まずは一行目から書いてみましょう'
    : '学んだことや気づきを書いてみましょう...'

  const activeVisibility = VISIBILITY_OPTIONS.find(o => o.value === visibility)

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Mode toggle */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
        <button
          type="button"
          onClick={() => switchMode('note')}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
            mode === 'note'
              ? 'bg-white text-indigo-700 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          📚 学習ノート
        </button>
        <button
          type="button"
          onClick={() => switchMode('diary')}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
            mode === 'diary'
              ? 'bg-white text-amber-700 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          📔 日記
        </button>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          タイトル <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder={isDiary ? getTodayTitle() : '今日学んだことのタイトル'}
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      {/* Content */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          本文{!isDiary && '（Markdown）'} <span className="text-red-500">*</span>
        </label>
        {isDiary ? (
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder={contentPlaceholder}
            rows={10}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-y"
          />
        ) : (
          <div data-color-mode="light">
            <MDEditor
              value={content}
              onChange={v => setContent(v ?? '')}
              height={400}
              preview="edit"
              textareaProps={{ placeholder: contentPlaceholder }}
            />
          </div>
        )}
      </div>

      {/* Visibility */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">公開設定</label>
        <div className="flex flex-wrap gap-2">
          {VISIBILITY_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setVisibility(opt.value)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                visibility === opt.value
                  ? opt.value === 'public'
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : opt.value === 'friends'
                    ? 'border-amber-500 bg-amber-50 text-amber-700'
                    : 'border-gray-400 bg-gray-100 text-gray-700'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              <span>{opt.icon}</span>
              {opt.label}
            </button>
          ))}
        </div>
        {activeVisibility?.description && (
          <p className="mt-1.5 text-xs text-gray-400">{activeVisibility.description}</p>
        )}
      </div>

      {/* Mood (diary only) */}
      {isDiary && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">今日の気分（任意）</label>
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'happy',    label: '楽しい', emoji: '♬',
                active: 'border-yellow-400 bg-yellow-50 text-yellow-700',
                hover:  'hover:border-yellow-300 hover:bg-yellow-50' },
              { value: 'sad',      label: 'かなしい', emoji: '☁',
                active: 'border-violet-400 bg-violet-50 text-violet-700',
                hover:  'hover:border-violet-300 hover:bg-violet-50' },
              { value: 'positive', label: 'がんばる', emoji: '💪',
                active: 'border-orange-400 bg-orange-50 text-orange-700',
                hover:  'hover:border-orange-300 hover:bg-orange-50' },
            ].map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setMood(mood === opt.value ? null : opt.value)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                  mood === opt.value
                    ? opt.active
                    : `border-gray-200 text-gray-500 ${opt.hover}`
                }`}
              >
                <span>{opt.emoji}</span>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">タグ（最大5個）</label>
        <TagInput tags={tags} onChange={setTags} />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {isPending ? '投稿中...' : '投稿する'}
        </button>
        <a
          href="/"
          className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          キャンセル
        </a>
      </div>
    </form>
  )
}
