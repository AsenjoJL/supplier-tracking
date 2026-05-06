import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

export type DataTableColumn<T> = {
  id: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  sortable?: boolean;
  sortValue?: (row: T) => string | number;
  className?: string;
};

type SortState = {
  columnId: string;
  direction: "asc" | "desc";
} | null;

type DataTableProps<T> = {
  data: T[];
  columns: DataTableColumn<T>[];
  getRowId: (row: T) => string;
  pageSize?: number;
  emptyMessage?: string;
};

export function DataTable<T>({ data, columns, getRowId, pageSize = 10, emptyMessage = "No records found." }: DataTableProps<T>) {
  const [sort, setSort] = useState<SortState>(null);
  const [page, setPage] = useState(0);
  const tableMinWidth = Math.max(760, columns.length * 150);

  const sorted = useMemo(() => {
    if (!sort) return data;
    const column = columns.find((item) => item.id === sort.columnId);
    if (!column?.sortValue) return data;
    return [...data].sort((a, b) => {
      const left = column.sortValue?.(a) ?? "";
      const right = column.sortValue?.(b) ?? "";
      const direction = sort.direction === "asc" ? 1 : -1;
      return String(left).localeCompare(String(right), undefined, { numeric: true }) * direction;
    });
  }, [columns, data, sort]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const visibleRows = sorted.slice(page * pageSize, page * pageSize + pageSize);

  const toggleSort = (column: DataTableColumn<T>) => {
    if (!column.sortable) return;
    setPage(0);
    setSort((current) => {
      if (current?.columnId !== column.id) return { columnId: column.id, direction: "asc" };
      if (current.direction === "asc") return { columnId: column.id, direction: "desc" };
      return null;
    });
  };

  const SortIcon = (columnId: string) => {
    if (sort?.columnId !== columnId) return <ChevronsUpDown className="h-3.5 w-3.5" />;
    return sort.direction === "asc" ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />;
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3 md:hidden">
        {visibleRows.length > 0 ? (
          visibleRows.map((row) => (
            <article key={getRowId(row)} className="rounded-md border bg-card p-3 shadow-sm">
              {columns.map((column) => (
                <div
                  key={column.id}
                  className={cn(
                    "grid grid-cols-[6.5rem_minmax(0,1fr)] gap-3 border-b py-2 text-sm last:border-0",
                    column.id === "actions" && "grid-cols-1 gap-2",
                  )}
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{column.header}</p>
                  <div className="min-w-0">{column.cell(row)}</div>
                </div>
              ))}
            </article>
          ))
        ) : (
          <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
            {emptyMessage}
          </div>
        )}
      </div>
      <div className="hidden overflow-x-auto md:block">
        <Table style={{ minWidth: tableMinWidth }}>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.id} className={column.className}>
                  <button
                    type="button"
                    className={cn("flex items-center gap-1", column.sortable ? "cursor-pointer" : "cursor-default")}
                    onClick={() => toggleSort(column)}
                  >
                    {column.header}
                    {column.sortable ? SortIcon(column.id) : null}
                  </button>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleRows.length > 0 ? (
              visibleRows.map((row) => (
                <TableRow key={getRowId(row)}>
                  {columns.map((column) => (
                    <TableCell key={column.id} className={column.className}>
                      {column.cell(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {pageCount > 1 ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
          <span className="text-center text-sm text-muted-foreground sm:text-left">
            Page {page + 1} of {pageCount}
          </span>
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((value) => Math.max(0, value - 1))}>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled={page + 1 >= pageCount} onClick={() => setPage((value) => Math.min(pageCount - 1, value + 1))}>
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
