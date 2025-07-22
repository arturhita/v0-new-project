"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"
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

  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const logout = useCallback(async () => {
    console.log("[AuthContext] Signing out.")
    await supabase.auth.signOut()
    router.push("/login")
  }, [supabase.auth, router])

  useEffect(() => {
    console.log("[AuthContext] Setting up auth state listener.")
    // onAuthStateChange fires once with the initial session, then on every auth event.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`[AuthContext] Auth event: ${event}`)
      if (session) {
        // User is logged in. Fetch their profile.
        const { profile: userProfile, error } = await getCurrentUserProfile()
        if (error || !userProfile) {
          console.error("[AuthContext] Profile fetch failed. Forcing logout.", error)
          toast.error("Errore critico nel caricamento del profilo. Verrai disconnesso.")
          await supabase.auth.signOut()
          setUser(null)
          setProfile(null)
        } else {
          // Profile fetched successfully. Update state.
          console.log("[AuthContext] User and profile set.", { userId: session.user.id, role: userProfile.role })
          setUser(session.user)
          setProfile(userProfile as Profile)
        }
      } else {
        // User is logged out. Clear state.
        console.log("[AuthContext] No session. Clearing user and profile.")
        setUser(null)
        setProfile(null)
      }
      // IMPORTANT: Set loading to false after the first check is complete.
      setIsLoading(false)
    })

    return () => {
      console.log("[AuthContext] Cleaning up auth subscription.")
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
