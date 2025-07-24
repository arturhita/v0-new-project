/**
 * Esegue una clonazione profonda e sicura di un oggetto utilizzando JSON.
 * Questo metodo garantisce che l'oggetto restituito sia un Plain Old JavaScript Object (POJO),
 * privo di getter, proxy o altre proprietà speciali introdotte da librerie esterne.
 * @param obj L'oggetto da clonare.
 * @returns Un clone profondo e "pulito" dell'oggetto.
 */
export const sanitizeData = (obj: any): any => {
  if (obj === null || obj === undefined) {
    return obj
  }
  // L'approccio JSON.parse(JSON.stringify()) è il modo più robusto
  // per garantire una vera e propria de-referenziazione e pulizia dell'oggetto.
  return JSON.parse(JSON.stringify(obj))
}
