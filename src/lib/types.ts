export interface ProductSize {
  label: string;
  ml: number;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  sizes: ProductSize[];
  image: string;
  category: "juice" | "coconut" | "mashke" | "shot";
  ingredients: string[];
  benefits: string[];
  inStock: boolean;
  badge?: string;
}

export interface CartItem {
  product: Product;
  sizeIndex: number;
  quantity: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: "pending" | "confirmed" | "preparing" | "delivered";
  customerName: string;
  customerPhone: string;
  deliveryAddress?: string;
  createdAt: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  costPerUnit: number;
  reorderLevel: number;
  lastRestocked: string;
}

export interface ProductionBatch {
  id: string;
  productId: string;
  quantity: number;
  ingredientsUsed: { itemId: string; amount: number }[];
  producedAt: string;
  expiresAt: string;
}
