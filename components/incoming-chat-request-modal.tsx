"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { respondToChatRequest } from "@/lib/actions/chat.actions"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface ChatRequest {
  consultation_id: string
  client_id: string
  client_name: string
  client_avatar_url: string | null
}

interface IncomingChatRequestModalProps {
  request: ChatRequest
  onClose: () => void
}

export default function IncomingChatRequestModal({ request, onClose }: IncomingChatRequestModalProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleResponse = async (accepted: boolean) => {
    setIsLoading(true)
    const { consultation_id } = request

    const result = await respondToChatRequest({ consultation_id, accepted })

    if (result.success && accepted) {
      toast.success("Richiesta accettata! Verrai reindirizzato alla chat.")
      router.push(`/chat/${consultation_id}`)
      onClose()
    } else if (result.success && !accepted) {
      toast.info("Richiesta rifiutata.")
      onClose()
    } else {
      toast.error(result.error || "Si è verificato un errore.")
    }
    setIsLoading(false)
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <Dialog open={true} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[425px] bg-slate-800 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-yellow-400">Nuova Richiesta di Chat</DialogTitle>
          <DialogDescription>Hai una nuova richiesta di consulenza via chat.</DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-4 py-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={request.client_avatar_url || ""} />
            <AvatarFallback className="bg-blue-600 text-white text-2xl">
              {getInitials(request.client_name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-lg font-semibold">{request.client_name}</p>
            <p className="text-sm text-slate-400">vuole iniziare una chat con te.</p>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleResponse(false)}
            disabled={isLoading}
            className="border-red-500 text-red-500 hover:bg-red-500/10 hover:text-red-400"
          >
            Rifiuta
          </Button>
          <Button
            onClick={() => handleResponse(true)}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Accetta
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
