"use server"

import { revalidatePath } from "next/cache"

export async function sendBroadcastNotification(
  title: string,
  message: string,
  targetAudience: "all" | "clients" | "operators",
  priority: "low" | "normal" | "high" = "normal",
) {
  try {
    console.log("Sending broadcast notification:", {
      title,
      message,
      targetAudience,
      priority,
    })

    // Simulate sending notification
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // In a real app, this would send push notifications, emails, etc.
    const recipientCount = targetAudience === "all" ? 1000 : targetAudience === "clients" ? 750 : 250

    revalidatePath("/admin/notifications")

    return {
      success: true,
      message: `Notifica inviata a ${recipientCount} utenti`,
      recipientCount,
    }
  } catch (error) {
    console.error("Error sending broadcast notification:", error)
    return {
      success: false,
      message: "Errore nell'invio della notifica",
    }
  }
}

export async function sendPersonalNotification(
  userId: string,
  title: string,
  message: string,
  type: "info" | "warning" | "success" | "error" = "info",
) {
  try {
    console.log("Sending personal notification:", {
      userId,
      title,
      message,
      type,
    })

    await new Promise((resolve) => setTimeout(resolve, 500))

    return {
      success: true,
      message: "Notifica personale inviata con successo",
    }
  } catch (error) {
    console.error("Error sending personal notification:", error)
    return {
      success: false,
      message: "Errore nell'invio della notifica personale",
    }
  }
}

export async function getNotificationHistory(limit = 50) {
  try {
    // Mock notification history
    const notifications = Array.from({ length: limit }, (_, i) => ({
      id: `notif_${i + 1}`,
      title: `Notifica ${i + 1}`,
      message: `Messaggio di esempio ${i + 1}`,
      targetAudience: ["all", "clients", "operators"][i % 3],
      sentAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
      recipientCount: Math.floor(Math.random() * 1000) + 100,
      status: "sent",
    }))

    return {
      success: true,
      notifications,
    }
  } catch (error) {
    console.error("Error fetching notification history:", error)
    return {
      success: false,
      notifications: [],
    }
  }
}
