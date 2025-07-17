import { createAdminClient } from "@/lib/supabase/admin"

export default async function DiagnosticsPage() {
  const supabase = createAdminClient()
  const { data: operators, error } = await supabase
    .from("profiles")
    .select("full_name, stage_name, role, status")
    .eq("role", "operator")

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Errore Diagnostica</h1>
        <p className="text-red-500">Impossibile caricare i dati degli operatori: {error.message}</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-2">Diagnostica Operatori</h1>
      <p className="mb-6 text-slate-600">
        Questa pagina mostra i dati grezzi degli operatori dal database per aiutarti a risolvere problemi.
      </p>

      <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6" role="alert">
        <p className="font-bold">Come usare questa pagina:</p>
        <ol className="list-decimal list-inside mt-2">
          <li>Trova l'operatore che vuoi visualizzare nella tabella qui sotto.</li>
          <li>
            Copia il valore <strong>esatto</strong> dalla colonna `Nome d'Arte (stage_name)`.
          </li>
          <li>
            Incolla questo valore nell'URL del sito. Esempio: se il nome d'arte è `MiaOperatrice`, visita{" "}
            <code>/operator/MiaOperatrice</code>.
          </li>
        </ol>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr className="bg-slate-100">
              <th className="py-2 px-4 border-b text-left">Nome Completo</th>
              <th className="py-2 px-4 border-b text-left">Nome d'Arte (stage_name)</th>
              <th className="py-2 px-4 border-b text-left">Ruolo</th>
              <th className="py-2 px-4 border-b text-left">Stato</th>
            </tr>
          </thead>
          <tbody>
            {operators && operators.length > 0 ? (
              operators.map((op, index) => (
                <tr key={index} className="hover:bg-slate-50">
                  <td className="py-2 px-4 border-b">{op.full_name}</td>
                  <td className="py-2 px-4 border-b font-mono bg-slate-100">{op.stage_name}</td>
                  <td className="py-2 px-4 border-b">{op.role}</td>
                  <td className="py-2 px-4 border-b">{op.status}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-4 px-4 text-center text-slate-500">
                  Nessun operatore trovato nel database.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
