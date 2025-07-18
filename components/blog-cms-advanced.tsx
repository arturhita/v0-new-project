"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useFormState, useFormStatus } from "react-dom"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { createPost, updatePost, deletePost } from "@/lib/actions/blog.actions"
import type { Post } from "@/lib/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from "next/image"
import { UploadCloud, X } from "lucide-react"

const initialState = { error: null, fieldErrors: null, success: null }

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (isEditing ? "Salvataggio..." : "Creazione...") : isEditing ? "Salva Modifiche" : "Crea Articolo"}
    </Button>
  )
}

export function BlogCmsAdvanced({ post }: { post?: Post }) {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  const isEditing = !!post
  const formRef = useRef<HTMLFormElement>(null)

  const [imageUrl, setImageUrl] = useState(post?.featured_image_url || "")
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const action = isEditing ? updatePost.bind(null, post.id) : createPost
  const [state, formAction] = useFormState(action, initialState)

  useEffect(() => {
    if (state?.success) {
      toast({ title: "Successo!", description: state.success })
      setOpen(false)
      formRef.current?.reset()
      setImageUrl("")
    }
    if (state?.error) {
      toast({ title: "Errore", description: state.error, variant: "destructive" })
    }
  }, [state, toast])

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const response = await fetch(`/api/upload?filename=${file.name}`, {
        method: "POST",
        body: file,
      })

      if (!response.ok) {
        throw new Error("Upload fallito")
      }

      const newBlob = await response.json()
      setImageUrl(newBlob.url)
    } catch (error) {
      console.error(error)
      toast({ title: "Errore Upload", description: "Impossibile caricare l'immagine.", variant: "destructive" })
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async () => {
    if (!post) return
    if (confirm("Sei sicuro di voler eliminare questo articolo?")) {
      const result = await deletePost(post.id)
      if (result.error) {
        toast({ title: "Errore", description: result.error, variant: "destructive" })
      } else {
        toast({ title: "Successo", description: result.success })
        setOpen(false)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={isEditing ? "outline" : "default"}>{isEditing ? "Modifica" : "Nuovo Articolo"}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Modifica Articolo" : "Crea Nuovo Articolo"}</DialogTitle>
        </DialogHeader>
        <form ref={formRef} action={formAction} className="grid gap-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="title">Titolo</Label>
              <Input id="title" name="title" defaultValue={post?.title} />
              {state?.fieldErrors?.title && <p className="text-red-500 text-sm">{state.fieldErrors.title[0]}</p>}
            </div>
            <div>
              <Label htmlFor="slug">Slug (URL)</Label>
              <Input id="slug" name="slug" defaultValue={post?.slug} />
              {state?.fieldErrors?.slug && <p className="text-red-500 text-sm">{state.fieldErrors.slug[0]}</p>}
            </div>
          </div>
          <div>
            <Label>Immagine in Evidenza</Label>
            <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10 dark:border-gray-100/25">
              {imageUrl ? (
                <div className="relative">
                  <Image
                    src={imageUrl || "/placeholder.svg"}
                    alt="Preview"
                    width={400}
                    height={200}
                    className="rounded-md"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                    onClick={() => setImageUrl("")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4 flex text-sm leading-6 text-gray-600">
                    <Label
                      htmlFor="file-upload"
                      className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
                    >
                      <span>{isUploading ? "Caricamento..." : "Carica un file"}</span>
                      <Input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        onChange={handleFileChange}
                        ref={fileInputRef}
                        disabled={isUploading}
                      />
                    </Label>
                    <p className="pl-1">o trascina e rilascia</p>
                  </div>
                  <p className="text-xs leading-5 text-gray-600">PNG, JPG, GIF fino a 10MB</p>
                </div>
              )}
            </div>
            <Input type="hidden" name="featured_image_url" value={imageUrl} />
          </div>
          <div>
            <Label htmlFor="content">Contenuto</Label>
            <Textarea id="content" name="content" defaultValue={post?.content} rows={15} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="category">Categoria</Label>
              <Input id="category" name="category" defaultValue={post?.category} />
            </div>
            <div>
              <Label htmlFor="status">Stato</Label>
              <Select name="status" defaultValue={post?.status || "draft"}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona uno stato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Bozza</SelectItem>
                  <SelectItem value="published">Pubblicato</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            {isEditing && (
              <Button variant="destructive" type="button" onClick={handleDelete}>
                Elimina
              </Button>
            )}
            <div className="flex-grow" />
            <DialogClose asChild>
              <Button variant="outline">Annulla</Button>
            </DialogClose>
            <SubmitButton isEditing={isEditing} />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
