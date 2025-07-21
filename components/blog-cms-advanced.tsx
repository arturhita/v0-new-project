"use client"
import { useState, useRef, useActionState, useEffect } from "react"
import type React from "react"
import { saveArticle, deleteArticle } from "@/lib/actions/blog.actions"
import { useToast } from "@/components/ui/use-toast"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { PlusCircle, Edit, Trash2, Save, Upload, Calendar, Search, Loader2 } from "lucide-react"

type Article = {
  id: string
  title: string
  status: string
  created_at: string
  image_url?: string | null
  excerpt?: string | null
  content?: string | null
  category_id?: string | null
  category?: { name: string } | null
}

type Category = {
  id: string
  name: string
}

interface BlogCMSAdvancedProps {
  initialArticles: Article[]
  initialCategories: Category[]
}

export default function BlogCMSAdvanced({ initialArticles, initialCategories }: BlogCMSAdvancedProps) {
  const [articles, setArticles] = useState(initialArticles)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const { toast } = useToast()

  const [state, formAction, isPending] = useActionState(saveArticle, { success: false, message: "" })

  useEffect(() => {
    if (state.message) {
      toast({
        title: state.success ? "Successo" : "Errore",
        description: state.message,
        variant: state.success ? "default" : "destructive",
      })
      if (state.success) {
        setIsEditing(false)
        // This would be better if the action returned the updated list
        // For now, we assume a re-fetch will happen on navigation or page reload
      }
    }
  }, [state, toast])

  useEffect(() => {
    setArticles(initialArticles)
  }, [initialArticles])

  const handleCreate = () => {
    setSelectedArticle(null)
    setImagePreview(null)
    setIsEditing(true)
  }

  const handleEdit = (article: Article) => {
    setSelectedArticle(article)
    setImagePreview(article.image_url || null)
    setIsEditing(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Sei sicuro di voler eliminare questo articolo?")) {
      const result = await deleteArticle(id)
      toast({
        title: result.success ? "Successo" : "Errore",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      })
      if (result.success) {
        setArticles(articles.filter((a) => a.id !== id))
      }
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      published: "bg-green-100 text-green-800",
      draft: "bg-yellow-100 text-yellow-800",
    }
    return variants[status as keyof typeof variants] || variants.draft
  }

  const filteredArticles = articles.filter((post) => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || post.status === filterStatus
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6 p-4 md:p-6 bg-slate-50 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Gestione Blog</h1>
          <p className="text-slate-600 mt-1">Crea, modifica e gestisci i contenuti del tuo AstroMag.</p>
        </div>
        <Button onClick={handleCreate} className="bg-gradient-to-r from-sky-500 to-cyan-500 text-white">
          <PlusCircle className="h-4 w-4 mr-2" />
          Nuovo Articolo
        </Button>
      </div>

      <Tabs defaultValue="posts">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="posts">Articoli</TabsTrigger>
          <TabsTrigger value="categories">Categorie (coming soon)</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <Input
                    placeholder="Cerca articoli..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filtra per stato" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tutti gli stati</SelectItem>
                    <SelectItem value="published">Pubblicati</SelectItem>
                    <SelectItem value="draft">Bozze</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6">
            {filteredArticles.map((post) => (
              <Card key={post.id} className="shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {post.image_url && (
                      <div className="w-full sm:w-40 h-32 bg-slate-200 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={post.image_url || "/placeholder.svg"}
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between">
                          <h3 className="text-lg font-semibold text-slate-800">{post.title}</h3>
                          <Badge className={getStatusBadge(post.status)}>{post.status}</Badge>
                        </div>
                        <p className="text-sm text-slate-500 mt-1">{post.category?.name || "Senza categoria"}</p>
                      </div>
                      <div className="flex items-center justify-between text-sm text-slate-500 mt-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(post.created_at).toLocaleDateString("it-IT")}
                        </span>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(post)}>
                            <Edit className="h-4 w-4 mr-1" />
                            Modifica
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(post.id)}>
                            <Trash2 className="h-4 w-4 mr-1" />
                            Elimina
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedArticle ? "Modifica Articolo" : "Nuovo Articolo"}</DialogTitle>
          </DialogHeader>
          <form action={formAction} className="space-y-6">
            {selectedArticle && <input type="hidden" name="id" value={selectedArticle.id} />}
            {selectedArticle?.image_url && (
              <input type="hidden" name="existing_image_url" value={selectedArticle.image_url} />
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="title">Titolo</Label>
                <Input id="title" name="title" defaultValue={selectedArticle?.title} required />
              </div>
              <div>
                <Label htmlFor="category_id">Categoria</Label>
                <Select name="category_id" defaultValue={selectedArticle?.category_id || ""}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona una categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {initialCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="excerpt">Estratto</Label>
              <Textarea id="excerpt" name="excerpt" defaultValue={selectedArticle?.excerpt || ""} rows={3} />
            </div>

            <div>
              <Label htmlFor="content">Contenuto</Label>
              <Textarea
                id="content"
                name="content"
                defaultValue={selectedArticle?.content || ""}
                rows={10}
                className="min-h-[200px]"
                required
              />
            </div>

            <div>
              <Label>Immagine in Evidenza</Label>
              <div className="flex items-center gap-4">
                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="h-4 w-4 mr-2" />
                  Carica Immagine
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                {imagePreview && (
                  <img
                    src={imagePreview || "/placeholder.svg"}
                    alt="Preview"
                    className="h-16 w-24 object-cover rounded"
                  />
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="status">Stato</Label>
              <Select name="status" defaultValue={selectedArticle?.status || "draft"}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Bozza</SelectItem>
                  <SelectItem value="published">Pubblicato</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                Annulla
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="bg-gradient-to-r from-sky-500 to-cyan-500 text-white"
              >
                {isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Salva Articolo
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
