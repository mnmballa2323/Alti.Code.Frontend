/**
 * AlertWrapper shim — simple styleable alert component
 */

import React from "react";

interface AlertWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "danger" | "warning" | "success" | "info";
  children: React.ReactNode;
}

const variantStyles: Record<string, string> = {
  danger: "bg-danger/10 border-danger/30 text-danger",
  warning: "bg-warning/10 border-warning/30 text-warning",
  success: "bg-success/10 border-success/30 text-success",
  info: "bg-primary/10 border-primary/30 text-primary",
};

export const AlertWrapper: React.FC<AlertWrapperProps> = ({
  variant = "info",
  className = "",
  children,
  ...props
}) => (
  <div
    className={`rounded-lg border p-4 ${variantStyles[variant] || variantStyles.info} ${className}`}
    role="alert"
    {...props}
  >
    {children}
  </div>
);
