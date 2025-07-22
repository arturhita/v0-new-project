export interface Reward {
  id: string
  name: string
  description: string
  type: "consultation" | "digital" | "experience" | "premium" | "custom"
  cost: number // in points
  category: string
  userType: "client" | "operator"
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

export const CLIENT_REWARDS: Reward[] = []
export const OPERATOR_REWARDS: Reward[] = [] // Added missing export

export const ALL_REWARDS = [...CLIENT_REWARDS, ...OPERATOR_REWARDS]

export class RewardsService {
  static getRewardsByUserType(userType: "client" | "operator"): Reward[] {
    return ALL_REWARDS.filter((reward) => reward.userType === userType && reward.isActive)
  }

  static async createReward(rewardData: Omit<Reward, "id" | "createdAt">): Promise<Reward> {
    const newReward: Reward = {
      ...rewardData,
      id: `reward_${Date.now()}`,
      createdAt: new Date(),
    }
    console.log("Creating reward:", newReward)
    return newReward
  }

  static async updateReward(rewardId: string, updates: Partial<Reward>): Promise<boolean> {
    console.log("Updating reward:", rewardId, updates)
    return true
  }

  static async deleteReward(rewardId: string): Promise<boolean> {
    console.log("Deleting reward:", rewardId)
    return true
  }

  static async getAllRewards(): Promise<Reward[]> {
    return ALL_REWARDS
  }

  static async canRedeemReward(userId: string, rewardId: string): Promise<boolean> {
    const reward = ALL_REWARDS.find((r) => r.id === rewardId)
    if (!reward || !reward.isActive) return false

    const userPoints = await import("./points-system").then((ps) => ps.PointsService.getUserPoints(userId))
    if (userPoints.availablePoints < reward.cost) return false

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

  static async redeemReward(userId: string, rewardId: string): Promise<boolean> {
    const canRedeem = await this.canRedeemReward(userId, rewardId)
    if (!canRedeem) return false

    const reward = ALL_REWARDS.find((r) => r.id === rewardId)
    if (!reward) return false

    const pointsSpent = await import("./points-system").then((ps) =>
      ps.PointsService.spendPoints(userId, reward.cost, `Reward: ${reward.name}`),
    )

    if (!pointsSpent) return false

    await this.applyReward(userId, reward)
    return true
  }

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

  static async getUserRewards(userId: string): Promise<any[]> {
    return []
  }
}

export const REWARDS_CATALOG = ALL_REWARDS
