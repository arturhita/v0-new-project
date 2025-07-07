"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Profile } from "@/contexts/auth-context"
import { updateUserProfile } from "@/lib/actions/user.actions"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function ProfileClient({ profile }: { profile: Profile }) {
  const [fullName, setFullName] = useState(profile.full_name || "")
  const [stageName, setStageName] = useState(profile.stage_name || "")
  const [isPending, setIsPending] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsPending(true)

    const result = await updateUserProfile(profile.id, {
      full_name: fullName,
      stage_name: stageName,
    })

    if (result.success) {
      toast({
        title: "Profilo Aggiornato",
        description: "Le tue informazioni sono state salvate.",
      })
    } else {
      toast({
        title: "Errore",
        description: result.message,
        variant: "destructive",
      })
    }
    setIsPending(false)
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <Card className="shadow-lg">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Avatar className="h-20 w-20 border-2 border-primary">
            <AvatarImage src={profile.profile_image_url || ""} alt={profile.full_name || "User"} />
            <AvatarFallback className="text-2xl">{profile.full_name?.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-2xl font-bold text-slate-800">Il Tuo Profilo</CardTitle>
            <CardDescription>Visualizza e aggiorna le tue informazioni personali.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nome Completo</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={isPending}
                />
              </div>
              {profile.role === "operator" && (
                <div className="space-y-2">
                  <Label htmlFor="stageName">Nome d'Arte</Label>
                  <Input
                    id="stageName"
                    value={stageName}
                    onChange={(e) => setStageName(e.target.value)}
                    disabled={isPending}
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={profile.email || ""} disabled />
                <p className="text-xs text-slate-500">L'email non può essere modificata.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Ruolo</Label>
                <Input id="role" value={profile.role} disabled className="capitalize" />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvataggio...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salva Modifiche
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
