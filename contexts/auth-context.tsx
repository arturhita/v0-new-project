"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { User, Session } from "@supabase/supabase-js"
import LoadingSpinner from "@/components/loading-spinner"

interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  stage_name: string | null
  role: "client" | "operator" | "admin"
}

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  isLoading: boolean
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      const currentUser = session?.user ?? null
      setUser(currentUser)

      if (currentUser) {
        const { data: userProfile, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", currentUser.id)
          .single()

        if (error) {
          console.error("Error fetching profile on auth change:", error)
          setProfile(null)
        } else {
          setProfile(userProfile)
          // Centralized redirection logic
          if (event === "SIGNED_IN") {
            switch (userProfile.role) {
              case "admin":
                router.push("/admin/dashboard")
                break
              case "operator":
                router.push("/dashboard/operator")
                break
              case "client":
              default:
                router.push("/dashboard/client")
                break
            }
          }
        }
      } else {
        setProfile(null)
      }
      // This listener handles ongoing changes, but the initial load is what matters for the flicker
    })

    // Initial session check - THIS IS CRUCIAL
    const checkInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setSession(session)
      const currentUser = session?.user ?? null
      setUser(currentUser)

      if (currentUser) {
        const { data: userProfile, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", currentUser.id)
          .single()
        if (!error) setProfile(userProfile)
      }
      // Only set loading to false after the initial check is complete
      setIsLoading(false)
    }

    checkInitialSession()

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router])

  const logout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  const value = {
    user,
    profile,
    session,
    isLoading,
    logout,
  }

  const protectedRoutes = ["/admin", "/dashboard", "/profile"]
  const isProtectedRoute = protectedRoutes.some((path) => pathname.startsWith(path))

  // THE KEY FIX: Do not render children or run protection logic until the initial load is complete.
  if (isLoading) {
    return <LoadingSpinner fullScreen={true} />
  }

  // This logic now only runs AFTER isLoading is false and we know the true auth state.
  if (!user && isProtectedRoute) {
    if (typeof window !== "undefined") {
      router.push("/login")
    }
    // Return a loader while redirecting to prevent rendering the protected page.
    return <LoadingSpinner fullScreen={true} />
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
