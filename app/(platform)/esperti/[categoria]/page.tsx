"use client"
import { getOperatorsByCategory } from "@/lib/actions/data.actions"
import { createClient } from "@/lib/supabase/server"
import CategoryClientPage from "./category-client-page"

// Helper per ottenere i dettagli della categoria in base allo slug dell'URL
const getCategoryDetails = (slug: string) => {
  const decodedSlug = decodeURIComponent(slug)
  const details: { [key: string]: { title: string; description: string; searchKeywords: string[] } } = {
    cartomanzia: {
      title: "Esperti di Cartomanzia",
      description:
        "Svela i segreti del tuo destino con i nostri esperti cartomanti. Letture di tarocchi, sibille e carte per offrirti chiarezza e guida.",
      searchKeywords: ["cartomanzia", "tarocchi", "cartomante", "sibilla", "sibille"],
    },
    astrologia: {
      title: "Esperti di Astrologia",
      description:
        "Interpreta il linguaggio delle stelle. I nostri astrologi creano carte natali, analizzano transiti e svelano l'influenza dei pianeti sulla tua vita.",
      searchKeywords: ["astrologia", "astrologo", "oroscopi", "tema natale"],
    },
    numerologia: {
      title: "Esperti di Numerologia",
      description:
        "Scopri il potere nascosto nei numeri. I nostri numerologi analizzano le vibrazioni numeriche legate al tuo nome e alla tua data di nascita.",
      searchKeywords: ["numerologia", "numerologo"],
    },
    canalizzazione: {
      title: "Esperti di Canalizzazione",
      description:
        "Connettiti con guide spirituali e energie superiori. I nostri canalizzatori fungono da ponte per ricevere messaggi illuminanti per il tuo cammino.",
      searchKeywords: ["canalizzazione", "canalizzatrice", "angeli", "spirituale"],
    },
    "guarigione-energetica": {
      title: "Esperti di Guarigione Energetica",
      description:
        "Riequilibra i tuoi chakra e armonizza la tua energia vitale. Sessioni di guarigione per il benessere di corpo, mente e spirito.",
      searchKeywords: ["guarigione energetica", "energia", "chakra", "benessere", "guaritore"],
    },
    rune: {
      title: "Esperti di Rune",
      description:
        "Interroga gli antichi simboli nordici. I nostri esperti di rune ti guideranno attraverso la saggezza e i misteri delle rune.",
      searchKeywords: ["rune"],
    },
    cristalloterapia: {
      title: "Esperti di Cristalloterapia",
      description:
        "Sfrutta il potere curativo di cristalli e pietre. I nostri esperti ti aiuteranno a scegliere e utilizzare i cristalli per il tuo benessere.",
      searchKeywords: ["cristalloterapia", "cristalli"],
    },
    medianita: {
      title: "Esperti di Medianità",
      description:
        "Comunica con il mondo spirituale in un ambiente sicuro e protetto. I nostri medium offrono conforto e messaggi dai tuoi cari.",
      searchKeywords: ["medianità", "medium"],
    },
  }
  return (
    details[decodedSlug] || {
      title: `Esperti di ${decodedSlug}`,
      description: "Trova l'esperto giusto per te.",
      searchKeywords: [decodedSlug],
    }
  )
}

export default async function CategoryPage({ params }: { params: { categoria: string } }) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const operators = await getOperatorsByCategory(params.categoria)

  return <CategoryClientPage initialOperators={operators} currentUser={user} params={params} />
}
