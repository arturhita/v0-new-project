"use client"

import type { OperatorProfile } from "@/types/operator.types"
import StartConsultationActions from "./start-consultation-actions"

interface OperatorProfileClientSectionProps {
  operator: OperatorProfile
}

export default function OperatorProfileClientSection({ operator }: OperatorProfileClientSectionProps) {
  return (
    <div className="w-full md:w-72 flex-shrink-0 flex flex-col items-center gap-4 p-6 bg-slate-900/60 rounded-xl border border-blue-700/50 shadow-lg">
      <h3 className="text-xl font-semibold text-white tracking-wider">Contatta Subito</h3>
      <StartConsultationActions operator={operator} />
    </div>
  )
}
