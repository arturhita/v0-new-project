"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { v4 as uuidv4 } from "uuid"

export async function uploadStory(operatorId: string, formData: FormData) {
  const supabase = createClient()
  const file = formData.get("story_media") as File

  if (!file || file.size === 0) {
    return { success: false, message: "Nessun file selezionato." }
  }

  const fileExtension = file.name.split(".").pop()
  const mediaType = file.type.startsWith("video") ? "video" : "image"
  const fileName = `${operatorId}/${uuidv4()}.${fileExtension}`

  const { error: uploadError } = await supabase.storage.from("stories").upload(fileName, file)

  if (uploadError) {
    console.error("Error uploading story media:", uploadError)
    return { success: false, message: "Errore durante il caricamento del media." }
  }

  const { data: urlData } = supabase.storage.from("stories").getPublicUrl(fileName)

  const storyData = {
    operator_id: operatorId,
    media_url: urlData.publicUrl,
    media_type: mediaType,
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  }

  const { error: dbError } = await supabase.from("stories").insert(storyData)

  if (dbError) {
    console.error("Error saving story to database:", dbError)
    return { success: false, message: "Errore durante il salvataggio della storia." }
  }

  revalidatePath("/(platform)/dashboard/operator/stories")
  revalidatePath("/") // Revalidate home to show story indicator
  return { success: true, message: "Storia caricata con successo!" }
}

export async function getActiveStories(operatorId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("stories")
    .select("*")
    .eq("operator_id", operatorId)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching active stories:", error)
    return []
  }
  return data
}

export async function deleteStory(storyId: string) {
  const supabase = createClient()

  // Optional: delete file from storage first
  const { data: story } = await supabase.from("stories").select("media_url").eq("id", storyId).single()
  if (story) {
    const fileName = story.media_url.split("/").pop()
    if (fileName) {
      // This assumes the operatorId is in the path, which it should be
      const operatorId = story.media_url.split("/")[story.media_url.split("/").length - 2]
      await supabase.storage.from("stories").remove([`${operatorId}/${fileName}`])
    }
  }

  const { error } = await supabase.from("stories").delete().eq("id", storyId)
  if (error) {
    return { success: false, message: "Errore durante l'eliminazione della storia." }
  }

  revalidatePath("/(platform)/dashboard/operator/stories")
  return { success: true, message: "Storia eliminata." }
}
