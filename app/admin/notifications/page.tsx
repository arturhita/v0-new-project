"use client";

import { useTransition, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Send, RefreshCw } from 'lucide-react';
import { sendBroadcastNotification } from "@/lib/actions/notifications.actions";
import { toast } from "sonner";

export default function SystemNotificationsPage() {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await sendBroadcastNotification(formData);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(result.success);
        formRef.current?.reset();
      }
    });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-3xl font-bold tracking-tight text-slate-800">Notifiche di Sistema</h1>
      <p className="text-slate-600">Invia comunicazioni a utenti specifici, gruppi o a tutti.</p>

      <form ref={formRef} action={handleSubmit} className="p-6 bg-white rounded-lg shadow-xl space-y-6">
        <div>
          <Label className="text-md font-medium text-slate-700">
            Destinatari
          </Label>
          <RadioGroup
            name="recipientType"
            defaultValue="all"
            className="mt-2 flex flex-col sm:flex-row gap-4 sm:gap-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="r1" />
              <Label htmlFor="r1" className="font-normal text-slate-600">
                Tutti
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="users" id="r2" />
              <Label htmlFor="r2" className="font-normal text-slate-600">
                Solo Utenti
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="operators" id="r3" />
              <Label htmlFor="r3" className="font-normal text-slate-600">
                Solo Operatori
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label htmlFor="notificationTitle" className="text-md font-medium text-slate-700">
            Titolo Notifica
          </Label>
          <Input
            id="notificationTitle"
            name="title"
            type="text"
            required
            placeholder="Es: Aggiornamento Importante sulla Piattaforma"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="notificationMessage" className="text-md font-medium text-slate-700">
            Messaggio
          </Label>
          <Textarea
            id="notificationMessage"
            name="message"
            required
            placeholder="Scrivi qui il tuo messaggio dettagliato..."
            className="mt-1 min-h-[120px]"
          />
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="w-full bg-gradient-to-r from-primary to-primary/80 text-white shadow-md hover:opacity-90 py-3 text-base"
        >
          {isPending ? (
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Send className="mr-2 h-4 w-4" />
          )}
          Invia Notifica
        </Button>
      </form>
    </div>
  );
}
