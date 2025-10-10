"use client";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import { Review } from "@/data/dataService";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface RatingTrendChartProps {
  reviews: Review[];
}

export const RatingTrendChart: React.FC<RatingTrendChartProps> = ({ reviews }) => {
  const chartData = useMemo(() => {
    // Group reviews by month and calculate average rating
    const monthlyData: { [key: string]: { total: number; sum: number; count: number } } = {};
    
    reviews.forEach(review => {
      const date = new Date(review.review_ts);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { total: 0, sum: 0, count: 0 };
      }
      
      monthlyData[monthKey].sum += review.rating;
      monthlyData[monthKey].count += 1;
      monthlyData[monthKey].total += 1;
    });
    
    // Get last 12 months
    const now = new Date();
    const months = [];
    const avgRatings = [];
    const reviewCounts = [];
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      
      months.push(monthName);
      
      if (monthlyData[monthKey]) {
        avgRatings.push(Number((monthlyData[monthKey].sum / monthlyData[monthKey].count).toFixed(2)));
        reviewCounts.push(monthlyData[monthKey].total);
      } else {
        avgRatings.push(0);
        reviewCounts.push(0);
      }
    }
    
    return { months, avgRatings, reviewCounts };
  }, [reviews]);

  const options: ApexOptions = {
    colors: ["#10B981", "#3B82F6"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "area",
      height: 350,
      toolbar: {
        show: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    xaxis: {
      categories: chartData.months,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: [
      {
        title: {
          text: "Average Rating",
        },
        min: 0,
        max: 5,
      },
      {
        opposite: true,
        title: {
          text: "Review Count",
        },
      },
    ],
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Outfit",
    },
    grid: {
      strokeDashArray: 5,
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.1,
      },
    },
    tooltip: {
      x: {
        show: true,
      },
    },
  };

  const series = [
    {
      name: "Average Rating",
      data: chartData.avgRatings,
    },
    {
      name: "Review Count",
      data: chartData.reviewCounts,
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Rating Trend (Last 12 Months)
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Monthly average rating and review volume
        </p>
      </div>
      <ReactApexChart
        options={options}
        series={series}
        type="area"
        height={350}
      />
    </div>
  );
};
