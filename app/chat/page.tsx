"use client"

import { useState, useEffect } from "react"
import { useChat } from "@ai-sdk/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ThemeToggle } from "@/components/theme-toggle"
import { ArrowLeft, ArrowUp, Trash2, Settings, Upload, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Alert, AlertDescription } from "@/components/ui/alert"
import ReactMarkdown from "react-markdown"

const AI_MODELS = {
  openai: [
    { id: "o3-pro", name: "OpenAI o3-pro" },
    { id: "o3", name: "OpenAI o3" },
    { id: "gpt-4.1", name: "GPT-4.1" },
  ],
  google: [
    { id: "gemini-2.5-flash-lite-preview-06-17", name: "Gemini 2.5 Flash-Lite Preview (06-17)" },
    { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro" },
    { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash" },
  ],
  anthropic: [
    { id: "claude-opus-4-20250514", name: "Claude Opus 4" },
    { id: "claude-sonnet-4-20250514", name: "Claude Sonnet 4" },
    { id: "claude-3-5-sonnet-20241022", name: "Claude 3.5 Sonnet" },
  ],
}

export default function ChatPage() {
  const [selectedModel, setSelectedModel] = useState<string>("")
  const [providers, setProviders] = useState<any>(null)
  const [uploadedCsvData, setUploadedCsvData] = useState<string | null>(null)
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null)
  const [isConfigured, setIsConfigured] = useState(false)

  const { messages, input, handleInputChange, handleSubmit, isLoading, error, setMessages } = useChat({
    api: "/api/chat",
    body: {
      selectedModel,
      uploadedCsvData,
      providers,
    },
  })

  useEffect(() => {
    // Load providers from localStorage
    const savedProviders = localStorage.getItem("aiProviders")
    if (savedProviders) {
      try {
        const parsedProviders = JSON.parse(savedProviders)
        setProviders(parsedProviders)
      } catch (e) {
        console.error("Failed to parse providers:", e)
      }
    }

    // Load selected model
    const savedModel = localStorage.getItem("selectedModel")
    if (savedModel) {
      setSelectedModel(savedModel)
    }

    // Load uploaded CSV data
    const savedCsvData = localStorage.getItem("uploadedCsvData")
    const savedCsvName = localStorage.getItem("uploadedCsvName")
    if (savedCsvData && savedCsvName) {
      setUploadedCsvData(savedCsvData)
      setUploadedFileName(savedCsvName)
    }

    // Load chat messages from localStorage
    const savedMessages = localStorage.getItem("chatMessages")
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages)
        setMessages(parsedMessages)
      } catch (e) {
        console.error("Failed to parse saved messages:", e)
      }
    }
  }, [setMessages])

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("chatMessages", JSON.stringify(messages))
    }
  }, [messages])

  useEffect(() => {
    // Check if everything is configured
    const isOpenAIModel = selectedModel.startsWith("gpt-") || selectedModel === "o3-pro" || selectedModel === "o3" || selectedModel === "gpt-4.1"
    const isGoogleModel = selectedModel.startsWith("gemini-")
    const isAnthropicModel = selectedModel.startsWith("claude-")
    
    const hasApiKey =
      providers &&
      ((isOpenAIModel && providers.openai?.apiKey) ||
        (isGoogleModel && providers.google?.apiKey) ||
        (isAnthropicModel && providers.anthropic?.apiKey))
    const hasModel = selectedModel !== ""
    const hasData = uploadedCsvData !== null

    setIsConfigured(hasApiKey && hasModel && hasData)
  }, [providers, selectedModel, uploadedCsvData])

  const handleModelChange = (value: string) => {
    setSelectedModel(value)
    localStorage.setItem("selectedModel", value)
  }

  const clearChat = () => {
    setMessages([])
    localStorage.removeItem("chatMessages")
  }

  const getAvailableModels = () => {
    if (!providers) return []

    const availableModels: { id: string; name: string; provider: string }[] = []

    if (providers.openai?.apiKey) {
      AI_MODELS.openai.forEach((model) => {
        availableModels.push({ ...model, provider: "OpenAI" })
      })
    }

    if (providers.google?.apiKey) {
      AI_MODELS.google.forEach((model) => {
        availableModels.push({ ...model, provider: "Google" })
      })
    }

    if (providers.anthropic?.apiKey) {
      AI_MODELS.anthropic.forEach((model) => {
        availableModels.push({ ...model, provider: "Anthropic" })
      })
    }

    return availableModels
  }

  const availableModels = getAvailableModels()

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Fixed Header */}
      <div className="flex-shrink-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="absolute top-4 right-4 z-10">
          <ThemeToggle />
        </div>

        <div className="container mx-auto max-w-4xl p-4">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <h1 className="text-3xl font-bold">Chat with Your Data</h1>
            </div>
            <Button variant="outline" size="sm" onClick={clearChat}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Chat
            </Button>
          </div>

          {/* Configuration Status */}
          <div className="space-y-4">
            {!uploadedCsvData && (
              <Alert>
                <AlertCircle className="h-4 w-4 mt-1.5 flex-shrink-0" />
                <AlertDescription className="flex items-center justify-between w-full">
                  <span>
                    <strong>No Dataset:</strong> Please upload a CSV file to analyze your data.
                  </span>
                  <Link href="/upload">
                    <Button size="sm" variant="outline">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Data
                    </Button>
                  </Link>
                </AlertDescription>
              </Alert>
            )}

            {availableModels.length === 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4 mt-1.5 flex-shrink-0" />
                <AlertDescription className="flex items-center justify-between w-full">
                  <span>
                    <strong>No API Keys:</strong> Please configure your AI model API keys.
                  </span>
                  <Link href="/settings">
                    <Button size="sm" variant="outline">
                      <Settings className="h-4 w-4 mr-2" />
                      Configure Keys
                    </Button>
                  </Link>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </div>

      {/* Scrollable Chat Messages */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <div className="container mx-auto max-w-4xl p-4">
            <div className="space-y-6 min-h-full">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full min-h-[400px]">
                  <div className="text-center text-muted-foreground">
                    {isConfigured ? (
                      <div>
                        <p className="text-lg mb-2">Ready to analyze your data!</p>
                        <p className="text-sm">Ask questions about your dataset to get started.</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-lg mb-2">Complete setup to start chatting</p>
                        <p className="text-sm">Upload your dataset and configure API keys above.</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                          message.role === "user" 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-muted border"
                        }`}
                      >
                        <div className="text-sm leading-relaxed">
                          {message.parts.map((part, i) => {
                            if (part.type === "text") {
                              return message.role === "assistant" ? (
                                <div key={i} className="prose prose-sm dark:prose-invert prose-p:my-2 prose-pre:my-2 prose-pre:bg-muted prose-pre:p-3 prose-pre:rounded-lg prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-headings:my-3 prose-ul:my-2 prose-ol:my-2 prose-li:my-1 max-w-none">
                                  <ReactMarkdown>
                                    {part.text}
                                  </ReactMarkdown>
                                </div>
                              ) : (
                                <div key={i} className="whitespace-pre-wrap">{part.text}</div>
                              )
                            }
                            return null
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-muted border rounded-2xl px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                          <span className="text-sm">Analyzing...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="flex-shrink-0 container mx-auto max-w-4xl px-4">
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Error:</strong> {error.message}
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Fixed Bottom Input */}
      <div className="flex-shrink-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto max-w-4xl p-4">
          <div className="space-y-3">
            {/* Input Form */}
            <form onSubmit={handleSubmit} className="relative">
              <div className="relative flex items-end">
                <textarea
                  value={input}
                  onChange={(e) => handleInputChange(e)}
                  placeholder={
                    isConfigured ? "Ask a question about your data..." : "Complete setup above to start chatting..."
                  }
                  disabled={!isConfigured || isLoading}
                  className="w-full resize-none rounded-3xl border bg-background px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 min-h-[52px] max-h-32"
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSubmit(e)
                    }
                  }}
                  style={{
                    height: 'auto',
                    minHeight: '52px'
                  }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement
                    target.style.height = 'auto'
                    target.style.height = Math.min(target.scrollHeight, 128) + 'px'
                  }}
                />
                <Button 
                  type="submit" 
                  disabled={!isConfigured || isLoading || !input.trim()}
                  size="sm"
                  className="absolute right-2 bottom-2 rounded-full w-8 h-8 p-0 hover:scale-105 transition-transform"
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
              </div>
            </form>

            {/* Model and Dataset Selection */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <span>Model:</span>
                <Select value={selectedModel} onValueChange={handleModelChange}>
                  <SelectTrigger className="h-7 rounded-lg border-0 bg-muted/50 text-xs">
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableModels.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        <div className="flex items-center gap-2">
                          <span>{model.name}</span>
                          <span className="text-muted-foreground">({model.provider})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="h-4 w-px bg-border" />

              <div className="flex items-center gap-2">
                <span>Dataset:</span>
                {uploadedFileName ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-muted/50 px-2 py-1 rounded-lg max-w-[200px] truncate">
                      {uploadedFileName}
                    </span>
                    <Link href="/upload">
                      <Button size="sm" variant="ghost" className="h-6 px-2 text-xs rounded-md">
                        Change
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <Link href="/upload">
                    <Button size="sm" variant="ghost" className="h-6 px-2 text-xs rounded-md text-muted-foreground hover:text-foreground">
                      Upload dataset
                    </Button>
                  </Link>
                )}
              </div>

              <div className="h-4 w-px bg-border" />

              <Link href="/settings">
                <Button size="sm" variant="ghost" className="h-6 px-2 text-xs rounded-md text-muted-foreground hover:text-foreground">
                  <Settings className="h-3 w-3 mr-1" />
                  API Keys
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
