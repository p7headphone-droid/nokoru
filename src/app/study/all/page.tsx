import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getPosts } from '@/lib/posts'
import StudyAllClient from '@/components/feed/StudyAllClient'

export const revalidate = 0

export default async function StudyAllPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const posts = await getPosts({ mode: 'note', excludeUserId: user?.id })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/study" className="text-sm text-gray-500 hover:text-indigo-600 mb-1 block">
            ← 自分の学習に戻る
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">みんなの学習ノート</h1>
          <p className="text-sm text-gray-500 mt-0.5">学んだことをシェアして、一緒に成長しよう</p>
        </div>
      </div>

      <StudyAllClient posts={posts} currentUserId={user?.id} />
    </div>
  )
}
