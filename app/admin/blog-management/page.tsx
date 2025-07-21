import { getAdminArticles, getAdminCategories } from "@/lib/actions/blog.actions"
import BlogCMSAdvanced from "@/components/blog-cms-advanced"
import { Toaster } from "@/components/ui/toaster"

export default async function AdminBlogManagementPage() {
  const articles = await getAdminArticles()
  const categories = await getAdminCategories()

  return (
    <>
      <BlogCMSAdvanced initialArticles={articles} initialCategories={categories} />
      <Toaster />
    </>
  )
}
