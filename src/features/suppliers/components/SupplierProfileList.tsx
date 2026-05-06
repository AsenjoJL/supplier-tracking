import { CircleUserRound, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Supplier } from "@/features/suppliers/types/supplier.types";
import type { FirestoreDoc } from "@/types/global.types";

type SupplierProfileListProps = {
  suppliers: FirestoreDoc<Supplier>[];
  emptyMessage: string;
  onView: (supplierId: string) => void;
  onEdit: (supplier: FirestoreDoc<Supplier>) => void;
  onDelete: (supplierId: string) => void;
};

export function SupplierProfileList({ suppliers, emptyMessage, onView, onEdit, onDelete }: SupplierProfileListProps) {
  if (suppliers.length === 0) {
    return <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {suppliers.map((supplier) => (
        <div
          key={supplier.id}
          className="flex flex-col items-center gap-3 rounded-lg border bg-background p-4 text-center transition hover:border-leaf-400 hover:bg-leaf-50/40"
        >
          <button
            type="button"
            className="flex h-20 w-20 items-center justify-center rounded-lg border bg-background text-foreground shadow-sm transition hover:border-leaf-400 hover:bg-leaf-50/40 focus:outline-none focus:ring-2 focus:ring-ring"
            onClick={() => onView(supplier.id)}
            aria-label={`Open ${supplier.name} profile`}
          >
            <CircleUserRound className="h-14 w-14" strokeWidth={1.8} aria-hidden="true" />
          </button>
          <div className="min-w-0">
            <p className="max-w-32 truncate font-medium">{supplier.name}</p>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onEdit(supplier)} aria-label={`Edit ${supplier.name}`}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => onDelete(supplier.id)} aria-label={`Delete ${supplier.name}`}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
