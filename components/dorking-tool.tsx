"use client"

import React from "react"
import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Check, Copy, ExternalLink, Search, Plus, X, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { AIButton } from "@/components/ai-button"
import { AIQueryDialog } from "@/components/ai-query-dialog"

// Define operator categories
const operatorCategories = [
  { id: "content", name: "Content Search", description: "Search within page content" },
  { id: "url", name: "URL & Domain", description: "Search within URLs and domains" },
  { id: "file", name: "File Types", description: "Search for specific file types" },
  { id: "meta", name: "Metadata & Technical", description: "Search for technical information" },
  { id: "security", name: "Security", description: "Operators useful for security testing" },
  { id: "date", name: "Date & Time", description: "Time-based searches" },
  { id: "media", name: "Media & Information", description: "Search for specific types of information" },
  { id: "special", name: "Special Searches", description: "Specific Google services" },
]

// Define the operators and their descriptions with categories
const operators = [
  // Content Search
  { value: "intext", label: "intext:", description: "Search for pages containing specific text", category: "content" },
  {
    value: "allintext",
    label: "allintext:",
    description: "All terms must appear in the text of the page",
    category: "content",
  },
  {
    value: "intitle",
    label: "intitle:",
    description: "Search for pages with specific text in the title",
    category: "content",
  },
  { value: "allintitle", label: "allintitle:", description: "All terms must appear in the title", category: "content" },
  {
    value: "around",
    label: "AROUND(n)",
    description: "Find pages where terms appear within n words of each other",
    category: "content",
  },
  { value: "author", label: "author:", description: "Find content written by a specific author", category: "content" },

  // URL & Domain
  { value: "site", label: "site:", description: "Search within a specific website or domain", category: "url" },
  { value: "inurl", label: "inurl:", description: "Search for URLs containing specific text", category: "url" },
  { value: "allinurl", label: "allinurl:", description: "All terms must appear in the URL", category: "url" },
  { value: "link", label: "link:", description: "Find pages that link to a specific URL", category: "url" },
  { value: "related", label: "related:", description: "Find sites related to a specific domain", category: "url" },

  // File Types
  { value: "filetype", label: "filetype:", description: "Search for specific file types", category: "file" },
  { value: "ext", label: "ext:", description: "Alternative to filetype, search by file extension", category: "file" },

  // Metadata & Technical
  { value: "cache", label: "cache:", description: "View Google's cached version of a specific page", category: "meta" },
  { value: "info", label: "info:", description: "Get information about a specific page", category: "meta" },

  // Security
  { value: "intitle_index", label: 'intitle:"index of"', description: "Find directory listings", category: "security" },
  {
    value: "error_messages",
    label: "intext:error OR intext:warning",
    description: "Find pages with error messages",
    category: "security",
  },
  { value: "login_pages", label: "inurl:login OR inurl:admin", description: "Find login pages", category: "security" },
  {
    value: "config_files",
    label: "filetype:conf OR filetype:config",
    description: "Find configuration files",
    category: "security",
  },
  { value: "exposed_logs", label: "filetype:log", description: "Find log files", category: "security" },
  {
    value: "db_files",
    label: "filetype:sql OR filetype:dbf",
    description: "Find database files",
    category: "security",
  },
  { value: "robots_txt", label: "inurl:robots.txt", description: "Find robots.txt files", category: "security" },
  {
    value: "sql_errors",
    label: 'intext:"sql syntax near"',
    description: "Find SQL error messages",
    category: "security",
  },
  {
    value: "env_files",
    label: 'filetype:env "DB_PASSWORD"',
    description: "Find environment files with credentials",
    category: "security",
  },
  {
    value: "exposed_credentials",
    label: 'intext:"username" AND intext:"password"',
    description: "Find exposed credentials",
    category: "security",
  },
  {
    value: "api_keys",
    label: 'intext:"api_key" OR intext:"apikey"',
    description: "Find exposed API keys",
    category: "security",
  },
  {
    value: "server_status",
    label: 'intitle:"Apache Status" "Apache Server Status"',
    description: "Find Apache server status pages",
    category: "security",
  },
  {
    value: "phpinfo",
    label: 'intitle:"phpinfo()" "php version"',
    description: "Find PHP information disclosure pages",
    category: "security",
  },
  {
    value: "open_ftp",
    label: 'intitle:"index of" inurl:ftp',
    description: "Find open FTP directories",
    category: "security",
  },
  {
    value: "wp_config",
    label: 'filetype:php "wp-config.php"',
    description: "Find WordPress configuration files",
    category: "security",
  },
  {
    value: "git_exposed",
    label: 'inurl:".git"',
    description: "Find exposed Git repositories",
    category: "security",
  },
  {
    value: "jenkins",
    label: 'intitle:"Dashboard [Jenkins]"',
    description: "Find Jenkins dashboards",
    category: "security",
  },
  {
    value: "backup_files",
    label: "ext:bak OR ext:backup OR ext:old",
    description: "Find backup files",
    category: "security",
  },
  {
    value: "open_redirect",
    label: "inurl:redirect= OR inurl:return= OR inurl:redir=",
    description: "Find potential open redirects",
    category: "security",
  },

  // Date & Time
  {
    value: "before",
    label: "before:",
    description: "Search for pages published before a specific date",
    category: "date",
  },
  {
    value: "after",
    label: "after:",
    description: "Search for pages published after a specific date",
    category: "date",
  },

  // Media & Information
  { value: "define", label: "define:", description: "Show definition of a word or phrase", category: "media" },
  {
    value: "stocks",
    label: "stocks:",
    description: "Get stock information for specified ticker symbols",
    category: "media",
  },
  { value: "weather", label: "weather:", description: "Show weather information for a location", category: "media" },
  { value: "map", label: "map:", description: "Show map of an area", category: "media" },
  { value: "movie", label: "movie:", description: "Get information about a movie", category: "media" },
  { value: "book", label: "book:", description: "Get information about a book", category: "media" },

  // Special Searches
  { value: "source", label: "source:", description: "Find news from a specific source", category: "special" },
  { value: "location", label: "location:", description: "Find news from a specific location", category: "special" },
  { value: "safesearch", label: "safesearch:", description: "Filter explicit content (on/off)", category: "special" },
]

