"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Sparkles,
  SnowflakeIcon as Crystal,
  Shield,
  Heart,
  Search,
  Star,
  ChevronLeft,
  ChevronRight,
  Users,
  ShieldCheck,
} from "lucide-react"
import Link from "next/link"
import { ExpertCard } from "@/components/expert-card"
import { MobileMenu } from "@/components/mobile-menu"

// Dati esperti per rotazione random con servizi specifici
const allExperts = [
  {
    id: 1,
    name: "Luna Stellare",
    specialty: "Cartomante & Tarocchi",
    rating: 4.9,
    reviews: 256,
    status: "online",
    avatar: "/placeholder.svg?height=80&width=80",
    specialties: ["Tarocchi", "Amore", "Lavoro"],
    description: "Esperta in letture di tarocchi con 15 anni di esperienza",
    services: {
      chat: { available: true, price: 2.5 },
      call: { available: true, price: 2.5 },
      email: { available: false, price: 25.0 },
    },
  },
  {
    id: 2,
    name: "Maestro Cosmos",
    specialty: "Astrologo",
    rating: 4.8,
    reviews: 189,
    status: "online",
    avatar: "/placeholder.svg?height=80&width=80",
    specialties: ["Oroscopi", "Tema Natale", "Transiti"],
    description: "Astrologo professionista specializzato in carte natali",
    services: {
      chat: { available: true, price: 3.2 },
      call: { available: true, price: 3.2 },
      email: { available: true, price: 35.0 },
    },
  },
  {
    id: 3,
    name: "Cristal Mystic",
    specialty: "Sensitiva & Medium",
    rating: 4.9,
    reviews: 167,
    status: "busy",
    avatar: "/placeholder.svg?height=80&width=80",
    specialties: ["Medianità", "Cristalli", "Chakra"],
    description: "Medium con doni naturali per comunicare con l'aldilà",
    services: {
      chat: { available: true, price: 2.8 },
      call: { available: false, price: 2.8 },
      email: { available: true, price: 30.0 },
    },
  },
  {
    id: 4,
    name: "Madame Violette",
    specialty: "Numerologa",
    rating: 4.7,
    reviews: 134,
    status: "online",
    avatar: "/placeholder.svg?height=80&width=80",
    specialties: ["Numerologia", "Destino", "Compatibilità"],
    description: "Esperta in numerologia e analisi del destino",
    services: {
      chat: { available: false, price: 2.2 },
      call: { available: true, price: 2.2 },
      email: { available: true, price: 22.0 },
    },
  },
  {
    id: 5,
    name: "Sage Aurora",
    specialty: "Cartomante Sibilla",
    rating: 4.8,
    reviews: 203,
    status: "online",
    avatar: "/placeholder.svg?height=80&width=80",
    specialties: ["Sibille", "Futuro", "Amore"],
    description: "Specialista in carte Sibille e previsioni future",
    services: {
      chat: { available: true, price: 2.6 },
      call: { available: true, price: 2.6 },
      email: { available: true, price: 26.0 },
    },
  },
  {
    id: 6,
    name: "Mystic Rose",
    specialty: "Runologa",
    rating: 4.6,
    reviews: 98,
    status: "offline",
    avatar: "/placeholder.svg?height=80&width=80",
    specialties: ["Rune", "Protezione", "Energia"],
    description: "Esperta in rune nordiche e protezioni energetiche",
    services: {
      chat: { available: true, price: 2.4 },
      call: { available: false, price: 2.4 },
      email: { available: false, price: 24.0 },
    },
  },
]

