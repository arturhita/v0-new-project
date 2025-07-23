"use client"

import { logout } from "@/lib/actions/auth.actions"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

export function AuthButton() {
  const handleLogout = async () => {
    await logout()
  }

  return (
    <form action={handleLogout}>
      <Button variant="ghost" size="sm" className="w-full justify-start">
        <LogOut className="mr-2 h-4 w-4" />
        <span>Esci</span>
      </Button>
    </form>
  )
}
