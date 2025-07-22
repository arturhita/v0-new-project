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
  const [isLoading, setIsLoading] = useState(true)

  const logout = useCallback(async () => {
    console.log("[AuthContext] Logging out user.")
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    router.replace("/login")
  }, [supabase.auth, router])

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`[AuthContext] Auth state changed. Event: ${event}`)
      setIsLoading(true)
      const currentUser = session?.user

      if (currentUser) {
        const userProfile = await fetchProfileSafely(currentUser.id)
        if (userProfile) {
          console.log("[AuthContext] User and profile are valid. Setting state.")
          setUser(currentUser)
          setProfile(userProfile)
        } else {
          console.error(
            "[AuthContext] Profile fetch failed for authenticated user. Forcing logout to prevent auth loop.",
          )
          toast.error("Errore critico: impossibile caricare il profilo. Verrai disconnesso.")
          await supabase.auth.signOut()
          setUser(null)
          setProfile(null)
        }
      } else {
        console.log("[AuthContext] User is not authenticated. Clearing state.")
        setUser(null)
        setProfile(null)
      }
      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  useEffect(() => {
    if (isLoading) return

    const isAuthPage = pathname === "/login" || pathname === "/register"
    const isProtectedPage = pathname.startsWith("/dashboard") || pathname.startsWith("/admin")
    const isAuthenticated = !!user && !!profile

    console.log(
      `[AuthContext] Route check. Path: ${pathname}, IsProtected: ${isProtectedPage}, IsAuthenticated: ${isAuthenticated}`,
    )

    if (!isAuthenticated && isProtectedPage) {
      console.log("[AuthContext] Redirecting to /login (unauthenticated on protected page).")
      router.replace("/login")
      return
    }

    if (isAuthenticated && isAuthPage) {
      let destination = "/"
      if (profile.role === "admin") destination = "/admin/dashboard"
      else if (profile.role === "operator") destination = "/dashboard/operator"
      else if (profile.role === "client") destination = "/dashboard/client"
      console.log(`[AuthContext] Redirecting to ${destination} (authenticated on auth page).`)
      router.replace(destination)
    }
  }, [user, profile, isLoading, pathname, router])

  if (isLoading) {
    return <LoadingSpinner fullScreen />
  }

  return (
    <AuthContext.Provider value={{ user, profile, isAuthenticated: !!user && !!profile, isLoading, logout }}>
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
