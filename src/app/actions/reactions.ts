'use server'

import { createClient } from '@/lib/supabase/server'
import type { ReactionType } from '@/types'

export async function toggleReaction(postId: string, reactionType: ReactionType) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'Unauthorized' }

  const { data: existing } = await supabase
    .from('reactions')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .eq('reaction_type', reactionType)
    .single()

  if (existing) {
    const { error } = await supabase.from('reactions').delete().eq('id', existing.id)
    return { success: !error }
  } else {
    const { error } = await supabase
      .from('reactions')
      .insert({ post_id: postId, user_id: user.id, reaction_type: reactionType })
    return { success: !error }
  }
}
