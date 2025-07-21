import { LegalPageDisplay } from "@/components/legal-page-display"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Termini e Condizioni - Moonthir",
  description: "Consulta i termini e le condizioni di utilizzo della piattaforma Moonthir.",
}

export default function TermsAndConditionsPage() {
  return <LegalPageDisplay title="Termini e Condizioni" contentKey="termsConditions" />
}
