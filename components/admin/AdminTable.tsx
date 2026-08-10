import React from "react";
import { Search, Filter } from "lucide-react";

interface AdminTableProps {
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  searchPlaceholder?: string;
  filterComponent?: React.ReactNode;
  children: React.ReactNode;
  emptyState?: React.ReactNode;
}

export function AdminTable({
  searchQuery,
  onSearchChange,
  searchPlaceholder = "Search records...",
  filterComponent,
  children,
  emptyState,
}: AdminTableProps) {
  return (
    <div className="space-y-4">
      {(onSearchChange || filterComponent) && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-3xl bg-white/90 backdrop-blur-xl border border-purple-100 shadow-sm">
          {onSearchChange && (
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery || ""}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-10 pr-4 py-2 rounded-2xl bg-purple-50/40 border border-purple-200/70 text-purple-950 text-xs focus:outline-none focus:ring-2 focus:ring-purple-400 font-medium"
              />
            </div>
          )}

          {filterComponent && <div className="flex items-center gap-2 w-full sm:w-auto">{filterComponent}</div>}
        </div>
      )}

      <div className="rounded-3xl bg-white/90 backdrop-blur-xl border border-purple-100 shadow-md overflow-hidden">
        <div className="overflow-x-auto">{children}</div>
      </div>
    </div>
  );
}
