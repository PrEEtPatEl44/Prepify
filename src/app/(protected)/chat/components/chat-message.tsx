"use client"

import { useState } from "react"
import { Bot, Copy, Check, PanelRight, ChevronDown, ChevronUp } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface CodeBlock {
  code: string
  language: string
}

export interface ChatMessageData {
  id: string
  role: "user" | "assistant"
  content: string
  codeBlocks?: CodeBlock[]
  isLoading?: boolean
}

interface ChatMessageProps {
  message: ChatMessageData
  onOpenArtifact: (code: string, language: string, title: string) => void
}

function ThinkingDots() {
  return (
    <div className="flex items-center gap-1 py-1">
      <div className="size-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:0ms]" />
      <div className="size-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:150ms]" />
      <div className="size-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:300ms]" />
    </div>
  )
}

function CodeBlockView({
  code,
  language,
  onOpenArtifact,
}: {
  code: string
  language: string
  onOpenArtifact: (code: string, language: string, title: string) => void
}) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="my-2 overflow-hidden rounded-lg border bg-muted/50">
      <div className="flex items-center justify-between border-b bg-muted/80 px-3 py-1.5">
        <span className="text-xs text-muted-foreground">{language}</span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-6"
            onClick={handleCopy}
          >
            {copied ? (
              <Check className="size-3.5 text-green-500" />
            ) : (
              <Copy className="size-3.5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-6"
            onClick={() =>
              onOpenArtifact(code, language, `${language} snippet`)
            }
          >
            <PanelRight className="size-3.5" />
          </Button>
        </div>
      </div>
      <pre className="overflow-x-auto p-3 text-sm">
        <code>{code}</code>
      </pre>
    </div>
  )
}

function ExpandableText({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false)
  const limit = 800

  if (text.length <= limit) {
    return <p className="whitespace-pre-wrap">{text}</p>
  }

  return (
    <div>
      <p className="whitespace-pre-wrap">
        {expanded ? text : text.slice(0, limit) + "..."}
      </p>
      <Button
        variant="ghost"
        size="sm"
        className="mt-1 h-7 gap-1 text-xs text-muted-foreground"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? (
          <>
            Show less <ChevronUp className="size-3" />
          </>
        ) : (
          <>
            Show more <ChevronDown className="size-3" />
          </>
        )}
      </Button>
    </div>
  )
}

function ChatMessage({ message, onOpenArtifact }: ChatMessageProps) {
  const isUser = message.role === "user"

  if (message.isLoading) {
    return (
      <div className="flex items-start gap-3 px-4 py-3">
        <Avatar className="size-8 shrink-0">
          <AvatarFallback className="bg-primary/10 text-primary">
            <Bot className="size-4" />
          </AvatarFallback>
        </Avatar>
        <div className="rounded-2xl bg-muted px-4 py-3">
          <ThinkingDots />
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex items-start gap-3 px-4 py-3",
        isUser && "flex-row-reverse"
      )}
    >
      {!isUser && (
        <Avatar className="size-8 shrink-0">
          <AvatarFallback className="bg-primary/10 text-primary">
            <Bot className="size-4" />
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          "max-w-[85%] space-y-1 rounded-2xl px-4 py-3 text-sm",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground"
        )}
      >
        {message.content && <ExpandableText text={message.content} />}
        {message.codeBlocks?.map((block, i) => (
          <CodeBlockView
            key={i}
            code={block.code}
            language={block.language}
            onOpenArtifact={onOpenArtifact}
          />
        ))}
      </div>
    </div>
  )
}

export { ChatMessage }
