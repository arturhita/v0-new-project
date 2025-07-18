"use client"

import { useState, useRef, useTransition } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { PlusCircle, Edit, Trash2, Eye, Save, Calendar, Search, Loader2 } from "lucide-react"
import { type BlogPost, createPost, updatePost, deletePost } from "@/lib/actions/blog.actions"
import { useToast } from "@/hooks/use-toast"

interface BlogCMSAdvancedProps {
  initialPosts: any[] // Supabase data type can be complex
  authorId: string
}

export default function BlogCMSAdvanced({ initialPosts, authorId }: BlogCMSAdvancedProps) {
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [posts, setPosts] = useState(initialPosts)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedPost, setSelectedPost] = useState<any | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState<Partial<BlogPost>>({})

  const categories = ["Tarocchi", "Astrologia", "Numerologia", "Cartomanzia", "Cristalloterapia", "Rune", "Medianità"]

  const filteredPosts = posts.filter((post) => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || post.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const handleEdit = (post: any) => {
    setSelectedPost(post)
    setFormData({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      category: post.category,
      tags: post.tags || [],
      status: post.status,
      seoTitle: post.seo_title,
      seoDescription: post.seo_description,
      featured_image_url: post.featured_image_url,
    })
    setIsEditing(true)
  }

  const handleCreate = () => {
    setSelectedPost(null)
    setFormData({
      title: "",
      content: "",
      excerpt: "",
      category: "Tarocchi",
      tags: [],
      status: "draft",
      seoTitle: "",
      seoDescription: "",
      featured_image_url: "",
    })
    setIsEditing(true)
  }

  const handleSave = () => {
    if (!formData.title || !formData.content) {
      toast({ variant: "destructive", title: "Errore", description: "Titolo e contenuto sono obbligatori." })
      return
    }

    startTransition(async () => {
      const postData = {
        title: formData.title!,
        content: formData.content!,
        excerpt: formData.excerpt || formData.content!.substring(0, 150) + "...",
        category: formData.category!,
        tags: formData.tags || [],
        status: formData.status as "draft" | "published" | "scheduled",
        featured_image_url: formData.featured_image_url,
        seo_title: formData.seo_title,
        seo_description: formData.seo_description,
      }

      let result
      if (selectedPost) {
        result = await updatePost(selectedPost.id, postData)
      } else {
        result = await createPost(postData, authorId)
      }

      toast({
        title: result.success ? "Successo" : "Errore",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      })

      if (result.success) {
        setIsEditing(false)
        // Qui dovremmo ricaricare i post, ma per ora revalidatePath si occuperà di questo al refresh
      }
    })
  }

  const handleDelete = (id: string) => {
    if (!confirm("Sei sicuro di voler eliminare questo articolo?")) return

    startTransition(async () => {
      const result = await deletePost(id)
      toast({
        title: result.success ? "Successo" : "Errore",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      })
      if (result.success) {
        setPosts((prev) => prev.filter((p) => p.id !== id))
      }
    })
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      published: "bg-green-100 text-green-800",
      draft: "bg-yellow-100 text-yellow-800",
      scheduled: "bg-blue-100 text-blue-800",
    }
    return variants[status as keyof typeof variants] || variants.draft
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-slate-800">Gestione Blog</h1>
        <Button onClick={handleCreate} className="bg-gradient-to-r from-sky-500 to-cyan-500 text-white">
          <PlusCircle className="h-4 w-4 mr-2" />
          Nuovo Articolo
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
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
                <SelectItem value="scheduled">Programmati</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        {filteredPosts.map((post) => (
          <Card key={post.id} className="shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-6">
                {post.featured_image_url && (
                  <div className="lg:w-48 h-32 bg-slate-200 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={post.featured_image_url || "/placeholder.svg"}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <h3 className="text-xl font-semibold text-slate-800">{post.title}</h3>
                    <Badge className={getStatusBadge(post.status)}>{post.status}</Badge>
                  </div>
                  <p className="text-slate-600 mt-1">{post.excerpt}</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{post.category}</Badge>
                    {post.tags?.map((tag: string) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-sm text-slate-500 pt-2">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(post.created_at).toLocaleDateString("it-IT")}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {post.views || 0}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(post)} disabled={isPending}>
                        <Edit className="h-4 w-4 mr-1" />
                        Modifica
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(post.id)}
                        disabled={isPending}
                      >
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

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedPost ? "Modifica Articolo" : "Nuovo Articolo"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <Input
              placeholder="Titolo dell'articolo"
              value={formData.title || ""}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            <Textarea
              placeholder="Contenuto dell'articolo (supporta Markdown)"
              value={formData.content || ""}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={15}
            />
            <Textarea
              placeholder="Estratto (opzionale, verrà generato automaticamente se lasciato vuoto)"
              value={formData.excerpt || ""}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              rows={3}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v as any })}>
                <SelectTrigger>
                  <SelectValue placeholder="Stato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Bozza</SelectItem>
                  <SelectItem value="published">Pubblicato</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Input
              placeholder="URL immagine in evidenza"
              value={formData.featured_image_url || ""}
              onChange={(e) => setFormData({ ...formData, featured_image_url: e.target.value })}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Annulla
            </Button>
            <Button onClick={handleSave} disabled={isPending}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Salva
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
