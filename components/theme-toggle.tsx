"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Moon, Sun, Monitor } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Ensure component is mounted to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="w-[144px] h-10"></div> // Placeholder with same width to prevent layout shift
  }

  const themes = [
    { name: "light", icon: Sun },
    { name: "system", icon: Monitor },
    { name: "dark", icon: Moon },
  ]

  return (
    <div className="inline-flex items-center rounded-full border p-1 bg-background">
      {themes.map(({ name, icon: Icon }) => {
        const isActive = theme === name
        return (
          <Button
            key={name}
            variant="ghost"
            size="sm"
            onClick={() => setTheme(name)}
            className={`
              rounded-full px-3 py-1.5 transition-all
              ${
                isActive ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-muted hover:text-muted-foreground"
              }
            `}
            aria-label={`Switch to ${name} theme`}
          >
            <Icon className="h-4 w-4 mr-1.5" />
            <span className="capitalize">{name}</span>
          </Button>
        )
      })}
    </div>
  )
}
