"use client"
import { useState, useRef } from "react"
import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { PlusCircle, Edit, Trash2, Eye, Save, Upload, Calendar, Users, BarChart3, Search } from "lucide-react"

interface BlogPost {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  category: string
  tags: string[]
  status: "draft" | "published" | "scheduled"
  featuredImage?: string
  author: string
  publishDate: string
  views: number
  likes: number
  comments: number
  seoTitle?: string
  seoDescription?: string
  readTime: number
}

const mockPosts: BlogPost[] = [
  {
    id: "1",
    title: "I Segreti dei Tarocchi Marsigliesi",
    slug: "segreti-tarocchi-marsigliesi",
    content: "Contenuto completo dell'articolo sui tarocchi...",
    excerpt: "Scopri i misteri nascosti nei simboli dei Tarocchi di Marsiglia",
    category: "Tarocchi",
    tags: ["tarocchi", "marsiglia", "divinazione"],
    status: "published",
    featuredImage: "/placeholder.svg?width=400&height=250",
    author: "Admin",
    publishDate: "2025-06-20",
    views: 1247,
    likes: 89,
    comments: 23,
    seoTitle: "Guida Completa ai Tarocchi Marsigliesi | Unveilly",
    seoDescription: "Scopri tutti i segreti dei Tarocchi di Marsiglia con la nostra guida completa",
    readTime: 8,
  },
  {
    id: "2",
    title: "Astrologia 2025: Previsioni e Tendenze",
    slug: "astrologia-2025-previsioni",
    content: "Le previsioni astrologiche per il nuovo anno...",
    excerpt: "Cosa ci riservano le stelle per il 2025? Scopri le previsioni complete",
    category: "Astrologia",
    tags: ["astrologia", "2025", "previsioni"],
    status: "draft",
    author: "Admin",
    publishDate: "2025-06-25",
    views: 0,
    likes: 0,
    comments: 0,
    readTime: 12,
  },
]

