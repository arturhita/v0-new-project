"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { updateUserRole } from "@/lib/actions/users.actions"
import { useToast } from "@/components/ui/use-toast"
import { useTransition } from "react"
import { MoreHorizontal } from "lucide-react"

export function UserActions({ userId, currentRole }: { userId: string; currentRole: string }) {
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()

  const handleRoleChange = (newRole: "client" | "operator" | "admin") => {
    if (newRole === currentRole) return
    startTransition(async () => {
      const result = await updateUserRole(userId, newRole)
      if (result.success) {
        toast({ title: "Successo", description: "Ruolo utente aggiornato." })
      } else {
        toast({ title: "Errore", description: result.error, variant: "destructive" })
      }
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Apri menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleRoleChange("client")} disabled={isPending || currentRole === "client"}>
          Imposta come Cliente
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleRoleChange("operator")}
          disabled={isPending || currentRole === "operator"}
        >
          Imposta come Operatore
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleRoleChange("admin")} disabled={isPending || currentRole === "admin"}>
          Imposta come Admin
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
