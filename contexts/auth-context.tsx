"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import LoadingSpinner from "@/components/loading-spinner"
import { useRouter, usePathname } from "next/navigation"

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
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()
  const pathname = usePathname()

  const getSessionAndProfile = useCallback(async () => {
    // Non impostare isLoading a true qui per evitare sfarfallii durante gli aggiornamenti
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session?.user) {
        if (user?.id !== session.user.id) {
          // Prendi il profilo solo se l'utente è cambiato
          const { data: userProfile, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single()
          setProfile(error ? null : userProfile)
        }
        setUser(session.user)
      } else {
        setUser(null)
        setProfile(null)
      }
    } catch (e) {
      console.error("Error in getSessionAndProfile:", e)
      setUser(null)
      setProfile(null)
    } finally {
      setIsLoading(false)
    }
  }, [supabase, user?.id])

  useEffect(() => {
    getSessionAndProfile()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        getSessionAndProfile()
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [getSessionAndProfile])

  // Questo effetto gestisce il reindirizzamento degli utenti già loggati
  // se tentano di visitare le pagine di login/registrazione.
  useEffect(() => {
    if (isLoading) return

    const isAuthPage = pathname === "/login" || pathname === "/register"

    if (user && isAuthPage) {
      const role = profile?.role
      let destination = "/"
      if (role === "admin") destination = "/admin/dashboard"
      else if (role === "operator") destination = "/dashboard/operator"
      else if (role === "client") destination = "/dashboard/client"
      router.replace(destination)
    }
  }, [user, profile, isLoading, pathname, router])

  // La schermata di caricamento iniziale è fondamentale per evitare che
  // il contenuto protetto venga mostrato brevemente prima che la sessione sia verificata.
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-gradient-to-br from-[#000020] via-[#1E3C98] to-[#000020]">
        <LoadingSpinner />
      </div>
    )
  }

  return <AuthContext.Provider value={{ user, profile, isLoading }}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
