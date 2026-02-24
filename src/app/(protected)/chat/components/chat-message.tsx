"use client"

import { useState } from "react"
import { Bot, User, Copy, Check, PanelRight, ChevronDown, ChevronUp } from "lucide-react"
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
    <div className="flex items-center gap-1.5 py-1">
      <div className="size-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:0ms]" />
      <div className="size-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:150ms]" />
      <div className="size-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:300ms]" />
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
    <div className="my-3 overflow-hidden rounded-xl border">
      <div className="flex items-center justify-between border-b bg-muted px-4 py-2">
        <span className="text-xs font-medium text-muted-foreground">{language}</span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-muted-foreground hover:text-foreground"
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
            className="size-7 text-muted-foreground hover:text-foreground"
            onClick={() =>
              onOpenArtifact(code, language, `${language} snippet`)
            }
          >
            <PanelRight className="size-3.5" />
          </Button>
        </div>
      </div>
      <pre className="overflow-x-auto bg-muted/40 p-4 text-[13px] leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  )
}

function ExpandableText({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false)
  const limit = 800

  if (text.length <= limit) {
    return <p className="whitespace-pre-wrap leading-relaxed">{text}</p>
  }

  return (
    <div>
      <p className="whitespace-pre-wrap leading-relaxed">
        {expanded ? text : text.slice(0, limit) + "..."}
      </p>
      <Button
        variant="ghost"
        size="sm"
        className="mt-1 h-7 gap-1 text-xs text-muted-foreground hover:text-foreground"
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
      <div className="flex gap-4 px-4 py-6">
        <Avatar className="size-7 shrink-0 mt-0.5">
          <AvatarFallback className="bg-primary/10 text-primary text-xs">
            <Bot className="size-4" />
          </AvatarFallback>
        </Avatar>
        <div className="pt-1">
          <ThinkingDots />
        </div>
      </div>
    )
  }

  return (
    <div className={cn("flex gap-4 px-4 py-6", isUser && "flex-row-reverse")}>
      <Avatar className="size-7 shrink-0 mt-0.5">
        <AvatarFallback
          className={cn(
            "text-xs",
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-primary/10 text-primary"
          )}
        >
          {isUser ? <User className="size-4" /> : <Bot className="size-4" />}
        </AvatarFallback>
      </Avatar>
      <div
        className={cn(
          "min-w-0 max-w-[85%] text-sm",
          isUser && "text-right"
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
