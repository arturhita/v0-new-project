import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isPayoutWindowOpen(): { isOpen: boolean; message: string } {
  const today = new Date().getDate()
  const isOpen = (today >= 1 && today <= 5) || (today >= 16 && today <= 20)
  const message = isOpen
    ? "La finestra di pagamento è aperta."
    : "Le richieste di pagamento sono disponibili solo dall'1 al 5 e dal 16 al 20 di ogni mese."
  return { isOpen, message }
}
