"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { register } from "@/lib/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, CheckCircle2 } from 'lucide-react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="gradient" className="w-full" disabled={pending}>
      {pending ? "Creazione account..." : "Registrati"}
    </Button>
  );
}

export function RegisterForm() {
  const [state, formAction] = useActionState(register, null);

  return (
    <form action={formAction} className="w-full space-y-6">
      {state?.error && (
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Errore di Registrazione</AlertTitle>
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
      {state?.success && (
         <Alert variant="default" className="bg-green-900/50 border-green-500/50 text-green-200">
           <CheckCircle2 className="h-4 w-4 text-green-400" />
           <AlertTitle>Successo!</AlertTitle>
           <AlertDescription>{state.success}</AlertDescription>
         </Alert>
      )}
      {!state?.success && (
        <>
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-gray-200/80">
              Nome Completo
            </Label>
            <Input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="Mario Rossi"
              required
              className="mt-1 bg-gray-900/60 border-yellow-500/30 text-white placeholder:text-gray-400/50 focus:ring-amber-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-200/80">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="tu@esempio.com"
              required
              className="mt-1 bg-gray-900/60 border-yellow-500/30 text-white placeholder:text-gray-400/50 focus:ring-amber-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-200/80">
              Password
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              className="mt-1 bg-gray-900/60 border-yellow-500/30 text-white placeholder:text-gray-400/50 focus:ring-amber-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-gray-200/80">
              Conferma Password
            </Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              className="mt-1 bg-gray-900/60 border-yellow-500/30 text-white placeholder:text-gray-400/50 focus:ring-amber-500"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              name="terms"
              className="border-amber-600 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
            />
            <label htmlFor="terms" className="text-sm text-gray-300/80">
              Accetto i{" "}
              <Link href="/legal/terms-and-conditions" className="underline hover:text-amber-300">
                Termini di Servizio
              </Link>
            </label>
          </div>
          <SubmitButton />
        </>
      )}
      <p className="text-center text-sm text-gray-400">
        Hai già un account?{" "}
        <Link href="/login" className="font-semibold text-amber-400 hover:underline">
          Accedi
        </Link>
      </p>
    </form>
  );
}
