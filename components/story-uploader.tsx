"use client"

import { useFormState } from "react-dom"
import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { deleteStory, uploadStory } from "@/lib/actions/stories.actions"
import { useToast } from "@/hooks/use-toast"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { SubmitButton } from "@/components/submit-button"
import { Button } from "@/components/ui/button"
import { Trash2, Loader2 } from "lucide-react"
import type { Story } from "@/types/database.types"

interface StoryUploaderProps {
  currentStories: Story[]
  operatorId: string
}

const initialState = { message: "", success: false }

export function StoryUploader({ currentStories, operatorId }: StoryUploaderProps) {
  const { toast } = useToast()
  const uploadStoryWithId = uploadStory.bind(null, operatorId)
  const [state, formAction] = useFormState(uploadStoryWithId, initialState)
  const formRef = useRef<HTMLFormElement>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

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

  const handleDelete = async (story: Story) => {
    setDeletingId(story.id)
    const result = await deleteStory(story.id, story.media_url)
    toast({
      title: result.success ? "Successo" : "Errore",
      description: result.message,
      variant: result.success ? "default" : "destructive",
    })
    setDeletingId(null)
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium text-white mb-4">Carica Nuova Storia</h3>
        <form ref={formRef} action={formAction} className="space-y-4">
          <div>
            <Label htmlFor="story_media" className="text-gray-300">
              File (Immagine o Video)
            </Label>
            <Input
              id="story_media"
              name="story_media"
              type="file"
              accept="image/*,video/mp4"
              required
              className="bg-gray-900 border-gray-600 file:text-gray-300 file:bg-gray-700 file:border-0 file:rounded-md file:px-3 file:py-1.5"
            />
          </div>
          <SubmitButton buttonText="Carica Storia" />
        </form>
      </div>
      <div>
        <h3 className="text-lg font-medium text-white mb-4">Storie Attive</h3>
        {currentStories.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {currentStories.map((story) => (
              <div key={story.id} className="relative group">
                <Image
                  src={story.media_url || "/placeholder.svg"}
                  alt="Storia"
                  width={150}
                  height={250}
                  className="rounded-lg object-cover aspect-[9/16]"
                />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDelete(story)}
                    disabled={deletingId === story.id}
                  >
                    {deletingId === story.id ? <Loader2 className="animate-spin" /> : <Trash2 />}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Nessuna storia attiva.</p>
        )}
      </div>
    </div>
  )
}
