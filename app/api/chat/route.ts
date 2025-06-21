import { streamText } from "ai"
import { parseCSV } from "@/lib/csv-parser"
import { createOpenAI } from "@ai-sdk/openai"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { createAnthropic } from "@ai-sdk/anthropic"

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

  // Get the headers from the first row
  const headers = Object.keys(data[0] || {})
  
  // Convert the entire dataset to a structured format
  const fullDataset = data
    .map((row, index) => {
      const rowData = headers.map((header) => `${header}: ${row[header] || "N/A"}`).join(", ")
      return `Row ${index + 1}: ${rowData}`
    })
    .join("\n")

  // Calculate approximate token count (rough estimation: 1 token ≈ 4 characters)
  const approximateTokens = fullDataset.length / 4
  const maxRecommendedTokens = 150000 // Conservative limit to leave room for conversation

  let datasetSection: string
  if (approximateTokens > maxRecommendedTokens) {
    // If dataset is too large, provide summary statistics and warn about truncation
    const truncatedData = data.slice(0, Math.floor(maxRecommendedTokens * 4 / (fullDataset.length / data.length)))
    const truncatedDataset = truncatedData
      .map((row, index) => {
        const rowData = headers.map((header) => `${header}: ${row[header] || "N/A"}`).join(", ")
        return `Row ${index + 1}: ${rowData}`
      })
      .join("\n")
    
    datasetSection = `DATASET (showing ${truncatedData.length} of ${data.length} rows due to size limits):
${truncatedDataset}

NOTE: This dataset contains ${data.length} total rows, but only the first ${truncatedData.length} rows are shown above due to context length limitations. However, you can still provide analysis and insights about the overall dataset structure and answer questions about patterns that would be visible in the full dataset.`
  } else {
    datasetSection = `COMPLETE DATASET (all ${data.length} entries):
${fullDataset}`
  }

  return `You are an AI assistant that helps users analyze and query data from their uploaded dataset. You have access to a dataset containing ${data.length} entries.

DATASET STRUCTURE:
Available columns: ${headers.join(", ")}

${datasetSection}

INSTRUCTIONS:
1. Answer questions related to this specific uploaded dataset
2. Provide data-driven insights and analysis based on the complete dataset
3. You can perform calculations, comparisons, and provide summaries across all data points
4. Be helpful and informative about the data patterns and trends you can observe
5. If asked about data not present in the dataset, politely explain what data is available
6. Present your answers in a clear, easy-to-understand format
7. Focus on the user's specific data and provide relevant insights
8. When providing statistics or analysis, base it on the complete dataset of ${data.length} entries
9. The answers SHOULD have a conversational tone and be easy to understand.
10. DO NOT answer questions that are not related to the dataset. Respond that you are not able to answer that question, which is not related to the dataset and DO NOT give any other information.

You have access to the ${data.length > (maxRecommendedTokens * 4 / 100) ? 'structure and sample of the' : 'complete'} dataset and can analyze patterns, calculate statistics, identify trends, and answer specific questions about the data.`
}

function getModelInstance(modelId: string, providers: any) {
  // Extract provider from model ID and get API key
  if (modelId.startsWith("gpt-") || modelId === "o3-pro" || modelId === "o3" || modelId === "gpt-4.1") {
    const apiKey = providers?.openai?.apiKey
    if (!apiKey) throw new Error("OpenAI API key not provided. Please configure it in settings.")
    const openai = createOpenAI({ apiKey })
    return openai(modelId)
  } else if (modelId.startsWith("gemini-") || modelId.includes("gemini")) {
    const apiKey = providers?.google?.apiKey
    if (!apiKey) throw new Error("Google API key not provided. Please configure it in settings.")
    const google = createGoogleGenerativeAI({ apiKey })
    return google(modelId)
  } else if (modelId.startsWith("claude-")) {
    const apiKey = providers?.anthropic?.apiKey
    if (!apiKey) throw new Error("Anthropic API key not provided. Please configure it in settings.")
    const anthropic = createAnthropic({ apiKey })
    return anthropic(modelId)
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
