// Note: This must be a client component to support tooltips, since props
// passed from server to client components must be serializable. The tooltip
// callback functions cannot be serialized, so they can only be passed in
// client components.
import { useEffect, useState } from "react";
import type { Props } from "react-activity-calendar";
import { ActivityCalendar } from "react-activity-calendar";

// Function to generate a full year of calendar data
function generateFullYearData(
  year: number = new Date().getFullYear(),
  activityData: Array<{ date: string; count: number; level: number }> = []
) {
  const fullYearData: Array<{ date: string; count: number; level: number }> =
    [];
  const startDate = new Date(year, 0, 1); // January 1st
  const endDate = new Date(year, 11, 31); // December 31st

  // Create a map of existing activity data for quick lookup
  const activityMap = new Map<
    string,
    { date: string; count: number; level: number }
  >();
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

// Map a raw count to a level 0-4 for the calendar shading
function countToLevel(count: number) {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 2;
  if (count <= 7) return 3;
  return 4;
}

// Alternative: reusable creator for props given activity data
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
  } as Props;
}

export default function Calendar() {
  const [activityData, setActivityData] = useState<
    Array<{ date: string; count: number; level: number }>
  >([]);
  const year = new Date().getFullYear();

  useEffect(() => {
    let mounted = true;

    async function fetchCalendar() {
      try {
        const res = await fetch("/api/dashboard/calendar", {
          credentials: "same-origin",
        });
        if (!res.ok) return;
        const json = await res.json();
        if (!mounted) return;
        if (json?.success && Array.isArray(json.data?.calendar)) {
          const data = json.data.calendar.map(
            (item: { date: string; count: number }) => ({
              date: item.date,
              count: Number(item.count || 0),
              level: countToLevel(Number(item.count || 0)),
            })
          );
          setActivityData(data);
          console.log("Fetched calendar data:", data);
        }
      } catch (err) {
        console.error("Failed to fetch calendar data", err);
      }
    }

    fetchCalendar();
    return () => {
      mounted = false;
    };
  }, []);

  const props = createCalendarWithFullYear(activityData, year);

  return <ActivityCalendar {...props} />;
}
