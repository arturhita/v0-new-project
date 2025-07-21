import { LegalPageDisplay } from "@/components/legal-page-display"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Cookie Policy - Moonthir",
  description: "Scopri come utilizziamo i cookie per migliorare la tua esperienza sul nostro sito.",
}

export default function CookiePolicyPage() {
  return <LegalPageDisplay title="Cookie Policy" contentKey="cookiePolicy" />
}
