import { createAdminClient } from "@/lib/supabase/admin"
import { AlertCircle, CheckCircle } from "lucide-react"

export default async function DiagnosticsPage() {
  const supabase = createAdminClient()
  const { data: operators, error } = await supabase
    .from("profiles")
    .select("full_name, stage_name, role, status")
    .eq("role", "operator")

  if (error) {
    return (
      <div className="p-8 bg-slate-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-4 text-slate-800">Errore Diagnostica</h1>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Errore Database:</strong>
            <span className="block sm:inline"> Impossibile caricare i dati degli operatori: {error.message}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-slate-800">Strumento di Diagnostica Operatori</h1>
        <p className="mb-6 text-slate-600">
          Questa pagina è la fonte della verità. Mostra i dati <strong>reali</strong> degli operatori nel tuo database.
        </p>

        <div
          className="bg-amber-100 border-l-4 border-amber-500 text-amber-800 p-4 mb-8 rounded-md shadow-sm"
          role="alert"
        >
          <div className="flex">
            <div className="py-1">
              <AlertCircle className="h-6 w-6 text-amber-500 mr-4" />
            </div>
            <div>
              <p className="font-bold text-lg">Azione Richiesta: Risolvi l'errore "Not Found"</p>
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>Trova l'operatore che vuoi visualizzare nella tabella qui sotto.</li>
                <li>
                  Seleziona e copia il valore <strong>esatto</strong> dalla colonna `Nome d'Arte (per URL)`.
                </li>
                <li>
                  Incolla questo valore nell'URL del tuo sito. <br />
                  Esempio: se il nome d'arte è `AstroGuida`, l'URL corretto è <code>/operator/AstroGuida</code>.
                </li>
                <li>
                  Se l'operatore che cerchi (es. "luna-stellare") <strong>non è in questa lista</strong>, significa che
                  non esiste nel database con il ruolo 'operator', e questo è il motivo dell'errore.
                </li>
              </ol>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-100">
                <tr>
                  <th className="py-3 px-4 md:px-6 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Nome Completo
                  </th>
                  <th className="py-3 px-4 md:px-6 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Nome d'Arte (per URL)
                  </th>
                  <th className="py-3 px-4 md:px-6 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Stato
                  </th>
                  <th className="py-3 px-4 md:px-6 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Verifica
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {operators && operators.length > 0 ? (
                  operators.map((op, index) => (
                    <tr key={index} className="hover:bg-slate-50">
                      <td className="py-4 px-4 md:px-6 whitespace-nowrap text-slate-800">{op.full_name}</td>
                      <td className="py-4 px-4 md:px-6 whitespace-nowrap font-mono text-indigo-600 bg-indigo-50">
                        {op.stage_name}
                      </td>
                      <td className="py-4 px-4 md:px-6 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            op.status === "Attivo" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {op.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 md:px-6 whitespace-nowrap text-green-600">
                        <div className="flex items-center">
                          <CheckCircle className="h-5 w-5 mr-1" />
                          <span>OK</span>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 px-4 text-center text-slate-500">
                      <AlertCircle className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                      <p className="font-semibold">Nessun operatore trovato nel database.</p>
                      <p className="text-sm">Non ci sono profili con `role` = `operator`.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
