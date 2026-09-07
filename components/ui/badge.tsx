/**
 * Badge shim — simple badge / pill component
 */

import React from "react";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success";
}

const variantStyles: Record<string, string> = {
  default: "bg-primary text-primary-foreground",
  secondary: "bg-secondary text-secondary-foreground",
  destructive: "bg-destructive text-destructive-foreground",
  outline: "border border-white/20 text-foreground",
  success: "bg-success/20 text-success border border-success/30",
};

export const Badge: React.FC<BadgeProps> = ({
  variant = "default",
  className = "",
  ...props
}) => (
  <div
    className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold transition-colors ${variantStyles[variant] || variantStyles.default} ${className}`}
    {...props}
  />
);
