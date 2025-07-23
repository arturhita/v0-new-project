import { createClient } from "@/utils/supabase/server"
import { redirect } from 'next/navigation'

export default async function OperatorDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
    if (profile?.role !== "operator") {
      redirect("/") // Reindirizza se non è un operatore
    }
  } else {
    redirect("/login?message=Sessione non valida.")
  }

  return (
    <>
      {children}
    </>
  )
}
