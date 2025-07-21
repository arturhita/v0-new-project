"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarDays, Save, PlusCircle, Trash2, ClockIcon, Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import {
  saveOperatorAvailability,
  getOperatorAvailability,
  type WeeklyAvailability,
} from "@/lib/actions/availability.actions"

const daysOfWeek = ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato", "Domenica"]
const timeSlots = Array.from({ length: 24 * 2 }, (_, i) => {
  const hour = Math.floor(i / 2)
  const minute = (i % 2) * 30
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`
})

export default function AvailabilityPage() {
  const [availability, setAvailability] = useState<WeeklyAvailability>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Initialize default availability
  const initializeDefaultAvailability = (): WeeklyAvailability => {
    return daysOfWeek.reduce((acc, day) => {
      acc[day] = {
        active: false,
        slots: [{ id: `slot-${day}-0`, start: "09:00", end: "17:00" }],
      }
      return acc
    }, {} as WeeklyAvailability)
  }

  // Load availability on component mount
  useEffect(() => {
    const loadAvailability = async () => {
      try {
        const result = await getOperatorAvailability()

        if (result.success) {
          setAvailability(result.data)
        } else {
          console.error("Error loading availability:", result.message)
          setAvailability(initializeDefaultAvailability())
          toast({
            title: "Attenzione",
            description: result.message || "Impossibile caricare la disponibilità. Usando valori predefiniti.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error in loadAvailability:", error)
        setAvailability(initializeDefaultAvailability())
        toast({
          title: "Errore",
          description: "Errore imprevisto durante il caricamento.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadAvailability()
  }, [])

  const handleDayToggle = (day: string) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: { ...prev[day], active: !prev[day].active },
    }))
  }

  const handleTimeChange = (day: string, slotId: string, type: "start" | "end", value: string) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: prev[day].slots.map((slot) => (slot.id === slotId ? { ...slot, [type]: value } : slot)),
      },
    }))
  }

  const addSlot = (day: string) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: [...prev[day].slots, { id: `slot-${day}-${prev[day].slots.length}`, start: "09:00", end: "10:00" }],
      },
    }))
  }

  const removeSlot = (day: string, slotId: string) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: prev[day].slots.filter((slot) => slot.id !== slotId),
      },
    }))
  }

  const handleSaveAvailability = async () => {
    setSaving(true)

    try {
      const result = await saveOperatorAvailability(availability)

      if (result.success) {
        toast({
          title: "Successo!",
          description: result.message,
          className: "bg-green-100 border-green-300 text-green-700",
        })
      } else {
        toast({
          title: "Errore",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error saving availability:", error)
      toast({
        title: "Errore",
        description: "Errore imprevisto durante il salvataggio.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Caricamento disponibilità...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-slate-800">Orari Arcani</h1>
        <Button
          onClick={handleSaveAvailability}
          disabled={saving}
          className="bg-gradient-to-r from-[hsl(var(--primary-medium))] to-[hsl(var(--primary-dark))] text-white shadow-md hover:opacity-90"
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Salva Modifiche
            </>
          )}
        </Button>
      </div>
      <CardDescription className="text-slate-500 -mt-4">
        Definisci i tuoi momenti di connessione con i cercatori, aggiungendo più fasce orarie se necessario.
      </CardDescription>

      <Card className="shadow-xl rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl text-slate-700">Disponibilità Settimanale Ricorrente</CardTitle>
          <CardDescription className="text-slate-500">
            Imposta gli orari in cui sei generalmente disponibile per i consulti.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {daysOfWeek.map((day) => (
            <div key={day} className="p-4 border rounded-lg bg-slate-50/50">
              <div className="flex items-center justify-between mb-3">
                <Label htmlFor={`active-${day}`} className="flex items-center gap-2 text-lg font-medium text-slate-700">
                  <Checkbox
                    id={`active-${day}`}
                    checked={availability[day]?.active || false}
                    onCheckedChange={() => handleDayToggle(day)}
                    className="border-[hsl(var(--primary-medium))] data-[state=checked]:bg-[hsl(var(--primary-medium))]"
                  />
                  {day}
                </Label>
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    availability[day]?.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {availability[day]?.active ? "Disponibile" : "Non Disponibile"}
                </span>
              </div>
              {availability[day]?.active && (
                <div className="space-y-3">
                  {availability[day]?.slots?.map((slot, index) => (
                    <div key={slot.id} className="p-3 border rounded-md bg-white space-y-2">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-medium text-slate-600 flex items-center">
                          <ClockIcon className="h-4 w-4 mr-1.5 text-slate-400" />
                          Fascia Oraria {index + 1}
                        </p>
                        {availability[day]?.slots && availability[day].slots.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeSlot(day, slot.id)}
                            className="h-7 w-7 text-red-500 hover:bg-red-100"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`start-${day}-${slot.id}`} className="text-sm text-slate-600">
                            Ora Inizio
                          </Label>
                          <Select
                            value={slot.start}
                            onValueChange={(value) => handleTimeChange(day, slot.id, "start", value)}
                          >
                            <SelectTrigger id={`start-${day}-${slot.id}`} className="mt-1 w-full">
                              <SelectValue placeholder="Seleziona ora" />
                            </SelectTrigger>
                            <SelectContent>
                              {timeSlots.map((time) => (
                                <SelectItem key={`start-${day}-${slot.id}-${time}`} value={time}>
                                  {time}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor={`end-${day}-${slot.id}`} className="text-sm text-slate-600">
                            Ora Fine
                          </Label>
                          <Select
                            value={slot.end}
                            onValueChange={(value) => handleTimeChange(day, slot.id, "end", value)}
                          >
                            <SelectTrigger id={`end-${day}-${slot.id}`} className="mt-1 w-full">
                              <SelectValue placeholder="Seleziona ora" />
                            </SelectTrigger>
                            <SelectContent>
                              {timeSlots.map((time) => (
                                <SelectItem key={`end-${day}-${slot.id}-${time}`} value={time}>
                                  {time}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={() => addSlot(day)} className="mt-2">
                    <PlusCircle className="h-4 w-4 mr-1.5" /> Aggiungi Fascia Oraria
                  </Button>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="shadow-xl rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl text-slate-700">Eccezioni e Giorni Speciali</CardTitle>
          <CardDescription className="text-slate-500">
            Aggiungi giorni specifici in cui la tua disponibilità differisce o sei assente. (Funzionalità in arrivo)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 bg-slate-100 rounded-lg">
            <p className="text-slate-400">Calendario per eccezioni (Prossimamente)</p>
          </div>
          <Button variant="outline" className="mt-4 bg-transparent" disabled>
            <CalendarDays className="mr-2 h-4 w-4" /> Aggiungi Eccezione
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
