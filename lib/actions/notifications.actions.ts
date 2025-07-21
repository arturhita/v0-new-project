"use server"

export async function sendBroadcastNotification(message: string) {
  console.log(`Broadcasting notification: ${message}`)
  // In a real app, this would interact with a push notification service
  return { success: true, message: "Notifica inviata (simulato)." }
}
