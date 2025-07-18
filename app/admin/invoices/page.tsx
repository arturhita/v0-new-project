import type { Metadata } from "next"
import { getInvoices } from "@/lib/actions/invoice.actions"
import InvoicesClientPage from "./invoices-client-page"

export const metadata: Metadata = {
  title: "Gestione Fatture | Admin",
  description: "Visualizza e gestisci tutte le fatture della piattaforma.",
}

export default async function AdminInvoicesPage() {
  const invoices = await getInvoices()

  return <InvoicesClientPage initialInvoices={invoices} />
}
