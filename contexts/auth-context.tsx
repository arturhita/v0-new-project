"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect, useCallback } from "react"
import type { User } from "@supabase/supabase-js"

import { createClient } from "@/utils/supabase/client"

type AuthContextType = {
  user: User | null
  isLoading: boolean
  checkAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  checkAuth: async () => {},
})

export const useAuth = () => {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  const checkAuth = useCallback(async () => {
    const { data, error } = await supabase.auth.getUser()
    if (error) {
      console.error("Error fetching user:", error)
      setUser(null)
    } else {
      setUser(data.user)
    }
    setIsLoading(false)
  }, [supabase])

  useEffect(() => {
    checkAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [checkAuth, supabase])

  return <AuthContext.Provider value={{ user, isLoading, checkAuth }}>{children}</AuthContext.Provider>
}
