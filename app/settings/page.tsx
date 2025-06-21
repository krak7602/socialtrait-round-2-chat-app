"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ThemeToggle } from "@/components/theme-toggle"
import { ArrowLeft, Save, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

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

const AVAILABLE_PROVIDERS: Record<string, ProviderConfig> = {
  openai: {
    name: "OpenAI",
    apiKey: "",
    models: [
      { id: "gpt-4o", name: "GPT-4o", provider: "openai" },
      { id: "gpt-4o-mini", name: "GPT-4o Mini", provider: "openai" },
      { id: "gpt-4-turbo", name: "GPT-4 Turbo", provider: "openai" },
      { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo", provider: "openai" },
    ],
  },
  google: {
    name: "Google",
    apiKey: "",
    models: [
      { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", provider: "google" },
      { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash", provider: "google" },
      { id: "gemini-pro", name: "Gemini Pro", provider: "google" },
    ],
  },
  anthropic: {
    name: "Anthropic",
    apiKey: "",
    models: [
      { id: "claude-3-5-sonnet-20241022", name: "Claude 3.5 Sonnet", provider: "anthropic" },
      { id: "claude-3-opus-20240229", name: "Claude 3 Opus", provider: "anthropic" },
      { id: "claude-3-haiku-20240307", name: "Claude 3 Haiku", provider: "anthropic" },
    ],
  },
}

export default function SettingsPage() {
  const [providers, setProviders] = useState<Record<string, ProviderConfig>>(AVAILABLE_PROVIDERS)
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({})
  const [selectedModel, setSelectedModel] = useState<string>("")

  useEffect(() => {
    // Load saved configuration
    const savedProviders = localStorage.getItem("aiProviders")
    const savedSelectedModel = localStorage.getItem("selectedModel")

    if (savedProviders) {
      try {
        const parsed = JSON.parse(savedProviders)
        setProviders({ ...AVAILABLE_PROVIDERS, ...parsed })
      } catch (e) {
        console.error("Failed to parse saved providers:", e)
      }
    }

    if (savedSelectedModel) {
      setSelectedModel(savedSelectedModel)
    } else {
      // Set default to GPT-4o if available
      setSelectedModel("gpt-4o")
    }
  }, [])

  const handleApiKeyChange = (provider: string, apiKey: string) => {
    setProviders((prev) => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        apiKey,
      },
    }))
  }

  const toggleApiKeyVisibility = (provider: string) => {
    setShowApiKeys((prev) => ({
      ...prev,
      [provider]: !prev[provider],
    }))
  }

  const handleSave = () => {
    // Save to localStorage
    localStorage.setItem("aiProviders", JSON.stringify(providers))
    localStorage.setItem("selectedModel", selectedModel)

    toast.success("Settings saved successfully!")
  }

  const getAvailableModels = () => {
    const models: ModelConfig[] = []
    Object.values(providers).forEach((provider) => {
      if (provider.apiKey.trim()) {
        models.push(...provider.models)
      }
    })
    return models
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
          <h1 className="text-3xl font-bold">AI Model Settings</h1>
        </div>

        <div className="space-y-6">
          {/* API Keys Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>API Keys Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(providers).map(([providerId, provider]) => (
                <div key={providerId} className="space-y-2">
                  <Label htmlFor={`${providerId}-key`}>{provider.name} API Key</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id={`${providerId}-key`}
                        type={showApiKeys[providerId] ? "text" : "password"}
                        value={provider.apiKey}
                        onChange={(e) => handleApiKeyChange(providerId, e.target.value)}
                        placeholder={`Enter your ${provider.name} API key`}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => toggleApiKeyVisibility(providerId)}
                      >
                        {showApiKeys[providerId] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Available models: {provider.models.map((m) => m.name).join(", ")}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Model Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Default Model Selection</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="model-select">Select Default Model</Label>
                <select
                  id="model-select"
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value="">Select a model</option>
                  {Object.values(providers).map((provider) => (
                    <optgroup key={provider.name} label={provider.name}>
                      {provider.models.map((model) => (
                        <option key={model.id} value={model.id} disabled={!provider.apiKey.trim()}>
                          {model.name} {!provider.apiKey.trim() && "(API key required)"}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                {availableModels.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Please configure at least one API key to enable model selection.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
