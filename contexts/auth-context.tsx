"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import LoadingSpinner from "@/components/loading-spinner"

interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  role: "client" | "operator" | "admin"
}

type AuthContextType = {
  user: User | null
  profile: Profile | null
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  const getSessionAndProfile = useCallback(async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      const currentUser = session?.user
      setUser(currentUser ?? null)

      if (currentUser) {
        const { data: userProfile, error } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url, role")
          .eq("id", currentUser.id)
          .single()
        setProfile(error ? null : userProfile)
      } else {
        setProfile(null)
      }
    } catch (e) {
      console.error("Error in getSessionAndProfile:", e)
      setUser(null)
      setProfile(null)
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    getSessionAndProfile()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      // onAuthStateChange fornisce già la sessione, usiamola per aggiornare lo stato
      const currentUser = session?.user
      setUser(currentUser ?? null)
      if (currentUser) {
        // Richiamiamo getSessionAndProfile per aggiornare anche il profilo
        getSessionAndProfile()
      } else {
        setProfile(null)
        // Non è necessario ricaricare la pagina qui, i layout server gestiranno il redirect
      }
    })

    return () => subscription.unsubscribe()
  }, [getSessionAndProfile])

  // La schermata di caricamento iniziale è fondamentale per evitare che
  // il contenuto protetto venga mostrato brevemente prima che la sessione sia verificata.
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-gradient-to-br from-[#000020] via-[#1E3C98] to-[#000020]">
        <LoadingSpinner />
      </div>
    )
  }

  return <AuthContext.Provider value={{ user, profile, isLoading }}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
