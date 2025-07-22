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

const fetchProfileSafely = async (userId: string): Promise<Profile | null> => {
  try {
    console.log(`[Auth] Fetching profile for user: ${userId}`)
    const profileData = (await getProfileBypass(userId)) || (await getProfileDirect(userId))

    if (profileData) {
      console.log(`[Auth] Profile loaded successfully:`, profileData)
      return {
        id: profileData.id,
        full_name: profileData.full_name,
        avatar_url: profileData.avatar_url,
        role: profileData.role as "client" | "operator" | "admin",
      }
    }
    console.warn(`[Auth] No profile found for user ${userId}.`)
    return null
  } catch (error) {
    console.error(`[Auth] Critical error fetching profile:`, error)
    return null
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const router = useRouter()
  const pathname = usePathname()

  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true) // Start as true

  const logout = useCallback(async () => {
    console.log("[Auth] Logging out...")
    await supabase.auth.signOut()
    // onAuthStateChange will handle state cleanup
  }, [supabase.auth])

  useEffect(() => {
    console.log("[Auth] Setting up auth state listener.")
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`[Auth] Event received: ${event}`)

      // If a session exists, user is potentially logged in
      if (session) {
        const userProfile = await fetchProfileSafely(session.user.id)
        // If profile exists, they are fully authenticated
        if (userProfile) {
          setUser(session.user)
          setProfile(userProfile)
        } else {
          // This is a critical error state: authenticated user with no profile.
          // Force a logout to prevent an invalid state.
          console.error("[Auth] User has session but no profile. Forcing logout.")
          toast.error("Errore di sincronizzazione del profilo. Verrai disconnesso.")
          await supabase.auth.signOut()
          setUser(null)
          setProfile(null)
        }
      } else {
        // If no session, user is logged out
        setUser(null)
        setProfile(null)
      }
      // Only set loading to false after all checks are complete
      setIsLoading(false)
    })

    return () => {
      console.log("[Auth] Cleaning up auth state listener.")
      subscription.unsubscribe()
    }
  }, [supabase.auth])

  useEffect(() => {
    // This effect handles all redirection logic based on the final auth state.
    // It only runs when the initial loading is complete.
    if (isLoading) {
      return
    }

    const isAuthenticated = !!user && !!profile
    const isAuthPage = pathname === "/login" || pathname === "/register"
    const isProtectedPage = pathname.startsWith("/dashboard") || pathname.startsWith("/admin")

    // If user is not authenticated but tries to access a protected page
    if (!isAuthenticated && isProtectedPage) {
      console.log(`[Auth] Redirecting unauthenticated user from ${pathname} to /login.`)
      router.replace("/login")
      return
    }

    // If user is authenticated but is on a login/register page
    if (isAuthenticated && isAuthPage) {
      let destination = "/"
      if (profile.role === "admin") destination = "/admin/dashboard"
      else if (profile.role === "operator") destination = "/dashboard/operator"
      else if (profile.role === "client") destination = "/dashboard/client"

      console.log(`[Auth] Redirecting authenticated user from ${pathname} to ${destination}.`)
      router.replace(destination)
    }
  }, [isLoading, user, profile, pathname, router])

  // Render a full-screen loader while the initial auth state is being determined.
  // This is the key to preventing the "flicker".
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
