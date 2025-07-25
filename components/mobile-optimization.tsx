"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import {
  Menu,
  Search,
  User,
  MessageSquare,
  Phone,
  Star,
  Filter,
  Heart,
  Bell,
  Settings,
  LogOut,
  ArrowLeft,
  Plus,
  Send,
  Mic,
  MoreVertical,
} from "lucide-react"

interface MobileNavProps {
  isOpen: boolean
  onClose: () => void
}

const MobileNav = ({ isOpen, onClose }: MobileNavProps) => {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-80 p-0">
        <SheetHeader className="p-6 bg-gradient-to-r from-sky-500 to-cyan-500 text-white">
          <SheetTitle className="text-white">Menu</SheetTitle>
        </SheetHeader>
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
              U
            </div>
            <div>
              <p className="font-semibold">Utente Demo</p>
              <p className="text-sm text-slate-600">€25.50 disponibili</p>
            </div>
          </div>

          <nav className="space-y-2">
            <Button variant="ghost" className="w-full justify-start">
              <User className="h-4 w-4 mr-3" />
              Il Mio Profilo
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <MessageSquare className="h-4 w-4 mr-3" />
              Le Mie Consulenze
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Star className="h-4 w-4 mr-3" />
              Operatori Preferiti
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Bell className="h-4 w-4 mr-3" />
              Notifiche
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Settings className="h-4 w-4 mr-3" />
              Impostazioni
            </Button>
          </nav>

          <div className="border-t pt-4">
            <Button variant="ghost" className="w-full justify-start text-red-600">
              <LogOut className="h-4 w-4 mr-3" />
              Esci
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

const MobileOperatorCard = ({ operator }: { operator: any }) => {
  return (
    <Card className="w-full shadow-lg hover:shadow-xl transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="relative">
            <img
              src={operator.avatar || "/placeholder.svg?width=60&height=60"}
              alt={operator.name}
              className="w-15 h-15 rounded-full object-cover"
            />
            <div
              className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                operator.isOnline ? "bg-green-500" : "bg-gray-400"
              }`}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-slate-800 truncate">{operator.name}</h3>
                <p className="text-sm text-slate-600">{operator.specialization}</p>
              </div>
              <Button size="sm" variant="ghost" className="p-1">
                <Heart className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${i < Math.floor(operator.rating) ? "text-yellow-500 fill-current" : "text-gray-300"}`}
                  />
                ))}
              </div>
              <span className="text-xs text-slate-600">({operator.reviews})</span>
              <Badge variant="outline" className="text-xs">
                €{operator.pricePerMinute}/min
              </Badge>
            </div>

            <div className="flex gap-2">
              <Button size="sm" className="flex-1 bg-gradient-to-r from-sky-500 to-cyan-500 text-white">
                <MessageSquare className="h-3 w-3 mr-1" />
                Chat
              </Button>
              <Button size="sm" variant="outline" className="flex-1">
                <Phone className="h-3 w-3 mr-1" />
                Chiama
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const MobileSearchFilters = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          Filtri
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[80vh]">
        <SheetHeader>
          <SheetTitle>Filtri di Ricerca</SheetTitle>
        </SheetHeader>
        <div className="py-6 space-y-6">
          <div>
            <h4 className="font-semibold mb-3">Categoria</h4>
            <div className="grid grid-cols-2 gap-2">
              {["Tarocchi", "Astrologia", "Numerologia", "Cartomanzia"].map((cat) => (
                <Button key={cat} variant="outline" size="sm" className="justify-start">
                  {cat}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Prezzo per minuto</h4>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                €0 - €2
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                €2 - €5
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                €5 - €10
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                €10+
              </Button>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Valutazione</h4>
            <div className="space-y-2">
              {[5, 4, 3].map((rating) => (
                <Button key={rating} variant="outline" size="sm" className="w-full justify-start">
                  <div className="flex items-center">
                    {[...Array(rating)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 text-yellow-500 fill-current mr-1" />
                    ))}
                    <span className="ml-2">e oltre</span>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={() => setIsOpen(false)}>
              Annulla
            </Button>
            <Button className="flex-1 bg-gradient-to-r from-sky-500 to-cyan-500 text-white">Applica Filtri</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

const MobileChatInterface = () => {
  const [message, setMessage] = useState("")

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-sky-500 to-cyan-500 text-white">
        <Button variant="ghost" size="sm" className="text-white p-1">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-3 flex-1">
          <img src="/placeholder.svg?width=40&height=40" alt="Operatore" className="w-10 h-10 rounded-full" />
          <div>
            <p className="font-semibold">Stella Divina</p>
            <p className="text-xs opacity-90">Online</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="text-white p-1">
          <Phone className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="sm" className="text-white p-1">
          <MoreVertical className="h-5 w-5" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        <div className="flex justify-start">
          <div className="bg-slate-100 rounded-2xl rounded-bl-md p-3 max-w-[80%]">
            <p className="text-sm">Ciao! Sono qui per aiutarti. Cosa vorresti sapere?</p>
            <p className="text-xs text-slate-500 mt-1">14:30</p>
          </div>
        </div>

        <div className="flex justify-end">
          <div className="bg-gradient-to-r from-sky-500 to-cyan-500 text-white rounded-2xl rounded-br-md p-3 max-w-[80%]">
            <p className="text-sm">Vorrei sapere qualcosa sul mio futuro sentimentale</p>
            <p className="text-xs opacity-75 mt-1">14:32</p>
          </div>
        </div>

        <div className="flex justify-start">
          <div className="bg-slate-100 rounded-2xl rounded-bl-md p-3 max-w-[80%]">
            <p className="text-sm">Perfetto! Dimmi il tuo segno zodiacale e la tua data di nascita</p>
            <p className="text-xs text-slate-500 mt-1">14:33</p>
          </div>
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-white">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="p-2">
            <Plus className="h-5 w-5" />
          </Button>
          <div className="flex-1 relative">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Scrivi un messaggio..."
              className="w-full p-3 pr-12 border rounded-full focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <Button variant="ghost" size="sm" className="absolute right-1 top-1/2 transform -translate-y-1/2 p-2">
              <Mic className="h-4 w-4" />
            </Button>
          </div>
          <Button size="sm" className="p-3 bg-gradient-to-r from-sky-500 to-cyan-500 text-white rounded-full">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function MobileOptimization() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const [activeView, setActiveView] = useState("home")

  const mockOperators = [
    {
      id: 1,
      name: "Stella Divina",
      specialization: "Tarocchi & Astrologia",
      rating: 4.9,
      reviews: 234,
      pricePerMinute: 2.5,
      isOnline: true,
      avatar: "/placeholder.svg?width=60&height=60",
    },
    {
      id: 2,
      name: "Oracolo Celeste",
      specialization: "Numerologia",
      rating: 4.8,
      reviews: 189,
      pricePerMinute: 3.0,
      isOnline: false,
      avatar: "/placeholder.svg?width=60&height=60",
    },
  ]

  if (activeView === "chat") {
    return <MobileChatInterface />
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Header */}
      <div className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="sm" onClick={() => setIsMobileNavOpen(true)} className="p-2">
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex-1 mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Cerca operatori..."
                className="w-full pl-10 pr-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <Button variant="ghost" size="sm" className="p-2 relative">
            <Bell className="h-5 w-5" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
          </Button>
        </div>

        {/* Quick Filters */}
        <div className="flex items-center gap-2 px-4 pb-3 overflow-x-auto">
          <MobileSearchFilters />
          <Button variant="outline" size="sm" className="whitespace-nowrap">
            Online
          </Button>
          <Button variant="outline" size="sm" className="whitespace-nowrap">
            Tarocchi
          </Button>
          <Button variant="outline" size="sm" className="whitespace-nowrap">
            €0-€3
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4 pb-20">
        {/* Featured Banner */}
        <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-2">Prima consulenza gratuita!</h2>
            <p className="text-sm opacity-90 mb-4">Registrati ora e ricevi 10 minuti gratis</p>
            <Button className="bg-white text-purple-600 hover:bg-slate-100">Registrati Ora</Button>
          </CardContent>
        </Card>

        {/* Online Operators */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800">Operatori Online</h3>
            <Button variant="ghost" size="sm" className="text-sky-600">
              Vedi tutti
            </Button>
          </div>

          <div className="space-y-3">
            {mockOperators.map((operator) => (
              <MobileOperatorCard key={operator.id} operator={operator} />
            ))}
          </div>
        </div>

        {/* Categories */}
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Categorie Popolari</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { name: "Tarocchi", icon: "🔮", count: 45 },
              { name: "Astrologia", icon: "⭐", count: 32 },
              { name: "Numerologia", icon: "🔢", count: 28 },
              { name: "Cartomanzia", icon: "🃏", count: 19 },
            ].map((category) => (
              <Card key={category.name} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl mb-2">{category.icon}</div>
                  <h4 className="font-semibold text-slate-800">{category.name}</h4>
                  <p className="text-sm text-slate-600">{category.count} operatori</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
        <div className="flex items-center justify-around py-2">
          {[
            { id: "home", icon: Search, label: "Cerca" },
            { id: "favorites", icon: Heart, label: "Preferiti" },
            { id: "messages", icon: MessageSquare, label: "Messaggi" },
            { id: "profile", icon: User, label: "Profilo" },
          ].map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              className={`flex flex-col items-center p-2 ${activeView === item.id ? "text-sky-600" : "text-slate-600"}`}
              onClick={() => setActiveView(item.id)}
            >
              <item.icon className="h-5 w-5 mb-1" />
              <span className="text-xs">{item.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Mobile Navigation */}
      <MobileNav isOpen={isMobileNavOpen} onClose={() => setIsMobileNavOpen(false)} />
    </div>
  )
}
