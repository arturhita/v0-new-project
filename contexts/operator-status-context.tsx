"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react"
import { toast } from "@/components/ui/use-toast"

// Simula gli orari di disponibilità dell'operatore
// In un'app reale, questi verrebbero caricati dal backend
// Formato: GiornoDellaSettimana (0=Dom, 1=Lun, ...): [{ start: "HH:MM", end: "HH:MM" }]
const MOCK_AVAILABILITY_SCHEDULE = {
  1: [
    { start: "09:00", end: "13:00" },
    { start: "14:00", end: "18:00" },
  ], // Lunedì
  2: [{ start: "09:00", end: "17:00" }], // Martedì
  3: [{ start: "10:00", end: "16:00" }], // Mercoledì
  // Giovedì, Venerdì, Sabato, Domenica non disponibili in questo mock
}

type OperatorStatus = "online" | "offline" | "occupied" | "paused"
const PAUSE_DURATION_MINUTES = 20

interface OperatorStatusContextType {
  status: OperatorStatus
  setStatus: (status: OperatorStatus, manualOverride?: boolean) => void
  isManuallySet: boolean // Indica se lo stato è stato impostato manualmente e non automaticamente
  operatorName: string
  pauseTimer: number // in seconds
  startConsultation: () => void
  endConsultation: () => void
  isWithinAvailability: () => boolean
}

const OperatorStatusContext = createContext<OperatorStatusContextType | undefined>(undefined)

export function OperatorStatusProvider({
  children,
  operatorName,
}: {
  children: React.ReactNode
  operatorName: string
}) {
  const [status, setStatusInternal] = useState<OperatorStatus>("offline") // Inizia offline
  const [isManuallySet, setIsManuallySet] = useState(false)
  const [pauseTimer, setPauseTimer] = useState(0)
  const [isInConsultation, setIsInConsultation] = useState(false)

  const isWithinAvailability = useCallback(() => {
    const now = new Date()
    const currentDay = now.getDay() // 0 (Dom) - 6 (Sab)
    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`

    const todaySchedule = MOCK_AVAILABILITY_SCHEDULE[currentDay as keyof typeof MOCK_AVAILABILITY_SCHEDULE]
    if (!todaySchedule) return false

    return todaySchedule.some((slot) => currentTime >= slot.start && currentTime < slot.end)
  }, [])

  const setStatus = useCallback(
    (newStatus: OperatorStatus, manualOverride = false) => {
      console.log(
        `Attempting to set status to: ${newStatus}, manual: ${manualOverride}, current consultation: ${isInConsultation}`,
      )

      if (manualOverride) {
        setIsManuallySet(true)
        if (newStatus === "paused") {
          setPauseTimer(PAUSE_DURATION_MINUTES * 60)
          toast({
            title: "In Pausa",
            description: `Sarai in pausa per ${PAUSE_DURATION_MINUTES} minuti.`,
          })
        } else {
          setPauseTimer(0) // Resetta timer se non è pausa
        }
        setStatusInternal(newStatus)
      } else {
        // Logica automatica: non sovrascrive una pausa manuale o uno stato offline manuale
        if (status === "paused" && newStatus !== "offline") return // Non uscire dalla pausa automaticamente tranne se finisce
        if (status === "offline" && isManuallySet && newStatus === "online") return // Non andare online automaticamente se messo offline manualmente

        setIsManuallySet(false)
        setStatusInternal(newStatus)
      }
    },
    [status, isManuallySet, isInConsultation],
  )

  // Effetto per il timer della pausa
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined
    if (status === "paused" && pauseTimer > 0) {
      interval = setInterval(() => {
        setPauseTimer((prev) => prev - 1)
      }, 1000)
    } else if (status === "paused" && pauseTimer === 0) {
      toast({
        title: "Pausa Terminata",
        description: "Sei ora offline. Imposta il tuo stato su Online per tornare disponibile.",
      })
      setStatus("offline", true) // Fine pausa, imposta offline manualmente
    }
    return () => clearInterval(interval)
  }, [status, pauseTimer, setStatus])

  // Effetto per la gestione automatica dello stato
  useEffect(() => {
    const updateAutoStatus = () => {
      if (isInConsultation) {
        if (status !== "occupied") setStatusInternal("occupied") // Non serve setIsManuallySet(false) qui
        return
      }

      if (status === "paused") return // Se in pausa, non fare nulla

      if (isManuallySet && (status === "offline" || status === "online")) {
        return
      }

      if (isWithinAvailability()) {
        if (status !== "online") setStatusInternal("online")
      } else {
        if (status !== "offline") setStatusInternal("offline")
      }
    }

    updateAutoStatus() // Check immediato
    const interval = setInterval(updateAutoStatus, 60 * 1000) // Controlla ogni minuto
    return () => clearInterval(interval)
  }, [isWithinAvailability, isInConsultation, status, isManuallySet])

  const startConsultation = useCallback(() => {
    setIsInConsultation(true)
    setStatusInternal("occupied") // Forza occupato quando inizia consulto
    setIsManuallySet(false) // Un consulto è un evento automatico
    console.log("Consultation started, status set to occupied")
  }, [])

  const endConsultation = useCallback(() => {
    setIsInConsultation(false)
    setIsManuallySet(false) // Dopo un consulto, lo stato dovrebbe essere automatico
    console.log("Consultation ended, status will be re-evaluated")
  }, [])

  const contextValue = useMemo(
    () => ({
      status,
      setStatus,
      isManuallySet,
      operatorName,
      pauseTimer,
      startConsultation,
      endConsultation,
      isWithinAvailability,
    }),
    [
      status,
      setStatus,
      isManuallySet,
      operatorName,
      pauseTimer,
      startConsultation,
      endConsultation,
      isWithinAvailability,
    ],
  )

  return <OperatorStatusContext.Provider value={contextValue}>{children}</OperatorStatusContext.Provider>
}

export function useOperatorStatus() {
  const context = useContext(OperatorStatusContext)
  if (context === undefined) {
    throw new Error("useOperatorStatus must be used within an OperatorStatusProvider")
  }
  return context
}
