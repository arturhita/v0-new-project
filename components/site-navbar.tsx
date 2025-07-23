import Link from "next/link"
import Image from "next/image"
import type { User } from "@supabase/supabase-js"
import { NavigationMenuDemo } from "./navigation-menu"
import { NavbarActions } from "./navbar-actions"
import type { Profile } from "@/types/database"

interface SiteNavbarProps {
  user: User | null
  profile: Profile | null
}

export function SiteNavbar({ user, profile }: SiteNavbarProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-[#1E3C98]/90 to-transparent backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/images/moonthir-logo-white.png" alt="Moonthir Logo" width={120} height={30} />
        </Link>
        <div className="hidden md:flex">
          <NavigationMenuDemo />
        </div>
        <div className="flex items-center gap-4">
          <NavbarActions user={user} profile={profile} />
        </div>
      </div>
    </header>
  )
}
