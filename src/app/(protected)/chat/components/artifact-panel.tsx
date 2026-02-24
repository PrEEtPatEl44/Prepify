"use client"

import { X, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { ArtifactViewer } from "./artifact-viewer"

export interface Artifact {
  id: string
  title: string
  content: string
  language: string
}

interface ArtifactPanelProps {
  artifacts: Artifact[]
  activeIndex: number
  onActiveIndexChange: (index: number) => void
  viewMode: "code" | "preview"
  onViewModeChange: (mode: "code" | "preview") => void
  onClose: () => void
}

function ArtifactPanel({
  artifacts,
  activeIndex,
  onActiveIndexChange,
  viewMode,
  onViewModeChange,
  onClose,
}: ArtifactPanelProps) {
  const artifact = artifacts[activeIndex]
  if (!artifact) return null

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2 min-w-0">
          {artifacts.length > 1 && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="size-6"
                disabled={activeIndex === 0}
                onClick={() => onActiveIndexChange(activeIndex - 1)}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {activeIndex + 1}/{artifacts.length}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="size-6"
                disabled={activeIndex === artifacts.length - 1}
                onClick={() => onActiveIndexChange(activeIndex + 1)}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          )}
          <h3 className="truncate text-sm font-medium">{artifact.title}</h3>
        </div>
        <div className="flex items-center gap-2">
          <ToggleGroup
            type="single"
            value={viewMode}
            onValueChange={(val) => {
              if (val) onViewModeChange(val as "code" | "preview")
            }}
            size="sm"
          >
            <ToggleGroupItem value="code" className="text-xs px-3">
              Code
            </ToggleGroupItem>
            <ToggleGroupItem value="preview" className="text-xs px-3">
              Preview
            </ToggleGroupItem>
          </ToggleGroup>
          <Button variant="ghost" size="icon" className="size-8" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <ArtifactViewer
          content={artifact.content}
          language={artifact.language}
          mode={viewMode}
        />
      </div>
    </div>
  )
}

export { ArtifactPanel }
