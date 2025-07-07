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
  const fileName = `${operatorId}/${uuidv4()}.${fileExtension}`

  const { error: uploadError } = await supabase.storage.from("stories").upload(fileName, file)

  if (uploadError) {
    console.error("Error uploading story:", uploadError)
    return { success: false, message: "Errore durante il caricamento del file." }
  }

  const { data } = supabase.storage.from("stories").getPublicUrl(fileName)
  const mediaUrl = data.publicUrl

  const { error: dbError } = await supabase.from("stories").insert({
    operator_id: operatorId,
    media_url: mediaUrl,
    media_type: file.type.startsWith("video") ? "video" : "image",
  })

  if (dbError) {
    console.error("Error saving story to db:", dbError)
    return { success: false, message: "Errore durante il salvataggio della storia." }
  }

  revalidatePath("/dashboard/operator/stories")
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
    console.error("Error fetching stories:", error)
    return []
  }
  return data
}

export async function deleteStory(storyId: string, mediaUrl: string) {
  const supabase = createClient()

  // Delete from database
  const { error: dbError } = await supabase.from("stories").delete().eq("id", storyId)
  if (dbError) {
    return { success: false, message: "Errore eliminazione dal database." }
  }

  // Delete from storage
  const fileName = mediaUrl.split("/stories/")[1]
  const { error: storageError } = await supabase.storage.from("stories").remove([fileName])
  if (storageError) {
    return { success: false, message: "Errore eliminazione dallo storage." }
  }

  revalidatePath("/dashboard/operator/stories")
  return { success: true, message: "Storia eliminata." }
}
