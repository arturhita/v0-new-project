import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export function LoadingSpinner({
  className,
  fullScreen = false,
}: {
  className?: string
  fullScreen?: boolean
}) {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <Loader2 className={cn("h-16 w-16 animate-spin text-blue-500", className)} />
      </div>
    )
  }
  return <Loader2 className={cn("h-8 w-8 animate-spin", className)} />
}
