import type { ReactNode } from "react";
import { ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { StatusBadge } from "@/components/common/StatusBadge";
import type { SupplierStockInRecord, SupplierStockOutRecord } from "@/features/suppliers/hooks/useSupplierDetail";
import { STOCK_OUT_PURPOSE_LABELS, TARHA_REASON_LABELS } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";

type SupplierProfileActivityProps = {
  stockInRecords: SupplierStockInRecord[];
  stockOutRecords: SupplierStockOutRecord[];
};

export function SupplierProfileActivity({ stockInRecords, stockOutRecords }: SupplierProfileActivityProps) {
  return (
    <section className="space-y-3">
      <div>
        <h3 className="font-serif text-xl">Stock Activity</h3>
        <p className="text-sm text-muted-foreground">Recent stock-in and stock-out records connected to this supplier.</p>
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        <ActivityPanel
          title="Stock-In"
          icon={<ArrowDownToLine className="h-4 w-4" />}
          emptyMessage="No stock-in records yet."
        >
          {stockInRecords.slice(0, 6).map((record) => (
            <div key={record.id} className="rounded-md border bg-card p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{record.productName}</p>
                  <p className="text-sm text-muted-foreground">{formatDate(record.date)} - +{record.qty} {record.unit}</p>
                </div>
                <StatusBadge status={record.productType} />
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                <span className="font-medium">{formatCurrency(record.finalPrice)}</span>
                {record.tarhaReason ? (
                  <StatusBadge
                    status={record.tarhaReason}
                    label={`${TARHA_REASON_LABELS[record.tarhaReason]} - ${record.tarhaQty}`}
                  />
                ) : null}
              </div>
            </div>
          ))}
        </ActivityPanel>
        <ActivityPanel
          title="Stock-Out"
          icon={<ArrowUpFromLine className="h-4 w-4" />}
          emptyMessage="No stock-out records yet."
        >
          {stockOutRecords.slice(0, 6).map((record) => (
            <div key={record.id} className="rounded-md border bg-card p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{record.productName}</p>
                  <p className="text-sm text-muted-foreground">{formatDate(record.date)} - -{record.qty} {record.unit}</p>
                </div>
                <StatusBadge status={record.purpose} label={STOCK_OUT_PURPOSE_LABELS[record.purpose]} />
              </div>
              {record.remarks ? <p className="mt-2 text-sm text-muted-foreground">{record.remarks}</p> : null}
            </div>
          ))}
        </ActivityPanel>
      </div>
    </section>
  );
}

function ActivityPanel({
  title,
  icon,
  emptyMessage,
  children,
}: {
  title: string;
  icon: ReactNode;
  emptyMessage: string;
  children: ReactNode;
}) {
  const hasChildren = Array.isArray(children) ? children.length > 0 : Boolean(children);

  return (
    <div className="rounded-md border bg-muted/20 p-3">
      <div className="mb-3 flex items-center gap-2 font-medium">
        {icon}
        {title}
      </div>
      <div className="space-y-2">
        {hasChildren ? children : <p className="rounded-md border border-dashed bg-background p-4 text-sm text-muted-foreground">{emptyMessage}</p>}
      </div>
    </div>
  );
}
