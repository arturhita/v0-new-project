"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { handleCommissionRequest } from "@/lib/actions/commission.actions"
import { CheckCircle, XCircle } from 'lucide-react'
import { useToast } from "@/components/ui/use-toast"

interface CommissionRequest {
  id: string
  status: string
}

export default function CommissionRequestActions({ request }: { request: CommissionRequest }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const onAction = async (newStatus: "approved" | "rejected") => {
    setIsSubmitting(true)
    const result = await handleCommissionRequest(request.id, newStatus)
    setIsSubmitting(false)

    if (result.success) {
      toast({
        title: "Successo",
        description: result.message,
        variant: "default",
      })
    } else {
      toast({
        title: "Errore",
        description: result.message,
        variant: "destructive",
      })
    }
  }

  if (request.status !== "pending") {
    return <span className="text-xs text-slate-400">Gestita</span>
  }

  return (
    <div className="flex gap-2 justify-end">
      <Button
        size="sm"
        onClick={() => onAction("approved")}
        disabled={isSubmitting}
        className="bg-emerald-500 hover:bg-emerald-600 text-white"
      >
        <CheckCircle className="mr-1.5 h-4 w-4" /> Approva
      </Button>
      <Button
        size="sm"
        variant="destructive"
        onClick={() => onAction("rejected")}
        disabled={isSubmitting}
      >
        <XCircle className="mr-1.5 h-4 w-4" /> Rifiuta
      </Button>
    </div>
  )
}
