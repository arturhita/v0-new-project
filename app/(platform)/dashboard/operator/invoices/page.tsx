"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, Scroll } from "lucide-react"

interface Invoice {
  id: string
  invoice_number: string
  issue_date: string
  total_amount: number
  status: string
  pdf_url?: string
}

export default function InvoicesPage() {
  // Dati di esempio. Verranno caricati da una server action in futuro.
  const invoices: Invoice[] = [
    {
      id: "inv001",
      invoice_number: "FPA-2025-001",
      issue_date: "2025-06-01",
      total_amount: 187.5,
      status: "paid",
      pdf_url: "/placeholder-invoice.pdf",
    },
    {
      id: "inv002",
      invoice_number: "FPA-2025-002",
      issue_date: "2025-07-01",
      total_amount: 210.2,
      status: "unpaid",
      pdf_url: "/placeholder-invoice.pdf",
    },
  ]

  const handleDownload = (fileUrl: string | undefined) => {
    if (fileUrl) {
      alert(`Simulazione download fattura da: ${fileUrl}`)
    } else {
      alert("File fattura non disponibile per il download.")
    }
  }

  const getStatusClass = (status: string) => {
    switch (status) {
      case "paid":
        return "text-green-400"
      case "unpaid":
        return "text-yellow-400"
      default:
        return "text-gray-400"
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Fatture Ricevute</h1>
      <CardDescription className="text-gray-400 -mt-4">
        Archivio delle fatture emesse dalla piattaforma per le commissioni di servizio.
      </CardDescription>

      <Card className="bg-gray-800/50 border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <Scroll className="mr-2 h-5 w-5 text-gray-400" /> Archivio Fatture
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700">
                <TableHead>Numero</TableHead>
                <TableHead>Data Emissione</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead className="text-right">Importo Totale</TableHead>
                <TableHead className="text-right">Azione</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id} className="border-gray-800">
                  <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                  <TableCell>{new Date(invoice.issue_date).toLocaleDateString("it-IT")}</TableCell>
                  <TableCell>
                    <span className={`font-semibold ${getStatusClass(invoice.status)}`}>
                      {invoice.status === "paid" ? "Pagata" : "Da Pagare"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">€{invoice.total_amount.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => handleDownload(invoice.pdf_url)}>
                      <Download className="mr-1.5 h-4 w-4" /> Scarica
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {invoices.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500">
                    Nessuna fattura ricevuta.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
