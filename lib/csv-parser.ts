export interface InfluencerData {
  Username: string
  "Full Name": string
  Introduction: string
  Verified: string
  "Follower Count": number
  "Creator City": string | null
  "Engagement Rate": string
  "Average Likes": number
  Gender: string | null
  Language: string | null
  "Creator Country": string | null
  Email: string | null
  Phone: string | null
  "Other Links": string | null
  "Profile Url": string
  "Image url": string
}

export function parseCSV(csvText: string): InfluencerData[] {
  const lines = csvText.split("\n")
  const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))

  return lines
    .slice(1)
    .filter((line) => line.trim())
    .map((line) => {
      const values = parseCSVLine(line)
      const obj: any = {}

      headers.forEach((header, index) => {
        let value = values[index]?.trim().replace(/"/g, "") || null

        // Convert numeric fields
        if (header === "Follower Count" || header === "Average Likes") {
          value = value ? Number.parseInt(value) : 0
        }

        obj[header] = value
      })

      return obj as InfluencerData
    })
}

function parseCSVLine(line: string): string[] {
  const result = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === "," && !inQuotes) {
      result.push(current)
      current = ""
    } else {
      current += char
    }
  }

  result.push(current)
  return result
}
