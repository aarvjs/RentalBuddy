import React from "react";
import { LucideIcon } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onActionClick?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onActionClick,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-3xl bg-white/70 backdrop-blur-md border border-pink-100 shadow-sm my-4">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-pink-100 via-rose-100 to-purple-100 flex items-center justify-center text-pink-500 mb-4 shadow-sm">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-purple-950 mb-1">{title}</h3>
      <p className="text-sm text-purple-900/60 max-w-md mb-6">{description}</p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold text-sm shadow-md shadow-pink-500/20 hover:opacity-95 transition-all"
        >
          {actionLabel}
        </Link>
      )}
      {actionLabel && !actionHref && onActionClick && (
        <button
          onClick={onActionClick}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold text-sm shadow-md shadow-pink-500/20 hover:opacity-95 transition-all"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
