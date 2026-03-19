import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getPosts } from '@/lib/posts'
import DiaryAllClient from '@/components/feed/DiaryAllClient'

export const revalidate = 0

export default async function DiaryAllPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const posts = await getPosts({ mode: 'diary', excludeUserId: user?.id })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/diary" className="text-sm text-gray-500 hover:text-amber-600 mb-1 block">
            ← 自分の日記に戻る
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">みんなの日記</h1>
          <p className="text-sm text-gray-500 mt-0.5">みんなの日常をのぞいてみよう</p>
        </div>
      </div>

      <DiaryAllClient posts={posts} currentUserId={user?.id} />
    </div>
  )
}
