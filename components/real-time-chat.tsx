"use client"

import { useFormState, useFormStatus } from "react-dom"
import { sendMessage } from "@/lib/actions/chat.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, AlertTriangle } from "lucide-react"
import { useEffect, useRef } from "react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" size="icon" disabled={pending} className="bg-indigo-600 hover:bg-indigo-700">
      {pending ? (
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-t-transparent" />
      ) : (
        <Send className="h-4 w-4" />
      )}
    </Button>
  )
}

interface RealTimeChatProps {
  receiverId: string
  operatorUsername: string // Usiamo un username univoco per il link
  // messages: any[] // I messaggi verrebbero passati qui
}

const initialState = {
  message: "",
  success: false,
  limitReached: false,
}

export function RealTimeChat({ receiverId, operatorUsername }: RealTimeChatProps) {
  const [state, formAction] = useFormState(sendMessage, initialState)
  const formRef = useRef<HTMLFormElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    // Mostra un toast solo per errori generici, non per il limite raggiunto
    if (state?.message && !state.success && !state.limitReached) {
      toast({
        title: "Errore",
        description: state.message,
        variant: "destructive",
      })
    }
    // Resetta il form solo se l'invio ha avuto successo
    if (state?.success) {
      formRef.current?.reset()
    }
  }, [state, toast])

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-lg border border-gray-800">
      <div className="flex-grow p-4 overflow-y-auto">
        {/* Qui andrebbe la lista dei messaggi */}
        <p className="text-center text-gray-500 text-sm">I messaggi sono crittografati end-to-end.</p>
      </div>

      <div className="p-4 border-t border-gray-800 bg-gray-950">
        {state?.limitReached ? (
          <div className="text-center p-4 rounded-lg bg-yellow-900/50 border border-yellow-700">
            <AlertTriangle className="mx-auto h-8 w-8 text-yellow-400 mb-2" />
            <h3 className="font-bold text-yellow-300">Limite Messaggi Raggiunto</h3>
            <p className="text-sm text-yellow-200 mb-4">
              Per proteggere la privacy e la professionalità, le chat iniziali sono limitate.
            </p>
            <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
              <Link href={`/operator/${operatorUsername}?action=start_consultation`}>
                Avvia un Consulto a Pagamento
              </Link>
            </Button>
          </div>
        ) : (
          <form ref={formRef} action={formAction} className="flex items-center gap-3">
            <Input
              name="content"
              placeholder="Scrivi un messaggio..."
              required
              autoComplete="off"
              className="flex-grow bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <input type="hidden" name="receiverId" value={receiverId} />
            <SubmitButton />
          </form>
        )}
      </div>
    </div>
  )
}
