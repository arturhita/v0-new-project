"use client"
import { useRouter } from "next/navigation"
import { getMyOperatorProfile } from "@/lib/actions/operator.actions"
import { OperatorEditForm } from "./edit-form"
import { redirect } from "next/navigation"
import type { Profile } from "@/types"

type ProfileState = {
  full_name: string
  stage_name: string
  phone_number: string
  bio: string
  services: string[]
  avatar_url: string
}

const initialProfileState: ProfileState = {
  full_name: "",
  stage_name: "",
  phone_number: "",
  bio: "",
  services: [],
  avatar_url: "",
}

export default async function OperatorProfilePage() {
  const router = useRouter()
  const { profile, error } = await getMyOperatorProfile()

  if (error || !profile) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900">
      <div className="container mx-auto max-w-4xl py-8 px-4">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-8 text-center">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300">
            Il Mio Altare Mistico
          </span>
        </h1>
        <OperatorEditForm initialProfile={profile as Profile} />
      </div>
    </div>
  )
}
