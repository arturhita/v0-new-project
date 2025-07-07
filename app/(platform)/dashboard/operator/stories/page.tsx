import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getActiveStories } from "@/lib/actions/stories.actions"
import { StoryUploader } from "@/components/story-uploader"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

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
      <Card className="bg-gray-800/50 border-gray-700/50 text-white">
        <CardHeader>
          <CardTitle>Gestisci le Tue Storie</CardTitle>
          <CardDescription className="text-gray-400">
            Carica immagini o brevi video (max 5MB) che saranno visibili per 24 ore sul tuo profilo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StoryUploader currentStories={stories} operatorId={user.id} />
        </CardContent>
      </Card>
    </div>
  )
}
