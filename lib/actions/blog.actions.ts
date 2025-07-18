"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export interface BlogPost {
  id?: string
  title: string
  slug: string
  content: string
  excerpt?: string
  category: string
  tags?: string[]
  status: "draft" | "published" | "scheduled"
  featured_image_url?: string
  author_id: string
  published_at?: string
  seo_title?: string
  seo_description?: string
}

function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

// Recupera tutti i post
export async function getPosts() {
  const supabase = createAdminClient()
  const { data, error } = await supabase.from("posts").select("*").order("created_at", { ascending: false })
  if (error) {
    console.error("Error fetching posts:", error)
    return []
  }
  return data
}

// Crea un nuovo post
export async function createPost(postData: Omit<BlogPost, "slug">, authorId: string) {
  const supabase = createAdminClient()
  const slug = createSlug(postData.title)

  const { error } = await supabase.from("posts").insert([
    {
      ...postData,
      slug,
      author_id: authorId,
      published_at: postData.status === "published" ? new Date().toISOString() : null,
    },
  ])

  if (error) {
    return { success: false, message: "Errore nella creazione del post.", error }
  }

  revalidatePath("/admin/blog-management")
  revalidatePath("/(platform)/astromag")
  return { success: true, message: "Post creato con successo." }
}

// Aggiorna un post esistente
export async function updatePost(postId: string, postData: Partial<BlogPost>) {
  const supabase = createAdminClient()

  // Se il titolo cambia, ricalcola lo slug
  if (postData.title) {
    postData.slug = createSlug(postData.title)
  }

  // Se lo stato diventa 'published' e non c'è una data di pubblicazione, impostala
  if (postData.status === "published" && !postData.published_at) {
    postData.published_at = new Date().toISOString()
  }

  const { error } = await supabase.from("posts").update(postData).eq("id", postId)

  if (error) {
    return { success: false, message: "Errore nell'aggiornamento del post.", error }
  }

  revalidatePath("/admin/blog-management")
  revalidatePath("/(platform)/astromag")
  if (postData.slug) {
    revalidatePath(`/(platform)/astromag/articolo/${postData.slug}`)
  }
  return { success: true, message: "Post aggiornato con successo." }
}

// Elimina un post
export async function deletePost(postId: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from("posts").delete().eq("id", postId)

  if (error) {
    return { success: false, message: "Errore nell'eliminazione del post.", error }
  }

  revalidatePath("/admin/blog-management")
  revalidatePath("/(platform)/astromag")
  return { success: true, message: "Post eliminato con successo." }
}
