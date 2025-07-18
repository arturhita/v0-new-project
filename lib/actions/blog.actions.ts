"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { v4 as uuidv4 } from "uuid"

export async function getBlogPosts() {
  const supabase = createClient()
  const { data, error } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false })
  return error ? [] : data
}

export async function createBlogPost(formData: FormData) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, message: "Non autorizzato." }

  const imageFile = formData.get("image") as File
  const fileName = `${uuidv4()}-${imageFile.name}`
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("blog_images")
    .upload(fileName, imageFile)
  if (uploadError) return { success: false, message: `Errore upload: ${uploadError.message}` }

  const { data: publicUrlData } = supabase.storage.from("blog_images").getPublicUrl(uploadData.path)

  const newPost = {
    title: formData.get("title") as string,
    content: formData.get("content") as string,
    category: formData.get("category") as string,
    status: "published",
    author_id: user.id,
    image_url: publicUrlData.publicUrl,
    published_at: new Date().toISOString(),
  }
  const { error } = await supabase.from("blog_posts").insert(newPost)
  if (error) return { success: false, message: `Errore creazione: ${error.message}` }

  revalidatePath("/admin/blog-management")
  revalidatePath("/astromag")
  return { success: true, message: "Post pubblicato." }
}
