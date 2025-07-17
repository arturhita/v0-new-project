// Sistema di storage condiviso per i dati mock degli operatori

// Helper per creare URL-friendly slugs
const slugify = (text: string) =>
  text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w-]+/g, "") // Remove all non-word chars
    .replace(/--+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, "") // Trim - from end of text

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
    stageName: "Luna Stellare", // AGGIORNATO per corrispondere al tuo test
    discipline: "Tarocchi",
    status: "Attivo",
    commission: "15%",
    joined: "2025-05-20",
    email: "stella@unveilly.com",
    phone: "+39 123 456 7890",
    description:
      "Esperta in lettura dei tarocchi con oltre 10 anni di esperienza nel campo dell'amore e delle relazioni. La mia missione è guidarti verso la chiarezza e la serenità.",
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
    description: "Astrologo esperto in temi natali e transiti planetari. Scopri cosa hanno in serbo le stelle per te.",
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
    description: "Numerologa che svela i segreti nascosti nei numeri e il loro impatto sulla tua vita.",
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
    description: "Maestro delle antiche rune norrene, interpreto i loro messaggi per offrirti guida e saggezza.",
    isActive: false,
  },
]

// Funzione per generare un profilo mock completo
export function getMockOperatorProfileByStageName(stageName: string) {
  const searchSlug = slugify(stageName)
  console.log(`[MOCK-DATA] Searching for operator with slug: "${searchSlug}"`)

  const operator = initialOperators.find((op) => slugify(op.stageName) === searchSlug)

  if (!operator) {
    console.error(`[MOCK-DATA] Operator with slug "${searchSlug}" not found in initialOperators.`)
    return null
  }

  if (operator.status !== "Attivo") {
    console.warn(
      `[MOCK-DATA] Operator "${operator.name}" found, but status is "${operator.status}". Profile not shown.`,
    )
    return null
  }

  console.log(`[MOCK-DATA] Found active operator: "${operator.name}". Generating full profile.`)

  // Se trovato, costruisce il profilo completo con dati mock aggiuntivi
  return {
    id: operator.id,
    full_name: operator.name,
    stage_name: operator.stageName,
    avatar_url: `/images/mystical-moon.png`, // Usa un'immagine esistente come placeholder
    specialization: [operator.discipline],
    bio: operator.description,
    rating: 4.8,
    reviews_count: 123,
    is_online: operator.isActive,
    tags: [operator.discipline, "Amore", "Lavoro", "Fortuna"],
    services: [
      { service_type: "chat", price: 2.5 },
      { service_type: "call", price: 3.0 },
      { service_type: "written", price: 25.0 },
    ],
    availability: {
      monday: [
        { start: "10:00", end: "12:00" },
        { start: "15:00", end: "18:00" },
      ],
      tuesday: [],
      wednesday: [{ start: "10:00", end: "18:00" }],
      thursday: [{ start: "14:00", end: "19:00" }],
      friday: [{ start: "10:00", end: "12:00" }],
      saturday: [{ start: "11:00", end: "13:00" }],
      sunday: [],
    },
    reviews: [
      {
        id: "rev1",
        user_name: "Marco R.",
        rating: 5,
        comment: "Consulto eccezionale, mi ha aperto gli occhi su molte cose. Consigliatissima!",
        created_at: new Date().toISOString(),
      },
      {
        id: "rev2",
        user_name: "Giulia B.",
        rating: 5,
        comment: "Precisa, empatica e molto professionale. Tornerò sicuramente.",
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
  }
}

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
