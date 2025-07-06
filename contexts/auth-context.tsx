"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User, Profile } from "@/types/database.types"

type AuthContextType = {
  user: User | null
  profile: Profile | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
})

export const AuthProvider = ({ children, user: initialUser }: { children: React.ReactNode; user: User | null }) => {
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(initialUser)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const getProfileData = async (userId: string) => {
      const { data } = await supabase.from("profiles").select("*").eq("id", userId).single()
      if (isMounted) {
        setProfile(data as Profile | null)
      }
    }

    const handleUser = async (userToHandle: User | null) => {
      if (userToHandle) {
        await getProfileData(userToHandle.id)
      } else {
        setProfile(null)
      }
      if (isMounted) {
        setLoading(false)
      }
    }

    // Handle initial user from server
    handleUser(user)

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return
      const currentUser = session?.user ?? null
      setUser(currentUser)
      setLoading(true)
      await handleUser(currentUser)
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [supabase])

  return <AuthContext.Provider value={{ user, profile, loading }}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
