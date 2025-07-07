"use client"

import { useFormState } from "react-dom"
import { useEffect, useRef } from "react"
import Image from "next/image"
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
  profileData: ProfileData
  operatorId: string
}

const initialState = { message: "", success: false }

export function OperatorProfileForm({ profileData, operatorId }: OperatorProfileFormProps) {
  const { toast } = useToast()
  const updateProfileWithId = updateOperatorPublicProfile.bind(null, operatorId)
  const [state, formAction] = useFormState(updateProfileWithId, initialState)
  const formRef = useRef<HTMLFormElement>(null)

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
    <form ref={formRef} action={formAction} className="space-y-8">
      <div className="space-y-4 p-4 rounded-lg border border-gray-700">
        <Label htmlFor="profile_image" className="text-gray-300">
          Immagine del Profilo
        </Label>
        <div className="flex items-center gap-4">
          <Image
            src={profileData.profile_image_url || "/images/placeholder.svg?width=80&height=80"}
            alt="Avatar attuale"
            width={80}
            height={80}
            className="rounded-full"
          />
          <Input
            id="profile_image"
            name="profile_image"
            type="file"
            accept="image/*"
            className="bg-gray-900 border-gray-600"
          />
          <input type="hidden" name="current_image_url" value={profileData.profile_image_url || ""} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="stage_name" className="text-gray-300">
            Nome d'Arte
          </Label>
          <Input
            id="stage_name"
            name="stage_name"
            defaultValue={profileData.stage_name || ""}
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
            defaultValue={profileData.main_discipline || ""}
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
          defaultValue={profileData.bio || ""}
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
          defaultValue={profileData.specialties?.join(", ") || ""}
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
            defaultValue={profileData.service_prices?.chat || 0}
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
            defaultValue={profileData.service_prices?.call || 0}
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
            defaultValue={profileData.service_prices?.video || 0}
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
