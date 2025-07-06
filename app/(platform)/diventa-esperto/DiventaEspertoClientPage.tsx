"use client"

import { useState } from "react"
import { useFormState } from "react-dom"
import { applyAsOperator } from "@/lib/actions/application.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/contexts/auth-context"
import { createClient } from "@/lib/supabase/client"

const initialState = {
  message: "",
  success: false,
}

export default function DiventaEspertoClientPage() {
  const { user } = useAuth()
  const [state, formAction] = useFormState(applyAsOperator, initialState)
  const [formVisible, setFormVisible] = useState(true)
  const supabase = createClient()

  if (state.success && formVisible) {
    setFormVisible(false)
  }

  if (!user) {
    return (
      <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Devi essere registrato</h2>
        <p className="mb-6">Per inviare la tua candidatura come operatore, devi prima creare un account.</p>
        <Button onClick={() => (window.location.href = "/register")}>Registrati Ora</Button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      {formVisible ? (
        <form action={formAction} className="space-y-6">
          <input type="hidden" name="userId" value={user.id} />
          <input type="hidden" name="userEmail" value={user.email || ""} />

          <div className="space-y-2">
            <Label htmlFor="name">Nome e Cognome</Label>
            <Input id="name" name="name" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Numero di Telefono</Label>
            <Input id="phone" name="phone" type="tel" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialization">Area di Specializzazione (es. Tarocchi, Astrologia)</Label>
            <Input id="specialization" name="specialization" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience">Breve descrizione della tua esperienza</Label>
            <Textarea id="experience" name="experience" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="motivation">Perché vuoi unirti a noi?</Label>
            <Textarea id="motivation" name="motivation" required />
          </div>

          {state.message && !state.success && <p className="text-sm text-red-500">{state.message}</p>}

          <Button type="submit" className="w-full">
            Invia Candidatura
          </Button>
        </form>
      ) : (
        <div className="text-center">
          <h2 className="text-2xl font-bold text-green-600">Candidatura Inviata!</h2>
          <p className="mt-4">{state.message}</p>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Verrai ricontattato via email dal nostro team il prima possibile.
          </p>
        </div>
      )}
    </div>
  )
}
