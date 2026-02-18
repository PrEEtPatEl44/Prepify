"use client"

import { useEffect, useState } from "react"
import { ProfileForm } from "./components/ProfileForm"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { UserCircle, Upload, PenLine } from "lucide-react"
import { type ResumeData } from "@/lib/agents/resumeDataExtractor"
import { ImportResumeDialog } from "./components/ImportResumeDialog"
import { ScrollArea } from "@/components/ui/scroll-area"

type PageState = "loading" | "empty" | "form"

export default function ProfilePage() {
  const [pageState, setPageState] = useState<PageState>("loading")
  const [profileData, setProfileData] = useState<ResumeData | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [importedData, setImportedData] = useState<ResumeData | null>(null)

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setProfileData(json.data)
          setPageState("form")
        } else {
          setPageState("empty")
        }
      })
      .catch(() => setPageState("empty"))
  }, [])

  function handleImport(data: ResumeData) {
    setImportedData(data)
    setShowForm(true)
    setPageState("form")
  }

  if (pageState === "loading") {
    return (
      <ScrollArea className="h-full">
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </ScrollArea>
    )
  }

  if (pageState === "empty" && !showForm) {
    return (
      <ScrollArea className="h-full">
        <ImportResumeDialog
          open={importOpen}
          onOpenChange={setImportOpen}
          onImport={handleImport}
        />
        <div className="flex flex-col items-center justify-center min-h-full gap-6 px-4">
          <UserCircle className="w-16 h-16 text-muted-foreground" />
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-semibold">Set up your profile</h1>
            <p className="text-muted-foreground max-w-sm">
              Your master profile powers AI-generated tailored resumes. Import
              from an existing resume or fill it in manually.
            </p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => setImportOpen(true)} variant="default">
              <Upload className="w-4 h-4 mr-2" />
              Import from Resume
            </Button>
            <Button
              onClick={() => {
                setShowForm(true)
                setPageState("form")
              }}
              variant="outline"
            >
              <PenLine className="w-4 h-4 mr-2" />
              Fill Manually
            </Button>
          </div>
        </div>
      </ScrollArea>
    )
  }

  return (
    <ScrollArea className="h-full">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <ProfileForm initialData={importedData ?? profileData} />
      </div>
    </ScrollArea>
  )
}
