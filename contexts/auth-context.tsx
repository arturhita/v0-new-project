"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"

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
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({
  user: initialUser,
  profile: initialProfile,
  children,
}: {
  user: User | null
  profile: Profile | null
  children: React.ReactNode
}) {
  const supabase = createClient()
  const router = useRouter()

  const [user, setUser] = useState(initialUser)
  const [profile, setProfile] = useState(initialProfile)

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh() // Assicura che i server component vengano ri-renderizzati
  }, [supabase.auth, router])

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN") {
        // Un login è avvenuto, ricarica la pagina per sincronizzare lo stato del server
        router.refresh()
      } else if (event === "SIGNED_OUT") {
        setUser(null)
        setProfile(null)
        router.push("/login")
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase.auth, router])

  // Sincronizza lo stato del context se le props fornite dal server cambiano
  useEffect(() => {
    setUser(initialUser)
    setProfile(initialProfile)
  }, [initialUser, initialProfile])

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAuthenticated: !!user && !!profile,
        logout,
      }}
    >
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
