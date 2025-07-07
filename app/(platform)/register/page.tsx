"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ConstellationBackground } from "@/components/constellation-background"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function RegisterPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [role, setRole] = useState<"client" | "operator">("client")
  const { register, loading } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await register({ email, password, name, role })
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-[#0c0a1e] p-4">
      <ConstellationBackground />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/50 p-8 shadow-2xl backdrop-blur-sm">
        <h2 className="mb-6 text-center text-3xl font-bold text-white">Crea il tuo Account Astrale</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-slate-400">
              Nome
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Il tuo nome"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-400">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="stella@esempio.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-400">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role" className="text-slate-400">
              Tipo di account
            </Label>
            <Select onValueChange={(value: "client" | "operator") => setRole(value)} defaultValue="client">
              <SelectTrigger
                id="role"
                className="border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500"
              >
                <SelectValue placeholder="Seleziona un ruolo" />
              </SelectTrigger>
              <SelectContent className="border-slate-700 bg-slate-800 text-white">
                <SelectItem value="client" className="focus:bg-slate-700">
                  Sono un Cliente
                </SelectItem>
                <SelectItem value="operator" className="focus:bg-slate-700">
                  Voglio diventare un Esperto
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Creazione in corso..." : "Registrati"}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-400">
          Hai già un account?{" "}
          <Link href="/login" className="font-medium text-indigo-400 hover:underline">
            Accedi
          </Link>
        </p>
      </div>
    </div>
  )
}
