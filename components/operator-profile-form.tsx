"use client"

import type React from "react"
import { useActionState, useEffect, useRef, useState } from "react"
import { useFormStatus } from "react-dom"

import type { Profile } from "@/types/user.types"
import { updateOperatorProfile } from "@/lib/actions/operator.actions"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Save } from "lucide-react"

const initialState = {
  success: false,
  message: "",
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} size="lg" className="w-full">
      <Save className="mr-2 h-4 w-4" />
      {pending ? "Salvataggio in corso..." : "Salva e Invia per Approvazione"}
    </Button>
  )
}

export function OperatorProfileForm({ profile }: { profile: Profile }) {
  const [state, formAction] = useActionState(updateOperatorProfile, initialState)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatar_url)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (state.message) {
      toast({
        title: state.success ? "Successo!" : "Errore",
        description: state.message,
        variant: state.success ? "default" : "destructive",
      })
    }
  }, [state])

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <form action={formAction} className="space-y-8">
      <div className="flex items-center gap-6">
        <div className="relative">
          <Avatar className="h-24 w-24">
            <AvatarImage src={avatarPreview || undefined} alt={profile.nickname || "Avatar"} />
            <AvatarFallback className="text-3xl">
              {(profile.nickname || profile.name || "O").charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="absolute bottom-0 right-0 rounded-full h-8 w-8 bg-transparent"
            onClick={() => avatarInputRef.current?.click()}
          >
            <Camera className="h-4 w-4" />
            <span className="sr-only">Cambia avatar</span>
          </Button>
          <Input
            type="file"
            name="avatar"
            ref={avatarInputRef}
            className="hidden"
            accept="image/png, image/jpeg, image/webp"
            onChange={handleAvatarChange}
          />
        </div>
        <div className="flex-grow">
          <Label htmlFor="nickname">Nome d'Arte (Pubblico)</Label>
          <Input
            id="nickname"
            name="nickname"
            defaultValue={profile.nickname || ""}
            required
            className="text-2xl p-6"
            placeholder="Es. Stella Divina"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="bio">La Tua Essenza (Bio Pubblica)</Label>
          <Textarea
            id="bio"
            name="bio"
            defaultValue={profile.bio || ""}
            placeholder="Descrivi la tua arte, la tua esperienza e come puoi aiutare i cercatori..."
            rows={5}
          />
        </div>
        <div>
          <Label htmlFor="specializations">Le Tue Specializzazioni (separate da virgola)</Label>
          <Input
            id="specializations"
            name="specializations"
            defaultValue={profile.specializations?.join(", ") || ""}
            placeholder="Tarocchi, Astrologia, Rune"
          />
        </div>
        <div>
          <Label htmlFor="phone_number">Numero di Telefono (Privato, per il centralino)</Label>
          <Input
            id="phone_number"
            name="phone_number"
            type="tel"
            defaultValue={profile.phone_number || ""}
            placeholder="+39 333 1234567"
          />
        </div>
      </div>

      <SubmitButton />
    </form>
  )
}
