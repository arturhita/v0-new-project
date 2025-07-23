"use client"

import { useState, useTransition } from "react"
import { type AvailabilitySchedule, updateOperatorAvailabilitySchedule } from "@/lib/actions/availability.actions"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

const daysOfWeek = ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato", "Domenica"]

export default function AvailabilityClientPage({ initialSchedule }: { initialSchedule: AvailabilitySchedule[] }) {
  const [schedule, setSchedule] = useState<AvailabilitySchedule[]>(initialSchedule)
  const [isPending, startTransition] = useTransition()

  const handleToggle = (dayOfWeek: number) => {
    setSchedule((prev) =>
      prev.map((day) => (day.day_of_week === dayOfWeek ? { ...day, is_available: !day.is_available } : day)),
    )
  }

  const handleTimeChange = (dayOfWeek: number, type: "start_time" | "end_time", value: string) => {
    setSchedule((prev) => prev.map((day) => (day.day_of_week === dayOfWeek ? { ...day, [type]: value } : day)))
  }

  const handleSubmit = async () => {
    startTransition(async () => {
      const result = await updateOperatorAvailabilitySchedule(schedule)
      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {schedule.map((day) => (
          <div
            key={day.day_of_week}
            className="grid grid-cols-1 md:grid-cols-4 items-center gap-4 p-4 border rounded-lg"
          >
            <Label className="font-semibold text-lg">{daysOfWeek[day.day_of_week - 1]}</Label>
            <div className="flex items-center space-x-2">
              <Switch
                id={`available-${day.day_of_week}`}
                checked={day.is_available}
                onCheckedChange={() => handleToggle(day.day_of_week)}
              />
              <Label htmlFor={`available-${day.day_of_week}`}>
                {day.is_available ? "Disponibile" : "Non Disponibile"}
              </Label>
            </div>
            <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`start-${day.day_of_week}`}>Inizio</Label>
                <Input
                  id={`start-${day.day_of_week}`}
                  type="time"
                  value={day.start_time || ""}
                  onChange={(e) => handleTimeChange(day.day_of_week, "start_time", e.target.value)}
                  disabled={!day.is_available}
                />
              </div>
              <div>
                <Label htmlFor={`end-${day.day_of_week}`}>Fine</Label>
                <Input
                  id={`end-${day.day_of_week}`}
                  type="time"
                  value={day.end_time || ""}
                  onChange={(e) => handleTimeChange(day.day_of_week, "end_time", e.target.value)}
                  disabled={!day.is_available}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-end">
        <Button onClick={handleSubmit} disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Salva Modifiche
        </Button>
      </div>
    </div>
  )
}
