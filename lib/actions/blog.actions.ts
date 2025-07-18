"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { unstable_noStore as noStore } from "next/cache"

function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

export async function getPosts() {
  noStore()
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase
    .from("posts")
    .select("*, author:profiles(full_name)")
    .order("created_at", { ascending: false })
  if (error) return []
  return data
}

export async function createPost(formData: FormData) {
  const supabase = createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, message: "Non autorizzato" }

  const title = formData.get("title") as string
  const content = formData.get("content") as string
  const status = formData.get("status") as string
  const category = formData.get("category") as string
  const featured_image_url = formData.get("featured_image_url") as string

  const postData = {
    title,
    content,
    status,
    category,
    featured_image_url,
    slug: createSlug(title),
    author_id: user.id,
    published_at: status === "published" ? new Date().toISOString() : null,
  }

  const { error } = await supabase.from("posts").insert(postData)
  if (error) return { success: false, message: error.message }

  revalidatePath("/admin/blog-management")
  revalidatePath("/astromag")
  return { success: true, message: "Post creato." }
}
