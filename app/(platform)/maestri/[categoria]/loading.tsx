import { Skeleton } from "@/components/ui/skeleton"

const OperatorCardSkeleton = () => (
  <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 rounded-3xl shadow-lg p-6 border border-yellow-600/20 h-[520px] flex flex-col">
    <div className="flex justify-end">
      <Skeleton className="h-6 w-20 rounded-full bg-gray-600/50" />
    </div>
    <div className="flex flex-col items-center text-center flex-1 mt-2">
      <Skeleton className="w-20 h-20 rounded-full mb-4 bg-gray-600/50" />
      <Skeleton className="h-6 w-40 mb-2 bg-gray-600/50" />
      <Skeleton className="h-4 w-48 mb-3 bg-gray-600/50" />
      <div className="flex items-center justify-center space-x-1 mb-3">
        <Skeleton className="h-4 w-24 bg-gray-600/50" />
      </div>
      <Skeleton className="h-4 w-full mb-1 bg-gray-600/50" />
      <Skeleton className="h-4 w-full mb-1 bg-gray-600/50" />
      <Skeleton className="h-4 w-3/4 mb-4 bg-gray-600/50" />
      <div className="flex flex-wrap justify-center gap-1 mb-4">
        <Skeleton className="h-5 w-16 rounded-full bg-gray-600/50" />
        <Skeleton className="h-5 w-20 rounded-full bg-gray-600/50" />
        <Skeleton className="h-5 w-14 rounded-full bg-gray-600/50" />
      </div>
      <div className="space-y-2 mb-4 w-full mt-auto">
        <Skeleton className="h-10 w-full rounded-md bg-gray-600/50" />
        <Skeleton className="h-10 w-full rounded-md bg-gray-600/50" />
      </div>
    </div>
  </div>
)

export default function CategoriaLoading() {
  return (
    <div className="bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 text-white min-h-screen">
      <main className="relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 py-16 md:py-24 relative z-10">
          {/* Sezione Titolo Skeleton */}
          <div className="text-center mb-12 md:mb-16">
            <Skeleton className="h-12 w-3/4 md:w-1/2 mx-auto mb-4 bg-gray-600/50" />
            <Skeleton className="h-6 w-full md:w-2/3 mx-auto bg-gray-600/50" />
          </div>

          {/* Sezione Filtri e Ricerca Skeleton */}
          <div className="mb-12 p-6 bg-blue-900/50 rounded-2xl flex flex-col md:flex-row gap-4 items-center">
            <Skeleton className="h-12 w-full flex-grow rounded-full bg-gray-600/50" />
            <div className="flex gap-4 w-full md:w-auto">
              <Skeleton className="h-12 w-full md:w-[180px] rounded-full bg-gray-600/50" />
              <Skeleton className="h-12 w-full md:w-[180px] rounded-full bg-gray-600/50" />
            </div>
          </div>

          {/* Griglia Operatori Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {[...Array(8)].map((_, index) => (
              <OperatorCardSkeleton key={index} />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
