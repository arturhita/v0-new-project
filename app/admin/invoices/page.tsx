import { getInvoicesForAdmin } from "@/lib/actions/invoices.actions"
import InvoicesClientPage from "./invoices-client-page"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"

interface InvoiceItem {
  id: string
  description: string
  type: "consultation" | "commission" | "deduction" | "fee" | "bonus" | "other"
  quantity: number
  unitPrice: number
  total: number
}

export default async function ManageInvoicesPage() {
  try {
    const invoicesData = await getInvoicesForAdmin()

    const invoices = invoicesData.map((inv) => ({
      id: inv.id,
      number: inv.invoice_number,
      operatorName: inv.profile?.stage_name ?? "N/A",
      date: inv.issue_date,
      dueDate: inv.due_date,
      status: inv.status as "draft" | "sent" | "paid" | "overdue",
      amount: inv.total_amount,
      items: inv.invoice_items.map((item) => ({
        id: item.id,
        description: item.description,
        type: item.item_type as InvoiceItem["type"],
        quantity: item.quantity,
        unitPrice: item.unit_price,
        total: item.total,
      })),
    }))

    const totalAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0)
    const paidCount = invoices.filter((inv) => inv.status === "paid").length
    const pendingCount = invoices.filter((inv) => inv.status === "sent").length
    const overdueCount = invoices.filter((inv) => inv.status === "overdue").length

    return (
      <div className="space-y-6">
        <InvoicesClientPage
          invoices={invoices}
          totalAmount={totalAmount}
          paidCount={paidCount}
          pendingCount={pendingCount}
          overdueCount={overdueCount}
        />
      </div>
    )
  } catch (error: any) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-800">Gestione Fatture</h1>
            <p className="text-slate-600">Visualizza e gestisci le fatture degli operatori.</p>
          </div>
        </div>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Errore nel caricamento delle fatture</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      </div>
    )
  }
}
