"use client"
import { useState } from "react"
import type React from "react"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, ShieldCheck } from "lucide-react"

export default function TaxInfoPage() {
  const [taxInfo, setTaxInfo] = useState({
    name: "", // Nuovo campo
    surname: "", // Nuovo campo
    country: "IT",
    taxId: "",
    vatNumber: "",
    address: "",
    city: "",
    zipCode: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setTaxInfo((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = () => {
    console.log("Dati fiscali salvati:", taxInfo)
    alert("Dati fiscali salvati con successo (simulazione).")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-slate-800">Dati Fiscali</h1>
        <Button
          onClick={handleSave}
          className="bg-gradient-to-r from-[hsl(var(--primary-light))] to-[hsl(var(--primary-medium))] text-white shadow-md hover:opacity-90"
        >
          <Save className="mr-2 h-5 w-5" /> Salva Dati
        </Button>
      </div>
      <CardDescription className="text-slate-500 -mt-4">
        Inserisci i tuoi dati fiscali per la corretta fatturazione e gestione dei compensi. Questi dati sono privati e
        non verranno mostrati pubblicamente.
      </CardDescription>

      <Card className="shadow-xl rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl text-slate-700 flex items-center">
            <ShieldCheck className="mr-2 h-5 w-5 text-[hsl(var(--primary-medium))]" />
            Informazioni di Fatturazione
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nome (Anagrafico)</Label>
              <Input id="name" name="name" value={taxInfo.name} onChange={handleInputChange} placeholder="Mario" />
            </div>
            <div>
              <Label htmlFor="surname">Cognome (Anagrafico)</Label>
              <Input
                id="surname"
                name="surname"
                value={taxInfo.surname}
                onChange={handleInputChange}
                placeholder="Rossi"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="taxId">Codice Fiscale</Label>
              <Input
                id="taxId"
                name="taxId"
                value={taxInfo.taxId}
                onChange={handleInputChange}
                placeholder="RSSMRA80A01H501U"
              />
            </div>
            <div>
              <Label htmlFor="vatNumber">Partita IVA (se applicabile)</Label>
              <Input
                id="vatNumber"
                name="vatNumber"
                value={taxInfo.vatNumber}
                onChange={handleInputChange}
                placeholder="IT12345678901"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="address">Indirizzo di Residenza</Label>
            <Input
              id="address"
              name="address"
              value={taxInfo.address}
              onChange={handleInputChange}
              placeholder="Via Roma, 1"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="city">Città</Label>
              <Input id="city" name="city" value={taxInfo.city} onChange={handleInputChange} placeholder="Milano" />
            </div>
            <div>
              <Label htmlFor="zipCode">CAP</Label>
              <Input
                id="zipCode"
                name="zipCode"
                value={taxInfo.zipCode}
                onChange={handleInputChange}
                placeholder="20121"
              />
            </div>
            <div>
              <Label htmlFor="country">Paese</Label>
              <Select
                name="country"
                value={taxInfo.country}
                onValueChange={(val) => setTaxInfo((p) => ({ ...p, country: val }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona paese" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IT">Italia</SelectItem>
                  <SelectItem value="CH">Svizzera</SelectItem>
                  <SelectItem value="SM">San Marino</SelectItem>
                  <SelectItem value="FR">Francia</SelectItem>
                  <SelectItem value="DE">Germania</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