// Nuovi esperti
const newExperts = [
  {
    id: 101,
    name: "Stella Nova",
    specialty: "Cartomante Moderna",
    rating: 4.8,
    reviews: 12,
    status: "online",
    avatar: "/placeholder.svg?height=80&width=80",
    specialties: ["Tarocchi Digitali", "Amore Moderno"],
    description: "Giovane cartomante con approccio innovativo",
    joinedDays: 2,
    services: {
      chat: { available: true, price: 2.3 },
      call: { available: false, price: 2.3 },
      email: { available: true, price: 23.0 },
    },
  },
  {
    id: 102,
    name: "Cosmic Ray",
    specialty: "Astrologo Quantico",
    rating: 4.9,
    reviews: 8,
    status: "online",
    avatar: "/placeholder.svg?height=80&width=80",
    specialties: ["Astrologia Quantica", "Energie Cosmiche"],
    description: "Astrologo specializzato in nuove tecniche",
    joinedDays: 1,
    services: {
      chat: { available: true, price: 3.5 },
      call: { available: true, price: 3.5 },
      email: { available: true, price: 35.0 },
    },
  },
  {
    id: 103,
    name: "Luna Crescente",
    specialty: "Medium Empatica",
    rating: 4.7,
    reviews: 15,
    status: "online",
    avatar: "/placeholder.svg?height=80&width=80",
    specialties: ["Empatia Spirituale", "Connessioni Animiche"],
    description: "Medium con doni naturali di empatia",
    joinedDays: 3,
    services: {
      chat: { available: true, price: 2.8 },
      call: { available: false, price: 2.8 },
      email: { available: false, price: 28.0 },
    },
  },
]

// Pool di recensioni per simulare aggiornamenti in tempo reale
const reviewsPool = [
  {
    id: 1,
    user: "Maria R.",
    operator: "Luna Stellare",
    rating: 5,
    comment: "Incredibile! Ha previsto tutto perfettamente. Le sue carte non mentono mai! ✨",
    timestamp: new Date(),
    verified: true,
    category: "Tarocchi Amore",
  },
  {
    id: 2,
    user: "Giuseppe M.",
    operator: "Maestro Cosmos",
    rating: 5,
    comment: "Il mio tema natale era perfetto. Finalmente ho capito il mio percorso di vita! 🌟",
    timestamp: new Date(),
    verified: true,
    category: "Astrologia",
  },
  {
    id: 3,
    user: "Anna B.",
    operator: "Cristal Mystic",
    rating: 4,
    comment: "Sensitiva straordinaria, ha sentito subito la presenza di mia nonna. Emozionante! 💫",
    timestamp: new Date(),
    verified: true,
    category: "Medianità",
  },
  {
    id: 4,
    user: "Luca F.",
    operator: "Luna Stellare",
    rating: 5,
    comment: "Consulenza fantastica per il lavoro. Ora so quale strada prendere! 🔮",
    timestamp: new Date(),
    verified: true,
    category: "Tarocchi Lavoro",
  },
  {
    id: 5,
    user: "Sofia T.",
    operator: "Madame Violette",
    rating: 5,
    comment: "I numeri del mio destino erano perfetti! Analisi numerologica incredibile! 🔢",
    timestamp: new Date(),
    verified: true,
    category: "Numerologia",
  },
  {
    id: 6,
    user: "Marco P.",
    operator: "Sage Aurora",
    rating: 4,
    comment: "Le carte Sibille hanno rivelato il mio futuro amoroso. Molto precisa! 💕",
    timestamp: new Date(),
    verified: true,
    category: "Sibille",
  },
  {
    id: 7,
    user: "Elena C.",
    operator: "Cristal Mystic",
    rating: 5,
    comment: "I cristalli hanno portato energia positiva nella mia vita. Grazie! 💎",
    timestamp: new Date(),
    verified: true,
    category: "Cristalloterapia",
  },
  {
    id: 8,
    user: "Roberto L.",
    operator: "Maestro Cosmos",
    rating: 5,
    comment: "Oroscopo personalizzato fantastico! Previsioni accurate al 100%! ⭐",
    timestamp: new Date(),
    verified: true,
    category: "Oroscopi",
  },
]

