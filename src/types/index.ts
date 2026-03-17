export type ReactionType = 'wakaru' | 'omoshiroi' | 'ki_ni_naru'

export interface Profile {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  created_at: string
}

export interface Tag {
  id: string
  name: string
}

export interface Post {
  id: string
  user_id: string
  title: string
  content: string
  created_at: string
  updated_at: string
  profile: Profile
  tags: Tag[]
  reaction_counts: ReactionCounts
  user_reactions: ReactionType[]
}

export interface ReactionCounts {
  wakaru: number
  omoshiroi: number
  ki_ni_naru: number
}

export interface Reaction {
  id: string
  post_id: string
  user_id: string
  reaction_type: ReactionType
  created_at: string
}
