import { streamText } from "ai"
import { parseCSV, type InfluencerData } from "@/lib/csv-parser"
import { readFile } from "fs/promises"
import { join } from "path"
import { openai } from "@ai-sdk/openai"
import { google } from "@ai-sdk/google"
import { anthropic } from "@ai-sdk/anthropic"

export const maxDuration = 30

let cachedInfluencerData: InfluencerData[] | null = null

async function getInfluencerData(uploadedCsvData?: string): Promise<any[]> {
  // If uploaded CSV data is provided, use it
  if (uploadedCsvData) {
    try {
      return parseCSV(uploadedCsvData)
    } catch (error) {
      console.error("Error parsing uploaded CSV:", error)
      throw new Error("Failed to parse uploaded CSV data")
    }
  }

  // Otherwise, use cached default data or load it
  if (cachedInfluencerData) {
    return cachedInfluencerData
  }

  try {
    const filePath = join(process.cwd(), "public", "influencer-list-st.csv")
    const csvText = await readFile(filePath, "utf-8")
    cachedInfluencerData = parseCSV(csvText)
    return cachedInfluencerData
  } catch (error) {
    console.error("Error loading influencer data:", error)
    return []
  }
}

function createSystemPrompt(data: any[], isCustomData = false): string {
  if (data.length === 0) {
    return "You are an AI assistant, but no data is currently available to analyze."
  }

  // Get the first few rows to understand the structure
  const sampleData = data.slice(0, 3)
  const headers = Object.keys(sampleData[0] || {})

  const dataPreview = data
    .slice(0, 10) // Show first 10 rows as preview
    .map((row) => headers.map((header) => `${header}: ${row[header] || "N/A"}`).join(", "))
    .join("\n")

  const datasetType = isCustomData ? "uploaded dataset" : "influencer dataset"

  return `You are an AI assistant that helps users analyze and query data from their ${datasetType}. You have access to a dataset containing ${data.length} entries.

DATASET STRUCTURE:
Available columns: ${headers.join(", ")}

SAMPLE DATA (first 10 entries):
${dataPreview}

INSTRUCTIONS:
1. Answer questions related to this specific dataset
2. Provide data-driven insights and analysis
3. You can perform calculations, comparisons, and provide summaries
4. Be helpful and informative about the data patterns and trends
5. If asked about data not present in the dataset, politely explain what data is available
6. Present your answers in a clear, easy-to-understand format

The complete dataset contains ${data.length} entries with the columns listed above. You can analyze any aspect of this data to help the user understand patterns, trends, and insights.`
}

function getModelInstance(modelId: string, providers: any) {
  // Extract provider from model ID
  if (modelId.startsWith("gpt-")) {
    const apiKey = providers?.openai?.apiKey || process.env.OPENAI_API_KEY
    if (!apiKey) throw new Error("OpenAI API key not configured")
    return openai(modelId, { apiKey })
  } else if (modelId.startsWith("gemini-") || modelId.includes("gemini")) {
    const apiKey = providers?.google?.apiKey || process.env.GOOGLE_GENERATIVE_AI_API_KEY
    if (!apiKey) throw new Error("Google API key not configured")
    return google(modelId, { apiKey })
  } else if (modelId.startsWith("claude-")) {
    const apiKey = providers?.anthropic?.apiKey || process.env.ANTHROPIC_API_KEY
    if (!apiKey) throw new Error("Anthropic API key not configured")
    return anthropic(modelId, { apiKey })
  } else {
    // Default to OpenAI GPT-4o
    const apiKey = providers?.openai?.apiKey || process.env.OPENAI_API_KEY
    if (!apiKey) throw new Error("No API key configured")
    return openai("gpt-4o", { apiKey })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { messages, selectedModel, uploadedCsvData } = body

    if (!messages || !Array.isArray(messages)) {
      return new Response("Invalid request: messages array required", { status: 400 })
    }

    // Get providers from request headers or use environment variables
    const providersHeader = req.headers.get("x-ai-providers")
    let providers = null

    if (providersHeader) {
      try {
        providers = JSON.parse(providersHeader)
      } catch (e) {
        console.error("Failed to parse providers header:", e)
      }
    }

    const data = await getInfluencerData(uploadedCsvData)
    const systemPrompt = createSystemPrompt(data, !!uploadedCsvData)

    // Get the appropriate model instance
    const model = getModelInstance(selectedModel || "gpt-4o", providers)

    const result = streamText({
      model,
      system: systemPrompt,
      messages,
      temperature: 0.7,
      maxTokens: 1000,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Error in chat API:", error)

    if (error instanceof SyntaxError) {
      return new Response("Invalid JSON in request body", { status: 400 })
    }

    if (error instanceof Error && error.message.includes("API key")) {
      return new Response(error.message, { status: 401 })
    }

    if (error instanceof Error && error.message.includes("CSV")) {
      return new Response(error.message, { status: 400 })
    }

    return new Response("Internal Server Error", { status: 500 })
  }
}
