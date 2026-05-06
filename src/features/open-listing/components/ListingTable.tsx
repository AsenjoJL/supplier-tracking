import { useMemo, useState } from "react";
import { DataTable, type DataTableColumn } from "@/components/common/DataTable";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PageWrapper } from "@/components/layout/PageWrapper";
import type { ProductType } from "@/features/products/types/product.types";
import { ProductTypeBadge } from "@/features/products/components/ProductTypeBadge";
import { useOpenListing } from "@/features/open-listing/hooks/useOpenListing";
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

  const columns: DataTableColumn<ListingRow>[] = [
    { id: "product", header: "Product", sortable: true, sortValue: (row) => row.product.name, cell: (row) => <div><p className="font-medium">{row.product.name}</p><p className="text-xs text-muted-foreground">{row.product.id}</p></div> },
    { id: "type", header: "Type", cell: (row) => <ProductTypeBadge type={row.product.type} /> },
    { id: "supplier", header: "Supplier", cell: (row) => row.supplier?.name ?? "—" },
    { id: "price", header: "Latest Price", cell: (row) => formatCurrency(row.latestStockIn?.finalPrice ?? row.product.price) },
    { id: "stock", header: "Stock", sortable: true, sortValue: (row) => row.currentStock, cell: (row) => <StatusBadge status={row.currentStock <= 0 ? "out" : row.currentStock <= 5 ? "low" : "ok"} label={`${row.currentStock} ${row.product.unit}`} /> },
    { id: "status", header: "Status", cell: (row) => <StatusBadge status={row.product.status} /> },
    { id: "tarha", header: "Quick Tarha", cell: (row) => <TarhaQuickButton stockIn={row.latestStockIn} /> },
  ];

  if (listing.isLoading) return <LoadingSpinner />;

  return (
    <PageWrapper title="Open Listing" description="Searchable product listing with supplier joins, stock state, and quick Tarha editing.">
      <ListingFilters search={search} type={type} onSearchChange={setSearch} onTypeChange={setType} />
      <DataTable data={rows} columns={columns} getRowId={(row) => row.product.id} />
    </PageWrapper>
  );
}
