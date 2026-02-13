"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CloudUpload, BookOpen, ChevronRight } from "lucide-react";
import Calender from "@/components/github-activity-calender";
import StatsCard from "@/components/stats-card";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";

export default function Home() {
  const router = useRouter();
  const { profile, loading } = useUser();

  const [counts, setCounts] = useState<{
    jobs_count: number;
  } | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchCounts() {
      try {
        const res = await fetch("/api/dashboard", {
          credentials: "same-origin",
        });
        if (!res.ok) return;
        const json = await res.json();
        if (mounted && json?.success && json.data) {
          setCounts({
            jobs_count: Number(json.data.jobs_count ?? 0),
          });
        }
      } catch (err) {
        // ignore — keep defaults
        console.error("Failed to fetch dashboard counts", err);
      }
    }

    fetchCounts();
    return () => {
      mounted = false;
    };
  }, []);

  const actionButtons = [
    {
      icon: <CloudUpload size={40} />,
      title: "Upload Your Resume",
      url: "/docs",
      action: "upload-resume",
    },
    {
      icon: <BookOpen size={40} />,
      title: "Get ATS Score",
      url: "/docs",
    },
  ];

  const handleCardClick = (button: (typeof actionButtons)[0]) => {
    if (button.action === "upload-resume") {
      // Set session storage flag to show modal
      sessionStorage.setItem("showUploadModal", "true");
    }
    // Navigate to the URL
    router.push(button.url);
  };
  return (
    <div className="flex flex-col gap-8 mt-10 p-6 w-full">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold">
          Welcome, {loading ? "..." : profile?.name || "Guest"}
        </h1>
        <p className="text-muted-foreground">
          Get started with your job application journey
        </p>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-5xl">
        {actionButtons.map((button) => (
          <Card
            key={button.title}
            className="shadow-lg transition-all duration-300 py-4 !border-none hover:shadow-xl hover:translate-y-[-2px] cursor-pointer"
            onClick={() => handleCardClick(button)}
          >
            <CardContent className="flex justify-between items-center p-4 group">
              <div className="bg-primary/10 text-primary p-4 rounded-md transition-all duration-300 dark:bg-primary/20 dark:text-primary-foreground">
                {button.icon}
              </div>
              <span className="w-full text-center sm:text-left font-semibold text-base sm:text-lg lg:text-xl transition-colors duration-300 px-2 group-hover:text-primary">
                {button.title}
              </span>
              <ChevronRight
                size={40}
                className="text-primary transition-transform duration-300 group-hover:translate-x-1"
              />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Activity Grid (GitHub-like) */}
      <div>
        <h2 className="text-xl font-bold mb-3">
          Applications Created
        </h2>
        <div className="shadow-xl bg-card max-w-fit rounded-md pt-3 px-6">
          <Calender />
        </div>
      </div>

      {/* Progress Overview */}

      <div className="max-w-lg">
        <h2 className="text-xl font-bold mb-3">Progress Overview</h2>
        <StatsCard
          applications={counts?.jobs_count ?? 78}
        />
      </div>

      {/* Upcoming Mock Interview */}
      {/* <Card className="bg-indigo-50 border-indigo-200">
        <CardContent className="flex items-center gap-3 p-4">
          <Image
            src="/icons/calendar.svg"
            alt="Calendar"
            width={24}
            height={24}
          />
          <p className="text-sm font-medium">
            You have a mock interview scheduled tomorrow at 10 AM
          </p>
        </CardContent>
      </Card> */}
    </div>
  );
}
