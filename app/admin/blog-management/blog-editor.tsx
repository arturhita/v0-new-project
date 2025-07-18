"use client"

import { createBlogPost, uploadBlogImage } from "@/lib/actions/admin.actions"
import { useFormState, useFormStatus } from "react-dom"
import { useEffect, useState, useRef } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

function SubmitButton({ isUploading }: { isUploading: boolean }) {
  const { pending } = useFormStatus()
  const isDisabled = pending || isUploading
  return (
    <Button type="submit" disabled={isDisabled} className="w-full">
      {isUploading ? "Caricamento immagine..." : pending ? "Pubblicazione..." : "Crea Articolo"}
    </Button>
  )
}

export default function BlogEditor() {
  const [state, formAction] = useFormState(createBlogPost, null)
  const { toast } = useToast()
  const formRef = useRef<HTMLFormElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [imageUrl, setImageUrl] = useState("")

  useEffect(() => {
    if (state?.success) {
      toast({ title: "Successo", description: state.message })
      formRef.current?.reset()
      setImageUrl("")
    } else if (state?.message) {
      toast({ title: "Errore", description: state.message, variant: "destructive" })
    }
  }, [state, toast])

  const handleFormSubmit = async (formData: FormData) => {
    const imageFile = formData.get("image") as File
    if (imageFile && imageFile.size > 0) {
      setIsUploading(true)
      const imageFormData = new FormData()
      imageFormData.append("image", imageFile)
      const uploadResult = await uploadBlogImage(imageFormData)
      setIsUploading(false)

      if (uploadResult.success && uploadResult.url) {
        formData.set("image_url", uploadResult.url)
        formAction(formData)
      } else {
        toast({ title: "Errore Immagine", description: uploadResult.message, variant: "destructive" })
      }
    } else {
      formData.set("image_url", "") // No image
      formAction(formData)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nuovo Articolo</CardTitle>
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={handleFormSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Titolo</Label>
            <Input id="title" name="title" required />
          </div>
          <div>
            <Label htmlFor="content">Contenuto</Label>
            <Textarea id="content" name="content" required rows={10} />
          </div>
          <div>
            <Label htmlFor="category">Categoria</Label>
            <Input id="category" name="category" required placeholder="es. cartomanzia" />
          </div>
          <div>
            <Label htmlFor="image">Immagine di Copertina</Label>
            <Input id="image" name="image" type="file" accept="image/*" />
          </div>
          <input type="hidden" name="image_url" value={imageUrl} />
          <div>
            <Label htmlFor="status">Stato</Label>
            <Select name="status" defaultValue="draft">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Bozza</SelectItem>
                <SelectItem value="published">Pubblicato</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <SubmitButton isUploading={isUploading} />
        </form>
      </CardContent>
    </Card>
  )
}
