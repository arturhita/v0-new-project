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
  client_name: string
}

interface InvoicesClientPageProps {
  invoices: Invoice[]
}

export default function InvoicesClientPage({ invoices }: InvoicesClientPageProps) {
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
      {/* La tabella delle fatture è renderizzata dal componente server `page.tsx` */}
    </div>
  )
}
