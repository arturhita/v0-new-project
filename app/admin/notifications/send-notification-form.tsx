"use client"

import { useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useToast } from "@/components/ui/use-toast"
import { sendBroadcastNotification } from "@/lib/actions/notifications.actions"

const formSchema = z.object({
  title: z.string().min(1, "Il titolo è obbligatorio."),
  message: z.string().min(1, "Il messaggio è obbligatorio."),
  target_role: z.enum(["all", "client", "operator"]),
})

export function SendNotificationForm() {
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      message: "",
      target_role: "all",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const formData = new FormData()
    formData.append("title", values.title)
    formData.append("message", values.message)
    formData.append("target_role", values.target_role)

    startTransition(async () => {
      const result = await sendBroadcastNotification(formData)
      if (result.error) {
        toast({ title: "Errore", description: result.error, variant: "destructive" })
      } else {
        toast({ title: "Successo!", description: result.success })
        form.reset()
      }
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Titolo</FormLabel>
              <FormControl>
                <Input placeholder="Aggiornamento importante" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Messaggio</FormLabel>
              <FormControl>
                <Textarea placeholder="Scrivi qui il tuo messaggio..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="target_role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Destinatari</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona i destinatari" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="all">Tutti</SelectItem>
                  <SelectItem value="client">Solo Clienti</SelectItem>
                  <SelectItem value="operator">Solo Operatori</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending}>
          {isPending ? "Invio in corso..." : "Invia Notifica"}
        </Button>
      </form>
    </Form>
  )
}
