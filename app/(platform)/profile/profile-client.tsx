"use client"

import { useFormState } from "react-dom"
import { updateUserProfile } from "@/lib/actions/user.actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SubmitButton } from "@/components/submit-button"
import { useEffect } from "react"
import { toast } from "sonner"
import type { Profile } from "@/types/database"

const initialState = {
  success: false,
  message: "",
}

export function ProfileClient({ profile }: { profile: Profile }) {
  const [state, formAction] = useFormState(updateUserProfile, initialState)

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast.success(state.message)
      } else {
        toast.error(state.message)
      }
    }
  }, [state])

  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Il Tuo Profilo</CardTitle>
          <CardDescription>Aggiorna le tue informazioni personali.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" value={profile.email || ""} disabled />
              <p className="text-xs text-gray-500">L'email non può essere modificata.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="full_name">Nome Completo</Label>
              <Input id="full_name" name="full_name" defaultValue={profile.full_name || ""} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stage_name">Nome d'Arte (se operatore)</Label>
              <Input
                id="stage_name"
                name="stage_name"
                defaultValue={profile.stage_name || ""}
                disabled={profile.role !== "operator"}
              />
            </div>

            <SubmitButton>Salva Modifiche</SubmitButton>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
