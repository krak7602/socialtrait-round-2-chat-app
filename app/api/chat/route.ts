import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"
import { parseCSV, type InfluencerData } from "@/lib/csv-parser"
import { readFile } from "fs/promises"
import { join } from "path"

export const maxDuration = 30

let cachedInfluencerData: InfluencerData[] | null = null

async function getInfluencerData(): Promise<InfluencerData[]> {
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

function createSystemPrompt(influencerData: InfluencerData[]): string {
  const allInfluencerData = influencerData
    .map(
      (influencer) =>
        `Username: ${influencer.Username}, Full Name: ${influencer["Full Name"]}, Followers: ${influencer["Follower Count"]}, Engagement Rate: ${influencer["Engagement Rate"]}, Verified: ${influencer.Verified}, City: ${influencer["Creator City"] || "N/A"}, Country: ${influencer["Creator Country"] || "N/A"}, Gender: ${influencer.Gender || "N/A"}, Language: ${influencer.Language || "N/A"}`,
    )
    .join("\n")

  return `You are an AI assistant that helps users analyze and query influencer data. You have access to a dataset containing ${influencerData.length} influencers with the following information:

DATASET SCHEMA:
- Username: Instagram username
- Full Name: Real name of the influencer  
- Introduction: Bio/description
- Verified: Whether the account is verified (Yes/No)
- Follower Count: Number of followers
- Creator City: Location (if available)
- Engagement Rate: Engagement rate as decimal
- Average Likes: Average number of likes per post
- Gender: Gender (if available)
- Language: Primary language (if available)
- Creator Country: Country (if available)
- Email: Contact email (if available)
- Phone: Contact phone (if available)
- Other Links: Additional social links (if available)
- Profile Url: Instagram profile URL
- Image url: Profile image URL

COMPLETE DATASET:
${allInfluencerData}

INSTRUCTIONS:
1. ONLY answer questions related to this influencer dataset
2. If asked about anything unrelated to influencers, social media, or this specific dataset, politely decline and redirect to influencer-related topics
3. Provide specific data-driven answers when possible
4. You can perform analysis, comparisons, and provide insights about the influencers
5. Be helpful and informative about social media marketing and influencer trends based on this data
6. You have access to the complete dataset above, so you can provide precise answers about any influencer in the data
7. Do not show the computations used and as a user facing LLM, you should be able to answer questions about the data in a way that is easy to understand and use.

If a question is not related to the influencer data, respond with: "I can only help with questions about the influencer dataset. Please ask me about influencers, their follower counts, engagement rates, or other social media related topics from the data."`
}

export async function POST(req: Request) {
  try {
    // Add validation for request body
    const body = await req.json()
    const { messages } = body

    if (!messages || !Array.isArray(messages)) {
      return new Response("Invalid request: messages array required", { status: 400 })
    }

    const influencerData = await getInfluencerData()
    const systemPrompt = createSystemPrompt(influencerData)

    const result = streamText({
      model: openai("gpt-4o"),
      system: systemPrompt,
      messages,
      temperature: 0.7,
      maxTokens: 1000,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Error in chat API:", error)
    
    // More specific error handling
    if (error instanceof SyntaxError) {
      return new Response("Invalid JSON in request body", { status: 400 })
    }
    
    return new Response("Internal Server Error", { status: 500 })
  }
}
