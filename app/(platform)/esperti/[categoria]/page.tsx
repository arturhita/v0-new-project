import { getOperators } from "@/lib/actions/operator.public.actions"
import { ClientPage } from "./client-page"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="w-full h-96" />
      ))}
    </div>
  )
}

export default async function CategoriaPage({ params }: { params: { categoria: string } }) {
  const decodedCategory = decodeURIComponent(params.categoria)
  const { operators, total } = await getOperators(decodedCategory, 12)

  return (
    <div className="bg-gray-50 dark:bg-gray-900 py-12 md:py-20">
      <div className="container mx-auto px-4">
        <Suspense fallback={<LoadingSkeleton />}>
          <ClientPage initialOperators={operators} category={decodedCategory} totalOperators={total} />
        </Suspense>
      </div>
    </div>
  )
}
