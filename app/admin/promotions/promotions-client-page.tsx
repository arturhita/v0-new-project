"use client"

import { useState, useTransition } from "react"
import type { Promotion } from "@/types/promotion.types"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CreatePromotionModal } from "@/components/create-promotion-modal"
import { deletePromotion, togglePromotionStatus, getPromotions } from "@/lib/actions/promotions.actions"
import { toast } from "sonner"
import { Plus, Edit, Trash2, Calendar, Clock, Target, Zap, Loader2 } from "lucide-react"

// This helper is duplicated from the server page. This is acceptable.
// It allows the client to re-calculate active promotions without a server round-trip.
const getActivePromotions = (promotions: Promotion[]) => {
  const now = new Date()
  const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
  const currentDay = dayNames[now.getDay()]

  return promotions.filter((p) => {
    if (!p.isActive) return false
    const startDate = new Date(p.startDate)
    const endDate = new Date(p.endDate)
    endDate.setHours(23, 59, 59, 999)
    if (now < startDate || now > endDate) return false
    if (!p.validDays.includes(currentDay)) return false
    if (p.startTime && p.endTime) {
      const currentTime = now.toTimeString().split(" ")[0]
      if (currentTime < p.startTime || currentTime > p.endTime) return false
    }
    return true
  })
}

export default function PromotionsClientPage({ initialPromotions }: { initialPromotions: Promotion[] }) {
  const [promotions, setPromotions] = useState<Promotion[]>(initialPromotions)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null)
  const [isPending, startTransition] = useTransition()

  const activePromotions = getActivePromotions(promotions)

  const refreshPromotions = async () => {
    const updatedPromotions = await getPromotions()
    setPromotions(updatedPromotions)
  }

  const handleSuccess = () => {
    setIsModalOpen(false)
    setEditingPromotion(null)
    toast.success("Promozione salvata con successo!")
    startTransition(() => {
      refreshPromotions()
    })
  }

  const handleDelete = (id: string) => {
    if (confirm("Sei sicuro di voler eliminare questa promozione?")) {
      startTransition(async () => {
        const result = await deletePromotion(id)
        if (result.success) {
          setPromotions(promotions.filter((p) => p.id !== id))
          toast.success("Promozione eliminata.")
        } else {
          toast.error(result.error || "Errore nell'eliminazione.")
        }
      })
    }
  }

  const handleToggleActive = (id: string, currentStatus: boolean) => {
    startTransition(async () => {
      const result = await togglePromotionStatus(id, currentStatus)
      if (result.success && result.data) {
        setPromotions(promotions.map((p) => (p.id === id ? result.data! : p)))
        toast.success(`Stato promozione aggiornato.`)
      } else {
        toast.error(result.error || "Errore nell'aggiornamento.")
      }
    })
  }

  const dayLabels: { [key: string]: string } = {
    monday: "Lun",
    tuesday: "Mar",
    wednesday: "Mer",
    thursday: "Gio",
    friday: "Ven",
    saturday: "Sab",
    sunday: "Dom",
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Elenco Promozioni</h2>
        <Button
          onClick={() => {
            setEditingPromotion(null)
            setIsModalOpen(true)
          }}
          disabled={isPending}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuova Promozione
        </Button>
      </div>

      {isPending && (
        <div className="text-center p-4">
          <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
        </div>
      )}

      <div className="grid gap-4">
        {!isPending && promotions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Target className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nessuna promozione creata</h3>
              <p className="text-muted-foreground text-center mb-4">Inizia creando la tua prima promozione.</p>
              <Button
                onClick={() => {
                  setEditingPromotion(null)
                  setIsModalOpen(true)
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Crea la Prima
              </Button>
            </CardContent>
          </Card>
        ) : (
          promotions.map((promotion) => (
            <Card
              key={promotion.id}
              className={activePromotions.some((p) => p.id === promotion.id) ? "border-green-400 bg-green-50" : ""}
            >
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-lg font-semibold">{promotion.title}</h3>
                      <Badge variant={promotion.isActive ? "default" : "secondary"}>
                        {promotion.isActive ? "Abilitata" : "Disabilitata"}
                      </Badge>
                      {activePromotions.some((p) => p.id === promotion.id) && (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          <Zap className="h-3 w-3 mr-1" />
                          In corso
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground mb-3 text-sm">{promotion.description}</p>
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-2xl font-bold text-green-600">€{promotion.specialPrice.toFixed(2)}</span>
                      <span className="text-md text-muted-foreground line-through">
                        €{promotion.originalPrice.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div className="flex gap-1 flex-wrap">
                        {promotion.validDays.map((day) => (
                          <Badge key={day} variant="outline" className="text-xs">
                            {dayLabels[day]}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(promotion.startDate).toLocaleDateString()} -{" "}
                          {new Date(promotion.endDate).toLocaleDateString()}
                        </span>
                      </div>
                      {promotion.startTime && promotion.endTime && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>
                            {promotion.startTime} - {promotion.endTime}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-center pt-2 sm:pt-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingPromotion(promotion)
                        setIsModalOpen(true)
                      }}
                      disabled={isPending}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(promotion.id)}
                      disabled={isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleActive(promotion.id, promotion.isActive)}
                      disabled={isPending}
                    >
                      {promotion.isActive ? "Disabilita" : "Abilita"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <CreatePromotionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        promotion={editingPromotion}
        onSuccess={handleSuccess}
      />
    </>
  )
}
