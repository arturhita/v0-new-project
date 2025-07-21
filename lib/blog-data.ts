// lib/blog-data.ts

// --- BLOG DATA ---
export interface BlogArticle {
  id: string
  slug: string
  title: string
  excerpt: string
  imageUrl: string
  category: string // slug of the category
  content: string
  author: string
  date: string
}

export interface BlogCategory {
  name: string
  slug: string
  description: string
  icon: string
  imageUrl: string
}

export const blogCategories: BlogCategory[] = [
  {
    name: "Astrologia",
    slug: "astrologia",
    description: "Approfondimenti sui segni, i pianeti e le case astrologiche.",
    icon: "✨",
    imageUrl: "/placeholder.svg?width=400&height=400",
  },
  {
    name: "Cartomanzia",
    slug: "cartomanzia",
    description: "Interpreta i tarocchi e gli oracoli per svelare il futuro.",
    icon: "🃏",
    imageUrl: "/placeholder.svg?width=400&height=400",
  },
  {
    name: "Numerologia",
    slug: "numerologia",
    description: "Scopri il potere dei numeri e il loro significato nella tua vita.",
    icon: "🔢",
    imageUrl: "/placeholder.svg?width=400&height=400",
  },
  {
    name: "Sogni",
    slug: "sogni",
    description: "Analizza i tuoi sogni per comprendere il tuo inconscio.",
    icon: "🌙",
    imageUrl: "/placeholder.svg?width=400&height=400",
  },
  {
    name: "Spiritualità",
    slug: "spiritualita",
    description: "Percorsi di crescita interiore, meditazione e benessere.",
    icon: "🧘",
    imageUrl: "/placeholder.svg?width=400&height=400",
  },
]

export const blogArticles: BlogArticle[] = [
  {
    id: "astro-1",
    slug: "segni-di-fuoco",
    title: "L'Energia Ardente dei Segni di Fuoco",
    excerpt: "Ariete, Leone e Sagittario: scopri la passione e il coraggio che li contraddistingue.",
    imageUrl: "/placeholder.svg?width=800&height=450",
    category: "astrologia",
    author: "Astrologo Stellare",
    date: "2024-07-20",
    content:
      "<p>I segni di Fuoco - Ariete, Leone e Sagittario - sono la personificazione dell'energia, della passione e della creatività. Governati dall'elemento più dinamico, questi segni irradiano calore, entusiasmo e una spinta inarrestabile verso l'azione.</p>",
  },
  {
    id: "num-1",
    slug: "numero-del-destino",
    title: "Calcola il Tuo Numero del Destino",
    excerpt: "Una guida per calcolare e interpretare il numero che svela la tua missione di vita.",
    imageUrl: "/placeholder.svg?width=800&height=450",
    category: "numerologia",
    author: "Numerologa Saggia",
    date: "2024-07-18",
    content:
      "<p>Il Numero del Destino, conosciuto anche come Numero del Percorso di Vita, è il numero più significativo nel tuo profilo numerologico. Si calcola a partire dalla tua data di nascita e rivela la strada che sei destinato a percorrere.</p>",
  },
  {
    id: "spirit-1",
    slug: "guida-ai-chakra",
    title: "I 7 Chakra: Guida all'Equilibrio Energetico",
    excerpt: "Scopri i centri energetici del tuo corpo e impara come armonizzarli.",
    imageUrl: "/placeholder.svg?width=800&height=450",
    category: "spiritualita",
    author: "Guru Ananda",
    date: "2024-07-15",
    content:
      "<p>La parola 'chakra' deriva dal sanscrito e significa 'ruota' o 'vortice'. I chakra sono centri energetici situati lungo la nostra colonna vertebrale, dal coccige alla sommità della testa.</p>",
  },
  {
    id: "astro-2",
    slug: "luna-nel-tema-natale",
    title: "La Luna nel Tema Natale: Emozioni e Inconscio",
    excerpt: "La posizione della Luna alla tua nascita rivela il tuo mondo interiore e i tuoi bisogni più profondi.",
    imageUrl: "/placeholder.svg?width=800&height=450",
    category: "astrologia",
    author: "Astrologo Stellare",
    date: "2024-07-22",
    content:
      "<p>In astrologia, la Luna è molto più di un satellite terrestre; è la guardiana del nostro mondo interiore. Rappresenta l'inconscio, le emozioni, gli istinti, la memoria e il rapporto con la figura materna.</p>",
  },
  {
    id: "carto-1",
    slug: "stesura-a-tre-carte",
    title: "La Stesura a Tre Carte: Passato, Presente, Futuro",
    excerpt: "Una delle stesure più semplici e potenti per ottenere risposte chiare dai tarocchi.",
    imageUrl: "/placeholder.svg?width=800&height=450",
    category: "cartomanzia",
    author: "Madame Zora",
    date: "2024-07-23",
    content: "<p>La stesura a tre carte è un metodo fondamentale nella cartomanzia...</p>",
  },
  {
    id: "sogni-1",
    slug: "sognare-di-volare",
    title: "Sognare di Volare: Significato e Interpretazioni",
    excerpt: "Cosa significa sognare di librarsi in aria? Scopri le interpretazioni psicologiche e spirituali.",
    imageUrl: "/placeholder.svg?width=800&height=450",
    category: "sogni",
    author: "Dr. Morpheus",
    date: "2024-07-21",
    content: "<p>Sognare di volare è una delle esperienze oniriche più comuni ed emozionanti...</p>",
  },
]

