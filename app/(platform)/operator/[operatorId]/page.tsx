"use client"

import { useState, useEffect } from "react"
import { notFound } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, MessageSquare, Phone, Mail } from "lucide-react"
import { getOperatorById } from "@/lib/actions/operator.actions"
import type { UserProfile } from "@/types/user.types"
import { OperatorRealtimeStatus } from "@/components/operator-realtime-status"
import { WrittenConsultationModal } from "@/components/written-consultation-modal"

// This is a client component because we need state for the modal
export default function OperatorProfilePage({ params }: { params: { operatorId: string } }) {
  const [operator, setOperator] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const fetchOperator = async () => {
      setLoading(true)
      const op = await getOperatorById(params.operatorId)
      if (!op) {
        notFound()
      }
      setOperator(op)
      setLoading(false)
    }
    fetchOperator()
  }, [params.operatorId])

  if (loading) {
    return <div>Caricamento del profilo...</div>
  }

  if (!operator) {
    return notFound()
  }

  const writtenService = operator.services?.written

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <Card className="overflow-hidden bg-white shadow-lg">
        <div className="relative h-48 bg-gradient-to-br from-indigo-200 to-purple-200">
          <Image src="/images/crescent-moon-concept.avif" alt="Banner" layout="fill" objectFit="cover" />
          <div className="absolute inset-0 bg-black/20" />
        </div>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start -mt-20">
            <div className="relative h-32 w-32 rounded-full border-4 border-white shadow-md">
              <Image
                src={operator.avatar_url || "/placeholder.svg?width=128&height=128"}
                alt={operator.name || "Avatar"}
                layout="fill"
                className="rounded-full object-cover"
              />
              <OperatorRealtimeStatus operatorId={operator.id} />
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-6 text-center sm:text-left">
              <h1 className="text-3xl font-bold text-gray-800">{operator.name}</h1>
              <p className="text-md text-gray-500">{operator.nickname}</p>
              <div className="mt-2 flex items-center justify-center sm:justify-start gap-2">
                <Star className="h-5 w-5 text-yellow-400" />
                <span className="font-semibold text-gray-700">4.9 (123 recensioni)</span>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Su di me</h2>
            <p className="text-gray-600 whitespace-pre-wrap">{operator.bio}</p>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Specializzazioni</h2>
            <div className="flex flex-wrap gap-2">
              {operator.specialties?.map((spec) => (
                <Badge key={spec} variant="secondary" className="text-sm">
                  {spec}
                </Badge>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Servizi di Consulto</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Chat */}
              <Button variant="outline" size="lg" className="flex flex-col h-auto py-4 bg-transparent" disabled>
                <MessageSquare className="h-8 w-8 mb-2 text-blue-500" />
                <span className="font-semibold">Chat</span>
                <span className="text-sm text-gray-500">2.50 €/min</span>
              </Button>
              {/* Call */}
              <Button variant="outline" size="lg" className="flex flex-col h-auto py-4 bg-transparent" disabled>
                <Phone className="h-8 w-8 mb-2 text-green-500" />
                <span className="font-semibold">Chiamata</span>
                <span className="text-sm text-gray-500">3.00 €/min</span>
              </Button>
              {/* Written */}
              {writtenService?.enabled && (
                <Button
                  variant="outline"
                  size="lg"
                  className="flex flex-col h-auto py-4 bg-transparent"
                  onClick={() => setIsModalOpen(true)}
                >
                  <Mail className="h-8 w-8 mb-2 text-purple-500" />
                  <span className="font-semibold">Consulto Scritto</span>
                  <span className="text-sm text-gray-500">{writtenService.price.toFixed(2)} €</span>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      {writtenService?.enabled && (
        <WrittenConsultationModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          operatorId={operator.id}
          operatorName={operator.name || "Operatore"}
          price={writtenService.price}
        />
      )}
    </div>
  )
}
