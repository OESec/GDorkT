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
      // Extract domain if present in the prompt
      const domainMatch = prompt.match(/\b([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}\b/i)
      const domain = domainMatch ? domainMatch[0] : "example.com"

      // Check if the query is about subdomains
      const isSubdomainQuery = prompt.toLowerCase().includes("subdomain")

      // Example AI-generated queries based on different prompts
      let result = ""
      const promptLower = prompt.toLowerCase()

      // Check for URL pattern searches
      if (
        (promptLower.includes("url") || promptLower.includes("inurl")) &&
        (promptLower.includes("contain") || promptLower.includes("with") || promptLower.includes("has"))
      ) {
        // Try to extract the pattern they want to find in the URL
        const patternRegex = /(?:contains|with|has|in url)[\s"']*([^"'\s]+(?:["'\s][^"'\s]+)*)[\s"']*/i
        const patternMatch = prompt.match(patternRegex)

        if (patternMatch && patternMatch[1]) {
          const pattern = patternMatch[1].trim()
          result = isSubdomainQuery ? `site:*.${domain} inurl:"${pattern}"` : `site:${domain} inurl:"${pattern}"`
        } else {
          result = isSubdomainQuery ? `site:*.${domain} inurl:` : `site:${domain} inurl:`
        }
      }
      // Check for file type searches
      else if (promptLower.includes("file") || promptLower.includes("document") || promptLower.includes("filetype")) {
        const fileTypeRegex = /(?:file|document|filetype)[s\s]*(?:type)?[\s:]*([a-z0-9]{2,4})\b/i
        const fileTypeMatch = prompt.match(fileTypeRegex)

        const fileType = fileTypeMatch ? fileTypeMatch[1].toLowerCase() : "pdf"

        if (promptLower.includes("confidential") || promptLower.includes("secret") || promptLower.includes("private")) {
          result = isSubdomainQuery
            ? `site:*.${domain} filetype:${fileType} (confidential OR secret OR private OR restricted)`
            : `site:${domain} filetype:${fileType} (confidential OR secret OR private OR restricted)`
        } else {
          result = isSubdomainQuery ? `site:*.${domain} filetype:${fileType}` : `site:${domain} filetype:${fileType}`
        }
      }
      // Check for directory listings
      else if (
        promptLower.includes("directory") ||
        promptLower.includes("folder") ||
        promptLower.includes("index of")
      ) {
        result = isSubdomainQuery
          ? `site:*.${domain} intitle:"Index of" -inurl:(jsp|php|html|asp)`
          : `site:${domain} intitle:"Index of" -inurl:(jsp|php|html|asp)`
      }
      // Check for exposed credentials
      else if (
        promptLower.includes("password") ||
        promptLower.includes("credential") ||
        promptLower.includes("login")
      ) {
        // For login pages, use a more specific query
        if (
          promptLower.includes("login page") ||
          promptLower.includes("login pages") ||
          (promptLower.includes("login") && promptLower.includes("page"))
        ) {
          result = isSubdomainQuery
            ? `site:*.${domain} inurl:(login|admin|signin|portal) intitle:(login|admin|signin)`
            : `site:${domain} inurl:(login|admin|signin|portal) intitle:(login|admin|signin)`
        } else {
          result = isSubdomainQuery
            ? `site:*.${domain} intext:"username" AND intext:"password" OR intext:"credentials"`
            : `site:${domain} intext:"username" AND intext:"password" OR intext:"credentials"`
        }
      }
      // Check for configuration files
      else if (
        promptLower.includes("config") ||
        promptLower.includes("configuration") ||
        promptLower.includes("settings")
      ) {
        result = isSubdomainQuery
          ? `site:*.${domain} filetype:(conf|config|env|ini) OR intitle:"configuration"`
          : `site:${domain} filetype:(conf|config|env|ini) OR intitle:"configuration"`
      }
      // Check for API keys
      else if (promptLower.includes("api") || promptLower.includes("key") || promptLower.includes("token")) {
        result = isSubdomainQuery
          ? `site:*.${domain} intext:("api_key" OR "apikey" OR "secret_key" OR "token") -intext:"example"`
          : `site:${domain} intext:("api_key" OR "apikey" OR "secret_key" OR "token") -intext:"example"`
      }
      // Check for backup files
      else if (promptLower.includes("backup") || promptLower.includes("database") || promptLower.includes("dump")) {
        result = isSubdomainQuery
          ? `site:*.${domain} filetype:(sql|bak|backup|dump|old)`
          : `site:${domain} filetype:(sql|bak|backup|dump|old)`
      }
      // Check for admin or login pages
      else if (promptLower.includes("admin") || (promptLower.includes("login") && promptLower.includes("page"))) {
        result = isSubdomainQuery
          ? `site:*.${domain} inurl:(login|admin|signin|portal) intitle:(login|admin|signin)`
          : `site:${domain} inurl:(login|admin|signin|portal) intitle:(login|admin|signin)`
      }
      // Check for error messages
      else if (promptLower.includes("error") || promptLower.includes("exception") || promptLower.includes("warning")) {
        result = isSubdomainQuery
          ? `site:*.${domain} intext:("error" OR "exception" OR "warning" OR "stack trace" OR "syntax error")`
          : `site:${domain} intext:("error" OR "exception" OR "warning" OR "stack trace" OR "syntax error")`
      }
      // Default query if no specific pattern is matched
      else {
        // Extract key terms from the prompt
        const keyTerms = prompt
          .replace(/[^\w\s]/gi, " ")
          .split(/\s+/)
          .filter(
            (term) =>
              term.length > 3 &&
              !["find", "search", "look", "want", "need", "please", "query", "google", "dork"].includes(
                term.toLowerCase(),
              ),
          )
          .slice(0, 3)
          .join(" ")

        result = isSubdomainQuery ? `site:*.${domain} ${keyTerms}` : `site:${domain} ${keyTerms}`
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
