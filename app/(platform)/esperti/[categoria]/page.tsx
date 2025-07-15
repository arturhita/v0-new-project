import { OperatorCard } from "@/components/operator-card"
import { Suspense } from "react"

async function getOperators(categoria: string) {
  // Replace with your actual data fetching logic
  // This is just a placeholder
  const operators = Array.from({ length: 5 }, (_, i) => ({
    id: i + 1,
    name: `Operator ${i + 1}`,
    category: categoria,
    // Add other operator properties as needed
  }))

  return operators
}

async function getUser() {
  // Replace with your actual user fetching logic
  // This is just a placeholder
  return {
    id: "user123",
    name: "Test User",
  }
}

export default async function CategoryPage({
  params,
}: {
  params: { categoria: string }
}) {
  const { categoria } = params
  const operators = await getOperators(categoria)
  const user = await getUser()

  return (
    <div>
      <h1>Esperti in {categoria}</h1>
      <Suspense fallback={<p>Loading operators...</p>}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {operators.map((operator) => (
            <OperatorCard key={operator.id} operator={operator} currentUser={user} />
          ))}
        </div>
      </Suspense>
    </div>
  )
}
