import { useMemo } from "react";
import { useCrops } from "@/features/crop-monitoring/hooks/useCrops";
import type { Crop } from "@/features/crop-monitoring/types/crop.types";
import { useProducts } from "@/features/products/hooks/useProducts";
import type { Product } from "@/features/products/types/product.types";
import { useStockIn } from "@/features/stock-in/hooks/useStockIn";
import type { StockIn } from "@/features/stock-in/types/stock-in.types";
import { useStockOut } from "@/features/stock-out/hooks/useStockOut";
import type { StockOut } from "@/features/stock-out/types/stock-out.types";
import { computeNetStockInQty, computeStockBalance } from "@/lib/utils";
import type { FirestoreDoc } from "@/types/global.types";
import { useSuppliers } from "./useSuppliers";

export type SupplierProductStock = {
  product: FirestoreDoc<Product>;
  stock: number;
  stockInQty: number;
  stockOutQty: number;
};

export type SupplierStockInRecord = FirestoreDoc<StockIn> & {
  productName: string;
  productType: Product["type"];
};

export type SupplierStockOutRecord = FirestoreDoc<StockOut> & {
  productName: string;
  productType: Product["type"];
};

export function useSupplierDetail(supplierId: string | null) {
  const suppliers = useSuppliers();
  const products = useProducts();
  const crops = useCrops();
  const stockIns = useStockIn();
  const stockOuts = useStockOut();

  return useMemo(() => {
    const supplier = suppliers.data?.find((item) => item.id === supplierId) ?? null;
    const linkedProducts = products.data?.filter((item) => item.supplierId === supplierId) ?? [];
    const linkedProductIds = new Set(linkedProducts.map((product) => product.id));
    const cropRecords = (crops.data ?? [])
      .filter((item) => item.supplierId === supplierId)
      .sort((a, b) => b.plantingDate.localeCompare(a.plantingDate));
    const ongoingCrops = cropRecords.filter((item) => !["harvested", "failed"].includes(item.status));
    const productStock: SupplierProductStock[] = linkedProducts.map((product) => {
      const stockInQty = (stockIns.data ?? [])
        .filter((item) => item.productId === product.id)
        .reduce((sum, item) => sum + computeNetStockInQty(item.qty, item.tarhaQty), 0);
      const stockOutQty = (stockOuts.data ?? [])
        .filter((item) => item.productId === product.id)
        .reduce((sum, item) => sum + item.qty, 0);

      return {
        product,
        stock: computeStockBalance(product.id, stockIns.data ?? [], stockOuts.data ?? []),
        stockInQty,
        stockOutQty,
      };
    });
    const productById = new Map(linkedProducts.map((product) => [product.id, product]));
    const stockInRecords: SupplierStockInRecord[] = (stockIns.data ?? [])
      .filter((item) => item.supplierId === supplierId)
      .map((item) => {
        const product = products.data?.find((candidate) => candidate.id === item.productId);

        return {
          ...item,
          productName: product?.name ?? "Unassigned product",
          productType: product?.type ?? "other",
        };
      })
      .sort((a, b) => b.date.localeCompare(a.date));
    const stockOutRecords: SupplierStockOutRecord[] = (stockOuts.data ?? [])
      .filter((item) => linkedProductIds.has(item.productId))
      .map((item) => {
        const product = productById.get(item.productId);

        return {
          ...item,
          productName: product?.name ?? "Unassigned product",
          productType: product?.type ?? "other",
        };
      })
      .sort((a, b) => b.date.localeCompare(a.date));
    const totalStock = productStock.reduce((sum, item) => sum + item.stock, 0);
    const totalInventoryValue = productStock.reduce((sum, item) => sum + item.stock * (item.product.finalPrice ?? item.product.price), 0);

    return {
      supplier,
      productStock,
      cropRecords: cropRecords as FirestoreDoc<Crop>[],
      ongoingCrops,
      stockInRecords,
      stockOutRecords,
      totalStock,
      totalInventoryValue,
      isLoading: suppliers.isLoading || products.isLoading || crops.isLoading || stockIns.isLoading || stockOuts.isLoading,
    };
  }, [
    crops.data,
    crops.isLoading,
    products.data,
    products.isLoading,
    stockIns.data,
    stockIns.isLoading,
    stockOuts.data,
    stockOuts.isLoading,
    supplierId,
    suppliers.data,
    suppliers.isLoading,
  ]);
}
