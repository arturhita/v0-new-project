import type { Metadata } from "next"
import { getInvoices } from "@/lib/actions/invoice.actions"
import InvoicesClientPage from "./invoices-client-page"
import { createAdminClient } from "@/lib/supabase/admin"

export const metadata: Metadata = {
  title: "Gestione Fatture | Admin",
  description: "Visualizza e gestisci tutte le fatture della piattaforma.",
}

export default async function AdminInvoicesPage() {
  const invoices = await getInvoices()

  const supabase = createAdminClient()
  const { data: usersData, error: usersError } = await supabase.from("users").select("id, email")
  const { data: operatorsData, error: operatorsError } = await supabase.from("profiles").select("user_id, full_name")

  if (usersError || operatorsError) {
    console.error("Error fetching users/operators:", usersError || operatorsError)
  }

  const users = usersData?.map((u) => ({ id: u.id, name: u.email || "N/A", type: "client" as const })) || []
  const operators =
    operatorsData?.map((o) => ({ id: o.user_id, name: o.full_name || "Operatore", type: "operator" as const })) || []

  const allRecipients = [...users, ...operators]

  return <InvoicesClientPage initialInvoices={invoices} recipients={allRecipients} />
}
