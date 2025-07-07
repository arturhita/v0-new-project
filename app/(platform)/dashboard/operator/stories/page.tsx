import { getOperatorStories } from "@/lib/actions/stories.actions"
import StoryUploader from "@/components/story-uploader"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import Image from "next/image"
import { deleteStory } from "@/lib/actions/stories.actions"

export default async function OperatorStoriesPage() {
  const { data: stories, error } = await getOperatorStories()

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Errore</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Gestisci le tue Storie</h1>
        <p className="text-gray-600">
          Carica immagini o brevi video che saranno visibili per 24 ore sul tuo profilo pubblico.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Carica una nuova Storia</CardTitle>
        </CardHeader>
        <CardContent>
          <StoryUploader />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Storie Attive</CardTitle>
        </CardHeader>
        <CardContent>
          {stories && stories.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {stories.map((story) => (
                <div key={story.id} className="relative group aspect-square">
                  <Image
                    src={story.media_url || "/placeholder.svg"}
                    alt="Storia"
                    layout="fill"
                    className="object-cover rounded-md"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                    <form
                      action={async () => {
                        "use server"
                        await deleteStory(story.id, story.media_url)
                      }}
                    >
                      <Button variant="destructive" size="icon" className="opacity-0 group-hover:opacity-100">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Non hai storie attive al momento.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
