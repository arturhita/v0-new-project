import { getInvoicesForOperator } from "@/lib/actions/invoices.actions"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileText, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function OperatorInvoicesPage() {
  const invoices = await getInvoicesForOperator()

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: "secondary",
      sent: "default",
      paid: "default",
      overdue: "destructive",
    } as const

    const labels = {
      draft: "Bozza",
      sent: "Inviata",
      paid: "Pagata",
      overdue: "Scaduta",
    }

    const statusKey = status as keyof typeof variants
    return (
      <Badge
        variant={variants[statusKey]}
        className={statusKey === "paid" ? "bg-green-100 text-green-800 hover:bg-green-200" : ""}
      >
        {labels[statusKey]}
      </Badge>
    )
  }

  const getItemTypeLabel = (type: string) => {
    const labels = {
      consultation: "Consulenza",
      commission: "Commissione",
      deduction: "Detrazione",
      fee: "Spesa",
      bonus: "Bonus",
      other: "Altro",
    }
    return labels[type as keyof typeof labels] ?? "Sconosciuto"
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-800">Le tue Fatture</h1>
        <p className="text-slate-600">Visualizza lo storico delle tue fatture e dei pagamenti.</p>
      </div>

      {invoices.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p>Non ci sono ancora fatture da visualizzare.</p>
          </CardContent>
        </Card>
      ) : (
        invoices.map((invoice) => (
          <Card key={invoice.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-sky-600" />
                    Fattura {invoice.invoice_number}
                  </CardTitle>
                  <CardDescription>
                    Data: {new Date(invoice.issue_date).toLocaleDateString("it-IT")} - Scadenza:{" "}
                    {new Date(invoice.due_date).toLocaleDateString("it-IT")}
                  </CardDescription>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {getStatusBadge(invoice.status)}
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Scarica PDF
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrizione</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-center">Quantità</TableHead>
                    <TableHead className="text-right">Prezzo Unit.</TableHead>
                    <TableHead className="text-right">Totale</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.invoice_items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{getItemTypeLabel(item.item_type)}</Badge>
                      </TableCell>
                      <TableCell className="text-center">{item.quantity}</TableCell>
                      <TableCell className="text-right">
                        €{item.unit_price.toLocaleString("it-IT", { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell
                        className={`text-right font-medium ${item.total < 0 ? "text-red-600" : "text-green-600"}`}
                      >
                        €{item.total.toLocaleString("it-IT", { minimumFractionDigits: 2 })}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="border-t-2 border-slate-200">
                    <TableCell colSpan={4} className="font-semibold">
                      Totale Fattura
                    </TableCell>
                    <TableCell className="text-right font-bold text-lg">
                      €{invoice.total_amount.toLocaleString("it-IT", { minimumFractionDigits: 2 })}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              {invoice.notes && (
                <div className="mt-4 p-3 bg-slate-50 rounded-md">
                  <h4 className="font-semibold">Note:</h4>
                  <p className="text-sm text-slate-600">{invoice.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
