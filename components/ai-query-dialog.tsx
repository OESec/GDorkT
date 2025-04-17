"use client"

import { useState } from "react"
import { Sparkles, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

interface AIQueryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onQueryGenerated: (query: string) => void
}

export function AIQueryDialog({ open, onOpenChange, onQueryGenerated }: AIQueryDialogProps) {
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedQuery, setGeneratedQuery] = useState("")

  // Simulate AI query generation
  const generateQuery = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    setGeneratedQuery("")

    // Simulate API call with a delay
    setTimeout(() => {
      // Example AI-generated queries based on different prompts
      let result = ""
      const promptLower = prompt.toLowerCase()

      if (promptLower.includes("password") || promptLower.includes("credential")) {
        result = 'site:example.com intext:"username" AND intext:"password" OR intext:"credentials"'
      } else if (promptLower.includes("config") || promptLower.includes("configuration")) {
        result = 'site:example.com filetype:conf OR filetype:config OR filetype:env OR intitle:"configuration"'
      } else if (promptLower.includes("api") || promptLower.includes("key")) {
        result = 'site:example.com intext:"api_key" OR intext:"apikey" OR intext:"secret_key" -intext:"example"'
      } else if (promptLower.includes("backup") || promptLower.includes("database")) {
        result = "site:example.com filetype:sql OR filetype:bak OR filetype:backup OR ext:dump"
      } else if (promptLower.includes("login") || promptLower.includes("admin")) {
        result = 'site:example.com inurl:login OR inurl:admin OR inurl:signin intitle:"login"'
      } else {
        // Default query if no specific pattern is matched
        result = `site:example.com ${prompt.replace(/[^\w\s]/gi, "")}`
      }

      setGeneratedQuery(result)
      setIsGenerating(false)
    }, 1500)
  }

  const handleUseQuery = () => {
    onQueryGenerated(generatedQuery)
    onOpenChange(false)
    setPrompt("")
    setGeneratedQuery("")
  }

  const handleClearQuery = () => {
    setGeneratedQuery("")
    setPrompt("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Sparkles className="h-5 w-5 mr-2 text-blue-500" />
            AI Query Generator
          </DialogTitle>
          <DialogDescription>
            Describe what you're looking for, and AI will generate a Google dork query for you.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Textarea
              placeholder="E.g., 'Find exposed API keys on a website' or 'Discover login pages with potential vulnerabilities'"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          {generatedQuery && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Generated Query:</div>
              <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-md border border-blue-100 dark:border-blue-800 font-mono text-sm">
                {generatedQuery}
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {generatedQuery && (
            <Button variant="outline" onClick={handleClearQuery} className="text-red-500 hover:text-red-700">
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}
          {generatedQuery ? (
            <Button onClick={handleUseQuery} className="bg-blue-600 hover:bg-blue-700 text-white">
              Use This Query
            </Button>
          ) : (
            <Button
              onClick={generateQuery}
              disabled={isGenerating || !prompt.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
