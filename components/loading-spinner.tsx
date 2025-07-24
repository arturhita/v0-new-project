export default function LoadingSpinner() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-900">
      <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-blue-400 border-t-transparent"></div>
    </div>
  )
}
