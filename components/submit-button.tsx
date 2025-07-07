"use client"

import type React from "react"

import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface SubmitButtonProps {
  defaultText: string
  loadingText: string
  icon?: React.ReactNode
  className?: string
}

export function SubmitButton({ defaultText, loadingText, icon, className }: SubmitButtonProps) {
  const { pending } = useFormStatus()

  return (
    <Button
      size="lg"
      type="submit"
      disabled={pending}
      className={className || "bg-gradient-to-r from-sky-500 to-cyan-600 text-white shadow-md hover:opacity-90"}
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          {loadingText}
        </>
      ) : (
        <>
          {icon}
          {defaultText}
        </>
      )}
    </Button>
  )
}
