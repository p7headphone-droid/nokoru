'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import TagInput from '@/components/post/TagInput'
import { createPost } from '@/app/actions/posts'

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })

export default function NewPostPage() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) {
      setError('タイトルと本文は必須です')
      return
    }
    setSubmitting(true)
    setError('')

    const result = await createPost({ title, content, tags })
    if (result && !result.success) {
      setError(result.error || '投稿に失敗しました')
      setSubmitting(false)
    }
    // 成功時はredirectされるのでsetSubmittingは不要
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">学習ノートを書く</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            タイトル <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="今日学んだことのタイトル"
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            本文（Markdown） <span className="text-red-500">*</span>
          </label>
          <div data-color-mode="light">
            <MDEditor
              value={content}
              onChange={v => setContent(v ?? '')}
              height={400}
              preview="edit"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            タグ（最大5個）
          </label>
          <TagInput tags={tags} onChange={setTags} />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {submitting ? '投稿中...' : '投稿する'}
          </button>
          <a
            href="/"
            className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            キャンセル
          </a>
        </div>
      </form>
    </div>
  )
}
