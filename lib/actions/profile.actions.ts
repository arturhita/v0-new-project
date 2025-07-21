"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

// This type defines the shape of the data the client component will work with (camelCase)
export interface ProfileData {
  id: string
  email?: string
  name?: string | null
  surname?: string | null
  nickname?: string | null
  phone?: string | null
  dateOfBirth?: string | null
  gender?: string | null
  city?: string | null
  country?: string | null
  avatarUrl?: string | null
  bio?: string | null
  favoriteCategories?: string[] | null
  preferredLanguage?: string | null
  timezone?: string | null
  allowMessages?: boolean | null
  emailNotifications?: boolean | null
  pushNotifications?: boolean | null
  smsNotifications?: boolean | null
  marketingEmails?: boolean | null
  // Stats
  totalConsultations?: number
  totalSpent?: number
  averageRating?: number
  memberSince?: string
}

// Helper to map from DB (snake_case) to client (camelCase)
function mapToClient(dbProfile: any, user: any): ProfileData {
  return {
    id: dbProfile.id,
    email: user.email,
    name: dbProfile.name,
    surname: dbProfile.surname,
    nickname: dbProfile.nickname,
    phone: dbProfile.phone,
    dateOfBirth: dbProfile.date_of_birth,
    gender: dbProfile.gender,
    city: dbProfile.city,
    country: dbProfile.country,
    avatarUrl: dbProfile.avatar_url,
    bio: dbProfile.bio,
    favoriteCategories: dbProfile.favorite_categories,
    preferredLanguage: dbProfile.preferred_language,
    timezone: dbProfile.timezone,
    allowMessages: dbProfile.allow_messages,
    emailNotifications: dbProfile.email_notifications,
    pushNotifications: dbProfile.push_notifications,
    smsNotifications: dbProfile.sms_notifications,
    marketingEmails: dbProfile.marketing_emails,
    memberSince: user.created_at,
    // Dummy stats for now, as in the original component
    totalConsultations: 15,
    totalSpent: 245.5,
    averageRating: 4.8,
  }
}

export async function getAuthenticatedUserProfile(): Promise<ProfileData | null> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (error || !profile) {
    console.error("Error fetching profile, or profile not found:", error?.message)
    // Return a default structure for a new user
    return {
      id: user.id,
      email: user.email,
      memberSince: user.created_at,
      name: "",
      surname: "",
      nickname: "",
      phone: "",
      dateOfBirth: "",
      gender: "prefer-not-to-say",
      city: "",
      country: "",
      avatarUrl: "",
      bio: "",
      favoriteCategories: [],
      preferredLanguage: "it",
      timezone: "Europe/Rome",
      allowMessages: true,
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      marketingEmails: false,
      totalConsultations: 0,
      totalSpent: 0,
      averageRating: 0,
    }
  }

  return mapToClient(profile, user)
}

export async function updateUserProfile(profileData: ProfileData) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("User not authenticated")
  if (user.id !== profileData.id) throw new Error("Unauthorized update attempt")

  // Map from client (camelCase) to DB (snake_case)
  const dbUpdateData = {
    name: profileData.name,
    surname: profileData.surname,
    nickname: profileData.nickname,
    phone: profileData.phone,
    date_of_birth: profileData.dateOfBirth,
    gender: profileData.gender,
    city: profileData.city,
    country: profileData.country,
    avatar_url: profileData.avatarUrl,
    bio: profileData.bio,
    favorite_categories: profileData.favoriteCategories,
    preferred_language: profileData.preferredLanguage,
    timezone: profileData.timezone,
    allow_messages: profileData.allowMessages,
    email_notifications: profileData.emailNotifications,
    push_notifications: profileData.pushNotifications,
    sms_notifications: profileData.smsNotifications,
    marketing_emails: profileData.marketingEmails,
  }

  const { error } = await supabase.from("profiles").update(dbUpdateData).eq("id", user.id)

  if (error) {
    console.error("Error updating profile:", error)
    throw new Error("Could not update profile.")
  }

  revalidatePath("/(platform)/profile", "page")
  revalidatePath("/(platform)/dashboard/client", "page")

  redirect("/(platform)/dashboard/client")
}
