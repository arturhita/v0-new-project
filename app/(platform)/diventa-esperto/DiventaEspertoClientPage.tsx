"use client"

import { useFormState, useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { submitApplication } from "@/lib/actions/application.actions"
import type { User } from "@supabase/supabase-js"
import { useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Invio in corso..." : "Invia Candidatura"}
    </Button>
  )
}

interface DiventaEspertoClientPageProps {
  user: User
  existingStatus?: "pending" | "approved" | "rejected" | null
}

export function DiventaEspertoClientPage({ user, existingStatus }: DiventaEspertoClientPageProps) {
  const initialState = { message: null, errors: {} }
  const [state, dispatch] = useFormState(submitApplication, initialState)
  const { toast } = useToast()

  useEffect(() => {
    if (state.message) {
      if (Object.keys(state.errors ?? {}).length > 0) {
        toast({
          title: "Errore nella candidatura",
          description: state.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Candidatura Inviata!",
          description: state.message,
        })
      }
    }
  }, [state, toast])

  if (existingStatus === "approved") {
    return (
      <div className="container mx-auto flex min-h-[80vh] items-center justify-center text-center">
        <div>
          <h1 className="text-3xl font-bold">Sei già un operatore!</h1>
          <p className="mt-2 text-slate-600">Puoi gestire il tuo profilo dalla tua dashboard.</p>
        </div>
      </div>
    )
  }

  if (existingStatus === "pending") {
    return (
      <div className="container mx-auto flex min-h-[80vh] items-center justify-center text-center">
        <div>
          <h1 className="text-3xl font-bold">Candidatura in revisione</h1>
          <p className="mt-2 text-slate-600">
            Abbiamo già ricevuto la tua candidatura. Ti faremo sapere al più presto!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-2xl py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Diventa un Esperto su Moonthir</CardTitle>
          <CardDescription>
            Compila il modulo sottostante per inviare la tua candidatura. Il nostro team la esaminerà al più presto.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={dispatch} className="space-y-4">
            {/* Hidden user ID field */}
            <input type="hidden" name="userId" value={user.id} />

            <div className="space-y-2">
              <Label htmlFor="stageName">Nome d'Arte</Label>
              <Input id="stageName" name="stageName" placeholder="Es. Luna Stellare" required />
              {state.errors?.stageName && <p className="text-sm text-red-500">{state.errors.stageName}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">La tua biografia</Label>
              <Textarea
                id="bio"
                name="bio"
                placeholder="Descrivi la tua esperienza, il tuo approccio e cosa ti rende unico."
                required
                rows={5}
              />
              {state.errors?.bio && <p className="text-sm text-red-500">{state.errors.bio}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="specialties">Specializzazioni (separate da virgola)</Label>
              <Input id="specialties" name="specialties" placeholder="Es. Tarocchi, Astrologia, Amore" required />
              {state.errors?.specialties && <p className="text-sm text-red-500">{state.errors.specialties}</p>}
            </div>

            <SubmitButton />
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
