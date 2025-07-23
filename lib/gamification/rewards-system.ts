export interface Reward {
  id: string
  name: string
  description: string
  type: "consultation" | "digital" | "experience" | "premium" | "custom"
  cost: number
  category: string
  userType: "client" | "operator"
  availability: number
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

export const OPERATOR_REWARDS: Reward[] = [
  {
    id: "LEVEL_UP",
    name: "Level Up",
    description: "Avanzamento di livello",
    type: "experience",
    cost: 0,
    category: "Level",
    userType: "operator",
    availability: 1,
    isActive: true,
    isFeatured: false,
    createdBy: "admin",
    createdAt: new Date(),
    points: 100,
  },
  {
    id: "FIRST_CONSULTATION",
    name: "First Consultation",
    description: "Prima consulenza completata",
    type: "experience",
    cost: 0,
    category: "Consultation",
    userType: "operator",
    availability: 1,
    isActive: true,
    isFeatured: false,
    createdBy: "admin",
    createdAt: new Date(),
    points: 50,
    badge: "first_consultation",
  },
  {
    id: "POSITIVE_REVIEW",
    name: "Positive Review",
    description: "Ricevuta una recensione positiva (4+ stelle)",
    type: "experience",
    cost: 0,
    category: "Review",
    userType: "operator",
    availability: 1,
    isActive: true,
    isFeatured: false,
    createdBy: "admin",
    createdAt: new Date(),
    points: 20,
  },
]

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
    return newReward
  }

  static async updateReward(rewardId: string, updates: Partial<Reward>): Promise<boolean> {
    return true
  }

  static async deleteReward(rewardId: string): Promise<boolean> {
    return true
  }

  static async getAllRewards(): Promise<Reward[]> {
    return ALL_REWARDS
  }

  static async canRedeemReward(userId: string, rewardId: string): Promise<boolean> {
    return true
  }

  static async redeemReward(userId: string, rewardId: string): Promise<boolean> {
    return true
  }

  private static async applyReward(userId: string, reward: Reward): Promise<void> {
    console.log(`Applied reward: ${reward.name} for user ${userId}`)
  }

  static async getUserRewards(userId: string): Promise<any[]> {
    return []
  }
}

export const REWARDS_CATALOG = ALL_REWARDS
