"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"
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

  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true) // Always start loading

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }, [supabase.auth, router])

  useEffect(() => {
    // This is the standard and most robust way to handle auth state.
    // onAuthStateChange fires once immediately with the current session,
    // and then again whenever the auth state changes.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`[AuthContext] Auth event: ${event}`)
      if (session) {
        // User is logged in. Fetch their profile.
        const userProfile = await fetchProfileSafely(session.user.id)
        setUser(session.user)
        setProfile(userProfile)
      } else {
        // User is logged out.
        setUser(null)
        setProfile(null)
      }
      // Crucially, set loading to false only after the first check is complete.
      setIsLoading(false)
    })

    return () => {
      // Cleanup the subscription when the component unmounts.
      subscription.unsubscribe()
    }
  }, [supabase.auth])

  // Render a full-screen loader until the initial auth state is determined.
  // This prevents any UI flicker or race conditions.
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
