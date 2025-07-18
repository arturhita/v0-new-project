"use client"

import { useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { sendBroadcastNotification } from "@/lib/actions/notifications.actions"
import { toast } from "sonner"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

const formSchema = z.object({
  title: z.string().min(1, "Il titolo è obbligatorio."),
  message: z.string().min(1, "Il messaggio è obbligatorio."),
  target_role: z.enum(["all", "client", "operator"]),
})

export function SendNotificationForm() {
  const [isPending, startTransition] = useTransition()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      message: "",
      target_role: "all",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    const formData = new FormData()
    formData.append("title", values.title)
    formData.append("message", values.message)
    formData.append("target_role", values.target_role)

    startTransition(async () => {
      const result = await sendBroadcastNotification(formData)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Notifica inviata con successo!")
        form.reset()
      }
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Titolo</FormLabel>
              <FormControl>
                <Input placeholder="Nuova promozione!" {...field} />
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
                <Textarea placeholder="Abbiamo una nuova offerta per te..." {...field} />
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
                    <SelectValue placeholder="Seleziona un gruppo" />
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
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Invio in corso..." : "Invia Notifica"}
        </Button>
      </form>
    </Form>
  )
}
