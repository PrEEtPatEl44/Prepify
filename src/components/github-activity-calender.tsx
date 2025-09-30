// Note: This must be a client component to support tooltips, since props
// passed from server to client components must be serializable. The tooltip
// callback functions cannot be serialized, so they can only be passed in
// client components.
"use client";
import type { Props } from "react-activity-calendar";
import { ActivityCalendar } from "react-activity-calendar";

// Function to generate a full year of calendar data
function generateFullYearData(
  year: number = 2025,
  activityData: Array<{ date: string; count: number; level: number }> = []
) {
  const fullYearData = [];
  const startDate = new Date(year, 0, 1); // January 1st
  const endDate = new Date(year, 11, 31); // December 31st

  // Create a map of existing activity data for quick lookup
  const activityMap = new Map();
  activityData.forEach((item) => {
    activityMap.set(item.date, item);
  });

  // Generate data for every day of the year
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const dateString = currentDate.toISOString().split("T")[0];

    // Use existing activity data if available, otherwise create empty entry
    const existingData = activityMap.get(dateString);
    if (existingData) {
      fullYearData.push(existingData);
    } else {
      fullYearData.push({
        date: dateString,
        count: 0,
        level: 0,
      });
    }

    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return fullYearData;
}

// Your actual activity data (can be empty for new users)
const userActivityData = [
  {
    date: "2025-04-04",
    count: 2,
    level: 1,
  },
  {
    date: "2025-07-01",
    count: 16,
    level: 4,
  },
  {
    date: "2025-08-01",
    count: 16,
    level: 3,
  },
];

// Generate full year data including empty days
export const calendarData = generateFullYearData(2025, userActivityData);

export const calendarProps: Props = {
  data: calendarData,
  theme: {
    light: ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"],
    // Force same colors for dark mode
  },
  colorScheme: "light", // Explicitly force light theme
  showWeekdayLabels: false,
  hideTotalCount: true,
  blockSize: 15,
  blockMargin: 5,
  fontSize: 14,
  labels: {
    legend: {
      less: "Less",
      more: "More",
    },
  },
};

export default function Calendar() {
  return <ActivityCalendar {...calendarProps} />;
}

// Alternative: If you want to make it more reusable
export function createCalendarWithFullYear(
  activityData: Array<{ date: string; count: number; level: number }> = [],
  year: number = new Date().getFullYear()
) {
  const fullYearData = generateFullYearData(year, activityData);

  return {
    data: fullYearData,
    theme: {
      light: ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"],
    },
    colorScheme: "light" as const,
    showWeekdayLabels: false,
    hideTotalCount: true,
    blockSize: 15,
    blockMargin: 5,
    fontSize: 14,
    labels: {
      legend: {
        less: "Less",
        more: "More",
      },
    },
  };
}
