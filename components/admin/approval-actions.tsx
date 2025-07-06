"use client"

import { useTransition } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { approveApplication, rejectApplication } from "@/lib/actions/admin.actions"
import { Loader2, Check, X } from "lucide-react"

interface ApprovalActionsProps {
  applicationId: string
  userId: string
}

export function ApprovalActions({ applicationId, userId }: ApprovalActionsProps) {
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const handleAction = async (action: "approve" | "reject") => {
    let result
    if (action === "approve") {
      result = await approveApplication(applicationId, userId)
    } else {
      result = await rejectApplication(applicationId)
    }

    if (result.success) {
      toast({
        title: "Successo",
        description: result.message,
      })
    } else {
      toast({
        title: "Errore",
        description: result.message,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex gap-2">
      <form action={() => startTransition(() => handleAction("approve"))}>
        <Button
          type="submit"
          size="sm"
          variant="outline"
          className="text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700 bg-transparent"
          disabled={isPending}
        >
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
          Approva
        </Button>
      </form>
      <form action={() => startTransition(() => handleAction("reject"))}>
        <Button type="submit" size="sm" variant="destructive" disabled={isPending}>
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <X className="mr-2 h-4 w-4" />}
          Rifiuta
        </Button>
      </form>
    </div>
  )
}
