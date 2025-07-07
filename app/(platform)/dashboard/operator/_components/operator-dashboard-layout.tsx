"use client"

import type React from "react"
import { OperatorSidebar } from "./operator-sidebar"
import { IncomingChatRequestModal } from "@/components/incoming-chat-request-modal"
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { MenuIcon } from "lucide-react"
import { OperatorHeader } from "./operator-header"

export function OperatorDashboardLayoutContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-blue-800 md:block">
        <OperatorSidebar />
      </div>
      <div className="flex flex-col">
        <header className="flex h-20 items-center gap-4 border-b bg-white px-4 lg:px-6 sticky top-16 md:top-0 z-30">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 md:hidden bg-transparent">
                <MenuIcon className="h-5 w-5" />
                <span className="sr-only">Apri/Chiudi menu navigazione</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col bg-blue-800 p-0 w-[280px] border-r-0">
              <OperatorSidebar />
            </SheetContent>
          </Sheet>
          <OperatorHeader />
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-gray-50">{children}</main>
        <IncomingChatRequestModal />
      </div>
    </div>
  )
}

export default OperatorDashboardLayoutContent
