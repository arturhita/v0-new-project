"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar, Clock, Plus, Trash2, Save, AlertCircle, CheckCircle, Moon, Sun } from "lucide-react"

interface TimeSlot {
  id: string
  start: string
  end: string
}

interface DayAvailability {
  enabled: boolean
  slots: TimeSlot[]
}

export default function AvailabilityPage() {
  const [availability, setAvailability] = useState<Record<string, DayAvailability>>({
    monday: {
      enabled: true,
      slots: [
        { id: "1", start: "09:00", end: "13:00" },
        { id: "2", start: "14:00", end: "18:00" },
      ],
    },
    tuesday: {
      enabled: true,
      slots: [
        { id: "3", start: "09:00", end: "13:00" },
        { id: "4", start: "14:00", end: "18:00" },
      ],
    },
    wednesday: {
      enabled: true,
      slots: [
        { id: "5", start: "09:00", end: "13:00" },
        { id: "6", start: "14:00", end: "18:00" },
      ],
    },
    thursday: {
      enabled: true,
      slots: [
        { id: "7", start: "09:00", end: "13:00" },
        { id: "8", start: "14:00", end: "18:00" },
      ],
    },
    friday: {
      enabled: true,
      slots: [
        { id: "9", start: "09:00", end: "13:00" },
        { id: "10", start: "14:00", end: "18:00" },
      ],
    },
    saturday: {
      enabled: true,
      slots: [{ id: "11", start: "10:00", end: "16:00" }],
    },
    sunday: {
      enabled: false,
      slots: [],
    },
  })

  const dayNames = {
    monday: "Lunedì",
    tuesday: "Martedì",
    wednesday: "Mercoledì",
    thursday: "Giovedì",
    friday: "Venerdì",
    saturday: "Sabato",
    sunday: "Domenica",
  }

  const toggleDay = (day: string) => {
    setAvailability({
      ...availability,
      [day]: {
        ...availability[day],
        enabled: !availability[day].enabled,
      },
    })
  }

  const addTimeSlot = (day: string) => {
    const newSlot: TimeSlot = {
      id: Date.now().toString(),
      start: "09:00",
      end: "17:00",
    }

    setAvailability({
      ...availability,
      [day]: {
        ...availability[day],
        slots: [...availability[day].slots, newSlot],
      },
    })
  }

  const removeTimeSlot = (day: string, slotId: string) => {
    setAvailability({
      ...availability,
      [day]: {
        ...availability[day],
        slots: availability[day].slots.filter((slot) => slot.id !== slotId),
      },
    })
  }

  const updateTimeSlot = (day: string, slotId: string, field: "start" | "end", value: string) => {
    setAvailability({
      ...availability,
      [day]: {
        ...availability[day],
        slots: availability[day].slots.map((slot) => (slot.id === slotId ? { ...slot, [field]: value } : slot)),
      },
    })
  }

  const getTotalHours = () => {
    let total = 0
    Object.values(availability).forEach((day) => {
      if (day.enabled) {
        day.slots.forEach((slot) => {
          const start = new Date(`2000-01-01T${slot.start}:00`)
          const end = new Date(`2000-01-01T${slot.end}:00`)
          total += (end.getTime() - start.getTime()) / (1000 * 60 * 60)
        })
      }
    })
    return total
  }

  const getActiveDays = () => {
    return Object.values(availability).filter((day) => day.enabled).length
  }

  return (
    <div className="space-y-6 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
            Gestione Disponibilità
          </h2>
          <p className="text-muted-foreground">Configura i tuoi orari di lavoro settimanali</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{getActiveDays()}</div>
            <div className="text-sm text-muted-foreground">Giorni Attivi</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{getTotalHours()}h</div>
            <div className="text-sm text-muted-foreground">Ore Settimanali</div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-0 bg-gradient-to-r from-green-500 to-emerald-500 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Ore Questa Settimana</p>
                <p className="text-2xl font-bold">{getTotalHours()}h</p>
              </div>
              <Clock className="h-6 w-6 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Giorni Lavorativi</p>
                <p className="text-2xl font-bold">{getActiveDays()}/7</p>
              </div>
              <Calendar className="h-6 w-6 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-r from-purple-500 to-violet-500 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Slot Orari Totali</p>
                <p className="text-2xl font-bold">
                  {Object.values(availability).reduce((total, day) => total + day.slots.length, 0)}
                </p>
              </div>
              <CheckCircle className="h-6 w-6 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Availability Settings */}
      <div className="space-y-4">
        {Object.entries(availability).map(([day, schedule]) => (
          <Card key={day} className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-pink-500/20 to-blue-500/20 rounded-full flex items-center justify-center">
                    {schedule.enabled ? (
                      <Sun className="h-6 w-6 text-orange-500" />
                    ) : (
                      <Moon className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{dayNames[day as keyof typeof dayNames]}</CardTitle>
                    <CardDescription>
                      {schedule.enabled
                        ? `${schedule.slots.length} slot${schedule.slots.length !== 1 ? " orari" : " orario"}`
                        : "Giorno non lavorativo"}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Badge
                    variant={schedule.enabled ? "default" : "secondary"}
                    className={schedule.enabled ? "bg-green-500" : ""}
                  >
                    {schedule.enabled ? "Attivo" : "Inattivo"}
                  </Badge>
                  <Switch
                    checked={schedule.enabled}
                    onCheckedChange={() => toggleDay(day)}
                    className="data-[state=checked]:bg-green-500"
                  />
                </div>
              </div>
            </CardHeader>

            {schedule.enabled && (
              <CardContent className="space-y-4">
                {schedule.slots.map((slot, index) => (
                  <div
                    key={slot.id}
                    className="flex items-center space-x-4 p-4 bg-gradient-to-r from-pink-50 to-blue-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-2 flex-1">
                      <Label className="text-sm font-medium w-16">Slot {index + 1}:</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="time"
                          value={slot.start}
                          onChange={(e) => updateTimeSlot(day, slot.id, "start", e.target.value)}
                          className="w-24"
                        />
                        <span className="text-muted-foreground">-</span>
                        <Input
                          type="time"
                          value={slot.end}
                          onChange={(e) => updateTimeSlot(day, slot.id, "end", e.target.value)}
                          className="w-24"
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {(() => {
                          const start = new Date(`2000-01-01T${slot.start}:00`)
                          const end = new Date(`2000-01-01T${slot.end}:00`)
                          const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
                          return `${hours}h`
                        })()}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTimeSlot(day, slot.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        disabled={schedule.slots.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                <Button
                  variant="outline"
                  onClick={() => addTimeSlot(day)}
                  className="w-full border-dashed border-pink-300 text-pink-600 hover:bg-pink-50"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Aggiungi Slot Orario
                </Button>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Save Button */}
      <div className="flex justify-center">
        <Button
          size="lg"
          className="bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600 px-8"
        >
          <Save className="mr-2 h-5 w-5" />
          Salva Disponibilità
        </Button>
      </div>

      {/* Info Alert */}
      <Alert className="border-blue-200 bg-blue-50">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Suggerimento:</strong> Puoi creare più slot orari per lo stesso giorno per gestire pause pranzo o
          orari spezzati. I clienti vedranno tutti i tuoi slot disponibili per prenotare consulenze.
        </AlertDescription>
      </Alert>
    </div>
  )
}
