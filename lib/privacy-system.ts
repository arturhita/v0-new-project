// Sistema di privacy per proteggere i dati utente
export interface UserPrivacySettings {
  // Solo il nickname è pubblico
  nickname: string

  // Dati sempre privati
  privateData: {
    firstName: string
    lastName: string
    email: string
    phone: string
    dateOfBirth: string
    address?: string
  }

  // Impostazioni privacy
  allowMessages: boolean
  allowCallRequests: boolean
  allowEmailNotifications: boolean
}

export class PrivacyManager {
  // Restituisce solo i dati pubblici dell'utente
  static getPublicProfile(user: UserPrivacySettings) {
    return {
      nickname: user.nickname,
      avatar: user.avatar || null,
      // Nessun altro dato personale
    }
  }

  // Verifica se l'utente può essere contattato
  static canContact(user: UserPrivacySettings, contactType: "message" | "call") {
    switch (contactType) {
      case "message":
        return user.allowMessages
      case "call":
        return user.allowCallRequests
      default:
        return false
    }
  }

  // Maschera i dati sensibili nei log
  static maskSensitiveData(data: any) {
    const masked = { ...data }

    if (masked.email) {
      masked.email = masked.email.replace(/(.{2}).*(@.*)/, "$1***$2")
    }

    if (masked.phone) {
      masked.phone = masked.phone.replace(/(.{3}).*(.{2})/, "$1***$2")
    }

    if (masked.firstName) {
      masked.firstName = masked.firstName.charAt(0) + "***"
    }

    if (masked.lastName) {
      masked.lastName = masked.lastName.charAt(0) + "***"
    }

    return masked
  }

  // Valida che solo i dati autorizzati siano condivisi
  static validateDataSharing(requestedData: string[], allowedData: string[]) {
    return requestedData.every((field) => allowedData.includes(field))
  }
}

// Dati sempre pubblici (solo questi)
export const PUBLIC_USER_FIELDS = [
  "nickname",
  "avatar",
  "isOnline",
  "lastSeen", // solo se l'utente lo consente
]

// Dati sempre privati (mai condivisi)
export const PRIVATE_USER_FIELDS = [
  "firstName",
  "lastName",
  "email",
  "phone",
  "dateOfBirth",
  "address",
  "paymentMethods",
  "realName",
]
