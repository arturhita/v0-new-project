"use client"

import type React from "react"

import { useFormState } from "react-dom"
import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { updateOperatorPublicProfile } from "@/lib/actions/operator.actions"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { SubmitButton } from "./submit-button"

const initialState = {
  success: false,
  message: "",
}

export function OperatorProfileForm({ profileData, operatorId }: { profileData: any; operatorId: string }) {
  const [state, formAction] = useFormState(updateOperatorPublicProfile.bind(null, operatorId), initialState)
  const { toast } = useToast()
  const formRef = useRef<HTMLFormElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(profileData.profile_image_url)

  useEffect(() => {
    if (state.message) {
      toast({
        title: state.success ? "Successo" : "Errore",
        description: state.message,
        variant: state.success ? "default" : "destructive",
      })
      if (state.success) {
        formRef.current?.reset()
      }
    }
  }, [state, toast])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-8">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="space-y-2">
          <Label>Immagine Profilo</Label>
          {previewUrl && (
            <Image
              src={previewUrl || "/placeholder.svg"}
              alt="Anteprima immagine profilo"
              width={128}
              height={128}
              className="h-32 w-32 rounded-full object-cover"
            />
          )}
          <Input id="profile_image" name="profile_image" type="file" accept="image/*" onChange={handleImageChange} />
          <input type="hidden" name="current_image_url" value={profileData.profile_image_url || ""} />
        </div>

        <div className="space-y-6 md:col-span-2">
          <div className="space-y-2">
            <Label htmlFor="stage_name">Nome Scena</Label>
            <Input id="stage_name" name="stage_name" defaultValue={profileData.stage_name || ""} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio / Descrizione</Label>
            <Textarea id="bio" name="bio" defaultValue={profileData.bio || ""} rows={5} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="main_discipline">Disciplina Principale</Label>
            <Input id="main_discipline" name="main_discipline" defaultValue={profileData.main_discipline || ""} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialties">Specialità (separate da virgola)</Label>
            <Input id="specialties" name="specialties" defaultValue={profileData.specialties?.join(", ") || ""} />
          </div>

          <fieldset className="grid grid-cols-1 gap-4 rounded-lg border p-4 md:grid-cols-3">
            <legend className="-ml-1 px-1 text-sm font-medium">Prezzi per Minuto (€)</legend>
            <div className="space-y-2">
              <Label htmlFor="price_chat">Chat</Label>
              <Input
                id="price_chat"
                name="price_chat"
                type="number"
                step="0.01"
                defaultValue={profileData.service_prices?.chat || 0}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price_call">Chiamata Vocale</Label>
              <Input
                id="price_call"
                name="price_call"
                type="number"
                step="0.01"
                defaultValue={profileData.service_prices?.call || 0}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price_video">Videochiamata</Label>
              <Input
                id="price_video"
                name="price_video"
                type="number"
                step="0.01"
                defaultValue={profileData.service_prices?.video || 0}
              />
            </div>
          </fieldset>
        </div>
      </div>
      <div className="flex justify-end">
        <SubmitButton>Salva Modifiche</SubmitButton>
      </div>
    </form>
  )
}
