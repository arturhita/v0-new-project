"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface AvailabilitySlot {
  time: string // e.g., "09:00"
  status: "available" | "booked" | "unavailable"
}

interface DailyAvailability {
  date: string // YYYY-MM-DD
  slots: AvailabilitySlot[]
}

// Mock data - replace with actual API call
const mockAvailability: Record<string, DailyAvailability[]> = {
  "1": [
    // Operator ID 1 (Luna Stellare)
    {
      date: "2025-06-23",
      slots: [
        { time: "10:00", status: "available" },
        { time: "11:00", status: "booked" },
        { time: "14:00", status: "available" },
      ],
    },
    {
      date: "2025-06-24",
      slots: [
        { time: "09:00", status: "available" },
        { time: "15:00", status: "available" },
      ],
    },
    { date: "2025-06-25", slots: [] }, // Unavailable
  ],
  "3": [
    // Operator ID 3 (Sage Aurora)
    {
      date: "2025-06-22",
      slots: [
        { time: "14:00", status: "available" },
        { time: "16:00", status: "booked" },
      ],
    },
    {
      date: "2025-06-23",
      slots: [
        { time: "10:00", status: "available" },
        { time: "11:00", status: "available" },
        { time: "12:00", status: "booked" },
      ],
    },
    { date: "2025-06-24", slots: [{ time: "13:00", status: "available" }] },
  ],
  // Add more operators as needed
}

interface OperatorAvailabilityCalendarProps {
  operatorId: string
}

export function OperatorAvailabilityCalendar({ operatorId }: OperatorAvailabilityCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())
  const [availability, setAvailability] = useState<DailyAvailability[]>([])

  useEffect(() => {
    // Simulate fetching availability for the operator
    const operatorAvail = mockAvailability[operatorId] || []
    setAvailability(operatorAvail)
  }, [operatorId])

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate()
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay() // 0 (Sun) - 6 (Sat)

  const handlePrevMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
    setSelectedDate(null)
  }

  const handleNextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
    setSelectedDate(null)
  }

  const handleDateClick = (day: number) => {
    setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))
  }

  const getAvailabilityForDate = (date: Date | null): DailyAvailability | undefined => {
    if (!date) return undefined
    const dateString = date.toISOString().split("T")[0]
    return availability.find((avail) => avail.date === dateString)
  }

  const selectedDayAvailability = getAvailabilityForDate(selectedDate)

  const renderCalendarGrid = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const numDays = daysInMonth(year, month)
    const firstDay = firstDayOfMonth(year, month)
    const today = new Date()

    const cells = []
    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`empty-${i}`} className="p-1 sm:p-2 border border-white/10"></div>)
    }

    for (let day = 1; day <= numDays; day++) {
      const fullDate = new Date(year, month, day)
      const dateStr = fullDate.toISOString().split("T")[0]
      const dayAvail = availability.find((a) => a.date === dateStr)
      const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day
      const isSelected =
        selectedDate &&
        selectedDate.getFullYear() === year &&
        selectedDate.getMonth() === month &&
        selectedDate.getDate() === day

      cells.push(
        <div
          key={day}
          onClick={() => handleDateClick(day)}
          className={`p-1 sm:p-2 border border-white/10 text-center cursor-pointer transition-colors text-xs sm:text-sm
          ${isSelected ? "bg-indigo-500/50 text-white" : "hover:bg-white/10"}
          ${isToday ? "font-bold ring-1 ring-indigo-400" : ""}
          ${dayAvail && dayAvail.slots.length > 0 ? "bg-green-500/10" : dayAvail ? "bg-red-500/10" : ""}
        `}
        >
          {day}
          {dayAvail && dayAvail.slots.some((s) => s.status === "available") && (
            <div className="h-1 w-1 bg-green-400 rounded-full mx-auto mt-0.5"></div>
          )}
        </div>,
      )
    }
    return cells
  }

  const dayNames = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"]

  return (
    <Card className="bg-white/5 backdrop-blur-sm border border-white/10 shadow-lg text-slate-200">
      <CardHeader className="flex flex-row items-center justify-between py-3 px-4 border-b border-white/10">
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePrevMonth}
          className="hover:bg-white/10 text-slate-300 hover:text-white"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <CardTitle className="text-lg font-semibold text-indigo-300">
          {currentDate.toLocaleString("it-IT", { month: "long", year: "numeric" })}
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleNextMonth}
          className="hover:bg-white/10 text-slate-300 hover:text-white"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </CardHeader>
      <CardContent className="p-3 sm:p-4">
        <div className="grid grid-cols-7 gap-px text-xs sm:text-sm font-medium text-center text-slate-400 mb-2">
          {dayNames.map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-px">{renderCalendarGrid()}</div>
        {selectedDate && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <h4 className="font-semibold text-indigo-300 mb-2 text-center">
              Disponibilità per{" "}
              {selectedDate.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" })}:
            </h4>
            {selectedDayAvailability && selectedDayAvailability.slots.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-xs">
                {selectedDayAvailability.slots.map((slot) => (
                  <Badge
                    key={slot.time}
                    className={`p-2 justify-center
                    ${slot.status === "available" ? "bg-green-500/30 text-green-200 border-green-400/50 cursor-pointer hover:bg-green-500/50" : ""}
                    ${slot.status === "booked" ? "bg-red-500/30 text-red-300 border-red-400/50 line-through" : ""}
                    ${slot.status === "unavailable" ? "bg-slate-500/30 text-slate-400 border-slate-400/50" : ""}
                  `}
                  >
                    {slot.time}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-center text-sm">Nessuna fascia oraria specificata per questa data.</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
