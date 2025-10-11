"use client";

import React from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <div className="p-6 mx-auto max-w-[1920px]">
        {children}
      </div>
    </div>
  );
}
