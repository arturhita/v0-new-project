import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    environment: process.env.NODE_ENV,
    services: {
      database: "pending", // Sarà 'connected' dopo Supabase
      payments: "pending", // Sarà 'connected' dopo Stripe
      communications: "pending", // Sarà 'connected' dopo Twilio
    },
  })
}
