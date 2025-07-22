"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { useRouter, usePathname } from "next/navigation"
import LoadingSpinner from "@/components/loading-spinner"
import { toast } from "sonner"
import { getCurrentUserProfile } from "@/lib/actions/users.actions"

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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const router = useRouter()
  const pathname = usePathname()

  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const logout = useCallback(async () => {
    console.log("[AuthContext] Signing out.")
    await supabase.auth.signOut()
    // State will be cleared by the onAuthStateChange listener
    router.push("/login")
  }, [supabase.auth, router])

  const loadUser = useCallback(async () => {
    console.log("[AuthContext] loadUser triggered.")
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (session) {
      console.log("[AuthContext] Session found. Fetching profile from server.")
      const { profile: userProfile, error } = await getCurrentUserProfile()
      if (error || !userProfile) {
        console.error("[AuthContext] Profile fetch failed, forcing logout.", error)
        toast.error("Sessione non valida. Verrai disconnesso.")
        await supabase.auth.signOut()
        setUser(null)
        setProfile(null)
      } else {
        console.log("[AuthContext] Profile loaded successfully:", userProfile.role)
        setUser(session.user)
        setProfile(userProfile as Profile)
      }
    } else {
      console.log("[AuthContext] No session found.")
      setUser(null)
      setProfile(null)
    }
    setIsLoading(false)
  }, [supabase.auth])

  // Load user data on initial mount and on every route change.
  // This is more robust than relying on onAuthStateChange for loading profile data.
  useEffect(() => {
    console.log(`[AuthContext] Path changed to: ${pathname}. Reloading user.`)
    setIsLoading(true)
    loadUser()
  }, [pathname, loadUser])

  // We still use onAuthStateChange for instant logout UI updates.
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        console.log("[AuthContext] SIGNED_OUT event detected. Clearing state.")
        setUser(null)
        setProfile(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase.auth])

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
