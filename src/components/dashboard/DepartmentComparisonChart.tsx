"use client";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import { Review, Department } from "@/data/dataService";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface DepartmentComparisonChartProps {
  reviews: Review[];
  departments: Department[];
}

export const DepartmentComparisonChart: React.FC<DepartmentComparisonChartProps> = ({ 
  reviews, 
  departments 
}) => {
  const chartData = useMemo(() => {
    const deptData: { [key: string]: { sum: number; count: number; name: string } } = {};
    
    departments.forEach(dept => {
      deptData[dept.id] = { sum: 0, count: 0, name: dept.name };
    });
    
    reviews.forEach(review => {
      if (deptData[review.department_id]) {
        deptData[review.department_id].sum += review.rating;
        deptData[review.department_id].count += 1;
      }
    });
    
    const names: string[] = [];
    const avgRatings: number[] = [];
    const counts: number[] = [];
    
    Object.values(deptData).forEach(dept => {
      if (dept.count > 0) {
        names.push(dept.name);
        avgRatings.push(Number((dept.sum / dept.count).toFixed(2)));
        counts.push(dept.count);
      }
    });
    
    return { names, avgRatings, counts };
  }, [reviews, departments]);

  const options: ApexOptions = {
    colors: ["#6366F1", "#8B5CF6"],
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
        horizontal: false,
        columnWidth: "55%",
        borderRadius: 8,
        borderRadiusApplication: "end",
        dataLabels: {
          position: "top",
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => val.toFixed(2),
      offsetY: -20,
      style: {
        fontSize: "12px",
        colors: ["#304758"],
      },
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    xaxis: {
      categories: chartData.names,
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
          text: "Total Reviews",
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
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: (val: number) => val.toString(),
      },
    },
  };

  const series = [
    {
      name: "Average Rating",
      data: chartData.avgRatings,
    },
    {
      name: "Total Reviews",
      data: chartData.counts,
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Department Performance Comparison
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Average rating and review count by department
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
