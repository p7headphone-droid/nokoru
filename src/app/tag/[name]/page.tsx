import { getPosts } from '@/lib/posts'
import PostCard from '@/components/post/PostCard'
import { createClient } from '@/lib/supabase/server'

interface Props {
  params: Promise<{ name: string }>
}

export default async function TagPage({ params }: Props) {
  const { name } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const posts = await getPosts({ tag: name })

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          <span className="text-indigo-600">#{name}</span> の学習ノート
        </h1>
        <p className="text-sm text-gray-500 mt-1">{posts.length}件の投稿</p>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500">このタグの投稿はまだありません</p>
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
