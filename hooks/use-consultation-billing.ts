"use client"

import { useState, useEffect, useCallback } from "react"
import { getWalletBalance } from "@/lib/actions/wallet.actions"
import { endConsultation } from "@/lib/actions/consultation_billing.actions"
import { toast } from "sonner"

interface UseConsultationBillingProps {
  consultationId: string
  startTime: string | null
  ratePerMinute: number
  isClient: boolean
  onSessionEnd?: () => void
}

export function useConsultationBilling({
  consultationId,
  startTime,
  ratePerMinute,
  isClient,
  onSessionEnd,
}: UseConsultationBillingProps) {
  const [elapsedTime, setElapsedTime] = useState(0)
  const [currentCost, setCurrentCost] = useState(0)
  const [walletBalance, setWalletBalance] = useState<number | null>(null)
  const [status, setStatus] = useState<"active" | "low_balance" | "ending" | "ended">("active")
  const [isEnding, setIsEnding] = useState(false)

  const ratePerSecond = ratePerMinute / 60

  const fetchBalance = useCallback(async () => {
    if (!isClient) return
    const { balance, error } = await getWalletBalance()
    if (error) {
      toast.error("Impossibile recuperare il saldo del portafoglio.")
      return
    }
    setWalletBalance(balance)
  }, [isClient])

  useEffect(() => {
    fetchBalance()
    // Fetch balance periodically
    const balanceInterval = setInterval(fetchBalance, 30000) // every 30 seconds
    return () => clearInterval(balanceInterval)
  }, [fetchBalance])

  useEffect(() => {
    if (!startTime) return

    const start = new Date(startTime).getTime()
    const timerInterval = setInterval(() => {
      const now = Date.now()
      const elapsed = Math.floor((now - start) / 1000)
      setElapsedTime(elapsed)

      const cost = elapsed * ratePerSecond
      setCurrentCost(cost)

      if (isClient && walletBalance !== null) {
        const remainingBalance = walletBalance - cost
        const remainingTime = remainingBalance / ratePerSecond // in seconds

        if (remainingTime < 0 && status !== "ending") {
          setStatus("ending")
          toast.error("Credito esaurito. La sessione terminerà ora.")
          handleEndConsultation()
        } else if (remainingTime < 120 && status === "active") {
          // 2 minutes warning
          setStatus("low_balance")
          toast.warning("Attenzione: credito in esaurimento. Meno di 2 minuti rimasti.")
        }
      }
    }, 1000)

    return () => clearInterval(timerInterval)
  }, [startTime, ratePerSecond, walletBalance, isClient, status])

  const handleEndConsultation = useCallback(async () => {
    if (isEnding) return
    setIsEnding(true)
    toast.info("Terminazione della sessione in corso...")

    const result = await endConsultation(consultationId)

    if (result.success) {
      toast.success(result.message || "Sessione terminata con successo.")
      setStatus("ended")
      if (onSessionEnd) {
        onSessionEnd()
      }
    } else {
      toast.error(result.error || "Impossibile terminare la sessione.")
      setIsEnding(false) // Allow retry if it fails
    }
  }, [consultationId, isEnding, onSessionEnd])

  return {
    elapsedTime,
    currentCost,
    walletBalance,
    status,
    isEnding,
    handleEndConsultation,
  }
}
