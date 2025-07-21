"use server"

export interface MatchingCriteria {
  clientId: string
  preferredCategories: string[]
  maxPricePerMinute?: number
  minRating?: number
  preferredLanguages?: string[]
  previousOperators?: string[]
  urgency: "low" | "medium" | "high"
  consultationType: "chat" | "call" | "email"
}

export interface OperatorProfile {
  id: string
  name: string
  categories: string[]
  pricePerMinute: number
  rating: number
  languages: string[]
  isOnline: boolean
  currentLoad: number // 0-100%
  responseTime: number // in minutes
  successRate: number // 0-100%
  specialties: string[]
  experience: number // years
  lastActive: Date
}

export interface MatchScore {
  operatorId: string
  score: number
  reasons: string[]
  estimatedWaitTime: number
}

class MatchingAlgorithm {
  private operators = new Map<string, OperatorProfile>()
  private clientHistory = new Map<string, string[]>() // clientId -> operatorIds

  constructor() {
    this.initializeMockOperators()
  }

  private initializeMockOperators() {
    const mockOperators: OperatorProfile[] = [
      {
        id: "op1",
        name: "Luna Stellare",
        categories: ["Cartomanzia", "Tarocchi", "Amore"],
        pricePerMinute: 2.5,
        rating: 4.9,
        languages: ["it", "en"],
        isOnline: true,
        currentLoad: 30,
        responseTime: 2,
        successRate: 95,
        specialties: ["Tarocchi Evolutivi", "Relazioni"],
        experience: 15,
        lastActive: new Date(),
      },
      {
        id: "op2",
        name: "Maestro Cosmos",
        categories: ["Astrologia", "Tema Natale", "Transiti"],
        pricePerMinute: 3.2,
        rating: 4.8,
        languages: ["it"],
        isOnline: true,
        currentLoad: 60,
        responseTime: 5,
        successRate: 92,
        specialties: ["Astrologia Karmica", "Previsioni"],
        experience: 20,
        lastActive: new Date(),
      },
      {
        id: "op3",
        name: "Sage Aurora",
        categories: ["Cartomanzia", "Sibille", "Futuro"],
        pricePerMinute: 2.6,
        rating: 4.8,
        languages: ["it", "fr"],
        isOnline: false,
        currentLoad: 0,
        responseTime: 15,
        successRate: 88,
        specialties: ["Sibille Lenormand", "Previsioni Future"],
        experience: 12,
        lastActive: new Date(Date.now() - 30 * 60 * 1000), // 30 min ago
      },
    ]

    mockOperators.forEach((op) => this.operators.set(op.id, op))
  }

  findBestMatches(criteria: MatchingCriteria): MatchScore[] {
    const availableOperators = Array.from(this.operators.values())
    const scores: MatchScore[] = []

    for (const operator of availableOperators) {
      const score = this.calculateMatchScore(operator, criteria)
      if (score.score > 0) {
        scores.push(score)
      }
    }

    // Ordina per punteggio decrescente
    return scores.sort((a, b) => b.score - a.score)
  }

  private calculateMatchScore(operator: OperatorProfile, criteria: MatchingCriteria): MatchScore {
    let score = 0
    const reasons: string[] = []

    // 1. Compatibilità categorie (peso: 30%)
    const categoryMatch = this.calculateCategoryMatch(operator.categories, criteria.preferredCategories)
    score += categoryMatch * 30
    if (categoryMatch > 0.7) reasons.push("Specializzazione perfetta")

    // 2. Prezzo (peso: 20%)
    if (!criteria.maxPricePerMinute || operator.pricePerMinute <= criteria.maxPricePerMinute) {
      const priceScore = criteria.maxPricePerMinute
        ? 1 - (operator.pricePerMinute / criteria.maxPricePerMinute) * 0.5
        : 0.8
      score += priceScore * 20
      if (operator.pricePerMinute <= (criteria.maxPricePerMinute || 5)) {
        reasons.push("Prezzo conveniente")
      }
    }

    // 3. Rating (peso: 15%)
    if (!criteria.minRating || operator.rating >= criteria.minRating) {
      score += (operator.rating / 5) * 15
      if (operator.rating >= 4.5) reasons.push("Altamente valutato")
    }

    // 4. Disponibilità (peso: 15%)
    if (operator.isOnline) {
      const loadScore = 1 - operator.currentLoad / 100
      score += loadScore * 15
      if (operator.currentLoad < 50) reasons.push("Subito disponibile")
    } else if (criteria.urgency === "low") {
      score += 5 // Penalità ridotta per urgenza bassa
    }

    // 5. Tempo di risposta (peso: 10%)
    const responseScore = Math.max(0, 1 - operator.responseTime / 30)
    score += responseScore * 10
    if (operator.responseTime <= 5) reasons.push("Risposta rapida")

    // 6. Storico cliente (peso: 10%)
    const clientHistory = this.clientHistory.get(criteria.clientId) || []
    if (clientHistory.includes(operator.id)) {
      score += 10 // Bonus per operatori già utilizzati con successo
      reasons.push("Già consultato con successo")
    } else if (criteria.previousOperators?.includes(operator.id)) {
      score -= 5 // Penalità se specificatamente evitato
    }

    // Bonus per esperienza
    if (operator.experience >= 10) {
      score += 5
      reasons.push("Molto esperto")
    }

    // Bonus per tasso di successo
    if (operator.successRate >= 90) {
      score += 5
      reasons.push("Alto tasso di successo")
    }

    // Calcola tempo di attesa stimato
    const estimatedWaitTime = operator.isOnline
      ? Math.max(1, operator.responseTime + operator.currentLoad / 10)
      : Math.max(15, operator.responseTime)

    return {
      operatorId: operator.id,
      score: Math.max(0, score),
      reasons,
      estimatedWaitTime,
    }
  }

  private calculateCategoryMatch(operatorCategories: string[], preferredCategories: string[]): number {
    if (preferredCategories.length === 0) return 0.5

    const matches = preferredCategories.filter((pref) =>
      operatorCategories.some(
        (opCat) => opCat.toLowerCase().includes(pref.toLowerCase()) || pref.toLowerCase().includes(opCat.toLowerCase()),
      ),
    )

    return matches.length / preferredCategories.length
  }

  updateOperatorStatus(operatorId: string, updates: Partial<OperatorProfile>) {
    const operator = this.operators.get(operatorId)
    if (operator) {
      Object.assign(operator, updates)
      this.operators.set(operatorId, operator)
    }
  }

  recordSuccessfulConsultation(clientId: string, operatorId: string) {
    const history = this.clientHistory.get(clientId) || []
    if (!history.includes(operatorId)) {
      history.push(operatorId)
      this.clientHistory.set(clientId, history)
    }
  }

  getOperatorProfile(operatorId: string): OperatorProfile | null {
    return this.operators.get(operatorId) || null
  }

  getAllOperators(): OperatorProfile[] {
    return Array.from(this.operators.values())
  }
}

export const matchingAlgorithm = new MatchingAlgorithm()
