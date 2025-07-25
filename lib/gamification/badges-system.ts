export interface UserBadge {
  id: string
  userId: string
  badgeId: string
  unlockedAt: Date
  progress?: number
  metadata?: any
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  category: "consultation" | "loyalty" | "social" | "achievement" | "special"
  rarity: "common" | "rare" | "epic" | "legendary"
  requirements: any
  reward?: {
    points: number
    discount?: number
    specialAccess?: string
  }
  isActive: boolean
}

export const BADGES_CATALOG: Badge[] = [
  {
    id: "first_steps",
    name: "Primi Passi",
    description: "Completa il tuo primo consulto",
    icon: "👶",
    category: "consultation",
    rarity: "common",
    requirements: { consultations: 1 },
    reward: { points: 50 },
    isActive: true,
  },
  {
    id: "experienced",
    name: "Esperto",
    description: "Completa 10 consulti",
    icon: "🎓",
    category: "consultation",
    rarity: "rare",
    requirements: { consultations: 10 },
    reward: { points: 100, discount: 5 },
    isActive: true,
  },
  {
    id: "master",
    name: "Maestro",
    description: "Completa 50 consulti",
    icon: "🧙‍♂️",
    category: "consultation",
    rarity: "epic",
    requirements: { consultations: 50 },
    reward: { points: 250, discount: 10 },
    isActive: true,
  },
  {
    id: "legend",
    name: "Leggenda",
    description: "Completa 100 consulti",
    icon: "👑",
    category: "consultation",
    rarity: "legendary",
    requirements: { consultations: 100 },
    reward: { points: 500, discount: 15, specialAccess: "vip" },
    isActive: true,
  },
  {
    id: "loyal_user",
    name: "Utente Fedele",
    description: "Login per 30 giorni consecutivi",
    icon: "💎",
    category: "loyalty",
    rarity: "rare",
    requirements: { streak: 30 },
    reward: { points: 200 },
    isActive: true,
  },
  {
    id: "social_butterfly",
    name: "Farfalla Sociale",
    description: "Condividi 10 volte sui social",
    icon: "🦋",
    category: "social",
    rarity: "common",
    requirements: { shares: 10 },
    reward: { points: 75 },
    isActive: true,
  },
  {
    id: "reviewer",
    name: "Recensore",
    description: "Scrivi 25 recensioni",
    icon: "⭐",
    category: "social",
    rarity: "rare",
    requirements: { reviews: 25 },
    reward: { points: 150 },
    isActive: true,
  },
  {
    id: "perfectionist",
    name: "Perfezionista",
    description: "Ricevi 10 recensioni a 5 stelle",
    icon: "🌟",
    category: "achievement",
    rarity: "epic",
    requirements: { fiveStarReviews: 10 },
    reward: { points: 300 },
    isActive: true,
  },
]

export class BadgesService {
  static async getUserBadges(userId: string): Promise<UserBadge[]> {
    // Simulazione - in produzione da database
    return [
      {
        id: "ub1",
        userId,
        badgeId: "first_steps",
        unlockedAt: new Date(Date.now() - 86400000 * 7),
        progress: 100,
      },
      {
        id: "ub2",
        userId,
        badgeId: "loyal_user",
        unlockedAt: new Date(Date.now() - 86400000 * 3),
        progress: 100,
      },
      {
        id: "ub3",
        userId,
        badgeId: "social_butterfly",
        unlockedAt: new Date(Date.now() - 86400000 * 1),
        progress: 100,
      },
    ]
  }

  static async checkBadgeProgress(userId: string, badgeId: string): Promise<number> {
    // Calcola progresso badge
    const badge = BADGES_CATALOG.find((b) => b.id === badgeId)
    if (!badge) return 0

    // Simulazione progresso
    return Math.floor(Math.random() * 100)
  }

  static async unlockBadge(userId: string, badgeId: string): Promise<boolean> {
    const badge = BADGES_CATALOG.find((b) => b.id === badgeId)
    if (!badge) return false

    // Verifica requisiti
    const meetsRequirements = await this.checkRequirements(userId, badge.requirements)
    if (!meetsRequirements) return false

    // Sblocca badge
    const userBadge: UserBadge = {
      id: `ub_${Date.now()}`,
      userId,
      badgeId,
      unlockedAt: new Date(),
      progress: 100,
    }

    // Salva nel database
    console.log("Badge unlocked:", userBadge)

    // Assegna reward
    if (badge.reward) {
      if (badge.reward.points) {
        await import("./points-system").then(({ PointsService }) =>
          PointsService.addPoints(userId, "badge_unlocked", { badgeId }),
        )
      }
    }

    return true
  }

  private static async checkRequirements(userId: string, requirements: any): Promise<boolean> {
    // Verifica requisiti badge
    return true
  }

  static async getAvailableBadges(userId: string): Promise<Badge[]> {
    const userBadges = await this.getUserBadges(userId)
    const unlockedIds = userBadges.map((ub) => ub.badgeId)

    return BADGES_CATALOG.filter((badge) => badge.isActive && !unlockedIds.includes(badge.id))
  }
}
