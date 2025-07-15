import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { NavigationMenuDemo } from "@/components/navigation-menu"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { UserNav } from "./user-nav"
import { MobileNav } from "./mobile-nav"

export async function SiteNavbar() {
  const supabase = createServerComponentClient({ cookies })
  const {
    data: { user },
  } = await supabase.auth.getUser()

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

          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <UserNav user={user} />
            ) : (
              <>
                <Button
                  asChild
                  variant="outline"
                  className="text-white border-white/80 hover:bg-white hover:text-[#1E3C98] font-semibold transition-colors duration-300 bg-transparent"
                >
                  <Link href="/login">Accedi</Link>
                </Button>
                <Button
                  asChild
                  className="font-bold text-[#1E3C98] bg-yellow-400 hover:bg-yellow-300 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                >
                  <Link href="/register">Inizia Ora</Link>
                </Button>
              </>
            )}
          </div>

          <div className="md:hidden">
            <MobileNav user={user} />
          </div>
        </div>
      </div>
    </header>
  )
}
