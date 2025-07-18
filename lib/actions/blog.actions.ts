"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export async function getPosts() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*, author:profiles(full_name), category:blog_categories(name)")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching posts:", error)
    return []
  }
  return data
}

export async function getCategories() {
  const supabase = createAdminClient()
  const { data, error } = await supabase.from("blog_categories").select("*")
  if (error) {
    console.error("Error fetching categories:", error)
    return []
  }
  return data
}

export async function createPost(postData: {
  title: string
  content: string
  author_id: string
  category_id: string
  image_url?: string
  slug: string
}) {
  const supabase = createAdminClient()
  const { data, error } = await supabase.from("blog_posts").insert([postData]).select().single()

  if (error) {
    console.error("Error creating post:", error)
    return { error: "Impossibile creare l'articolo." }
  }

  revalidatePath("/admin/blog-management")
  revalidatePath("/astromag")
  revalidatePath(`/astromag/articolo/${data.slug}`)
  return { success: "Articolo creato con successo.", post: data }
}

export async function updatePost(
  postId: string,
  postData: {
    title: string
    content: string
    category_id: string
    image_url?: string
    slug: string
  },
) {
  const supabase = createAdminClient()
  const { data, error } = await supabase.from("blog_posts").update(postData).eq("id", postId).select().single()

  if (error) {
    console.error("Error updating post:", error)
    return { error: "Impossibile aggiornare l'articolo." }
  }

  revalidatePath("/admin/blog-management")
  revalidatePath("/astromag")
  revalidatePath(`/astromag/articolo/${data.slug}`)
  return { success: "Articolo aggiornato con successo.", post: data }
}

export async function deletePost(postId: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from("blog_posts").delete().eq("id", postId)

  if (error) {
    console.error("Error deleting post:", error)
    return { error: "Impossibile eliminare l'articolo." }
  }

  revalidatePath("/admin/blog-management")
  revalidatePath("/astromag")
  return { success: "Articolo eliminato con successo." }
}
