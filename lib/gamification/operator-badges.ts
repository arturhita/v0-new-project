export interface OperatorBadge {
  id: string
  name: string
  description: string
  icon: string
  consultsRequired: number
  rarity: "common" | "rare" | "epic" | "legendary"
  color: string
}

// Badge operatori - SONO i loro "rewards" visibili sui profili pubblici
export const OPERATOR_BADGES: OperatorBadge[] = [
  {
    id: "first_consult",
    name: "Primo Passo",
    description: "Ha completato il primo consulto",
    icon: "🌟",
    consultsRequired: 1,
    rarity: "common",
    color: "text-gray-400",
  },
  {
    id: "getting_started",
    name: "In Cammino",
    description: "Ha completato 10 consulti",
    icon: "⭐",
    consultsRequired: 10,
    rarity: "common",
    color: "text-blue-400",
  },
  {
    id: "experienced",
    name: "Esperto",
    description: "Ha completato 25 consulti",
    icon: "🎯",
    consultsRequired: 25,
    rarity: "rare",
    color: "text-purple-400",
  },
  {
    id: "professional",
    name: "Professionista",
    description: "Ha completato 50 consulti",
    icon: "🏆",
    consultsRequired: 50,
    rarity: "rare",
    color: "text-yellow-400",
  },
  {
    id: "master",
    name: "Maestro",
    description: "Ha completato 100 consulti",
    icon: "💎",
    consultsRequired: 100,
    rarity: "epic",
    color: "text-cyan-400",
  },
  {
    id: "guru",
    name: "Guru",
    description: "Ha completato 200 consulti",
    icon: "👑",
    consultsRequired: 200,
    rarity: "legendary",
    color: "text-yellow-400",
  },
  {
    id: "legend",
    name: "Leggenda",
    description: "Ha completato 500 consulti",
    icon: "✨",
    consultsRequired: 500,
    rarity: "legendary",
    color: "text-pink-400",
  },
]

export class OperatorBadgesService {
  // Ottieni badge sbloccati basati sui consulti
  static getUnlockedBadges(totalConsults: number): OperatorBadge[] {
    return OPERATOR_BADGES.filter((badge) => totalConsults >= badge.consultsRequired)
  }

  // Ottieni prossimo badge da sbloccare
  static getNextBadge(totalConsults: number): OperatorBadge | null {
    const nextBadges = OPERATOR_BADGES.filter((badge) => totalConsults < badge.consultsRequired)
    return nextBadges.length > 0 ? nextBadges[0] : null
  }

  // Calcola progresso verso prossimo badge
  static getBadgeProgress(totalConsults: number): {
    current: number
    required: number
    percentage: number
    nextBadge: OperatorBadge | null
  } {
    const nextBadge = this.getNextBadge(totalConsults)

    if (!nextBadge) {
      return {
        current: totalConsults,
        required: totalConsults,
        percentage: 100,
        nextBadge: null,
      }
    }

    const previousBadge = OPERATOR_BADGES.filter((badge) => badge.consultsRequired <= totalConsults).pop()

    const baseConsults = previousBadge ? previousBadge.consultsRequired : 0
    const progressConsults = totalConsults - baseConsults
    const requiredConsults = nextBadge.consultsRequired - baseConsults
    const percentage = Math.min((progressConsults / requiredConsults) * 100, 100)

    return {
      current: totalConsults,
      required: nextBadge.consultsRequired,
      percentage,
      nextBadge,
    }
  }

  // Ottieni statistiche operatore
  static async getOperatorStats(operatorId: string): Promise<{
    totalConsults: number
    unlockedBadges: OperatorBadge[]
    nextBadge: OperatorBadge | null
  }> {
    // In produzione: recuperare dal database
    const totalConsults = Math.floor(Math.random() * 200) + 5
    const unlockedBadges = this.getUnlockedBadges(totalConsults)
    const nextBadge = this.getNextBadge(totalConsults)

    return {
      totalConsults,
      unlockedBadges,
      nextBadge,
    }
  }

  // Verifica se operatore ha sbloccato nuovo badge
  static checkNewBadgeUnlocked(previousConsults: number, newConsults: number): OperatorBadge | null {
    const previousBadges = this.getUnlockedBadges(previousConsults)
    const newBadges = this.getUnlockedBadges(newConsults)

    if (newBadges.length > previousBadges.length) {
      return newBadges[newBadges.length - 1]
    }

    return null
  }
}
