import type { ProductFormValues } from "@/features/products/types/product.types";

type CatalogProduct = ProductFormValues & {
  sourceLabel: string;
};

const vegetable = (name: string, price: number, sourceLabel = "DAPTC May 03, 2026"): CatalogProduct => ({
  name,
  type: "vegetable",
  supplierId: "",
  unit: "Kilo",
  price,
  tarhaPercent: 0,
  deductionAmount: 0,
  finalPrice: price,
  status: "active",
  sourceLabel,
});

export const DAPTC_PRODUCT_IMPORTS: CatalogProduct[] = [
  vegetable("Repolyo (Cabbage)", 45),
  vegetable("Ombok (Pechay)", 40),
  vegetable("Camote (Sweet potato)", 35),
  vegetable("Carrots", 130),
  vegetable("Beans (Baguio beans)", 55),
  vegetable("Talong (Eggplant)", 50),
  vegetable("Gabi (Taro)", 45),
  vegetable("Atsal (Bell pepper)", 65, "DAPTC May 03, 2026, average of 60-70"),
  vegetable("Kalabasa (Squash)", 20),
  vegetable("Sibuyas Dahunan (Onion leeks)", 140, "DAPTC May 03, 2026, average of 90-190"),
  vegetable("Sili Espada (Serrano pepper)", 32.5, "DAPTC May 03, 2026, average of 30-35"),
  vegetable("Sayote (Chayote)", 11),
  vegetable("Kamatis (Tomato)", 35),
  vegetable("Paliya (Bitter gourd)", 40),
  vegetable("Balatong (String beans)", 45),
  vegetable("Sili Labuyo (Wild chili)", 80),
  vegetable("Sili Halang Kulikot (Tabasco pepper)", 100),
  vegetable("Okra", 30),
  vegetable("Luy-a (Ginger)", 60),
  vegetable("Pipino (Cucumber)", 25),
  vegetable("Lettuce Ball", 45),
  vegetable("Sweetcorn", 30),
  vegetable("Raddish", 20),
  vegetable("Romaine", 0, "Manual add-on, price pending"),
  vegetable("Taiwan", 0, "Manual add-on, price pending"),
  vegetable("Green Wave", 0, "Manual add-on, price pending"),
  vegetable("Red Wave", 0, "Manual add-on, price pending"),
  vegetable("Mint", 0, "Manual add-on, price pending"),
  vegetable("Parsley", 0, "Manual add-on, price pending"),
  vegetable("Yansoy", 0, "Manual add-on, price pending"),
];
