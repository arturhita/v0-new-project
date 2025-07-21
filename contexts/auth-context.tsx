"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { useRouter, usePathname } from "next/navigation"
import LoadingSpinner from "@/components/loading-spinner"
import { logout as logoutAction } from "@/lib/actions/auth.actions"

type Profile = {
  id: string
  role: "client" | "operator" | "admin"
  full_name: string
  avatar_url: string
}

type AuthContextType = {
  user: User | null
  profile: Profile | null
  isLoading: boolean
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = createClient()
  const router = useRouter()
  const pathname = usePathname()

  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)

      if (currentUser) {
        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("id, role, full_name, avatar_url")
          .eq("id", currentUser.id)
          .maybeSingle()

        if (error) {
          console.error("Error fetching profile on auth change:", error.message)
          setProfile(null)
        } else {
          setProfile(profileData as Profile)
        }
      } else {
        setProfile(null)
      }
      setIsLoading(false)
    })

    // Fetch initial session
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) {
        setIsLoading(false)
        return
      }
      // If there's a session, the onAuthStateChange listener will fire and handle the rest.
    }
    getInitialSession()

    return () => {
      subscription?.unsubscribe()
    }
  }, [supabase])

  useEffect(() => {
    if (isLoading) return

    const isAuthPage = pathname === "/login" || pathname === "/register"
    const isProtectedPage = pathname.startsWith("/dashboard") || pathname.startsWith("/admin")

    if (user && profile) {
      if (isAuthPage) {
        const targetDashboard =
          profile.role === "admin"
            ? "/admin"
            : profile.role === "operator"
              ? "/dashboard/operator"
              : "/dashboard/client"
        router.replace(targetDashboard)
      }
    } else {
      if (isProtectedPage) {
        router.replace("/login")
      }
    }
  }, [user, profile, isLoading, pathname, router])

  const logout = async () => {
    await logoutAction()
    router.push("/login")
  }

  if (isLoading) {
    return <LoadingSpinner fullScreen />
  }

  return <AuthContext.Provider value={{ user, profile, isLoading, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
