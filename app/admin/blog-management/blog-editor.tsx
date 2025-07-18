"use client"
import { useFormState, useFormStatus } from "react-dom"
import { useEffect, useRef } from "react"
import { createBlogPost } from "@/lib/actions/blog.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Pubblicazione..." : "Pubblica Articolo"}
    </Button>
  )
}

export default function BlogEditor({ posts }: { posts: any[] }) {
  const [state, formAction] = useFormState(createBlogPost, { success: false, message: "" })
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast.success(state.message)
        formRef.current?.reset()
      } else {
        toast.error(state.message)
      }
    }
  }, [state])

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Nuovo Articolo</CardTitle>
        </CardHeader>
        <CardContent>
          <form ref={formRef} action={formAction} className="space-y-4">
            <div>
              <Label htmlFor="title">Titolo</Label>
              <Input id="title" name="title" required />
            </div>
            <div>
              <Label htmlFor="category">Categoria</Label>
              <Input id="category" name="category" required />
            </div>
            <div>
              <Label htmlFor="image">Immagine di Copertina</Label>
              <Input id="image" name="image" type="file" accept="image/*" required />
            </div>
            <div>
              <Label htmlFor="content">Contenuto</Label>
              <Textarea id="content" name="content" rows={10} required />
            </div>
            <SubmitButton />
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Articoli Pubblicati</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {posts.map((post) => (
              <li key={post.id} className="text-sm p-2 border rounded">
                {post.title}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
