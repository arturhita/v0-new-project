"use client"

import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, PlusCircle, Sparkles, Edit3, RefreshCw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { getAllOperators, resetOperators, type Operator } from "@/lib/mock-data"

export default function ManageMastersPage() {
  const [masters, setMasters] = useState<Operator[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadOperators = () => {
    setIsLoading(true)
    try {
      const operators = getAllOperators()
      setMasters(operators)
    } catch (error) {
      console.error("Errore nel caricamento operatori:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadOperators()

    // Ascolta gli aggiornamenti degli operatori
    const handleOperatorUpdate = () => {
      loadOperators()
    }

    const handleOperatorsReset = () => {
      loadOperators()
    }

    window.addEventListener("operatorUpdated", handleOperatorUpdate)
    window.addEventListener("operatorsReset", handleOperatorsReset)

    // Ricarica quando la finestra torna in focus (utile quando si torna dalla pagina di modifica)
    const handleFocus = () => {
      loadOperators()
    }
    window.addEventListener("focus", handleFocus)

    return () => {
      window.removeEventListener("operatorUpdated", handleOperatorUpdate)
      window.removeEventListener("operatorsReset", handleOperatorsReset)
      window.removeEventListener("focus", handleFocus)
    }
  }, [])

  const getStatusBadgeVariant = (status: string) => {
    if (status === "Attivo") return "default"
    if (status === "In Attesa") return "outline"
    if (status === "Sospeso") return "destructive"
    return "secondary"
  }

  const handleRefresh = () => {
    loadOperators()
  }

  const handleResetData = () => {
    if (confirm("Sei sicuro di voler resettare tutti i dati degli operatori?")) {
      resetOperators()
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-sky-600" />
            <p className="text-slate-600">Caricamento operatori...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-slate-800">Elenco Maestri</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Aggiorna
          </Button>
          <Button variant="outline" onClick={handleResetData} size="sm" className="text-red-600 hover:text-red-700">
            Reset Dati
          </Button>
          <Button className="bg-gradient-to-r from-[hsl(var(--primary-light))] to-[hsl(var(--primary-medium))] text-white shadow-md hover:opacity-90">
            <PlusCircle className="mr-2 h-5 w-5" /> Aggiungi Maestro
          </Button>
        </div>
      </div>

      <Card className="shadow-xl rounded-2xl">
        <CardHeader>
          <CardTitle>Maestri del Santuario</CardTitle>
          <CardDescription>
            Gestisci i profili, le commissioni e lo stato dei consulenti esoterici. I dati si aggiornano
            automaticamente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome d'Arte</TableHead>
                <TableHead>Nome Reale</TableHead>
                <TableHead>Disciplina Principale</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead>Commissione</TableHead>
                <TableHead>Data Iniziazione</TableHead>
                <TableHead>
                  <span className="sr-only">Azioni</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {masters.map((master) => (
                <TableRow key={master.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-[hsl(var(--primary-accent-highlight))]" />
                    {master.stageName}
                  </TableCell>
                  <TableCell>{master.name}</TableCell>
                  <TableCell>{master.discipline}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(master.status)}>{master.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold text-green-600">{master.commission}</span>
                  </TableCell>
                  <TableCell>{master.joined}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Azioni</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/operators/${master.id}/edit`} className="flex items-center">
                            <Edit3 className="mr-2 h-4 w-4" /> Modifica Profilo/Commissione
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">Sospendi</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {masters.length === 0 && (
            <div className="text-center py-8">
              <p className="text-slate-500">Nessun operatore trovato.</p>
              <Button onClick={handleRefresh} className="mt-4">
                Ricarica
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
