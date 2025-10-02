import { useMemo } from "react";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, ChartTooltip, Legend);

interface StatsCardProps {
  score?: number; // 0-100
  interviews?: number;
  applications?: number;
}

export default function StatsCard({
  score = 80,
  interviews = 3,
  applications = 78,
}: StatsCardProps) {
  const chartData = useMemo(() => {
    const value = Math.max(0, Math.min(100, score));
    return {
      labels: ["Score", "Remaining"],
      datasets: [
        {
          data: [value, 100 - value],
          backgroundColor: ["#161D96", "#CED0F8"],
          borderWidth: 0,
          hoverOffset: 0,
        },
      ],
    };
  }, [score]);

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      cutout: "70%",
      rotation: -90 * (Math.PI / 180),
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false },
      },
    }),
    []
  );

  return (
    <div className="w-full max-w-[497px] h-[169px] bg-white rounded-[10px] shadow-[0_0_2px_0_rgba(23,26,31,0.12),0_8px_17px_0_rgba(23,26,31,0.15)] flex items-center px-4 py-6">
      <div className="flex flex-col items-center min-w-[96px]">
        <div className="relative w-24 h-24 mb-2">
          <Doughnut data={chartData} options={options} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-normal text-text-dark">{score}%</span>
          </div>
        </div>
        <span className="text-sm font-normal text-text-dark text-center">
          Resume Score
        </span>
      </div>

      <div className="w-px h-20 bg-divider-blue mx-6"></div>

      <div className="flex flex-col items-center min-w-[120px]">
        <span className="text-5xl font-medium text-text-dark mb-1">
          {interviews}
        </span>
        <span className="text-sm font-normal text-text-dark text-center">
          Interviews Completed
        </span>
      </div>

      <div className="w-px h-20 bg-divider-blue mx-6"></div>

      <div className="flex flex-col items-center min-w-[120px]">
        <span className="text-5xl font-medium text-text-dark mb-1">
          {applications}
        </span>
        <span className="text-sm font-normal text-text-dark text-center">
          Total Applications
        </span>
      </div>
    </div>
  );
}
