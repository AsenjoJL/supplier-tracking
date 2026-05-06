import type { LucideIcon } from "lucide-react";
import { Sprout } from "lucide-react";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: LucideIcon;
  className?: string;
};

export function EmptyState({ title, description, icon: Icon = Sprout, className }: EmptyStateProps) {
  return (
    <div className={cn("flex min-h-44 flex-col items-center justify-center rounded-lg border border-dashed bg-muted/25 p-8 text-center", className)}>
      <Icon className="mb-3 h-8 w-8 text-muted-foreground" />
      <p className="font-medium">{title}</p>
      {description ? <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p> : null}
    </div>
  );
}
