import { useMemo, useState } from "react";
import { Download, Filter, Plus, Pencil, Trash2 } from "lucide-react";
import { endOfMonth, format, startOfMonth } from "date-fns";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { DataTable, type DataTableColumn } from "@/components/common/DataTable";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ReportDateRangeFilter } from "@/features/reports/components/ReportDateRangeFilter";
import { ExpenseCharts } from "@/features/expenses/components/ExpenseCharts";
import { ExpenseForm } from "@/features/expenses/components/ExpenseForm";
import { ExpenseSummaryCards } from "@/features/expenses/components/ExpenseSummaryCards";
import { useExpenseMutations } from "@/features/expenses/hooks/useExpenseMutations";
import { useExpenseOverview } from "@/features/expenses/hooks/useExpenseOverview";
import type { ExpenseCategory, ExpenseRow, ExpenseSource, ManualExpense, ManualExpenseFormValues } from "@/features/expenses/types/expense.types";
import { EXPENSE_CATEGORIES, EXPENSE_CATEGORY_LABELS, EXPENSE_SOURCES, EXPENSE_SOURCE_LABELS } from "@/lib/constants";
import { formatCurrency, formatDate, normalizeSearch } from "@/lib/utils";
import type { FirestoreDoc } from "@/types/global.types";

