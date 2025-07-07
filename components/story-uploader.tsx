"use client"

import { useFormState } from "react-dom"
import { useEffect, useRef } from "react"
import Image from "next/image"
import { uploadStory, deleteStory } from "@/lib/actions/stories.actions"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { SubmitButton } from "@/components/submit-button"
import { Trash2, Video } from "lucide-react"

const initialState = { message: "", success: false }

export function StoryUploader({ currentStories }: { currentStories: any[] }) {
  const { toast } = useToast()
  const [state, formAction] = useFormState(uploadStory, initialState)
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

  const handleDelete = async (storyId: string, mediaUrl: string) => {
    const result = await deleteStory(storyId, mediaUrl)
    toast({
      title: result.success ? "Successo" : "Errore",
      description: result.message,
      variant: result.success ? "default" : "destructive",
    })
  }

  return (
    <div className="space-y-8">
      <form ref={formRef} action={formAction} className="space-y-4 rounded-lg border border-gray-700 p-4">
        <h3 className="text-lg font-medium">Carica una nuova storia</h3>
        <div>
          <label htmlFor="story_media" className="sr-only">
            File storia
          </label>
          <Input
            id="story_media"
            name="story_media"
            type="file"
            accept="image/*,video/mp4"
            className="bg-gray-900 border-gray-600"
          />
        </div>
        <SubmitButton buttonText="Carica Storia" />
      </form>

      <div>
        <h3 className="text-lg font-medium mb-4">Storie Attive</h3>
        {currentStories.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {currentStories.map((story) => (
              <div key={story.id} className="relative group aspect-square">
                {story.media_type === "image" ? (
                  <Image
                    src={story.media_url || "/placeholder.svg"}
                    alt="Storia"
                    layout="fill"
                    className="rounded-md object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-black rounded-md flex items-center justify-center">
                    <Video className="w-10 h-10 text-white" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDelete(story.id, story.media_url)}
                    aria-label="Elimina storia"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">Non hai storie attive.</p>
        )}
      </div>
    </div>
  )
}
