"use client"
import { Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface AIButtonProps {
  onClick: () => void
  className?: string
}

export function AIButton({ onClick, className }: AIButtonProps) {
  return (
    <Button
      onClick={onClick}
      className={cn(
        "relative bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white",
        className,
      )}
    >
      <span className="flex items-center">
        <Sparkles className="h-4 w-4 mr-2" />
        <span>Generate with AI</span>
      </span>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="star-1 absolute w-1 h-1 rounded-full bg-white opacity-0"></div>
        <div className="star-2 absolute w-1 h-1 rounded-full bg-white opacity-0"></div>
        <div className="star-3 absolute w-1 h-1 rounded-full bg-white opacity-0"></div>
      </div>
    </Button>
  )
}
