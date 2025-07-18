"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const postSchema = z.object({
  title: z.string().min(3, "Il titolo deve avere almeno 3 caratteri."),
  content: z.string().min(10, "Il contenuto deve avere almeno 10 caratteri."),
  category: z.string().min(1, "La categoria è richiesta."),
  imageUrl: z.string().url("URL immagine non valido.").optional().or(z.literal("")),
  authorId: z.string().uuid("ID autore non valido."),
})

export async function createPost(postData: {
  title: string
  content: string
  category: string
  imageUrl?: string
  authorId: string
}) {
  const supabase = createClient()

  const validation = postSchema.safeParse(postData)
  if (!validation.success) {
    return { error: validation.error.flatten().fieldErrors }
  }

  const { title, content, category, imageUrl, authorId } = validation.data

  const { data, error } = await supabase
    .from("blog_posts")
    .insert({
      title,
      content,
      category,
      image_url: imageUrl,
      author_id: authorId,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating post:", error)
    return { error: "Impossibile creare l'articolo." }
  }

  revalidatePath("/admin/blog-management")
  revalidatePath("/astromag")
  revalidatePath(`/astromag/${category}`)
  return { success: "Articolo creato con successo.", post: data }
}

export async function getPosts() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("blog_posts")
    .select(
      `
      *,
      profiles (
        username
      )
    `,
    )
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching posts:", error)
    return []
  }
  return data
}

export async function updatePost(
  id: string,
  postData: {
    title: string
    content: string
    category: string
    imageUrl?: string
  },
) {
  const supabase = createClient()

  // We don't need to validate authorId on update
  const updateSchema = postSchema.omit({ authorId: true })
  const validation = updateSchema.safeParse(postData)

  if (!validation.success) {
    return { error: validation.error.flatten().fieldErrors }
  }

  const { title, content, category, imageUrl } = validation.data

  const { data, error } = await supabase
    .from("blog_posts")
    .update({
      title,
      content,
      category,
      image_url: imageUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating post:", error)
    return { error: "Impossibile aggiornare l'articolo." }
  }

  revalidatePath("/admin/blog-management")
  revalidatePath("/astromag")
  revalidatePath(`/astromag/${category}`)
  revalidatePath(`/astromag/articolo/${id}`)
  return { success: "Articolo aggiornato con successo.", post: data }
}

export async function deletePost(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from("blog_posts").delete().eq("id", id)

  if (error) {
    console.error("Error deleting post:", error)
    return { error: "Impossibile eliminare l'articolo." }
  }

  revalidatePath("/admin/blog-management")
  revalidatePath("/astromag")
  return { success: "Articolo eliminato con successo." }
}
