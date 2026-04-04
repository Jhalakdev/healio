import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400",
        secondary: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300",
        success: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
        warning: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
        destructive: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
        outline: "border border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-400",
        online: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
        offline: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
