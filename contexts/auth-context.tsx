"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import LoadingSpinner from "@/components/loading-spinner"
import { usePathname, useRouter } from "next/navigation"

interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  role: "client" | "operator" | "admin"
}

type AuthContextType = {
  user: User | null
  profile: Profile | null
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true) // Inizia sempre come true
  const supabase = createClient()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Questo listener è la fonte unica di verità per lo stato di autenticazione.
    // Viene eseguito al caricamento iniziale e ogni volta che lo stato di auth cambia.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        // Se c'è una sessione, impostiamo l'utente
        setUser(session.user)
        // e carichiamo il suo profilo
        const { data: userProfile, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single()

        if (error) {
          console.error("Error fetching profile:", error)
          setProfile(null)
        } else {
          setProfile(userProfile)
        }
      } else {
        // Se non c'è sessione, puliamo tutto.
        setUser(null)
        setProfile(null)
      }
      // In ogni caso, dopo il primo controllo, smettiamo di caricare.
      setIsLoading(false)
    })

    // Pulisce il listener quando il componente viene smontato.
    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  // Questo effetto gestisce il reindirizzamento degli utenti già loggati
  // se tentano di visitare le pagine di login/registrazione.
  useEffect(() => {
    if (isLoading) return // Aspetta che lo stato di auth sia definito

    const isAuthPage = pathname === "/login" || pathname === "/register"

    if (user && profile && isAuthPage) {
      let destination = "/"
      if (profile.role === "admin") destination = "/admin/dashboard"
      else if (profile.role === "operator") destination = "/dashboard/operator"
      else if (profile.role === "client") destination = "/dashboard/client"
      router.replace(destination)
    }
  }, [user, profile, isLoading, pathname, router])

  // Mostra uno spinner a schermo intero solo durante il caricamento iniziale.
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-gradient-to-br from-[#000020] via-[#1E3C98] to-[#000020]">
        <LoadingSpinner />
      </div>
    )
  }

  return <AuthContext.Provider value={{ user, profile, isLoading: false }}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
