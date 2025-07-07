"use client"

import type React from "react"

import { useFormState } from "react-dom"
import { useEffect, useRef, useState } from "react"
import { addStory } from "@/lib/actions/stories.actions"
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SubmitButton } from "./submit-button"
import { UploadCloud } from "lucide-react"

export default function StoryUploader() {
  const { toast } = useToast()
  const [state, formAction] = useFormState(addStory, undefined)
  const formRef = useRef<HTMLFormElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string>("")

  useEffect(() => {
    if (state?.success) {
      toast({ title: "Successo", description: state.message })
      formRef.current?.reset()
      setPreview(null)
      setFileName("")
    } else if (state?.error) {
      toast({ title: "Errore", description: state.error.message, variant: "destructive" })
    }
  }, [state, toast])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFileName(file.name)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div className="flex items-center justify-center w-full">
        <Label
          htmlFor="story_media"
          className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
        >
          {preview ? (
            <img
              src={preview || "/placeholder.svg"}
              alt="Preview"
              className="h-full w-full object-contain rounded-lg"
            />
          ) : (
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <UploadCloud className="w-8 h-8 mb-4 text-gray-500" />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Clicca per caricare</span> o trascina
              </p>
              <p className="text-xs text-gray-500">Immagine o Video (MAX. 5MB)</p>
            </div>
          )}
          <Input
            id="story_media"
            name="story_media"
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept="image/*,video/mp4"
            required
          />
        </Label>
      </div>
      {fileName && <p className="text-sm text-gray-600 text-center">File selezionato: {fileName}</p>}
      <div className="flex justify-end">
        <SubmitButton>Carica Storia</SubmitButton>
      </div>
    </form>
  )
}
