"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { useRouter, usePathname } from "next/navigation"
import LoadingSpinner from "@/components/loading-spinner"

type Profile = {
  id: string
  full_name: string
  role: "admin" | "operator" | "client"
  // Add other profile fields as needed
}

type AuthContextType = {
  user: User | null
  profile: Profile | null
  isLoading: boolean
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = createClient()
  const router = useRouter()
  const pathname = usePathname()

  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    router.push("/login")
    router.refresh()
  }

  useEffect(() => {
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user) {
        setUser(session.user)
        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .maybeSingle()

        if (profileData) setProfile(profileData as Profile)
        if (error) console.error("Error fetching initial profile:", error.message)
      }
      setIsLoading(false)
    }

    getInitialSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setIsLoading(true)
      const currentUser = session?.user ?? null
      setUser(currentUser)

      if (currentUser) {
        try {
          const { data: userProfile, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", currentUser.id)
            .maybeSingle()

          if (error) {
            console.error("Error fetching profile on auth change:", error.message)
            setProfile(null)
          } else {
            setProfile(userProfile as Profile)
          }
        } catch (error) {
          console.error("Catched error fetching profile:", error)
          setProfile(null)
        }
      } else {
        setProfile(null)
      }
      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  useEffect(() => {
    const isAuthPage = pathname === "/login" || pathname === "/register"

    if (!isLoading) {
      if (user) {
        if (isAuthPage) {
          const userRole = profile?.role
          if (userRole === "admin") {
            router.replace("/admin/dashboard")
          } else if (userRole === "operator") {
            router.replace("/dashboard/operator")
          } else {
            router.replace("/dashboard/client")
          }
        }
      } else {
        // If user is not logged in and not on an auth page or other public pages, redirect to login
        const publicPaths = ["/", "/login", "/register", "/legal/privacy-policy", "/legal/terms-and-conditions"]
        const isPublic = publicPaths.some((path) => pathname.startsWith(path))
        if (!isPublic) {
          router.replace("/login")
        }
      }
    }
  }, [user, profile, isLoading, pathname, router])

  if (isLoading) {
    return <LoadingSpinner />
  }

  return <AuthContext.Provider value={{ user, profile, isLoading, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
