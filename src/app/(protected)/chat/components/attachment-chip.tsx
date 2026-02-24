"use client"

import { X, FileText, FileCode, FileImage } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

export interface Attachment {
  id: string
  type: "file" | "text"
  name: string
  content: string
  size?: number
}

interface AttachmentChipProps {
  attachment: Attachment
  onRemove: (id: string) => void
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getFileIcon(name: string) {
  if (/\.(tsx?|jsx?|py|rs|go|java|c|cpp|rb)$/.test(name)) return FileCode
  if (/\.(png|jpe?g|gif|svg|webp)$/.test(name)) return FileImage
  return FileText
}

function AttachmentChip({ attachment, onRemove }: AttachmentChipProps) {
  const Icon = attachment.type === "file" ? getFileIcon(attachment.name) : FileText
  const label =
    attachment.type === "text"
      ? `Text snippet (${attachment.content.length} chars)`
      : attachment.name

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Badge
          variant="secondary"
          className="cursor-pointer gap-1.5 py-1 pl-2 pr-1 text-xs hover:bg-secondary/80"
        >
          <Icon className="!size-3.5" />
          <span className="max-w-[150px] truncate">{label}</span>
          {attachment.size && (
            <span className="text-muted-foreground">
              ({formatSize(attachment.size)})
            </span>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="size-4 rounded-full hover:bg-destructive/20"
            onClick={(e) => {
              e.stopPropagation()
              onRemove(attachment.id)
            }}
          >
            <X className="!size-3" />
          </Button>
        </Badge>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="border-b px-3 py-2">
          <p className="text-sm font-medium">{label}</p>
        </div>
        <ScrollArea className="h-[200px] p-3">
          <pre className="whitespace-pre-wrap text-xs text-muted-foreground">
            {attachment.content.slice(0, 2000)}
            {attachment.content.length > 2000 && "\n..."}
          </pre>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}

export { AttachmentChip }
