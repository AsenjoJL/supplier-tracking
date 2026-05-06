import { CircleUserRound, Mail, MapPin, Package, Phone, Sprout, UserRound, Warehouse } from "lucide-react";
import { StatusBadge } from "@/components/common/StatusBadge";
import type { Supplier } from "@/features/suppliers/types/supplier.types";
import { SUPPLIER_KIND_LABELS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import type { FirestoreDoc } from "@/types/global.types";

type SupplierProfileHeaderProps = {
  supplier: FirestoreDoc<Supplier>;
  productCount: number;
  activeCropCount: number;
  totalStock: number;
  totalInventoryValue: number;
  showCropMetrics?: boolean;
};

function ContactLine({ icon: Icon, label, value }: { icon: typeof Phone; label: string; value: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-md border bg-background/70 px-3 py-2">
      <Icon className="h-4 w-4 shrink-0 text-leaf-700" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium">{value || "Not provided"}</p>
      </div>
    </div>
  );
}

export function SupplierProfileHeader({
  supplier,
  productCount,
  activeCropCount,
  totalStock,
  totalInventoryValue,
  showCropMetrics = true,
}: SupplierProfileHeaderProps) {
  return (
    <section className="overflow-hidden rounded-lg border bg-card">
      <div className="h-28 bg-leaf-900" />
      <div className="px-5 pb-5">
        <div className="-mt-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex items-end gap-4">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-lg border-4 border-background bg-background text-foreground shadow-sm">
              <CircleUserRound className="h-16 w-16" strokeWidth={1.8} aria-hidden="true" />
            </div>
            <div className="pb-1">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <h2 className="font-serif text-3xl leading-none">{supplier.name}</h2>
                <StatusBadge status={supplier.status} />
              </div>
              <p className="text-sm text-muted-foreground">{SUPPLIER_KIND_LABELS[supplier.supplierKind ?? "vegetable"]}</p>
            </div>
          </div>
          <div className={showCropMetrics ? "grid grid-cols-2 gap-2 text-sm md:grid-cols-4" : "grid grid-cols-2 gap-2 text-sm md:grid-cols-3"}>
            <ProfileStat icon={Package} label="Products" value={String(productCount)} />
            {showCropMetrics ? <ProfileStat icon={Sprout} label="Active crops" value={String(activeCropCount)} /> : null}
            <ProfileStat icon={Warehouse} label="Stock" value={String(totalStock)} />
            <ProfileStat icon={Package} label="Value" value={formatCurrency(totalInventoryValue)} />
          </div>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <ContactLine icon={UserRound} label="Contact person" value={supplier.contactPerson} />
          <ContactLine icon={Phone} label="Phone" value={supplier.phone} />
          <ContactLine icon={Mail} label="Email" value={supplier.email} />
          <ContactLine icon={MapPin} label="Address" value={supplier.address} />
        </div>
      </div>
    </section>
  );
}

function ProfileStat({ icon: Icon, label, value }: { icon: typeof Package; label: string; value: string }) {
  return (
    <div className="rounded-md border bg-background/80 px-3 py-2 shadow-sm">
      <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  );
}
