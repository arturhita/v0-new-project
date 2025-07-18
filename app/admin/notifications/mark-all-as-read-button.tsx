"use client"

import { Button } from "@/components/ui/button"
import { markAllNotificationsAsRead } from "@/lib/actions/notifications.actions"
import { useTransition } from "react"

export function MarkAllAsReadButton() {
  const [isPending, startTransition] = useTransition()

  const handleMarkAllAsRead = () => {
    startTransition(() => {
      markAllNotificationsAsRead()
    })
  }

  return (
    <Button onClick={handleMarkAllAsRead} disabled={isPending}>
      {isPending ? "Segnando..." : "Segna tutte come lette"}
    </Button>
  )
}
