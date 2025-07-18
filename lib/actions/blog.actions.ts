"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

type PostData = {
  title: string
  content: string
  author_id: string
  category_id: string
  slug: string
  image_url?: string
  is_published?: boolean
}

export async function createPost(data: PostData) {
  const supabase = createAdminClient()
  const { error } = await supabase.from("blog_posts").insert(data)

  if (error) {
    console.error("Error creating post:", error)
    return { error: "Impossibile creare l'articolo." }
  }

  revalidatePath("/admin/blog-management")
  revalidatePath("/astromag")
  return { success: "Articolo creato con successo." }
}

export async function updatePost(postId: string, data: Partial<PostData>) {
  const supabase = createAdminClient()
  const { error } = await supabase.from("blog_posts").update(data).eq("id", postId)

  if (error) {
    console.error("Error updating post:", error)
    return { error: "Impossibile aggiornare l'articolo." }
  }

  revalidatePath("/admin/blog-management")
  revalidatePath(`/astromag/articolo/${data.slug}`)
  return { success: "Articolo aggiornato con successo." }
}
