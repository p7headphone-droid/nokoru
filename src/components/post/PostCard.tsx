import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'
import ReactionButtons from './ReactionButton'
import type { Post, ReactionType, Visibility, PostMode } from '@/types'

const VISIBILITY_BADGE: Record<Visibility, { icon: string; label: string; className: string }> = {
  public:  { icon: '🌐', label: '全体公開', className: 'text-indigo-600' },
  friends: { icon: '👥', label: '友達限定', className: 'text-amber-600' },
  private: { icon: '🔒', label: '非公開',   className: 'text-gray-500' },
}

const MODE_BADGE: Record<PostMode, { icon: string; label: string }> = {
  note:  { icon: '📚', label: '学習ノート' },
  diary: { icon: '📔', label: '日記' },
}

interface PostCardProps {
  post: Post
  currentUserId?: string
}

export default function PostCard({ post, currentUserId }: PostCardProps) {
  return (
    <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between gap-2.5 mb-3">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm shrink-0">
            {(post.profile.display_name || post.profile.username)[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <Link
              href={`/user/${post.profile.username}`}
              className="text-sm font-medium text-gray-800 hover:text-indigo-600 block truncate"
            >
              {post.profile.display_name || post.profile.username}
            </Link>
            <p className="text-xs text-gray-400">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ja })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0 flex-nowrap">
          {post.mode && (
            <span className="text-[9px] sm:text-xs text-gray-400 whitespace-nowrap">
              {MODE_BADGE[post.mode]?.icon} {MODE_BADGE[post.mode]?.label}
            </span>
          )}
          {post.visibility && (
            <span className={`text-[9px] sm:text-xs font-medium whitespace-nowrap ${VISIBILITY_BADGE[post.visibility].className}`}>
              {VISIBILITY_BADGE[post.visibility].icon} {VISIBILITY_BADGE[post.visibility].label}
            </span>
          )}
        </div>
      </div>

      <Link href={`/post/${post.id}`}>
        <h2 className="text-lg font-bold text-gray-900 hover:text-indigo-600 mb-2 line-clamp-2">
          {post.title}
        </h2>
      </Link>

      <p className="text-sm text-gray-500 line-clamp-3 mb-4">
        {post.content.replace(/[#*`>\[\]!]/g, '').trim()}
      </p>

      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {post.tags.map(tag => (
            <Link
              key={tag.id}
              href={`/tag/${tag.name}`}
              className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600 hover:bg-indigo-100 hover:text-indigo-700 transition-colors"
            >
              #{tag.name}
            </Link>
          ))}
        </div>
      )}

      {post.mode !== 'diary' && (
        <ReactionButtons
          postId={post.id}
          counts={post.reaction_counts}
          userReactions={currentUserId ? post.user_reactions : []}
          isLoggedIn={!!currentUserId}
        />
      )}
    </article>
  )
}
