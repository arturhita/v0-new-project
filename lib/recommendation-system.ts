"use server"

import { matchingAlgorithm, type OperatorProfile } from "./matching-algorithm" // Assuming matchingAlgorithm and OperatorProfile are declared in another file

export interface UserBehavior {
  clientId: string
  consultationHistory: {
    operatorId: string
    category: string
    rating: number
    duration: number
    timestamp: Date
  }[]
  searchHistory: string[]
  favoriteOperators: string[]
  preferredTimeSlots: string[]
  averageSessionDuration: number
  totalSpent: number
}

export interface Recommendation {
  type: "operator" | "category" | "time_slot" | "promotion"
  title: string
  description: string
  confidence: number // 0-100%
  operatorId?: string
  category?: string
  reason: string
  priority: "low" | "medium" | "high"
}

class RecommendationSystem {
  private userBehaviors = new Map<string, UserBehavior>()
  private operatorSimilarity = new Map<string, Map<string, number>>()

  constructor() {
    this.initializeMockData()
  }

  private initializeMockData() {
    // Mock user behaviors
    const mockBehaviors: UserBehavior[] = [
      {
        clientId: "user1",
        consultationHistory: [
          {
            operatorId: "op1",
            category: "Tarocchi",
            rating: 5,
            duration: 1800,
            timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
          {
            operatorId: "op2",
            category: "Astrologia",
            rating: 4,
            duration: 2400,
            timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          },
        ],
        searchHistory: ["tarocchi amore", "oroscopo", "futuro sentimentale"],
        favoriteOperators: ["op1"],
        preferredTimeSlots: ["evening", "weekend"],
        averageSessionDuration: 2100,
        totalSpent: 125.5,
      },
    ]

    mockBehaviors.forEach((behavior) => {
      this.userBehaviors.set(behavior.clientId, behavior)
    })

    this.calculateOperatorSimilarity()
  }

  private calculateOperatorSimilarity() {
    const operators = matchingAlgorithm.getAllOperators()

    for (const op1 of operators) {
      const similarities = new Map<string, number>()

      for (const op2 of operators) {
        if (op1.id !== op2.id) {
          const similarity = this.calculateSimilarity(op1, op2)
          similarities.set(op2.id, similarity)
        }
      }

      this.operatorSimilarity.set(op1.id, similarities)
    }
  }

  private calculateSimilarity(op1: OperatorProfile, op2: OperatorProfile): number {
    let similarity = 0

    // Categorie in comune
    const commonCategories = op1.categories.filter((cat) => op2.categories.includes(cat))
    similarity += (commonCategories.length / Math.max(op1.categories.length, op2.categories.length)) * 40

    // Differenza di prezzo
    const priceDiff = Math.abs(op1.pricePerMinute - op2.pricePerMinute)
    const priceScore = Math.max(0, 1 - priceDiff / 5) * 20
    similarity += priceScore

    // Rating simile
    const ratingDiff = Math.abs(op1.rating - op2.rating)
    const ratingScore = Math.max(0, 1 - ratingDiff) * 20
    similarity += ratingScore

    // Specialità in comune
    const commonSpecialties = op1.specialties.filter((spec) => op2.specialties.includes(spec))
    similarity += (commonSpecialties.length / Math.max(op1.specialties.length, op2.specialties.length)) * 20

    return similarity
  }

  generateRecommendations(clientId: string): Recommendation[] {
    const behavior = this.userBehaviors.get(clientId)
    if (!behavior) return this.getDefaultRecommendations()

    const recommendations: Recommendation[] = []

    // 1. Raccomandazioni basate su operatori simili
    recommendations.push(...this.getOperatorRecommendations(behavior))

    // 2. Raccomandazioni di categoria
    recommendations.push(...this.getCategoryRecommendations(behavior))

    // 3. Raccomandazioni temporali
    recommendations.push(...this.getTimeRecommendations(behavior))

    // 4. Raccomandazioni promozionali
    recommendations.push(...this.getPromotionalRecommendations(behavior))

    // Ordina per priorità e confidenza
    return recommendations
      .sort((a, b) => {
        const priorityWeight = { high: 3, medium: 2, low: 1 }
        const aPriority = priorityWeight[a.priority]
        const bPriority = priorityWeight[b.priority]

        if (aPriority !== bPriority) return bPriority - aPriority
        return b.confidence - a.confidence
      })
      .slice(0, 10) // Top 10 raccomandazioni
  }

  private getOperatorRecommendations(behavior: UserBehavior): Recommendation[] {
    const recommendations: Recommendation[] = []

    // Trova operatori simili a quelli già consultati con successo
    const highRatedOperators = behavior.consultationHistory.filter((h) => h.rating >= 4).map((h) => h.operatorId)

    for (const operatorId of highRatedOperators) {
      const similarities = this.operatorSimilarity.get(operatorId)
      if (similarities) {
        const sortedSimilar = Array.from(similarities.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)

        for (const [similarOpId, similarity] of sortedSimilar) {
          const operator = matchingAlgorithm.getOperatorProfile(similarOpId)
          if (operator && similarity > 60) {
            recommendations.push({
              type: "operator",
              title: `Ti potrebbe piacere ${operator.name}`,
              description: `Simile a ${matchingAlgorithm.getOperatorProfile(operatorId)?.name}, specializzato in ${operator.categories.join(", ")}`,
              confidence: similarity,
              operatorId: similarOpId,
              reason: "Basato sui tuoi consulti precedenti",
              priority: similarity > 80 ? "high" : "medium",
            })
          }
        }
      }
    }

    return recommendations
  }

  private getCategoryRecommendations(behavior: UserBehavior): Recommendation[] {
    const recommendations: Recommendation[] = []

    // Analizza categorie più utilizzate
    const categoryFrequency = new Map<string, number>()
    behavior.consultationHistory.forEach((h) => {
      categoryFrequency.set(h.category, (categoryFrequency.get(h.category) || 0) + 1)
    })

    // Raccomanda categorie correlate
    const categoryCorrelations = new Map([
      ["Tarocchi", ["Cartomanzia", "Sibille", "Oracoli"]],
      ["Astrologia", ["Numerologia", "Tema Natale", "Transiti"]],
      ["Cartomanzia", ["Tarocchi", "Rune", "Cristalli"]],
    ])

    for (const [category, frequency] of categoryFrequency) {
      const related = categoryCorrelations.get(category) || []
      for (const relatedCategory of related) {
        if (!categoryFrequency.has(relatedCategory)) {
          recommendations.push({
            type: "category",
            title: `Esplora ${relatedCategory}`,
            description: `Dato il tuo interesse per ${category}, potresti apprezzare ${relatedCategory}`,
            confidence: frequency * 20,
            category: relatedCategory,
            reason: "Categorie correlate ai tuoi interessi",
            priority: "medium",
          })
        }
      }
    }

    return recommendations
  }

  private getTimeRecommendations(behavior: UserBehavior): Recommendation[] {
    const recommendations: Recommendation[] = []

    if (behavior.preferredTimeSlots.includes("evening")) {
      recommendations.push({
        type: "time_slot",
        title: "Consulenze serali disponibili",
        description: "I tuoi operatori preferiti sono spesso disponibili la sera",
        confidence: 75,
        reason: "Basato sui tuoi orari preferiti",
        priority: "low",
      })
    }

    return recommendations
  }

  private getPromotionalRecommendations(behavior: UserBehavior): Recommendation[] {
    const recommendations: Recommendation[] = []

    if (behavior.totalSpent > 100) {
      recommendations.push({
        type: "promotion",
        title: "Sconto VIP disponibile",
        description: "Come cliente fedele, hai diritto a uno sconto del 15%",
        confidence: 90,
        reason: "Cliente fedele",
        priority: "high",
      })
    }

    if (behavior.consultationHistory.length >= 5) {
      recommendations.push({
        type: "promotion",
        title: "Consulenza gratuita",
        description: "Dopo 5 consulenze, la prossima è in regalo!",
        confidence: 100,
        reason: "Programma fedeltà",
        priority: "high",
      })
    }

    return recommendations
  }

  private getDefaultRecommendations(): Recommendation[] {
    return [
      {
        type: "operator",
        title: "Inizia con Luna Stellare",
        description: "Operatore più popolare per nuovi utenti",
        confidence: 80,
        operatorId: "op1",
        reason: "Raccomandazione per nuovi utenti",
        priority: "medium",
      },
      {
        type: "category",
        title: "Prova i Tarocchi",
        description: "La categoria più richiesta dai nostri utenti",
        confidence: 70,
        category: "Tarocchi",
        reason: "Categoria popolare",
        priority: "medium",
      },
    ]
  }

  updateUserBehavior(
    clientId: string,
    consultation: {
      operatorId: string
      category: string
      rating: number
      duration: number
    },
  ) {
    let behavior = this.userBehaviors.get(clientId)

    if (!behavior) {
      behavior = {
        clientId,
        consultationHistory: [],
        searchHistory: [],
        favoriteOperators: [],
        preferredTimeSlots: [],
        averageSessionDuration: 0,
        totalSpent: 0,
      }
    }

    behavior.consultationHistory.push({
      ...consultation,
      timestamp: new Date(),
    })

    // Aggiorna media durata sessioni
    const totalDuration = behavior.consultationHistory.reduce((sum, h) => sum + h.duration, 0)
    behavior.averageSessionDuration = totalDuration / behavior.consultationHistory.length

    // Aggiorna operatori preferiti
    if (consultation.rating >= 4 && !behavior.favoriteOperators.includes(consultation.operatorId)) {
      behavior.favoriteOperators.push(consultation.operatorId)
    }

    this.userBehaviors.set(clientId, behavior)
  }

  addSearchQuery(clientId: string, query: string) {
    const behavior = this.userBehaviors.get(clientId)
    if (behavior) {
      behavior.searchHistory.push(query)
      // Mantieni solo le ultime 20 ricerche
      if (behavior.searchHistory.length > 20) {
        behavior.searchHistory = behavior.searchHistory.slice(-20)
      }
      this.userBehaviors.set(clientId, behavior)
    }
  }
}

export const recommendationSystem = new RecommendationSystem()
