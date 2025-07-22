"use client"

import Link from "next/link"
import Image from "next/image"
import { NavigationMenuDemo } from "@/components/navigation-menu"
import { createClient } from "@/lib/supabase/server"
import { NavbarActions } from "./navbar-actions"

type Profile = {
  full_name: string | null
  avatar_url: string | null
  role: string | null
} | null

export async function SiteNavbar() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("full_name, avatar_url, role")
      .eq("id", user.id)
      .single()
    profile = profileData
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#1E3C98] shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2 group">
            <Image
              src="/images/moonthir-logo-white.png"
              alt="Moonthir Logo"
              width={140}
              height={40}
              className="object-contain"
              priority
            />
          </Link>

          <div className="hidden md:flex items-center">
            <NavigationMenuDemo />
          </div>

          <div className="flex items-center">
            <NavbarActions user={user} profile={profile} />
          </div>
        </div>
      </div>
    </header>
  )
}
