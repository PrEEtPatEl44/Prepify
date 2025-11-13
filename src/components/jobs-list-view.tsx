"use client";

import * as React from "react";
import { Building2, ExternalLink, Sparkle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Job } from "@/types/jobs";
import { Card } from "@/components/ui/card";

interface JobsListViewProps {
  data: Job[];
  onStartInterview?: (job: Job) => void;
  searchFilter?: string;
  onSearchChange?: (value: string) => void;
}

export function JobsListView({
  data,
  onStartInterview,
  searchFilter = "",
}: JobsListViewProps) {
  const [localSearch, setLocalSearch] = React.useState(searchFilter);

  React.useEffect(() => {
    setLocalSearch(searchFilter);
  }, [searchFilter]);

  const filteredJobs = React.useMemo(() => {
    if (!localSearch) return data;

    const searchLower = localSearch.toLowerCase();
    return data.filter(
      (job) =>
        job.companyName.toLowerCase().includes(searchLower) ||
        job.title.toLowerCase().includes(searchLower)
    );
  }, [data, localSearch]);

  return (
    <div className="w-full space-y-6">
      {/* Jobs List */}
      <div className="space-y-4">
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <Card
              key={job.id}
              className="p-4 hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-[#636AE8]/30 bg-white"
            >
              <div className="flex items-center justify-between gap-4">
                {/* Left Section - Company & Job Info */}
                <div className="flex items-center gap-3 flex-1">
                  <Avatar className="h-10 w-10 rounded-lg">
                    <AvatarImage
                      src={job.companyIconUrl}
                      alt={job.companyName}
                      className="object-cover"
                    />
                    <AvatarFallback className="rounded-lg bg-gradient-to-br from-[#636AE8] to-[#4B4FD6] text-white">
                      <Building2 className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {job.title}
                    </h3>
                    <p className="text-sm text-gray-600 font-medium">
                      {job.companyName}
                    </p>
                  </div>
                </div>

                {/* Right Section - Actions */}
                <div className="flex flex-1 gap-2 justify-end items-center">
                  <Button
                    size="default"
                    className="bg-gradient-to-r from-[#636AE8] to-[#4B4FD6] hover:from-[#4B4FD6] hover:to-[#3B3FC6] text-white shadow-md hover:shadow-lg transition-all"
                    onClick={() => {
                      if (onStartInterview) {
                        onStartInterview(job);
                      }
                    }}
                  >
                    <Sparkle className="mr-2 h-4 w-4" />
                    Start Interview
                  </Button>
                  <Button
                    size="default"
                    variant="outline"
                    className="border-gray-300 hover:bg-gray-50"
                    onClick={() => window.open(job.applicationLink, "_blank")}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Posting
                  </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4 bg-white rounded-lg border border-gray-200">
            <div className="bg-gray-100 rounded-full p-6 mb-4">
              <Building2 className="w-16 h-16 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {localSearch
                ? "No matching jobs found"
                : "No job applications yet"}
            </h3>
            <p className="text-gray-500 text-center max-w-md">
              {localSearch
                ? "Try adjusting your search terms to find what you're looking for."
                : "Start adding job applications to track your progress and prepare for interviews."}
            </p>
          </div>
        )}
      </div>

      {/* Footer Stats */}
      {filteredJobs.length > 0 && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Showing <span className="font-semibold">{filteredJobs.length}</span>{" "}
            {filteredJobs.length === 1 ? "application" : "applications"}
            {localSearch && data.length !== filteredJobs.length && (
              <span className="text-gray-500">
                {" "}
                (filtered from {data.length} total)
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
