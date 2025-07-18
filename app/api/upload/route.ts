import { put } from "@vercel/blob"
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request): Promise<NextResponse> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  // Check if user is admin
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single()

  if (profileError || profile?.role !== "admin") {
    return new NextResponse("Forbidden", { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const filename = searchParams.get("filename")

  if (!filename || !request.body) {
    return new NextResponse("Missing filename or body", { status: 400 })
  }

  const blob = await put(filename, request.body, {
    access: "public",
  })

  return NextResponse.json(blob)
}
