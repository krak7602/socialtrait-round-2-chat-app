import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageCircle, Database, Zap } from "lucide-react"
import Link from "next/link"

export default function Page() {
  return (
    <div className="min-h-svh">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="flex min-h-svh items-center justify-center p-4">
        <div className="max-w-2xl w-full space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Influencer Data Chat</h1>
            <p className="text-xl text-muted-foreground">AI-powered insights from influencer data using ChatGPT</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Dataset Overview
              </CardTitle>
              <CardDescription>
                Comprehensive influencer data including usernames, follower counts, engagement rates, and more
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <MessageCircle className="h-5 w-5 text-blue-500" />
                  <span className="text-sm font-medium">Interactive Chat Interface</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  <span className="text-sm font-medium">Real-time Streaming</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Database className="h-5 w-5 text-green-500" />
                  <span className="text-sm font-medium">Data-driven Insights</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Link href="/chat" className="flex-1">
                  <Button size="lg" className="w-full">
                    Start Chatting with Data
                  </Button>
                </Link>
                <Link href="/upload">
                  <Button size="lg" variant="outline">
                    Upload Data
                  </Button>
                </Link>
                <Link href="/settings">
                  <Button size="lg" variant="outline">
                    Configure Models
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <div className="text-center text-sm text-muted-foreground">
            Ask questions like: "Who are the top influencers?" or "What's the average engagement rate?"
          </div>
        </div>
      </div>
    </div>
  )
}
