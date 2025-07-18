import { getBlogPosts } from "@/lib/actions/admin.actions"
import BlogEditor from "./blog-editor"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default async function BlogManagementPage() {
  const posts = await getBlogPosts()

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Gestione Blog</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <BlogEditor />
        </div>
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Articoli Esistenti</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {posts.map((post) => (
                  <div key={post.id} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">{post.title}</h3>
                      <p className="text-sm text-muted-foreground">Categoria: {post.category}</p>
                    </div>
                    <Badge variant={post.status === "published" ? "default" : "secondary"}>{post.status}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
