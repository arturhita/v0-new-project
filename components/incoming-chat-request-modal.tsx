"use client"

import { useChatRequest } from "@/contexts/chat-request-context"
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
import { useEffect, useRef } from "react"
import { Loader2 } from "lucide-react"

export function IncomingChatRequestModal() {
  const { incomingRequest, setIncomingRequest, respondToRequest, isResponding } = useChatRequest()
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      audioRef.current = new Audio("/sounds/notification.mp3")
    }
  }, [])

  useEffect(() => {
    if (incomingRequest) {
      audioRef.current?.play().catch((e) => console.error("Error playing audio:", e))
    }
  }, [incomingRequest])

  if (!incomingRequest) {
    return null
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <Dialog open={!!incomingRequest} onOpenChange={(isOpen) => !isOpen && setIncomingRequest(null)}>
      <DialogContent className="sm:max-w-[425px] bg-slate-800 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center text-yellow-400">Nuova Richiesta di Consulto!</DialogTitle>
          <DialogDescription className="text-center text-slate-300 pt-2">
            Hai una nuova richiesta di chat da un cliente.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 flex flex-col items-center gap-4">
          <Avatar className="h-24 w-24 border-4 border-yellow-400">
            <AvatarImage
              src={incomingRequest.client_profile.avatar_url || "/placeholder.svg"}
              alt={incomingRequest.client_profile.full_name}
            />
            <AvatarFallback className="text-3xl bg-slate-700">
              {getInitials(incomingRequest.client_profile.full_name)}
            </AvatarFallback>
          </Avatar>
          <p className="text-xl font-semibold">{incomingRequest.client_profile.full_name}</p>
        </div>
        <DialogFooter className="sm:justify-around">
          <Button
            type="button"
            variant="destructive"
            onClick={() => respondToRequest(false)}
            disabled={isResponding}
            className="w-full sm:w-auto"
          >
            {isResponding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Rifiuta
          </Button>
          <Button
            type="button"
            variant="default"
            onClick={() => respondToRequest(true)}
            disabled={isResponding}
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
          >
            {isResponding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Accetta
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
