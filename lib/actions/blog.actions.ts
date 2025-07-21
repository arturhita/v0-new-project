"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const ArticleSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(3, "Il titolo è obbligatorio"),
  content: z.string().min(10, "Il contenuto è obbligatorio"),
  excerpt: z.string().optional(),
  category_id: z.string().uuid("Seleziona una categoria valida"),
  status: z.enum(["draft", "published"]),
  image: z.any().optional(),
})

function generateSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "")
}

export async function saveArticle(prevState: any, formData: FormData) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, message: "Non autorizzato." }
  }

  const validatedFields = ArticleSchema.safeParse({
    id: formData.get("id") || undefined,
    title: formData.get("title"),
    content: formData.get("content"),
    excerpt: formData.get("excerpt"),
    category_id: formData.get("category_id"),
    status: formData.get("status"),
    image: formData.get("image"),
  })

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Dati non validi.",
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { id, title, content, excerpt, category_id, status, image } = validatedFields.data
  const slug = generateSlug(title)
  const read_time_minutes = Math.ceil(content.split(" ").length / 200)

  const supabaseAdmin = createAdminClient()
  let imageUrl = formData.get("existing_image_url") as string | null

  if (image && image.size > 0) {
    const fileExt = image.name.split(".").pop()
    const fileName = `${Date.now()}.${fileExt}`
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from("blog_images")
      .upload(`public/${fileName}`, image)

    if (uploadError) {
      console.error("Upload Error:", uploadError)
      return { success: false, message: "Errore nel caricamento dell'immagine." }
    }

    const { data: urlData } = supabaseAdmin.storage.from("blog_images").getPublicUrl(uploadData.path)
    imageUrl = urlData.publicUrl
  }

  const articleData = {
    title,
    slug,
    content,
    excerpt: excerpt || content.substring(0, 150) + "...",
    category_id,
    status,
    image_url: imageUrl,
    author_id: user.id,
    published_at: status === "published" ? new Date().toISOString() : null,
    read_time_minutes,
  }

  let error
  if (id) {
    // Update
    const { error: updateError } = await supabaseAdmin
      .from("blog_articles")
      .update({ ...articleData, slug: id ? undefined : slug }) // don't update slug on existing posts for now
      .eq("id", id)
    error = updateError
  } else {
    // Create
    const { error: createError } = await supabaseAdmin.from("blog_articles").insert({ ...articleData, slug })
    error = createError
  }

  if (error) {
    console.error("DB Error:", error)
    return { success: false, message: `Errore nel salvataggio: ${error.message}` }
  }

  revalidatePath("/admin/blog-management")
  revalidatePath("/astromag")
  revalidatePath(`/astromag/articolo/${slug}`)
  revalidatePath(`/astromag/${category_id}`) // This won't work directly, need category slug

  return { success: true, message: "Articolo salvato con successo!" }
}

export async function deleteArticle(id: string) {
  const supabaseAdmin = createAdminClient()
  const { error } = await supabaseAdmin.from("blog_articles").delete().eq("id", id)

  if (error) {
    return { success: false, message: `Errore eliminazione: ${error.message}` }
  }

  revalidatePath("/admin/blog-management")
  revalidatePath("/astromag")
  return { success: true, message: "Articolo eliminato." }
}

// Public data fetching functions
export async function getPublicArticles(options: { categorySlug?: string; limit?: number } = {}) {
  const supabase = createClient()
  let query = supabase
    .from("blog_articles")
    .select(
      `
      *,
      author:profiles(full_name),
      category:blog_categories(name, slug)
    `,
    )
    .eq("status", "published")
    .order("published_at", { ascending: false })

  if (options.categorySlug) {
    const { data: category } = await supabase
      .from("blog_categories")
      .select("id")
      .eq("slug", options.categorySlug)
      .single()
    if (category) {
      query = query.eq("category_id", category.id)
    }
  }

  if (options.limit) {
    query = query.limit(options.limit)
  }

  const { data, error } = await query
  if (error) console.error("Error fetching public articles:", error)
  return data || []
}

export async function getPublicArticleBySlug(slug: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("blog_articles")
    .select(
      `
      *,
      author:profiles(full_name),
      category:blog_categories(name, slug)
    `,
    )
    .eq("slug", slug)
    .eq("status", "published")
    .single()

  if (error) {
    console.error("Error fetching article by slug:", error)
    return null
  }
  return data
}

export async function getPublicCategories() {
  const supabase = createClient()
  const { data, error } = await supabase.from("blog_categories").select("*").order("name")
  if (error) console.error("Error fetching categories:", error)
  return data || []
}

// Admin data fetching
export async function getAdminArticles() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("blog_articles")
    .select("*, category:blog_categories(name)")
    .order("created_at", { ascending: false })
  if (error) console.error("Error fetching admin articles:", error)
  return data || []
}

export async function getAdminCategories() {
  const supabase = createClient()
  const { data, error } = await supabase.from("blog_categories").select("*").order("name")
  if (error) console.error("Error fetching admin categories:", error)
  return data || []
}
