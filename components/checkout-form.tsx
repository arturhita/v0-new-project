"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle, ShieldCheck } from "lucide-react"
import Link from "next/link"

export default function CheckoutForm() {
  const stripe = useStripe()
  const elements = useElements()

  const [message, setMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSucceeded, setIsSucceeded] = useState(false)

  useEffect(() => {
    if (!stripe) {
      return
    }

    const clientSecret = new URLSearchParams(window.location.search).get("payment_intent_client_secret")

    if (!clientSecret) {
      return
    }

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      switch (paymentIntent?.status) {
        case "succeeded":
          setMessage("Pagamento riuscito!")
          setIsSucceeded(true)
          break
        case "processing":
          setMessage("Il tuo pagamento è in elaborazione.")
          break
        case "requires_payment_method":
          setMessage("Per favore, inserisci i dati di pagamento.")
          break
        default:
          setMessage("Qualcosa è andato storto.")
          break
      }
    })
  }, [stripe])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsLoading(true)
    setMessage(null)

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Assicurati che l'URL di ritorno sia corretto per la tua logica
        return_url: `${window.location.origin}/dashboard/client/wallet?payment_success=true`,
      },
    })

    // Questo codice viene eseguito solo se c'è un errore immediato.
    // Altrimenti, l'utente viene reindirizzato.
    if (error.type === "card_error" || error.type === "validation_error") {
      setMessage(error.message || "Si è verificato un errore con la tua carta.")
    } else {
      setMessage("Si è verificato un errore inaspettato.")
    }

    setIsLoading(false)
  }

  // Controlla se la pagina è stata caricata dopo un redirect con successo
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get("payment_success") === "true") {
      setIsSucceeded(true)
    }
  }, [])

  if (isSucceeded) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-4">
        <CheckCircle className="w-20 h-20 text-green-400 mb-4" />
        <h3 className="text-2xl font-bold text-slate-800">Pagamento Riuscito!</h3>
        <p className="text-slate-500 mt-2">Il tuo credito è stato aggiunto al portafoglio.</p>
        <Button asChild className="mt-8 bg-sky-500 text-white hover:bg-sky-600 w-full">
          <Link href="/dashboard/client/wallet">Torna al Portafoglio</Link>
        </Button>
      </div>
    )
  }

  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      <PaymentElement id="payment-element" options={{ layout: "tabs" }} />
      <Button
        disabled={isLoading || !stripe || !elements}
        id="submit"
        className="w-full mt-8 bg-yellow-400 text-slate-900 hover:bg-yellow-500 text-lg font-bold py-6 transition-all duration-300 ease-in-out transform hover:scale-105"
      >
        <span id="button-text" className="flex items-center justify-center">
          {isLoading ? (
            <Loader2 className="animate-spin h-6 w-6" />
          ) : (
            <>
              <ShieldCheck className="mr-2 h-5 w-5" />
              Paga in Sicurezza
            </>
          )}
        </span>
      </Button>
      {message && (
        <div id="payment-message" className="text-center text-red-400 mt-4 font-medium">
          {message}
        </div>
      )}
    </form>
  )
}
