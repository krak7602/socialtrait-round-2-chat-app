import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  MessageCircle,
  Upload,
  Settings,
  Zap,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Page() {
  return (
    <div className="min-h-svh">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="flex min-h-svh items-center justify-center p-4">
        <div className="max-w-2xl w-full space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Fluence</h1>
            <p className="text-xl text-muted-foreground">
              Unlock influencer insights from your data using multiple AI models
            </p>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Getting Started:</strong> Upload your CSV dataset and
              configure your AI model API keys to begin analyzing your data.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Your Data, Your Insights
              </CardTitle>
              <CardDescription>
                Upload any CSV file and get AI-powered analysis and insights
                from your specific data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <MessageCircle className="h-5 w-5 text-blue-500" />
                  <span className="text-sm font-medium">
                    Interactive Chat Interface
                  </span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  <span className="text-sm font-medium">
                    Real-time Streaming
                  </span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Settings className="h-5 w-5 text-green-500" />
                  <span className="text-sm font-medium">
                    Multiple AI Models
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Setup Steps:</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-2 rounded border">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                      1
                    </div>
                    <span className="text-sm">Upload your CSV dataset</span>
                  </div>
                  <div className="flex items-center gap-3 p-2 rounded border">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                      2
                    </div>
                    <span className="text-sm">Configure AI model API keys</span>
                  </div>
                  <div className="flex items-center gap-3 p-2 rounded border">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                      3
                    </div>
                    <span className="text-sm">
                      Start chatting with your data
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Link href="/upload" className="flex-1">
                  <Button size="lg" className="w-full">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Dataset
                  </Button>
                </Link>
                <Link href="/settings">
                  <Button size="lg" variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Configure API Keys
                  </Button>
                </Link>
              </div>

              <div className="text-center">
                <Link href="/chat" className="block">
                  <Button
                    size="lg"
                    className="w-full relative overflow-hidden bg-gradient-to-r from-purple-500 via-pink-500 via-red-500 via-orange-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 bg-[length:400%_400%] animate-gradient-flow text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Go to Chat Interface
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <div className="text-center text-sm text-muted-foreground">
            <p>Supported formats: CSV files with headers</p>
            <p>
              Ask questions like: "What are the trends in my data?" or "Show me
              the top performers"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
