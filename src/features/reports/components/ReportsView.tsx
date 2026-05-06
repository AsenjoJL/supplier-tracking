import { useState } from "react";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useReports } from "@/features/reports/hooks/useReports";
import { ReportSummaryCards } from "./ReportSummaryCards";
import { HarvestReportTab } from "./tabs/HarvestReportTab";
import { InventoryReportTab } from "./tabs/InventoryReportTab";
import { RestockReportTab } from "./tabs/RestockReportTab";
import { TarhaReportTab } from "./tabs/TarhaReportTab";

export function ReportsView() {
  const reports = useReports();
  const [tab, setTab] = useState("inventory");

  if (reports.isLoading) return <LoadingSpinner />;

  return (
    <PageWrapper title="Reports" description="Inventory, Tarha, harvest, and restock reports.">
      <ReportSummaryCards {...reports.summary} />
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
