/**
 * Trasforma qualsiasi dato, in particolare quelli provenienti da Supabase,
 * in un Plain Old JavaScript Object (POJO). Questo rimuove qualsiasi getter
 * o proxy, rendendo l'oggetto sicuro da modificare e passare ai componenti client.
 * @param data Il dato da sanificare.
 * @returns Un oggetto JavaScript puro e sicuro.
 */
export function sanitizeData<T>(data: T): T {
  if (!data) return data;
  // La clonazione profonda è il modo più affidabile per rimuovere i getter.
  return JSON.parse(JSON.stringify(data));
}
