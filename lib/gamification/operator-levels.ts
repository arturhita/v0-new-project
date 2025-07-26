export interface OperatorLevel {
  level: number
  title: string
  consultsRequired: number
  benefits: string[]
  badgeIcon: string
  badgeColor: string
  commissionBonus: number // percentuale bonus sulle commissioni
  visibilityBoost: boolean
  analyticsAccess: boolean
}

export interface OperatorStats {
  userId: string
  totalConsults: number
  averageRating: number
  totalEarnings: number
  currentLevel: number
  consultsToNextLevel: number
  badges: string[]
  joinedDate: Date
}

// Definizione livelli operatori
export const OPERATOR_LEVELS: OperatorLevel[] = [
  {
    level: 1,
    title: "Novizio",
    consultsRequired: 0,
    benefits: ["Profilo base", "Commissione standard"],
    badgeIcon: "⭐",
    badgeColor: "text-gray-400",
    commissionBonus: 0,
    visibilityBoost: false,
    analyticsAccess: false,
  },
  {
    level: 2,
    title: "Apprendista",
    consultsRequired: 10,
    benefits: ["Badge visibile", "Priorità moderata", "+2% commissione"],
    badgeIcon: "🏆",
    badgeColor: "text-blue-400",
    commissionBonus: 2,
    visibilityBoost: false,
    analyticsAccess: true,
  },
  {
    level: 3,
    title: "Esperto",
    consultsRequired: 50,
    benefits: ["Badge oro", "Boost visibilità", "+5% commissione"],
    badgeIcon: "💎",
    badgeColor: "text-yellow-400",
    commissionBonus: 5,
    visibilityBoost: true,
    analyticsAccess: true,
  },
  {
    level: 4,
    title: "Maestro",
    consultsRequired: 150,
    benefits: ["Badge platino", "Profilo premium", "+8% commissione"],
    badgeIcon: "👑",
    badgeColor: "text-purple-400",
    commissionBonus: 8,
    visibilityBoost: true,
    analyticsAccess: true,
  },
  {
    level: 5,
    title: "Guru",
    consultsRequired: 300,
    benefits: ["Badge diamante", "Top placement", "+12% commissione"],
    badgeIcon: "✨",
    badgeColor: "text-pink-400",
    commissionBonus: 12,
    visibilityBoost: true,
    analyticsAccess: true,
  },
]

export class OperatorLevelsService {
  // Calcola livello operatore basato sui consulti
  static calculateLevel(totalConsults: number): OperatorLevel {
    for (let i = OPERATOR_LEVELS.length - 1; i >= 0; i--) {
      if (totalConsults >= OPERATOR_LEVELS[i].consultsRequired) {
        return OPERATOR_LEVELS[i]
      }
    }
    return OPERATOR_LEVELS[0]
  }

  // Ottieni statistiche operatore
  static async getOperatorStats(operatorId: string): Promise<OperatorStats> {
    // Simulazione - in produzione da database
    const mockStats = {
      userId: operatorId,
      totalConsults: Math.floor(Math.random() * 400) + 10,
      averageRating: 4.2 + Math.random() * 0.7,
      totalEarnings: Math.floor(Math.random() * 10000) + 1000,
      joinedDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
    }

    const currentLevel = this.calculateLevel(mockStats.totalConsults)
    const nextLevel = OPERATOR_LEVELS.find((level) => level.level > currentLevel.level)
    const consultsToNextLevel = nextLevel ? nextLevel.consultsRequired - mockStats.totalConsults : 0

    return {
      ...mockStats,
      currentLevel: currentLevel.level,
      consultsToNextLevel: Math.max(0, consultsToNextLevel),
      badges: this.calculateBadges(mockStats.totalConsults, mockStats.averageRating),
    }
  }

  // Calcola badge ottenuti
  private static calculateBadges(totalConsults: number, averageRating: number): string[] {
    const badges: string[] = []

    if (totalConsults >= 1) badges.push("first_consult")
    if (totalConsults >= 10) badges.push("consultation_starter")
    if (totalConsults >= 50) badges.push("consultation_expert")
    if (totalConsults >= 100) badges.push("consultation_master")
    if (totalConsults >= 200) badges.push("consultation_guru")

    if (averageRating >= 4.5) badges.push("highly_rated")
    if (averageRating >= 4.8) badges.push("top_rated")

    return badges
  }

  // Assegna punti per consulto completato
  static async awardConsultationPoints(
    operatorId: string,
    consultationDuration: number,
    rating?: number,
  ): Promise<number> {
    let points = 100 // Base points per consulto

    // Bonus durata (1 punto per minuto oltre i 15)
    if (consultationDuration > 15) {
      points += Math.min(consultationDuration - 15, 45) // Max 45 punti bonus
    }

    // Bonus rating
    if (rating) {
      if (rating === 5) points += 50
      else if (rating >= 4.5) points += 25
      else if (rating >= 4) points += 10
    }

    // Assegna punti tramite sistema punti
    await import("./points-system").then((ps) =>
      ps.PointsService.awardPoints(operatorId, points, "Consulto completato", {
        duration: consultationDuration,
        rating,
      }),
    )

    return points
  }

  // Ottieni tutti gli operatori con i loro livelli
  static async getAllOperatorsWithLevels(): Promise<(OperatorStats & { levelInfo: OperatorLevel })[]> {
    // Simulazione - in produzione da database
    const operators = Array.from({ length: 20 }, (_, i) => ({
      userId: `op_${i + 1}`,
      name: `Operatore ${i + 1}`,
      totalConsults: Math.floor(Math.random() * 400) + 5,
      averageRating: 4.0 + Math.random() * 1.0,
      totalEarnings: Math.floor(Math.random() * 15000) + 500,
      joinedDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
    }))

    return operators.map((op) => {
      const currentLevel = this.calculateLevel(op.totalConsults)
      const nextLevel = OPERATOR_LEVELS.find((level) => level.level > currentLevel.level)
      const consultsToNextLevel = nextLevel ? nextLevel.consultsRequired - op.totalConsults : 0

      return {
        ...op,
        currentLevel: currentLevel.level,
        consultsToNextLevel: Math.max(0, consultsToNextLevel),
        badges: this.calculateBadges(op.totalConsults, op.averageRating),
        levelInfo: currentLevel,
      }
    })
  }
}
