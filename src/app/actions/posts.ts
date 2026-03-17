'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createPost(formData: {
  title: string
  content: string
  tags: string[]
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'Unauthorized' }

  const { data: post, error: postError } = await supabase
    .from('posts')
    .insert({ title: formData.title, content: formData.content, user_id: user.id })
    .select('id')
    .single()

  if (postError || !post) return { success: false, error: postError?.message }

  if (formData.tags.length > 0) {
    const { data: tagRows } = await supabase
      .from('tags')
      .upsert(formData.tags.map(name => ({ name })), { onConflict: 'name' })
      .select('id, name')

    if (tagRows && tagRows.length > 0) {
      await supabase.from('post_tags').insert(
        tagRows.map(tag => ({ post_id: post.id, tag_id: tag.id }))
      )
    }
  }

  revalidatePath('/')
  redirect(`/post/${post.id}`)
}

export async function deletePost(postId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false }

  await supabase.from('posts').delete().eq('id', postId).eq('user_id', user.id)

  revalidatePath('/')
  redirect('/')
}
