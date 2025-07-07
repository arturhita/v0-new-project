"use client"

import type React from "react"

import { useFormState } from "react-dom"
import { useEffect, useRef, useState } from "react"
import { updateOperatorProfile, updateProfileImage } from "@/lib/actions/operator.actions"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import Image from "next/image"
import { SubmitButton } from "./submit-button"

type Profile = {
  id: string
  display_name: string
  description: string
  profile_image_url: string | null
  headline: string
  chat_price_per_minute: number
  call_price_per_minute: number
  video_price_per_minute: number
}

export default function OperatorProfileForm({ profile }: { profile: Profile }) {
  const { toast } = useToast()
  const [formState, formAction] = useFormState(updateOperatorProfile, undefined)
  const [imageFormState, imageFormAction] = useFormState(updateProfileImage, undefined)
  const [preview, setPreview] = useState<string | null>(profile.profile_image_url)
  const imageFormRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (formState?.success) {
      toast({ title: "Successo", description: formState.message })
    } else if (formState?.error) {
      toast({ title: "Errore", description: formState.error.message, variant: "destructive" })
    }
  }, [formState, toast])

  useEffect(() => {
    if (imageFormState?.success) {
      toast({ title: "Successo", description: imageFormState.message })
      if (imageFormState.publicUrl) {
        setPreview(imageFormState.publicUrl)
      }
    } else if (imageFormState?.error) {
      toast({ title: "Errore", description: imageFormState.error.message, variant: "destructive" })
    }
  }, [imageFormState, toast])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
        // Submit the form automatically on file selection
        setTimeout(() => imageFormRef.current?.requestSubmit(), 0)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-4">Immagine del Profilo</h2>
        <form ref={imageFormRef} action={imageFormAction} className="flex items-center gap-6">
          <div className="relative w-24 h-24">
            <Image
              src={preview || "/images/placeholder.svg?width=96&height=96&query=avatar"}
              alt="Avatar"
              width={96}
              height={96}
              className="rounded-full object-cover"
            />
          </div>
          <div>
            <Label
              htmlFor="profile_image"
              className="cursor-pointer bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-md"
            >
              Cambia Immagine
            </Label>
            <Input
              id="profile_image"
              name="profile_image"
              type="file"
              className="hidden"
              onChange={handleFileChange}
              accept="image/*"
            />
          </div>
        </form>
      </div>

      <form action={formAction} className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Informazioni Pubbliche</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="display_name">Nome Pubblico</Label>
              <Input id="display_name" name="display_name" defaultValue={profile.display_name} required />
            </div>
            <div>
              <Label htmlFor="headline">Titolo (es. Cartomante Esperta)</Label>
              <Input id="headline" name="headline" defaultValue={profile.headline} required />
            </div>
            <div>
              <Label htmlFor="description">Descrizione del Profilo</Label>
              <Textarea id="description" name="description" defaultValue={profile.description} rows={5} required />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Tariffe dei Servizi (€/min)</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="chat_price_per_minute">Chat</Label>
              <Input
                id="chat_price_per_minute"
                name="chat_price_per_minute"
                type="number"
                step="0.01"
                defaultValue={profile.chat_price_per_minute}
                required
              />
            </div>
            <div>
              <Label htmlFor="call_price_per_minute">Chiamata</Label>
              <Input
                id="call_price_per_minute"
                name="call_price_per_minute"
                type="number"
                step="0.01"
                defaultValue={profile.call_price_per_minute}
                required
              />
            </div>
            <div>
              <Label htmlFor="video_price_per_minute">Video</Label>
              <Input
                id="video_price_per_minute"
                name="video_price_per_minute"
                type="number"
                step="0.01"
                defaultValue={profile.video_price_per_minute}
                required
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <SubmitButton>Salva Modifiche</SubmitButton>
        </div>
      </form>
    </div>
  )
}
