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
  // Add any other profile fields you need in the context
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
    console.log("[AuthContext] logout: Signing out.")
    await supabase.auth.signOut()
    // No need to set user/profile to null here, onAuthStateChange will handle it.
    router.push("/login")
  }, [supabase.auth, router])

  const checkUser = useCallback(async () => {
    console.log("[AuthContext] checkUser: Starting auth check.")
    try {
      // Use getSession to check for a client-side session
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        console.log("[AuthContext] checkUser: Session found. Fetching profile.")
        // If a session exists, fetch the profile using the secure server action
        const { profile: userProfile, error } = await getCurrentUserProfile()

        if (error || !userProfile) {
          console.error("[AuthContext] checkUser: Profile fetch failed. Forcing logout.", error)
          toast.error("Errore critico nel caricamento del profilo. Verrai disconnesso.")
          await supabase.auth.signOut()
          setUser(null)
          setProfile(null)
        } else {
          console.log("[AuthContext] checkUser: Profile fetched successfully.", userProfile.role)
          setUser(session.user)
          setProfile(userProfile as Profile)
        }
      } else {
        console.log("[AuthContext] checkUser: No session found.")
        setUser(null)
        setProfile(null)
      }
    } catch (e) {
      console.error("[AuthContext] checkUser: Critical error during auth check.", e)
      setUser(null)
      setProfile(null)
    } finally {
      // This is crucial. Loading is set to false only after the entire check is complete.
      if (isLoading) {
        console.log("[AuthContext] checkUser: Auth check finished. Setting isLoading to false.")
        setIsLoading(false)
      }
    }
  }, [supabase.auth, isLoading]) // Depend on isLoading to prevent setting it to false multiple times

  useEffect(() => {
    // Run the check on initial component mount
    checkUser()

    // Listen for auth state changes (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(`[AuthContext] onAuthStateChange: Event received - ${event}`)
      // When the auth state changes, re-run the entire check to ensure consistency
      checkUser()
    })

    // Cleanup the subscription on component unmount
    return () => {
      subscription.unsubscribe()
    }
  }, [checkUser, supabase.auth])

  // Render a full-screen loader ONLY during the initial check.
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
