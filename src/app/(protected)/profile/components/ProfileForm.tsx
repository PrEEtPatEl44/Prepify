"use client"

import { useState } from "react"
import { toast } from "sonner"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Plus, Trash2, Upload } from "lucide-react"
import { upsertProfile } from "../actions"
import { ImportResumeDialog } from "./ImportResumeDialog"
import { type ResumeData } from "@/lib/agents/resumeDataExtractor"

interface ProfileFormProps {
  initialData?: ResumeData | null
}

type WorkEntry = ResumeData["work_experience"][number]
type EducationEntry = ResumeData["education"][number]
type SkillEntry = ResumeData["skills"][number]
type ProjectEntry = ResumeData["projects"][number]
type LinkEntry = ResumeData["links"][number]

function emptyWork(): WorkEntry {
  return { company: "", title: "", location: "", start_date: "", end_date: "", description: [] }
}

function emptyEducation(): EducationEntry {
  return { institution: "", degree: "", field: "", location: "", start_date: "", end_date: "" }
}

function emptySkill(): SkillEntry {
  return { category: "", items: [] }
}

function emptyProject(): ProjectEntry {
  return { name: "", description: [], technologies: [] }
}

function emptyLink(): LinkEntry {
  return { label: "", url: "" }
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const [importOpen, setImportOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  // Contact fields
  const [name, setName] = useState(initialData?.name ?? "")
  const [email, setEmail] = useState(initialData?.email ?? "")
  const [phone, setPhone] = useState(initialData?.phone ?? "")
  const [location, setLocation] = useState(initialData?.location ?? "")
  const [summary, setSummary] = useState(initialData?.summary ?? "")

  // Dynamic sections
  const [workEntries, setWorkEntries] = useState<WorkEntry[]>(
    initialData?.work_experience?.length ? initialData.work_experience : [emptyWork()]
  )
  const [educationEntries, setEducationEntries] = useState<EducationEntry[]>(
    initialData?.education?.length ? initialData.education : [emptyEducation()]
  )
  const [skillEntries, setSkillEntries] = useState<SkillEntry[]>(
    initialData?.skills?.length ? initialData.skills : [emptySkill()]
  )
  const [projectEntries, setProjectEntries] = useState<ProjectEntry[]>(
    initialData?.projects?.length ? initialData.projects : []
  )
  const [certifications, setCertifications] = useState(
    initialData?.certifications?.join("\n") ?? ""
  )
  const [linkEntries, setLinkEntries] = useState<LinkEntry[]>(
    initialData?.links?.length ? initialData.links : []
  )

  function applyImport(data: ResumeData) {
    setName(data.name ?? "")
    setEmail(data.email ?? "")
    setPhone(data.phone ?? "")
    setLocation(data.location ?? "")
    setSummary(data.summary ?? "")
    setWorkEntries(data.work_experience?.length ? data.work_experience : [emptyWork()])
    setEducationEntries(data.education?.length ? data.education : [emptyEducation()])
    setSkillEntries(data.skills?.length ? data.skills : [emptySkill()])
    setProjectEntries(data.projects ?? [])
    setCertifications(data.certifications?.join("\n") ?? "")
    setLinkEntries(data.links ?? [])
    toast.success("Resume data imported. Review and save your profile.")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const profileData: ResumeData = {
      name,
      email: email || undefined,
      phone: phone || undefined,
      location: location || undefined,
      summary: summary || undefined,
      work_experience: workEntries,
      education: educationEntries,
      skills: skillEntries,
      certifications: certifications
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      projects: projectEntries,
      links: linkEntries,
    }

    const result = await upsertProfile(profileData)
    setSaving(false)

    if (result.success) {
      toast.success("Profile saved successfully.")
    } else {
      toast.error(result.error ?? "Failed to save profile.")
    }
  }

  // Work Experience helpers
  function updateWork<K extends keyof WorkEntry>(i: number, key: K, value: WorkEntry[K]) {
    setWorkEntries((prev) => prev.map((e, idx) => (idx === i ? { ...e, [key]: value } : e)))
  }

  function updateWorkDescriptions(i: number, raw: string) {
    updateWork(i, "description", raw.split("\n").map((s) => s.trimStart()).filter(Boolean))
  }

  // Education helpers
  function updateEducation<K extends keyof EducationEntry>(i: number, key: K, value: EducationEntry[K]) {
    setEducationEntries((prev) => prev.map((e, idx) => (idx === i ? { ...e, [key]: value } : e)))
  }

  // Skill helpers
  function updateSkill<K extends keyof SkillEntry>(i: number, key: K, value: SkillEntry[K]) {
    setSkillEntries((prev) => prev.map((e, idx) => (idx === i ? { ...e, [key]: value } : e)))
  }

  function updateSkillItems(i: number, raw: string) {
    updateSkill(i, "items", raw.split(",").map((s) => s.trim()).filter(Boolean))
  }

  // Project helpers
  function updateProject<K extends keyof ProjectEntry>(i: number, key: K, value: ProjectEntry[K]) {
    setProjectEntries((prev) => prev.map((e, idx) => (idx === i ? { ...e, [key]: value } : e)))
  }

  function updateProjectDescriptions(i: number, raw: string) {
    updateProject(i, "description", raw.split("\n").map((s) => s.trimStart()).filter(Boolean))
  }

  function updateProjectTechnologies(i: number, raw: string) {
    updateProject(i, "technologies", raw.split(",").map((s) => s.trim()).filter(Boolean))
  }

  // Link helpers
  function updateLink<K extends keyof LinkEntry>(i: number, key: K, value: string) {
    setLinkEntries((prev) => prev.map((e, idx) => (idx === i ? { ...e, [key]: value } : e)))
  }

  return (
    <>
      <ImportResumeDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        onImport={applyImport}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">My Profile</h1>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setImportOpen(true)}
            >
              <Upload className="w-4 h-4 mr-2" />
              Import from Resume
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save Profile"}
            </Button>
          </div>
        </div>

        <Accordion
          type="multiple"
          defaultValue={["contact", "experience", "education", "skills", "projects", "certifications"]}
          className="space-y-2"
        >
          {/* Contact */}
          <AccordionItem value="contact" className="border rounded-lg px-4">
            <AccordionTrigger className="text-base font-medium">Contact</AccordionTrigger>
            <AccordionContent className="space-y-4 pb-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jane@example.com"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 555-555-5555"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="San Francisco, CA"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="summary">Summary</Label>
                <Textarea
                  id="summary"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Brief professional summary…"
                  rows={3}
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Work Experience */}
          <AccordionItem value="experience" className="border rounded-lg px-4">
            <AccordionTrigger className="text-base font-medium">Work Experience</AccordionTrigger>
            <AccordionContent className="space-y-4 pb-4">
              {workEntries.map((entry, i) => (
                <div key={i} className="space-y-3">
                  {i > 0 && <Separator />}
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">
                      Position {i + 1}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setWorkEntries((prev) => prev.filter((_, idx) => idx !== i))}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label>Company</Label>
                      <Input
                        value={entry.company}
                        onChange={(e) => updateWork(i, "company", e.target.value)}
                        placeholder="Acme Corp"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Title</Label>
                      <Input
                        value={entry.title}
                        onChange={(e) => updateWork(i, "title", e.target.value)}
                        placeholder="Software Engineer"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Location</Label>
                      <Input
                        value={entry.location ?? ""}
                        onChange={(e) => updateWork(i, "location", e.target.value)}
                        placeholder="New York, NY"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label>Start Date</Label>
                        <Input
                          value={entry.start_date ?? ""}
                          onChange={(e) => updateWork(i, "start_date", e.target.value)}
                          placeholder="Jan 2020"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>End Date</Label>
                        <Input
                          value={entry.end_date ?? ""}
                          onChange={(e) => updateWork(i, "end_date", e.target.value)}
                          placeholder="Present"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label>Bullet Points (one per line)</Label>
                    <Textarea
                      value={entry.description.join("\n")}
                      onChange={(e) => updateWorkDescriptions(i, e.target.value)}
                      placeholder={"• Led migration to microservices\n• Reduced latency by 30%"}
                      rows={4}
                    />
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setWorkEntries((prev) => [...prev, emptyWork()])}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Position
              </Button>
            </AccordionContent>
          </AccordionItem>

          {/* Education */}
          <AccordionItem value="education" className="border rounded-lg px-4">
            <AccordionTrigger className="text-base font-medium">Education</AccordionTrigger>
            <AccordionContent className="space-y-4 pb-4">
              {educationEntries.map((entry, i) => (
                <div key={i} className="space-y-3">
                  {i > 0 && <Separator />}
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">
                      Entry {i + 1}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setEducationEntries((prev) => prev.filter((_, idx) => idx !== i))}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label>Institution</Label>
                      <Input
                        value={entry.institution}
                        onChange={(e) => updateEducation(i, "institution", e.target.value)}
                        placeholder="MIT"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Location</Label>
                      <Input
                        value={entry.location ?? ""}
                        onChange={(e) => updateEducation(i, "location", e.target.value)}
                        placeholder="Cambridge, MA"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Degree</Label>
                      <Input
                        value={entry.degree ?? ""}
                        onChange={(e) => updateEducation(i, "degree", e.target.value)}
                        placeholder="B.S."
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Field of Study</Label>
                      <Input
                        value={entry.field ?? ""}
                        onChange={(e) => updateEducation(i, "field", e.target.value)}
                        placeholder="Computer Science"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Start Date</Label>
                      <Input
                        value={entry.start_date ?? ""}
                        onChange={(e) => updateEducation(i, "start_date", e.target.value)}
                        placeholder="Sep 2016"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>End Date</Label>
                      <Input
                        value={entry.end_date ?? ""}
                        onChange={(e) => updateEducation(i, "end_date", e.target.value)}
                        placeholder="Jun 2020"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEducationEntries((prev) => [...prev, emptyEducation()])}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Education
              </Button>
            </AccordionContent>
          </AccordionItem>

          {/* Skills */}
          <AccordionItem value="skills" className="border rounded-lg px-4">
            <AccordionTrigger className="text-base font-medium">Skills</AccordionTrigger>
            <AccordionContent className="space-y-4 pb-4">
              {skillEntries.map((entry, i) => (
                <div key={i} className="space-y-2">
                  {i > 0 && <Separator />}
                  <div className="flex gap-2 items-start">
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label>Category</Label>
                        <Input
                          value={entry.category}
                          onChange={(e) => updateSkill(i, "category", e.target.value)}
                          placeholder="Languages"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Items (comma-separated)</Label>
                        <Input
                          value={entry.items.join(", ")}
                          onChange={(e) => updateSkillItems(i, e.target.value)}
                          placeholder="Python, TypeScript, Go"
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="mt-6"
                      onClick={() => setSkillEntries((prev) => prev.filter((_, idx) => idx !== i))}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSkillEntries((prev) => [...prev, emptySkill()])}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Category
              </Button>
            </AccordionContent>
          </AccordionItem>

          {/* Projects */}
          <AccordionItem value="projects" className="border rounded-lg px-4">
            <AccordionTrigger className="text-base font-medium">Projects</AccordionTrigger>
            <AccordionContent className="space-y-4 pb-4">
              {projectEntries.length === 0 && (
                <p className="text-sm text-muted-foreground">No projects added yet.</p>
              )}
              {projectEntries.map((entry, i) => (
                <div key={i} className="space-y-3">
                  {i > 0 && <Separator />}
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">
                      Project {i + 1}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setProjectEntries((prev) => prev.filter((_, idx) => idx !== i))}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-1">
                    <Label>Project Name</Label>
                    <Input
                      value={entry.name}
                      onChange={(e) => updateProject(i, "name", e.target.value)}
                      placeholder="My Awesome Project"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Description (one bullet per line)</Label>
                    <Textarea
                      value={entry.description.join("\n")}
                      onChange={(e) => updateProjectDescriptions(i, e.target.value)}
                      placeholder={"• Built real-time dashboard\n• Reduced load time by 50%"}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Technologies (comma-separated)</Label>
                    <Input
                      value={(entry.technologies ?? []).join(", ")}
                      onChange={(e) => updateProjectTechnologies(i, e.target.value)}
                      placeholder="React, Node.js, PostgreSQL"
                    />
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setProjectEntries((prev) => [...prev, emptyProject()])}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Project
              </Button>
            </AccordionContent>
          </AccordionItem>

          {/* Certifications & Links */}
          <AccordionItem value="certifications" className="border rounded-lg px-4">
            <AccordionTrigger className="text-base font-medium">
              Certifications &amp; Links
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pb-4">
              <div className="space-y-1">
                <Label htmlFor="certifications">Certifications (one per line)</Label>
                <Textarea
                  id="certifications"
                  value={certifications}
                  onChange={(e) => setCertifications(e.target.value)}
                  placeholder={"AWS Certified Solutions Architect\nGoogle Cloud Professional"}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Links</Label>
                {linkEntries.length === 0 && (
                  <p className="text-sm text-muted-foreground">No links added yet.</p>
                )}
                {linkEntries.map((entry, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <Input
                      className="w-32 shrink-0"
                      value={entry.label}
                      onChange={(e) => updateLink(i, "label", e.target.value)}
                      placeholder="LinkedIn"
                    />
                    <Input
                      className="flex-1"
                      value={entry.url}
                      onChange={(e) => updateLink(i, "url", e.target.value)}
                      placeholder="https://linkedin.com/in/…"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setLinkEntries((prev) => prev.filter((_, idx) => idx !== i))}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setLinkEntries((prev) => [...prev, emptyLink()])}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Link
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Bottom save */}
        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save Profile"}
          </Button>
        </div>
      </form>
    </>
  )
}
