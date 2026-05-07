import { useMemo, useState } from "react";
import { DataTable, type DataTableColumn } from "@/components/common/DataTable";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { SectionCard } from "@/components/common/SectionCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PageWrapper } from "@/components/layout/PageWrapper";
import type { ProductType } from "@/features/products/types/product.types";
import { useOpenListing } from "@/features/open-listing/hooks/useOpenListing";
import { PRODUCT_TYPE_LABELS, PRODUCT_TYPES } from "@/lib/constants";
import { formatCurrency, normalizeSearch } from "@/lib/utils";
import { ListingFilters } from "./ListingFilters";
import { TarhaQuickButton } from "./TarhaQuickButton";

type ListingRow = ReturnType<typeof useOpenListing>["rows"][number];

export function ListingTable() {
  const listing = useOpenListing();
  const [search, setSearch] = useState("");
  const [type, setType] = useState<ProductType | "all">("all");

  const rows = useMemo(() => {
    const term = normalizeSearch(search);
    return listing.rows.filter((row) => {
      const matchesType = type === "all" || row.product.type === type;
      const matchesSearch = normalizeSearch(`${row.product.name} ${row.supplier?.name ?? ""}`).includes(term);
      return matchesType && matchesSearch;
    });
  }, [listing.rows, search, type]);
  const sections = useMemo(() => PRODUCT_TYPES
    .map((productType) => ({
      type: productType,
      title: productType === "vegetable" ? "Vegetable Products" : PRODUCT_TYPE_LABELS[productType],
      rows: rows.filter((row) => row.product.type === productType),
    }))
    .filter((section) => type === "all" ? section.rows.length > 0 : section.type === type), [rows, type]);

  const baseColumns: DataTableColumn<ListingRow>[] = [
    { id: "product", header: "Product", sortable: true, sortValue: (row) => row.product.name, cell: (row) => <div><p className="font-medium">{row.product.name}</p><p className="text-xs text-muted-foreground">{row.product.id}</p></div> },
    { id: "supplier", header: "Supplier", cell: (row) => row.supplier?.name ?? "—" },
    { id: "price", header: "Latest Price", cell: (row) => formatCurrency(row.latestStockIn?.finalPrice ?? row.product.price) },
    { id: "stock", header: "Stock", sortable: true, sortValue: (row) => row.currentStock, cell: (row) => <StatusBadge status={row.currentStock <= 0 ? "out" : row.currentStock <= 5 ? "low" : "ok"} label={`${row.currentStock} ${row.product.unit}`} /> },
    { id: "status", header: "Status", cell: (row) => <StatusBadge status={row.product.status} /> },
  ];
  const vegetableColumns: DataTableColumn<ListingRow>[] = [
    ...baseColumns,
    { id: "tarha", header: "Quick Tarha", cell: (row) => <TarhaQuickButton stockIn={row.latestStockIn} /> },
  ];
  const farmInputColumns: DataTableColumn<ListingRow>[] = [
    ...baseColumns,
  ];

  if (listing.isLoading) return <LoadingSpinner />;

  return (
    <PageWrapper title="Open Listing" description="Searchable product listing with supplier joins, stock state, and quick Tarha editing.">
      <ListingFilters search={search} type={type} onSearchChange={setSearch} onTypeChange={setType} />
      <div className="grid gap-6 xl:grid-cols-2">
        {sections.map((section) => (
          <SectionCard
            key={section.type}
            title={section.title}
            description={
              section.type === "vegetable"
                ? `${section.rows.length} ${section.rows.length === 1 ? "product" : "products"} with supplier stock and Tarha controls.`
                : `${section.rows.length} ${section.rows.length === 1 ? "product" : "products"} in ${PRODUCT_TYPE_LABELS[section.type].toLowerCase()} inventory.`
            }
          >
            <DataTable
              data={section.rows}
              columns={section.type === "vegetable" ? vegetableColumns : farmInputColumns}
              getRowId={(row) => row.product.id}
              emptyMessage={`No ${PRODUCT_TYPE_LABELS[section.type].toLowerCase()} products found.`}
            />
          </SectionCard>
        ))}
      </div>
    </PageWrapper>
  );
}
