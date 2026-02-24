"use client"

import { useRef, useEffect } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChatMessage, type ChatMessageData } from "./chat-message"
import { cn } from "@/lib/utils"

interface ChatMessageListProps {
  messages: ChatMessageData[]
  onOpenArtifact: (code: string, language: string, title: string) => void
  maxWidthClass?: string
}

function ChatMessageList({ messages, onOpenArtifact, maxWidthClass }: ChatMessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <ScrollArea className="h-full">
      <div className={cn("flex flex-col", maxWidthClass)}>
        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            message={msg}
            onOpenArtifact={onOpenArtifact}
          />
        ))}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  )
}

export { ChatMessageList }
