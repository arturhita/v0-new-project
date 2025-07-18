import { getPosts } from "@/lib/actions/blog.actions"
import BlogCMSAdvanced from "@/components/blog-cms-advanced"
import { createAdminClient } from "@/lib/supabase/admin"

export default async function BlogManagementPage() {
  // Carichiamo i post dal server
  const posts = await getPosts()

  // Recuperiamo l'ID dell'utente admin (in un'app reale, questo verrebbe dalla sessione)
  const supabase = createAdminClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const authorId = user?.id || ""

  return <BlogCMSAdvanced initialPosts={posts} authorId={authorId} />
}
