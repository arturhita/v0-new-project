// This utility provides a robust way to deep-clone data,
// ensuring that objects returned from Supabase are plain JavaScript objects
// and safe to use in React state.
export function sanitizeData<T>(data: T): T {
  if (data === null || data === undefined) {
    return data
  }
  try {
    // The simplest and most effective way to deep-clone and remove any getters/setters
    return JSON.parse(JSON.stringify(data))
  } catch (error) {
    console.error("Failed to sanitize data:", error)
    // Fallback to returning the original data if cloning fails
    return data
  }
}
