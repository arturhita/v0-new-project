"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CreatePromotionModal } from "@/components/create-promotion-modal"
import { getPromotions, deletePromotion, updatePromotion, getActivePromotions, type Promotion } from "@/lib/promotions"
import { Plus, Edit, Trash2, Calendar, Clock, Euro, Target, Zap, Users, Settings } from "lucide-react"
import { toast } from "sonner"

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null)

  useEffect(() => {
    loadPromotions()

    const handlePromotionsUpdate = () => {
      loadPromotions()
    }

    window.addEventListener("promotionsUpdated", handlePromotionsUpdate)
    return () => window.removeEventListener("promotionsUpdated", handlePromotionsUpdate)
  }, [])

  const loadPromotions = () => {
    setPromotions(getPromotions())
  }

  const handleDeletePromotion = (id: string) => {
    if (deletePromotion(id)) {
      toast.success("Promozione eliminata con successo")
      loadPromotions()
    } else {
      toast.error("Errore nell'eliminazione della promozione")
    }
  }

  const handleToggleActive = (id: string, isActive: boolean) => {
    if (updatePromotion(id, { isActive })) {
      toast.success(`Promozione ${isActive ? "attivata" : "disattivata"}`)

      // Aggiorna automaticamente tutti i prezzi degli operatori
      if (isActive) {
        updateAllOperatorPrices(id)
        toast.info("Prezzi di tutti gli operatori aggiornati automaticamente!")
      } else {
        restoreOriginalPrices()
        toast.info("Prezzi originali ripristinati per tutti gli operatori")
      }

      loadPromotions()
    }
  }

  const updateAllOperatorPrices = (promotionId: string) => {
    const promotion = promotions.find((p) => p.id === promotionId)
    if (!promotion) return

    // Simula aggiornamento prezzi di tutti gli operatori
    const operators = JSON.parse(localStorage.getItem("mock_operators") || "[]")
    const updatedOperators = operators.map((op: any) => ({
      ...op,
      originalPrices: op.originalPrices || {
        chatPrice: op.services?.chatPrice || "2.50",
        callPrice: op.services?.callPrice || "3.00",
        emailPrice: op.services?.emailPrice || "15.00",
      },
      services: {
        ...op.services,
        chatPrice: promotion.specialPrice.toString(),
        callPrice: promotion.specialPrice.toString(),
        emailPrice: (promotion.specialPrice * 6).toString(), // Email costa di più
      },
      promotionActive: true,
      promotionId: promotionId,
    }))

    localStorage.setItem("mock_operators", JSON.stringify(updatedOperators))
    window.dispatchEvent(new CustomEvent("operatorsUpdated"))
  }

  const restoreOriginalPrices = () => {
    const operators = JSON.parse(localStorage.getItem("mock_operators") || "[]")
    const restoredOperators = operators.map((op: any) => ({
      ...op,
      services: {
        ...op.services,
        chatPrice: op.originalPrices?.chatPrice || "2.50",
        callPrice: op.originalPrices?.callPrice || "3.00",
        emailPrice: op.originalPrices?.emailPrice || "15.00",
      },
      promotionActive: false,
      promotionId: null,
    }))

    localStorage.setItem("mock_operators", JSON.stringify(restoredOperators))
    window.dispatchEvent(new CustomEvent("operatorsUpdated"))
  }

  const activePromotions = getActivePromotions()
  const totalSavings = promotions.reduce((sum, p) => sum + (p.originalPrice - p.specialPrice), 0)

  const dayLabels = {
    monday: "Lun",
    tuesday: "Mar",
    wednesday: "Mer",
    thursday: "Gio",
    friday: "Ven",
    saturday: "Sab",
    sunday: "Dom",
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-3xl font-bold text-gray-900">Gestione Promozioni</h1>
        <p className="text-gray-600 mt-1">
          Gestisci prezzi speciali che si applicano automaticamente a tutti gli operatori
        </p>
      </div>

      <div className="px-6">
        {/* Statistiche */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Promozioni Attive</CardTitle>
              <Zap className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{activePromotions.length}</div>
              <p className="text-xs text-muted-foreground">In corso ora</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Operatori Coinvolti</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">73</div>
              <p className="text-xs text-muted-foreground">Prezzi aggiornati automaticamente</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Risparmio Totale</CardTitle>
              <Euro className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">€{totalSavings.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Per consulenza</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sistema Automatico</CardTitle>
              <Settings className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {activePromotions.length > 0 ? "ATTIVO" : "INATTIVO"}
              </div>
              <p className="text-xs text-muted-foreground">Aggiornamento prezzi</p>
            </CardContent>
          </Card>
        </div>

        {/* Alert sistema automatico */}
        {activePromotions.length > 0 && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-600" />
              <h3 className="font-semibold text-yellow-800">Sistema Automatico Attivo</h3>
            </div>
            <p className="text-sm text-yellow-700 mt-1">
              I prezzi di tutti gli operatori sono stati automaticamente aggiornati al prezzo promozionale. Quando la
              promozione scadrà, i prezzi torneranno automaticamente ai valori originali.
            </p>
          </div>
        )}

        {/* Header con pulsante crea */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">Tutte le Promozioni</h2>
            <p className="text-muted-foreground">
              Gestisci prezzi speciali che si applicano automaticamente a tutti gli operatori
            </p>
          </div>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuova Promozione
          </Button>
        </div>

        {/* Lista promozioni */}
        <div className="grid gap-4">
          {promotions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Target className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nessuna promozione creata</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Inizia creando la tua prima promozione con prezzi speciali automatici
                </p>
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crea Prima Promozione
                </Button>
              </CardContent>
            </Card>
          ) : (
            promotions.map((promotion) => (
              <Card
                key={promotion.id}
                className={`${promotion.isActive ? "border-green-200 bg-green-50/50" : "border-gray-200"}`}
              >
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{promotion.title}</h3>
                        <Badge variant={promotion.isActive ? "default" : "secondary"}>
                          {promotion.isActive ? "Attiva" : "Inattiva"}
                        </Badge>
                        {activePromotions.some((p) => p.id === promotion.id) && (
                          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                            <Zap className="h-3 w-3 mr-1" />
                            In corso
                          </Badge>
                        )}
                        {promotion.isActive && (
                          <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                            <Settings className="h-3 w-3 mr-1" />
                            Auto-applicata
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground mb-3">{promotion.description}</p>

                      {/* Prezzo e sconto */}
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-green-600">€{promotion.specialPrice}</span>
                          <span className="text-lg text-muted-foreground line-through">€{promotion.originalPrice}</span>
                          <Badge variant="outline" className="text-green-600 border-green-300">
                            -{promotion.discountPercentage}%
                          </Badge>
                        </div>
                      </div>

                      {/* Giorni validi */}
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Giorni:</span>
                        <div className="flex gap-1">
                          {promotion.validDays.map((day) => (
                            <Badge key={day} variant="outline" className="text-xs">
                              {dayLabels[day as keyof typeof dayLabels]}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Date e orari */}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(promotion.startDate).toLocaleDateString()} -{" "}
                          {new Date(promotion.endDate).toLocaleDateString()}
                        </div>
                        {promotion.startTime && promotion.endTime && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {promotion.startTime} - {promotion.endTime}
                          </div>
                        )}
                      </div>

                      {/* Info sistema automatico */}
                      {promotion.isActive && (
                        <div className="mt-3 p-2 bg-blue-50 rounded border border-blue-200">
                          <p className="text-xs text-blue-700">
                            <Settings className="h-3 w-3 inline mr-1" />
                            Questa promozione è applicata automaticamente a tutti i 73 operatori della piattaforma
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Azioni */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleActive(promotion.id, !promotion.isActive)}
                        className={
                          promotion.isActive ? "text-red-600 hover:text-red-700" : "text-green-600 hover:text-green-700"
                        }
                      >
                        {promotion.isActive ? "Disattiva" : "Attiva"}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setEditingPromotion(promotion)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeletePromotion(promotion.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Modal creazione/modifica */}
        <CreatePromotionModal
          isOpen={isCreateModalOpen || !!editingPromotion}
          onClose={() => {
            setIsCreateModalOpen(false)
            setEditingPromotion(null)
          }}
          promotion={editingPromotion}
          onSuccess={() => {
            setIsCreateModalOpen(false)
            setEditingPromotion(null)
            loadPromotions()
          }}
        />
      </div>
    </div>
  )
}
