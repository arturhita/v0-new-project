import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/server"
import UserNav from "@/components/user-nav"
import MobileNav from "@/components/mobile-nav"
import { Button } from "@/components/ui/button"

export default async function SiteNavbar() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Image
            src="/images/moonthir-logo.png"
            alt="Moonthir Logo"
            width={120}
            height={40}
            className="hidden sm:block"
          />
          <Image
            src="/images/moonthir-logo-white.png"
            alt="Moonthir Logo"
            width={40}
            height={40}
            className="sm:hidden"
          />
        </Link>
        <div className="hidden md:flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link href="/esperti/cartomanzia" className="transition-colors hover:text-foreground/80 text-foreground/60">
              Cartomanti
            </Link>
            <Link href="/esperti/astrologia" className="transition-colors hover:text-foreground/80 text-foreground/60">
              Astrologi
            </Link>
            <Link href="/oroscopo" className="transition-colors hover:text-foreground/80 text-foreground/60">
              Oroscopo
            </Link>
            <Link href="/astromag" className="transition-colors hover:text-foreground/80 text-foreground/60">
              Astromag
            </Link>
            <Link href="/diventa-esperto" className="transition-colors hover:text-foreground/80 text-foreground/60">
              Lavora con noi
            </Link>
          </nav>
          <div className="flex items-center space-x-2">
            {user ? (
              <UserNav user={user} />
            ) : (
              <>
                <Button asChild variant="ghost">
                  <Link href="/login">Accedi</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Registrati</Link>
                </Button>
              </>
            )}
          </div>
        </div>
        <div className="md:hidden flex flex-1 justify-end">{user ? <UserNav user={user} /> : <MobileNav />}</div>
      </div>
    </header>
  )
}
