"use client";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import { Review } from "@/data/dataService";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface SourceDistributionChartProps {
  reviews: Review[];
}

export const SourceDistributionChart: React.FC<SourceDistributionChartProps> = ({ reviews }) => {
  const chartData = useMemo(() => {
    const sourceCounts: { [key: string]: number } = {};
    
    reviews.forEach(review => {
      sourceCounts[review.source] = (sourceCounts[review.source] || 0) + 1;
    });
    
    const sources = Object.keys(sourceCounts);
    const counts = Object.values(sourceCounts);
    
    return { sources, counts };
  }, [reviews]);

  const options: ApexOptions = {
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "donut",
      height: 350,
    },
    colors: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"],
    labels: chartData.sources,
    legend: {
      show: true,
      position: "bottom",
      fontFamily: "Outfit",
    },
    plotOptions: {
      pie: {
        donut: {
          size: "65%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total Reviews",
              fontSize: "16px",
              fontWeight: "600",
              formatter: () => reviews.length.toString(),
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${val.toFixed(1)}%`,
    },
    tooltip: {
      y: {
        formatter: (val: number) => `${val} reviews`,
      },
    },
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Review Sources
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Distribution of reviews by source channel
        </p>
      </div>
      <ReactApexChart
        options={options}
        series={chartData.counts}
        type="donut"
        height={350}
      />
    </div>
  );
};
