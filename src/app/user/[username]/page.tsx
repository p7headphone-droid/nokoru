import { notFound } from 'next/navigation'
import { getPosts } from '@/lib/posts'
import PostCard from '@/components/post/PostCard'
import { createClient } from '@/lib/supabase/server'

interface Props {
  params: Promise<{ username: string }>
}

export default async function UserProfilePage({ params }: Props) {
  const { username } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (!profile) notFound()

  const { data: { user } } = await supabase.auth.getUser()
  const posts = await getPosts({ userId: profile.id })

  return (
    <div>
      {/* Profile Card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm mb-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-2xl">
            {(profile.display_name || profile.username)[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {profile.display_name || profile.username}
            </h1>
            <p className="text-sm text-gray-500">@{profile.username}</p>
            {profile.bio && (
              <p className="text-sm text-gray-700 mt-1">{profile.bio}</p>
            )}
          </div>
        </div>
      </div>

      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-900">
          学習ノート <span className="text-gray-400 font-normal text-base">({posts.length}件)</span>
        </h2>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500">まだ投稿がありません</p>
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
