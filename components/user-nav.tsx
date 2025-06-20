"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, Settings, LogOut, CreditCard, Bell, HelpCircle } from "lucide-react"

interface UserNavProps {
  role?: "user" | "operator" | "admin"
}

export function UserNav({ role = "user" }: UserNavProps) {
  const getUserInfo = () => {
    switch (role) {
      case "admin":
        return { name: "Admin", email: "admin@consultapro.com", credits: null }
      case "operator":
        return { name: "Luna Stellare", email: "luna@consultapro.com", credits: "€1,247.50" }
      default:
        return { name: "Mario Rossi", email: "mario@example.com", credits: "€45.50" }
    }
  }

  const userInfo = getUserInfo()

  const handleLogout = () => {
    if (confirm("Sei sicuro di voler uscire?")) {
      try {
        // Pulizia dati sessione
        if (typeof window !== "undefined") {
          localStorage.removeItem("user")
          localStorage.removeItem("token")
          localStorage.removeItem("userRole")
          localStorage.removeItem("userData")
          sessionStorage.clear()

          // Pulizia cookies se presenti
          document.cookie.split(";").forEach((c) => {
            document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
          })
        }

        // Feedback visivo migliorato
        const toast = document.createElement("div")
        toast.className =
          "fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2"
        toast.innerHTML = `
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <span>Logout effettuato con successo</span>
        `
        document.body.appendChild(toast)

        // Animazione di uscita
        setTimeout(() => {
          toast.style.transform = "translateX(100%)"
          toast.style.opacity = "0"
        }, 1500)

        // Rimozione toast
        setTimeout(() => {
          document.body.removeChild(toast)
        }, 2000)

        // Reindirizzamento
        setTimeout(() => {
          window.location.href = "/login"
        }, 1000)
      } catch (error) {
        console.error("Errore durante il logout:", error)
        // Fallback: reindirizza comunque
        window.location.href = "/login"
      }
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8 ring-2 ring-pink-200">
            <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
            <AvatarFallback className="bg-gradient-to-r from-pink-200 to-blue-200">
              {userInfo.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userInfo.name}</p>
            <p className="text-xs leading-none text-muted-foreground">{userInfo.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {role !== "admin" && (
            <>
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profilo</span>
              </DropdownMenuItem>
              {userInfo.credits && (
                <DropdownMenuItem>
                  <CreditCard className="mr-2 h-4 w-4" />
                  <span>
                    {role === "operator" ? "Guadagni" : "Crediti"}: {userInfo.credits}
                  </span>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem>
                <Bell className="mr-2 h-4 w-4" />
                <span>Notifiche</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <HelpCircle className="mr-2 h-4 w-4" />
                <span>Supporto</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Impostazioni</span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuGroup>
        {role !== "admin" && <DropdownMenuSeparator />}
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Esci</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
