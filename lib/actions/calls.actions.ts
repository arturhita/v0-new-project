"use server"
import { createClient } from "@/lib/supabase/server"
import { twilioClient } from "@/lib/twilio"

export async function initiateCallAction(operatorId: string) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  // In a real app, you would fetch the operator's actual phone number
  const operatorPhoneNumber = process.env.NEXT_PUBLIC_OPERATOR_PHONE_NUMBER!
  const clientPhoneNumber = user.phone || "" // Assuming user has a phone number in their profile
  const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER!
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!

  try {
    const call = await twilioClient.calls.create({
      twiml: `<Response><Dial>${operatorPhoneNumber}</Dial></Response>`,
      to: clientPhoneNumber,
      from: twilioPhoneNumber,
      statusCallback: `${baseUrl}/api/calls/status`,
      statusCallbackEvent: ["initiated", "ringing", "answered", "completed"],
    })
    return { data: { callSid: call.sid } }
  } catch (error: any) {
    return { error: error.message }
  }
}

export async function endCallAction(callSid: string) {
  try {
    await twilioClient.calls(callSid).update({ status: "completed" })
    return { success: true }
  } catch (error: any) {
    return { error: error.message }
  }
}

export async function getUserWalletAction() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const { data, error } = await supabase.from("wallets").select("balance").eq("user_id", user.id).single()

  if (error) return { error: error.message }
  return { data }
}

export async function processCallBillingAction(callSid: string, duration: number) {
  // Placeholder for billing logic
  console.log(`Billing for call ${callSid} with duration ${duration} seconds.`)
  return { success: true }
}

export async function getCallHistoryAction() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  // Placeholder for fetching call history
  return { data: [] }
}
