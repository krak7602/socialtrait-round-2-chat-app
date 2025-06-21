"use client"

import type React from "react"

import { useChat } from "@ai-sdk/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ThemeToggle } from "@/components/theme-toggle"
import { ArrowUp, Bot, User, Database, Settings, Trash2, Upload } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Add these interfaces at the top
interface ModelConfig {
  id: string
  name: string
  provider: string
}

interface ProviderConfig {
  name: string
  apiKey: string
  models: ModelConfig[]
}

// Update the component to include model selection
export default function ChatPage() {
  const [initialMessages, setInitialMessages] = useState<any[] | undefined>(undefined)
  const [selectedModel, setSelectedModel] = useState<string>("")
  const [availableModels, setAvailableModels] = useState<ModelConfig[]>([])

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedMessages = localStorage.getItem("chatMessages")
      const savedSelectedModel = localStorage.getItem("selectedModel")
      const savedProviders = localStorage.getItem("aiProviders")

      if (savedMessages) {
        try {
          setInitialMessages(JSON.parse(savedMessages))
        } catch (e) {
          console.error("Failed to parse saved messages:", e)
          setInitialMessages([])
        }
      } else {
        setInitialMessages([])
      }

      if (savedSelectedModel) {
        setSelectedModel(savedSelectedModel)
      }

      // Load available models
      if (savedProviders) {
        try {
          const providers: Record<string, ProviderConfig> = JSON.parse(savedProviders)
          const models: ModelConfig[] = []
          Object.values(providers).forEach((provider) => {
            if (provider.apiKey?.trim()) {
              models.push(...provider.models)
            }
          })
          setAvailableModels(models)
        } catch (e) {
          console.error("Failed to parse saved providers:", e)
        }
      }
    }
  }, [])

  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = useChat({
    initialMessages: initialMessages,
    body: {
      selectedModel: selectedModel,
      uploadedCsvData: typeof window !== "undefined" ? localStorage.getItem("uploadedCsvData") : null,
    },
  })

  // Add clear chat function
  const clearChat = () => {
    setMessages([])
    if (typeof window !== "undefined") {
      localStorage.removeItem("chatMessages")
    }
  }

  // Update model selection
  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId)
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedModel", modelId)
    }
  }

  // Update the header section to include model selector and clear button
  const headerSection = (
    <CardHeader className="pb-4">
      <div className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Chat with {typeof window !== "undefined" && localStorage.getItem("uploadedCsvData") ? "Custom" : "Influencer"}{" "}
          Data
        </CardTitle>
        <div className="flex items-center gap-2">
          {availableModels.length > 0 && (
            <Select value={selectedModel} onValueChange={handleModelChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                {availableModels.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button variant="outline" size="icon" onClick={clearChat} title="Clear chat">
            <Trash2 className="h-4 w-4" />
          </Button>
          <Link href="/upload">
            <Button variant="outline" size="icon" title="Upload Data">
              <Upload className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/settings">
            <Button variant="outline" size="icon" title="Settings">
              <Settings className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
      {availableModels.length === 0 && (
        <div className="text-sm text-muted-foreground">
          No models configured.{" "}
          <Link href="/settings" className="underline">
            Configure API keys
          </Link>{" "}
          to enable AI chat.
        </div>
      )}
    </CardHeader>
  )

  const [isInitialized, setIsInitialized] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
    if (initialMessages !== undefined) {
      localStorage.setItem("chatMessages", JSON.stringify(messages))
    }
  }, [messages, initialMessages])

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    if (!isInitialized) {
      setIsInitialized(true)
    }

    handleSubmit(e)
  }

  const exampleQuestions = [
    "How many influencers are in the dataset?",
    "Who are the top 5 influencers by follower count?",
    "What's the average engagement rate across all influencers?",
    "Show me verified influencers with over 1 million followers",
    "Which influencers have the highest engagement rates?",
  ]

  return (
    <div className="h-screen bg-background overflow-hidden">
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <div className="container mx-auto w-full h-full p-4 flex flex-col">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold mb-2">Influencer Data Chat Assistant</h1>
          <p className="text-muted-foreground">
            Ask questions about the influencer dataset and get AI-powered insights
          </p>
        </div>

        <Card className="flex-1 flex flex-col border-none shadow-none overflow-hidden">
          {headerSection}

          <CardContent className="flex-1 flex flex-col p-0 relative overflow-hidden">
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
                {messages.length === 0 && !isInitialized && (
                  <div className="space-y-4">
                    <div className="text-center text-muted-foreground mb-6">
                      <Bot className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Start by asking a question about the influencer data!</p>
                    </div>

                    <div className="space-y-2">
                      <p className="font-medium text-sm">Example questions:</p>
                      {exampleQuestions.map((question, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="w-full justify-start text-left h-auto p-3 whitespace-normal"
                          onClick={() => {
                            handleInputChange({
                              target: { value: question },
                            } as any)
                            setMessages([]) // Clear messages when starting a new chat with example question
                            if (typeof window !== "undefined") {
                              localStorage.removeItem("chatMessages")
                            }
                          }}
                        >
                          {question}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`flex gap-3 max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                      >
                        <div className="flex-shrink-0">
                          {message.role === "user" ? (
                            <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                              <User className="h-4 w-4" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center">
                              <Bot className="h-4 w-4" />
                            </div>
                          )}
                        </div>

                        <div
                          className={`rounded-lg p-3 ${
                            message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                          }`}
                        >
                          <div className="whitespace-pre-wrap">
                            {message.parts.map((part, i) => {
                              switch (part.type) {
                                case "text":
                                  return <span key={`${message.id}-${i}`}>{part.text}</span>
                                default:
                                  return null
                              }
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex gap-3 justify-start">
                      <div className="flex gap-3 max-w-[80%]">
                        <div className="w-8 h-8 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center">
                          <Bot className="h-4 w-4" />
                        </div>
                        <div className="bg-muted rounded-lg p-3">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Scroll anchor for auto-scrolling */}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </div>

            <div className="bg-background p-4 flex-shrink-0">
              <form onSubmit={handleFormSubmit} className="relative">
                <div className="relative border border-border  rounded-3xl bg-background shadow-sm transition-shadow">
                  <Textarea
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Ask about influencers, engagement rates, follower counts..."
                    disabled={isLoading}
                    className="w-full min-h-[60px] max-h-[200px] resize-none border-0 bg-transparent px-4 py-3 pr-12 placeholder:text-muted-foreground focus:outline-none focus:ring-0 focus:border-0 focus-visible:outline-none focus-visible:ring-0 focus:!outline-none focus:!ring-0 focus:!border-none"
                    style={{
                      fontSize: "18px",
                      lineHeight: "1.5",
                      outline: "none",
                      border: "none",
                      boxShadow: "none",
                    }}
                    rows={1}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement
                      target.style.height = "auto"
                      target.style.height = Math.min(target.scrollHeight, 200) + "px"
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleFormSubmit(e as any)
                      }
                    }}
                  />
                  <Button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    size="sm"
                    className="absolute right-2 bottom-2 h-8 w-8 rounded-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed p-0"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
