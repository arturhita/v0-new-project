"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { usePathname, useRouter } from "next/navigation"
import LoadingSpinner from "@/components/loading-spinner"
import { getProfileBypass, getProfileDirect } from "@/lib/supabase/bypass-client"
import { toast } from "sonner"

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

const getDashboardUrl = (role: string | undefined): string => {
  if (role === "admin") return "/admin/dashboard"
  if (role === "operator") return "/dashboard/operator"
  if (role === "client") return "/dashboard/client"
  return "/"
}

const fetchProfileSafely = async (userId: string): Promise<Profile | null> => {
  try {
    const profileData = (await getProfileBypass(userId)) || (await getProfileDirect(userId))
    if (profileData) {
      return {
        id: profileData.id,
        full_name: profileData.full_name,
        avatar_url: profileData.avatar_url,
        role: profileData.role as "client" | "operator" | "admin",
      }
    }
    return null
  } catch (error) {
    console.error(`[AuthContext] Critical error fetching profile:`, error)
    return null
  }
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
    router.push("/login")
  }, [supabase.auth, router])

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`[AuthContext] Auth event: ${event}. Session: ${session ? "yes" : "no"}`)
      if (session) {
        const userProfile = await fetchProfileSafely(session.user.id)
        if (userProfile) {
          console.log("[AuthContext] User and profile loaded. Setting state.")
          setUser(session.user)
          setProfile(userProfile)
        } else {
          console.error(`[AuthContext] Profile not found for user ${session.user.id}. Forcing logout.`)
          toast.error("Profilo non trovato. Verrai disconnesso.")
          await supabase.auth.signOut()
          setUser(null)
          setProfile(null)
        }
      } else {
        console.log("[AuthContext] No session. Clearing state.")
        setUser(null)
        setProfile(null)
      }
      console.log("[AuthContext] Auth check complete. Setting isLoading to false.")
      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase.auth])

  useEffect(() => {
    if (isLoading) return

    const isAuthenticated = !!user && !!profile
    const isAuthPage = pathname === "/login" || pathname === "/register"
    const isProtectedRoute = pathname.startsWith("/admin") || pathname.startsWith("/dashboard")

    // This handles the redirect AFTER a successful login from a generic page.
    if (isAuthenticated && !isProtectedRoute && !isAuthPage) {
      const destination = getDashboardUrl(profile.role)
      console.log(`[AuthContext] Redirecting logged-in user to their dashboard: ${destination}`)
      router.replace(destination)
    }
  }, [isLoading, user, profile, pathname, router])

  if (isLoading) {
    return <LoadingSpinner fullScreen />
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAuthenticated: !!user && !!profile,
        isLoading,
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
