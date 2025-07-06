"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, Scroll } from "lucide-react"

interface Invoice {
  id: string
  date: string
  description: string
  amount: number
  fileUrl?: string // URL fittizio per il download
}

export default function InvoicesPage() {
  const invoices: Invoice[] = [
    {
      id: "inv001",
      date: "2025-06-01",
      description: "Commissioni Piattaforma - Maggio 2025",
      amount: 187.5,
      fileUrl: "/placeholder-invoice.pdf",
    },
    {
      id: "inv002",
      date: "2025-05-01",
      description: "Commissioni Piattaforma - Aprile 2025",
      amount: 152.2,
      fileUrl: "/placeholder-invoice.pdf",
    },
  ]

  const handleDownload = (fileUrl: string | undefined) => {
    if (fileUrl) {
      // In un'app reale, questo aprirebbe l'URL del file o avvierebbe un download
      alert(`Simulazione download fattura da: ${fileUrl}`)
      // window.open(fileUrl, '_blank'); // Opzione per aprire in nuova scheda
    } else {
      alert("File fattura non disponibile per il download.")
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-slate-800">Fatture Cosmiche Ricevute</h1>
      <CardDescription className="text-slate-500 -mt-4">
        Visualizza le fatture emesse dalla piattaforma per le commissioni.
      </CardDescription>

      <Card className="shadow-xl rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl text-slate-700 flex items-center">
            <Scroll className="mr-2 h-5 w-5 text-slate-500" /> Archivio Fatture
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Numero Fattura</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Descrizione</TableHead>
                <TableHead className="text-right">Importo</TableHead>
                <TableHead className="text-right">Azione</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.id.toUpperCase()}</TableCell>
                  <TableCell>{invoice.date}</TableCell>
                  <TableCell>{invoice.description}</TableCell>
                  <TableCell className="text-right">€{invoice.amount.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => handleDownload(invoice.fileUrl)}>
                      <Download className="mr-1.5 h-4 w-4" /> Scarica
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {invoices.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-slate-500">
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
