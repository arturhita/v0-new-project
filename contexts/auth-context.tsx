"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
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
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    supabase
      .from("profiles")
      .select("*")
      .eq("id", user?.id)
      .single()
      .then(({ data, error }) => {
        if (data) {
          setProfile(data as Profile)
        } else {
          console.error("Error fetching profile:", error)
          setProfile(null)
        }
      })
  }, [user?.id, supabase])

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)

      supabase
        .from("profiles")
        .select("*")
        .eq("id", session?.user?.id)
        .single()
        .then(({ data, error }) => {
          if (data) {
            setProfile(data as Profile)
          } else {
            console.error("Error fetching profile:", error)
            setProfile(null)
          }
        })
      router.refresh()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router, supabase])

  const logout = async () => {
    await supabase.auth.signOut()
    // Il listener onAuthStateChange attiverà router.refresh().
    // I layout protetti aggiornati reindirizzeranno quindi a /login.
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAuthenticated: !!user,
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
