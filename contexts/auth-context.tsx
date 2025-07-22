"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { usePathname, useRouter } from "next/navigation"
import LoadingSpinner from "@/components/loading-spinner"
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

const fetchProfileWithRetry = async (
  supabase: ReturnType<typeof createClient>,
  userId: string,
  retries = 5,
  delay = 1200,
): Promise<Profile | null> => {
  for (let i = 0; i < retries; i++) {
    // The error was happening here because of a recursive RLS policy.
    // The new '069-ultimate-auth-reset.sql' script fixes the policy.
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, role")
      .eq("id", userId)
      .single()

    if (data) {
      console.log(`[AuthContext] Profile found for ${userId} on attempt ${i + 1}.`)
      return data as Profile
    }

    // PGRST116 means "No rows found", which is expected during the small delay
    // between user creation and profile trigger execution. We retry for this.
    // Any other error is a real problem.
    if (error && error.code !== "PGRST116") {
      console.error(`[AuthContext] FATAL: Database error fetching profile for ${userId} (Attempt ${i + 1}):`, error)
      toast.error("Errore critico del database nel recupero del profilo.")
      return null
    }

    console.warn(`[AuthContext] Profile for ${userId} not found (Attempt ${i + 1}). Retrying...`)
    await new Promise((res) => setTimeout(res, delay))
  }

  console.error(
    `[AuthContext] FATAL: Profile for ${userId} not found after ${retries} attempts. This is a critical error.`,
  )
  toast.error("Impossibile trovare il profilo utente dopo vari tentativi. La sessione sarà terminata.")
  return null
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const router = useRouter()
  const pathname = usePathname()

  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    // Setting state to null immediately provides a faster UI response
    setUser(null)
    setProfile(null)
    router.replace("/login")
  }, [supabase.auth, router])

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`[AuthContext] Auth state changed. Event: ${event}, Session: ${session ? "Exists" : "Null"}`)
      setIsLoading(true)
      const currentUser = session?.user ?? null

      if (currentUser) {
        const userProfile = await fetchProfileWithRetry(supabase, currentUser.id)

        if (userProfile) {
          setUser(currentUser)
          setProfile(userProfile)
        } else {
          // If the profile is not found after all retries, it's a critical failure.
          // Force a logout to prevent an inconsistent state.
          console.error(`[AuthContext] Forcing logout: Could not retrieve profile for user ${currentUser.id}.`)
          await supabase.auth.signOut()
          setUser(null)
          setProfile(null)
        }
      } else {
        setUser(null)
        setProfile(null)
      }
      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router])

  useEffect(() => {
    if (isLoading) {
      return
    }

    const isAuthPage = pathname === "/login" || pathname === "/register"
    const isProtectedPage = pathname.startsWith("/dashboard") || pathname.startsWith("/admin")

    // If not authenticated and trying to access a protected page, redirect to login
    if (!user && isProtectedPage) {
      router.replace("/login")
      return
    }

    // If authenticated and on an auth page, redirect to the appropriate dashboard
    if (user && profile && isAuthPage) {
      let destination = "/"
      if (profile.role === "admin") destination = "/admin/dashboard"
      else if (profile.role === "operator") destination = "/dashboard/operator"
      else if (profile.role === "client") destination = "/dashboard/client"
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
