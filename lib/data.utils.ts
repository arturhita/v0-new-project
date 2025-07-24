/**
 * Esegue una clonazione profonda e sicura di un oggetto, garantendo che sia un
 * Plain Old JavaScript Object (POJO), privo di getter, proxy o altre
 * proprietà speciali introdotte da librerie esterne come Supabase.
 * Questo è il modo più robusto per garantire una vera de-referenziazione e
 * pulizia dell'oggetto, rendendolo sicuro per lo stato di React.
 * @param obj L'oggetto da "purificare".
 * @returns Un clone profondo e "pulito" dell'oggetto.
 */
export const sanitizeData = (obj: any): any => {
  if (obj === null || obj === undefined) {
    return obj
  }
  // L'approccio JSON.parse(JSON.stringify()) è il modo più efficace
  // per creare un clone profondo e rimuovere qualsiasi getter/setter.
  return JSON.parse(JSON.stringify(obj))
}
