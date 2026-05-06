import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supplierSchema } from "@/features/suppliers/schemas/supplier.schema";
import type { Supplier, SupplierFormValues } from "@/features/suppliers/types/supplier.types";
import { SUPPLIER_KIND_LABELS, SUPPLIER_KINDS } from "@/lib/constants";
import type { FirestoreDoc } from "@/types/global.types";

const defaults: SupplierFormValues = {
  name: "",
  supplierKind: "vegetable",
  contactPerson: "",
  phone: "",
  email: "",
  address: "",
  status: "active",
};

type SupplierFormProps = {
  open: boolean;
  supplier?: FirestoreDoc<Supplier> | null;
  pending?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: SupplierFormValues) => void;
};

export function SupplierForm({ open, supplier, pending = false, onOpenChange, onSubmit }: SupplierFormProps) {
  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues: defaults,
  });

  useEffect(() => {
    form.reset(supplier ? {
      name: supplier.name,
      supplierKind: supplier.supplierKind ?? "vegetable",
      contactPerson: supplier.contactPerson,
      phone: supplier.phone,
      email: supplier.email,
      address: supplier.address,
      status: supplier.status,
    } : defaults);
  }, [form, supplier, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{supplier ? "Edit Supplier" : "Add Supplier"}</DialogTitle>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="supplier-name">Supplier name</Label>
              <Input id="supplier-name" {...form.register("name")} />
              {form.formState.errors.name ? <p className="text-sm text-destructive">{form.formState.errors.name.message}</p> : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplier-status">Status</Label>
              <select id="supplier-status" className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm" {...form.register("status")}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="supplier-kind">Supplier type</Label>
            <select id="supplier-kind" className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm" {...form.register("supplierKind")}>
              {SUPPLIER_KINDS.map((kind) => (
                <option key={kind} value={kind}>{SUPPLIER_KIND_LABELS[kind]}</option>
              ))}
            </select>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="contact-person">Contact person <span className="text-muted-foreground">(optional)</span></Label>
              <Input id="contact-person" {...form.register("contactPerson")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone <span className="text-muted-foreground">(optional)</span></Label>
              <Input id="phone" {...form.register("phone")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email <span className="text-muted-foreground">(optional)</span></Label>
              <Input id="email" type="email" {...form.register("email")} />
              {form.formState.errors.email ? <p className="text-sm text-destructive">{form.formState.errors.email.message}</p> : null}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address <span className="text-muted-foreground">(optional)</span></Label>
            <Textarea id="address" {...form.register("address")} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={pending}>{pending ? "Saving..." : "Save supplier"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
