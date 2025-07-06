// Sistema di storage condiviso per i dati mock degli operatori

export interface Operator {
  id: string
  name: string
  stageName: string
  discipline: string
  status: "Attivo" | "In Attesa" | "Sospeso"
  commission: string
  joined: string
  email?: string
  phone?: string
  description?: string
  isActive?: boolean
}

// Dati iniziali degli operatori
const initialOperators: Operator[] = [
  {
    id: "master1",
    name: "Elara Luna",
    stageName: "Stella Divina",
    discipline: "Tarocchi",
    status: "Attivo",
    commission: "15%",
    joined: "2025-05-20",
    email: "stella@unveilly.com",
    phone: "+39 123 456 7890",
    description: "Esperta in lettura dei tarocchi con oltre 10 anni di esperienza.",
    isActive: true,
  },
  {
    id: "master2",
    name: "Orion Astro",
    stageName: "Oracolo Celeste",
    discipline: "Astrologia",
    status: "Attivo",
    commission: "15%",
    joined: "2025-04-10",
    email: "oracolo@unveilly.com",
    phone: "+39 123 456 7891",
    description: "Astrologo esperto in temi natali e transiti planetari.",
    isActive: true,
  },
  {
    id: "master3",
    name: "Seraphina Numeris",
    stageName: "Seraphina dei Numeri",
    discipline: "Numerologia",
    status: "In Attesa",
    commission: "N/A",
    joined: "2025-06-18",
    email: "seraphina@unveilly.com",
    phone: "+39 123 456 7892",
    description: "Numerologa che svela i segreti nascosti nei numeri.",
    isActive: false,
  },
  {
    id: "master4",
    name: "Rune Master Kael",
    stageName: "Kael il Runico",
    discipline: "Rune",
    status: "Sospeso",
    commission: "20%",
    joined: "2025-03-01",
    email: "kael@unveilly.com",
    phone: "+39 123 456 7893",
    description: "Maestro delle antiche rune norrene.",
    isActive: false,
  },
]

// Chiave per localStorage
const OPERATORS_STORAGE_KEY = "unveilly_operators"

// Funzioni per gestire gli operatori
export function getAllOperators(): Operator[] {
  if (typeof window === "undefined") return initialOperators

  try {
    const stored = localStorage.getItem(OPERATORS_STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error("Errore nel caricamento operatori:", error)
  }

  // Se non ci sono dati salvati, usa quelli iniziali
  localStorage.setItem(OPERATORS_STORAGE_KEY, JSON.stringify(initialOperators))
  return initialOperators
}

export function getOperatorById(id: string): Operator | null {
  const operators = getAllOperators()
  return operators.find((op) => op.id === id) || null
}

export function updateOperator(id: string, updates: Partial<Operator>): boolean {
  if (typeof window === "undefined") return false

  try {
    const operators = getAllOperators()
    const index = operators.findIndex((op) => op.id === id)

    if (index === -1) return false

    // Aggiorna l'operatore
    operators[index] = { ...operators[index], ...updates }

    // Salva in localStorage
    localStorage.setItem(OPERATORS_STORAGE_KEY, JSON.stringify(operators))

    // Invia evento per notificare l'aggiornamento
    window.dispatchEvent(
      new CustomEvent("operatorUpdated", {
        detail: { operatorId: id, operator: operators[index] },
      }),
    )

    return true
  } catch (error) {
    console.error("Errore nell'aggiornamento operatore:", error)
    return false
  }
}

export function updateOperatorCommission(id: string, commission: number): boolean {
  return updateOperator(id, { commission: `${commission}%` })
}

// Funzione per resettare i dati (utile per test)
export function resetOperators(): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(OPERATORS_STORAGE_KEY, JSON.stringify(initialOperators))
    window.dispatchEvent(new CustomEvent("operatorsReset"))
  }
}
