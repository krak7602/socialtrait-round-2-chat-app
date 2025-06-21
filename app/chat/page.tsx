"use client"

import { useState, useEffect } from "react"
import { useChat } from "@ai-sdk/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ThemeToggle } from "@/components/theme-toggle"
import { ArrowLeft, Send, Trash2, Settings, Upload, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Alert, AlertDescription } from "@/components/ui/alert"

const AI_MODELS = {
  openai: [
    { id: "gpt-4o", name: "GPT-4o" },
    { id: "gpt-4o-mini", name: "GPT-4o Mini" },
    { id: "gpt-4-turbo", name: "GPT-4 Turbo" },
  ],
  google: [
    { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro" },
    { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash" },
  ],
  anthropic: [
    { id: "claude-3-5-sonnet-20241022", name: "Claude 3.5 Sonnet" },
    { id: "claude-3-5-haiku-20241022", name: "Claude 3.5 Haiku" },
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
  }, [])

  useEffect(() => {
    // Check if everything is configured
    const hasApiKey =
      providers &&
      ((selectedModel.startsWith("gpt-") && providers.openai?.apiKey) ||
        (selectedModel.startsWith("gemini-") && providers.google?.apiKey) ||
        (selectedModel.startsWith("claude-") && providers.anthropic?.apiKey))
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
    <div className="min-h-screen bg-background">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="container mx-auto max-w-4xl p-4">
        <div className="mb-6 flex items-center gap-4">
          <Link href="/">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Chat with Your Data</h1>
        </div>

        {/* Configuration Status */}
        <div className="mb-6 space-y-4">
          {!uploadedCsvData && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
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
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
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

        {/* Model Selection and Controls */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Configuration</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={clearChat}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Chat
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">AI Model</label>
                <Select value={selectedModel} onValueChange={handleModelChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableModels.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.name} ({model.provider})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Dataset</label>
                <div className="flex items-center gap-2 p-2 border rounded">
                  {uploadedFileName ? (
                    <>
                      <span className="text-sm truncate flex-1">{uploadedFileName}</span>
                      <Link href="/upload">
                        <Button size="sm" variant="outline">
                          Change
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <>
                      <span className="text-sm text-muted-foreground flex-1">No dataset uploaded</span>
                      <Link href="/upload">
                        <Button size="sm">Upload</Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chat Messages */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="space-y-4 min-h-[400px] max-h-[600px] overflow-y-auto">
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-12">
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
              ) : (
                messages.map((message) => (
                  <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}
                    >
                      <div className="whitespace-pre-wrap">
                        {message.parts.map((part, i) => {
                          if (part.type === "text") {
                            return <div key={i}>{part.text}</div>
                          }
                          return null
                        })}
                      </div>
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      <span className="text-sm">Analyzing...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Error:</strong> {error.message}
            </AlertDescription>
          </Alert>
        )}

        {/* Input Form */}
        <Card>
          <CardContent className="p-4">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={input}
                onChange={handleInputChange}
                placeholder={
                  isConfigured ? "Ask a question about your data..." : "Complete setup above to start chatting..."
                }
                disabled={!isConfigured || isLoading}
                className="flex-1"
              />
              <Button type="submit" disabled={!isConfigured || isLoading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
