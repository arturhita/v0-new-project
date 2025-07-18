"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import type { Post } from "@/lib/blog-data" // Assumendo che il tipo Post sia definito qui

const PostSchema = z.object({
  title: z.string().min(1, "Il titolo è obbligatorio."),
  slug: z.string().min(1, "Lo slug è obbligatorio."),
  content: z.string().optional(),
  excerpt: z.string().optional(),
  category: z.string().optional(),
  status: z.enum(["draft", "published"]),
  featured_image_url: z.string().url().optional().or(z.literal("")),
})

export async function getPosts() {
  const supabase = createClient()
  const { data, error } = await supabase.from("posts").select("*").order("created_at", { ascending: false })
  if (error) {
    console.error("Error fetching posts:", error)
    return []
  }
  return data
}

export async function getPostById(id: string) {
  const supabase = createClient()
  const { data, error } = await supabase.from("posts").select("*").eq("id", id).single()
  if (error) {
    console.error("Error fetching post by id:", error)
    return null
  }
  return data
}

export async function createPost(rawData: Partial<Post>) {
  const supabase = createClient()

  const validatedFields = PostSchema.safeParse(rawData)

  if (!validatedFields.success) {
    return { error: "Dati non validi.", fieldErrors: validatedFields.error.flatten().fieldErrors }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Utente non autenticato." }

  const postData = {
    ...validatedFields.data,
    author_id: user.id,
    published_at: validatedFields.data.status === "published" ? new Date().toISOString() : null,
  }

  const { error } = await supabase.from("posts").insert([postData])

  if (error) {
    console.error("Error creating post:", error)
    return { error: "Impossibile creare l'articolo." }
  }

  revalidatePath("/admin/blog-management")
  revalidatePath("/astromag")
  if (postData.category) {
    revalidatePath(`/astromag/${postData.category}`)
  }
  return { success: "Articolo creato con successo." }
}

export async function updatePost(id: string, rawData: Partial<Post>) {
  const supabase = createClient()

  const validatedFields = PostSchema.safeParse(rawData)

  if (!validatedFields.success) {
    return { error: "Dati non validi.", fieldErrors: validatedFields.error.flatten().fieldErrors }
  }

  const postData = {
    ...validatedFields.data,
    updated_at: new Date().toISOString(),
    published_at: validatedFields.data.status === "published" ? new Date().toISOString() : null,
  }

  const { error } = await supabase.from("posts").update(postData).eq("id", id)

  if (error) {
    console.error("Error updating post:", error)
    return { error: "Impossibile aggiornare l'articolo." }
  }

  revalidatePath("/admin/blog-management")
  revalidatePath("/astromag")
  if (postData.category) {
    revalidatePath(`/astromag/${postData.category}`)
  }
  if (postData.slug) {
    revalidatePath(`/astromag/articolo/${postData.slug}`)
  }
  return { success: "Articolo aggiornato con successo." }
}

export async function deletePost(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from("posts").delete().eq("id", id)

  if (error) {
    console.error("Error deleting post:", error)
    return { error: "Impossibile eliminare l'articolo." }
  }

  revalidatePath("/admin/blog-management")
  revalidatePath("/astromag")
  return { success: "Articolo eliminato con successo." }
}
