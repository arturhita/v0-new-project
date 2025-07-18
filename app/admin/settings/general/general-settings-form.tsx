"use client"

import { useFormState, useFormStatus } from "react-dom"
import { updateAdvancedSetting } from "@/lib/actions/settings.actions"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"

const initialState = {
  success: false,
  error: null,
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Salvataggio..." : "Salva Impostazioni"}
    </Button>
  )
}

export function GeneralSettingsForm({
  currentSettings,
}: { currentSettings: { site_name?: string; contact_email?: string } }) {
  const updateGeneralSettings = updateAdvancedSetting.bind(null, "general_settings")
  const [state, dispatch] = useFormState(updateGeneralSettings, initialState)
  const { toast } = useToast()

  useEffect(() => {
    if (state.success) {
      toast({
        title: "Impostazioni salvate!",
        description: "Le modifiche sono state applicate.",
      })
    } else if (state.error) {
      toast({
        title: "Errore",
        description: "Non è stato possibile salvare le impostazioni.",
        variant: "destructive",
      })
    }
  }, [state, toast])

  return (
    <form action={dispatch} className="space-y-4">
      <div>
        <Label htmlFor="site_name">Nome del Sito</Label>
        <Input id="site_name" name="site_name" defaultValue={currentSettings.site_name} />
      </div>
      <div>
        <Label htmlFor="contact_email">Email di Contatto</Label>
        <Input id="contact_email" name="contact_email" type="email" defaultValue={currentSettings.contact_email} />
      </div>
      <SubmitButton />
    </form>
  )
}
