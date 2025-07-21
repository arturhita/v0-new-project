import { getArticles, getCategories } from "@/lib/actions/blog.actions"
import BlogCMSAdvanced from "@/components/blog-cms-advanced"

export default async function BlogManagementPage() {
  const articles = await getArticles({ status: "all" })
  const categories = await getCategories()

  return <BlogCMSAdvanced initialArticles={articles} categories={categories} />
}