// Common file types for the filetype operator
const fileTypes = [
  { value: "pdf", label: "PDF" },
  { value: "doc", label: "DOC" },
  { value: "docx", label: "DOCX" },
  { value: "xls", label: "XLS" },
  { value: "xlsx", label: "XLSX" },
  { value: "ppt", label: "PPT" },
  { value: "pptx", label: "PPTX" },
  { value: "txt", label: "TXT" },
  { value: "csv", label: "CSV" },
  { value: "log", label: "LOG" },
  { value: "sql", label: "SQL" },
  { value: "xml", label: "XML" },
  { value: "json", label: "JSON" },
  { value: "conf", label: "CONF" },
  { value: "config", label: "CONFIG" },
  { value: "ini", label: "INI" },
  { value: "env", label: "ENV" },
  { value: "bak", label: "BAK" },
]

// Example dorks for different use cases
const exampleDorks = [
  {
    name: "Exposed Documents",
    query: "site:example.com filetype:pdf confidential",
    description: "Find confidential PDF documents on a specific domain",
    displayQuery: (
      <>
        site:<span className="text-blue-500">example.com</span> filetype:pdf confidential
      </>
    ),
    category: "Security",
    reference: "SEC-1.2",
  },
  {
    name: "Directory Listings",
    query: 'intitle:"Index of" site:example.com',
    description: "Find open directory listings on a specific domain",
    displayQuery: (
      <>
        intitle:"Index of" site:<span className="text-blue-500">example.com</span>
      </>
    ),
    category: "Reconnaissance",
    reference: "REC-2.1",
  },
  {
    name: "Login Pages",
    query: "inurl:login site:example.com",
    description: "Find login pages on a specific domain",
    displayQuery: (
      <>
        inurl:login site:<span className="text-blue-500">example.com</span>
      </>
    ),
    category: "Authentication",
    reference: "AUTH-3.4",
  },
  {
    name: "Configuration Files",
    query:
      "site:example.com filetype:xml | filetype:conf | filetype:cnf | filetype:reg | filetype:inf | filetype:rdp | filetype:cfg | filetype:txt | filetype:ora | filetype:ini",
    description: "Find configuration files on a specific domain",
    displayQuery: (
      <>
        site:<span className="text-blue-500">example.com</span> filetype:xml | filetype:conf | filetype:cnf |
        filetype:reg | filetype:inf | filetype:rdp | filetype:cfg | filetype:txt | filetype:ora | filetype:ini
      </>
    ),
    category: "Configuration",
    reference: "CONF-4.3",
  },
  {
    name: "Database Files",
    query: "site:example.com filetype:sql | filetype:dbf | filetype:mdb",
    description: "Find database files on a specific domain",
    displayQuery: (
      <>
        site:<span className="text-blue-500">example.com</span> filetype:sql | filetype:dbf | filetype:mdb
      </>
    ),
    category: "Database",
    reference: "DB-5.2",
  },
  {
    name: "Exposed Environment Files",
    query: 'site:example.com filetype:env "DB_PASSWORD" | "API_KEY" | "SECRET"',
    description: "Find environment files with potential credentials",
    displayQuery: (
      <>
        site:<span className="text-blue-500">example.com</span> filetype:env "DB_PASSWORD" | "API_KEY" | "SECRET"
      </>
    ),
    category: "Security",
    reference: "SEC-6.1",
  },
  {
    name: "SQL Error Messages",
    query:
      'site:example.com intext:"sql syntax near" | intext:"syntax error has occurred" | intext:"incorrect syntax near"',
    description: "Find pages with SQL error messages that might indicate vulnerabilities",
    displayQuery: (
      <>
        site:<span className="text-blue-500">example.com</span> intext:"sql syntax near" | intext:"syntax error has
        occurred" | intext:"incorrect syntax near"
      </>
    ),
    category: "Vulnerability",
    reference: "VUL-7.3",
  },
]

