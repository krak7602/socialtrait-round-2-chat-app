"use client"

import type React from "react"

import { useChat } from "@ai-sdk/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ThemeToggle } from "@/components/theme-toggle"
import { Send, Bot, User, Database } from "lucide-react"
import { useState } from "react"

export default function ChatPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat()
  const [isInitialized, setIsInitialized] = useState(false)

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
    <div className="min-h-screen bg-background">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="container mx-auto max-w-4xl p-4">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold mb-2">Influencer Data Chat Assistant</h1>
          <p className="text-muted-foreground">
            Ask questions about the influencer dataset and get AI-powered insights
          </p>
        </div>

        <Card className="h-[600px] flex flex-col">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Chat with Influencer Data
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0">
            <ScrollArea className="flex-1 p-4">
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
                          handleInputChange({ target: { value: question } } as any)
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
              </div>
            </ScrollArea>

            <div className="border-t p-4">
              <form onSubmit={handleFormSubmit} className="flex gap-2">
                <Input
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Ask about influencers, engagement rates, follower counts..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button type="submit" disabled={isLoading || !input.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
