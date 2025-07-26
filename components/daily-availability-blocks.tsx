import { cn } from "@/lib/utils"

type Availability = {
  [key: string]: { start: string; end: string }[]
}

interface DailyAvailabilityBlocksProps {
  availability: Availability
  className?: string
  classNameForDayLabel?: string
  classNameForTimeSlot?: string
}

const daysOrder = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
const dayTranslations: { [key: string]: string } = {
  monday: "Lunedì",
  tuesday: "Martedì",
  wednesday: "Mercoledì",
  thursday: "Giovedì",
  friday: "Venerdì",
  saturday: "Sabato",
  sunday: "Domenica",
}

export function DailyAvailabilityBlocks({
  availability,
  className,
  classNameForDayLabel = "text-sm font-medium text-slate-700 dark:text-indigo-300",
  classNameForTimeSlot = "text-xs bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-md",
}: DailyAvailabilityBlocksProps) {
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4", className)}>
      {daysOrder.map((day) => (
        <div
          key={day}
          className="p-3 rounded-lg bg-white/5 dark:bg-black/10 border border-white/10 dark:border-black/20 shadow-sm"
        >
          <h4 className={cn("mb-2 capitalize", classNameForDayLabel)}>{dayTranslations[day]}</h4>
          {availability[day] && availability[day].length > 0 ? (
            <div className="space-y-1.5">
              {availability[day].map((slot, index) => (
                <div key={index} className={cn("flex items-center justify-center", classNameForTimeSlot)}>
                  <span>
                    {slot.start} - {slot.end}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className={cn("text-xs italic", classNameForTimeSlot, "opacity-60")}>Non disponibile</p>
          )}
        </div>
      ))}
    </div>
  )
}
