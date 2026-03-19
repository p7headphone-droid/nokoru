import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getPosts } from '@/lib/posts'
import PostCard from '@/components/post/PostCard'

export const revalidate = 0

export default async function DiaryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const posts = await getPosts({ userId: user.id, mode: 'diary' })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📔 日記</h1>
          <p className="text-sm text-gray-500 mt-0.5">自分の日記一覧</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/post/new?mode=diary"
            className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 transition-colors whitespace-nowrap"
          >
            ＋ 日記を書く
          </Link>
          <Link
            href="/diary/all"
            className="rounded-lg border border-amber-300 px-4 py-2 text-sm font-medium text-amber-700 hover:bg-amber-50 transition-colors whitespace-nowrap"
          >
            みんなの日記を見る →
          </Link>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500 mb-4">まだ日記がありません。今日の出来事を書いてみましょう！</p>
          <Link
            href="/post/new?mode=diary"
            className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 transition-colors"
          >
            日記を書く
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {posts.map(post => (
            <PostCard key={post.id} post={post} currentUserId={user.id} />
          ))}
        </div>
      )}
    </div>
  )
}
