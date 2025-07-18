"use client"

import { useTransition } from "react"
import { useForm } from "react-hook-form"
import { sendBroadcastNotification } from "@/lib/actions/notifications.actions"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

type FormData = {
  title: string
  message: string
  target_role: "all" | "client" | "operator"
}

export function SendNotificationForm() {
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()
  const { register, handleSubmit, reset, control, setValue } = useForm<FormData>()

  const onSubmit = (data: FormData) => {
    const formData = new FormData()
    formData.append("title", data.title)
    formData.append("message", data.message)
    formData.append("target_role", data.target_role)

    startTransition(async () => {
      const result = await sendBroadcastNotification(formData)
      if (result.error) {
        toast({ title: "Errore", description: result.error, variant: "destructive" })
      } else {
        toast({ title: "Successo", description: result.success })
        reset()
      }
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card className="mt-4">
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titolo</Label>
            <Input id="title" {...register("title", { required: true })} placeholder="Es. Manutenzione Programmata" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Messaggio</Label>
            <Textarea
              id="message"
              {...register("message", { required: true })}
              placeholder="Descrivi qui il contenuto della notifica..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="target_role">Destinatari</Label>
            <Select
              onValueChange={(value: "all" | "client" | "operator") => setValue("target_role", value)}
              defaultValue="all"
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleziona un gruppo di destinatari" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti</SelectItem>
                <SelectItem value="client">Solo Clienti</SelectItem>
                <SelectItem value="operator">Solo Operatori</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Invio in corso..." : "Invia Notifica"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
