import { getPosts } from '@/lib/posts'
import PostCard from '@/components/post/PostCard'
import { createClient } from '@/lib/supabase/server'

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

      {posts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500">まだ投稿がありません。最初の学習ノートを書いてみましょう！</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {posts.map(post => (
            <PostCard key={post.id} post={post} currentUserId={user?.id} />
          ))}
        </div>
      )}
    </div>
  )
}
