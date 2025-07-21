"use client"

import { useState, useEffect } from "react"
import { useFormState, useFormStatus } from "react-dom"
import type { BlogArticle, BlogCategory } from "@/types/blog.types"
import { upsertArticle, deleteArticle } from "@/lib/actions/blog.actions"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PlusCircle, Edit, Trash2, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import Image from "next/image"

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {isEditing ? "Salva Modifiche" : "Crea Articolo"}
    </Button>
  )
}

export default function BlogCMSAdvanced({
  initialArticles,
  categories,
}: { initialArticles: BlogArticle[]; categories: BlogCategory[] }) {
  const [open, setOpen] = useState(false)
  const [selectedArticle, setSelectedArticle] = useState<BlogArticle | null>(null)
  const { toast } = useToast()

  const [state, formAction] = useFormState(upsertArticle, { success: false, message: "" })

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast({ title: "Successo!", description: state.message })
        setOpen(false)
        setSelectedArticle(null)
      } else {
        toast({ title: "Errore", description: state.message, variant: "destructive" })
      }
    }
  }, [state, toast])

  const handleEdit = (article: BlogArticle) => {
    setSelectedArticle(article)
    setOpen(true)
  }

  const handleNew = () => {
    setSelectedArticle(null)
    setOpen(true)
  }

  const handleDelete = async (articleId: string) => {
    if (confirm("Sei sicuro di voler eliminare questo articolo? L'azione è irreversibile.")) {
      const result = await deleteArticle(articleId)
      toast({
        title: result.success ? "Successo" : "Errore",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      })
    }
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Gestione Articoli Astromag</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNew}>
              <PlusCircle className="mr-2 h-4 w-4" /> Nuovo Articolo
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
              <DialogTitle>{selectedArticle ? "Modifica Articolo" : "Crea Nuovo Articolo"}</DialogTitle>
            </DialogHeader>
            <form action={formAction} className="grid gap-4 py-4">
              <input type="hidden" name="articleId" value={selectedArticle?.id || ""} />
              <input type="hidden" name="currentImageUrl" value={selectedArticle?.image_url || ""} />

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Titolo
                </Label>
                <Input id="title" name="title" defaultValue={selectedArticle?.title} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="slug" className="text-right">
                  Slug
                </Label>
                <Input id="slug" name="slug" defaultValue={selectedArticle?.slug} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="excerpt" className="text-right">
                  Estratto
                </Label>
                <Textarea
                  id="excerpt"
                  name="excerpt"
                  defaultValue={selectedArticle?.excerpt || ""}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="content" className="text-right">
                  Contenuto
                </Label>
                <Textarea
                  id="content"
                  name="content"
                  defaultValue={selectedArticle?.content || ""}
                  className="col-span-3"
                  rows={8}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="image" className="text-right">
                  Immagine
                </Label>
                <Input id="image" name="image" type="file" accept="image/*" className="col-span-3" />
              </div>
              {selectedArticle?.image_url && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="col-start-2 col-span-3">
                    <Image
                      src={selectedArticle.image_url || "/placeholder.svg"}
                      alt="Current image"
                      width={100}
                      height={100}
                      className="rounded-md object-cover"
                    />
                  </div>
                </div>
              )}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category_id" className="text-right">
                  Categoria
                </Label>
                <Select name="category_id" defaultValue={selectedArticle?.category_id || undefined}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Seleziona una categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Stato
                </Label>
                <Select name="status" defaultValue={selectedArticle?.status || "draft"}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Seleziona uno stato" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Bozza</SelectItem>
                    <SelectItem value="published">Pubblicato</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="read_time_minutes" className="text-right">
                  T. Lettura (min)
                </Label>
                <Input
                  id="read_time_minutes"
                  name="read_time_minutes"
                  type="number"
                  defaultValue={selectedArticle?.read_time_minutes || ""}
                  className="col-span-3"
                />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Annulla</Button>
                </DialogClose>
                <SubmitButton isEditing={!!selectedArticle} />
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg w-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Titolo</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Stato</TableHead>
              <TableHead>Data Pubblicazione</TableHead>
              <TableHead className="text-right">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialArticles.length > 0 ? (
              initialArticles.map((article) => (
                <TableRow key={article.id}>
                  <TableCell className="font-medium">{article.title}</TableCell>
                  <TableCell>{article.blog_categories?.name || "N/A"}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${article.status === "published" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
                    >
                      {article.status === "published" ? "Pubblicato" : "Bozza"}
                    </span>
                  </TableCell>
                  <TableCell>
                    {article.published_at
                      ? new Date(article.published_at).toLocaleDateString("it-IT")
                      : "Non pubblicato"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(article)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(article.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  Nessun articolo trovato.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
