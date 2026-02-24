"use client"

import { useRef, useCallback, useState } from "react"
import { Paperclip, ArrowUp } from "lucide-react"
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
    const maxHeight = 6 * 24
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

  const hasContent = value.trim() || attachments.length > 0

  return (
    <div className="px-4">
      <div className={cn(
        "relative rounded-2xl border bg-muted/50 shadow-sm",
        "focus-within:ring-1 focus-within:ring-ring",
        "transition-shadow"
      )}>
        {/* Attachment chips */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-1.5 px-4 pt-3">
            {attachments.map((a) => (
              <AttachmentChip
                key={a.id}
                attachment={a}
                onRemove={removeAttachment}
              />
            ))}
          </div>
        )}

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            adjustHeight()
          }}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder="Message Prepify..."
          disabled={disabled}
          rows={1}
          className={cn(
            "w-full resize-none bg-transparent px-4 py-3 text-sm",
            "placeholder:text-muted-foreground",
            "focus-visible:outline-none",
            "disabled:opacity-50"
          )}
        />

        {/* Bottom toolbar */}
        <div className="flex items-center justify-between px-3 pb-2">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="size-8 rounded-lg text-muted-foreground hover:text-foreground"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
            >
              <Paperclip className="size-4" />
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
          <Button
            size="icon"
            className={cn(
              "size-8 rounded-lg transition-opacity",
              hasContent ? "opacity-100" : "opacity-40"
            )}
            onClick={handleSend}
            disabled={disabled || !hasContent}
          >
            <ArrowUp className="size-4" />
          </Button>
        </div>
      </div>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        Prepify can make mistakes. Verify important information.
      </p>
    </div>
  )
}

export { ChatInput }
