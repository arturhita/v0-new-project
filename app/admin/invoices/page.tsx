import { getInvoices } from "@/lib/actions/invoice.actions"
import { createAdminClient } from "@/lib/supabase/admin"
import InvoicesClientPage from "./invoices-client-page"

export default async function InvoicesPage() {
  // Fetch invoices
  const { data: invoices, error: invoicesError } = await getInvoices()

  // Fetch users for the modal dropdown
  const supabase = createAdminClient()
  const { data: usersData, error: usersError } = await supabase.from("users").select("id, email, raw_user_meta_data")

  const error = invoicesError || usersError?.message
  if (error) {
    return <div className="p-4 text-red-500">Errore nel caricamento dei dati: {String(error)}</div>
  }

  const formattedUsers =
    usersData?.map((u) => ({
      id: u.id,
      email: u.email,
      type: u.raw_user_meta_data?.role === "operator" ? "operator" : ("client" as "client" | "operator"),
    })) || []

  return <InvoicesClientPage initialInvoices={invoices || []} users={formattedUsers} />
}
