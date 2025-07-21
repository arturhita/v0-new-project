export interface BlogCategory {
  id: string
  name: string
  slug: string
  description?: string | null
  created_at: string
}

export interface BlogArticle {
  id: string
  title: string
  slug: string
  excerpt?: string | null
  content?: string | null
  image_url?: string | null
  category_id: string
  author_id: string
  status: "draft" | "published"
  published_at?: string | null
  read_time_minutes?: number | null
  created_at: string
  updated_at: string
  blog_categories: Pick<BlogCategory, "name" | "slug"> | null
  profiles: {
    full_name: string | null
    avatar_url: string | null
  } | null
}
