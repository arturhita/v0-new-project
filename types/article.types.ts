export interface Article {
  id: string
  title: string
  slug: string
  image_url: string | null
  created_at: string
  categories: {
    name: string
    slug: string
  } | null
  profiles: {
    full_name: string | null
    avatar_url: string | null
  } | null
}
