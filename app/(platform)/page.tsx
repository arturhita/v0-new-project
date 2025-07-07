import { getOperators } from "@/lib/actions/operator.actions"
import { ConstellationBackground } from "@/components/constellation-background"
import { HomeClient } from "./home-client"

export default async function HomePage() {
  const operators = await getOperators({ limit: 12 })

  return (
    <div className="relative min-h-screen w-full bg-slate-900 text-white">
      <ConstellationBackground />
      <main className="relative z-10 container mx-auto px-4 py-16">
        <section className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
            Trova il Tuo Esperto
          </h1>
          <p className="mt-4 text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
            Connettiti con i migliori cartomanti, astrologi e sensitivi. Ricevi la guida che cerchi, quando ne hai più
            bisogno.
          </p>
        </section>

        <section>
          <h2 className="text-3xl font-bold text-center mb-8 text-white">I Nostri Esperti Online</h2>
          <HomeClient initialOperators={operators} />
        </section>
      </main>
    </div>
  )
}
