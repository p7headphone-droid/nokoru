import { notFound } from 'next/navigation'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { getPost } from '@/lib/posts'
import { createClient } from '@/lib/supabase/server'
import ReactionButtons from '@/components/post/ReactionButton'
import { DiaryCanvas } from '@/components/post/DiaryEffects'
import { deletePost } from '@/app/actions/posts'
import { Trash2 } from 'lucide-react'

interface Props {
  params: Promise<{ id: string }>
}

export default async function PostDetailPage({ params }: Props) {
  const { id } = await params
  const post = await getPost(id)
  if (!post) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isOwner = user?.id === post.user_id
  const isDiary = post.mode === 'diary'
  const isPrivate = post.visibility === 'private'

  return (
    <>
      {/* 日記モード専用エフェクト */}
      {isDiary && <DiaryCanvas mood={post.mood} createdAt={post.created_at} />}

      <div className="max-w-3xl mx-auto relative" style={{ zIndex: 1 }}>
        <article className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          {/* Author */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold shrink-0">
                {(post.profile.display_name || post.profile.username)[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <Link
                  href={`/user/${post.profile.username}`}
                  className="font-medium text-gray-900 hover:text-indigo-600 block truncate"
                >
                  {post.profile.display_name || post.profile.username}
                </Link>
                <p className="text-xs text-gray-400">
                  {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ja })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0 flex-nowrap">
              {/* 公開レベルバッジ */}
              <span className={`text-[9px] sm:text-xs font-medium px-1.5 sm:px-2 py-0.5 rounded-full border whitespace-nowrap ${
                post.visibility === 'public'  ? 'border-indigo-200 text-indigo-600 bg-indigo-50' :
                post.visibility === 'friends' ? 'border-amber-200 text-amber-600 bg-amber-50' :
                                                'border-gray-200 text-gray-500 bg-gray-50'
              }`}>
                {post.visibility === 'public'  ? '🌐 全体公開' :
                 post.visibility === 'friends' ? '👥 友達限定' : '🔒 非公開'}
              </span>
              {/* moodバッジ */}
              {isDiary && post.mood && (
                <span className={`text-[9px] sm:text-xs px-1.5 sm:px-2.5 py-0.5 rounded-full font-medium whitespace-nowrap ${
                  post.mood === 'happy'    ? 'bg-yellow-50 text-yellow-700' :
                  post.mood === 'sad'      ? 'bg-violet-50 text-violet-700' :
                  post.mood === 'positive' ? 'bg-orange-50 text-orange-700' : ''
                }`}>
                  {post.mood === 'happy' ? '♬ 楽しい' :
                   post.mood === 'sad'   ? '☁ かなしい' : '💪 がんばる'}
                </span>
              )}

              {isOwner && (
                <form action={async () => { 'use server'; await deletePost(id) }}>
                  <button
                    type="submit"
                    className="flex items-center gap-1 sm:gap-1.5 rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm text-red-600 hover:bg-red-50 transition-colors whitespace-nowrap"
                  >
                    <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    削除
                  </button>
                </form>
              )}
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-6">
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

          {/* Content */}
          <div className="prose prose-indigo max-w-none mb-8">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {post.content}
            </ReactMarkdown>
          </div>

          {/* Reactions — 非公開投稿では非表示 */}
          {!isPrivate && (
            <div className="border-t border-gray-100 pt-6">
              <p className="text-sm font-medium text-gray-600 mb-3">この投稿はどうでしたか？</p>
              <ReactionButtons
                postId={post.id}
                counts={post.reaction_counts}
                userReactions={user ? post.user_reactions : []}
                isLoggedIn={!!user}
                isDiary={isDiary}
              />
              {!user && (
                <p className="text-xs text-gray-400 mt-2">
                  <Link href="/login" className="text-indigo-600 hover:underline">ログイン</Link>
                  するとリアクションできます
                </p>
              )}
            </div>
          )}
        </article>

        <div className="mt-4">
          <Link href="/" className="text-sm text-gray-500 hover:text-indigo-600">
            ← フィードに戻る
          </Link>
        </div>
      </div>
    </>
  )
}
