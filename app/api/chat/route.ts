import { streamText } from "ai"
import { parseCSV } from "@/lib/csv-parser"
import { openai } from "@ai-sdk/openai"
import { google } from "@ai-sdk/google"
import { anthropic } from "@ai-sdk/anthropic"

export const maxDuration = 30

async function getUploadedData(uploadedCsvData?: string): Promise<any[]> {
  if (!uploadedCsvData) {
    throw new Error("No dataset uploaded. Please upload a CSV file to analyze.")
  }

  try {
    return parseCSV(uploadedCsvData)
  } catch (error) {
    console.error("Error parsing uploaded CSV:", error)
    throw new Error("Failed to parse uploaded CSV data. Please check your file format.")
  }
}

function createSystemPrompt(data: any[]): string {
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

  return `You are an AI assistant that helps users analyze and query data from their uploaded dataset. You have access to a dataset containing ${data.length} entries.

DATASET STRUCTURE:
Available columns: ${headers.join(", ")}

SAMPLE DATA (first 10 entries):
${dataPreview}

INSTRUCTIONS:
1. Answer questions related to this specific uploaded dataset
2. Provide data-driven insights and analysis
3. You can perform calculations, comparisons, and provide summaries
4. Be helpful and informative about the data patterns and trends
5. If asked about data not present in the dataset, politely explain what data is available
6. Present your answers in a clear, easy-to-understand format
7. Focus on the user's specific data and provide relevant insights

The complete dataset contains ${data.length} entries with the columns listed above. You can analyze any aspect of this data to help the user understand patterns, trends, and insights from their uploaded information.`
}

function getModelInstance(modelId: string, providers: any) {
  // Extract provider from model ID and get API key
  if (modelId.startsWith("gpt-")) {
    const apiKey = providers?.openai?.apiKey
    if (!apiKey) throw new Error("OpenAI API key not provided. Please configure it in settings.")
    return openai(modelId, { apiKey })
  } else if (modelId.startsWith("gemini-") || modelId.includes("gemini")) {
    const apiKey = providers?.google?.apiKey
    if (!apiKey) throw new Error("Google API key not provided. Please configure it in settings.")
    return google(modelId, { apiKey })
  } else if (modelId.startsWith("claude-")) {
    const apiKey = providers?.anthropic?.apiKey
    if (!apiKey) throw new Error("Anthropic API key not provided. Please configure it in settings.")
    return anthropic(modelId, { apiKey })
  } else {
    throw new Error("Invalid model selected. Please select a valid model from the settings.")
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { messages, selectedModel, uploadedCsvData, providers } = body

    if (!messages || !Array.isArray(messages)) {
      return new Response("Invalid request: messages array required", { status: 400 })
    }

    if (!selectedModel) {
      return new Response("No model selected. Please select a model in the chat interface.", { status: 400 })
    }

    if (!providers) {
      return new Response("No API providers configured. Please configure API keys in settings.", { status: 400 })
    }

    if (!uploadedCsvData) {
      return new Response("No dataset uploaded. Please upload a CSV file to analyze.", { status: 400 })
    }

    const data = await getUploadedData(uploadedCsvData)
    const systemPrompt = createSystemPrompt(data)

    // Get the appropriate model instance
    const model = getModelInstance(selectedModel, providers)

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

    if (
      (error instanceof Error && error.message.includes("dataset")) ||
      (error instanceof Error && error.message.includes("CSV"))
    ) {
      return new Response(error.message, { status: 400 })
    }

    if (error instanceof Error && error.message.includes("model")) {
      return new Response(error.message, { status: 400 })
    }

    return new Response("Internal Server Error", { status: 500 })
  }
}
