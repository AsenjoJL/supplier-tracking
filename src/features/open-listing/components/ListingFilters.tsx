import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PRODUCT_TYPE_LABELS, PRODUCT_TYPES } from "@/lib/constants";
import type { ProductType } from "@/features/products/types/product.types";

type ListingFiltersProps = {
  search: string;
  type: ProductType | "all";
  onSearchChange: (value: string) => void;
  onTypeChange: (value: ProductType | "all") => void;
};

export function ListingFilters({ search, type, onSearchChange, onTypeChange }: ListingFiltersProps) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <Input placeholder="Search products..." value={search} onChange={(event) => onSearchChange(event.target.value)} className="w-full max-w-sm" />
      <div className="flex flex-wrap gap-2">
        <Button variant={type === "all" ? "default" : "outline"} size="sm" onClick={() => onTypeChange("all")}>All</Button>
        {PRODUCT_TYPES.filter((item) => item !== "other").map((item) => (
          <Button key={item} variant={type === item ? "default" : "outline"} size="sm" onClick={() => onTypeChange(item)}>
            {PRODUCT_TYPE_LABELS[item]}
          </Button>
        ))}
      </div>
    </div>
  );
}
