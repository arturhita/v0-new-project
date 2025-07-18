"use client"

import Link from "next/link"
import { BellRing, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { markNotificationAsRead } from "@/lib/actions/notifications.actions"
import { useTransition } from "react"
import { cn } from "@/lib/utils"

type Notification = {
  id: string
  message: string
  link: string | null
  is_read: boolean
  created_at: string
}

export function NotificationItem({ notification }: { notification: Notification }) {
  const [isPending, startTransition] = useTransition()

  const handleMarkAsRead = () => {
    if (notification.is_read) return
    startTransition(() => {
      markNotificationAsRead(notification.id)
    })
  }

  const content = (
    <div className="flex items-center space-x-4">
      <div className={cn("p-2 rounded-full", notification.is_read ? "bg-gray-100" : "bg-blue-100")}>
        <BellRing className={cn("h-5 w-5", notification.is_read ? "text-gray-500" : "text-blue-600")} />
      </div>
      <div className="flex-1 space-y-1">
        <p className={cn("text-sm", notification.is_read ? "text-muted-foreground" : "font-medium")}>
          {notification.message}
        </p>
        <p className="text-xs text-muted-foreground">{new Date(notification.created_at).toLocaleString("it-IT")}</p>
      </div>
      {!notification.is_read && (
        <Button variant="ghost" size="sm" onClick={handleMarkAsRead} disabled={isPending} aria-label="Mark as read">
          <Check className="h-4 w-4" />
          {isPending ? "..." : "Letto"}
        </Button>
      )}
    </div>
  )

  return (
    <div className="p-4 hover:bg-gray-50 transition-colors">
      {notification.link ? (
        <Link href={notification.link} className="block" onClick={handleMarkAsRead}>
          {content}
        </Link>
      ) : (
        <div className="cursor-pointer" onClick={handleMarkAsRead}>
          {content}
        </div>
      )}
    </div>
  )
}
