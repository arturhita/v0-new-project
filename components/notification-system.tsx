"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, X, Check, AlertTriangle, Info, CheckCircle, Clock, Mail, MessageSquare } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export interface Notification {
  id: string
  type: "info" | "success" | "warning" | "error" | "consultation" | "payment" | "system"
  title: string
  message: string
  timestamp: Date
  read: boolean
  actionUrl?: string
  actionLabel?: string
  priority: "low" | "medium" | "high"
  category: "dashboard" | "email" | "push"
}

interface NotificationSystemProps {
  userId: string
  userType: "client" | "operator" | "admin"
}

// Mock notifications
const generateMockNotifications = (userType: string): Notification[] => {
  const baseNotifications: Notification[] = [
    {
      id: "n1",
      type: "consultation",
      title: "Nuova consulenza richiesta",
      message: "Un cliente ha richiesto una consulenza di tarocchi",
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      read: false,
      actionUrl: "/dashboard/operator/consultations",
      actionLabel: "Accetta",
      priority: "high",
      category: "dashboard",
    },
    {
      id: "n2",
      type: "payment",
      title: "Pagamento ricevuto",
      message: "Hai ricevuto €25.50 per la consulenza completata",
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      read: false,
      priority: "medium",
      category: "dashboard",
    },
    {
      id: "n3",
      type: "info",
      title: "Aggiornamento profilo",
      message: "Ricordati di aggiornare la tua disponibilità",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: true,
      priority: "low",
      category: "dashboard",
    },
    {
      id: "n4",
      type: "system",
      title: "Manutenzione programmata",
      message: "Il sistema sarà in manutenzione domenica dalle 02:00 alle 04:00",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      read: false,
      priority: "medium",
      category: "email",
    },
  ]

  if (userType === "admin") {
    return [
      ...baseNotifications,
      {
        id: "n5",
        type: "warning",
        title: "Nuovo operatore da approvare",
        message: "3 nuovi operatori in attesa di approvazione",
        timestamp: new Date(Date.now() - 10 * 60 * 1000),
        read: false,
        actionUrl: "/admin/operator-approvals",
        actionLabel: "Rivedi",
        priority: "high",
        category: "dashboard",
      },
      {
        id: "n6",
        type: "error",
        title: "Problema tecnico rilevato",
        message: "Errore nel sistema di pagamenti - richiede attenzione",
        timestamp: new Date(Date.now() - 45 * 60 * 1000),
        read: false,
        priority: "high",
        category: "dashboard",
      },
    ]
  }

  return baseNotifications
}

export function NotificationSystem({ userId, userType }: NotificationSystemProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [filter, setFilter] = useState<"all" | "unread" | "high">("all")

  useEffect(() => {
    // Carica notifiche iniziali
    setNotifications(generateMockNotifications(userType))

    // Simula notifiche in tempo reale
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        // 30% di probabilità ogni 30 secondi
        const newNotification: Notification = {
          id: `n_${Date.now()}`,
          type: Math.random() > 0.5 ? "consultation" : "info",
          title: "Nuova notifica",
          message: "Hai ricevuto una nuova notifica in tempo reale",
          timestamp: new Date(),
          read: false,
          priority: "medium",
          category: "dashboard",
        }

        setNotifications((prev) => [newNotification, ...prev])

        // Mostra toast per notifiche ad alta priorità
        if (newNotification.priority === "high") {
          toast({
            title: newNotification.title,
            description: newNotification.message,
          })
        }
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [userType])

  const unreadCount = notifications.filter((n) => !n.read).length
  const highPriorityCount = notifications.filter((n) => n.priority === "high" && !n.read).length

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "unread") return !notification.read
    if (filter === "high") return notification.priority === "high"
    return true
  })

  const markAsRead = (notificationId: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const deleteNotification = (notificationId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
  }

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case "error":
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      case "consultation":
        return <MessageSquare className="h-5 w-5 text-blue-500" />
      case "payment":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "system":
        return <Info className="h-5 w-5 text-gray-500" />
      default:
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const getPriorityColor = (priority: Notification["priority"]) => {
    switch (priority) {
      case "high":
        return "border-l-red-500 bg-red-50"
      case "medium":
        return "border-l-yellow-500 bg-yellow-50"
      case "low":
        return "border-l-gray-500 bg-gray-50"
    }
  }

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "Ora"
    if (minutes < 60) return `${minutes} min fa`
    if (hours < 24) return `${hours} ore fa`
    return `${days} giorni fa`
  }

  // Simula invio email per notifiche importanti
  const sendEmailNotification = async (notification: Notification) => {
    if (notification.priority === "high" && notification.category === "email") {
      console.log("📧 Invio email per notifica:", notification.title)
      toast({
        title: "Email inviata",
        description: "Ti abbiamo inviato un'email per questa notifica importante",
      })
    }
  }

  useEffect(() => {
    notifications.forEach((notification) => {
      if (!notification.read && notification.priority === "high") {
        sendEmailNotification(notification)
      }
    })
  }, [notifications])

  return (
    <div className="relative">
      {/* Notification Bell */}
      <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)} className="relative hover:bg-sky-500/10">
        <Bell className="h-5 w-5 text-slate-300 hover:text-sky-400" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </Badge>
        )}
        {highPriorityCount > 0 && (
          <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse" />
        )}
      </Button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-96 max-h-96 bg-white border border-slate-200 rounded-lg shadow-xl z-50 overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-800">Notifiche</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs">
                    Segna tutte come lette
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-6 w-6">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 mt-3">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("all")}
                className="text-xs"
              >
                Tutte ({notifications.length})
              </Button>
              <Button
                variant={filter === "unread" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("unread")}
                className="text-xs"
              >
                Non lette ({unreadCount})
              </Button>
              <Button
                variant={filter === "high" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("high")}
                className="text-xs"
              >
                Urgenti ({highPriorityCount})
              </Button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nessuna notifica</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-slate-50 transition-colors border-l-4 ${getPriorityColor(notification.priority)} ${
                      !notification.read ? "bg-blue-50" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p
                              className={`text-sm font-medium ${!notification.read ? "text-slate-900" : "text-slate-700"}`}
                            >
                              {notification.title}
                            </p>
                            <p className="text-sm text-slate-600 mt-1">{notification.message}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs text-slate-500 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatTimestamp(notification.timestamp)}
                              </span>
                              {notification.category === "email" && (
                                <Badge variant="outline" className="text-xs">
                                  <Mail className="h-3 w-3 mr-1" />
                                  Email
                                </Badge>
                              )}
                              <Badge
                                variant={notification.priority === "high" ? "destructive" : "secondary"}
                                className="text-xs"
                              >
                                {notification.priority}
                              </Badge>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 ml-2">
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => markAsRead(notification.id)}
                                className="h-6 w-6"
                                title="Segna come letta"
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteNotification(notification.id)}
                              className="h-6 w-6"
                              title="Elimina"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        {notification.actionUrl && notification.actionLabel && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2 text-xs"
                            onClick={() => {
                              markAsRead(notification.id)
                              // In un'app reale, qui faresti il routing
                              console.log("Navigate to:", notification.actionUrl)
                            }}
                          >
                            {notification.actionLabel}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
