interface LoadingSpinnerProps {
  fullScreen?: boolean
  message?: string
}

export default function LoadingSpinner({ fullScreen = false, message = "Caricamento..." }: LoadingSpinnerProps) {
  const spinner = (
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-sky-500/30 border-t-sky-500 rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-white text-lg">{message}</p>
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {spinner}
      </div>
    )
  }

  return spinner
}
