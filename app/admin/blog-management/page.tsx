import { getPosts } from "@/lib/actions/blog.actions"
import { BlogCmsAdvanced } from "@/components/blog-cms-advanced"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

export default async function BlogManagementPage() {
  const posts = await getPosts()

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestione Blog</h1>
        <BlogCmsAdvanced />
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Immagine</TableHead>
              <TableHead>Titolo</TableHead>
              <TableHead>Stato</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Data Creazione</TableHead>
              <TableHead className="text-right">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.length > 0 ? (
              posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>
                    {post.featured_image_url ? (
                      <Image
                        src={post.featured_image_url || "/placeholder.svg"}
                        alt={post.title}
                        width={64}
                        height={48}
                        className="rounded-md object-cover"
                      />
                    ) : (
                      <div className="w-16 h-12 bg-gray-200 rounded-md" />
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{post.title}</TableCell>
                  <TableCell>
                    <Badge variant={post.status === "published" ? "default" : "secondary"}>
                      {post.status === "published" ? "Pubblicato" : "Bozza"}
                    </Badge>
                  </TableCell>
                  <TableCell>{post.category}</TableCell>
                  <TableCell>{new Date(post.created_at).toLocaleDateString("it-IT")}</TableCell>
                  <TableCell className="text-right">
                    <BlogCmsAdvanced post={post} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">
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