// --- ZODIAC DATA for Affinità di Coppia ---
export const zodiacSigns = [
  { nome: "Ariete", simbolo: "♈" },
  { nome: "Toro", simbolo: "♉" },
  { nome: "Gemelli", simbolo: "♊" },
  { nome: "Cancro", simbolo: "♋" },
  { nome: "Leone", simbolo: "♌" },
  { nome: "Vergine", simbolo: "♍" },
  { nome: "Bilancia", simbolo: "♎" },
  { nome: "Scorpione", simbolo: "♏" },
  { nome: "Sagittario", simbolo: "♐" },
  { nome: "Capricorno", simbolo: "♑" },
  { nome: "Acquario", simbolo: "♒" },
  { nome: "Pesci", simbolo: "♓" },
]

export const getCompatibility = (sign1: string, sign2: string): { score: number; analysis: string } => {
  if (sign1 === sign2) {
    return {
      score: 90,
      analysis:
        "L'intesa è forte e naturale, ma attenzione alla noia. La comprensione reciproca è alta, ma è importante mantenere viva la scintilla con nuove esperienze.",
    }
  }
  // Simple logic for demonstration
  const hash = (s: string) => s.split("").reduce((a, b) => a + b.charCodeAt(0), 0)
  const score = (hash(sign1) + hash(sign2)) % 101
  let analysis =
    "Una combinazione interessante con potenziale. La comunicazione sarà la chiave per superare le differenze."
  if (score > 80)
    analysis =
      "Un'affinità eccezionale! Condividete valori e obiettivi, creando una base solida per un rapporto duraturo e felice."
  else if (score > 60)
    analysis =
      "Buona compatibilità. Ci sono differenze, ma con un po' di impegno e comprensione reciproca, potete costruire una relazione forte."
  else if (score < 40)
    analysis =
      "Una sfida intrigante. Siete molto diversi, ma questo potrebbe rendervi complementari. Richiede pazienza e apertura mentale da entrambe le parti."

  return { score, analysis }
}

// --- TAROT DATA for Tarocchi Online ---
export const tarotCards = [
  {
    name: "Il Matto",
    imageUrl: "/placeholder.svg?width=250&height=400",
    meaning: "Nuovi inizi, spontaneità, fede, potenziale. Abbraccia l'ignoto con fiducia.",
  },
  {
    name: "Il Mago",
    imageUrl: "/placeholder.svg?width=250&height=400",
    meaning: "Manifestazione, potere, abilità, azione. Hai tutti gli strumenti per realizzare i tuoi desideri.",
  },
  {
    name: "La Papessa",
    imageUrl: "/placeholder.svg?width=250&height=400",
    meaning: "Intuizione, mistero, inconscio, saggezza. Ascolta la tua voce interiore.",
  },
  {
    name: "L'Imperatrice",
    imageUrl: "/placeholder.svg?width=250&height=400",
    meaning: "Fertilità, abbondanza, natura, nutrimento. È un momento di grande creatività e crescita.",
  },
  {
    name: "L'Imperatore",
    imageUrl: "/placeholder.svg?width=250&height=400",
    meaning: "Autorità, struttura, controllo, stabilità. Metti ordine nella tua vita e prendi il comando.",
  },
]
