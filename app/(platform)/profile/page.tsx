"use client"
import { Suspense } from "react"
import { redirect } from "next/navigation"
import { getAuthenticatedUserProfile } from "@/lib/actions/profile.actions"
import LoadingSpinner from "@/components/loading-spinner" // Import LoadingSpinner component
import UserProfileClientPage from "./user-profile-client"

export default async function ProfilePage() {
  const profileData = await getAuthenticatedUserProfile()

  if (!profileData) {
    // Se l'utente non è loggato o il profilo non esiste, reindirizza al login
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Suspense
        fallback={
          <div className="flex h-screen w-full items-center justify-center">
            <LoadingSpinner />
          </div>
        }
      >
        <UserProfileClientPage initialProfile={profileData} />
      </Suspense>
    </div>
  )
}
