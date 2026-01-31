"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Sparkles } from "lucide-react";

export default function TestJobSuggestPage() {
  type Job = {
    id: string;
    title: string;
    company?: string;
    location?: string;
    matchScore: number;
    description?: string;
    matchedKeywords: string[];
    url?: string;
  };

  type ResultData = {
    keywords: string[];
    skills: string[];
    jobs: Job[];
  };

  type ResultResponse = {
    message: string;
    data: ResultData;
  };

  const [resumeId, setResumeId] = useState("dc242650-9f12-4a9e-acad-f44d5606cc81");
  const [result, setResult] = useState<ResultResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testSuggest = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("resumeId", resumeId);
      formData.append("limit", "3");

      const response = await fetch("/api/jobs/suggest", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to get job suggestions");
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const getMatchScoreColor = (score: number): string => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-yellow-600";
    return "text-muted-foreground";
  };

  return (
    <div className="container mx-auto p-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <CardTitle>Test AI Job Suggestions</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Resume ID:</label>
            <input
              type="text"
              value={resumeId}
              onChange={(e) => setResumeId(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Enter resume ID"
            />
          </div>

          <Button
            onClick={testSuggest}
            disabled={loading || !resumeId}
            className="w-full bg-primary hover:bg-primary-hover"
          >
            {loading ? "Finding Jobs..." : "Get AI Job Suggestions"}
          </Button>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-red-600 dark:text-red-400 font-medium">Error:</p>
              <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {result && (
            <div className="space-y-6">
              {/* Success Message */}
              <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md">
                <p className="text-green-600 dark:text-green-400 font-medium">✓ {result.message}</p>
              </div>

              {/* Extracted Keywords */}
              <div className="p-4 bg-muted/50 border rounded-md">
                <h3 className="font-semibold mb-2">Extracted Keywords:</h3>
                <div className="flex flex-wrap gap-2">
                  {result.data.keywords.map((keyword: string, i: number) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 rounded-full text-sm"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>

              {/* Extracted Skills */}
              <div className="p-4 bg-muted/50 border rounded-md">
                <h3 className="font-semibold mb-2">Extracted Skills:</h3>
                <div className="flex flex-wrap gap-2">
                  {result.data.skills.map((skill: string, i: number) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Matching Jobs */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Matching Jobs:</h3>
                {result.data.jobs.map((job: Job) => (
                  <Card key={job.id} className="border-2 hover:border-primary transition-colors">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="text-lg font-semibold">{job.title}</h4>
                          <p className="text-sm text-muted-foreground">{job.company} • {job.location}</p>
                        </div>
                        <div className={`text-2xl font-bold ${getMatchScoreColor(job.matchScore)}`}>
                          {job.matchScore}%
                        </div>
                      </div>
                      
                      <p className="text-sm text-foreground/80 mb-3">{job.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        {job.matchedKeywords.map((keyword: string, i: number) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-primary/10 text-primary rounded text-xs"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>

                      <Button
                        onClick={() => window.open(job.url, "_blank")}
                        className="w-full bg-primary hover:bg-primary-hover gap-2"
                      >
                        View Job <ExternalLink className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}