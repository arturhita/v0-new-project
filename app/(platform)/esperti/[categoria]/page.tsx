import { getOperatorsByCategory } from "@/lib/actions/operator.actions"
import { ExpertListClient } from "./expert-list-client"

// Helper per ottenere i dettagli della categoria in base allo slug dell'URL
const getCategoryDetails = (slug: string) => {
  const decodedSlug = decodeURIComponent(slug)
  const details: { [key: string]: { title: string; description: string } } = {
    cartomanzia: {
      title: "Esperti di Cartomanzia",
      description:
        "Svela i segreti del tuo destino con i nostri esperti cartomanti. Letture di tarocchi, sibille e carte per offrirti chiarezza e guida.",
    },
    astrologia: {
      title: "Esperti di Astrologia",
      description:
        "Interpreta il linguaggio delle stelle. I nostri astrologi creano carte natali, analizzano transiti e svelano l'influenza dei pianeti sulla tua vita.",
    },
    numerologia: {
      title: "Esperti di Numerologia",
      description:
        "Scopri il potere nascosto nei numeri. I nostri numerologi analizzano le vibrazioni numeriche legate al tuo nome e alla tua data di nascita.",
    },
    canalizzazione: {
      title: "Esperti di Canalizzazione",
      description:
        "Connettiti con guide spirituali e energie superiori. I nostri canalizzatori fungono da ponte per ricevere messaggi illuminanti per il tuo cammino.",
    },
    "guarigione-energetica": {
      title: "Esperti di Guarigione Energetica",
      description:
        "Riequilibra i tuoi chakra e armonizza la tua energia vitale. Sessioni di guarigione per il benessere di corpo, mente e spirito.",
    },
    rune: {
      title: "Esperti di Rune",
      description:
        "Interroga gli antichi simboli nordici. I nostri esperti di rune ti guideranno attraverso la saggezza e i misteri delle rune.",
    },
    cristalloterapia: {
      title: "Esperti di Cristalloterapia",
      description:
        "Sfrutta il potere curativo di cristalli e pietre. I nostri esperti ti aiuteranno a scegliere e utilizzare i cristalli per il tuo benessere.",
    },
    medianita: {
      title: "Esperti di Medianità",
      description:
        "Comunica con il mondo spirituale in un ambiente sicuro e protetto. I nostri medium offrono conforto e messaggi dai tuoi cari.",
    },
  }
  return (
    details[decodedSlug] || {
      title: `Esperti di ${decodedSlug.charAt(0).toUpperCase() + decodedSlug.slice(1)}`,
      description: "Trova l'esperto giusto per te.",
    }
  )
}

export default async function CategoriaPage({ params }: { params: { categoria: string } }) {
  const { categoria } = params
  const categoryDetails = getCategoryDetails(categoria)

  // Carica i dati iniziali dal server
  const initialOperators = await getOperatorsByCategory(categoria)

  return <ExpertListClient initialOperators={initialOperators} categoryDetails={categoryDetails} />
}
