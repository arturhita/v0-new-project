"use client"

import { useState } from "react"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Bell,
  BellRing,
  CheckCheck,
  Trash2,
  X,
  MessageSquare,
  CreditCard,
  Star,
  AlertCircle,
  Info,
  CheckCircle,
  AlertTriangle,
} from "lucide-react"
import { useNotifications, type Notification } from "@/lib/notifications"
import { formatDistanceToNow } from "date-fns"
import { it } from "date-fns/locale"

interface NotificationCenterProps {
  isOpen: boolean
  onClose: () => void
}

export function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const { notifications, unreadCount, markAsRead, markAllAsRead, remove, clear, requestPermission } = useNotifications()
  const [filter, setFilter] = useState<"all" | "unread">("all")

  const filteredNotifications = filter === "unread" ? notifications.filter((n) => !n.read) : notifications

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "message":
        return <MessageSquare className="h-4 w-4" />
      case "payment":
        return <CreditCard className="h-4 w-4" />
      case "consultation":
        return <Star className="h-4 w-4" />
      case "success":
        return <CheckCircle className="h-4 w-4" />
      case "warning":
        return <AlertTriangle className="h-4 w-4" />
      case "error":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  const getNotificationColor = (type: Notification["type"]) => {
    switch (type) {
      case "message":
        return "text-blue-400"
      case "payment":
        return "text-green-400"
      case "consultation":
        return "text-purple-400"
      case "success":
        return "text-green-400"
      case "warning":
        return "text-yellow-400"
      case "error":
        return "text-red-400"
      default:
        return "text-sky-400"
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id)
    }

    if (notification.actionUrl) {
      window.location.href = notification.actionUrl
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="fixed right-4 top-20 w-96 max-h-[80vh] bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-xl border border-sky-500/20 rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader className="border-b border-sky-500/20">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-400 flex items-center">
              <BellRing className="h-5 w-5 mr-2" />
              Notifiche
              {unreadCount > 0 && <Badge className="ml-2 bg-red-500 text-white">{unreadCount}</Badge>}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-white">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex gap-2">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("all")}
                className={filter === "all" ? "bg-sky-500 hover:bg-sky-600" : "border-sky-500/30 text-sky-300"}
              >
                Tutte ({notifications.length})
              </Button>
              <Button
                variant={filter === "unread" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("unread")}
                className={filter === "unread" ? "bg-sky-500 hover:bg-sky-600" : "border-sky-500/30 text-sky-300"}
              >
                Non lette ({unreadCount})
              </Button>
            </div>

            <div className="flex gap-1">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-sky-400 hover:text-sky-300"
                  title="Segna tutte come lette"
                >
                  <CheckCheck className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={clear}
                className="text-red-400 hover:text-red-300"
                title="Cancella tutte"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <ScrollArea className="h-96">
            {filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-slate-400">
                <Bell className="h-8 w-8 mb-2 opacity-50" />
                <p className="text-sm">{filter === "unread" ? "Nessuna notifica non letta" : "Nessuna notifica"}</p>
              </div>
            ) : (
              <div className="divide-y divide-sky-500/10">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-sky-500/5 transition-colors cursor-pointer ${
                      !notification.read ? "bg-sky-500/10" : ""
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 ${getNotificationColor(notification.type)}`}>
                        {getNotificationIcon(notification.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className={`text-sm font-medium ${notification.read ? "text-slate-300" : "text-white"}`}>
                            {notification.title}
                          </h4>
                          {!notification.read && <div className="w-2 h-2 bg-sky-400 rounded-full flex-shrink-0"></div>}
                        </div>

                        <p
                          className={`text-sm ${notification.read ? "text-slate-400" : "text-slate-200"} line-clamp-2`}
                        >
                          {notification.message}
                        </p>

                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-slate-500">
                            {formatDistanceToNow(notification.timestamp, {
                              addSuffix: true,
                              locale: it,
                            })}
                          </span>

                          <div className="flex items-center gap-2">
                            {notification.actionLabel && (
                              <span className="text-xs text-sky-400">{notification.actionLabel}</span>
                            )}

                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-slate-400 hover:text-red-400"
                              onClick={(e) => {
                                e.stopPropagation()
                                remove(notification.id)
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>

        {notifications.length === 0 && (
          <div className="p-4 border-t border-sky-500/20">
            <Button
              onClick={requestPermission}
              className="w-full bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white"
            >
              <Bell className="h-4 w-4 mr-2" />
              Abilita Notifiche Browser
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
