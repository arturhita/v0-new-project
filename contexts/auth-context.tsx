"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { useRouter, usePathname } from "next/navigation"
import LoadingSpinner from "@/components/loading-spinner"

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

  const checkSession = useCallback(async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session) {
        const { data: userProfile, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single()

        if (error) {
          console.error("Error fetching profile, signing out.", error)
          await supabase.auth.signOut()
          setUser(null)
          setProfile(null)
        } else {
          setUser(session.user)
          setProfile(userProfile)
        }
      } else {
        setUser(null)
        setProfile(null)
      }
    } catch (e) {
      console.error("Error in checkSession:", e)
      setUser(null)
      setProfile(null)
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    checkSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        setUser(null)
        setProfile(null)
        router.push("/login")
      } else if (event === "SIGNED_IN") {
        checkSession()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [checkSession, supabase, router])

  useEffect(() => {
    if (isLoading) {
      return // Don't run route protection until session is checked
    }

    const isAuthPage = pathname === "/login" || pathname === "/register"
    const isProtectedRoute = pathname.startsWith("/dashboard") || pathname.startsWith("/admin")

    if (!user && isProtectedRoute) {
      router.push("/login")
    }

    if (user && isAuthPage) {
      const role = profile?.role
      let destination = "/"
      if (role === "admin") destination = "/admin/dashboard"
      else if (role === "operator") destination = "/dashboard/operator"
      else if (role === "client") destination = "/dashboard/client"
      router.push(destination)
    }
  }, [user, profile, isLoading, pathname, router])

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
