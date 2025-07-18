import { getInvoices } from "@/lib/actions/invoice.actions"
import { InvoicesClientPage } from "./invoices-client-page"

export default async function InvoicesPage() {
  const invoices = await getInvoices()

  return <InvoicesClientPage initialInvoices={invoices} />
}
