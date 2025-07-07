"use client"

import { useFormState } from "react-dom"
import { useEffect, useRef } from "react"
import { uploadStory } from "@/lib/actions/stories.actions"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { SubmitButton } from "./submit-button"

const initialState = { success: false, message: "" }

export function StoryUploader({ operatorId }: { operatorId: string }) {
  const [state, formAction] = useFormState(uploadStory.bind(null, operatorId), initialState)
  const { toast } = useToast()
  const formRef = useRef<HTMLFormElement>(null)

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

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="story_media">Carica Media</Label>
        <Input id="story_media" name="story_media" type="file" accept="image/*,video/mp4" required />
      </div>
      <SubmitButton>Carica Storia</SubmitButton>
    </form>
  )
}
