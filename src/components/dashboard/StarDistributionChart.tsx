"use client";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import { MetricsSummary } from "@/data/dataService";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface StarDistributionChartProps {
  metrics: MetricsSummary;
}

export const StarDistributionChart: React.FC<StarDistributionChartProps> = ({ metrics }) => {
  const chartData = useMemo(() => {
    return {
      categories: ["5 Star", "4 Star", "3 Star", "2 Star", "1 Star"],
      data: [metrics.star_5, metrics.star_4, metrics.star_3, metrics.star_2, metrics.star_1],
      percentages: [
        ((metrics.star_5 / metrics.total) * 100).toFixed(1),
        ((metrics.star_4 / metrics.total) * 100).toFixed(1),
        ((metrics.star_3 / metrics.total) * 100).toFixed(1),
        ((metrics.star_2 / metrics.total) * 100).toFixed(1),
        ((metrics.star_1 / metrics.total) * 100).toFixed(1),
      ],
    };
  }, [metrics]);

  const options: ApexOptions = {
    colors: ["#10B981", "#3B82F6", "#F59E0B", "#F97316", "#EF4444"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 350,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 8,
        borderRadiusApplication: "end",
        dataLabels: {
          position: "top",
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number, opts: any) => {
        return `${val} (${chartData.percentages[opts.dataPointIndex]}%)`;
      },
      offsetX: 0,
      style: {
        fontSize: "12px",
        colors: ["#fff"],
      },
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    xaxis: {
      categories: chartData.categories,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      title: {
        text: undefined,
      },
    },
    grid: {
      strokeDashArray: 5,
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: (val: number) => `${val} reviews`,
      },
    },
  };

  const series = [
    {
      name: "Reviews",
      data: chartData.data,
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Star Rating Distribution
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Breakdown of reviews by star rating
        </p>
      </div>
      <ReactApexChart
        options={options}
        series={series}
        type="bar"
        height={350}
      />
    </div>
  );
};
