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
  const [isLoading, setIsLoading] = useState(true) // Start loading

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    // Middleware will handle redirecting from protected pages.
    // We can push to login for a faster client-side transition.
    router.push("/login")
  }, [supabase.auth, router])

  useEffect(() => {
    // This effect runs once on mount to check the initial session
    // and then sets up the listener for auth changes.
    const checkInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session) {
        const userProfile = await fetchProfileSafely(session.user.id)
        setUser(session.user)
        setProfile(userProfile)
      }
      setIsLoading(false) // Initial check is done
    }

    checkInitialSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      // This listener keeps the state in sync when auth changes happen
      // in another tab or during login/logout actions.
      if (session) {
        const userProfile = await fetchProfileSafely(session.user.id)
        setUser(session.user)
        setProfile(userProfile)
      } else {
        setUser(null)
        setProfile(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase.auth])

  // The initial loading state is crucial to prevent flicker and race conditions.
  // The UI will not render until the initial auth status is known.
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
