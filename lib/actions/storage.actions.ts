"use server"

import { createSupabaseAdminClient } from "@/lib/supabase/admin"
import { randomUUID } from "crypto"

export async function generateSignedUploadUrl(fileDetails: {
  fileType: string
  fileSize: number
}): Promise<{ success: boolean; error?: string; data?: { path: string; signedUrl: string; publicUrl: string } }> {
  const supabaseAdmin = createSupabaseAdminClient()

  const maxFileSize = 5 * 1024 * 1024 // 5MB
  if (fileDetails.fileSize > maxFileSize) {
    return { success: false, error: "Il file non deve superare i 5MB." }
  }

  const allowedFileTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
  if (!allowedFileTypes.includes(fileDetails.fileType)) {
    return { success: false, error: "Tipo di file non valido. Sono ammessi solo JPG, PNG, WEBP, GIF." }
  }

  try {
    const fileExtension = fileDetails.fileType.split("/")[1]
    const path = `public/${randomUUID()}.${fileExtension}`

    const { data, error } = await supabaseAdmin.storage.from("avatars").createSignedUploadUrl(path, 60) // URL valido per 60 secondi

    if (error) {
      console.error("Errore creazione signed URL:", error)
      throw new Error("Impossibile generare l'URL di caricamento.")
    }

    const { data: publicUrlData } = supabaseAdmin.storage.from("avatars").getPublicUrl(path)

    return {
      success: true,
      data: {
        path,
        signedUrl: data.signedUrl,
        publicUrl: publicUrlData.publicUrl,
      },
    }
  } catch (error: any) {
    console.error("Catch block in generateSignedUploadUrl:", error)
    return { success: false, error: error.message }
  }
}
