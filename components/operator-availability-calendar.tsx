"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock } from "lucide-react"

type Availability = {
  [key: string]: {
    enabled: boolean
    slots: Array<{ start: string; end: string }>
  }
}

interface OperatorAvailabilityCalendarProps {
  availability: Availability | null | undefined
}

const dayOrder = ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato", "Domenica"]

export default function OperatorAvailabilityCalendar({ availability }: OperatorAvailabilityCalendarProps) {
  if (!availability) {
    return (
      <div className="text-center text-muted-foreground py-6">
        <Clock className="mx-auto h-8 w-8 mb-2" />
        <p>La disponibilità non è stata ancora impostata.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {dayOrder.map((day) => {
        const dayData = availability[day]
        const isAvailable = dayData?.enabled && dayData.slots.length > 0

        return (
          <Card
            key={day}
            className={isAvailable ? "border-green-200 dark:border-green-800" : "bg-gray-50 dark:bg-gray-800/50"}
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">{day}</h3>
                <Badge
                  variant={isAvailable ? "default" : "secondary"}
                  className={isAvailable ? "bg-green-600 text-white" : ""}
                >
                  {isAvailable ? "Disponibile" : "Non disponibile"}
                </Badge>
              </div>
              {isAvailable ? (
                <div className="space-y-1">
                  {dayData.slots.map((slot, index) => (
                    <div key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      <span>
                        {slot.start} - {slot.end}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center pt-2">-</p>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
