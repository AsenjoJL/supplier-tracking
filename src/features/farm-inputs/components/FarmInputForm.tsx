import { ProductForm } from "@/features/products/components/ProductForm";
import type { Product, ProductFormValues } from "@/features/products/types/product.types";
import { FARM_INPUT_TYPES } from "@/lib/constants";
import type { FirestoreDoc } from "@/types/global.types";

type FarmInputFormProps = {
  open: boolean;
  product?: FirestoreDoc<Product> | null;
  pending?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: ProductFormValues) => void;
};

const farmInputDefaults: Partial<ProductFormValues> = {
  type: "abuno",
  unit: "Kilo",
};

export function FarmInputForm(props: FarmInputFormProps) {
  return (
    <ProductForm
      {...props}
      title={props.product ? "Edit Farm Input" : "Add Farm Input"}
      allowedTypes={FARM_INPUT_TYPES}
      defaultValuesOverride={farmInputDefaults}
    />
  );
}
