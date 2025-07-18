"use client"

import { updateOperatorByAdmin } from "@/lib/actions/operator.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { useTransition } from "react"

type Operator = {
  id: string
  full_name: string | null
  email: string | null
  phone: string | null
  status: string | null
  commission_rate: number | null
  specialties: string[] | null
  bio: string | null
}

export default function EditOperatorForm({ operator }: { operator: Operator }) {
  const { toast } = useToast()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await updateOperatorByAdmin(operator.id, formData)
      if (result.success) {
        toast({
          title: "Successo",
          description: result.message,
          className: "bg-green-500 text-white",
        })
        router.refresh()
      } else {
        toast({
          title: "Errore",
          description: result.message,
          variant: "destructive",
        })
      }
    })
  }

  return (
    <form action={handleSubmit} className="space-y-6 bg-gray-800 p-6 rounded-lg border border-gray-700">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="full_name" className="text-white">
            Nome Completo
          </Label>
          <Input
            id="full_name"
            name="full_name"
            defaultValue={operator.full_name ?? ""}
            className="bg-gray-900 border-gray-600 text-white"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-white">
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={operator.email ?? ""}
            className="bg-gray-900 border-gray-600 text-white"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-white">
            Telefono
          </Label>
          <Input
            id="phone"
            name="phone"
            defaultValue={operator.phone ?? ""}
            className="bg-gray-900 border-gray-600 text-white"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status" className="text-white">
            Stato
          </Label>
          <Select name="status" defaultValue={operator.status ?? "pending"}>
            <SelectTrigger className="bg-gray-900 border-gray-600 text-white">
              <SelectValue placeholder="Seleziona stato" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700 text-white">
              <SelectItem value="active">Attivo</SelectItem>
              <SelectItem value="pending">In attesa</SelectItem>
              <SelectItem value="suspended">Sospeso</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="commission_rate" className="text-white">
            Tasso di Commissione (%)
          </Label>
          <Input
            id="commission_rate"
            name="commission_rate"
            type="number"
            step="0.1"
            defaultValue={operator.commission_rate ?? 0}
            className="bg-gray-900 border-gray-600 text-white"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="specialties" className="text-white">
            Specialità (separate da virgola)
          </Label>
          <Input
            id="specialties"
            name="specialties"
            defaultValue={operator.specialties?.join(", ") ?? ""}
            className="bg-gray-900 border-gray-600 text-white"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="bio" className="text-white">
          Biografia
        </Label>
        <Textarea
          id="bio"
          name="bio"
          defaultValue={operator.bio ?? ""}
          className="bg-gray-900 border-gray-600 text-white"
          rows={5}
        />
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={isPending} className="bg-indigo-600 hover:bg-indigo-700 text-white">
          {isPending ? "Salvataggio..." : "Salva Modifiche"}
        </Button>
      </div>
    </form>
  )
}
