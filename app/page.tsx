"use client"

import { DorkingTool } from "@/components/dorking-tool"
import { ThemeToggle } from "@/components/theme-toggle"
import { Github } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="container mx-auto py-8 px-4 flex-grow">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Google Dorking Tool</h1>
            <p className="text-muted-foreground">Build advanced Google search queries to find specific information</p>
          </div>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full"
                    onClick={() => window.open("https://github.com/OESec/GDorkT", "_blank")}
                    aria-label="View on GitHub"
                  >
                    <Github className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View on GitHub</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <ThemeToggle />
          </div>
        </div>
        <DorkingTool />
      </div>
      <div className="container mx-auto px-4 py-4">
        <div className="text-right text-sm text-muted-foreground">
          Copyright 2025 | Idea and Concept of E.O. | 10th April 2025
        </div>
      </div>
    </div>
  )
}
