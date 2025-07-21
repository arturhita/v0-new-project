import { Award, Star, Sun, Gem } from "lucide-react"

export function OperatorBadges() {
  const badges = [
    { icon: Sun, label: "Top Risposta Rapida" },
    { icon: Star, label: "Recensioni Eccellenti" },
    { icon: Award, label: "Veterano della Piattaforma" },
    { icon: Gem, label: "Maestro di Specialità" },
  ]

  return (
    <div className="w-full mt-6">
      <h3 className="text-center text-sm font-semibold text-slate-300 mb-3">Badge Ottenuti</h3>
      <div className="flex justify-center space-x-3">
        {badges.map((badge, index) => (
          <div
            key={index}
            className="p-2 border-2 border-blue-500/50 rounded-full text-blue-400 hover:bg-blue-500/10 transition-colors cursor-pointer"
            title={badge.label}
          >
            <badge.icon className="w-6 h-6" />
          </div>
        ))}
      </div>
    </div>
  )
}
