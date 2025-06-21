"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { ArrowLeft, Upload, FileText, Trash2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { useDropzone } from "react-dropzone"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function UploadPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [csvData, setCsvData] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file && file.type === "text/csv") {
      setUploadedFile(file)
      setIsProcessing(true)

      // Read the file content
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setCsvData(content)

        // Save to localStorage
        localStorage.setItem("uploadedCsvData", content)
        localStorage.setItem("uploadedCsvName", file.name)

        setIsProcessing(false)
        toast.success("CSV file uploaded successfully!")
      }
      reader.onerror = () => {
        setIsProcessing(false)
        toast.error("Failed to read the file")
      }
      reader.readAsText(file)
    } else {
      toast.error("Please upload a valid CSV file")
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
    },
    multiple: false,
  })

  const clearUploadedFile = () => {
    setUploadedFile(null)
    setCsvData(null)
    localStorage.removeItem("uploadedCsvData")
    localStorage.removeItem("uploadedCsvName")
    toast.success("Uploaded file cleared")
  }

  // Load existing uploaded file on component mount
  useState(() => {
    if (typeof window !== "undefined") {
      const savedCsvData = localStorage.getItem("uploadedCsvData")
      const savedCsvName = localStorage.getItem("uploadedCsvName")

      if (savedCsvData && savedCsvName) {
        setCsvData(savedCsvData)
        // Create a mock file object for display
        const mockFile = new File([savedCsvData], savedCsvName, { type: "text/csv" })
        setUploadedFile(mockFile)
      }
    }
  })

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
          <h1 className="text-3xl font-bold">Upload Your Dataset</h1>
        </div>

        <div className="space-y-6">
          {/* Important Notice */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Dataset Required:</strong> You must upload a CSV file to use the chat feature. The AI will analyze
              and answer questions about your specific data.
            </AlertDescription>
          </Alert>

          {/* Upload Area */}
          <Card>
            <CardHeader>
              <CardTitle>CSV File Upload</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                {isDragActive ? (
                  <p className="text-lg">Drop the CSV file here...</p>
                ) : (
                  <div>
                    <p className="text-lg mb-2">Drag & drop a CSV file here, or click to select</p>
                    <p className="text-sm text-muted-foreground">Only CSV files are accepted</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Current File Status */}
          <Card>
            <CardHeader>
              <CardTitle>Current Dataset</CardTitle>
            </CardHeader>
            <CardContent>
              {uploadedFile ? (
                <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="font-medium">{uploadedFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Ready for analysis • {csvData ? csvData.split("\n").length - 1 : 0} rows
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={clearUploadedFile}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-center p-8 border rounded-lg border-dashed border-muted-foreground/25">
                  <div className="text-center">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="font-medium text-muted-foreground">No dataset uploaded</p>
                    <p className="text-sm text-muted-foreground">Upload a CSV file to get started</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>CSV Format Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Required Format:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>First row should contain column headers</li>
                  <li>Each subsequent row represents one data entry</li>
                  <li>Use commas to separate values</li>
                  <li>Enclose text containing commas in quotes</li>
                  <li>Ensure consistent data types within columns</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-2">Example:</h4>
                <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
                  {`Name,Age,City,Occupation,Salary
"John Doe",30,"New York, NY",Developer,75000
Jane Smith,25,Boston,Designer,65000
Mike Johnson,35,Chicago,Manager,85000`}
                </pre>
              </div>

              <div>
                <h4 className="font-medium mb-2">Tips for Better Analysis:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Use descriptive column headers</li>
                  <li>Include numeric data for calculations and comparisons</li>
                  <li>Keep data clean and consistent</li>
                  <li>Remove empty rows and columns</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
            {uploadedFile ? (
              <Link href="/chat">
                <Button size="lg">Start Analyzing Your Data</Button>
              </Link>
            ) : (
              <Button size="lg" disabled>
                Upload Dataset First
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
