import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageSquareHeart } from "lucide-react"

export default function InternalMessagesPage() {
  const messages = [
    {
      id: "msg1",
      sender: "Santuario Admin",
      senderAvatar: "/placeholder.svg?height=40&width=40",
      subject: "Aggiornamento Termini di Servizio",
      date: "20 Giugno 2025",
      isRead: false,
      preview: "Gentile Maestro, la informiamo di un importante aggiornamento ai termini...",
    },
    {
      id: "msg2",
      sender: "Santuario Admin",
      senderAvatar: "/placeholder.svg?height=40&width=40",
      subject: "Promemoria: Compilazione Dati Fiscali",
      date: "15 Giugno 2025",
      isRead: true,
      preview: "Le ricordiamo di completare/verificare i suoi dati fiscali per...",
    },
    {
      id: "msg3",
      sender: "Supporto Tecnico",
      senderAvatar: "/placeholder.svg?height=40&width=40",
      subject: "Manutenzione Programmata",
      date: "10 Giugno 2025",
      isRead: true,
      preview: "La piattaforma sarà in manutenzione dalle 02:00 alle 04:00 del...",
    },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-slate-800">Messaggi dal Tempio</h1>
      <CardDescription className="text-slate-500 -mt-4">
        Comunicazioni importanti dalla piattaforma e dall'amministrazione.
      </CardDescription>

      <Card className="shadow-xl rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl text-slate-700 flex items-center">
            <MessageSquareHeart className="mr-2 h-5 w-5 text-[hsl(var(--primary-medium))]" /> Posta Astrale
          </CardTitle>
        </CardHeader>
        <CardContent>
          {messages.length === 0 ? (
            <p className="text-center text-slate-500 py-8">Nessun messaggio ricevuto.</p>
          ) : (
            <ScrollArea className="h-[calc(100vh-20rem)]">
              {" "}
              {/* Adatta altezza se necessario */}
              <div className="space-y-3 pr-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      !msg.isRead
                        ? "bg-[hsl(var(--primary-super-light),0.5)] border-[hsl(var(--primary-light))]"
                        : "bg-slate-50 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={msg.senderAvatar || "/placeholder.svg"} />
                          <AvatarFallback>{msg.sender.substring(0, 1)}</AvatarFallback>
                        </Avatar>
                        <span
                          className={`font-semibold ${!msg.isRead ? "text-[hsl(var(--primary-dark))]" : "text-slate-700"}`}
                        >
                          {msg.sender}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400">{msg.date}</span>
                    </div>
                    <p className={`text-sm font-medium ${!msg.isRead ? "text-slate-800" : "text-slate-600"}`}>
                      {msg.subject}
                    </p>
                    <p className="text-xs text-slate-500 truncate mt-0.5">{msg.preview}</p>
                    {!msg.isRead && (
                      <Badge className="mt-2 bg-[hsl(var(--primary-accent-highlight))] text-black hover:bg-[hsl(var(--primary-accent-highlight),0.8)]">
                        Nuovo
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
