export interface LeaderboardEntry {
  userId: string
  username: string
  avatar?: string
  score: number
  rank: number
  change: number // +1, -1, 0 per cambio posizione
  badge?: string
  level: number
  isCurrentUser?: boolean
}

export interface LeaderboardConfig {
  id: string
  name: string
  description: string
  type: "points" | "consultations" | "ratings" | "reviews" | "streak"
  period: "daily" | "weekly" | "monthly" | "all-time"
  userType: "client" | "operator" | "all"
  icon: string
  rewards?: {
    rank1: { points: number; badge?: string }
    rank2: { points: number; badge?: string }
    rank3: { points: number; badge?: string }
    top10: { points: number }
  }
}

// Configurazioni leaderboard
export const LEADERBOARDS_CONFIG: LeaderboardConfig[] = [
  // Client Leaderboards
  {
    id: "clients_points_monthly",
    name: "Top Cercatori del Mese",
    description: "Clienti con più punti questo mese",
    type: "points",
    period: "monthly",
    userType: "client",
    icon: "🏆",
    rewards: {
      rank1: { points: 1000, badge: "monthly_champion" },
      rank2: { points: 500, badge: "monthly_runner_up" },
      rank3: { points: 250, badge: "monthly_third" },
      top10: { points: 100 },
    },
  },
  {
    id: "clients_consultations_monthly",
    name: "Più Attivi del Mese",
    description: "Clienti con più consulenze questo mese",
    type: "consultations",
    period: "monthly",
    userType: "client",
    icon: "💫",
    rewards: {
      rank1: { points: 800 },
      rank2: { points: 400 },
      rank3: { points: 200 },
      top10: { points: 50 },
    },
  },
  {
    id: "clients_streak_all_time",
    name: "Streak Leggendari",
    description: "Le streak di login più lunghe di sempre",
    type: "streak",
    period: "all-time",
    userType: "client",
    icon: "🔥",
    rewards: {
      rank1: { points: 2000, badge: "streak_legend" },
      rank2: { points: 1000 },
      rank3: { points: 500 },
      top10: { points: 100 },
    },
  },

  // Operator Leaderboards
  {
    id: "operators_ratings_monthly",
    name: "Maestri del Mese",
    description: "Operatori con rating più alto questo mese",
    type: "ratings",
    period: "monthly",
    userType: "operator",
    icon: "⭐",
    rewards: {
      rank1: { points: 1500, badge: "master_of_month" },
      rank2: { points: 750, badge: "excellent_operator" },
      rank3: { points: 375, badge: "skilled_advisor" },
      top10: { points: 150 },
    },
  },
  {
    id: "operators_consultations_monthly",
    name: "Più Richiesti del Mese",
    description: "Operatori con più consulenze questo mese",
    type: "consultations",
    period: "monthly",
    userType: "operator",
    icon: "👑",
    rewards: {
      rank1: { points: 1200 },
      rank2: { points: 600 },
      rank3: { points: 300 },
      top10: { points: 100 },
    },
  },
  {
    id: "operators_reviews_all_time",
    name: "Hall of Fame",
    description: "Operatori con più recensioni positive di sempre",
    type: "reviews",
    period: "all-time",
    userType: "operator",
    icon: "🌟",
    rewards: {
      rank1: { points: 5000, badge: "hall_of_fame" },
      rank2: { points: 2500, badge: "legendary_advisor" },
      rank3: { points: 1250, badge: "master_advisor" },
      top10: { points: 500 },
    },
  },
]

export class LeaderboardService {
  // Ottieni leaderboard
  static async getLeaderboard(leaderboardId: string, limit = 50): Promise<LeaderboardEntry[]> {
    const config = LEADERBOARDS_CONFIG.find((c) => c.id === leaderboardId)
    if (!config) return []

    // Simulazione dati - in produzione da database con query ottimizzate
    const mockData = this.generateMockLeaderboard(config, limit)

    return mockData.map((entry, index) => ({
      ...entry,
      rank: index + 1,
      change: Math.floor(Math.random() * 5) - 2, // -2 to +2
    }))
  }

  // Ottieni posizione utente
  static async getUserRank(leaderboardId: string, userId: string): Promise<LeaderboardEntry | null> {
    const leaderboard = await this.getLeaderboard(leaderboardId, 1000)
    return leaderboard.find((entry) => entry.userId === userId) || null
  }