// Helper function to highlight example.com in blue
const highlightExampleDomain = (text: string) => {
  return text.split("example.com").map((part, i, arr) => {
    // Don't add the span after the last part
    return i === arr.length - 1 ? (
      part
    ) : (
      <React.Fragment key={i}>
        {part}
        <span className="text-blue-500">example.com</span>
      </React.Fragment>
    )
  })
}

// Format date for Google search (YYYY-MM-DD)
const formatDateForSearch = (date: Date): string => {
  return format(date, "yyyy-MM-dd")
}

// Get today's date in YYYY-MM-DD format for the max attribute
const getTodayFormatted = (): string => {
  return new Date().toISOString().split("T")[0]
}

export function DorkingTool() {
  const [baseQuery, setBaseQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedOperator, setSelectedOperator] = useState("")
  const [operatorValue, setOperatorValue] = useState("")
  const [dateValue, setDateValue] = useState("")
  const [dorkParts, setDorkParts] = useState<Array<{ operator: string; value: string }>>([])
  const [finalDork, setFinalDork] = useState("")
  const [dorkDescription, setDorkDescription] = useState("")
  const [copied, setCopied] = useState(false)
  const [isManuallyEdited, setIsManuallyEdited] = useState(false)
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false)

  // Today's date for max attribute
  const today = getTodayFormatted()

  // Filter operators by category
  const filteredOperators = selectedCategory ? operators.filter((op) => op.category === selectedCategory) : operators

  // Handle adding a new dork part
  const handleAddDorkPart = () => {
    if (!selectedOperator) return

    // For date operators, use the selected date
    if ((selectedOperator === "before" || selectedOperator === "after") && dateValue) {
      const newDorkParts = [...dorkParts, { operator: selectedOperator, value: dateValue }]
      setDorkParts(newDorkParts)
      setSelectedOperator("")
      setDateValue("")

      // Only update the final dork if not manually edited
      if (!isManuallyEdited) {
        updateFinalDork(newDorkParts, baseQuery)
      }
      return
    }

    // For other operators, use the text input value
    if (!operatorValue) return

    const newDorkParts = [...dorkParts, { operator: selectedOperator, value: operatorValue }]
    setDorkParts(newDorkParts)
    setSelectedOperator("")
    setOperatorValue("")

    // Only update the final dork if not manually edited
    if (!isManuallyEdited) {
      updateFinalDork(newDorkParts, baseQuery)
    }
  }

  // Handle removing a dork part
  const handleRemoveDorkPart = (index: number) => {
    const newDorkParts = dorkParts.filter((_, i) => i !== index)
    setDorkParts(newDorkParts)

    // Only update the final dork if not manually edited
    if (!isManuallyEdited) {
      updateFinalDork(newDorkParts, baseQuery)
    }
  }

  // Update the final dork string
  const updateFinalDork = (parts: Array<{ operator: string; value: string }>, base: string) => {
    // If the user has manually edited the query, don't override their changes
    if (isManuallyEdited) return

    let dork = base.trim()

    parts.forEach((part) => {
      const operator = operators.find((op) => op.value === part.operator)
      if (operator) {
        if (dork) dork += " "
        dork += `${operator.label}${part.value}`
      }
    })

    setFinalDork(dork)
  }

  // Handle AI-generated query
  const handleAIQueryGenerated = (query: string) => {
    setFinalDork(query)
    setIsManuallyEdited(true)
  }

  // Generate a description of what the dork will do
  useEffect(() => {
    if (!finalDork) {
      setDorkDescription("")
      return
    }

    // Check for base query
    const baseQueryTerms = baseQuery.trim()
    const hasBaseQuery = baseQueryTerms.length > 0

    // Process each operator
    const operatorDescriptions: { type: string; text: string }[] = []

    dorkParts.forEach((part) => {
      const operator = operators.find((op) => op.value === part.operator)
      if (!operator) return

      switch (operator.value) {
        case "site":
          operatorDescriptions.push({
            type: "site",
            text: `only on the website ${part.value}`,
          })
          break
        case "filetype":
        case "ext":
          operatorDescriptions.push({
            type: "filetype",
            text: `that are ${part.value.toUpperCase()} files`,
          })
          break
        case "inurl":
          operatorDescriptions.push({
            type: "inurl",
            text: `with URLs containing "${part.value}"`,
          })
          break
        case "allinurl":
          operatorDescriptions.push({
            type: "allinurl",
            text: `with URLs containing all of these terms: "${part.value}"`,
          })
          break
        case "intitle":
          operatorDescriptions.push({
            type: "intitle",
            text: `with page titles containing "${part.value}"`,
          })
          break
        case "allintitle":
          operatorDescriptions.push({
            type: "allintitle",
            text: `with page titles containing all of these terms: "${part.value}"`,
          })
          break
        case "intext":
          operatorDescriptions.push({
            type: "intext",
            text: `with content containing "${part.value}"`,
          })
          break
        case "allintext":
          operatorDescriptions.push({
            type: "allintext",
            text: `with content containing all of these terms: "${part.value}"`,
          })
          break
        case "cache":
          operatorDescriptions.push({
            type: "cache",
            text: `show Google's cached version of ${part.value}`,
          })
          break
        case "link":
          operatorDescriptions.push({
            type: "link",
            text: `that link to ${part.value}`,
          })
          break
        case "related":
          operatorDescriptions.push({
            type: "related",
            text: `that are related to ${part.value}`,
          })
          break
        case "info":
          operatorDescriptions.push({
            type: "info",
            text: `showing information about ${part.value}`,
          })
          break
        case "define":
          operatorDescriptions.push({
            type: "define",
            text: `showing the definition of "${part.value}"`,
          })
          break
        case "before":
          try {
            const date = new Date(part.value)
            operatorDescriptions.push({
              type: "before",
              text: `published before ${format(date, "MMMM d, yyyy")}`,
            })
          } catch (e) {
            operatorDescriptions.push({
              type: "before",
              text: `published before ${part.value}`,
            })
          }
          break
        case "after":
          try {
            const date = new Date(part.value)
            operatorDescriptions.push({
              type: "after",
              text: `published after ${format(date, "MMMM d, yyyy")}`,
            })
          } catch (e) {
            operatorDescriptions.push({
              type: "after",
              text: `published after ${part.value}`,
            })
          }
          break
        case "around":
          operatorDescriptions.push({
            type: "around",
            text: `where terms appear within ${part.value} words of each other`,
          })
          break
        case "source":
          operatorDescriptions.push({
            type: "source",
            text: `from the news source ${part.value}`,
          })
          break
        case "location":
          operatorDescriptions.push({
            type: "location",
            text: `from the location ${part.value}`,
          })
          break
        case "safesearch":
          operatorDescriptions.push({
            type: "safesearch",
            text: `with SafeSearch ${part.value}`,
          })
          break
        case "stocks":
          operatorDescriptions.push({
            type: "stocks",
            text: `showing stock information for ${part.value}`,
          })
          break
        case "weather":
          operatorDescriptions.push({
            type: "weather",
            text: `showing weather information for ${part.value}`,
          })
          break
        case "map":
          operatorDescriptions.push({
            type: "map",
            text: `showing a map of ${part.value}`,
          })
          break
        case "movie":
          operatorDescriptions.push({
            type: "movie",
            text: `showing information about the movie "${part.value}"`,
          })
          break
        case "book":
          operatorDescriptions.push({
            type: "book",
            text: `showing information about the book "${part.value}"`,
          })
          break
        case "author":
          operatorDescriptions.push({
            type: "author",
            text: `written by ${part.value}`,
          })
          break
        case "intitle_index":
          operatorDescriptions.push({
            type: "intitle_index",
            text: `with directory listings containing "${part.value}"`,
          })
          break
        case "error_messages":
          operatorDescriptions.push({
            type: "error_messages",
            text: `containing error messages with "${part.value}"`,
          })
          break
        case "login_pages":
          operatorDescriptions.push({
            type: "login_pages",
            text: `with login or admin pages containing "${part.value}"`,
          })
          break
        case "config_files":
          operatorDescriptions.push({
            type: "config_files",
            text: `with configuration files containing "${part.value}"`,
          })
          break
        case "exposed_logs":
          operatorDescriptions.push({
            type: "exposed_logs",
            text: `with log files containing "${part.value}"`,
          })
          break
        case "db_files":
          operatorDescriptions.push({
            type: "db_files",
            text: `with database files containing "${part.value}"`,
          })
          break
        case "robots_txt":
          operatorDescriptions.push({
            type: "robots_txt",
            text: `with robots.txt files containing "${part.value}"`,
          })
          break
        case "sql_errors":
          operatorDescriptions.push({
            type: "sql_errors",
            text: `with SQL error messages containing "${part.value}"`,
          })
          break
        case "env_files":
          operatorDescriptions.push({
            type: "env_files",
            text: `with environment files containing credentials like "${part.value}"`,
          })
          break
        default:
          operatorDescriptions.push({
            type: "other",
            text: `${operator.description.toLowerCase()} "${part.value}"`,
          })
      }
    })

    // If we have no operators or base query
    if (operatorDescriptions.length === 0 && !hasBaseQuery) {
      setDorkDescription("")
      return
    }

    // Construct the description based on what we have
    let description = "This search will"

    // If we have a base query, start with that
    if (hasBaseQuery) {
      description += ` find pages containing "${baseQueryTerms}"`

      // If we have operators, add them
      if (operatorDescriptions.length > 0) {
        for (let i = 0; i < operatorDescriptions.length; i++) {
          if (i === 0) {
            description += ` that are ${operatorDescriptions[i].text}`
          } else if (i === operatorDescriptions.length - 1) {
            description += ` and ${operatorDescriptions[i].text}`
          } else {
            description += `, ${operatorDescriptions[i].text}`
          }
        }
      }
    }
    // If we don't have a base query but have operators
    else if (operatorDescriptions.length > 0) {
      // Special case for cache operator which needs different grammar
      if (operatorDescriptions[0].type === "cache") {
        description += ` ${operatorDescriptions[0].text}`
      } else {
        description += ` find pages ${operatorDescriptions[0].text}`
      }

      // Add the rest of the operators
      for (let i = 1; i < operatorDescriptions.length; i++) {
        if (i === operatorDescriptions.length - 1) {
          description += ` and ${operatorDescriptions[i].text}`
        } else {
          description += `, ${operatorDescriptions[i].text}`
        }
      }
    }

    description += "."
    setDorkDescription(description)
  }, [finalDork, baseQuery, dorkParts])

  // Handle base query change
  const handleBaseQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBaseQuery(e.target.value)
    if (!isManuallyEdited) {
      updateFinalDork(dorkParts, e.target.value)
    }
  }

  // Handle copying the dork to clipboard
  const handleCopyDork = () => {
    navigator.clipboard.writeText(finalDork)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Handle searching with the dork
  const handleSearch = () => {
    if (!finalDork) return
    window.open(`https://www.google.com/search?q=${encodeURIComponent(finalDork)}`, "_blank")
  }

  // Handle using an example dork
  const handleUseExample = (query: string) => {
    setFinalDork(query)
    setBaseQuery("")

    // Instead of marking as manually edited, try to parse the example dork
    // into structured parts so we can generate a description
    try {
      const parts: Array<{ operator: string; value: string }> = []

      // Parse the query to extract operator parts
      operators.forEach((op) => {
        // Create a regex to find this operator in the query
        const regex = new RegExp(`${op.label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^\\s]+|"[^"]+")`, "g")
        let match

        while ((match = regex.exec(query)) !== null) {
          // Extract the value part (removing quotes if present)
          let value = match[1]
          if (value.startsWith('"') && value.endsWith('"')) {
            value = value.substring(1, value.length - 1)
          }

          parts.push({
            operator: op.value,
            value: value,
          })
        }
      })

      setDorkParts(parts)
      setIsManuallyEdited(false) // Not manually edited, so description will generate
    } catch (e) {
      // If parsing fails, fall back to treating it as manually edited
      setDorkParts([])
      setIsManuallyEdited(true)
    }
  }

  // Handle category change
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    setSelectedOperator("")
  }

  // Render the operator part with example.com highlighted
  const renderOperatorPart = (operator: string, value: string) => {
    if (value.includes("example.com")) {
      const parts = value.split("example.com")
      return (
        <span className="font-mono">
          {operator}
          {parts[0]}
          <span className="text-blue-500">example.com</span>
          {parts[1]}
        </span>
      )
    }

    // Format dates for display
    if ((operator === "before:" || operator === "after:") && value.match(/^\d{4}-\d{2}-\d{2}$/)) {
      try {
        const date = new Date(value)
        return (
          <span className="font-mono">
            {operator}
            {format(date, "yyyy-MM-dd")}
          </span>
        )
      } catch (e) {
        // If date parsing fails, just show the original value
      }
    }

    return (
      <span className="font-mono">
        {operator}
        {value}
      </span>
    )
  }

  // Determine if we should show the date picker
  const isDateOperator = selectedOperator === "before" || selectedOperator === "after"

  // Add a new function to handle clearing all dork parts
  const handleClearAllDorkParts = () => {
    setDorkParts([])

    // Only update the final dork if not manually edited
    if (!isManuallyEdited) {
      updateFinalDork([], baseQuery)
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
      <div className="space-y-6">
        {/* Main Dorking Tool Section */}
        <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-100 dark:border-blue-900">
          <div className="flex justify-between items-center mb-2">
            <div>
              <h2 className="text-xl font-bold text-blue-700 dark:text-blue-300">Google Dorking Builder</h2>
              <p className="text-sm text-blue-600 dark:text-blue-400">Advanced Search Query Construction</p>
            </div>
            <div className="text-sm font-mono text-blue-700 dark:text-blue-300">DORK-1.0</div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-md p-4 shadow-sm">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="base-query" className="text-sm font-medium">
                  Base Query (Optional)
                </Label>
                <Input
                  id="base-query"
                  placeholder="Enter your base search terms"
                  value={baseQuery}
                  onChange={handleBaseQueryChange}
                  className="border-blue-200 dark:border-blue-800 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-sm font-medium">
                    Operator Category
                  </Label>
                  <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                    <SelectTrigger id="category" className="border-blue-200 dark:border-blue-800">
                      <SelectValue placeholder="Select category (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {operatorCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                          <span className="text-muted-foreground text-xs ml-1">({category.description})</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="operator" className="text-sm font-medium">
                    Operator
                  </Label>
                  <Select
                    value={selectedOperator}
                    onValueChange={(value) => {
                      setSelectedOperator(value)
                      setDateValue("")
                      setOperatorValue("")
                    }}
                  >
                    <SelectTrigger id="operator" className="border-blue-200 dark:border-blue-800">
                      <SelectValue placeholder="Select operator" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredOperators.map((operator) => (
                        <SelectItem key={operator.value} value={operator.value}>
                          <span className="font-mono font-bold">{operator.label}</span>{" "}
                          <span className="text-muted-foreground text-xs ml-1">({operator.description})</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="value" className="text-sm font-medium">
                    Value
                  </Label>
                  {isDateOperator ? (
                    <Input
                      id="date-value"
                      type="date"
                      value={dateValue}
                      onChange={(e) => setDateValue(e.target.value)}
                      className="w-full border-blue-200 dark:border-blue-800"
                      min="2015-01-01"
                      max={today}
                    />
                  ) : selectedOperator === "filetype" || selectedOperator === "ext" ? (
                    <Select value={operatorValue} onValueChange={setOperatorValue}>
                      <SelectTrigger id="value" className="border-blue-200 dark:border-blue-800">
                        <SelectValue placeholder="Select file type" />
                      </SelectTrigger>
                      <SelectContent>
                        {fileTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id="value"
                      placeholder={
                        selectedOperator ? `Enter value for ${selectedOperator}` : "Select an operator first"
                      }
                      value={operatorValue}
                      onChange={(e) => setOperatorValue(e.target.value)}
                      disabled={!selectedOperator}
                      className="border-blue-200 dark:border-blue-800"
                    />
                  )}
                </div>

                <div className="flex items-end">
                  <Button
                    onClick={handleAddDorkPart}
                    disabled={!selectedOperator || (isDateOperator ? !dateValue : !operatorValue)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add
                  </Button>
                </div>
              </div>

              {dorkParts.length > 0 && (
                <div className="space-y-2 mt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Label className="text-sm font-medium">Added Operators</Label>
                      <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">
                        {dorkParts.length} {dorkParts.length === 1 ? "operator" : "operators"}
                      </Badge>
                    </div>
                    {dorkParts.length >= 10 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleClearAllDorkParts}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 border-red-200"
                      >
                        Clear All
                      </Button>
                    )}
                  </div>
                  <div className="border rounded-md p-2 space-y-2 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/20">
                    {dorkParts.map((part, index) => {
                      const operator = operators.find((op) => op.value === part.operator)
                      return (
                        <div
                          key={index}
                          className="flex justify-between items-center bg-white dark:bg-gray-800 p-2 rounded shadow-sm"
                        >
                          <div className="flex items-center">
                            <Badge className="mr-2 bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200">
                              {operator?.value}
                            </Badge>
                            <span>{operator && renderOperatorPart(operator.label, part.value)}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveDorkPart(index)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Final Dork Section */}
        <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-100 dark:border-blue-900">
          <div className="flex justify-between items-center mb-2">
            <div>
              <h2 className="text-xl font-bold text-blue-700 dark:text-blue-300">Final Dork Query</h2>
              <p className="text-sm text-blue-600 dark:text-blue-400">Ready to Execute</p>
            </div>
            <div className="text-sm font-mono text-blue-700 dark:text-blue-300">QUERY-2.0</div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-md p-4 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Input
                  value={finalDork}
                  onChange={(e) => {
                    setFinalDork(e.target.value)
                    setIsManuallyEdited(true)
                  }}
                  className="font-mono border rounded-md px-3 py-2 bg-gray-50 dark:bg-gray-800 border-blue-200 dark:border-blue-800"
                  placeholder="Your query will appear here"
                />
              </div>
              <AIButton onClick={() => setIsAIDialogOpen(true)} className="flex-shrink-0" />
              <div className="flex ml-2">
                {isManuallyEdited && (
                  <Button
                    variant="outline"
                    size="icon"
                    className="mr-2 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900"
                    onClick={() => {
                      updateFinalDork(dorkParts, baseQuery)
                      setIsManuallyEdited(false)
                    }}
                    title="Reset to generated query"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="icon"
                  className="border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900"
                  onClick={handleCopyDork}
                  title="Copy to clipboard"
                >
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {isManuallyEdited && (
              <div className="text-xs text-blue-600 dark:text-blue-400 mt-1 flex items-center">
                <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-1"></span>
                Query manually edited
              </div>
            )}

            {dorkDescription && (
              <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-md flex items-start gap-2 text-sm border border-blue-100 dark:border-blue-800">
                <Search className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                <p className="text-blue-700 dark:text-blue-300">{dorkDescription}</p>
              </div>
            )}

            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleSearch}
              disabled={!finalDork}
            >
              Search on Google <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Warning Alert */}
        <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-lg border border-amber-100 dark:border-amber-900/50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-amber-800 dark:text-amber-400">Ethical Usage Notice</h3>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                Google Dorking is a technique that uses advanced search operators to find specific information. Use
                responsibly and ethically. Never use these techniques for illegal activities or unauthorized access.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <Tabs defaultValue="examples">
          <TabsList className="grid w-full grid-cols-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
            <TabsTrigger
              value="examples"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-300"
            >
              Examples
            </TabsTrigger>
            <TabsTrigger
              value="guide"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-300"
            >
              Guide
            </TabsTrigger>
          </TabsList>

          <TabsContent value="examples" className="space-y-4 mt-4">
            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-100 dark:border-blue-900">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h2 className="text-xl font-bold text-blue-700 dark:text-blue-300">Example Dorks</h2>
                  <p className="text-sm text-blue-600 dark:text-blue-400">Common Search Patterns</p>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-md p-4 shadow-sm">
                <div className="space-y-3">
                  {exampleDorks.map((dork, index) => (
                    <div
                      key={index}
                      className="border rounded-md p-3 space-y-2 border-blue-200 dark:border-blue-800 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <div className="font-medium text-blue-700 dark:text-blue-300">{dork.name}</div>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {dork.reference}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{dork.description}</div>
                      <div className="flex justify-between items-center">
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200">
                          {dork.category}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUseExample(dork.query)}
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                        >
                          Use
                        </Button>
                      </div>
                      <div className="mt-2 bg-gray-50 dark:bg-gray-800 p-2 rounded text-xs font-mono overflow-x-auto">
                        {dork.displayQuery}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="guide" className="mt-4">
            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-100 dark:border-blue-900">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h2 className="text-xl font-bold text-blue-700 dark:text-blue-300">Google Dorking Guide</h2>
                  <p className="text-sm text-blue-600 dark:text-blue-400">Advanced Search Techniques</p>
                </div>
                <div className="text-sm font-mono text-blue-700 dark:text-blue-300">GUIDE-3.0</div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-md p-4 shadow-sm">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="what-is" className="border-blue-200 dark:border-blue-800">
                    <AccordionTrigger className="text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200">
                      What is Google Dorking?
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-700 dark:text-gray-300">
                      Google Dorking (also known as Google Hacking) is a technique that uses advanced search operators
                      in the Google search engine to find specific information that might not be readily available
                      through simple searches. It can be used for legitimate purposes like security testing, but also
                      has potential for misuse.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="categories" className="border-blue-200 dark:border-blue-800">
                    <AccordionTrigger className="text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200">
                      Operator Categories
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-700 dark:text-gray-300">
                      <div className="space-y-4">
                        {operatorCategories.map((category) => (
                          <div key={category.id}>
                            <h4 className="font-medium text-blue-700 dark:text-blue-300">{category.name}</h4>
                            <p className="text-sm mb-2">{category.description}</p>
                            <ul className="list-disc pl-5 space-y-1">
                              {operators
                                .filter((op) => op.category === category.id)
                                .map((op) => (
                                  <li key={op.value}>
                                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                                      {op.label}
                                    </span>{" "}
                                    - {op.description}
                                  </li>
                                ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="combining" className="border-blue-200 dark:border-blue-800">
                    <AccordionTrigger className="text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200">
                      Combining Operators
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-700 dark:text-gray-300">
                      <p className="mb-2">You can combine multiple operators to create more specific searches:</p>
                      <code className="block bg-gray-50 dark:bg-gray-800 p-2 rounded border border-blue-200 dark:border-blue-800">
                        site:<span className="text-blue-500">example.com</span> filetype:pdf intext:confidential
                      </code>
                      <p className="mt-2">
                        This would search for PDF files on <span className="text-blue-500">example.com</span> that
                        contain the word "confidential".
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="boolean" className="border-blue-200 dark:border-blue-800">
                    <AccordionTrigger className="text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200">
                      Boolean Operators
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-700 dark:text-gray-300">
                      <ul className="list-disc pl-5 space-y-2">
                        <li>
                          <span className="font-mono font-bold text-blue-600 dark:text-blue-400">AND</span> - Default
                          operator between terms
                        </li>
                        <li>
                          <span className="font-mono font-bold text-blue-600 dark:text-blue-400">OR</span> or{" "}
                          <span className="font-mono font-bold text-blue-600 dark:text-blue-400">|</span> - Either term
                        </li>
                        <li>
                          <span className="font-mono font-bold text-blue-600 dark:text-blue-400">-</span> - Exclude term
                        </li>
                        <li>
                          <span className="font-mono font-bold text-blue-600 dark:text-blue-400">"phrase"</span> - Exact
                          phrase
                        </li>
                        <li>
                          <span className="font-mono font-bold text-blue-600 dark:text-blue-400">(grouping)</span> -
                          Group terms
                        </li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="ethical" className="border-blue-200 dark:border-blue-800">
                    <AccordionTrigger className="text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200">
                      Ethical Considerations
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-700 dark:text-gray-300">
                      <p>Always use Google Dorking responsibly and ethically:</p>
                      <ul className="list-disc pl-5 space-y-2 mt-2">
                        <li>Only search on domains you own or have permission to test</li>
                        <li>Report security vulnerabilities responsibly</li>
                        <li>Don't access, download, or distribute sensitive information</li>
                        <li>Be aware that some searches may violate terms of service</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* AI Query Dialog */}
      <AIQueryDialog open={isAIDialogOpen} onOpenChange={setIsAIDialogOpen} onQueryGenerated={handleAIQueryGenerated} />
    </div>
  )
}
