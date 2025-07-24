"use client"

import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "./ui/button"
import { LogOut } from "lucide-react"

export default function LogoutButton({ className }: { className?: string }) {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    // Clear local storage as well
    localStorage.removeItem("user")
    localStorage.removeItem("userRole")
    localStorage.removeItem("userData")
    router.push("/")
    router.refresh()
  }

  return (
    <Button variant="ghost" onClick={handleLogout} className={className}>
      <LogOut className="mr-2 h-4 w-4" />
      Logout
    </Button>
  )
}
