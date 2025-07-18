import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getInitials(name: string | null | undefined): string {
  if (!name) {
    return "??"
  }

  // Se è un'email, prende la prima lettera
  if (name.includes("@")) {
    return name[0].toUpperCase()
  }

  const nameParts = name.trim().split(/\s+/).filter(Boolean)

  if (nameParts.length === 0) {
    return "??"
  }

  if (nameParts.length === 1) {
    // Ritorna le prime due lettere se è una parola singola
    return nameParts[0].length > 1 ? nameParts[0].slice(0, 2).toUpperCase() : nameParts[0].toUpperCase()
  }

  // Ritorna l'iniziale del primo e dell'ultimo nome
  return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
}
