"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"
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
  const [isLoadingUser, setIsLoadingUser] = useState(true)
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }, [supabase.auth, router])

  // Effect 1: Get the user from Supabase auth state changes
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setIsLoadingUser(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  // Effect 2: Get the profile when the user object is available or changes
  useEffect(() => {
    if (user) {
      setIsLoadingProfile(true)
      fetchProfileSafely(user.id)
        .then((userProfile) => {
          if (userProfile) {
            setProfile(userProfile)
          } else {
            toast.error("Profilo non trovato. Verrai disconnesso.")
            logout()
          }
        })
        .finally(() => {
          setIsLoadingProfile(false)
        })
    } else {
      // If there's no user, ensure profile is also null.
      setProfile(null)
    }
  }, [user, logout])

  const isLoading = isLoadingUser || isLoadingProfile

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
