import type { Metadata } from "next"
import DiventaEspertoClientPage from "./DiventaEspertoClientPage"

export const metadata: Metadata = {
  title: "Diventa Esperto - Moonthir",
  description: "Unisciti alla nostra squadra di esperti. Invia la tua candidatura oggi stesso.",
}

export default function DiventaEspertoPage() {
  return <DiventaEspertoClientPage />
}
