import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DiventaEspertoClientPage } from "./DiventaEspertoClientPage"

export default async function DiventaEspertoPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    // Se l'utente non è loggato, non può candidarsi.
    // Lo reindirizziamo al login, ma con un messaggio che lo informa del perché.
    return redirect("/login?message=Devi accedere per poterti candidare come esperto.")
  }

  // Controlliamo se l'utente ha già un profilo da operatore o una candidatura
  const { data: operatorDetails, error } = await supabase
    .from("operator_details")
    .select("status")
    .eq("user_id", user.id)
    .single()

  const existingStatus = operatorDetails?.status

  return <DiventaEspertoClientPage user={user} existingStatus={existingStatus} />
}
