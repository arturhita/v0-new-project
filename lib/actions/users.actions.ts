import { createAdminClient } from "../supabase/admin"

export async function getAllUsers() {
  const supabaseAdmin = createAdminClient()
  try {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers()

    if (error) {
      console.error("Error fetching users:", error)
      return { error: error.message }
    }

    return { users: data.users }
  } catch (error: any) {
    console.error("Unexpected error fetching users:", error)
    return { error: error.message }
  }
}

export async function updateUserRole(userId: string, newRole: string) {
  const supabaseAdmin = createAdminClient()
  try {
    // Assuming you have a 'profiles' table with user roles
    const { data, error } = await supabaseAdmin.from("profiles").update({ role: newRole }).eq("id", userId)

    if (error) {
      console.error("Error updating user role:", error)
      return { error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    console.error("Unexpected error updating user role:", error)
    return { error: error.message }
  }
}

export async function deleteUser(userId: string) {
  const supabaseAdmin = createAdminClient()
  try {
    const { data, error } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (error) {
      console.error("Error deleting user:", error)
      return { error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    console.error("Unexpected error deleting user:", error)
    return { error: error.message }
  }
}
