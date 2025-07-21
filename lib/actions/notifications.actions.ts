"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  is_read: boolean
  created_at: string
  updated_at: string
}

export async function createNotification(notificationData: {
  user_id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
}) {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from("notifications")
      .insert({
        ...notificationData,
        is_read: false,
      })
      .select()
      .single()

    if (error) throw error

    return { success: true, notification: data }
  } catch (error) {
    console.error("Error creating notification:", error)
    return { success: false, error: "Failed to create notification" }
  }
}

export async function getUserNotifications(userId?: string) {
  const supabase = createClient()

  try {
    let targetUserId = userId
    if (!targetUserId) {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return []
      targetUserId = user.id
    }

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", targetUserId)
      .order("created_at", { ascending: false })

    if (error) throw error

    return data || []
  } catch (error) {
    console.error("Error fetching user notifications:", error)
    return []
  }
}

export async function markNotificationAsRead(notificationId: string) {
  const supabase = createClient()

  try {
    const { error } = await supabase
      .from("notifications")
      .update({
        is_read: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", notificationId)

    if (error) throw error

    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("Error marking notification as read:", error)
    return { success: false, error: "Failed to mark notification as read" }
  }
}

export async function markAllNotificationsAsRead(userId?: string) {
  const supabase = createClient()

  try {
    let targetUserId = userId
    if (!targetUserId) {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        return { success: false, error: "User not authenticated" }
      }
      targetUserId = user.id
    }

    const { error } = await supabase
      .from("notifications")
      .update({
        is_read: true,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", targetUserId)
      .eq("is_read", false)

    if (error) throw error

    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("Error marking all notifications as read:", error)
    return { success: false, error: "Failed to mark all notifications as read" }
  }
}

export async function deleteNotification(notificationId: string) {
  const supabase = createClient()

  try {
    const { error } = await supabase.from("notifications").delete().eq("id", notificationId)

    if (error) throw error

    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("Error deleting notification:", error)
    return { success: false, error: "Failed to delete notification" }
  }
}

export async function getUnreadNotificationCount(userId?: string) {
  const supabase = createClient()

  try {
    let targetUserId = userId
    if (!targetUserId) {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return 0
      targetUserId = user.id
    }

    const { count, error } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", targetUserId)
      .eq("is_read", false)

    if (error) throw error

    return count || 0
  } catch (error) {
    console.error("Error fetching unread notification count:", error)
    return 0
  }
}

export async function sendBulkNotification(notificationData: {
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  user_role?: "client" | "operator" | "admin"
  user_ids?: string[]
}) {
  const supabase = createClient()

  try {
    let targetUserIds: string[] = []

    if (notificationData.user_ids) {
      targetUserIds = notificationData.user_ids
    } else if (notificationData.user_role) {
      const { data: users, error } = await supabase.from("profiles").select("id").eq("role", notificationData.user_role)

      if (error) throw error
      targetUserIds = (users || []).map((user) => user.id)
    } else {
      // Send to all users
      const { data: users, error } = await supabase.from("profiles").select("id")

      if (error) throw error
      targetUserIds = (users || []).map((user) => user.id)
    }

    // Create notifications for all target users
    const notifications = targetUserIds.map((userId) => ({
      user_id: userId,
      title: notificationData.title,
      message: notificationData.message,
      type: notificationData.type,
      is_read: false,
    }))

    const { error } = await supabase.from("notifications").insert(notifications)

    if (error) throw error

    return { success: true, count: notifications.length }
  } catch (error) {
    console.error("Error sending bulk notification:", error)
    return { success: false, error: "Failed to send bulk notification" }
  }
}
