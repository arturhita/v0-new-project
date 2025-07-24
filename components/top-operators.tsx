import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ExpertCard } from "./expert-card"

type Operator = {
  id: string
  full_name: string | null
  avatar_url: string | null
  operator_profiles: {
    specialization: string | null
    average_rating: number | null
    is_online: boolean | null
  } | null
}

interface TopOperatorsProps {
  operators: Operator[]
}

export function TopOperators({ operators }: TopOperatorsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Consulenti Consigliati</CardTitle>
        <CardDescription>Scopri i nostri migliori esperti.</CardDescription>
      </CardHeader>
      <CardContent>
        {operators.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {operators.map((op) => (
              <ExpertCard
                key={op.id}
                id={op.id}
                name={op.full_name || "Consulente"}
                specialization={op.operator_profiles?.specialization || "Esoterismo"}
                rating={op.operator_profiles?.average_rating || 0}
                reviews={0} // This would need another query
                isOnline={op.operator_profiles?.is_online || false}
                imageUrl={op.avatar_url || "/placeholder.svg"}
                pricePerMinute={1.5} // This would need to be fetched
              />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            <p>Nessun consulente disponibile al momento.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
