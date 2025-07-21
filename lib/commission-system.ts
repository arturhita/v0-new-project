export interface CommissionRule {
  id: string
  operatorId: string
  baseCommission: number // Percentuale base (es. 30%)
  bonusRules: {
    consultationsThreshold: number
    bonusPercentage: number
  }[]
  effectiveDate: Date
  isActive: boolean
}

export interface RealTimeCommission {
  operatorId: string
  currentCommission: number
  consultationsThisMonth: number
  totalEarnings: number
  platformFee: number
  nextBonusAt: number
  projectedCommission: number
}

class CommissionSystem {
  private commissionRules = new Map<string, CommissionRule>()
  private realTimeData = new Map<string, RealTimeCommission>()

  constructor() {
    this.initializeDefaultRules()
  }

  private initializeDefaultRules() {
    // Regole di commissione predefinite
    const defaultOperators = [
      { id: "op1", baseCommission: 30 },
      { id: "op2", baseCommission: 35 },
      { id: "op3", baseCommission: 40 },
    ]

    defaultOperators.forEach((op) => {
      const rule: CommissionRule = {
        id: `rule_${op.id}`,
        operatorId: op.id,
        baseCommission: op.baseCommission,
        bonusRules: [
          { consultationsThreshold: 50, bonusPercentage: 5 },
          { consultationsThreshold: 100, bonusPercentage: 10 },
          { consultationsThreshold: 200, bonusPercentage: 15 },
        ],
        effectiveDate: new Date(),
        isActive: true,
      }
      this.commissionRules.set(op.id, rule)

      // Inizializza dati real-time
      this.realTimeData.set(op.id, {
        operatorId: op.id,
        currentCommission: op.baseCommission,
        consultationsThisMonth: Math.floor(Math.random() * 150),
        totalEarnings: Math.random() * 5000,
        platformFee: 0,
        nextBonusAt: 50,
        projectedCommission: op.baseCommission,
      })
    })
  }

  calculateCommission(operatorId: string, consultationsCount: number): number {
    const rule = this.commissionRules.get(operatorId)
    if (!rule) return 30 // Default

    let commission = rule.baseCommission

    // Applica bonus basati sul numero di consulenze
    for (const bonus of rule.bonusRules) {
      if (consultationsCount >= bonus.consultationsThreshold) {
        commission = rule.baseCommission + bonus.bonusPercentage
      }
    }

    return commission
  }

  updateRealTimeCommission(
    operatorId: string,
    newConsultation: {
      amount: number
      duration: number
    },
  ) {
    const data = this.realTimeData.get(operatorId)
    if (!data) return

    data.consultationsThisMonth += 1
    const newCommission = this.calculateCommission(operatorId, data.consultationsThisMonth)

    const operatorEarning = newConsultation.amount * (newCommission / 100)
    const platformFee = newConsultation.amount * ((100 - newCommission) / 100)

    data.currentCommission = newCommission
    data.totalEarnings += operatorEarning
    data.platformFee += platformFee

    // Calcola prossimo bonus
    const rule = this.commissionRules.get(operatorId)
    if (rule) {
      const nextBonus = rule.bonusRules.find((b) => b.consultationsThreshold > data.consultationsThisMonth)
      data.nextBonusAt = nextBonus?.consultationsThreshold || data.consultationsThisMonth
    }

    this.realTimeData.set(operatorId, data)
    return data
  }

  getRealTimeCommission(operatorId: string): RealTimeCommission | null {
    return this.realTimeData.get(operatorId) || null
  }

  getAllCommissions(): RealTimeCommission[] {
    return Array.from(this.realTimeData.values())
  }

  updateCommissionRule(operatorId: string, newRule: Partial<CommissionRule>) {
    const existing = this.commissionRules.get(operatorId)
    if (existing) {
      const updated = { ...existing, ...newRule }
      this.commissionRules.set(operatorId, updated)

      // Ricalcola commissione corrente
      const realTimeData = this.realTimeData.get(operatorId)
      if (realTimeData) {
        realTimeData.currentCommission = this.calculateCommission(operatorId, realTimeData.consultationsThisMonth)
        this.realTimeData.set(operatorId, realTimeData)
      }
    }
  }
}

export const commissionSystem = new CommissionSystem()
