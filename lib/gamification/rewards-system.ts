export interface Reward {
  id: string
  name: string
  description: string
  type: "consultation" | "digital" | "experience" | "premium" | "custom"
  cost: number // in points
  category: string
  userType: "client"
  availability: number // -1 = unlimited
  validityDays?: number
  requirements?: {
    minLevel?: number
    minConsults?: number
    badges?: string[]
  }
  isActive: boolean
  isFeatured: boolean
  createdBy: "admin"
  createdAt: Date
  image?: string
}

// SOLO REWARDS PER CLIENTI - Gli operatori hanno i badge come "rewards"
export const CLIENT_REWARDS: Reward[] = []

export const ALL_REWARDS = CLIENT_REWARDS

export class RewardsService {
  // Ottieni rewards per clienti
  static getRewardsByUserType(): Reward[] {
    return ALL_REWARDS.filter((reward) => reward.userType === "client" && reward.isActive)
  }

  // CRUD Operations per Admin
  static async createReward(rewardData: Omit<Reward, "id" | "createdAt">): Promise<Reward> {
    const newReward: Reward = {
      ...rewardData,
      id: `reward_${Date.now()}`,
      createdAt: new Date(),
    }

    // In produzione: salvare nel database
    console.log("Creating reward:", newReward)
    return newReward
  }

  static async updateReward(rewardId: string, updates: Partial<Reward>): Promise<boolean> {
    // In produzione: aggiornare nel database
    console.log("Updating reward:", rewardId, updates)
    return true
  }

  static async deleteReward(rewardId: string): Promise<boolean> {
    // In produzione: eliminare dal database
    console.log("Deleting reward:", rewardId)
    return true
  }

  static async getAllRewards(): Promise<Reward[]> {
    // In produzione: recuperare dal database
    return ALL_REWARDS
  }

  // Verifica se utente può riscattare reward
  static async canRedeemReward(userId: string, rewardId: string): Promise<boolean> {
    const reward = ALL_REWARDS.find((r) => r.id === rewardId)
    if (!reward || !reward.isActive) return false

    // Verifica punti disponibili
    const userPoints = await import("./points-system").then((ps) => ps.PointsService.getUserPoints(userId))
    if (userPoints.availablePoints < reward.cost) return false

    // Verifica requisiti
    if (reward.requirements) {
      if (reward.requirements.minLevel && userPoints.level < reward.requirements.minLevel) return false

      if (reward.requirements.badges) {
        const userBadges = await import("./badges-system").then((bs) => bs.BadgesService.getUserBadges(userId))
        const userBadgeIds = userBadges.map((ub) => ub.badgeId)
        const hasAllBadges = reward.requirements.badges.every((badgeId) => userBadgeIds.includes(badgeId))
        if (!hasAllBadges) return false
      }
    }

    return true
  }

  // Riscatta reward
  static async redeemReward(userId: string, rewardId: string): Promise<boolean> {
    const canRedeem = await this.canRedeemReward(userId, rewardId)
    if (!canRedeem) return false

    const reward = ALL_REWARDS.find((r) => r.id === rewardId)
    if (!reward) return false

    // Spendi punti
    const pointsSpent = await import("./points-system").then((ps) =>
      ps.PointsService.spendPoints(userId, reward.cost, `Reward: ${reward.name}`),
    )

    if (!pointsSpent) return false

    // Applica reward
    await this.applyReward(userId, reward)
    return true
  }

  // Applica effetti del reward
  private static async applyReward(userId: string, reward: Reward): Promise<void> {
    switch (reward.type) {
      case "consultation":
        console.log(`Applied free consultation: ${reward.name} for user ${userId}`)
        break
      case "digital":
        console.log(`Unlocked digital content: ${reward.name} for user ${userId}`)
        break
      case "premium":
        console.log(`Activated premium feature: ${reward.name} for user ${userId}`)
        break
      case "experience":
        console.log(`Registered for experience: ${reward.name} for user ${userId}`)
        break
      case "custom":
        console.log(`Applied custom reward: ${reward.name} for user ${userId}`)
        break
    }
  }

  // Ottieni rewards riscattati dall'utente
  static async getUserRewards(userId: string): Promise<any[]> {
    // Simulazione - in produzione da database
    return []
  }
}

// Export per compatibilità
export const REWARDS_CATALOG = ALL_REWARDS
