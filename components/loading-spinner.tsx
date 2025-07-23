export function LoadingSpinner({ className, fullScreen }: { className?: string; fullScreen?: boolean }) {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-sky-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div
      className={`h-8 w-8 animate-spin rounded-full border-4 border-solid border-sky-500 border-t-transparent ${className}`}
    />
  )
}

export default LoadingSpinner
