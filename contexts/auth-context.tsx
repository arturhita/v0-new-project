"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { useRouter, usePathname } from "next/navigation"
import LoadingSpinner from "@/components/loading-spinner"

type AuthContextType = {
  user: User | null
  profile: any | null
  isLoading: boolean
  checkUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()
  const pathname = usePathname()

  const checkUser = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (session?.user) {
      setUser(session.user)
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
      setUser(null)
      setProfile(null)
    }
    setIsLoading(false)
  }, [supabase])

  useEffect(() => {
    checkUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      checkUser()
    })

    return () => subscription.unsubscribe()
  }, [checkUser, supabase])

  useEffect(() => {
    if (!isLoading && user) {
      const role = profile?.role
      const isAuthPage = pathname === "/login" || pathname === "/register"

      if (isAuthPage) {
        if (role === "admin") router.push("/admin/dashboard")
        else if (role === "operator") router.push("/dashboard/operator")
        else router.push("/dashboard/client")
      }
    }
  }, [user, profile, isLoading, pathname, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-gradient-to-br from-[#000020] via-[#1E3C98] to-[#000020]">
        <LoadingSpinner />
      </div>
    )
  }

  return <AuthContext.Provider value={{ user, profile, isLoading, checkUser }}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
