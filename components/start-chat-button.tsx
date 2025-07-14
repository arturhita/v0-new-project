"use client"

import { useTransition } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { startChatConsultation } from "@/lib/actions/consultation.actions"
import { MessageSquare, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface StartChatButtonProps {
  operatorId: string
  isOnline: boolean
  chatEnabled: boolean
}

export function StartChatButton({ operatorId, isOnline, chatEnabled }: StartChatButtonProps) {
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()
  const router = useRouter()

  const isDisabled = !isOnline || !chatEnabled || isPending

  const handleClick = () => {
    startTransition(async () => {
      const result = await startChatConsultation(operatorId)

      if (!result.success) {
        toast({
          title: "Impossibile avviare la chat",
          description: result.message,
          variant: "destructive",
        })
        if (result.redirectTo) {
          router.push(result.redirectTo)
        }
      }
      // Se ha successo, la server action si occuperà del redirect
    })
  }

  return (
    <Button onClick={handleClick} disabled={isDisabled} size="lg" className="w-full">
      {isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <MessageSquare className="mr-2 h-5 w-5" />}
      {isPending ? "Avvio in corso..." : "Inizia Consulenza Chat"}
    </Button>
  )
}
