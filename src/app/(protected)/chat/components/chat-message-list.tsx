"use client"

import { useRef, useEffect } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChatMessage, type ChatMessageData } from "./chat-message"

interface ChatMessageListProps {
  messages: ChatMessageData[]
  onOpenArtifact: (code: string, language: string, title: string) => void
}

function ChatMessageList({ messages, onOpenArtifact }: ChatMessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col divide-y divide-border/40">
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
