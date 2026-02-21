"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Document, Page, pdfjs } from "react-pdf"
import "react-pdf/dist/Page/AnnotationLayer.css"
import "react-pdf/dist/Page/TextLayer.css"
import { ArrowLeft, Loader2, Save, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { type ResumeData } from "@/lib/agents/resumeDataExtractor"
import { getResumeForJob, editResumeChat, saveResumeEdits } from "./actions"

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString()

interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

function base64ToBlobUrl(base64: string): string {
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))
  const blob = new Blob([bytes], { type: "application/pdf" })
  return URL.createObjectURL(blob)
}

export default function ResumeEditorPage() {
  const params = useParams<{ jobId: string }>()
  const router = useRouter()
  const jobId = params.jobId

  const [resumeData, setResumeData] = useState<ResumeData | null>(null)
  const [resumeId, setResumeId] = useState<string | null>(null)
  const [filePath, setFilePath] = useState<string | null>(null)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [pdfBase64, setPdfBase64] = useState<string | null>(null)
  const [numPages, setNumPages] = useState<number>(0)
  const [jobTitle, setJobTitle] = useState("")
  const [companyName, setCompanyName] = useState("")

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const prevBlobUrl = useRef<string | null>(null)

  const updatePdfUrl = useCallback((base64: string) => {
    if (prevBlobUrl.current) {
      URL.revokeObjectURL(prevBlobUrl.current)
    }
    const url = base64ToBlobUrl(base64)
    prevBlobUrl.current = url
    setPdfUrl(url)
    setPdfBase64(base64)
  }, [])

  // Load initial resume data
  useEffect(() => {
    async function load() {
      setIsLoading(true)
      const result = await getResumeForJob(jobId)
      if (result.success && result.data) {
        setResumeData(result.data.resumeData)
        setResumeId(result.data.resumeId)
        setFilePath(result.data.filePath)
        setJobTitle(result.data.jobTitle)
        setCompanyName(result.data.companyName)
        updatePdfUrl(result.data.pdfBase64)
        setMessages([
          {
            role: "assistant",
            content: `Resume loaded for ${result.data.jobTitle} at ${result.data.companyName}. Tell me what changes you'd like to make.`,
          },
        ])
      } else {
        toast.error(result.error || "Failed to load resume")
      }
      setIsLoading(false)
    }
    load()
  }, [jobId, updatePdfUrl])

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (prevBlobUrl.current) {
        URL.revokeObjectURL(prevBlobUrl.current)
      }
    }
  }, [])

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function handleSend() {
    const trimmed = input.trim()
    if (!trimmed || !resumeData || isProcessing) return

    const userMessage: ChatMessage = { role: "user", content: trimmed }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsProcessing(true)

    const result = await editResumeChat(resumeData, trimmed)

    if (result.success && result.data) {
      setResumeData(result.data.resumeData)
      updatePdfUrl(result.data.pdfBase64)
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: result.data!.assistantMessage },
      ])
    } else {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Something went wrong: ${result.error || "Unknown error"}. Please try again.`,
        },
      ])
    }

    setIsProcessing(false)
    textareaRef.current?.focus()
  }

  async function handleSave() {
    if (!resumeId || !resumeData || !pdfBase64 || !filePath) return

    setIsSaving(true)
    const result = await saveResumeEdits(
      resumeId,
      resumeData,
      pdfBase64,
      filePath,
    )

    if (result.success) {
      toast.success("Resume saved successfully")
    } else {
      toast.error(result.error || "Failed to save resume")
    }
    setIsSaving(false)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] w-full gap-4 p-4">
        <div className="flex w-1/3 flex-col gap-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-full w-full flex-1" />
          <Skeleton className="h-20 w-full" />
        </div>
        <div className="flex w-2/3 flex-col gap-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-full w-full flex-1" />
        </div>
      </div>
    )
  }

  if (!resumeData) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            No resume found for this job. Generate one first.
          </p>
          <Button variant="outline" onClick={() => router.push("/jobs")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Jobs
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full gap-0">
      {/* Left column — Chat */}
      <div className="flex w-[380px] min-w-[320px] flex-col border-r">
        {/* Chat header */}
        <div className="flex items-center gap-3 border-b px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => router.push("/jobs")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{jobTitle}</p>
            <p className="truncate text-xs text-muted-foreground">
              {companyName}
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isProcessing && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                Updating resume...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="border-t p-3">
          <div className="flex gap-2">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe what to change..."
              className="min-h-[60px] max-h-[120px] resize-none text-sm"
              disabled={isProcessing}
            />
            <Button
              size="icon"
              className="h-[60px] w-10 shrink-0"
              onClick={handleSend}
              disabled={!input.trim() || isProcessing}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Right column — PDF viewer */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* PDF header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <p className="truncate text-sm font-medium">
            Resume Preview
            {numPages > 0 && (
              <span className="ml-2 text-xs text-muted-foreground">
                ({numPages} {numPages === 1 ? "page" : "pages"})
              </span>
            )}
          </p>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving || !resumeData}
          >
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save
          </Button>
        </div>

        {/* PDF content */}
        <div className="flex-1 overflow-y-auto bg-muted/30">
          {pdfUrl ? (
            <Document
              file={pdfUrl}
              onLoadSuccess={({ numPages: n }) => setNumPages(n)}
              className="flex flex-col items-center gap-4 p-4"
              loading={
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              }
            >
              {Array.from({ length: numPages }, (_, i) => (
                <Page
                  key={`page_${i + 1}`}
                  pageNumber={i + 1}
                  className="shadow-lg"
                />
              ))}
            </Document>
          ) : (
            <div className="flex items-center justify-center py-20">
              <p className="text-muted-foreground">No PDF to display</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
