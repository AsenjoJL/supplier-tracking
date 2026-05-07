import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCrops } from "@/features/crop-monitoring/hooks/useCrops";
import { manualExpenseSchema } from "@/features/expenses/schemas/expense.schema";
import type { ManualExpense, ManualExpenseFormValues } from "@/features/expenses/types/expense.types";
import { EXPENSE_CATEGORIES, EXPENSE_CATEGORY_LABELS } from "@/lib/constants";
import { todayISO } from "@/lib/utils";
import type { FirestoreDoc } from "@/types/global.types";

const defaults: ManualExpenseFormValues = {
  date: todayISO(),
  category: "labor",
  description: "",
  amount: 0,
  cropId: "",
  remarks: "",
};

type ExpenseFormProps = {
  open: boolean;
  expense?: FirestoreDoc<ManualExpense> | null;
  pending?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: ManualExpenseFormValues) => void;
};

export function ExpenseForm({ open, expense, pending = false, onOpenChange, onSubmit }: ExpenseFormProps) {
  const crops = useCrops();
  const form = useForm<ManualExpenseFormValues>({
    resolver: zodResolver(manualExpenseSchema),
    defaultValues: defaults,
  });

  useEffect(() => {
    form.reset(expense ? {
      date: expense.date,
      category: expense.category,
      description: expense.description,
      amount: expense.amount,
      cropId: expense.cropId,
      remarks: expense.remarks,
    } : defaults);
  }, [expense, form, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{expense ? "Edit Expense" : "Add Expense"}</DialogTitle>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" {...form.register("date")} />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm" {...form.register("category")}>
                {EXPENSE_CATEGORIES.map((category) => (
                  <option key={category} value={category}>{EXPENSE_CATEGORY_LABELS[category]}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Item name</Label>
              <Input {...form.register("description")} />
              {form.formState.errors.description ? <p className="text-sm text-destructive">{form.formState.errors.description.message}</p> : null}
            </div>
            <div className="space-y-2">
              <Label>Amount</Label>
              <Input type="number" step="0.01" {...form.register("amount")} />
              {form.formState.errors.amount ? <p className="text-sm text-destructive">{form.formState.errors.amount.message}</p> : null}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Linked crop <span className="text-muted-foreground">(optional)</span></Label>
            <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm" {...form.register("cropId")}>
              <option value="">Unassigned</option>
              {(crops.data ?? []).map((crop) => <option key={crop.id} value={crop.id}>{crop.name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Remarks</Label>
            <Textarea {...form.register("remarks")} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={pending}>{pending ? "Saving..." : expense ? "Update expense" : "Save expense"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
