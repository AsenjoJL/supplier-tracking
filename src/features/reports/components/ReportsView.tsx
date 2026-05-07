import { useState } from "react";
import { CalendarDays } from "lucide-react";
import { endOfMonth, format, startOfMonth } from "date-fns";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useReports } from "@/features/reports/hooks/useReports";
import { ReportAnalytics } from "./ReportAnalytics";
import { ReportDateRangeFilter } from "./ReportDateRangeFilter";
import { ReportSummaryCards } from "./ReportSummaryCards";
import { HarvestReportTab } from "./tabs/HarvestReportTab";
import { InventoryReportTab } from "./tabs/InventoryReportTab";
import { RestockReportTab } from "./tabs/RestockReportTab";
import { TarhaReportTab } from "./tabs/TarhaReportTab";

export function ReportsView() {
  const [from, setFrom] = useState(() => format(startOfMonth(new Date()), "yyyy-MM-dd"));
  const [to, setTo] = useState(() => format(endOfMonth(new Date()), "yyyy-MM-dd"));
  const reports = useReports({ from, to });
  const [tab, setTab] = useState("inventory");

  if (reports.isLoading) return <LoadingSpinner />;

  return (
    <PageWrapper
      title="Analytics & Reports"
      description="Overview of your farm inventory, stock movement, quality losses, and crop performance."
      action={
        <div className="grid gap-3 rounded-md border bg-card p-3 text-sm shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            <span>{reports.analytics.periodLabel}</span>
          </div>
          <ReportDateRangeFilter from={from} to={to} onFromChange={setFrom} onToChange={setTo} />
        </div>
      }
    >
      <ReportSummaryCards {...reports.summary} />
      <ReportAnalytics analytics={reports.analytics} />
      <Tabs value={tab} onValueChange={setTab} className="space-y-4">
        <TabsList className="grid h-auto w-full grid-cols-2 gap-1 sm:grid-cols-4">
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="tarha">Tarha</TabsTrigger>
          <TabsTrigger value="harvest">Harvest</TabsTrigger>
          <TabsTrigger value="restock">Restock</TabsTrigger>
        </TabsList>
        <TabsContent value="inventory"><InventoryReportTab rows={reports.stockRows} /></TabsContent>
        <TabsContent value="tarha"><TarhaReportTab rows={reports.tarhaRows} /></TabsContent>
        <TabsContent value="harvest"><HarvestReportTab rows={reports.harvestRows} /></TabsContent>
        <TabsContent value="restock"><RestockReportTab rows={reports.lowItems} /></TabsContent>
      </Tabs>
    </PageWrapper>
  );
}
