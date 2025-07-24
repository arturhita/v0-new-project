export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div
        className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-amber-400 border-t-transparent"
        role="status"
        aria-label="loading"
      ></div>
      <p className="text-white/80">Caricamento...</p>
    </div>
  )
}
