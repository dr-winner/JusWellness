import { z } from "zod";

/**
 * Input validation schemas — defense layer against injection + malformed data.
 *
 * OWASP A03: Injection — strict validation, HTML stripping, length limits.
 * OWASP A08: Data Integrity — server-side validation of all inputs.
 */

// ============================================================
// SHARED VALIDATORS
// ============================================================

/** Ghana phone number — strict format */
const ghanaPhone = z
  .string()
  .min(10, "Phone number too short")
  .max(15, "Phone number too long")
  .regex(
    /^\+?233[0-9]{9}$|^0[0-9]{9}$/,
    "Invalid Ghana phone number (e.g., 0241234567 or +233241234567)"
  );

/** Sanitized text — strips HTML, script injections, and trims */
const safeText = z
  .string()
  .max(500, "Text too long")
  .transform((val) =>
    val
      .replace(/<[^>]*>/g, "") // Strip HTML tags
      .replace(/javascript:/gi, "") // Strip javascript: protocol
      .replace(/on\w+\s*=/gi, "") // Strip event handlers
      .replace(/data:(?!image\/(png|jpeg|webp|gif))/gi, "") // Strip non-image data URIs
      .trim()
  );

/** Sanitized name — min 2 chars, no HTML */
const safeName = z
  .string()
  .min(2, "Name too short")
  .max(100, "Name too long")
  .transform((val) =>
    val
      .replace(/<[^>]*>/g, "")
      .replace(/javascript:/gi, "")
      .replace(/on\w+\s*=/gi, "")
      .trim()
  )
  .refine((val) => val.length >= 2, "Name too short after sanitization");

/** UUID validator */
const safeUuid = z
  .string()
  .uuid("Invalid ID format")
  .max(36);

// ============================================================
// INQUIRY FORM
// ============================================================

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

// ============================================================
// ORDER CREATION
// ============================================================

export const orderSchema = z.object({
  customer_name: safeName,
  customer_phone: ghanaPhone,
  delivery_address: safeText.optional(),
  channel: z
    .enum(["online", "whatsapp", "walkin", "wholesale"])
    .default("online"),
  items: z
    .array(
      z.object({
        product_id: safeUuid.optional().nullable(),
        product_name: z
          .string()
          .min(1)
          .max(100)
          .transform((v) => v.replace(/<[^>]*>/g, "").trim()),
        size_label: z
          .string()
          .min(1)
          .max(20)
          .transform((v) => v.replace(/<[^>]*>/g, "").trim()),
        quantity: z.number().int().min(1).max(100),
        unit_price: z.number().min(0).max(10_000),
        // total_price is accepted but NEVER trusted — server recalculates
        total_price: z.number().min(0).max(1_000_000).optional(),
      })
    )
    .min(1, "Order must have at least one item")
    .max(50, "Too many items in order"),
  notes: safeText.optional(),
});

// ============================================================
// INVENTORY ITEM
// ============================================================

export const inventorySchema = z.object({
  name: z
    .string()
    .min(1)
    .max(100)
    .transform((v) => v.replace(/<[^>]*>/g, "").trim()),
  category: z.enum(["fruit", "vegetable", "spice", "packaging", "other"]),
  unit: z
    .string()
    .min(1)
    .max(20)
    .transform((v) => v.replace(/<[^>]*>/g, "").trim()),
  quantity: z.number().min(0).max(100_000),
  cost_per_unit: z.number().min(0).max(100_000),
  reorder_level: z.number().min(0).max(100_000),
  supplier: z
    .string()
    .max(100)
    .transform((v) => v.replace(/<[^>]*>/g, "").trim())
    .optional(),
});

// ============================================================
// PRODUCTION BATCH
// ============================================================

export const productionBatchSchema = z.object({
  product_id: safeUuid.optional().nullable(),
  product_name: z
    .string()
    .min(1)
    .max(100)
    .transform((v) => v.replace(/<[^>]*>/g, "").trim()),
  quantity: z.number().int().min(1).max(10_000),
  notes: safeText.optional(),
  expires_at: z.string().datetime().optional().nullable(),
  ingredients: z
    .array(
      z.object({
        inventory_id: safeUuid.optional().nullable(),
        ingredient_name: z
          .string()
          .min(1)
          .max(100)
          .transform((v) => v.replace(/<[^>]*>/g, "").trim()),
        amount: z.number().min(0).max(100_000),
        unit: z
          .string()
          .min(1)
          .max(20)
          .transform((v) => v.replace(/<[^>]*>/g, "").trim()),
      })
    )
    .max(50, "Too many ingredients")
    .optional()
    .default([]),
});

// ============================================================
// LOGIN
// ============================================================

export const loginSchema = z.object({
  email: z
    .string()
    .email("Invalid email")
    .max(255)
    .transform((v) => v.toLowerCase().trim()),
  password: z.string().min(8, "Password too short").max(128, "Password too long"),
});

// ============================================================
// TYPES
// ============================================================

export type InquiryInput = z.infer<typeof inquirySchema>;
export type OrderInput = z.infer<typeof orderSchema>;
export type InventoryInput = z.infer<typeof inventorySchema>;
export type ProductionBatchInput = z.infer<typeof productionBatchSchema>;
