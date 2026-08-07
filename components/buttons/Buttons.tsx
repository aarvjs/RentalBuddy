"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface ButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  icon?: boolean;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

export function Button({
  children,
  href,
  onClick,
  variant = "primary",
  size = "md",
  className = "",
  icon = false,
  type = "button",
  disabled = false,
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-semibold rounded-full transition-all duration-300 transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none";

  const sizeStyles = {
    sm: "px-5 py-2 text-sm gap-1.5",
    md: "px-7 py-3 text-base gap-2",
    lg: "px-9 py-4 text-lg gap-2.5 shadow-lg",
  };

  const variantStyles = {
    primary:
      "bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white shadow-pink-500/25 hover:shadow-pink-500/40 hover:-translate-y-0.5 hover:brightness-110",
    secondary:
      "bg-white/90 text-purple-950 backdrop-blur-md border border-pink-200/60 shadow-purple-500/5 hover:bg-white hover:border-pink-300 hover:shadow-pink-500/15 hover:-translate-y-0.5",
    outline:
      "bg-transparent text-purple-900 border-2 border-pink-300/80 hover:bg-pink-50/50 hover:border-pink-400 hover:text-pink-600",
    ghost:
      "bg-transparent text-purple-900 hover:bg-pink-100/50 hover:text-pink-600",
  };

  const content = (
    <>
      {children}
      {icon && <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={cn(baseStyles, sizeStyles[size], variantStyles[variant], "group", className)}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(baseStyles, sizeStyles[size], variantStyles[variant], "group", className)}
    >
      {content}
    </button>
  );
}

export function GradientBadge({ text }: { text: string }) {
  return (
    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-rose-500/10 border border-pink-200/60 backdrop-blur-md shadow-sm">
      <Sparkles className="w-4 h-4 text-pink-500 animate-pulse" />
      <span className="text-xs sm:text-sm font-semibold tracking-wide bg-gradient-to-r from-pink-600 to-purple-700 bg-clip-text text-transparent">
        {text}
      </span>
    </div>
  );
}
