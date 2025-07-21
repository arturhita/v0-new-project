"use server"

import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import type { BlogArticle, BlogCategory } from "@/types/blog.types"

const ArticleSchema = z.object({
  title: z.string().min(3, "Il titolo è obbligatorio"),
  slug: z
    .string()
    .min(3, "Lo slug è obbligatorio")
    .regex(/^[a-z0-9-]+$/, "Slug può contenere solo lettere minuscole, numeri e trattini."),
  excerpt: z.string().optional(),
  content: z.string().min(10, "Il contenuto è obbligatorio"),
  category_id: z.string().uuid("Categoria non valida"),
  status: z.enum(["draft", "published"]),
  read_time_minutes: z.coerce.number().int().positive().optional(),
})

export async function getArticles(
  options: { limit?: number; categorySlug?: string; status?: "published" | "draft" | "all" } = {},
): Promise<BlogArticle[]> {
  const supabase = createClient()
  let query = supabase
    .from("blog_articles")
    .select(`
      id, title, slug, excerpt, image_url, status, published_at, read_time_minutes,
      blog_categories (name, slug),
      profiles (full_name)
    `)
    .order("published_at", { ascending: false, nullsFirst: true })

  if (options.limit) {
    query = query.limit(options.limit)
  }
  if (options.categorySlug) {
    const { data: category } = await supabase
      .from("blog_categories")
      .select("id")
      .eq("slug", options.categorySlug)
      .single()
    if (category) {
      query = query.eq("category_id", category.id)
    } else {
      return []
    }
  }
  if (options.status && options.status !== "all") {
    query = query.eq("status", options.status)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching articles:", error)
    return []
  }
  return data as any
}

export async function getArticleBySlug(slug: string): Promise<BlogArticle | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("blog_articles")
    .select(`*, blog_categories (name, slug), profiles (full_name, avatar_url)`)
    .eq("slug", slug)
    .eq("status", "published")
    .single()

  if (error) {
    // Don't log 'not found' errors
    if (error.code !== "PGRST116") {
      console.error("Error fetching article by slug:", error)
    }
    return null
  }
  return data as any
}

export async function getCategories(): Promise<BlogCategory[]> {
  const supabase = createClient()
  const { data, error } = await supabase.from("blog_categories").select("*").order("name")
  if (error) {
    console.error("Error fetching categories:", error)
    return []
  }
  return data
}

export async function getCategoryBySlug(slug: string): Promise<BlogCategory | null> {
  const supabase = createClient()
  const { data, error } = await supabase.from("blog_categories").select("*").eq("slug", slug).single()
  if (error) {
    if (error.code !== "PGRST116") {
      console.error("Error fetching category by slug:", error)
    }
    return null
  }
  return data
}

export async function upsertArticle(prevState: any, formData: FormData) {
  const supabase = createClient()
  const supabaseAdmin = createAdminClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, message: "Non autorizzato" }

  const validatedFields = ArticleSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    excerpt: formData.get("excerpt"),
    content: formData.get("content"),
    category_id: formData.get("category_id"),
    status: formData.get("status"),
    read_time_minutes: formData.get("read_time_minutes"),
  })

  if (!validatedFields.success) {
    return { success: false, message: "Dati non validi", errors: validatedFields.error.flatten().fieldErrors }
  }

  const articleId = formData.get("articleId") as string | null
  const imageFile = formData.get("image") as File
  let imageUrl = (formData.get("currentImageUrl") as string) || null

  if (imageFile && imageFile.size > 0) {
    const fileName = `${user.id}/${Date.now()}-${imageFile.name}`
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from("blog_images")
      .upload(fileName, imageFile)

    if (uploadError) {
      console.error("Storage Error:", uploadError)
      return { success: false, message: `Errore nel caricamento dell'immagine: ${uploadError.message}` }
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("blog_images").getPublicUrl(uploadData.path)
    imageUrl = publicUrl
  }

  const articleData = {
    ...validatedFields.data,
    author_id: user.id,
    image_url: imageUrl,
    published_at: validatedFields.data.status === "published" ? new Date().toISOString() : null,
  }

  let dbResponse
  if (articleId) {
    dbResponse = await supabase.from("blog_articles").update(articleData).eq("id", articleId).select().single()
  } else {
    dbResponse = await supabase.from("blog_articles").insert(articleData).select().single()
  }

  const { error, data: articleResult } = dbResponse

  if (error) {
    console.error("Database Error:", error)
    if (error.code === "23505") {
      // Unique constraint violation
      return { success: false, message: "Lo slug inserito è già in uso. Scegline un altro." }
    }
    return { success: false, message: `Errore nel salvataggio dell'articolo: ${error.message}` }
  }

  const category = await getCategoryBySlug(validatedFields.data.slug)
  revalidatePath("/admin/blog-management")
  revalidatePath("/astromag")
  revalidatePath(`/astromag/articolo/${validatedFields.data.slug}`)
  if (category) {
    revalidatePath(`/astromag/${category.slug}`)
  }

  return { success: true, message: `Articolo ${articleId ? "aggiornato" : "creato"} con successo!` }
}

export async function deleteArticle(articleId: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from("blog_articles").delete().eq("id", articleId)

  if (error) {
    return { success: false, message: `Errore durante l'eliminazione: ${error.message}` }
  }

  revalidatePath("/admin/blog-management")
  revalidatePath("/astromag")

  return { success: true, message: "Articolo eliminato con successo." }
}
