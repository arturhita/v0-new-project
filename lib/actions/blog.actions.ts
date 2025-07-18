"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import { unstable_noStore as noStore } from "next/cache"

export async function getPosts() {
  noStore()
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*, author:profiles(full_name)")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching posts:", error)
    return []
  }
  return data
}

export async function createPost(postData: {
  title: string
  content: string
  category_id: string
  author_id: string
  image_url?: string
  slug: string
}) {
  const supabase = createAdminClient()
  const { error } = await supabase.from("blog_posts").insert(postData)

  if (error) {
    console.error("Error creating post:", error)
    return { error: "Impossibile creare l'articolo." }
  }

  revalidatePath("/admin/blog-management")
  revalidatePath("/astromag")
  return { success: "Articolo creato con successo." }
}

export async function updatePost(
  id: string,
  postData: {
    title: string
    content: string
    category_id: string
    image_url?: string
    slug: string
  },
) {
  const supabase = createAdminClient()
  const { error } = await supabase.from("blog_posts").update(postData).eq("id", id)

  if (error) {
    console.error("Error updating post:", error)
    return { error: "Impossibile aggiornare l'articolo." }
  }

  revalidatePath("/admin/blog-management")
  revalidatePath(`/astromag/articolo/${postData.slug}`)
  return { success: "Articolo aggiornato con successo." }
}

export async function deletePost(id: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from("blog_posts").delete().eq("id", id)

  if (error) {
    console.error("Error deleting post:", error)
    return { error: "Impossibile eliminare l'articolo." }
  }

  revalidatePath("/admin/blog-management")
  return { success: "Articolo eliminato con successo." }
}

export async function getBlogCategories() {
  noStore()
  const supabase = createAdminClient()
  const { data, error } = await supabase.from("blog_categories").select("*")
  if (error) {
    console.error("Error fetching blog categories:", error)
    return []
  }
  return data
}
