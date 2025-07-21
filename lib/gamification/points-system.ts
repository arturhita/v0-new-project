export interface UserPoints {
  userId: string
  totalPoints: number
  availablePoints: number
  spentPoints: number
  level: number
  xp: number
  streak: number
  lastActivity: Date
  multiplier: number
}

export interface PointsTransaction {
  id: string
  userId: string
  type: "earned" | "spent"
  amount: number
  reason: string
  actionType: string
  metadata?: any
  createdAt: Date
}

export const POINTS_RULES = {
  consultation_completed: { points: 50, limit: 10, period: "daily" },
  review_written: { points: 25, limit: 5, period: "daily" },
  profile_completed: { points: 30, limit: 1, period: "lifetime" },
  daily_login: { points: 5, limit: 1, period: "daily" },
  first_consultation: { points: 100, limit: 1, period: "lifetime" },
  referral_signup: { points: 200, limit: 50, period: "monthly" },
  social_share: { points: 10, limit: 3, period: "daily" },
  newsletter_signup: { points: 15, limit: 1, period: "lifetime" },
  feedback_submitted: { points: 20, limit: 2, period: "weekly" },
  streak_7_days: { points: 50, limit: 1, period: "weekly" },
  streak_30_days: { points: 200, limit: 1, period: "monthly" },
  consultation_rated_5_stars: { points: 35, limit: 5, period: "daily" },
  operator_featured: { points: 100, limit: 1, period: "monthly" },
  milestone_10_consultations: { points: 150, limit: 1, period: "lifetime" },
  milestone_50_consultations: { points: 500, limit: 1, period: "lifetime" },
}

export const LEVELS_CONFIG = [
  { level: 1, title: "Novizio", xpRequired: 0, benefits: ["Accesso base alla piattaforma"] },
  { level: 2, title: "Esploratore", xpRequired: 100, benefits: ["Sconto 5% su consulenze", "Badge personalizzato"] },
  { level: 3, title: "Ricercatore", xpRequired: 300, benefits: ["Sconto 10%", "Accesso prioritario"] },
  { level: 4, title: "Saggio", xpRequired: 600, benefits: ["Sconto 15%", "Consulenza gratuita mensile"] },
  { level: 5, title: "Maestro", xpRequired: 1000, benefits: ["Sconto 20%", "Accesso VIP", "Support prioritario"] },
  { level: 6, title: "Guru", xpRequired: 1500, benefits: ["Sconto 25%", "Consulenze illimitate", "Badge esclusivo"] },
  { level: 7, title: "Leggenda", xpRequired: 2500, benefits: ["Sconto 30%", "Accesso beta features", "Hall of Fame"] },
]

export class PointsService {
  static async getUserPoints(userId: string): Promise<UserPoints> {
    // Simulazione - in produzione da database
    return {
      userId,
      totalPoints: 1250,
      availablePoints: 850,
      spentPoints: 400,
      level: 3,
      xp: 450,
      streak: 7,
      lastActivity: new Date(),
      multiplier: 1.2,
    }
  }

  static async addPoints(userId: string, actionType: string, metadata?: any): Promise<boolean> {
    const rule = POINTS_RULES[actionType as keyof typeof POINTS_RULES]
    if (!rule) return false

    // Verifica limiti
    const canEarn = await this.checkLimits(userId, actionType, rule)
    if (!canEarn) return false

    const points = rule.points

    // Applica moltiplicatori
    const userPoints = await this.getUserPoints(userId)
    const finalPoints = Math.floor(points * userPoints.multiplier)

    // Salva transazione
    await this.saveTransaction({
      id: `tx_${Date.now()}`,
      userId,
      type: "earned",
      amount: finalPoints,
      reason: `Points earned for ${actionType}`,
      actionType,
      metadata,
      createdAt: new Date(),
    })

    // Aggiorna livello se necessario
    await this.updateLevel(userId)

    return true
  }

  static async spendPoints(userId: string, amount: number, reason: string): Promise<boolean> {
    const userPoints = await this.getUserPoints(userId)
    if (userPoints.availablePoints < amount) return false

    await this.saveTransaction({
      id: `tx_${Date.now()}`,
      userId,
      type: "spent",
      amount,
      reason,
      actionType: "manual_spend",
      createdAt: new Date(),
    })

    return true
  }

  private static async checkLimits(userId: string, actionType: string, rule: any): Promise<boolean> {
    // Implementazione controllo limiti
    return true
  }

  private static async saveTransaction(transaction: PointsTransaction): Promise<void> {
    // Salva nel database
    console.log("Transaction saved:", transaction)
  }

  private static async updateLevel(userId: string): Promise<void> {
    // Aggiorna livello utente
    console.log("Level updated for user:", userId)
  }

  static async getRecentTransactions(userId: string, limit = 10): Promise<PointsTransaction[]> {
    // Simulazione transazioni recenti
    return [
      {
        id: "tx1",
        userId,
        type: "earned",
        amount: 50,
        reason: "Consulenza completata",
        actionType: "consultation_completed",
        createdAt: new Date(Date.now() - 86400000),
      },
      {
        id: "tx2",
        userId,
        type: "earned",
        amount: 25,
        reason: "Recensione scritta",
        actionType: "review_written",
        createdAt: new Date(Date.now() - 172800000),
      },
      {
        id: "tx3",
        userId,
        type: "spent",
        amount: 100,
        reason: "Sconto 10% riscattato",
        actionType: "reward_redeemed",
        createdAt: new Date(Date.now() - 259200000),
      },
    ]
  }
}
