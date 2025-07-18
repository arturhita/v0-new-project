"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"
import { updateUserRole } from "@/lib/actions/users.actions"
import { useToast } from "@/components/ui/use-toast"

export function UserActions({ userId, currentRole }: { userId: string; currentRole: string }) {
  const { toast } = useToast()

  const handleRoleChange = async (newRole: "admin" | "client" | "operator") => {
    const result = await updateUserRole(userId, newRole)
    if (result.success) {
      toast({ title: "Successo", description: result.message })
    } else {
      toast({ title: "Errore", description: result.message, variant: "destructive" })
    }
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
        <DropdownMenuItem onClick={() => handleRoleChange("admin")} disabled={currentRole === "admin"}>
          Rendi Amministratore
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleRoleChange("client")} disabled={currentRole === "client"}>
          Rendi Cliente
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleRoleChange("operator")} disabled={currentRole === "operator"}>
          Rendi Operatore
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
