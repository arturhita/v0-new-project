"use client"

import { useState, useEffect, useTransition } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CreatePromotionModal } from "@/components/create-promotion-modal"
import type { Promotion } from "@/lib/actions/promotions.actions"
import { Plus, Edit, Trash2, Target, Zap, Loader2 } from "lucide-react"
import { toast } from "sonner"
import * as promotionActions from "@/lib/actions/promotions.actions"
import { DashboardLayout } from "@/components/dashboard-layout"

const dayLabels: { [key: string]: string } = {
  monday: "Lun",
  tuesday: "Mar",
  wednesday: "Mer",
  thursday: "Gio",
  friday: "Ven",
  saturday: "Sab",
  sunday: "Dom",
}

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null)
  const [isPending, startTransition] = useTransition()

  const loadPromotions = async () => {
    setIsLoading(true)
    const data = await promotionActions.getPromotions()
    setPromotions(data)
    setIsLoading(false)
  }

  useEffect(() => {
    loadPromotions()
  }, [])

  const handleOpenCreateModal = () => {
    setEditingPromotion(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (promotion: Promotion) => {
    setEditingPromotion(promotion)
    setIsModalOpen(true)
  }

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const result = await promotionActions.deletePromotion(id)
      if (result.success) {
        toast.success("Promozione eliminata con successo")
        loadPromotions()
      } else {
        toast.error(`Errore: ${result.message}`)
      }
    })
  }

  const handleToggleActive = (promotion: Promotion) => {
    startTransition(async () => {
      const result = await promotionActions.updatePromotion(promotion.id, { is_active: !promotion.is_active })
      if (result.success) {
        toast.success(`Promozione ${result.data?.is_active ? "attivata" : "disattivata"}`)
        loadPromotions()
      } else {
        toast.error(`Errore: ${result.message}`)
      }
    })
  }

  const activePromotions = promotions.filter((p) => p.is_active)

  return (
    <DashboardLayout userType="admin" title="Gestione Promozioni">
      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground">Crea e gestisci prezzi speciali per tutti gli operatori.</p>
        <Button onClick={handleOpenCreateModal}>
          <Plus className="h-4 w-4 mr-2" />
          Nuova Promozione
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promozioni Attive</CardTitle>
            <Zap className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{activePromotions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totale Promozioni</CardTitle>
            <Target className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{promotions.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Elenco Promozioni</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mx-auto" />
              <p className="mt-2">Caricamento promozioni...</p>
            </div>
          ) : promotions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Nessuna promozione trovata.</p>
              <Button onClick={handleOpenCreateModal} className="mt-4">
                Crea la prima promozione
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {promotions.map((promo) => (
                <Card key={promo.id} className={promo.is_active ? "bg-green-50 border-green-200" : ""}>
                  <CardContent className="p-4 flex justify-between items-center">
                    <div className="flex-1">
                      <h3 className="font-semibold">{promo.title}</h3>
                      <p className="text-sm text-muted-foreground">{promo.description}</p>
                      <div className="flex items-center flex-wrap gap-4 mt-2 text-sm">
                        <span className="font-bold text-green-600">€{promo.special_price}</span>
                        <span className="line-through text-muted-foreground">€{promo.original_price}</span>
                        <div className="flex gap-1">
                          {promo.valid_days.map((day) => (
                            <Badge key={day} variant="outline" className="text-xs">
                              {dayLabels[day] || day}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={promo.is_active ? "default" : "secondary"}>
                        {promo.is_active ? "Attiva" : "Inattiva"}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleActive(promo)}
                        disabled={isPending}
                      >
                        {promo.is_active ? "Disattiva" : "Attiva"}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleOpenEditModal(promo)}
                        disabled={isPending}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDelete(promo.id)}
                        disabled={isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <CreatePromotionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        promotion={editingPromotion}
        onSuccess={() => {
          setIsModalOpen(false)
          loadPromotions()
        }}
      />
    </DashboardLayout>
  )
}
