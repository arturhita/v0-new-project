import type { Tables } from "./database"

export interface ChatMessage {
  id: string
  sender_id: string
  sender_name: string
  content: string
  timestamp: string
  is_system_message?: boolean
}

export type ChatSession = Tables<"chat_sessions"> & {
  client: Tables<"profiles"> | null
  operator: Tables<"profiles"> | null
  messages: ChatMessage[]
}
