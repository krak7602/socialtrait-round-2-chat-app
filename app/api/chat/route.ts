import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"
import { parseCSV, type InfluencerData } from "@/lib/csv-parser"

export const maxDuration = 30

let cachedInfluencerData: InfluencerData[] | null = null

async function getInfluencerData(): Promise<InfluencerData[]> {
  if (cachedInfluencerData) {
    return cachedInfluencerData
  }

  try {
    const response = await fetch("/data/influencer-list-st.csv")
    const csvText = await response.text()
    cachedInfluencerData = parseCSV(csvText)
    return cachedInfluencerData
  } catch (error) {
    console.error("Error loading influencer data:", error)
    return []
  }
}

function createSystemPrompt(influencerData: InfluencerData[]): string {
  const dataPreview = influencerData
    .slice(0, 5)
    .map(
      (influencer) =>
        `Username: ${influencer.Username}, Full Name: ${influencer["Full Name"]}, Followers: ${influencer["Follower Count"]}, Engagement Rate: ${influencer["Engagement Rate"]}`,
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

SAMPLE DATA:
${dataPreview}

INSTRUCTIONS:
1. ONLY answer questions related to this influencer dataset
2. If asked about anything unrelated to influencers, social media, or this specific dataset, politely decline and redirect to influencer-related topics
3. Provide specific data-driven answers when possible
4. You can perform analysis, comparisons, and provide insights about the influencers
5. Be helpful and informative about social media marketing and influencer trends based on this data

If a question is not related to the influencer data, respond with: "I can only help with questions about the influencer dataset. Please ask me about influencers, their follower counts, engagement rates, or other social media related topics from the data."`
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

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
    return new Response("Internal Server Error", { status: 500 })
  }
}
