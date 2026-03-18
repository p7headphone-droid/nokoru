import { createClient } from '@/lib/supabase/server'
import type { Post, ReactionType } from '@/types'

export async function getPosts(options?: { tag?: string; userId?: string; limit?: number }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let query = supabase
    .from('posts')
    .select(`
      id, title, content, visibility, mode, mood, created_at, updated_at, user_id,
      profile:profiles!posts_user_id_fkey(id, username, display_name, avatar_url),
      post_tags(tag:tags(id, name)),
      reactions(reaction_type, user_id)
    `)
    .order('created_at', { ascending: false })
    .limit(options?.limit ?? 20)

  if (options?.userId) query = query.eq('user_id', options.userId)

  const { data, error } = await query
  if (error || !data) return []

  let posts = data.map(row => formatPost(row, user?.id)) as Post[]

  // タグフィルタ（クライアントサイド）
  if (options?.tag) {
    posts = posts.filter(p => p.tags.some(t => t.name === options.tag))
  }

  return posts
}

export async function getPost(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('posts')
    .select(`
      id, title, content, visibility, mode, mood, created_at, updated_at, user_id,
      profile:profiles!posts_user_id_fkey(id, username, display_name, avatar_url),
      post_tags(tag:tags(id, name)),
      reactions(reaction_type, user_id)
    `)
    .eq('id', id)
    .single()

  if (error || !data) return null

  return formatPost(data, user?.id) as Post
}

function formatPost(row: any, currentUserId?: string): Post {
  const reactionCounts: Record<ReactionType, number> = {
    wakaru: 0, omoshiroi: 0, ki_ni_naru: 0,
  }
  const userReactions: ReactionType[] = []

  for (const r of (row.reactions ?? [])) {
    const type = r.reaction_type as ReactionType
    reactionCounts[type] = (reactionCounts[type] || 0) + 1
    if (currentUserId && r.user_id === currentUserId) {
      userReactions.push(type)
    }
  }

  return {
    id: row.id,
    user_id: row.user_id,
    title: row.title,
    content: row.content,
    visibility: row.visibility ?? 'public',
    mode: row.mode ?? 'note',
    mood: row.mood ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at,
    profile: row.profile,
    tags: (row.post_tags ?? []).map((pt: any) => pt.tag).filter(Boolean),
    reaction_counts: reactionCounts,
    user_reactions: userReactions,
  }
}
