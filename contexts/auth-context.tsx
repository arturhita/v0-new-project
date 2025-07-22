"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { usePathname, useRouter } from "next/navigation"
import LoadingSpinner from "@/components/loading-spinner"
import { toast } from "sonner"
import { getProfileBypass, getProfileDirect } from "@/lib/supabase/bypass-client"

interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  role: "client" | "operator" | "admin"
}

type AuthState = "loading" | "authenticated" | "unauthenticated"

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
    console.log(`[AuthContext] Fetching profile for user: ${userId}`)
    let profileData = await getProfileBypass(userId)
    if (!profileData) {
      console.log("[AuthContext] Bypass failed, trying direct query.")
      profileData = await getProfileDirect(userId)
    }

    if (profileData) {
      console.log(`[AuthContext] Profile loaded successfully:`, profileData)
      return {
        id: profileData.id,
        full_name: profileData.full_name,
        avatar_url: profileData.avatar_url,
        role: profileData.role as "client" | "operator" | "admin",
      }
    }
    console.warn(`[AuthContext] No profile found for user ${userId} with any method.`)
    return null
  } catch (error) {
    console.error(`[AuthContext] Critical error in fetchProfileSafely:`, error)
    return null
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const router = useRouter()
  const pathname = usePathname()

  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [authState, setAuthState] = useState<AuthState>("loading")

  const logout = useCallback(async () => {
    console.log("[AuthContext] Logging out...")
    await supabase.auth.signOut()
    // onAuthStateChange will handle the state update and redirect
  }, [supabase.auth])

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`[AuthContext] onAuthStateChange event: ${event}`)
      const currentUser = session?.user

      if (currentUser) {
        const userProfile = await fetchProfileSafely(currentUser.id)
        if (userProfile) {
          setUser(currentUser)
          setProfile(userProfile)
          setAuthState("authenticated")
          console.log("[AuthContext] State -> authenticated")
        } else {
          console.error("[AuthContext] User has session but no profile. Forcing logout.")
          toast.error("Errore di sincronizzazione del profilo. Effettuare nuovamente il login.")
          await supabase.auth.signOut()
          // The signOut will trigger another onAuthStateChange, setting state to unauthenticated
        }
      } else {
        setUser(null)
        setProfile(null)
        setAuthState("unauthenticated")
        console.log("[AuthContext] State -> unauthenticated")
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  useEffect(() => {
    if (authState === "loading") {
      return // Do nothing while loading
    }

    const isAuthPage = pathname === "/login" || pathname === "/register"
    const isProtectedPage = pathname.startsWith("/dashboard") || pathname.startsWith("/admin")

    if (authState === "unauthenticated" && isProtectedPage) {
      console.log(`[AuthContext] Redirecting to /login from protected route: ${pathname}`)
      router.replace("/login")
    }

    if (authState === "authenticated" && isAuthPage) {
      let destination = "/"
      if (profile?.role === "admin") destination = "/admin/dashboard"
      else if (profile?.role === "operator") destination = "/dashboard/operator"
      else if (profile?.role === "client") destination = "/dashboard/client"

      console.log(`[AuthContext] Redirecting from auth page to: ${destination}`)
      router.replace(destination)
    }
  }, [authState, pathname, router, profile])

  // Render a loading spinner for the entire app while determining auth state.
  // This prevents any page content from rendering prematurely.
  if (authState === "loading") {
    return <LoadingSpinner fullScreen />
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAuthenticated: authState === "authenticated",
        isLoading: authState === "loading",
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
