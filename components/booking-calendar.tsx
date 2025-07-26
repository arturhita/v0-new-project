"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, User, Euro } from "lucide-react"
import { cn } from "@/lib/utils"

interface TimeSlot {
  time: string
  available: boolean
  price: number
  duration: number // minuti
}

interface DaySchedule {
  date: string
  slots: TimeSlot[]
}

interface BookingCalendarProps {
  operatorId: string
  operatorName: string
  onBookingSelect: (booking: {
    date: string
    time: string
    duration: number
    price: number
  }) => void
}

export function BookingCalendar({ operatorId, operatorName, onBookingSelect }: BookingCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [schedule, setSchedule] = useState<DaySchedule[]>([])
  const [currentWeek, setCurrentWeek] = useState(0)

  // Genera schedule mock per la settimana
  useEffect(() => {
    const generateSchedule = () => {
      const today = new Date()
      const scheduleData: DaySchedule[] = []

      for (let i = 0; i < 7; i++) {
        const date = new Date(today)
        date.setDate(today.getDate() + i + currentWeek * 7)

        const dateStr = date.toISOString().split("T")[0]
        const dayOfWeek = date.getDay()

        // Skip domenica (0) per questo esempio
        if (dayOfWeek === 0) {
          scheduleData.push({ date: dateStr, slots: [] })
          continue
        }

        const slots: TimeSlot[] = []
        const startHour = 9
        const endHour = 18

        for (let hour = startHour; hour < endHour; hour++) {
          for (const minute of [0, 30]) {
            const time = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
            const available = Math.random() > 0.3 // 70% disponibilità

            slots.push({
              time,
              available,
              price: 25.0, // Prezzo base
              duration: 30,
            })
          }
        }

        scheduleData.push({ date: dateStr, slots })
      }

      setSchedule(scheduleData)
    }

    generateSchedule()
  }, [currentWeek, operatorId])

  const handleSlotSelect = (date: string, slot: TimeSlot) => {
    if (!slot.available) return

    setSelectedDate(date)
    setSelectedSlot(slot)
  }

  const confirmBooking = () => {
    if (selectedDate && selectedSlot) {
      onBookingSelect({
        date: selectedDate,
        time: selectedSlot.time,
        duration: selectedSlot.duration,
        price: selectedSlot.price,
      })
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("it-IT", {
      weekday: "short",
      day: "numeric",
      month: "short",
    })
  }

  const nextWeek = () => setCurrentWeek((prev) => prev + 1)
  const prevWeek = () => setCurrentWeek((prev) => Math.max(0, prev - 1))

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Prenota con {operatorName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <Button onClick={prevWeek} disabled={currentWeek === 0} variant="outline" size="sm">
              ← Settimana Precedente
            </Button>
            <span className="font-medium">{currentWeek === 0 ? "Questa Settimana" : `Settimana +${currentWeek}`}</span>
            <Button onClick={nextWeek} variant="outline" size="sm">
              Settimana Successiva →
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {schedule.map((day) => (
              <div key={day.date} className="space-y-2">
                <h3 className="font-medium text-center p-2 bg-sky-50 rounded">{formatDate(day.date)}</h3>

                {day.slots.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">Non disponibile</p>
                ) : (
                  <div className="space-y-1 max-h-64 overflow-y-auto">
                    {day.slots.map((slot) => (
                      <Button
                        key={`${day.date}-${slot.time}`}
                        onClick={() => handleSlotSelect(day.date, slot)}
                        disabled={!slot.available}
                        variant={selectedDate === day.date && selectedSlot?.time === slot.time ? "default" : "outline"}
                        size="sm"
                        className={cn(
                          "w-full text-xs",
                          !slot.available && "opacity-50 cursor-not-allowed",
                          selectedDate === day.date && selectedSlot?.time === slot.time && "bg-sky-500 text-white",
                        )}
                      >
                        {slot.time}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedDate && selectedSlot && (
        <Card className="border-sky-200 bg-sky-50">
          <CardHeader>
            <CardTitle className="text-lg">Conferma Prenotazione</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-sky-600" />
                <span>{formatDate(selectedDate)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-sky-600" />
                <span>
                  {selectedSlot.time} ({selectedSlot.duration} min)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-sky-600" />
                <span>{operatorName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Euro className="h-4 w-4 text-sky-600" />
                <span>€{selectedSlot.price.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={confirmBooking} className="flex-1 bg-sky-500 hover:bg-sky-600">
                Conferma Prenotazione
              </Button>
              <Button
                onClick={() => {
                  setSelectedDate("")
                  setSelectedSlot(null)
                }}
                variant="outline"
              >
                Annulla
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
