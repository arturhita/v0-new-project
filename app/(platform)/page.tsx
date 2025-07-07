import { getApprovedOperators } from "@/lib/actions/operator.actions.ts"
import { OperatorCard } from "@/components/operator-card"
import { ConstellationBackground } from "@/components/constellation-background"
import { Button } from "@/components/ui/button"

export default async function HomePage() {
  const operators = await getApprovedOperators()
  const allMockReviews = [
    {
      id: 1,
      author: "Giulia R.",
      rating: 5,
      text: "Lettura incredibilmente accurata, mi ha dato la chiarezza che cercavo. Luna è eccezionale!",
      operator: "Luna Stellare",
    },
    {
      id: 2,
      author: "Marco T.",
      rating: 5,
      text: "Sol ha una profondità e una saggezza rare. Ogni consulto è un viaggio illuminante.",
      operator: "Sol Divino",
    },
    {
      id: 3,
      author: "Serena B.",
      rating: 4,
      text: "Molto professionale e diretta. Mi ha aiutato a vedere le cose da una prospettiva diversa.",
      operator: "Luna Stellare",
    },
  ]

  return (
    <div className="bg-[#030014] text-white">
      <ConstellationBackground />
      <main className="relative z-10">
        {/* Hero Section */}
        <section
          className="h-screen min-h-[700px] flex items-center justify-center text-center bg-cover bg-center"
          style={{ backgroundImage: "url('/images/hero-background.png')" }}
        >
          <div className="bg-black bg-opacity-30 p-8 rounded-lg">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-4 text-shadow-gold">
              Il Tuo Destino, Rivelato.
            </h1>
            <p className="text-lg md:text-xl max-w-2xl mx-auto text-gray-200 mb-8">
              Connettiti con i migliori esperti di astrologia e tarocchi. Ottieni risposte chiare e guida il tuo cammino
              con fiducia.
            </p>
            <Button
              size="lg"
              className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105"
            >
              Scopri gli Esperti
            </Button>
          </div>
        </section>

        {/* Operatori in Evidenza Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <h2 className="text-4xl font-bold text-center mb-2 text-shadow-gold">I Nostri Esperti di Punta</h2>
            <p className="text-center text-gray-300 mb-12 max-w-3xl mx-auto">
              Selezionati per la loro esperienza, empatia e professionalità. Trova la guida giusta per te, disponibile
              ora in chat, telefono o email.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {operators.slice(0, 4).map((operator) => (
                <OperatorCard key={operator.id} operator={operator} />
              ))}
            </div>
          </div>
        </section>

        {/* Recensioni Section */}
        <section className="py-20 px-4 bg-[#08051e]">
          <div className="container mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12 text-shadow-gold">Cosa Dicono di Noi</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {allMockReviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-gradient-to-br from-[#1a1a3d] to-[#10102a] p-6 rounded-lg border border-purple-800/50 shadow-lg transition-transform duration-300 hover:transform-none hover:shadow-purple-500/20"
                >
                  <div className="flex items-center mb-4">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-5 h-5 ${i < review.rating ? "text-yellow-400" : "text-gray-600"}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.959a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.368 2.446a1 1 0 00-.364 1.118l1.287 3.959c.3.921-.755 1.688-1.54 1.118l-3.368-2.446a1 1 0 00-1.175 0l-3.368 2.446c-.784.57-1.838-.197-1.539-1.118l1.286-3.959a1 1 0 00-.364-1.118L2.05 9.386c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69L9.049 2.927z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-300 mb-4 italic">"{review.text}"</p>
                  <p className="font-bold text-right text-purple-300">- {review.author}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
