"use client"

import type React from "react"

import { useState, useTransition } from "react"
import type { Profile } from "@/types/user.types"
import { updateOperatorProfile } from "@/lib/actions/operator.actions"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import Image from "next/image"

interface OperatorProfileFormProps {
  profile: Profile
}

export function OperatorProfileForm({ profile }: OperatorProfileFormProps) {
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await updateOperatorProfile(formData)
      if (result.success) {
        toast({
          title: "Successo!",
          description: result.message,
        })
      } else {
        toast({
          title: "Errore",
          description: result.message || "Si è verificato un errore.",
          variant: "destructive",
        })
      }
    })
  }

  return (
    <form action={handleSubmit} className="space-y-8">
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="relative">
          <Image
            src={avatarPreview || profile.avatar_url || "/placeholder.svg?width=128&height=128&query=avatar"}
            alt="Avatar"
            width={128}
            height={128}
            className="rounded-full w-32 h-32 object-cover border-4 border-slate-200"
          />
        </div>
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="avatar">Avatar</Label>
          <div className="flex items-center">
            <Input
              id="avatar"
              name="avatar"
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
            />
          </div>
          <p className="text-xs text-slate-500">Carica un'immagine quadrata (es. 500x500px).</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="nickname">Nome d'Arte</Label>
          <Input id="nickname" name="nickname" defaultValue={profile.nickname || ""} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone_number">Numero di Telefono (opzionale)</Label>
          <Input id="phone_number" name="phone_number" defaultValue={profile.phone_number || ""} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">La tua Biografia</Label>
        <Textarea
          id="bio"
          name="bio"
          defaultValue={profile.bio || ""}
          placeholder="Racconta chi sei, la tua storia, la tua filosofia..."
          rows={6}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="specializations">Specializzazioni (separate da virgola)</Label>
        <Input
          id="specializations"
          name="specializations"
          defaultValue={profile.specializations?.join(", ") || ""}
          placeholder="Es. Tarocchi di Marsiglia, Astrologia Karmica, Reiki"
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending} size="lg">
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvataggio...
            </>
          ) : (
            "Salva e Invia per Approvazione"
          )}
        </Button>
      </div>
    </form>
  )
}
