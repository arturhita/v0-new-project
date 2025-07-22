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
    console.log(`[AuthContext] Attempting to fetch profile for user: ${userId}`)
    let profileData = await getProfileBypass(userId)
    if (!profileData) {
      console.log("[AuthContext] Bypass failed, trying direct query")
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

    console.warn(`[AuthContext] No profile found for user ${userId}`)
    return null
  } catch (error) {
    console.error(`[AuthContext] Error in fetchProfileSafely:`, error)
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
    try {
      console.log("[AuthContext] Logging out user")
      await supabase.auth.signOut()
      setUser(null)
      setProfile(null)
      router.replace("/login")
    } catch (error) {
      console.error("[AuthContext] Error during logout:", error)
      setUser(null)
      setProfile(null)
      router.replace("/login")
    }
  }, [supabase.auth, router])

  useEffect(() => {
    console.log("[AuthContext] Setting up auth state listener")
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`[AuthContext] Auth state changed. Event: ${event}, Session: ${session ? "Exists" : "Null"}`)
      setIsLoading(true)
      const currentUser = session?.user ?? null
      if (currentUser) {
        console.log(`[AuthContext] User authenticated: ${currentUser.id}`)
        const userProfile = await fetchProfileSafely(currentUser.id)
        if (userProfile) {
          console.log(`[AuthContext] Profile loaded successfully for user ${currentUser.id}`)
          setUser(currentUser)
          setProfile(userProfile)
        } else {
          console.error(`[AuthContext] Could not load profile for user ${currentUser.id}`)
          toast.error("Errore nel caricamento del profilo utente")
          setUser(currentUser)
          setProfile(null)
        }
      } else {
        console.log(`[AuthContext] User not authenticated`)
        setUser(null)
        setProfile(null)
      }
      setIsLoading(false)
    })

    return () => {
      console.log("[AuthContext] Cleaning up auth state listener")
      subscription.unsubscribe()
    }
  }, [supabase])

  useEffect(() => {
    if (isLoading) {
      return
    }
    const isAuthPage = pathname === "/login" || pathname === "/register"
    const isProtectedPage = pathname.startsWith("/dashboard") || pathname.startsWith("/admin")
    if (!user && isProtectedPage) {
      console.log("[AuthContext] Redirecting to login - user not authenticated")
      router.replace("/login")
      return
    }
    if (user && isAuthPage) {
      let destination = "/"
      if (profile?.role === "admin") destination = "/admin/dashboard"
      else if (profile?.role === "operator") destination = "/dashboard/operator"
      else if (profile?.role === "client") destination = "/dashboard/client"
      console.log(`[AuthContext] Redirecting authenticated user to: ${destination}`)
      router.replace(destination)
    }
  }, [user, profile, isLoading, pathname, router])

  if (isLoading) {
    return <LoadingSpinner fullScreen />
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
