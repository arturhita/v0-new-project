import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility per formattare valute
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(amount)
}

// Utility per formattare date
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("it-IT", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date)
}

// Utility per formattare tempo relativo
export function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return "Ora"
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min fa`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ore fa`
  return `${Math.floor(diffInSeconds / 86400)} giorni fa`
}

// Utility per generare ID casuali
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

// Utility per validare email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Utility per truncare testo
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substr(0, maxLength) + "..."
}

// Utility per calcolare rating stelle
export function calculateStars(rating: number): { full: number; half: boolean; empty: number } {
  const full = Math.floor(rating)
  const half = rating % 1 >= 0.5
  const empty = 5 - full - (half ? 1 : 0)

  return { full, half, empty }
}

// Utility per generare colori casuali
export function getRandomColor(): string {
  const colors = [
    "bg-pink-500",
    "bg-purple-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-red-500",
    "bg-indigo-500",
    "bg-teal-500",
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

// Utility per debounce
export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Utility per localStorage sicuro
export const storage = {
  get: (key: string) => {
    if (typeof window === "undefined") return null
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch {
      return null
    }
  },
  set: (key: string, value: any) => {
    if (typeof window === "undefined") return
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Silently fail
    }
  },
  remove: (key: string) => {
    if (typeof window === "undefined") return
    try {
      localStorage.removeItem(key)
    } catch {
      // Silently fail
    }
  },
}

// Utility per gestire errori
export function handleError(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === "string") {
    return error
  }
  return "Si è verificato un errore sconosciuto"
}

// Utility per validare password
export function validatePassword(password: string): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push("La password deve essere di almeno 8 caratteri")
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("La password deve contenere almeno una lettera maiuscola")
  }

  if (!/[a-z]/.test(password)) {
    errors.push("La password deve contenere almeno una lettera minuscola")
  }

  if (!/\d/.test(password)) {
    errors.push("La password deve contenere almeno un numero")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// Utility per formattare numeri
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M"
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K"
  }
  return num.toString()
}

// Utility per calcolare percentuali
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0
  return Math.round((value / total) * 100)
}

// Utility per ordinare array
export function sortBy<T>(array: T[], key: keyof T, direction: "asc" | "desc" = "asc"): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key]
    const bVal = b[key]

    if (aVal < bVal) return direction === "asc" ? -1 : 1
    if (aVal > bVal) return direction === "asc" ? 1 : -1
    return 0
  })
}

// Utility per raggruppare array
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce(
    (groups, item) => {
      const group = String(item[key])
      groups[group] = groups[group] || []
      groups[group].push(item)
      return groups
    },
    {} as Record<string, T[]>,
  )
}