export default function BlogCMSAdvanced() {
  const [posts, setPosts] = useState<BlogPost[]>(mockPosts)
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState("posts")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState<Partial<BlogPost>>({
    title: "",
    content: "",
    excerpt: "",
    category: "Tarocchi",
    tags: [],
    status: "draft",
    seoTitle: "",
    seoDescription: "",
  })

  const categories = ["Tarocchi", "Astrologia", "Numerologia", "Cartomanzia", "Cristalloterapia", "Rune"]

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || post.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const handleEdit = (post: BlogPost) => {
    setSelectedPost(post)
    setFormData(post)
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
    })
    setIsEditing(true)
  }

  const handleSave = () => {
    if (!formData.title || !formData.content) {
      alert("Titolo e contenuto sono obbligatori")
      return
    }

    const postData: BlogPost = {
      id: selectedPost?.id || Date.now().toString(),
      title: formData.title!,
      slug: formData
        .title!.toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, ""),
      content: formData.content!,
      excerpt: formData.excerpt || formData.content!.substring(0, 150) + "...",
      category: formData.category!,
      tags: formData.tags || [],
      status: formData.status as "draft" | "published" | "scheduled",
      featuredImage: formData.featuredImage,
      author: "Admin",
      publishDate: selectedPost?.publishDate || new Date().toISOString().split("T")[0],
      views: selectedPost?.views || 0,
      likes: selectedPost?.likes || 0,
      comments: selectedPost?.comments || 0,
      seoTitle: formData.seoTitle,
      seoDescription: formData.seoDescription,
      readTime: Math.ceil(formData.content!.split(" ").length / 200),
    }

    if (selectedPost) {
      setPosts(posts.map((p) => (p.id === selectedPost.id ? postData : p)))
    } else {
      setPosts([postData, ...posts])
    }

    setIsEditing(false)
    alert("Articolo salvato con successo!")
  }

  const handleDelete = (id: string) => {
    if (confirm("Sei sicuro di voler eliminare questo articolo?")) {
      setPosts(posts.filter((p) => p.id !== id))
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const imageUrl = URL.createObjectURL(file)
      setFormData({ ...formData, featuredImage: imageUrl })
    }
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
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Blog CMS Avanzato</h1>
          <p className="text-slate-600 mt-1">Gestione completa dei contenuti del blog</p>
        </div>
        <Button onClick={handleCreate} className="bg-gradient-to-r from-sky-500 to-cyan-500 text-white">
          <PlusCircle className="h-4 w-4 mr-2" />
          Nuovo Articolo
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="posts">Articoli</TabsTrigger>
          <TabsTrigger value="categories">Categorie</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Impostazioni</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <Input
                      placeholder="Cerca articoli..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
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

          {/* Posts List */}
          <div className="grid gap-6">
            {filteredPosts.map((post) => (
              <Card key={post.id} className="shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {post.featuredImage && (
                      <div className="lg:w-48 h-32 bg-slate-200 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={post.featuredImage || "/placeholder.svg"}
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-semibold text-slate-800">{post.title}</h3>
                          <p className="text-slate-600 mt-1">{post.excerpt}</p>
                        </div>
                        <Badge className={getStatusBadge(post.status)}>{post.status}</Badge>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">{post.category}</Badge>
                        {post.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-sm text-slate-500">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(post.publishDate).toLocaleDateString("it-IT")}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {post.views} visualizzazioni
                          </span>
                          <span>{post.readTime} min lettura</span>
                        </div>
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

        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>Gestione Categorie</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {categories.map((category) => (
                  <div key={category} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">{category}</span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        Modifica
                      </Button>
                      <Button size="sm" variant="destructive">
                        Elimina
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Articoli Totali</p>
                    <p className="text-2xl font-bold">{posts.length}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Visualizzazioni Totali</p>
                    <p className="text-2xl font-bold">{posts.reduce((sum, post) => sum + post.views, 0)}</p>
                  </div>
                  <Eye className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Articoli Pubblicati</p>
                    <p className="text-2xl font-bold">{posts.filter((p) => p.status === "published").length}</p>
                  </div>
                  <Users className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Bozze</p>
                    <p className="text-2xl font-bold">{posts.filter((p) => p.status === "draft").length}</p>
                  </div>
                  <Edit className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Impostazioni Blog</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Commenti Abilitati</Label>
                  <p className="text-sm text-slate-600">Permetti commenti sui nuovi articoli</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Moderazione Commenti</Label>
                  <p className="text-sm text-slate-600">Approva manualmente i commenti</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>SEO Automatico</Label>
                  <p className="text-sm text-slate-600">Genera automaticamente meta tag SEO</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Editor Modal */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedPost ? "Modifica Articolo" : "Nuovo Articolo"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Titolo</Label>
                <Input
                  value={formData.title || ""}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Inserisci il titolo..."
                />
              </div>
              <div>
                <Label>Categoria</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Estratto</Label>
              <Textarea
                value={formData.excerpt || ""}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="Breve descrizione dell'articolo..."
                rows={3}
              />
            </div>

            <div>
              <Label>Contenuto</Label>
              <Textarea
                value={formData.content || ""}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Scrivi il contenuto dell'articolo..."
                rows={10}
                className="min-h-[200px]"
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
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                {formData.featuredImage && (
                  <img
                    src={formData.featuredImage || "/placeholder.svg"}
                    alt="Preview"
                    className="h-16 w-24 object-cover rounded"
                  />
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Titolo SEO</Label>
                <Input
                  value={formData.seoTitle || ""}
                  onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                  placeholder="Titolo per i motori di ricerca..."
                />
              </div>
              <div>
                <Label>Stato</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Bozza</SelectItem>
                    <SelectItem value="published">Pubblicato</SelectItem>
                    <SelectItem value="scheduled">Programmato</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Descrizione SEO</Label>
              <Textarea
                value={formData.seoDescription || ""}
                onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                placeholder="Descrizione per i motori di ricerca..."
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Annulla
            </Button>
            <Button onClick={handleSave} className="bg-gradient-to-r from-sky-500 to-cyan-500 text-white">
              <Save className="h-4 w-4 mr-2" />
              Salva Articolo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