export default function HomePage() {
  const [currentExperts, setCurrentExperts] = useState(allExperts.slice(0, 6))
  const [visibleReviews, setVisibleReviews] = useState(reviewsPool.slice(0, 6))
  const [reviewIndex, setReviewIndex] = useState(6)
  const [scrollPosition, setScrollPosition] = useState(0)
  const [userCredits, setUserCredits] = useState(0)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userRole, setUserRole] = useState("")
  const [userName, setUserName] = useState("")

  const topExperts = [...allExperts].sort((a, b) => b.rating - a.rating).slice(0, 3)

  // Controllo stato di login persistente
  useEffect(() => {
    const checkLoginStatus = () => {
      try {
        // Controlla se l'utente è loggato
        const user = localStorage.getItem("user")
        const role = localStorage.getItem("userRole")
        const userData = localStorage.getItem("userData")

        if (user && role) {
          setIsLoggedIn(true)
          setUserRole(role)

          // Recupera i dati utente
          if (userData) {
            const parsedUserData = JSON.parse(userData)
            setUserName(parsedUserData.name || "Utente")

            // Imposta crediti in base al tipo di utente
            if (role === "user") {
              setUserCredits(parsedUserData.credits || 0)
            } else if (role === "operator") {
              // Per gli operatori mostra i guadagni
              setUserCredits(parsedUserData.earnings || 0)
            }
          }
        } else {
          // Se non è loggato, resetta tutto
          setIsLoggedIn(false)
          setUserRole("")
          setUserName("")
          setUserCredits(0)
        }
      } catch (error) {
        console.error("Errore nel controllo login:", error)
        // In caso di errore, considera l'utente non loggato
        setIsLoggedIn(false)
        setUserRole("")
        setUserName("")
        setUserCredits(0)
      }
    }

    // Controlla subito al caricamento
    checkLoginStatus()

    // Ascolta i cambiamenti nel localStorage (per sincronizzare tra tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "user" || e.key === "userRole" || e.key === "userData") {
        checkLoginStatus()
      }
    }

    window.addEventListener("storage", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])

  // Rotazione random degli esperti ogni 5 secondi
  useEffect(() => {
    const interval = setInterval(() => {
      const shuffled = [...allExperts].sort(() => 0.5 - Math.random())
      setCurrentExperts(shuffled.slice(0, 6))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  // Aggiornamento recensioni ogni 6 secondi
  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleReviews((prev) => {
        // Prendi una nuova recensione dal pool
        const newReview = {
          ...reviewsPool[reviewIndex % reviewsPool.length],
          id: Date.now() + Math.random(),
          timestamp: new Date(),
        }

        // Aggiungi la nuova recensione e mantieni le ultime 8
        const updated = [newReview, ...prev].slice(0, 8)
        return updated
      })

      setReviewIndex((prev) => prev + 1)
    }, 6000)

    return () => clearInterval(interval)
  }, [reviewIndex])

  const getTimeAgo = (timestamp: Date) => {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - timestamp.getTime()) / 1000)

    if (diffInSeconds < 60) return "Ora"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min fa`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ore fa`
    return `${Math.floor(diffInSeconds / 86400)} giorni fa`
  }

  const scrollReviews = (direction: "left" | "right") => {
    const container = document.getElementById("reviews-container")
    if (container) {
      const scrollAmount = 320
      const newPosition =
        direction === "left"
          ? Math.max(0, scrollPosition - scrollAmount)
          : Math.min(container.scrollWidth - container.clientWidth, scrollPosition + scrollAmount)

      container.scrollTo({ left: newPosition, behavior: "smooth" })
      setScrollPosition(newPosition)
    }
  }

  // Funzione per ottenere il link della dashboard corretto
  const getDashboardLink = () => {
    switch (userRole) {
      case "admin":
        return "/dashboard/admin"
      case "operator":
        return "/dashboard/operator"
      case "user":
      default:
        return "/dashboard/user"
    }
  }

  // Funzione per ottenere il testo del credito corretto
  const getCreditText = () => {
    switch (userRole) {
      case "operator":
        return "Guadagni"
      case "admin":
        return "Sistema"
      case "user":
      default:
        return "Crediti"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Crystal className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
              Mysthya
            </h1>
          </div>

          {/* Menu Mobile */}
          <div className="md:hidden">
            <MobileMenu isLoggedIn={isLoggedIn} userRole={userRole} userName={userName} userCredits={userCredits} />
          </div>

          {/* Menu Desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-pink-600 font-medium transition-colors">
              Home
            </Link>

            {/* Menu Esperti con Dropdown */}
            <div className="relative group">
              <button className="text-gray-700 hover:text-pink-600 font-medium transition-colors flex items-center space-x-1">
                <span>Esperti</span>
                <svg
                  className="w-4 h-4 transition-transform group-hover:rotate-180"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-2">
                  <Link
                    href="/esperti/cartomanzia"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors"
                  >
                    🔮 Cartomanzia
                  </Link>
                  <Link
                    href="/esperti/astrologia"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors"
                  >
                    ⭐ Astrologia
                  </Link>
                  <Link
                    href="/esperti/tarocchi"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors"
                  >
                    🃏 Tarocchi
                  </Link>
                  <Link
                    href="/esperti/sensitivi"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors"
                  >
                    🌙 Sensitivi & Medium
                  </Link>
                  <Link
                    href="/esperti/numerologia"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors"
                  >
                    🔢 Numerologia
                  </Link>
                  <Link
                    href="/esperti/cristalloterapia"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors"
                  >
                    💎 Cristalloterapia
                  </Link>
                  <Link
                    href="/esperti/rune"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors"
                  >
                    🪬 Rune
                  </Link>
                  <Link
                    href="/esperti/pendolo"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors"
                  >
                    ⚖️ Pendolo & Radiestesia
                  </Link>
                </div>
              </div>
            </div>

            <Link
              href="/novita"
              className="text-gray-700 hover:text-pink-600 font-medium transition-colors flex items-center space-x-1"
            >
              <span>Novità</span>
              <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse"></div>
            </Link>

            <Link
              href="/oroscopo"
              className="text-gray-700 hover:text-pink-600 font-medium transition-colors flex items-center space-x-1"
            >
              <span>Oroscopo</span>
              <span className="text-xs">⭐</span>
            </Link>
          </nav>

          {/* Pulsanti Login/Dashboard Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoggedIn ? (
              <div className="flex items-center space-x-3">
                {/* Informazioni Utente */}
                <div className="text-sm">
                  <span className="text-gray-600">Ciao, </span>
                  <span className="font-semibold text-gray-800">{userName}</span>
                </div>

                {/* Crediti/Guadagni (solo per user e operator) */}
                {userRole !== "admin" && (
                  <div className="text-sm">
                    <span className="text-gray-600">{getCreditText()}: </span>
                    <span className="font-bold text-green-600">€{userCredits.toFixed(2)}</span>
                  </div>
                )}

                {/* Pulsante Dashboard */}
                <Link href={getDashboardLink()}>
                  <Button variant="outline" className="border-pink-200 text-pink-600 hover:bg-pink-50 bg-transparent">
                    {userRole === "admin" ? "Admin Panel" : userRole === "operator" ? "Dashboard Pro" : "Dashboard"}
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline" className="border-pink-200 text-pink-600 hover:bg-pink-50 bg-transparent">
                    Accedi
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600">
                    Registrati
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section Magica */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Sfondo Animato Magico */}
        <div className="absolute inset-0">
          {/* Gradiente Base */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900"></div>

          {/* Stelle Animate */}
          <div className="absolute inset-0">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${2 + Math.random() * 3}s`,
                }}
              />
            ))}
          </div>

          {/* Particelle Magiche Fluttuanti */}
          <div className="absolute inset-0">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute text-2xl opacity-30 animate-float"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${8 + Math.random() * 4}s`,
                }}
              >
                {["✨", "🌙", "⭐", "🔮", "💫", "🌟"][Math.floor(Math.random() * 6)]}
              </div>
            ))}
          </div>

          {/* Aurore Mistiche */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
            <div
              className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-full blur-3xl animate-pulse"
              style={{ animationDelay: "2s" }}
            ></div>
            <div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-spin"
              style={{ animationDuration: "30s" }}
            ></div>
          </div>

          {/* Overlay Scuro */}
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        {/* Contenuto Principale */}
        <div className="relative z-10 text-center max-w-6xl mx-auto px-4">
          {/* Badge Magico */}
          <div className="inline-flex items-center px-4 md:px-8 py-3 md:py-4 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 mb-8 md:mb-12 shadow-2xl">
            <div className="relative mr-3 md:mr-4">
              <Crystal className="h-5 w-5 md:h-6 md:w-6 text-pink-300 animate-pulse" />
              <div className="absolute inset-0 bg-pink-400/50 rounded-full animate-ping"></div>
            </div>
            <span className="text-xs md:text-base font-bold text-white">✨ Il Portale delle Arti Divinatorie ✨</span>
            <div className="ml-3 md:ml-4 px-2 md:px-3 py-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs md:text-sm rounded-full animate-bounce">
              MAGICO
            </div>
          </div>

          {/* Titolo Principale Magico */}
          <div className="mb-8 md:mb-12">
            <h1 className="text-3xl md:text-6xl font-black text-white mb-6 md:mb-8 leading-none tracking-tight">
              <span className="block">Scopri il Tuo</span>
              <span className="block bg-gradient-to-r from-pink-300 via-purple-300 to-blue-300 bg-clip-text text-transparent relative">
                Destino Magico
                <div className="absolute -top-4 md:-top-6 -right-4 md:-right-6 text-3xl md:text-5xl animate-bounce">
                  ✨
                </div>
              </span>
            </h1>

            {/* Elementi Magici Fluttuanti - Solo Desktop */}
            <div className="hidden md:block absolute top-0 left-1/4 text-6xl animate-float opacity-40 text-pink-300">
              🔮
            </div>
            <div className="hidden md:block absolute top-20 right-1/4 text-5xl animate-float-delayed opacity-40 text-purple-300">
              ⭐
            </div>
            <div className="hidden md:block absolute bottom-20 left-1/3 text-4xl animate-float opacity-40 text-blue-300">
              🌙
            </div>
          </div>

          {/* Sottotitolo Mistico */}
          <div className="mb-12 md:mb-16">
            <p className="text-base md:text-2xl text-white/90 mb-6 md:mb-8 max-w-4xl mx-auto leading-relaxed font-light px-4">
              Connettiti con l'energia dell'universo attraverso i nostri
              <span className="font-bold bg-gradient-to-r from-pink-300 to-purple-300 bg-clip-text text-transparent">
                {" "}
                maestri spirituali
              </span>
            </p>

            {/* Frase Magica */}
            <div className="relative px-4">
              <p className="text-sm md:text-lg text-white/70 italic max-w-2xl mx-auto">
                "Ogni carta ha una storia da raccontare, ogni stella un segreto da svelare"
              </p>
              <div className="absolute -left-2 md:-left-4 -top-2 text-pink-300 opacity-60">❝</div>
              <div className="absolute -right-2 md:-right-4 -bottom-2 text-purple-300 opacity-60">❞</div>
            </div>
          </div>

          {/* Pulsanti Magici */}
          <div className="flex flex-col gap-4 md:gap-8 justify-center mb-16 md:mb-20 px-4">
            {isLoggedIn ? (
              <Link href={getDashboardLink()}>
                <Button
                  size="lg"
                  className="group relative text-base md:text-lg px-8 md:px-12 py-4 md:py-6 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-400 hover:via-emerald-400 hover:to-teal-400 shadow-2xl shadow-green-500/50 transform hover:scale-110 transition-all duration-500 rounded-3xl overflow-hidden border-2 border-white/20 w-full md:w-auto"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <Sparkles className="mr-3 md:mr-4 h-5 w-5 md:h-6 md:w-6 animate-pulse" />
                  <span className="relative z-10 font-bold">Vai alla Tua Dashboard</span>
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button
                  size="lg"
                  className="group relative text-base md:text-lg px-8 md:px-12 py-4 md:py-6 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 hover:from-pink-400 hover:via-purple-400 hover:to-blue-400 shadow-2xl shadow-pink-500/50 transform hover:scale-110 transition-all duration-500 rounded-3xl overflow-hidden border-2 border-white/20 w-full md:w-auto"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <Sparkles className="mr-3 md:mr-4 h-5 w-5 md:h-6 md:w-6 animate-pulse" />
                  <span className="relative z-10 font-bold">Inizia la Tua Lettura Magica</span>
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full animate-ping"></div>
                </Button>
              </Link>
            )}

            <Link href="/esperti">
              <Button
                size="lg"
                variant="outline"
                className="text-base md:text-lg px-8 md:px-12 py-4 md:py-6 border-3 border-white/30 text-white hover:bg-white/10 hover:border-white/50 shadow-2xl hover:shadow-white/20 transform hover:scale-110 transition-all duration-500 rounded-3xl bg-white/5 backdrop-blur-xl w-full md:w-auto"
              >
                <Search className="mr-3 md:mr-4 h-5 w-5 md:h-6 md:w-6" />
                <span className="font-bold">Esplora i Nostri Maestri</span>
              </Button>
            </Link>
          </div>

          {/* Elementi Decorativi Magici - Responsive */}
          <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-12 text-white/60 px-4">
            <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm px-4 md:px-6 py-2 md:py-3 rounded-full border border-white/20">
              <Shield className="h-5 w-5 md:h-6 md:w-6 text-green-400" />
              <span className="font-medium text-sm md:text-base">Consulenze Autentiche</span>
            </div>
            <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm px-4 md:px-6 py-2 md:py-3 rounded-full border border-white/20">
              <Crystal className="h-5 w-5 md:h-6 md:w-6 text-purple-400" />
              <span className="font-medium text-sm md:text-base">Maestri Certificati</span>
            </div>
            <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm px-4 md:px-6 py-2 md:py-3 rounded-full border border-white/20">
              <Heart className="h-5 w-5 md:h-6 md:w-6 text-pink-400" />
              <span className="font-medium text-sm md:text-base">Energia Positiva</span>
            </div>
          </div>
        </div>

        {/* Effetto Scintille in Movimento */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 4}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      </section>

      {/* Rotating Experts Section */}
      <section className="container mx-auto px-4 py-16 md:py-20">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
            I Nostri Maestri Spirituali
          </h2>
          <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto">
            Consulenti selezionati con anni di esperienza nelle arti divinatorie
          </p>
          <div className="flex items-center justify-center mt-4">
            <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse mr-2"></div>
            <span className="text-sm text-gray-500">Aggiornamento automatico ogni 5 secondi</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {currentExperts.map((expert, index) => (
            <ExpertCard
              key={`${expert.name}-${index}`}
              expert={expert}
              userCredits={userCredits}
              isLoggedIn={isLoggedIn}
            />
          ))}
        </div>

        {/* Call to Action per cercare altri consulenti */}
        <div className="text-center mt-8 md:mt-12">
          <Link href="/esperti">
            <Button
              size="lg"
              className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 shadow-2xl shadow-pink-500/25 transform hover:scale-105 transition-all duration-300 px-6 md:px-8 py-3"
            >
              <Search className="mr-3 h-5 w-5" />
              Cerca Altri Consulenti
            </Button>
          </Link>
        </div>
      </section>

      {/* Sezione Nuovi Esperti */}
      <section className="container mx-auto px-4 py-16 md:py-20 bg-gradient-to-r from-pink-50 to-purple-50">
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center px-4 md:px-6 py-2 md:py-3 bg-white/80 backdrop-blur-sm rounded-full border border-pink-200 mb-6">
            <div className="relative mr-3">
              <Sparkles className="h-5 w-5 md:h-6 md:w-6 text-pink-500 animate-pulse" />
              <div className="absolute inset-0 bg-pink-400/30 rounded-full animate-ping"></div>
            </div>
            <span className="text-sm md:text-lg font-bold bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
              Novità
            </span>
            <div className="ml-3 px-2 py-1 bg-gradient-to-r from-pink-500 to-blue-500 text-white text-xs rounded-full animate-bounce">
              NUOVO
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
            I Nostri Nuovi Maestri
          </h2>
          <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto">
            Scopri i consulenti appena entrati nella nostra community con competenze fresche e innovative
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {newExperts.map((expert, index) => (
            <div
              key={expert.id}
              className="group relative bg-white/70 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-2xl shadow-pink-500/10 hover:shadow-pink-500/20 transition-all duration-500 transform hover:-translate-y-2 border border-white/20"
              style={{
                animation: `slideInUp 0.6s ease-out ${index * 0.1}s both`,
              }}
            >
              {/* New Badge */}
              <div className="absolute -top-3 -right-3 z-10">
                <div className="relative">
                  <div className="bg-gradient-to-r from-pink-500 to-blue-500 text-white px-2 md:px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse">
                    NUOVO
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-blue-400 rounded-full animate-ping opacity-30"></div>
                </div>
              </div>

              {/* Joined Days Badge */}
              <div className="absolute top-4 left-4">
                <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs text-pink-600 font-medium border border-pink-200">
                  {expert.joinedDays} giorni fa
                </div>
              </div>

              {/* Status Indicator */}
              <div className="absolute top-4 right-4">
                <div
                  className={`w-3 h-3 rounded-full ${expert.status === "online" ? "bg-green-400 animate-pulse" : "bg-gray-400"}`}
                ></div>
              </div>

              <div className="mt-4">
                {/* Expert Avatar */}
                <div className="relative mb-6">
                  <div className="w-20 h-20 md:w-24 md:h-24 mx-auto relative">
                    <Avatar className="w-full h-full ring-4 ring-pink-200 shadow-xl">
                      <AvatarImage src={expert.avatar || "/placeholder.svg"} alt={expert.name} />
                      <AvatarFallback className="bg-gradient-to-r from-pink-200 to-blue-200 text-lg md:text-xl font-bold">
                        {expert.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-lg">
                      <div className={`w-3 h-3 md:w-4 md:h-4 rounded-full bg-green-400`}></div>
                    </div>
                  </div>
                </div>

                {/* Expert Info */}
                <div className="text-center mb-6">
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-1">{expert.name}</h3>
                  <p className="text-pink-600 font-medium mb-2 text-sm md:text-base">{expert.specialty}</p>
                  <p className="text-gray-600 text-sm mb-3">{expert.description}</p>

                  {/* Rating */}
                  <div className="flex items-center justify-center mb-3">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 md:h-4 md:w-4 ${
                            i < Math.floor(expert.rating) ? "text-yellow-400 fill-current" : "text-gray-300"
                          }`}
                        />
                      ))}
                      <span className="ml-2 text-xs md:text-sm text-gray-600">
                        {expert.rating} ({expert.reviews} recensioni)
                      </span>
                    </div>
                  </div>

                  {/* Specialties */}
                  <div className="flex flex-wrap justify-center gap-1 mb-4">
                    {expert.specialties.map((specialty, idx) => (
                      <span key={idx} className="px-2 py-1 bg-pink-100 text-pink-700 text-xs rounded-full">
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <ExpertCard expert={expert} userCredits={userCredits} isLoggedIn={isLoggedIn} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-8 md:mt-12">
          <Link href="/novita">
            <Button
              size="lg"
              className="bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600 shadow-2xl shadow-pink-500/25 transform hover:scale-105 transition-all duration-300 px-6 md:px-8 py-3"
            >
              <Sparkles className="mr-3 h-5 w-5" />
              Vedi Tutti i Nuovi Esperti
            </Button>
          </Link>
        </div>
      </section>

      {/* Sezione Ultime Recensioni */}
      <section className="container mx-auto px-4 py-16 md:py-20">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
            Ultime Recensioni
          </h2>
          <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto">
            Scopri cosa dicono i nostri clienti delle loro esperienze magiche
          </p>
          <div className="flex items-center justify-center mt-4">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
            <span className="text-sm text-gray-500">Aggiornamento in tempo reale</span>
          </div>
        </div>

        {/* Container Recensioni con Scroll */}
        <div className="relative">
          {/* Pulsanti di navigazione */}
          <div className="hidden md:flex absolute left-0 top-1/2 transform -translate-y-1/2 z-10">
            <Button
              variant="outline"
              size="sm"
              onClick={() => scrollReviews("left")}
              className="bg-white/80 backdrop-blur-sm border-pink-200 text-pink-600 hover:bg-pink-50 rounded-full w-10 h-10 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
          <div className="hidden md:flex absolute right-0 top-1/2 transform -translate-y-1/2 z-10">
            <Button
              variant="outline"
              size="sm"
              onClick={() => scrollReviews("right")}
              className="bg-white/80 backdrop-blur-sm border-pink-200 text-pink-600 hover:bg-pink-50 rounded-full w-10 h-10 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Scroll Container */}
          <div
            id="reviews-container"
            className="flex space-x-4 md:space-x-6 overflow-x-auto scrollbar-hide pb-4 px-4 md:px-12"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {visibleReviews.map((review, index) => (
              <Card
                key={review.id}
                className="flex-shrink-0 w-72 md:w-80 bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                style={{
                  animation: `slideInFromRight 0.5s ease-out ${index * 0.1}s both`,
                }}
              >
                <CardContent className="p-4 md:p-6">
                  {/* Header Recensione */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-8 h-8 md:w-10 md:h-10">
                        <AvatarFallback className="bg-gradient-to-r from-pink-200 to-blue-200 text-xs md:text-sm font-bold">
                          {review.user
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm md:text-base">{review.user}</p>
                        <p className="text-xs md:text-sm text-gray-500">{getTimeAgo(review.timestamp)}</p>
                      </div>
                    </div>
                    {review.verified && (
                      <Badge className="bg-green-100 text-green-800 text-xs">
                        <Shield className="w-3 h-3 mr-1" />
                        Verificata
                      </Badge>
                    )}
                  </div>

                  {/* Rating */}
                  <div className="flex items-center mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 md:h-4 md:w-4 ${
                          i < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-xs md:text-sm text-gray-600">({review.rating}/5)</span>
                  </div>

                  {/* Commento */}
                  <p className="text-gray-700 text-sm md:text-base leading-relaxed mb-4">{review.comment}</p>

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs md:text-sm font-medium text-pink-600">{review.operator}</p>
                      <p className="text-xs text-gray-500">{review.category}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">Consulenza</div>
                      <div className="text-xs font-medium text-green-600">Completata</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Indicatore Mobile */}
        <div className="flex md:hidden justify-center mt-4 space-x-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 bg-pink-300 rounded-full animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            ></div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white/40 backdrop-blur-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Perché scegliere ConsultaPro</h2>
            <p className="mt-2 text-gray-600">La piattaforma più sicura e affidabile per le tue consulenze.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-r from-pink-500 to-blue-500 text-white mx-auto mb-4">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">I Migliori Esperti</h3>
              <p className="text-gray-600">
                Selezioniamo solo i consulenti più qualificati e professionali per garantirti un servizio di alta
                qualità.
              </p>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-r from-pink-500 to-blue-500 text-white mx-auto mb-4">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Privacy e Sicurezza</h3>
              <p className="text-gray-600">
                Le tue conversazioni sono protette e anonime. La tua privacy è la nostra priorità assoluta.
              </p>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-r from-pink-500 to-blue-500 text-white mx-auto mb-4">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Disponibilità 24/7</h3>
              <p className="text-gray-600">
                Trova un consulente disponibile in qualsiasi momento, giorno e notte, per rispondere alle tue domande.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Top Experts Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">I nostri consulenti più amati</h2>
            <p className="mt-2 text-gray-600">Scopri chi sono gli esperti preferiti dalla nostra community.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {topExperts.map((expert) => (
              <ExpertCard key={expert.id} expert={expert} userCredits={userCredits} isLoggedIn={isLoggedIn} />
            ))}
          </div>
          <div className="text-center mt-12">
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-pink-300 text-pink-600 hover:bg-pink-50 bg-transparent"
            >
              <Link href="/esperti">Vedi tutti i consulenti</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Crystal className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-xl font-bold">Mysthya</h3>
              </div>
              <p className="text-gray-400 text-sm md:text-base">
                La piattaforma leader per consulenze esoteriche al minuto.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Consulenze</h4>
              <ul className="space-y-2 text-gray-400 text-sm md:text-base">
                <li>
                  <Link href="/esperti/cartomanzia">Cartomanzia</Link>
                </li>
                <li>
                  <Link href="/esperti/astrologia">Astrologia</Link>
                </li>
                <li>
                  <Link href="/esperti/tarocchi">Tarocchi</Link>
                </li>
                <li>
                  <Link href="/esperti/sensitivi">Sensitivi</Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Supporto</h4>
              <ul className="space-y-2 text-gray-400 text-sm md:text-base">
                <li>
                  <Link href="/help">Centro Aiuto</Link>
                </li>
                <li>
                  <Link href="/privacy">Privacy</Link>
                </li>
                <li>
                  <Link href="/terms">Termini</Link>
                </li>
                <li>
                  <Link href="/contact">Contatti</Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Informazioni</h4>
              <ul className="space-y-2 text-gray-400 text-sm md:text-base">
                <li>
                  <Link href="/about">Chi Siamo</Link>
                </li>
                <li>
                  <Link href="/blog">Blog</Link>
                </li>
                <li>
                  <Link href="/press">Stampa</Link>
                </li>
                <li>
                  <Link href="/careers">Lavora con Noi</Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-6 md:mt-8 pt-6 md:pt-8 text-center text-gray-400">
            <p className="text-sm md:text-base">&copy; 2024 Mysthya. Tutti i diritti riservati.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
