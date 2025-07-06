"use client"

import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Check, X, PhoneIncoming } from "lucide-react"
import { useChatRequest } from "@/contexts/chat-request-context"

export function IncomingChatRequestModal() {
  const { request, isVisible, accept, decline } = useChatRequest()
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    if (isVisible && audioRef.current) {
      audioRef.current
        .play()
        .catch((error) => console.log("La riproduzione audio è stata bloccata dal browser:", error))
    }
  }, [isVisible])

  if (!isVisible || !request) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100]">
      <Card className="w-full max-w-md shadow-2xl border-indigo-500/50 bg-slate-900/80 text-white animate-in fade-in-0 zoom-in-95">
        <CardHeader className="text-center">
          <div className="mx-auto bg-indigo-500/20 rounded-full p-4 w-fit mb-4 border border-indigo-500/30">
            <PhoneIncoming className="h-10 w-10 text-indigo-300 animate-pulse" />
          </div>
          <CardTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300">
            Richiesta di Chat in Arrivo
          </CardTitle>
          <CardDescription className="text-slate-400 mt-2 text-base">
            L'utente <span className="font-bold text-white">{request.fromUserName}</span> vuole avviare una chat con te.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-center gap-4 mt-4">
          <Button
            onClick={decline}
            variant="destructive"
            size="lg"
            className="flex-1 bg-red-600/80 hover:bg-red-600 text-white text-lg font-bold gap-2"
          >
            <X className="h-6 w-6" /> Rifiuta
          </Button>
          <Button
            onClick={accept}
            size="lg"
            className="flex-1 bg-green-600/80 hover:bg-green-600 text-white text-lg font-bold gap-2"
          >
            <Check className="h-6 w-6" /> Accetta
          </Button>
        </CardFooter>
      </Card>
      <audio ref={audioRef} src="/sounds/notification.mp3" preload="auto" />
    </div>
  )
}
