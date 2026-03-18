import { getPosts } from '@/lib/posts'
import { createClient } from '@/lib/supabase/server'
import FeedClient from '@/components/feed/FeedClient'

export const revalidate = 0

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const posts = await getPosts()

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">みんなの学習ノート</h1>
        <p className="text-sm text-gray-500 mt-1">学んだことをシェアして、一緒に成長しよう</p>
      </div>

      <FeedClient posts={posts} currentUserId={user?.id} />
    </div>
  )
}
