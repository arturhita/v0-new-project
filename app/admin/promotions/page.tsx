"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CreatePromotionModal } from "@/components/create-promotion-modal"
import { getPromotions, deletePromotion, updatePromotion, getActivePromotions, type Promotion } from "@/lib/promotions"
import { Plus, Edit, Trash2, Calendar, Clock, Target, Zap } from "lucide-react"
import { toast } from "sonner"

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null)

  useEffect(() => {
    loadPromotions()
    const handlePromotionsUpdate = () => loadPromotions()
    window.addEventListener("promotionsUpdated", handlePromotionsUpdate)
    return () => window.removeEventListener("promotionsUpdated", handlePromotionsUpdate)
  }, [])

  const loadPromotions = () => setPromotions(getPromotions())

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
      loadPromotions()
    }
  }

  const activePromotions = getActivePromotions()

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
    <div className="space-y-6 text-slate-200">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300">
          Gestione Promozioni
        </h1>
        <p className="text-slate-400 mt-1">
          Crea e gestisci prezzi speciali che si applicano automaticamente a tutti gli operatori.
        </p>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-slate-200">Tutte le Promozioni</h2>
        <Button
          onClick={() => {
            setEditingPromotion(null)
            setIsCreateModalOpen(true)
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuova Promozione
        </Button>
      </div>

      <div className="grid gap-6">
        {promotions.length === 0 ? (
          <Card className="bg-slate-800/50 border-indigo-500/20 backdrop-blur-xl">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Target className="h-12 w-12 text-slate-500 mb-4" />
              <h3 className="text-lg font-semibold text-slate-200 mb-2">Nessuna promozione creata</h3>
              <p className="text-slate-400 mb-4">
                Inizia creando la tua prima promozione con prezzi speciali automatici.
              </p>
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Crea Prima Promozione
              </Button>
            </CardContent>
          </Card>
        ) : (
          promotions.map((promotion) => (
            <Card
              key={promotion.id}
              className={`bg-slate-800/50 border-indigo-500/20 backdrop-blur-xl ${
                promotion.isActive ? "border-green-500/40" : "border-slate-700/40"
              }`}
            >
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-slate-100">{promotion.title}</h3>
                      <Badge
                        variant={promotion.isActive ? "default" : "secondary"}
                        className={
                          promotion.isActive ? "bg-green-500/80 border-0" : "bg-slate-700 text-slate-300 border-0"
                        }
                      >
                        {promotion.isActive ? "Attiva" : "Inattiva"}
                      </Badge>
                      {activePromotions.some((p) => p.id === promotion.id) && (
                        <Badge className="bg-purple-500/80 border-0">
                          <Zap className="h-3 w-3 mr-1" />
                          In corso
                        </Badge>
                      )}
                    </div>
                    <p className="text-slate-400 mb-3">{promotion.description}</p>

                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-green-400">€{promotion.specialPrice}</span>
                        <span className="text-lg text-slate-400 line-through">€{promotion.originalPrice}</span>
                        <Badge variant="outline" className="text-green-400 border-green-400/50">
                          -{promotion.discountPercentage}%
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-slate-500" />
                      <span className="text-sm text-slate-400">Giorni:</span>
                      <div className="flex gap-1 flex-wrap">
                        {promotion.validDays.map((day) => (
                          <Badge key={day} variant="outline" className="text-xs text-slate-300 border-slate-600">
                            {dayLabels[day as keyof typeof dayLabels]}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-slate-400">
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
                  </div>

                  <div className="flex items-center gap-2 self-start md:self-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleActive(promotion.id, !promotion.isActive)}
                      className={
                        promotion.isActive
                          ? "text-yellow-400 border-yellow-400/50 hover:bg-yellow-400/10 hover:text-yellow-300 bg-transparent"
                          : "text-green-400 border-green-400/50 hover:bg-green-400/10 hover:text-green-300 bg-transparent"
                      }
                    >
                      {promotion.isActive ? "Disattiva" : "Attiva"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingPromotion(promotion)
                        setIsCreateModalOpen(true)
                      }}
                      className="text-slate-300 border-slate-600 hover:bg-slate-700 hover:text-white bg-transparent"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeletePromotion(promotion.id)}
                      className="text-red-400 border-red-400/50 hover:bg-red-400/10 hover:text-red-300 bg-transparent"
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

      <CreatePromotionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        promotion={editingPromotion}
        onSuccess={() => {
          setIsCreateModalOpen(false)
          setEditingPromotion(null)
          loadPromotions()
        }}
      />
    </div>
  )
}
