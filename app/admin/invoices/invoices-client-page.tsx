"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import CreateInvoiceModal from "@/components/create-invoice-modal"
import type { InvoiceWithDetails } from "@/lib/actions/invoice.actions"

interface InvoicesClientPageProps {
  invoices: InvoiceWithDetails[]
}

export default function InvoicesClientPage({ invoices }: InvoicesClientPageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setIsModalOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Crea Fattura
        </Button>
      </div>
      {/* The table is rendered on the server component, this client component just adds the modal functionality */}
      <CreateInvoiceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}
