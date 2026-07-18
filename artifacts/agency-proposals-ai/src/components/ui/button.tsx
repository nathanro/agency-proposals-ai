import * as React from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = 'default' | 'outline' | 'ghost' | 'destructive' | 'secondary' | 'link';
export type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  default: "bg-indigo-600 text-white hover:bg-indigo-700",
  outline: "border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950",
  ghost: "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300",
  destructive: "bg-red-600 text-white hover:bg-red-700",
  secondary: "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700",
  link: "text-indigo-600 underline-offset-4 hover:underline p-0 h-auto",
};

const sizeStyles: Record<ButtonSize, string> = {
  default: "px-4 py-2 h-10 text-sm",
  sm: "px-3 py-1.5 h-9 text-sm",
  lg: "px-8 py-4 h-12 text-base",
  icon: "h-10 w-10 p-0",
};

/** shadcn-compatible helper used by alert-dialog, calendar, pagination, etc. */
export function buttonVariants({
  variant = 'default',
  size = 'default',
  className = '',
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  const base =
    "inline-flex items-center justify-center rounded-lg font-medium transition-colors " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 " +
    "disabled:pointer-events-none disabled:opacity-50";
  return cn(base, variantStyles[variant], sizeStyles[size], className);
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', asChild: _asChild, ...props }, ref) => (
    <button
      className={buttonVariants({ variant, size, className })}
      ref={ref}
      {...props}
    />
  )
);

Button.displayName = "Button";

export { Button };
