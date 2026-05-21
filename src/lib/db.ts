import { supabase } from "./supabase";
import type { Database } from "./database.types";

type Tables = Database["public"]["Tables"];

// ============================================================
// PRODUCTS
// ============================================================
export async function getProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("*, product_sizes(*)")
    .eq("in_stock", true)
    .order("sort_order");
  if (error) throw error;
  return data;
}

export async function getProductBySlug(slug: string) {
  const { data, error } = await supabase
    .from("products")
    .select("*, product_sizes(*)")
    .eq("slug", slug)
    .single();
  if (error) throw error;
  return data;
}

// ============================================================
// ORDERS
// ============================================================
export async function createOrder(
  order: Tables["orders"]["Insert"],
  items: Omit<Tables["order_items"]["Insert"], "order_id">[]
) {
  const { data: orderData, error: orderError } = await supabase
    .from("orders")
    .insert(order)
    .select()
    .single();

  if (orderError) throw orderError;

  const orderItems = items.map((item) => ({
    ...item,
    order_id: orderData.id,
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems);

  if (itemsError) throw itemsError;

  return orderData;
}

export async function getOrders(status?: string) {
  let query = supabase
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function updateOrderStatus(
  orderId: string,
  status: Tables["orders"]["Row"]["status"]
) {
  const { data, error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ============================================================
// CUSTOMERS
// ============================================================
export async function findOrCreateCustomer(
  customer: Tables["customers"]["Insert"]
) {
  const { data: existing } = await supabase
    .from("customers")
    .select()
    .eq("phone", customer.phone)
    .single();

  if (existing) return existing;

  const { data, error } = await supabase
    .from("customers")
    .insert(customer)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getCustomers() {
  const { data, error } = await supabase
    .from("customers")
    .select()
    .order("total_spent", { ascending: false });
  if (error) throw error;
  return data;
}

// ============================================================
// INVENTORY
// ============================================================
export async function getInventory() {
  const { data, error } = await supabase
    .from("inventory")
    .select()
    .order("name");
  if (error) throw error;
  return data;
}

export async function getLowStockItems() {
  const { data, error } = await supabase
    .from("inventory")
    .select()
    .filter("quantity", "lte", supabase.rpc ? "reorder_level" : 0);

  // Fallback: get all and filter client-side
  if (error) {
    const { data: all, error: allErr } = await supabase
      .from("inventory")
      .select();
    if (allErr) throw allErr;
    return (all || []).filter((i) => i.quantity <= i.reorder_level);
  }
  return data;
}

export async function addInventoryItem(item: Tables["inventory"]["Insert"]) {
  const { data, error } = await supabase
    .from("inventory")
    .insert(item)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateInventoryQuantity(
  id: string,
  quantity: number,
  type: "restock" | "adjustment",
  notes?: string
) {
  const { error: updateErr } = await supabase
    .from("inventory")
    .update({
      quantity,
      last_restocked: type === "restock" ? new Date().toISOString() : undefined,
    })
    .eq("id", id);
  if (updateErr) throw updateErr;

  const { error: logErr } = await supabase.from("inventory_logs").insert({
    inventory_id: id,
    type,
    quantity,
    notes,
  });
  if (logErr) throw logErr;
}

// ============================================================
// PRODUCTION
// ============================================================
export async function getProductionBatches() {
  const { data, error } = await supabase
    .from("production_batches")
    .select("*, batch_ingredients(*)")
    .order("produced_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function createProductionBatch(
  batch: Tables["production_batches"]["Insert"],
  ingredients: Omit<Tables["batch_ingredients"]["Insert"], "batch_id">[]
) {
  const { data: batchData, error: batchError } = await supabase
    .from("production_batches")
    .insert(batch)
    .select()
    .single();

  if (batchError) throw batchError;

  if (ingredients.length > 0) {
    const batchIngredients = ingredients.map((ing) => ({
      ...ing,
      batch_id: batchData.id,
    }));

    const { error: ingError } = await supabase
      .from("batch_ingredients")
      .insert(batchIngredients);
    if (ingError) throw ingError;
  }

  return batchData;
}

export async function completeBatch(batchId: string) {
  const { data, error } = await supabase
    .from("production_batches")
    .update({
      status: "completed" as const,
      completed_at: new Date().toISOString(),
    })
    .eq("id", batchId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ============================================================
// INQUIRIES
// ============================================================
export async function submitInquiry(inquiry: Tables["inquiries"]["Insert"]) {
  const { data, error } = await supabase
    .from("inquiries")
    .insert(inquiry)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getInquiries() {
  const { data, error } = await supabase
    .from("inquiries")
    .select()
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

// ============================================================
// ANALYTICS / DASHBOARD
// ============================================================
export async function getDashboardStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = today.toISOString();

  const [ordersToday, allOrders, lowStock] = await Promise.all([
    supabase
      .from("orders")
      .select("total, status")
      .gte("created_at", todayISO),
    supabase
      .from("orders")
      .select("total, status, created_at")
      .order("created_at", { ascending: false })
      .limit(100),
    supabase.from("inventory").select(),
  ]);

  const todayOrders = ordersToday.data || [];
  const revenueToday = todayOrders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + Number(o.total), 0);

  const lowStockItems = (lowStock.data || []).filter(
    (i) => i.quantity <= i.reorder_level
  );

  return {
    revenueToday,
    ordersToday: todayOrders.length,
    lowStockCount: lowStockItems.length,
    lowStockItems,
  };
}
