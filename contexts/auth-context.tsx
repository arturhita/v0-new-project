"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { usePathname, useRouter } from "next/navigation"
import LoadingSpinner from "@/components/loading-spinner"
import { getProfileBypass, getProfileDirect } from "@/lib/supabase/bypass-client"

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

const fetchProfileSafely = async (userId: string): Promise<Profile | null> => {
  try {
    console.log(`[Auth] Fetching profile for user: ${userId}`)
    let profileData = await getProfileBypass(userId)
    if (!profileData) {
      console.log("[Auth] Bypass failed, trying direct query.")
      profileData = await getProfileDirect(userId)
    }

    if (profileData) {
      console.log(`[Auth] Profile loaded successfully:`, profileData)
      return {
        id: profileData.id,
        full_name: profileData.full_name,
        avatar_url: profileData.avatar_url,
        role: profileData.role as "client" | "operator" | "admin",
      }
    }
    console.warn(`[Auth] No profile found for user ${userId} with any method.`)
    return null
  } catch (error) {
    console.error(`[Auth] Critical error in fetchProfileSafely:`, error)
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
    console.log("[Auth] Logging out...")
    await supabase.auth.signOut()
    router.push("/login")
  }, [supabase.auth, router])

  useEffect(() => {
    const checkInitialSession = async () => {
      console.log("[Auth] Performing initial session check...")
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()

      if (error) {
        console.error("[Auth] Error getting initial session:", error)
        setIsLoading(false)
        return
      }

      if (session) {
        console.log("[Auth] Active session found on initial check.")
        const userProfile = await fetchProfileSafely(session.user.id)
        if (userProfile) {
          setUser(session.user)
          setProfile(userProfile)
          console.log("[Auth] Initial user and profile set.")
        } else {
          console.error("[Auth] Session exists but no profile. Forcing logout.")
          await supabase.auth.signOut()
        }
      }
      setIsLoading(false)
      console.log("[Auth] Initial session check complete. Loading is false.")
    }

    checkInitialSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`[Auth] Auth state changed, event: ${event}`)
      if (event === "SIGNED_IN" && session) {
        const userProfile = await fetchProfileSafely(session.user.id)
        setUser(session.user)
        setProfile(userProfile)
      } else if (event === "SIGNED_OUT") {
        setUser(null)
        setProfile(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase.auth])

  useEffect(() => {
    if (isLoading) return

    const isAuthenticated = !!user && !!profile
    const isAuthPage = pathname === "/login" || pathname === "/register"
    const isProtectedPage = pathname.startsWith("/dashboard") || pathname.startsWith("/admin")

    if (!isAuthenticated && isProtectedPage) {
      console.log(`[Auth] Redirecting to /login from protected route: ${pathname}`)
      router.replace("/login")
      return
    }

    if (isAuthenticated && isAuthPage) {
      let destination = "/"
      if (profile.role === "admin") destination = "/admin/dashboard"
      else if (profile.role === "operator") destination = "/dashboard/operator"
      else if (profile.role === "client") destination = "/dashboard/client"

      console.log(`[Auth] Redirecting from auth page to: ${destination}`)
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
