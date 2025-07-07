"use client"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { isPayoutWindowOpen } from "@/lib/utils"
import { useFormStatus } from "react-dom"

interface RequestPayoutButtonProps {
  balance: number
}

export function RequestPayoutButton({ balance }: RequestPayoutButtonProps) {
  const { pending } = useFormStatus()
  const { isOpen, message } = isPayoutWindowOpen()
  const canRequest = isOpen && balance > 0

  if (!canRequest) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {/* The div is necessary for the tooltip to work on a disabled button */}
            <div className="inline-block">
              <Button disabled className="w-full md:w-auto">
                Richiedi Pagamento
              </Button>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{balance <= 0 ? "Il tuo saldo è zero." : message}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <Button type="submit" disabled={pending || balance <= 0} className="w-full md:w-auto">
      {pending ? "Richiesta in corso..." : "Richiedi Pagamento"}
    </Button>
  )
}
