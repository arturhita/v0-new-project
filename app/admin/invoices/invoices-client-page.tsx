"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CreateInvoiceModal } from "@/components/create-invoice-modal"
import { PlusCircle } from "lucide-react"

type Invoice = {
  id: string
  invoice_number: string
  amount: number
  status: string
  due_date: string
  user: {
    full_name: string | null
  } | null
}

type InvoicesClientPageProps = {
  invoices: Invoice[]
}

const InvoicesClientPage = ({ invoices }: InvoicesClientPageProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setIsModalOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Crea Fattura
        </Button>
      </div>
      <CreateInvoiceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      {/* Qui andrà la tabella delle fatture, per ora mostriamo un messaggio */}
      {invoices.length > 0 ? (
        <div className="text-center p-4 border rounded-md">
          Visualizzazione tabella fatture (UI da implementare). Trovate {invoices.length} fatture.
        </div>
      ) : (
        <div className="text-center p-4 border rounded-md">Nessuna fattura trovata.</div>
      )}
    </div>
  )
}

export default InvoicesClientPage
