"use client"

import { useFormState } from "react-dom"
import { updateOperatorProfile } from "@/lib/actions/operator.actions"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { SubmitButton } from "@/components/submit-button"
import { useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import type { Profile } from "@/types/database" // Assicurati di avere questo tipo definito

const disciplines = ["Cartomanzia", "Astrologia", "Lottologia", "Medianità"]
const specialtiesByDiscipline: { [key: string]: string[] } = {
  Cartomanzia: ["Tarocchi", "Sibille", "Carte Napoletane"],
  Astrologia: ["Tema Natale", "Sinastria", "Transiti Planetari"],
  Lottologia: ["Previsioni Lotto", "Numerologia"],
  Medianità: ["Contatto Defunti", "Canalizzazione"],
}

export default function OperatorProfileForm({ profile }: { profile: Profile }) {
  const initialState = { message: null, errors: {}, success: false }
  const [state, dispatch] = useFormState(updateOperatorProfile, initialState)
  const { toast } = useToast()

  useEffect(() => {
    if (state.success) {
      toast({
        title: "Successo!",
        description: state.message,
      })
    } else if (state.message && !state.success) {
      toast({
        title: "Errore",
        description: state.message,
        variant: "destructive",
      })
    }
  }, [state, toast])

  return (
    <form action={dispatch} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="stage_name">Nome d'Arte</Label>
          <Input id="stage_name" name="stage_name" defaultValue={profile.stage_name || ""} required />
          {state.errors?.stage_name && <p className="text-sm text-red-500 mt-1">{state.errors.stage_name[0]}</p>}
        </div>
        <div>
          <Label htmlFor="headline">Headline (slogan)</Label>
          <Input
            id="headline"
            name="headline"
            defaultValue={profile.headline || ""}
            placeholder="La tua guida spirituale personale"
            required
          />
          {state.errors?.headline && <p className="text-sm text-red-500 mt-1">{state.errors.headline[0]}</p>}
        </div>
      </div>
      <div>
        <Label htmlFor="bio">Biografia</Label>
        <Textarea
          id="bio"
          name="bio"
          defaultValue={profile.bio || ""}
          rows={6}
          placeholder="Descrivi chi sei, la tua esperienza e il tuo approccio."
          required
        />
        {state.errors?.bio && <p className="text-sm text-red-500 mt-1">{state.errors.bio[0]}</p>}
      </div>

      {/* Qui andrebbe la logica per la selezione di discipline e specialità, per ora usiamo un input semplice */}
      <div>
        <Label htmlFor="main_discipline">Disciplina Principale</Label>
        <Input id="main_discipline" name="main_discipline" defaultValue={profile.main_discipline || ""} required />
        {state.errors?.main_discipline && (
          <p className="text-sm text-red-500 mt-1">{state.errors.main_discipline[0]}</p>
        )}
      </div>
      <div>
        <Label htmlFor="specialties">Specialità (separate da virgola)</Label>
        <Input id="specialties" name="specialties" defaultValue={profile.specialties?.join(", ") || ""} required />
        {state.errors?.specialties && <p className="text-sm text-red-500 mt-1">{state.errors.specialties[0]}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <Label htmlFor="chat_price_per_minute">Prezzo Chat (€/min)</Label>
          <Input
            id="chat_price_per_minute"
            name="chat_price_per_minute"
            type="number"
            step="0.01"
            defaultValue={profile.chat_price_per_minute || 1.0}
            required
          />
          {state.errors?.chat_price_per_minute && (
            <p className="text-sm text-red-500 mt-1">{state.errors.chat_price_per_minute[0]}</p>
          )}
        </div>
        <div>
          <Label htmlFor="call_price_per_minute">Prezzo Chiamata (€/min)</Label>
          <Input
            id="call_price_per_minute"
            name="call_price_per_minute"
            type="number"
            step="0.01"
            defaultValue={profile.call_price_per_minute || 1.5}
            required
          />
          {state.errors?.call_price_per_minute && (
            <p className="text-sm text-red-500 mt-1">{state.errors.call_price_per_minute[0]}</p>
          )}
        </div>
        <div>
          <Label htmlFor="video_price_per_minute">Prezzo Video (€/min)</Label>
          <Input
            id="video_price_per_minute"
            name="video_price_per_minute"
            type="number"
            step="0.01"
            defaultValue={profile.video_price_per_minute || 2.0}
            required
          />
          {state.errors?.video_price_per_minute && (
            <p className="text-sm text-red-500 mt-1">{state.errors.video_price_per_minute[0]}</p>
          )}
        </div>
      </div>

      <SubmitButton>Salva Profilo</SubmitButton>
    </form>
  )
}
