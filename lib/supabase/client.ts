import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Client: Missing Supabase environment variables. Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in your environment.",
    )
  }

  // Add URL validation to provide a clearer error message
  try {
    new URL(supabaseUrl)
  } catch (error) {
    throw new Error(
      `Client: Invalid Supabase URL provided: "${supabaseUrl}". Please check the NEXT_PUBLIC_SUPABASE_URL environment variable.`,
    )
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
