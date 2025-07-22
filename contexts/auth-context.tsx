"use client"

import { createContext, useContext, useEffect, useState, type ReactNode, useCallback } from "react"
import { createClientComponentClient, type SupabaseClient } from "@supabase/auth-helpers-nextjs"
import type { User } from "@supabase/supabase-js"
import LoadingSpinner from "@/components/loading-spinner"
import { toast } from "sonner"

export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  role: "admin" | "operator" | "client" | null
}

interface AuthContextType {
  user: User | null
  profile: Profile | null
  isLoading: boolean
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const fetchProfileWithRetry = async (
  supabase: SupabaseClient,
  user: User,
  retries = 5,
  delay = 1200, // Aumentato il ritardo per dare più tempo al DB
): Promise<Profile | null> => {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Tentativo ${i + 1} di fetch del profilo per l'utente ${user.id}`)
      // Chiamiamo la nostra nuova funzione sicura
      const { data, error, status } = await supabase.rpc("get_my_profile")

      if (error && status !== 406) {
        // 406 means no rows found, which is not a server error
        console.error("Errore RPC get_my_profile:", error)
        throw error
      }

      const profileData = data?.[0]

      if (profileData) {
        console.log("Profilo trovato:", profileData)
        return profileData as Profile
      }

      console.warn(`Profilo non ancora trovato per l'utente ${user.id}. Nuovo tentativo tra ${delay}ms.`)
      await new Promise((resolve) => setTimeout(resolve, delay))
    } catch (error) {
      console.error(`Errore durante il tentativo ${i + 1} di fetch del profilo:`, error)
      if (i === retries - 1) {
        // Se è l'ultimo tentativo, rilancia l'errore
        throw error
      }
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }
  toast.error(`Profilo non trovato per l'utente ${user.id} dopo ${retries} tentativi.`)
  console.error(`Profilo non trovato per l'utente ${user.id} dopo ${retries} tentativi.`)
  return null
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient()

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    // Redirect or state update can be handled by the component using this
  }, [supabase.auth])

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Evento AuthStateChange:", event)
      const currentUser = session?.user ?? null
      setUser(currentUser)

      if (currentUser) {
        if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {
          setIsLoading(true)
          try {
            const fetchedProfile = await fetchProfileWithRetry(supabase, currentUser)
            setProfile(fetchedProfile)
          } catch (error) {
            console.error("Errore finale nel fetch del profilo:", error)
            toast.error("Impossibile caricare il profilo utente. Prova a ricaricare la pagina.")
            setProfile(null)
          } finally {
            setIsLoading(false)
          }
        }
      } else {
        setProfile(null)
        setIsLoading(false)
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [supabase])

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
