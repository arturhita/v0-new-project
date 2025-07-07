import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getActiveStories } from "@/lib/actions/stories.actions"
import { StoryUploader } from "@/components/story-uploader"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"

export default async function OperatorStoriesPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const stories = await getActiveStories(user.id)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gestisci le tue Storie</CardTitle>
          <CardDescription>
            Carica immagini o brevi video che scadranno dopo 24 ore. Un ottimo modo per interagire con i tuoi clienti.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StoryUploader operatorId={user.id} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Storie Attive</CardTitle>
        </CardHeader>
        <CardContent>
          {stories.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {stories.map((story) => (
                <div key={story.id} className="relative aspect-square overflow-hidden rounded-lg">
                  {story.media_type === "image" ? (
                    <Image
                      src={story.media_url || "/placeholder.svg"}
                      alt="Storia"
                      layout="fill"
                      className="object-cover"
                    />
                  ) : (
                    <video src={story.media_url} className="h-full w-full object-cover" controls={false} />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Non hai storie attive al momento.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
