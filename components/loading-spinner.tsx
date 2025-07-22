import { cn } from "@/lib/utils"

export function LoadingSpinner({ className, fullScreen = false }: { className?: string; fullScreen?: boolean }) {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <div className={cn("animate-spin rounded-full h-12 w-12 border-b-2 border-primary", className)} />
      </div>
    )
  }

  return <div className={cn("animate-spin rounded-full h-8 w-8 border-b-2 border-primary", className)} />
}
