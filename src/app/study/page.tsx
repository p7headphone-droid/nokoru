import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getPosts } from '@/lib/posts'
import StudyClient from '@/components/feed/StudyClient'

export const revalidate = 0

export default async function StudyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const posts = await getPosts({ userId: user.id, mode: 'note' })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📚 学習ノート</h1>
          <p className="text-sm text-gray-500 mt-0.5">自分の学習記録</p>
        </div>
        <Link
          href="/study/all"
          className="rounded-lg border border-indigo-300 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-50 transition-colors whitespace-nowrap"
        >
          みんなの学習を見る →
        </Link>
      </div>

      <StudyClient posts={posts} currentUserId={user.id} />
    </div>
  )
}
