"use server"

import { revalidatePath } from "next/cache"

export interface UserWithStats {
  id: string
  email: string
  full_name: string
  role: "client" | "operator" | "admin"
  status: "active" | "suspended" | "pending"
  created_at: Date
  last_login?: Date
  avatar_url?: string
  phone?: string
  wallet_balance?: number
  total_consultations?: number
  total_spent?: number
  total_earned?: number
  rating?: number
  reviews_count?: number
}

// Mock users database
const mockUsers: UserWithStats[] = [
  {
    id: "user_1",
    email: "mario.rossi@email.com",
    full_name: "Mario Rossi",
    role: "client",
    status: "active",
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    last_login: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    wallet_balance: 45.5,
    total_consultations: 12,
    total_spent: 234.5,
  },
  {
    id: "user_2",
    email: "luna.stellare@email.com",
    full_name: "Luna Stellare",
    role: "operator",
    status: "active",
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    last_login: new Date(Date.now() - 1 * 60 * 60 * 1000),
    total_consultations: 89,
    total_earned: 1250.75,
    rating: 4.8,
    reviews_count: 45,
  },
  {
    id: "user_3",
    email: "giulia.verde@email.com",
    full_name: "Giulia Verde",
    role: "client",
    status: "suspended",
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    last_login: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    wallet_balance: 0,
    total_consultations: 3,
    total_spent: 67.0,
  },
]

export async function getUsersWithStats(
  role?: "client" | "operator" | "admin",
  status?: "active" | "suspended" | "pending",
  limit = 50,
) {
  try {
    let filteredUsers = mockUsers

    if (role && role !== "all") {
      filteredUsers = filteredUsers.filter((user) => user.role === role)
    }

    if (status && status !== "all") {
      filteredUsers = filteredUsers.filter((user) => user.status === status)
    }

    const users = filteredUsers.sort((a, b) => b.created_at.getTime() - a.created_at.getTime()).slice(0, limit)

    return {
      success: true,
      users,
      total: filteredUsers.length,
    }
  } catch (error) {
    console.error("Error fetching users with stats:", error)
    return {
      success: false,
      users: [],
      total: 0,
    }
  }
}

export async function updateUserStatus(userId: string, status: "active" | "suspended" | "pending") {
  try {
    const user = mockUsers.find((u) => u.id === userId)
    if (!user) {
      return {
        success: false,
        message: "Utente non trovato",
      }
    }

    user.status = status

    revalidatePath("/admin/users")

    return {
      success: true,
      message: `Status utente aggiornato a ${status}`,
    }
  } catch (error) {
    console.error("Error updating user status:", error)
    return {
      success: false,
      message: "Errore nell'aggiornamento dello status",
    }
  }
}

export async function addWalletCredit(userId: string, amount: number, reason: string) {
  try {
    const user = mockUsers.find((u) => u.id === userId)
    if (!user) {
      return {
        success: false,
        message: "Utente non trovato",
      }
    }

    user.wallet_balance = (user.wallet_balance || 0) + amount

    revalidatePath("/admin/users")

    return {
      success: true,
      message: `Aggiunti €${amount.toFixed(2)} al wallet dell'utente`,
    }
  } catch (error) {
    console.error("Error adding wallet credit:", error)
    return {
      success: false,
      message: "Errore nell'aggiunta del credito",
    }
  }
}

export async function issueRefund(userId: string, amount: number, reason: string) {
  try {
    const user = mockUsers.find((u) => u.id === userId)
    if (!user) {
      return {
        success: false,
        message: "Utente non trovato",
      }
    }

    user.wallet_balance = (user.wallet_balance || 0) + amount

    revalidatePath("/admin/users")

    return {
      success: true,
      message: `Rimborso di €${amount.toFixed(2)} emesso per: ${reason}`,
    }
  } catch (error) {
    console.error("Error issuing refund:", error)
    return {
      success: false,
      message: "Errore nell'emissione del rimborso",
    }
  }
}

export async function getUserById(userId: string) {
  try {
    const user = mockUsers.find((u) => u.id === userId)
    if (!user) {
      return {
        success: false,
        user: null,
      }
    }

    return {
      success: true,
      user,
    }
  } catch (error) {
    console.error("Error fetching user:", error)
    return {
      success: false,
      user: null,
    }
  }
}

export async function deleteUser(userId: string) {
  try {
    const userIndex = mockUsers.findIndex((u) => u.id === userId)
    if (userIndex === -1) {
      return {
        success: false,
        message: "Utente non trovato",
      }
    }

    mockUsers.splice(userIndex, 1)

    revalidatePath("/admin/users")

    return {
      success: true,
      message: "Utente eliminato con successo",
    }
  } catch (error) {
    console.error("Error deleting user:", error)
    return {
      success: false,
      message: "Errore nell'eliminazione dell'utente",
    }
  }
}

export async function getUserStats() {
  try {
    const totalUsers = mockUsers.length
    const activeUsers = mockUsers.filter((u) => u.status === "active").length
    const totalClients = mockUsers.filter((u) => u.role === "client").length
    const totalOperators = mockUsers.filter((u) => u.role === "operator").length
    const totalRevenue = mockUsers.reduce((sum, user) => sum + (user.total_spent || 0), 0)

    return {
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        totalClients,
        totalOperators,
        totalRevenue,
        suspendedUsers: mockUsers.filter((u) => u.status === "suspended").length,
        pendingUsers: mockUsers.filter((u) => u.status === "pending").length,
      },
    }
  } catch (error) {
    console.error("Error fetching user stats:", error)
    return {
      success: false,
      stats: null,
    }
  }
}
