"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const PostSchema = z.object({
  title: z.string().min(1, "Il titolo è obbligatorio"),
  content: z.string().min(1, "Il contenuto è obbligatorio"),
  category_id: z.string().uuid("ID categoria non valido"),
  author_id: z.string().uuid("ID autore non valido"),
  image_url: z.string().url("URL immagine non valido").optional().or(z.literal("")),
  slug: z.string().min(1, "Lo slug è obbligatorio"),
})

export async function createPost(data: z.infer<typeof PostSchema>) {
  const supabase = createAdminClient()

  const validatedData = PostSchema.safeParse(data)
  if (!validatedData.success) {
    return { error: "Dati non validi: " + validatedData.error.message }
  }

  const { error } = await supabase.from("blog_posts").insert(validatedData.data)

  if (error) {
    console.error("Error creating post:", error)
    return { error: "Impossibile creare l'articolo." }
  }

  revalidatePath("/admin/blog-management")
  revalidatePath("/astromag")
  return { success: "Articolo creato con successo." }
}

export async function updatePost(id: string, data: z.infer<typeof PostSchema>) {
  const supabase = createAdminClient()

  const validatedData = PostSchema.safeParse(data)
  if (!validatedData.success) {
    return { error: "Dati non validi: " + validatedData.error.message }
  }

  const { error } = await supabase.from("blog_posts").update(validatedData.data).eq("id", id)

  if (error) {
    console.error("Error updating post:", error)
    return { error: "Impossibile aggiornare l'articolo." }
  }

  revalidatePath("/admin/blog-management")
  revalidatePath(`/astromag/articolo/${validatedData.data.slug}`)
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
