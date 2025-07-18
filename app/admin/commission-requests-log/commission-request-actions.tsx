"use client"

import { useTransition } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import { handleCommissionRequest } from "@/lib/actions/commission.actions"
import { useToast } from "@/hooks/use-toast"

export default function CommissionRequestActions({ request }: { request: any }) {
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const onAction = (status: "approved" | "rejected") => {
    startTransition(async () => {
      const result = await handleCommissionRequest(request.id, status)
      toast({
        title: result.success ? "Successo" : "Errore",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      })
    })
  }

  if (request.status !== "pending") {
    return <span className="text-xs text-slate-400">Gestita</span>
  }

  return (
    <div className="flex gap-2 justify-end">
      <Button
        size="sm"
        onClick={() => onAction("approved")}
        disabled={isPending}
        className="bg-emerald-500 hover:bg-emerald-600 text-white"
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <CheckCircle className="mr-1.5 h-4 w-4" /> Approva
          </>
        )}
      </Button>
      <Button size="sm" variant="destructive" onClick={() => onAction("rejected")} disabled={isPending}>
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <XCircle className="mr-1.5 h-4 w-4" /> Rifiuta
          </>
        )}
      </Button>
    </div>
  )
}
