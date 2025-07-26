"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Loader2 } from "lucide-react"

const LEGAL_TEXTS_KEY = "platformLegalTexts_v2"

interface LegalTexts {
  privacyPolicy: string
  cookiePolicy: string
  termsConditions: string
}

type LegalContentKey = keyof LegalTexts

interface LegalPageDisplayProps {
  title: string
  contentKey: LegalContentKey
}

export function LegalPageDisplay({ title, contentKey }: LegalPageDisplayProps) {
  const [content, setContent] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    try {
      const storedTexts = localStorage.getItem(LEGAL_TEXTS_KEY)
      if (storedTexts) {
        const parsedTexts: LegalTexts = JSON.parse(storedTexts)
        setContent(parsedTexts[contentKey] || "Contenuto non ancora disponibile.")
      } else {
        setContent(
          "Contenuto non ancora disponibile. L'amministratore deve impostare i testi legali dalla sua dashboard.",
        )
      }
    } catch (error) {
      console.error("Errore nel caricamento dei testi legali:", error)
      setContent("Si è verificato un errore nel caricamento del contenuto.")
    }
    setIsLoading(false)
  }, [contentKey])

  return (
    <div className="bg-slate-50 min-h-screen py-16 sm:py-24">
      <div className="container mx-auto max-w-4xl px-4">
        <Card className="shadow-xl rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl sm:text-3xl font-bold text-slate-800">
              <FileText className="h-7 w-7 mr-3 text-[hsl(var(--primary-medium))]" />
              {title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center min-h-[300px]">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
              </div>
            ) : (
              <div className="prose prose-slate max-w-none" style={{ whiteSpace: "pre-wrap" }}>
                {content}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
