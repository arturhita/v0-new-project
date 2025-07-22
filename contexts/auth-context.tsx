"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { usePathname, useRouter } from "next/navigation"
import LoadingSpinner from "@/components/loading-spinner"
import { toast } from "sonner"
import { runUserDiagnostics } from "@/lib/actions/diagnostics.actions"

interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  role: "client" | "operator" | "admin"
}

type AuthContextType = {
  user: User | null
  profile: Profile | null
  isAuthenticated: boolean
  isLoading: boolean
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const fetchProfileWithRetry = async (
  supabase: ReturnType<typeof createClient>,
  userId: string,
  retries = 5,
  delay = 1000,
): Promise<Profile | null> => {
  for (let i = 0; i < retries; i++) {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, role")
      .eq("id", userId)
      .single()

    if (data) {
      console.log(`Profilo trovato con query diretta (Tentativo ${i + 1}):`, data)
      return data as Profile
    }

    if (error && error.code !== "PGRST116") {
      console.error(`Errore DB nella query del profilo (Tentativo ${i + 1}):`, error)
      toast.error("Errore di sistema nel recupero del profilo.")
      return null
    }

    console.warn(`Profilo per l'utente ${userId} non trovato (Tentativo ${i + 1}). Riprovo...`)
    await new Promise((res) => setTimeout(res, delay))
  }

  // --- NEW DIAGNOSTIC STEP ---
  console.error(`Profilo per l'utente ${userId} non trovato dopo ${retries} tentativi. Avvio diagnostica...`)
  toast.error("Impossibile trovare il profilo utente. Avvio diagnostica automatica...")

  const diagnostics = await runUserDiagnostics(userId)
  console.log("RISULTATO DIAGNOSTICA:", diagnostics)

  if (diagnostics.profile_found) {
    console.error(
      "CONCLUSIONE DIAGNOSTICA: Il profilo ESISTE ma non è accessibile. Il problema è quasi certamente nelle policy RLS del database.",
    )
    toast.error("Diagnostica: Problema di permessi rilevato. Contattare l'assistenza.")
  } else if (diagnostics.auth_user_found) {
    console.error(
      "CONCLUSIONE DIAGNOSTICA: L'utente esiste ma il profilo NO. Il problema è nel processo di creazione del profilo durante la registrazione.",
    )
    toast.error("Diagnostica: Profilo utente mancante. Contattare l'assistenza.")
  } else {
    console.error("CONCLUSIONE DIAGNOSTICA: L'utente non esiste. Problema critico di autenticazione.")
    toast.error("Diagnostica: Errore utente critico. Contattare l'assistenza.")
  }
  // --- END DIAGNOSTIC STEP ---

  return null
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const router = useRouter()
  const pathname = usePathname()

  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    router.replace("/login")
  }, [supabase.auth, router])

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setIsLoading(true)
      const currentUser = session?.user ?? null

      if (currentUser) {
        const userProfile = await fetchProfileWithRetry(supabase, currentUser.id)

        if (userProfile) {
          setUser(currentUser)
          setProfile(userProfile)
        } else {
          console.error(`Logout forzato: impossibile recuperare il profilo per l'utente ${currentUser.id}.`)
          toast.error("Sessione terminata. Impossibile verificare il profilo utente.")
          await supabase.auth.signOut()
          setUser(null)
          setProfile(null)
        }
      } else {
        setUser(null)
        setProfile(null)
      }
      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  useEffect(() => {
    if (isLoading) {
      return
    }

    const isAuthPage = pathname === "/login" || pathname === "/register"
    const isProtectedPage = pathname.startsWith("/dashboard") || pathname.startsWith("/admin")

    if (!user && isProtectedPage) {
      router.replace("/login")
      return
    }

    if (user && profile && isAuthPage) {
      let destination = "/"
      if (profile.role === "admin") destination = "/admin/dashboard"
      else if (profile.role === "operator") destination = "/dashboard/operator"
      else if (profile.role === "client") destination = "/dashboard/client"
      router.replace(destination)
    }
  }, [user, profile, isLoading, pathname, router])

  if (isLoading) {
    return <LoadingSpinner fullScreen />
  }

  return (
    <AuthContext.Provider value={{ user, profile, isAuthenticated: !!user, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
