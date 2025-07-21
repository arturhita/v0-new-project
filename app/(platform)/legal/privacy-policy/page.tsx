import { LegalPageDisplay } from "@/components/legal-page-display"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy - Moonthir",
  description: "Leggi la nostra politica sulla privacy per capire come gestiamo i tuoi dati.",
}

export default function PrivacyPolicyPage() {
  return <LegalPageDisplay title="Privacy Policy" contentKey="privacyPolicy" />
}
