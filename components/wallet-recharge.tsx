"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { CreditCard, Zap, CheckCircle } from "lucide-react"
import { packages, type Package } from "@/lib/packages"
import { loadStripe } from "@stripe/stripe-js"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export function WalletRecharge() {
  const { user } = useAuth()
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(packages[1]) // Pre-seleziona il pacchetto standard
  const [isLoading, setIsLoading] = useState(false)

  const handleRecharge = async () => {
    if (!user) {
      toast({
        title: "Accesso richiesto",
        description: "Devi effettuare l'accesso per ricaricare.",
        variant: "destructive",
      })
      return
    }
    if (!selectedPackage) {
      toast({
        title: "Nessun pacchetto selezionato",
        description: "Scegli un importo da ricaricare.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/payments/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId: selectedPackage.id, userId: user.id }),
      })

      if (!response.ok) throw new Error("Failed to create payment session.")

      const { sessionId } = await response.json()
      const stripe = await stripePromise
      if (!stripe) throw new Error("Stripe.js has not loaded yet.")

      const { error } = await stripe.redirectToCheckout({ sessionId })
      if (error) {
        toast({ title: "Errore di reindirizzamento", description: error.message, variant: "destructive" })
      }
    } catch (error) {
      console.error(error)
      toast({ title: "Errore", description: "Impossibile avviare il pagamento. Riprova.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl rounded-2xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-slate-800">Ricarica il tuo Portafoglio</CardTitle>
        <CardDescription className="text-slate-500">
          Scegli un pacchetto e procedi al pagamento sicuro con Stripe.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {packages.map((pkg) => (
            <button
              key={pkg.id}
              onClick={() => setSelectedPackage(pkg)}
              className={`p-4 border-2 rounded-lg text-center transition-all duration-200 ${
                selectedPackage?.id === pkg.id
                  ? "border-sky-500 bg-sky-50 shadow-lg scale-105"
                  : "border-slate-200 hover:border-sky-400"
              }`}
            >
              <p className="text-xl font-bold text-slate-700">{pkg.price}€</p>
              <p className="text-xs text-slate-500">{pkg.name}</p>
              {selectedPackage?.id === pkg.id && (
                <CheckCircle className="h-5 w-5 text-sky-500 absolute -top-2 -right-2 bg-white rounded-full" />
              )}
            </button>
          ))}
        </div>
        <Button
          onClick={handleRecharge}
          disabled={isLoading || !selectedPackage}
          className="w-full text-lg py-6 bg-gradient-to-r from-sky-500 to-cyan-500 text-white"
        >
          {isLoading ? (
            "Caricamento..."
          ) : (
            <>
              <CreditCard className="mr-2 h-5 w-5" /> Ricarica {selectedPackage?.price}€
            </>
          )}
        </Button>
        <p className="text-xs text-center text-slate-400 mt-4 flex items-center justify-center">
          <Zap className="h-3 w-3 mr-1 text-yellow-500" /> Pagamento sicuro e protetto con Stripe.
        </p>
      </CardContent>
    </Card>
  )
}
