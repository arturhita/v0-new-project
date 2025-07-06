"use server"

import { commissionSystem } from "./commission-system" // Import commissionSystem

export interface TimerSession {
  id: string
  clientId: string
  operatorId: string
  startTime: Date
  endTime?: Date
  duration: number // in seconds
  ratePerMinute: number
  totalCost: number
  operatorEarning: number
  platformFee: number
  status: "active" | "paused" | "completed" | "cancelled"
  pausedDuration: number
  lastPauseTime?: Date
}

export interface BillingEvent {
  sessionId: string
  timestamp: Date
  event: "start" | "pause" | "resume" | "end" | "minute_tick"
  amount?: number
  balance?: number
}

class TimerBillingSystem {
  private activeSessions = new Map<string, TimerSession>()
  private billingEvents = new Map<string, BillingEvent[]>()
  private timers = new Map<string, NodeJS.Timeout>()

  startSession(clientId: string, operatorId: string, ratePerMinute: number): TimerSession {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const session: TimerSession = {
      id: sessionId,
      clientId,
      operatorId,
      startTime: new Date(),
      duration: 0,
      ratePerMinute,
      totalCost: 0,
      operatorEarning: 0,
      platformFee: 0,
      status: "active",
      pausedDuration: 0,
    }

    this.activeSessions.set(sessionId, session)
    this.billingEvents.set(sessionId, [])

    // Avvia timer per fatturazione al minuto
    this.startBillingTimer(sessionId)

    this.addBillingEvent(sessionId, "start")

    return session
  }

  private startBillingTimer(sessionId: string) {
    const timer = setInterval(() => {
      this.processMinuteTick(sessionId)
    }, 60000) // Ogni minuto

    this.timers.set(sessionId, timer)
  }

  private processMinuteTick(sessionId: string) {
    const session = this.activeSessions.get(sessionId)
    if (!session || session.status !== "active") return

    const now = new Date()
    const elapsedSeconds = Math.floor((now.getTime() - session.startTime.getTime()) / 1000) - session.pausedDuration
    session.duration = elapsedSeconds

    // Calcola costo per il minuto corrente
    const minutes = Math.ceil(elapsedSeconds / 60)
    const newTotalCost = minutes * session.ratePerMinute

    // Calcola commissioni in tempo reale
    const commissionData = commissionSystem.getRealTimeCommission(session.operatorId)
    const commissionRate = commissionData?.currentCommission || 30

    session.totalCost = newTotalCost
    session.operatorEarning = newTotalCost * (commissionRate / 100)
    session.platformFee = newTotalCost * ((100 - commissionRate) / 100)

    this.activeSessions.set(sessionId, session)
    this.addBillingEvent(sessionId, "minute_tick", newTotalCost)

    // Aggiorna commissioni in tempo reale
    commissionSystem.updateRealTimeCommission(session.operatorId, {
      amount: session.ratePerMinute,
      duration: 60,
    })

    // Notifica client e operatore del costo aggiornato
    this.notifySessionUpdate(sessionId, session)
  }

  pauseSession(sessionId: string): TimerSession | null {
    const session = this.activeSessions.get(sessionId)
    if (!session || session.status !== "active") return null

    session.status = "paused"
    session.lastPauseTime = new Date()

    this.activeSessions.set(sessionId, session)
    this.addBillingEvent(sessionId, "pause")

    return session
  }

  resumeSession(sessionId: string): TimerSession | null {
    const session = this.activeSessions.get(sessionId)
    if (!session || session.status !== "paused") return null

    if (session.lastPauseTime) {
      const pauseDuration = Math.floor((new Date().getTime() - session.lastPauseTime.getTime()) / 1000)
      session.pausedDuration += pauseDuration
    }

    session.status = "active"
    session.lastPauseTime = undefined

    this.activeSessions.set(sessionId, session)
    this.addBillingEvent(sessionId, "resume")

    return session
  }

  endSession(sessionId: string): TimerSession | null {
    const session = this.activeSessions.get(sessionId)
    if (!session) return null

    const now = new Date()
    session.endTime = now
    session.status = "completed"

    // Calcolo finale
    const totalSeconds = Math.floor((now.getTime() - session.startTime.getTime()) / 1000) - session.pausedDuration
    session.duration = totalSeconds

    const finalMinutes = Math.ceil(totalSeconds / 60)
    session.totalCost = finalMinutes * session.ratePerMinute

    // Commissioni finali
    const commissionData = commissionSystem.getRealTimeCommission(session.operatorId)
    const commissionRate = commissionData?.currentCommission || 30

    session.operatorEarning = session.totalCost * (commissionRate / 100)
    session.platformFee = session.totalCost * ((100 - commissionRate) / 100)

    // Ferma timer
    const timer = this.timers.get(sessionId)
    if (timer) {
      clearInterval(timer)
      this.timers.delete(sessionId)
    }

    this.activeSessions.set(sessionId, session)
    this.addBillingEvent(sessionId, "end", session.totalCost)

    return session
  }

  private addBillingEvent(sessionId: string, event: BillingEvent["event"], amount?: number) {
    const events = this.billingEvents.get(sessionId) || []
    events.push({
      sessionId,
      timestamp: new Date(),
      event,
      amount,
    })
    this.billingEvents.set(sessionId, events)
  }

  private notifySessionUpdate(sessionId: string, session: TimerSession) {
    // Qui implementeresti le notifiche real-time via WebSocket
    console.log(`Session ${sessionId} update:`, {
      duration: session.duration,
      cost: session.totalCost,
      operatorEarning: session.operatorEarning,
    })
  }

  getSession(sessionId: string): TimerSession | null {
    return this.activeSessions.get(sessionId) || null
  }

  getActiveSessions(): TimerSession[] {
    return Array.from(this.activeSessions.values()).filter((s) => s.status === "active")
  }

  getBillingHistory(sessionId: string): BillingEvent[] {
    return this.billingEvents.get(sessionId) || []
  }
}

export const timerBillingSystem = new TimerBillingSystem()
