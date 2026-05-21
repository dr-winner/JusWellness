import { z } from "zod";

// --- Phone number (Ghana format) ---
const ghanaPhone = z
  .string()
  .min(10)
  .max(15)
  .regex(/^\+?233[0-9]{9}$|^0[0-9]{9}$/, "Invalid Ghana phone number");

// --- Sanitize text input ---
const safeText = z
  .string()
  .max(500)
  .transform((val) => val.replace(/<[^>]*>/g, "").trim());

const safeName = z
  .string()
  .min(2, "Name too short")
  .max(100)
  .transform((val) => val.replace(/<[^>]*>/g, "").trim());

// --- Inquiry form ---
export const inquirySchema = z.object({
  name: safeName,
  phone: ghanaPhone,
  order_type: z.enum([
    "Retail (1-10 bottles)",
    "Wholesale (10+ bottles)",
    "Event / Catering",
    "Weekly Subscription",
  ]),
  message: safeText.optional(),
});

// --- Order creation ---
export const orderSchema = z.object({
  customer_name: safeName,
  customer_phone: ghanaPhone,
  delivery_address: safeText.optional(),
  channel: z.enum(["online", "whatsapp", "walkin", "wholesale"]).default("online"),
  items: z
    .array(
      z.object({
        product_id: z.string().uuid().optional().nullable(),
        product_name: z.string().min(1).max(100),
        size_label: z.string().min(1).max(20),
        quantity: z.number().int().min(1).max(100),
        unit_price: z.number().min(0).max(10000),
        total_price: z.number().min(0).max(1000000),
      })
    )
    .min(1, "Order must have at least one item")
    .max(50),
  notes: safeText.optional(),
});

// --- Inventory item ---
export const inventorySchema = z.object({
  name: z.string().min(1).max(100),
  category: z.enum(["fruit", "vegetable", "spice", "packaging", "other"]),
  unit: z.string().min(1).max(20),
  quantity: z.number().min(0).max(100000),
  cost_per_unit: z.number().min(0).max(100000),
  reorder_level: z.number().min(0).max(100000),
  supplier: z.string().max(100).optional(),
});

// --- Production batch ---
export const productionBatchSchema = z.object({
  product_id: z.string().uuid().optional().nullable(),
  product_name: z.string().min(1).max(100),
  quantity: z.number().int().min(1).max(10000),
  notes: safeText.optional(),
  expires_at: z.string().datetime().optional().nullable(),
  ingredients: z
    .array(
      z.object({
        inventory_id: z.string().uuid().optional().nullable(),
        ingredient_name: z.string().min(1).max(100),
        amount: z.number().min(0).max(100000),
        unit: z.string().min(1).max(20),
      })
    )
    .optional()
    .default([]),
});

// --- Login ---
export const loginSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
});

export type InquiryInput = z.infer<typeof inquirySchema>;
export type OrderInput = z.infer<typeof orderSchema>;
export type InventoryInput = z.infer<typeof inventorySchema>;
export type ProductionBatchInput = z.infer<typeof productionBatchSchema>;
