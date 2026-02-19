"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CheckCircle, Clock, FileText } from "lucide-react"
import { getResumeDataById } from "../actions"
import { type ResumeData } from "@/lib/agents/resumeDataExtractor"

interface ResumeListItem {
  id: string
  file_name: string
  file_path: string
  resumeData?: ResumeData | null
}

interface ImportResumeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImport: (data: ResumeData) => void
}

export function ImportResumeDialog({
  open,
  onOpenChange,
  onImport,
}: ImportResumeDialogProps) {
  const [resumes, setResumes] = useState<ResumeListItem[]>([])
  const [loading, setLoading] = useState(false)
  const [importing, setImporting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    setError(null)

    fetch("/api/docs?type=resumes")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setResumes(json.data ?? [])
        } else {
          setError("Failed to load resumes.")
        }
      })
      .catch(() => setError("Failed to load resumes."))
      .finally(() => setLoading(false))
  }, [open])

  async function handleSelect(resumeId: string) {
    setImporting(resumeId)
    const result = await getResumeDataById(resumeId)
    setImporting(null)

    if (!result.success || !result.data) {
      setError(result.error ?? "Failed to import resume data.")
      return
    }

    onImport(result.data)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Import from Resume</DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        )}

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        {!loading && !error && resumes.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No resumes uploaded yet. Upload a resume in Documents first.
          </p>
        )}

        {!loading && resumes.length > 0 && (
          <ScrollArea className="max-h-[300px]">
            <ul className="space-y-2 pr-4">
              {resumes.map((resume) => {
                const hasData = !!resume.resumeData
                const isImporting = importing === resume.id

                return (
                  <li key={resume.id}>
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-3 h-auto py-3"
                      disabled={!hasData || isImporting}
                      onClick={() => handleSelect(resume.id)}
                    >
                      <FileText className="shrink-0 w-4 h-4" />
                      <span className="flex-1 text-left truncate text-sm">
                        {resume.file_name}
                      </span>
                      {hasData ? (
                        <CheckCircle className="shrink-0 w-4 h-4 text-green-500" />
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                          <Clock className="w-3 h-3" />
                          processing…
                        </span>
                      )}
                      {isImporting && (
                        <span className="text-xs text-muted-foreground shrink-0">
                          Importing…
                        </span>
                      )}
                    </Button>
                  </li>
                )
              })}
            </ul>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  )
}
