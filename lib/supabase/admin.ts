import { createClient } from "@supabase/supabase-js"

// IMPORTANT: This should only be used in server-side code that needs to bypass RLS.
// Never expose this client or its credentials to the browser.
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export const createAdminClient = () => supabaseAdmin
