import { createAdminClient } from "../supabase/admin"

export async function createPromotion(formData: FormData) {
  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const discount = Number(formData.get("discount"))
  const code = formData.get("code") as string
  const startDate = formData.get("startDate") as string
  const endDate = formData.get("endDate") as string

  if (!name || !description || !discount || !code || !startDate || !endDate) {
    throw new Error("Missing required fields")
  }

  try {
    const supabaseAdmin = createAdminClient()

    const { data, error } = await supabaseAdmin
      .from("promotions")
      .insert([
        {
          name,
          description,
          discount,
          code,
          start_date: startDate,
          end_date: endDate,
        },
      ])
      .select()

    if (error) {
      console.log("Error creating promotion", error)
      return { message: "Error creating promotion" }
    }

    return { message: "Promotion created successfully", data }
  } catch (error) {
    console.error("Error creating promotion:", error)
    return { message: "Error creating promotion" }
  }
}

export async function getPromotions() {
  try {
    const supabaseAdmin = createAdminClient()
    const { data, error } = await supabaseAdmin.from("promotions").select("*")

    if (error) {
      console.error("Error getting promotions:", error)
      return { error: "Error getting promotions" }
    }

    return { data: data || [] }
  } catch (error) {
    console.error("Error getting promotions:", error)
    return { error: "Error getting promotions" }
  }
}

export async function deletePromotion(id: string) {
  try {
    const supabaseAdmin = createAdminClient()
    const { error } = await supabaseAdmin.from("promotions").delete().eq("id", id)

    if (error) {
      console.error("Error deleting promotion:", error)
      return { error: "Error deleting promotion" }
    }

    return { message: "Promotion deleted successfully" }
  } catch (error) {
    console.error("Error deleting promotion:", error)
    return { error: "Error deleting promotion" }
  }
}
