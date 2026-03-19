import PostForm from '@/components/post/PostForm'

interface Props {
  searchParams: Promise<{ mode?: string; theme?: string }>
}

export default async function NewPostPage({ searchParams }: Props) {
  const params = await searchParams
  const initialMode = params.mode === 'diary' ? 'diary' : 'note'
  const initialTheme = params.theme ?? null

  return (
    <div className="max-w-3xl mx-auto">
      <PostForm initialMode={initialMode} initialTheme={initialTheme} />
    </div>
  )
}