const escapeCsv = (value: string | number): string => {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

const downloadCsv = (rows: ExpenseRow[]) => {
  const headers = ["Date", "Type", "Category", "Item", "Crop", "Quantity", "Unit Price", "Total", "Supplier / Remarks"];
  const csvRows = rows.map((row) => [
    row.date,
    EXPENSE_SOURCE_LABELS[row.source],
    EXPENSE_CATEGORY_LABELS[row.category],
    row.itemName,
    row.cropName,
    row.qtyLabel,
    row.unitPrice,
    row.amount,
    row.supplierOrRemarks,
  ]);
  const csv = [headers, ...csvRows].map((row) => row.map(escapeCsv).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `expenses-${format(new Date(), "yyyy-MM-dd")}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

export function ExpenseOverview() {
  const [from, setFrom] = useState(() => format(startOfMonth(new Date()), "yyyy-MM-dd"));
  const [to, setTo] = useState(() => format(endOfMonth(new Date()), "yyyy-MM-dd"));
  const [search, setSearch] = useState("");
  const [source, setSource] = useState<ExpenseSource | "all">("all");
  const [category, setCategory] = useState<ExpenseCategory | "all">("all");
  const [cropId, setCropId] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<FirestoreDoc<ManualExpense> | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const expenses = useExpenseOverview({ from, to });
  const mutations = useExpenseMutations();

  const rows = useMemo(() => {
    const term = normalizeSearch(search);
    return expenses.rows.filter((row) => {
      const matchesSearch = normalizeSearch(`${row.itemName} ${row.cropName} ${row.supplierOrRemarks}`).includes(term);
      const matchesSource = source === "all" || row.source === source;
      const matchesCategory = category === "all" || row.category === category;
      const matchesCrop = cropId === "all" || row.cropId === cropId;
      return matchesSearch && matchesSource && matchesCategory && matchesCrop;
    });
  }, [category, cropId, expenses.rows, search, source]);

  const manualExpenseById = useMemo(() => new Map(expenses.manualExpenses.map((expense) => [expense.id, expense])), [expenses.manualExpenses]);

  const columns: DataTableColumn<ExpenseRow>[] = [
    { id: "date", header: "Date", sortable: true, sortValue: (row) => row.date, cell: (row) => formatDate(row.date) },
    { id: "source", header: "Type", cell: (row) => <StatusBadge status={row.source} label={EXPENSE_SOURCE_LABELS[row.source]} /> },
    { id: "category", header: "Category", cell: (row) => EXPENSE_CATEGORY_LABELS[row.category] },
    { id: "item", header: "Item Name", cell: (row) => <p className="font-medium">{row.itemName}</p> },
    { id: "crop", header: "Crop", cell: (row) => row.cropName },
    { id: "qty", header: "Qty", cell: (row) => row.qtyLabel },
    { id: "unitPrice", header: "Unit Price", cell: (row) => formatCurrency(row.unitPrice) },
    { id: "amount", header: "Total", sortable: true, sortValue: (row) => row.amount, cell: (row) => <span className="font-semibold">{formatCurrency(row.amount)}</span> },
    { id: "remarks", header: "Supplier / Remarks", cell: (row) => <span className="text-sm text-muted-foreground">{row.supplierOrRemarks}</span> },
    {
      id: "actions",
      header: "Actions",
      cell: (row) => row.manualExpenseId ? (
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditing(manualExpenseById.get(row.manualExpenseId ?? "") ?? null);
              setFormOpen(true);
            }}
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={() => setDeleteId(row.manualExpenseId ?? null)}>
            <Trash2 className="h-3.5 w-3.5" />
            Del
          </Button>
        </div>
      ) : <span className="text-xs text-muted-foreground">Auto</span>,
    },
  ];

  const submit = (values: ManualExpenseFormValues) => {
    if (editing) {
      mutations.updateExpense.mutate({ id: editing.id, payload: values }, { onSuccess: () => setFormOpen(false) });
      return;
    }
    mutations.createExpense.mutate(values, { onSuccess: () => setFormOpen(false) });
  };

  if (expenses.isLoading) return <LoadingSpinner />;

  return (
    <PageWrapper
      title="Expenses Overview"
      description="Track all expenses and see how they impact your farm profitability."
      action={
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="rounded-md border bg-card p-3 shadow-sm">
            <ReportDateRangeFilter from={from} to={to} onFromChange={setFrom} onToChange={setTo} />
          </div>
          <Button variant="outline" onClick={() => downloadCsv(rows)}>
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
            <Plus className="h-4 w-4" />
            Add Expense
          </Button>
        </div>
      }
    >
      <ExpenseSummaryCards summary={expenses.summary} />
      <ExpenseCharts data={expenses} />
      <div className="rounded-lg border bg-card p-4 shadow-soft">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
          <Input placeholder="Search expenses..." value={search} onChange={(event) => setSearch(event.target.value)} className="w-full max-w-sm" />
          <div className="grid gap-2 sm:grid-cols-3 lg:flex lg:flex-1">
            <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm" value={source} onChange={(event) => setSource(event.target.value as ExpenseSource | "all")}>
              <option value="all">All Types</option>
              {EXPENSE_SOURCES.map((item) => <option key={item} value={item}>{EXPENSE_SOURCE_LABELS[item]}</option>)}
            </select>
            <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm" value={category} onChange={(event) => setCategory(event.target.value as ExpenseCategory | "all")}>
              <option value="all">All Categories</option>
              {EXPENSE_CATEGORIES.map((item) => <option key={item} value={item}>{EXPENSE_CATEGORY_LABELS[item]}</option>)}
            </select>
            <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm" value={cropId} onChange={(event) => setCropId(event.target.value)}>
              <option value="all">All Crops</option>
              {expenses.crops.map((crop) => <option key={crop.id} value={crop.id}>{crop.name}</option>)}
            </select>
          </div>
          <Button variant="outline" className="lg:w-auto">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>
        <DataTable data={rows} columns={columns} getRowId={(row) => row.id} emptyMessage="No expenses found for this period." />
      </div>
      <ExpenseForm
        open={formOpen}
        expense={editing}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditing(null);
        }}
        onSubmit={submit}
        pending={mutations.createExpense.isPending || mutations.updateExpense.isPending}
      />
      <ConfirmDialog
        open={deleteId !== null}
        title="Delete expense?"
        description="This removes the manual expense record. Auto-calculated expenses are not affected."
        onOpenChange={(open) => { if (!open) setDeleteId(null); }}
        onConfirm={() => deleteId && mutations.deleteExpense.mutate(deleteId, { onSuccess: () => setDeleteId(null) })}
        pending={mutations.deleteExpense.isPending}
      />
    </PageWrapper>
  );
}
