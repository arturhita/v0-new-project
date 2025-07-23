"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Phone, MessageSquare, Edit } from "lucide-react"

const OperatorProfileClientSection = ({ operator }: { operator: any }) => {
  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">Contatta {operator.name}</h3>
        <div className="space-y-4">
          <Button className="w-full">
            <Phone className="mr-2 h-4 w-4" /> Chiama Ora ({operator.pricePerMinute}€/min)
          </Button>
          <Button variant="outline" className="w-full bg-transparent">
            <MessageSquare className="mr-2 h-4 w-4" /> Inizia una Chat
          </Button>
          <Button variant="secondary" className="w-full">
            <Edit className="mr-2 h-4 w-4" /> Richiedi Consulto Scritto
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default OperatorProfileClientSection
