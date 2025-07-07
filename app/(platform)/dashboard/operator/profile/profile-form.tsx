"use client"

import { useFormState } from "react-dom"
import { useEffect } from "react"
import { updateOperatorPublicProfile } from "@/lib/actions/operator.actions"
import { useToast } from "@/hooks/use-toast"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { SubmitButton } from "@/components/submit-button"

type ProfileData = {
  stage_name: string | null
  bio: string | null
  main_discipline: string | null
  specialties: string[] | null
  profile_image_url: string | null
  service_prices: any
}

interface OperatorProfileFormProps {
  profile: ProfileData
  operatorId: string
}

const initialState = {
  message: "",
  success: false,
}

export function OperatorProfileForm({ profile, operatorId }: OperatorProfileFormProps) {
  const { toast } = useToast()
  const updateProfileWithId = updateOperatorPublicProfile.bind(null, operatorId)
  const [state, formAction] = useFormState(updateProfileWithId, initialState)

  useEffect(() => {
    if (state.message) {
      toast({
        title: state.success ? "Successo" : "Errore",
        description: state.message,
        variant: state.success ? "default" : "destructive",
      })
    }
  }, [state, toast])

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="stage_name" className="text-gray-300">
            Nome d'Arte
          </Label>
          <Input
            id="stage_name"
            name="stage_name"
            defaultValue={profile.stage_name || ""}
            className="bg-gray-900 border-gray-600 text-white"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="main_discipline" className="text-gray-300">
            Disciplina Principale
          </Label>
          <Input
            id="main_discipline"
            name="main_discipline"
            defaultValue={profile.main_discipline || ""}
            className="bg-gray-900 border-gray-600 text-white"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio" className="text-gray-300">
          Biografia
        </Label>
        <Textarea
          id="bio"
          name="bio"
          defaultValue={profile.bio || ""}
          rows={5}
          className="bg-gray-900 border-gray-600 text-white"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="specialties" className="text-gray-300">
          Specialità (separate da virgola)
        </Label>
        <Input
          id="specialties"
          name="specialties"
          defaultValue={profile.specialties?.join(", ") || ""}
          className="bg-gray-900 border-gray-600 text-white"
        />
      </div>

      <h3 className="text-lg font-semibold pt-4 border-t border-gray-700">Tariffe al Minuto (€)</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label htmlFor="price_chat" className="text-gray-300">
            Chat
          </Label>
          <Input
            id="price_chat"
            name="price_chat"
            type="number"
            step="0.01"
            defaultValue={profile.service_prices?.chat || 0}
            className="bg-gray-900 border-gray-600 text-white"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="price_call" className="text-gray-300">
            Chiamata
          </Label>
          <Input
            id="price_call"
            name="price_call"
            type="number"
            step="0.01"
            defaultValue={profile.service_prices?.call || 0}
            className="bg-gray-900 border-gray-600 text-white"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="price_video" className="text-gray-300">
            Video
          </Label>
          <Input
            id="price_video"
            name="price_video"
            type="number"
            step="0.01"
            defaultValue={profile.service_prices?.video || 0}
            className="bg-gray-900 border-gray-600 text-white"
          />
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <SubmitButton buttonText="Salva Modifiche" />
      </div>
    </form>
  )
}
