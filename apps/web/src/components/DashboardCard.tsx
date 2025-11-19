import React from "react";

export default function DashboardCard({
  title,
  value,
  subtitle,
  tone = "bg-white",
  className = "",
  children,
  icon,
  accent = "#6366f1",
}: {
  title: React.ReactNode;
  value: React.ReactNode;
  subtitle?: React.ReactNode;
  tone?: string;
  className?: string;
  children?: React.ReactNode;
  icon?: React.ReactNode;
  accent?: string;
}) {
  return (
    <div className={`p-4 ${tone} border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow ${className}`}>      
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            {icon && <div style={{ color: accent }} className="w-5 h-5">{icon}</div>}
            <div className="text-sm text-slate-500">{title}</div>
          </div>
          <div className="text-2xl font-semibold mt-1">{value}</div>
          {subtitle && <div className="text-xs text-slate-400 mt-1">{subtitle}</div>}
        </div>
        {children && <div className="shrink-0">{children}</div>}
      </div>
    </div>
  );
}
