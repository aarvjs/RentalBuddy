import React from "react";
import { LucideIcon } from "lucide-react";

interface AdminStatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: string;
  subtitle?: string;
}

export function AdminStatCard({
  title,
  value,
  icon: Icon,
  color = "from-purple-600 to-pink-600",
  subtitle,
}: AdminStatCardProps) {
  return (
    <div className="p-5 rounded-3xl bg-white/80 backdrop-blur-xl border border-purple-100/80 shadow-md shadow-purple-500/5 hover:border-purple-200 transition-all group">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-purple-950/70">{title}</span>
        <div
          className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${color} text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="text-xl sm:text-2xl font-extrabold text-purple-950 flex items-center gap-2">
        {value}
      </div>
      {subtitle && <p className="text-[11px] text-purple-900/50 mt-1 font-medium">{subtitle}</p>}
    </div>
  );
}
