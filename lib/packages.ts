export const packages = [
  {
    id: "pkg_10",
    name: "Pacchetto Base",
    price: 10, // in EUR
    description: "Ideale per iniziare.",
    // Sostituisci con il VERO ID del prezzo dalla tua dashboard Stripe
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_10 || "price_1Pgx...",
  },
  {
    id: "pkg_25",
    name: "Pacchetto Standard",
    price: 25,
    description: "Il più popolare.",
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_25 || "price_1Pgx...",
  },
  {
    id: "pkg_50",
    name: "Pacchetto Premium",
    price: 50,
    description: "Per consulenze approfondite.",
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_50 || "price_1Pgx...",
  },
  {
    id: "pkg_100",
    name: "Pacchetto Pro",
    price: 100,
    description: "Il massimo del risparmio.",
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_100 || "price_1Pgx...",
  },
]

export type Package = (typeof packages)[0]
