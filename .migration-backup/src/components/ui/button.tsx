import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'lg';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
    
    const variants = {
      default: "bg-indigo-600 text-white hover:bg-indigo-700",
      outline: "border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50",
      ghost: "hover:bg-gray-100 text-gray-700",
      destructive: "bg-red-600 text-white hover:bg-red-700",
    };

    const sizes = {
      default: "px-4 py-2",
      sm: "px-3 py-1.5 text-sm",
      lg: "px-8 py-4 text-lg",
    };

    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };