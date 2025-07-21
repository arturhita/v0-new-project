"use client"

type AvailabilitySlot = {
  start: string
  end: string
}

type DayAvailability = {
  enabled: boolean
  slots: AvailabilitySlot[]
}

type Availability = {
  [key: string]: DayAvailability
}

interface OperatorAvailabilityCalendarProps {
  availability: Availability | null | undefined
}

export default function OperatorAvailabilityCalendar({ availability }: OperatorAvailabilityCalendarProps) {
  const daysOfWeek = ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato", "Domenica"]

  if (!availability || Object.keys(availability).length === 0) {
    return <p className="text-sm text-slate-400 text-center">Nessuna disponibilità impostata.</p>
  }

  return (
    <div className="space-y-2">
      {daysOfWeek.map((dayName) => {
        const dayData = availability[dayName]
        const isAvailable = dayData && dayData.enabled && dayData.slots.length > 0

        return (
          <div
            key={dayName}
            className="flex items-center justify-between text-sm p-2 rounded-lg transition-colors duration-300 hover:bg-white/5"
          >
            <span className={`font-semibold ${isAvailable ? "text-slate-200" : "text-slate-500"}`}>{dayName}</span>
            <div className="flex flex-wrap justify-end gap-1">
              {isAvailable ? (
                dayData.slots.map((slot, index) => (
                  <span key={index} className="text-blue-300 bg-black/20 px-2 py-0.5 rounded text-xs">
                    {slot.start} - {slot.end}
                  </span>
                ))
              ) : (
                <span className="text-slate-500 text-xs">Non disponibile</span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
