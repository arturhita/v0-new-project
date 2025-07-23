import { Loader2 } from "lucide-react"

interface LoadingSpinnerProps {
  fullScreen?: boolean
  message?: string
}

export default function LoadingSpinner({ fullScreen = false, message }: LoadingSpinnerProps) {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm">
        <Loader2 className="h-12 w-12 animate-spin text-amber-400" />
        {message && <p className="mt-4 text-lg text-white">{message}</p>}
      </div>
    )
  }

  return <Loader2 className="h-6 w-6 animate-spin text-amber-400" />
}
