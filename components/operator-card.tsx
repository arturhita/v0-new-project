"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Phone, MessageSquare, Mail, Star } from "lucide-react"
import { WrittenConsultationModal } from "./written-consultation-modal"
import type { User } from "@supabase/supabase-js"

type Operator = {
  id: string
  stage_name: string
  profile_picture_url: string
  specialties: string[]
  average_rating: number
  total_reviews: number
  services: {
    chatEnabled: boolean
    chatPrice: number
    callEnabled: boolean
    callPrice: number
    emailEnabled: boolean
    emailPrice: number
  }
}

interface OperatorCardProps {
  operator: Operator
  user: User | null
}

export function OperatorCard({ operator, user }: OperatorCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleOpenModal = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!user) {
      // You might want to redirect to login or show a toast message
      alert("Devi essere loggato per inviare una domanda.")
      return
    }
    setIsModalOpen(true)
  }

  return (
    <>
      <Link href={`/operator/${encodeURIComponent(operator.stage_name)}`} className="block group">
        <Card className="bg-slate-900/50 border-blue-900/50 hover:border-cyan-400/50 transition-all duration-300 flex flex-col h-full">
          <CardHeader className="p-4">
            <div className="flex items-start gap-4">
              <div className="relative w-20 h-20">
                <Image
                  src={operator.profile_picture_url || "/images/placeholder.svg?width=80&height=80&query=avatar"}
                  alt={`Foto profilo di ${operator.stage_name}`}
                  width={80}
                  height={80}
                  className="rounded-full object-cover border-2 border-cyan-400"
                />
                {/* You can add a status indicator here */}
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                  {operator.stage_name}
                </CardTitle>
                <div className="flex items-center gap-2 mt-1 text-sm text-yellow-400">
                  <Star className="w-4 h-4 fill-current" />
                  <span>
                    {operator.average_rating ? operator.average_rating.toFixed(1) : "N/A"} ({operator.total_reviews}{" "}
                    recensioni)
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0 flex-grow">
            <div className="flex flex-wrap gap-2">
              {operator.specialties?.slice(0, 3).map((specialty) => (
                <Badge key={specialty} variant="secondary" className="bg-blue-900 text-cyan-300 border-none">
                  {specialty}
                </Badge>
              ))}
            </div>
          </CardContent>
          <CardFooter className="p-4 pt-0 flex justify-around gap-2">
            {operator.services?.chatEnabled && (
              <Button
                size="sm"
                variant="outline"
                className="flex-1 gap-2 bg-transparent border-cyan-600 text-cyan-400 hover:bg-cyan-900/50 hover:text-cyan-300"
              >
                <MessageSquare className="w-4 h-4" /> Chat
              </Button>
            )}
            {operator.services?.callEnabled && (
              <Button
                size="sm"
                variant="outline"
                className="flex-1 gap-2 bg-transparent border-cyan-600 text-cyan-400 hover:bg-cyan-900/50 hover:text-cyan-300"
              >
                <Phone className="w-4 h-4" /> Chiama
              </Button>
            )}
            {operator.services?.emailEnabled && (
              <Button
                size="sm"
                variant="outline"
                className="flex-1 gap-2 bg-transparent border-cyan-600 text-cyan-400 hover:bg-cyan-900/50 hover:text-cyan-300"
                onClick={handleOpenModal}
              >
                <Mail className="w-4 h-4" /> Scritto
              </Button>
            )}
          </CardFooter>
        </Card>
      </Link>
      {operator.services?.emailEnabled && (
        <WrittenConsultationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          operator={{
            id: operator.id,
            name: operator.stage_name,
            emailPrice: operator.services.emailPrice,
          }}
          user={user}
        />
      )}
    </>
  )
}
