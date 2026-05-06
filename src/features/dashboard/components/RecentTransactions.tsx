import { ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { SectionCard } from "@/components/common/SectionCard";
import type { Product } from "@/features/products/types/product.types";
import { formatDate } from "@/lib/utils";
import type { FirestoreDoc } from "@/types/global.types";

type RecentTransaction = {
  id: string;
  productId: string;
  qty: number;
  unit: string;
  purpose: string;
  date: string;
  movementType: "in" | "out";
};

type RecentTransactionsProps = {
  transactions: RecentTransaction[];
  products: FirestoreDoc<Product>[];
};

export function RecentTransactions({ transactions, products }: RecentTransactionsProps) {
  return (
    <SectionCard title="Recent Stock Movements" description="Latest inventory activity across inputs and crops.">
      <div className="space-y-3">
        {transactions.map((transaction) => {
          const product = products.find((item) => item.id === transaction.productId);
          const isIn = transaction.movementType === "in";
          const Icon = isIn ? ArrowDownToLine : ArrowUpFromLine;
          return (
            <div key={`${transaction.movementType}-${transaction.id}`} className="flex items-center gap-3 border-b pb-3 last:border-0 last:pb-0">
              <div className={isIn ? "rounded-md bg-leaf-50 p-2 text-leaf-700" : "rounded-md bg-red-50 p-2 text-red-700"}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium">{product?.name ?? "Unknown product"}</p>
                <p className="text-sm text-muted-foreground">{transaction.purpose} · {formatDate(transaction.date)}</p>
              </div>
              <p className={isIn ? "font-semibold text-leaf-700" : "font-semibold text-red-700"}>
                {isIn ? "+" : "-"}{transaction.qty} {transaction.unit}
              </p>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}
