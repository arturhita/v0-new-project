import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getInvoices } from "@/lib/actions/invoice.actions"
import { InvoicesClientPage } from "./invoices-client-page"

export default async function AdminInvoicesPage() {
  const { data: invoices, error } = await getInvoices()

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Gestione Fatture</CardTitle>
          <CardDescription>Visualizza e gestisci tutte le fatture generate nel sistema.</CardDescription>
        </CardHeader>
        <CardContent>
          <InvoicesClientPage invoices={invoices ?? []} />
        </CardContent>
      </Card>
    </div>
  )
}
