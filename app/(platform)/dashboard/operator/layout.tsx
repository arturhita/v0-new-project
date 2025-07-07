import type React from "react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { OperatorNavClient } from "./nav-client"
import { Toaster } from "sonner"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default async function OperatorDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect("/login")
  }

  const { data: operatorProfile, error: profileError } = await supabase
    .from("operator_profiles")
    .select("is_available, user_id")
    .eq("user_id", user.id)
    .single()

  if (profileError || !operatorProfile) {
    console.error("Operator profile not found or error:", profileError)
    // Redirect to a page that explains the user is not an operator
    // or back to the main dashboard.
    return redirect("/")
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr] bg-background text-foreground">
      <aside className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Image
                src="/images/moonthir-logo-white.png"
                width={32}
                height={32}
                alt="Moonthir Logo"
                className="dark:invert-0 invert"
              />
              <span className="">Moonthir</span>
            </Link>
          </div>
          <div className="flex-1 overflow-auto py-2">
            <OperatorNavClient isAvailable={operatorProfile.is_available ?? false} />
          </div>
        </div>
      </aside>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 bg-transparent">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-0 bg-muted/40">
              <div className="flex h-14 items-center border-b px-4">
                <Link href="/" className="flex items-center gap-2 font-semibold">
                  <Image
                    src="/images/moonthir-logo-white.png"
                    width={24}
                    height={24}
                    alt="Moonthir Logo"
                    className="dark:invert-0 invert"
                  />
                  <span className="">Moonthir</span>
                </Link>
              </div>
              <div className="flex-1 overflow-auto py-2">
                <OperatorNavClient isAvailable={operatorProfile.is_available ?? false} />
              </div>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">{/* You can add other header elements here, like a search bar */}</div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-slate-900">{children}</main>
        <Toaster />
      </div>
    </div>
  )
}
