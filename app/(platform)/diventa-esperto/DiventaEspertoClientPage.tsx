"use client"

import { useFormState, useFormStatus } from "react-dom"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { registerOperator } from "@/lib/actions/auth.actions"
import { ArrowRight } from "lucide-react"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      disabled={pending}
      size="lg"
      className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-bold text-lg px-8 py-4 rounded-full hover:saturate-150 transition-all duration-500 shadow-lg hover:shadow-xl hover:scale-105 group"
    >
      {pending ? "Invio in corso..." : "Invia la tua candidatura"}
      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
    </Button>
  )
}

export function DiventaEspertoClientPage() {
  const [state, formAction] = useFormState(registerOperator, { success: false, message: null })
  const { toast } = useToast()

  useEffect(() => {
    if (state.message && !state.success) {
      toast({
        title: "Errore di registrazione",
        description: state.message,
        variant: "destructive",
      })
    }
    // Success is handled by redirect in the server action
  }, [state, toast])

  return (
    <form action={formAction} className="space-y-6">
      {state?.message && !state.success && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-red-200 text-sm text-center">
          {state.message}
        </div>
      )}
      <div className="grid gap-2">
        <Label htmlFor="name" className="text-slate-200 text-lg">
          Nome e Cognome
        </Label>
        <Input
          id="name"
          name="name"
          placeholder="Il tuo nome reale"
          required
          className="bg-slate-900/50 border-blue-800 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/30 h-12 text-base"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="email" className="text-slate-200 text-lg">
          Email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="La tua email migliore"
          required
          className="bg-slate-900/50 border-blue-800 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/30 h-12 text-base"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password" className="text-slate-200 text-lg">
          Crea una Password
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          placeholder="Minimo 6 caratteri"
          className="bg-slate-900/50 border-blue-800 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/30 h-12 text-base"
        />
      </div>
      <SubmitButton />
    </form>
  )
}
