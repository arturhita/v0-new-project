"use server"

import { z } from "zod"
import { createSupabaseServerClient } from "../supabase/server"
import { createSupabaseAdminClient } from "../supabase/admin"
import { revalidatePath } from "next/cache"
import type { BlogArticle, BlogCategory } from "@/types/blog.types"

const ArticleSchema = z.object({
  title: z.string().min(3, "Il titolo è obbligatorio"),
  slug: z
    .string()
    .min(3, "Lo slug è obbligatorio")
    .regex(/^[a-z0-9-]+$/, "Slug non valido"),
  excerpt: z.string().optional(),
  content: z.string().min(10, "Il contenuto è obbligatorio"),
  categoryId: z.string().uuid("Categoria non valida"),
  status: z.enum(["draft", "published"]),
  readTimeMinutes: z.coerce.number().int().positive().optional(),
})

export async function getArticles(
  options: { limit?: number; categorySlug?: string; status?: "published" | "draft" } = {},
) {
  const supabase = createSupabaseServerClient()
  let query = supabase
    .from("blog_articles")
    .select(`
      *,
      blog_categories (name, slug),
      profiles (full_name, avatar_url)
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
      return [] // Category not found
    }
  }
  if (options.status) {
    query = query.eq("status", options.status)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching articles:", error)
    return []
  }
  return data as BlogArticle[]
}

export async function getArticleBySlug(slug: string) {
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase
    .from("blog_articles")
    .select(`
      *,
      blog_categories (name, slug),
      profiles (full_name, avatar_url)
    `)
    .eq("slug", slug)
    .eq("status", "published")
    .single()

  if (error) {
    console.error("Error fetching article by slug:", error)
    return null
  }
  return data as BlogArticle
}

export async function getCategories(): Promise<BlogCategory[]> {
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase.from("blog_categories").select("*")
  if (error) {
    console.error("Error fetching categories:", error)
    return []
  }
  return data
}

export async function getCategoryBySlug(slug: string): Promise<BlogCategory | null> {
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase.from("blog_categories").select("*").eq("slug", slug).single()
  if (error) {
    console.error("Error fetching category by slug:", error)
    return null
  }
  return data
}

export async function upsertArticle(prevState: any, formData: FormData) {
  const supabase = createSupabaseServerClient()
  const supabaseAdmin = createSupabaseAdminClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, message: "Non autorizzato" }

  const validatedFields = ArticleSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    excerpt: formData.get("excerpt"),
    content: formData.get("content"),
    categoryId: formData.get("categoryId"),
    status: formData.get("status"),
    readTimeMinutes: formData.get("readTimeMinutes"),
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
    category_id: validatedFields.data.categoryId,
    read_time_minutes: validatedFields.data.readTimeMinutes,
  }

  // @ts-ignore
  delete articleData.categoryId

  let dbResponse
  if (articleId) {
    // Update
    dbResponse = await supabase.from("blog_articles").update(articleData).eq("id", articleId).select().single()
  } else {
    // Insert
    dbResponse = await supabase.from("blog_articles").insert(articleData).select().single()
  }

  const { error } = dbResponse

  if (error) {
    console.error("Database Error:", error)
    return { success: false, message: `Errore nel salvataggio dell'articolo: ${error.message}` }
  }

  revalidatePath("/admin/blog-management")
  revalidatePath("/astromag")
  revalidatePath(`/astromag/articolo/${validatedFields.data.slug}`)
  revalidatePath(`/astromag/${(await getCategoryBySlug(validatedFields.data.slug))?.slug || ""}`)

  return { success: true, message: `Articolo ${articleId ? "aggiornato" : "creato"} con successo!` }
}

export async function deleteArticle(articleId: string) {
  const supabase = createSupabaseAdminClient()
  const { error } = await supabase.from("blog_articles").delete().eq("id", articleId)

  if (error) {
    return { success: false, message: `Errore durante l'eliminazione: ${error.message}` }
  }

  revalidatePath("/admin/blog-management")
  revalidatePath("/astromag")

  return { success: true, message: "Articolo eliminato con successo." }
}
