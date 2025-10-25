import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResumeIssueCardProps {
  title: string;
  subtitle?: string;
  stripColor?: "red" | "green";
  showSuggestedFix?: boolean;
  suggestedFix?: React.ReactNode | string;
  className?: string;
}

export default function ResumeIssueCard({
  title,
  subtitle,
  stripColor = "red",
  showSuggestedFix = false,
  suggestedFix,
  className,
}: ResumeIssueCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const stripColorClass = {
    red: "bg-[#d6631b]",
    green: "bg-[#1dd75b]",
  }[stripColor];

  return (
    <div
      className={cn(
        "relative bg-white border border-[#e3e8ef] rounded-[10px] overflow-hidden",
        className
      )}
    >
      {/* Colored left strip */}
      <div
        className={cn(
          "absolute left-0 top-0 bottom-0 w-[19px]",
          stripColorClass
        )}
      />

      {/* Content area */}
      <div className="pl-[37px] pr-12 py-3">
        <div>
          <h4 className="text-sm font-bold text-[#171a1f] mb-0.5">{title}</h4>
          {subtitle && (
            <p className="text-sm italic text-[#565d6d] m-0">{subtitle}</p>
          )}
        </div>

        {/* Suggested Fix Section (conditionally rendered) */}
        {showSuggestedFix && suggestedFix && isExpanded && (
          <div className="mt-4 pt-4 border-t border-[#e3e8ef]">
            <h5 className="text-sm font-semibold text-[#171a1f] mb-2">
              Suggested Fix:
            </h5>
            <div className="text-sm text-[#565d6d]">
              {typeof suggestedFix === "string" ? (
                <p className="m-0">{suggestedFix}</p>
              ) : (
                suggestedFix
              )}
            </div>
          </div>
        )}
      </div>

      {/* Expand/Collapse button (only shown if showSuggestedFix is true) */}
      {showSuggestedFix && suggestedFix && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded transition-colors"
          aria-label={isExpanded ? "Collapse" : "Expand"}
        >
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-[#565d6d]" />
          ) : (
            <ChevronDown className="w-5 h-5 text-[#565d6d]" />
          )}
        </button>
      )}
    </div>
  );
}
