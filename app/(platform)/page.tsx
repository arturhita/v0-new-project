import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { OperatorCard } from "@/components/operator-card"

async function getOperators() {
  const supabase = createServerComponentClient({ cookies })
  const { data: operators, error } = await supabase.from("operators").select("*")

  if (error) {
    console.log(error)
    return []
  }

  return operators || []
}

async function getSession() {
  const supabase = createServerComponentClient({ cookies })
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    return session
  } catch (error) {
    console.error("Error:", error)
    return null
  }
}

export default async function Page() {
  const operators = await getOperators()
  const session = await getSession()
  const user = session?.user

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Operators</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {operators.map((operator) => (
          <OperatorCard key={operator.id} operator={operator} currentUser={user} />
        ))}
      </div>
    </div>
  )
}
