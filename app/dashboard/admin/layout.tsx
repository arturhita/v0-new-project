import type React from "react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { UserNav } from "@/components/user-nav"
import { Button } from "@/components/ui/button"
import { Bell, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white px-4">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CP</span>
            </div>
            <h2 className="text-lg font-semibold text-red-600">ConsultaPro Admin</h2>
            <Badge variant="destructive">ADMIN</Badge>
          </div>
          <div className="ml-auto flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
                3
              </Badge>
            </Button>
            <Button variant="ghost" size="icon">
              <AlertTriangle className="h-4 w-4" />
            </Button>
            <UserNav role="admin" />
          </div>
        </header>
        <main className="flex-1 space-y-4 p-8 pt-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
