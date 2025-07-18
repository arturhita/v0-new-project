"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CreateInvoiceModal } from "@/components/create-invoice-modal"
import type { InvoiceWithDetails } from "@/lib/actions/invoice.actions"

interface InvoicesClientPageProps {
  invoices: InvoiceWithDetails[]
}

export default function InvoicesClientPage({ invoices }: InvoicesClientPageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div>
      <Button onClick={() => setIsModalOpen(true)}>Crea Nuova Fattura</Button>
      <CreateInvoiceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}
