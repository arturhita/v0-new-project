"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { v4 as uuidv4 } from "uuid"

const supabase = createClient()

export async function uploadStory(formData: FormData) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, message: "Utente non autenticato." }

  const file = formData.get("story_media") as File
  if (!file || file.size === 0) {
    return { success: false, message: "Nessun file fornito." }
  }

  const fileExtension = file.name.split(".").pop()
  const fileName = `${user.id}/${uuidv4()}.${fileExtension}`

  const { error: uploadError } = await supabase.storage.from("stories").upload(fileName, file)

  if (uploadError) {
    console.error("Error uploading story:", uploadError)
    return { success: false, message: "Errore durante il caricamento del file." }
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("stories").getPublicUrl(fileName)

  const expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 ore da adesso

  const { error: dbError } = await supabase.from("stories").insert({
    operator_id: user.id,
    media_url: publicUrl,
    media_type: file.type.startsWith("video") ? "video" : "image",
    expires_at: expires_at,
  })

  if (dbError) {
    console.error("Error saving story to db:", dbError)
    return { success: false, message: "Errore durante il salvataggio della storia." }
  }

  revalidatePath("/dashboard/operator/stories")
  revalidatePath(`/operator/${user.user_metadata.stage_name}`)
  return { success: true, message: "Storia caricata con successo!" }
}

export async function getActiveStories(operatorId: string) {
  const { data, error } = await supabase
    .from("stories")
    .select("*")
    .eq("operator_id", operatorId)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: true })

  if (error) {
    console.error("Error fetching stories:", error)
    return []
  }
  return data
}

export async function deleteStory(storyId: string, mediaUrl: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, message: "Utente non autenticato." }

  // Delete from database
  const { error: dbError } = await supabase.from("stories").delete().match({ id: storyId, operator_id: user.id })
  if (dbError) {
    console.error("Error deleting story from db:", dbError)
    return { success: false, message: "Errore durante l'eliminazione della storia." }
  }

  // Delete from storage
  const fileName = mediaUrl.split("/stories/")[1]
  const { error: storageError } = await supabase.storage.from("stories").remove([fileName])
  if (storageError) {
    console.error("Error deleting story from storage:", storageError)
    // Non bloccare se il file non esiste, ma logga l'errore
  }

  revalidatePath("/dashboard/operator/stories")
  revalidatePath(`/operator/${user.user_metadata.stage_name}`)
  return { success: true, message: "Storia eliminata." }
}
