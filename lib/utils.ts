import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | null | undefined, currency = "EUR"): string {
  if (amount === null || amount === undefined) {
    amount = 0
  }
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: currency,
  }).format(amount)
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "N/A"
  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date))
}
