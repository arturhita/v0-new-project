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
      <div className="flex justify-end mb-4">
        <Button onClick={() => setIsModalOpen(true)}>Crea Nuova Fattura</Button>
      </div>
      <CreateInvoiceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      {/* Qui andrà la tabella delle fatture, per ora il modale è la parte client-side */}
    </div>
  )
}
