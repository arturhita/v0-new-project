"use client"
import { useState, useEffect } from "react" // Aggiunto useEffect
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BookUser, PlusCircle, Search, Edit2, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

// Mock data per le note, in un'app reale verrebbe da un DB o stato globale
// Questo è lo stesso mock usato in consultations-history per coerenza
const initialClientNotesData: Record<
  string,
  { clientId: string; clientName: string; clientAvatar: string; noteContent: string; lastUpdated: string }
> = {
  c1: {
    clientId: "client123",
    clientName: "Cercatore Curioso",
    clientAvatar: "/placeholder.svg?height=40&width=40",
    noteContent:
      "Molto interessato ai tarocchi evolutivi, ha chiesto approfondimenti sulla carta dell'Eremita. Prossimo consulto focalizzato su crescita personale.",
    lastUpdated: "2025-06-20",
  },
  c2: {
    clientId: "client456",
    clientName: "Anima Inquieta",
    clientAvatar: "/placeholder.svg?height=40&width=40",
    noteContent: "Periodo di forte stress emotivo. Consigliato esercizio di grounding. Sensibile alle energie.",
    lastUpdated: "2025-06-18",
  },
  // Aggiungi altre note se necessario
}

interface ClientNote {
  id: string // Usiamo l'ID del consulto o un ID univoco per la nota
  clientId: string
  clientName: string
  clientAvatar: string
  lastUpdated: string
  noteContent: string
}

export default function ClientNotesPage() {
  const [notes, setNotes] = useState<ClientNote[]>([])

  useEffect(() => {
    // Carica le note iniziali dal mock data
    const loadedNotes = Object.entries(initialClientNotesData).map(([id, data]) => ({
      id, // L'ID della nota può essere l'ID del consulto a cui è associata
      ...data,
    }))
    setNotes(loadedNotes)
  }, [])

  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentNote, setCurrentNote] = useState<Partial<ClientNote> | null>(null)
  const [noteText, setNoteText] = useState("")
  const [selectedClientNameForNewNote, setSelectedClientNameForNewNote] = useState("") // Per simulare la selezione di un cliente per una nuova nota

  const filteredNotes = notes.filter((note) => note.clientName.toLowerCase().includes(searchTerm.toLowerCase()))

  const openModal = (note: Partial<ClientNote> | null = null) => {
    setCurrentNote(note)
    setNoteText(note?.noteContent || "")
    // Se è una nuova nota, potresti avere un modo per selezionare il cliente
    setSelectedClientNameForNewNote(note?.clientName || "Nuovo Cercatore (Seleziona)")
    setIsModalOpen(true)
  }
  const closeModal = () => setIsModalOpen(false)

  const handleSaveNote = () => {
    if (currentNote?.id) {
      // Modifica nota esistente
      const updatedNotes = notes.map((n) =>
        n.id === currentNote.id
          ? { ...n, noteContent: noteText, lastUpdated: new Date().toISOString().split("T")[0] }
          : n,
      )
      setNotes(updatedNotes)
      // Aggiorna anche il mock globale se necessario per coerenza tra pagine
      if (initialClientNotesData[currentNote.id]) {
        initialClientNotesData[currentNote.id].noteContent = noteText
        initialClientNotesData[currentNote.id].lastUpdated = new Date().toISOString().split("T")[0]
      }
    } else {
      // Aggiungi nuova nota (simulazione, mancherebbe la selezione del cliente)
      const newNoteId = `note_manual_${Date.now()}`
      const newNote: ClientNote = {
        id: newNoteId,
        clientId: `client_manual_${Date.now()}`, // ID cliente fittizio
        clientName: selectedClientNameForNewNote || "Cercatore Generico",
        clientAvatar: `/placeholder.svg?height=40&width=40&query=${(selectedClientNameForNewNote || "C").charAt(0)}`,
        noteContent: noteText,
        lastUpdated: new Date().toISOString().split("T")[0],
      }
      setNotes((prevNotes) => [newNote, ...prevNotes])
      initialClientNotesData[newNoteId] = newNote // Aggiungi al mock globale
    }
    alert("Appunto salvato (simulazione).")
    closeModal()
  }

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter((n) => n.id !== id))
    delete initialClientNotesData[id] // Rimuovi dal mock globale
    alert("Appunto eliminato (simulazione).")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h1 className="text-3xl font-bold tracking-tight text-slate-800">Appunti sui Cercatori</h1>
        <Button
          onClick={() => openModal()}
          className="bg-gradient-to-r from-[hsl(var(--primary-light))] to-[hsl(var(--primary-medium))] text-white shadow-md hover:opacity-90"
        >
          <PlusCircle className="mr-2 h-5 w-5" /> Aggiungi Appunto Manuale
        </Button>
      </div>
      <CardDescription className="text-slate-500 -mt-4">
        Conserva note private e promemoria sui tuoi cercatori per offrire un servizio più personalizzato. Gli appunti
        salvati durante i consulti appariranno qui.
      </CardDescription>

      <Card className="shadow-xl rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl text-slate-700 flex items-center">
            <BookUser className="mr-2 h-5 w-5 text-[hsl(var(--primary-medium))]" /> I Tuoi Appunti Segreti
          </CardTitle>
          <div className="relative mt-2">
            <Input
              placeholder="Cerca appunti per nome cercatore..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 rounded-md bg-slate-50"
            />
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          </div>
        </CardHeader>
        <CardContent>
          {filteredNotes.length === 0 ? (
            <p className="text-center text-slate-500 py-8">
              {notes.length === 0 ? "Non hai ancora appunti." : "Nessun appunto trovato per la tua ricerca."}
            </p>
          ) : (
            <div className="space-y-4">
              {filteredNotes.map((note) => (
                <div key={note.id} className="p-4 border rounded-lg bg-white hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={note.clientAvatar || "/placeholder.svg"} alt={note.clientName} />
                        <AvatarFallback>{note.clientName.substring(0, 1)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-slate-700">{note.clientName}</p>
                        <p className="text-xs text-slate-400">Ultima modifica: {note.lastUpdated}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => openModal(note)}>
                        <Edit2 className="h-4 w-4 text-slate-500 hover:text-[hsl(var(--primary-dark))]" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDeleteNote(note.id)}>
                        <Trash2 className="h-4 w-4 text-red-400 hover:text-red-600" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 whitespace-pre-wrap">{note.noteContent}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {currentNote?.id ? "Modifica Appunto" : "Nuovo Appunto"} per{" "}
              {currentNote?.clientName || selectedClientNameForNewNote}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {!currentNote?.id && (
              <div className="mb-3">
                <Label htmlFor="clientNameForNewNote">Nome Cercatore (per nuovo appunto manuale)</Label>
                <Input
                  id="clientNameForNewNote"
                  value={selectedClientNameForNewNote}
                  onChange={(e) => setSelectedClientNameForNewNote(e.target.value)}
                  placeholder="Nome del Cercatore"
                  className="mt-1"
                />
              </div>
            )}
            <Label htmlFor="noteContentText">Contenuto dell'Appunto</Label>
            <Textarea
              id="noteContentText"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Scrivi qui le tue osservazioni..."
              className="min-h-[150px] mt-1"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>
              Annulla
            </Button>
            <Button
              onClick={handleSaveNote}
              className="bg-gradient-to-r from-[hsl(var(--primary-light))] to-[hsl(var(--primary-medium))] text-white"
            >
              Salva Appunto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
