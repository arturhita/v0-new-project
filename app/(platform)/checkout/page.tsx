import { stripe } from "@/lib/stripe"
import { Elements } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import CheckoutForm from "@/components/checkout-form"

// Carica la chiave pubblica di Stripe in modo sicuro
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // Dati di esempio basati sui parametri URL (es. /checkout?operatorName=Astrologo&amount=3000)
  const operatorName = searchParams?.operatorName || "Astrologo Esperto"
  const serviceName = searchParams?.serviceName || "Consulto di Cartomanzia (30 min)"
  const amount = Number(searchParams?.amount) || 3000 // 30.00 EUR (importo in centesimi)

  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    return <div className="text-center pt-40">Chiave Stripe non configurata.</div>
  }

  // Crea un Payment Intent sul server per sicurezza
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount,
    currency: "eur",
    automatic_payment_methods: {
      enabled: true,
    },
  })

  const clientSecret = paymentIntent.client_secret

  if (!clientSecret) {
    return <div className="text-center pt-40">Errore: Impossibile inizializzare il pagamento.</div>
  }

  // Opzioni di stile per il form di Stripe
  const options = {
    clientSecret,
    appearance: {
      theme: "night" as const,
      variables: {
        colorPrimary: "#facc15", // Giallo
        colorBackground: "#1f2937", // Blu scuro
        colorText: "#ffffff",
        colorDanger: "#ef4444",
        fontFamily: "Ideal Sans, system-ui, sans-serif",
        spacingUnit: "4px",
        borderRadius: "8px",
      },
    },
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#101D42] to-[#1E3C98] pt-24 text-white">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Riepilogo Ordine */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 shadow-2xl border border-white/10">
            <h1 className="text-3xl font-bold mb-6 text-yellow-300">Riepilogo Ordine</h1>
            <div className="space-y-5">
              <div>
                <p className="text-sm text-slate-300">Operatore</p>
                <p className="font-semibold text-xl">{operatorName}</p>
              </div>
              <div>
                <p className="text-sm text-slate-300">Servizio</p>
                <p className="font-semibold text-xl">{serviceName}</p>
              </div>
              <div className="border-t border-white/20 my-4"></div>
              <div className="flex justify-between items-center text-2xl font-bold">
                <span>Totale</span>
                <span>{(amount / 100).toLocaleString("it-IT", { style: "currency", currency: "EUR" })}</span>
              </div>
            </div>
          </div>

          {/* Form di Pagamento */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 shadow-2xl border border-white/10">
            <h2 className="text-3xl font-bold mb-6 text-yellow-300">Dati di Pagamento</h2>
            <Elements options={options} stripe={stripePromise}>
              <CheckoutForm />
            </Elements>
          </div>
        </div>
      </main>
    </div>
  )
}
