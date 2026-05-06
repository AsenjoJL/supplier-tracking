import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type MetricCardProps = {
  label: string;
  value: string | number;
  subtext?: string;
  icon: LucideIcon;
  tone?: "green" | "amber" | "blue" | "red";
};

const tones = {
  green: "bg-leaf-50 text-leaf-700",
  amber: "bg-amber-50 text-amber-700",
  blue: "bg-sky-50 text-sky-700",
  red: "bg-red-50 text-red-700",
};

export function MetricCard({ label, value, subtext, icon: Icon, tone = "green" }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-semibold">{value}</p>
          {subtext ? <p className="mt-1 text-sm text-muted-foreground">{subtext}</p> : null}
        </div>
        <div className={cn("rounded-md p-2.5", tones[tone])}>
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}
