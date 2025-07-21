"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { LoadingSpinner } from "@/components/loading-spinner"
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
  isAuthenticated: boolean
  isLoading: boolean
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)
const supabase = createClient()

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    router.refresh()
  }, [router])

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)

      if (currentUser) {
        const { data: userProfile, error } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url, role")
          .eq("id", currentUser.id)
          .maybeSingle()

        if (error) {
          console.error("Errore nel recupero del profilo:", error.message)
          setProfile(null)
        } else {
          setProfile(userProfile)
        }
      } else {
        setProfile(null)
      }
      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (isLoading) {
      return
    }

    const isAuthPage = pathname === "/login" || pathname === "/register"
    const isProtectedRoute = pathname.startsWith("/dashboard") || pathname.startsWith("/admin")

    if (user && profile) {
      if (isAuthPage) {
        const { role } = profile
        let destination = "/"
        if (role === "admin") destination = "/admin/dashboard"
        else if (role === "operator") destination = "/dashboard/operator"
        else if (role === "client") destination = "/dashboard/client"
        router.replace(destination)
      }
    } else if (!user) {
      if (isProtectedRoute) {
        router.replace("/login")
      }
    }
  }, [isLoading, user, profile, pathname, router])

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-[#000020] via-[#1E3C98] to-[#000020]">
        <LoadingSpinner />
      </div>
    )
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
