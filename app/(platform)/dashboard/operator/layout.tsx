"use client"

import type React from "react"
import { OperatorStatusProvider } from "@/contexts/operator-status-context"
import { ChatRequestProvider } from "@/contexts/chat-request-context"
import { ProtectedRoute } from "@/components/protected-route"
import { OperatorSidebar } from "./_components/operator-sidebar"
import { IncomingChatRequestModal } from "@/components/incoming-chat-request-modal"
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { MenuIcon } from "lucide-react"

function OperatorDashboardLayoutComponent({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-gray-50">
      <OperatorSidebar />
      <div className="flex flex-1 flex-col">
        <header className="flex h-20 items-center gap-4 border-b bg-white/95 backdrop-blur-sm px-4 md:px-6 sticky top-0 z-30 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden rounded-lg border-2 border-gray-300 text-gray-600 hover:bg-gray-100 bg-transparent"
              >
                <MenuIcon className="h-6 w-6" />
                <span className="sr-only">Apri menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col bg-blue-800 p-0 w-[300px] border-r-0">
              <OperatorSidebar />
            </SheetContent>
          </Sheet>
          <h1 className="text-xl font-semibold text-gray-800">Dashboard Operatore</h1>
        </header>
        <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">
          {children}
          <IncomingChatRequestModal />
        </main>
      </div>
    </div>
  )
}

export default function OperatorDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={["operator"]}>
      <OperatorStatusProvider>
        <ChatRequestProvider>
          <OperatorDashboardLayoutComponent>{children}</OperatorDashboardLayoutComponent>
        </ChatRequestProvider>
      </OperatorStatusProvider>
    </ProtectedRoute>
  )
}
