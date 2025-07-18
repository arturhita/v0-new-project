import { getBlogPosts } from "@/lib/actions/blog.actions"
import BlogEditor from "./blog-editor"

export default async function BlogManagementPage() {
  const posts = await getBlogPosts()
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Gestione Blog</h1>
      <BlogEditor posts={posts} />
    </div>
  )
}
