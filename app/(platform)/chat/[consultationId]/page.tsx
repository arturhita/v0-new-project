import { getConsultationDetailsAndMessages } from "@/lib/actions/chat.actions"
import { ChatInterface } from "@/components/chat-interface"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function ChatPage({ params }: { params: { consultationId: string } }) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    // This should be handled by AuthProvider, but as a safeguard
    return notFound()
  }

  const consultationId = params.consultationId
  const { consultation, messages, error } = await getConsultationDetailsAndMessages(consultationId)

  if (error || !consultation) {
    // This could be due to lack of access (RLS) or the consultation not existing.
    console.error("Error fetching consultation:", error)
    return notFound()
  }

  // Determine the other participant by checking their profiles from the consultation object
  const otherParticipant =
    user.id === consultation.client_id ? consultation.operator_profile : consultation.client_profile

  // Ensure we have a valid other participant
  if (!otherParticipant) {
    console.error("Could not determine the other participant.")
    return notFound()
  }

  return (
    <div className="flex h-[calc(100vh-80px)] w-full flex-col">
      <ChatInterface
        initialConsultation={consultation}
        initialMessages={messages}
        currentUser={{ id: user.id }}
        otherParticipant={otherParticipant}
      />
    </div>
  )
}
