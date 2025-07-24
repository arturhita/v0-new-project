/**
 * Trasforma i dati (es. da Supabase) in un Plain Old JavaScript Object (POJO).
 * Questo rimuove qualsiasi getter/setter e previene l'errore "Cannot set property...".
 * È il passaggio più critico per garantire la stabilità dell'applicazione.
 * @param data I dati da "sanificare".
 * @returns Un oggetto JavaScript pulito e sicuro da modificare.
 */
export function sanitizeData<T>(data: T): T {
  if (!data) return data
  return JSON.parse(JSON.stringify(data))
}
