"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

export async function getOperatorStories() {
  const supabase = createServerActionClient({ cookies })
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: { message: "Not authenticated" } }

  const { data, error } = await supabase
    .from("stories")
    .select("*")
    .eq("operator_id", user.id)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching stories:", error)
    return { error }
  }
  return { data }
}

export async function addStory(formData: FormData) {
  const supabase = createServerActionClient({ cookies })
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: { message: "Not authenticated" } }

  const file = formData.get("story_media") as File
  if (!file) return { error: { message: "Nessun file fornito." } }

  const filePath = `${user.id}/${Date.now()}-${file.name}`

  const { error: uploadError } = await supabase.storage.from("stories").upload(filePath, file)

  if (uploadError) {
    console.error("Error uploading story media:", uploadError)
    return { error: uploadError }
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("stories").getPublicUrl(filePath)

  const { error: dbError } = await supabase.from("stories").insert({
    operator_id: user.id,
    media_url: publicUrl,
    media_type: file.type.startsWith("video") ? "video" : "image",
  })

  if (dbError) {
    console.error("Error saving story to database:", dbError)
    return { error: dbError }
  }

  revalidatePath("/(platform)/dashboard/operator/stories")
  return { success: true, message: "Storia aggiunta con successo." }
}

export async function deleteStory(storyId: string, mediaUrl: string) {
  const supabase = createServerActionClient({ cookies })
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: { message: "Not authenticated" } }

  // Extract file path from URL
  const filePath = mediaUrl.split("/stories/")[1]

  // Delete from storage
  const { error: storageError } = await supabase.storage.from("stories").remove([filePath])

  if (storageError) {
    console.error("Error deleting story from storage:", storageError)
    // Non bloccare l'eliminazione dal DB se il file non esiste più
  }

  // Delete from database
  const { error: dbError } = await supabase.from("stories").delete().eq("id", storyId).eq("operator_id", user.id)

  if (dbError) {
    console.error("Error deleting story from database:", dbError)
    return { error: dbError }
  }

  revalidatePath("/(platform)/dashboard/operator/stories")
  return { success: true, message: "Storia eliminata." }
}
