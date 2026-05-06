import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type LoadingSpinnerProps = {
  label?: string;
  className?: string;
};

export function LoadingSpinner({ label = "Loading", className }: LoadingSpinnerProps) {
  return (
    <div className={cn("flex min-h-44 items-center justify-center gap-3 text-sm text-muted-foreground", className)}>
      <Loader2 className="h-4 w-4 animate-spin" />
      {label}
    </div>
  );
}
