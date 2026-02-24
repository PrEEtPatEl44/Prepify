"use client"

import { useRef, useEffect } from "react"
import { Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface ArtifactViewerProps {
  content: string
  language: string
  mode: "code" | "preview"
}

function ArtifactViewer({ content, language, mode }: ArtifactViewerProps) {
  const [copied, setCopied] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    if (mode === "preview" && language === "html" && iframeRef.current) {
      const doc = iframeRef.current.contentDocument
      if (doc) {
        doc.open()
        doc.write(content)
        doc.close()
      }
    }
  }, [content, language, mode])

  function handleCopy() {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (mode === "preview" && language === "html") {
    return (
      <div className="relative h-full w-full">
        <iframe
          ref={iframeRef}
          title="Artifact Preview"
          className="h-full w-full border-0 bg-white"
          sandbox="allow-scripts"
        />
      </div>
    )
  }

  if (mode === "preview" && language !== "html") {
    return (
      <div className="flex h-full items-center justify-center p-8 text-muted-foreground">
        <p className="text-sm">Preview is only available for HTML artifacts</p>
      </div>
    )
  }

  return (
    <div className="relative h-full">
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-3 top-3 z-10 size-8"
        onClick={handleCopy}
      >
        {copied ? (
          <Check className="size-4 text-green-500" />
        ) : (
          <Copy className="size-4" />
        )}
      </Button>
      <pre
        className={cn(
          "h-full overflow-auto p-4 text-sm leading-relaxed",
          "bg-muted/50 font-mono"
        )}
      >
        <code>{content}</code>
      </pre>
    </div>
  )
}

export { ArtifactViewer }
