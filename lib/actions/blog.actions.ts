"use server"

import { createClient } from "@/lib/supabase/server"
import { createClient as createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import { v4 as uuidv4 } from "uuid"

export async function getBlogPosts() {
  const supabase = createClient()
  const { data, error } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching blog posts:", error)
    return []
  }
  return data
}

export async function createBlogPost(formData: FormData) {
  const supabase = createClient()
  const supabaseAdmin = createAdminClient()

  const title = formData.get("title") as string
  const content = formData.get("content") as string
  const category = formData.get("category") as string
  const imageFile = formData.get("image") as File

  if (!title || !content || !category) {
    return { success: false, message: "Titolo, contenuto e categoria sono obbligatori." }
  }

  if (!imageFile || imageFile.size === 0) {
    return { success: false, message: "L'immagine è obbligatoria." }
  }

  // Upload image to storage
  const fileName = `${uuidv4()}-${imageFile.name}`
  const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
    .from("blog_images")
    .upload(fileName, imageFile)

  if (uploadError) {
    console.error("Error uploading blog image:", uploadError)
    return { success: false, message: "Errore durante il caricamento dell'immagine." }
  }

  // Get public URL for the uploaded image
  const { data: publicUrlData } = supabase.storage.from("blog_images").getPublicUrl(uploadData.path)

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, message: "Utente non autenticato." }
  }

  const newPost = {
    title,
    content,
    category,
    image_url: publicUrlData.publicUrl,
    author_id: user.id,
  }

  const { error: insertError } = await supabase.from("blog_posts").insert(newPost)

  if (insertError) {
    console.error("Error creating blog post:", insertError)
    return { success: false, message: "Errore durante la creazione del post." }
  }

  revalidatePath("/admin/blog-management")
  revalidatePath("/astromag")
  revalidatePath(`/astromag/${category}`)
  return { success: true, message: "Post creato con successo." }
}

export async function updateBlogPost(postId: string, formData: FormData) {
  const supabase = createClient()
  const supabaseAdmin = createAdminClient()

  const title = formData.get("title") as string
  const content = formData.get("content") as string
  const category = formData.get("category") as string
  const imageFile = formData.get("image") as File | null
  const currentImageUrl = formData.get("current_image_url") as string

  let imageUrl = currentImageUrl

  if (imageFile && imageFile.size > 0) {
    const fileName = `${uuidv4()}-${imageFile.name}`
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from("blog_images")
      .upload(fileName, imageFile, { upsert: true })

    if (uploadError) {
      console.error("Error uploading new blog image:", uploadError)
      return { success: false, message: "Errore durante il caricamento della nuova immagine." }
    }

    const { data: publicUrlData } = supabase.storage.from("blog_images").getPublicUrl(uploadData.path)
    imageUrl = publicUrlData.publicUrl
  }

  const updatedPost = {
    title,
    content,
    category,
    image_url: imageUrl,
  }

  const { error: updateError } = await supabase.from("blog_posts").update(updatedPost).eq("id", postId)

  if (updateError) {
    console.error("Error updating blog post:", updateError)
    return { success: false, message: "Errore durante l'aggiornamento del post." }
  }

  revalidatePath("/admin/blog-management")
  revalidatePath("/astromag")
  revalidatePath(`/astromag/${category}`)
  revalidatePath(`/astromag/articolo/${postId}`)
  return { success: true, message: "Post aggiornato con successo." }
}

export async function deleteBlogPost(postId: string) {
  const supabase = createClient()
  const { error } = await supabase.from("blog_posts").delete().eq("id", postId)

  if (error) {
    console.error("Error deleting blog post:", error)
    return { success: false, message: "Errore durante l'eliminazione del post." }
  }

  revalidatePath("/admin/blog-management")
  revalidatePath("/astromag")
  return { success: true, message: "Post eliminato con successo." }
}
