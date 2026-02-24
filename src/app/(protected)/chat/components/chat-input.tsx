"use client"

import { useRef, useCallback, useState } from "react"
import { Paperclip, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AttachmentChip, type Attachment } from "./attachment-chip"
import { cn } from "@/lib/utils"

interface ChatInputProps {
  onSend: (message: string, attachments: Attachment[]) => void
  disabled?: boolean
}

const LARGE_TEXT_THRESHOLD = 500

function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState("")
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = "auto"
    const maxHeight = 6 * 24 // ~6 rows
    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`
  }, [])

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLTextAreaElement>) {
    const text = e.clipboardData.getData("text/plain")
    if (text.length > LARGE_TEXT_THRESHOLD) {
      e.preventDefault()
      const attachment: Attachment = {
        id: crypto.randomUUID(),
        type: "text",
        name: `Text snippet`,
        content: text,
        size: new Blob([text]).size,
      }
      setAttachments((prev) => [...prev, attachment])
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files) return
    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onload = () => {
        const attachment: Attachment = {
          id: crypto.randomUUID(),
          type: "file",
          name: file.name,
          content: reader.result as string,
          size: file.size,
        }
        setAttachments((prev) => [...prev, attachment])
      }
      reader.readAsText(file)
    })
    e.target.value = ""
  }

  function removeAttachment(id: string) {
    setAttachments((prev) => prev.filter((a) => a.id !== id))
  }

  function handleSend() {
    const trimmed = value.trim()
    if (!trimmed && attachments.length === 0) return
    onSend(trimmed, attachments)
    setValue("")
    setAttachments([])
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }
  }

  return (
    <div className="border-t bg-background px-4 py-3">
      {/* Attachment chips */}
      {attachments.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {attachments.map((a) => (
            <AttachmentChip
              key={a.id}
              attachment={a}
              onRemove={removeAttachment}
            />
          ))}
        </div>
      )}

      {/* Input row */}
      <div className="flex items-end gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="size-9 shrink-0"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
        >
          <Paperclip className="size-5" />
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            adjustHeight()
          }}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder="Type a message..."
          disabled={disabled}
          rows={1}
          className={cn(
            "flex-1 resize-none rounded-xl border bg-muted/50 px-4 py-2.5 text-sm",
            "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            "disabled:opacity-50"
          )}
        />
        <Button
          size="icon"
          className="size-9 shrink-0 rounded-full"
          onClick={handleSend}
          disabled={disabled || (!value.trim() && attachments.length === 0)}
        >
          <Send className="size-4" />
        </Button>
      </div>
    </div>
  )
}

export { ChatInput }