  // Ottieni leaderboard con posizione utente
  static async getLeaderboardWithUser(
    leaderboardId: string,
    userId: string,
    topLimit = 10,
  ): Promise<{ top: LeaderboardEntry[]; user?: LeaderboardEntry; userContext?: LeaderboardEntry[] }> {
    const fullLeaderboard = await this.getLeaderboard(leaderboardId, 1000)
    const top = fullLeaderboard.slice(0, topLimit)
    const userEntry = fullLeaderboard.find((entry) => entry.userId === userId)

    let userContext: LeaderboardEntry[] = []
    if (userEntry && userEntry.rank > topLimit) {
      // Mostra 2 sopra e 2 sotto l'utente
      const startIndex = Math.max(0, userEntry.rank - 3)
      const endIndex = Math.min(fullLeaderboard.length, userEntry.rank + 2)
      userContext = fullLeaderboard.slice(startIndex, endIndex)
    }

    return {
      top,
      user: userEntry,
      userContext: userContext.length > 0 ? userContext : undefined,
    }
  }

  // Aggiorna punteggi leaderboard
  static async updateLeaderboardScore(
    userId: string,
    leaderboardType: LeaderboardConfig["type"],
    value: number,
  ): Promise<void> {
    // Implementazione aggiornamento punteggi
    console.log(`Updating ${leaderboardType} score for user ${userId}: +${value}`)
  }

  // Assegna premi leaderboard
  static async awardLeaderboardPrizes(leaderboardId: string): Promise<void> {
    const config = LEADERBOARDS_CONFIG.find((c) => c.id === leaderboardId)
    if (!config?.rewards) return

    const leaderboard = await this.getLeaderboard(leaderboardId, 10)

    for (const entry of leaderboard) {
      let reward: { points: number; badge?: string } | undefined

      if (entry.rank === 1) reward = config.rewards.rank1
      else if (entry.rank === 2) reward = config.rewards.rank2
      else if (entry.rank === 3) reward = config.rewards.rank3
      else if (entry.rank <= 10) reward = config.rewards.top10

      if (reward) {
        // Assegna punti
        if (reward.points) {
          await import("./points-system").then((ps) =>
            ps.PointsService.addPoints(entry.userId, "leaderboard_reward", {
              leaderboard: leaderboardId,
              rank: entry.rank,
              points: reward.points,
            }),
          )
        }

        // Assegna badge
        if (reward.badge) {
          await import("./badges-system").then((bs) =>
            bs.BadgesService.checkAndUnlockBadges(entry.userId, "leaderboard_badge", { badge: reward.badge }),
          )
        }
      }
    }
  }

  // Genera dati mock per sviluppo
  private static generateMockLeaderboard(
    config: LeaderboardConfig,
    limit: number,
  ): Omit<LeaderboardEntry, "rank" | "change">[] {
    const names = [
      "Stella Divina",
      "Luna Mystica",
      "Sole Radiante",
      "Vento Spirituale",
      "Acqua Cristallina",
      "Terra Madre",
      "Fuoco Sacro",
      "Aria Pura",
      "Luce Eterna",
      "Ombra Saggia",
      "Cristallo Magico",
      "Fiore Celeste",
      "Albero Antico",
      "Montagna Sacra",
      "Oceano Profondo",
    ]

    return Array.from({ length: Math.min(limit, names.length) }, (_, i) => ({
      userId: `user_${i + 1}`,
      username: names[i] || `Utente ${i + 1}`,
      avatar: `/placeholder.svg?height=40&width=40&text=${names[i]?.charAt(0) || "U"}`,
      score: Math.floor(Math.random() * 10000) + 1000 - i * 100,
      badge: i < 3 ? ["🥇", "🥈", "🥉"][i] : undefined,
      level: Math.floor(Math.random() * 7) + 1,
      isCurrentUser: i === 5, // Simula utente corrente alla posizione 6
    }))
  }

  // Ottieni statistiche leaderboard
  static async getLeaderboardStats(leaderboardId: string): Promise<{
    totalParticipants: number
    averageScore: number
    topScore: number
    lastUpdated: Date
  }> {
    const leaderboard = await this.getLeaderboard(leaderboardId, 1000)

    return {
      totalParticipants: leaderboard.length,
      averageScore: leaderboard.reduce((sum, entry) => sum + entry.score, 0) / leaderboard.length,
      topScore: leaderboard[0]?.score || 0,
      lastUpdated: new Date(),
    }
  }
}
