-- ============================================================
-- SECURITY HARDENING — Run after 001_initial_schema.sql
-- ============================================================

-- Drop overly permissive anon INSERT policies
DROP POLICY IF EXISTS "Anyone can place orders" ON orders;
DROP POLICY IF EXISTS "Anyone can insert order items" ON order_items;
DROP POLICY IF EXISTS "Anyone can submit inquiries" ON inquiries;
DROP POLICY IF EXISTS "Anyone can create customers" ON customers;

-- Re-create with tighter constraints

-- Orders: anon can only INSERT with status 'pending' and payment_status 'unpaid'
CREATE POLICY "Anon can place pending orders"
  ON orders FOR INSERT
  WITH CHECK (
    status = 'pending'
    AND payment_status = 'unpaid'
    AND channel IN ('online', 'whatsapp')
    AND total >= 0
    AND total <= 50000
    AND customer_name IS NOT NULL
    AND customer_phone IS NOT NULL
    AND LENGTH(customer_name) BETWEEN 2 AND 100
    AND LENGTH(customer_phone) BETWEEN 10 AND 15
  );

-- Order items: anon can only insert items for orders they just created
CREATE POLICY "Anon can insert order items for pending orders"
  ON order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.status = 'pending'
      AND orders.created_at > NOW() - INTERVAL '5 minutes'
    )
    AND quantity > 0
    AND quantity <= 100
    AND unit_price >= 0
    AND unit_price <= 10000
  );

-- Inquiries: basic length/format constraints
CREATE POLICY "Anon can submit inquiries with constraints"
  ON inquiries FOR INSERT
  WITH CHECK (
    LENGTH(name) BETWEEN 2 AND 100
    AND LENGTH(phone) BETWEEN 10 AND 15
    AND (message IS NULL OR LENGTH(message) <= 1000)
    AND status = 'new'
  );

-- Customers: only allow insert with basic validation
CREATE POLICY "Anon can create customers with constraints"
  ON customers FOR INSERT
  WITH CHECK (
    LENGTH(name) BETWEEN 2 AND 100
    AND LENGTH(phone) BETWEEN 10 AND 15
    AND total_orders = 0
    AND total_spent = 0
  );

-- Prevent anon from reading orders (they shouldn't see other people's orders)
CREATE POLICY "Anon cannot read orders"
  ON orders FOR SELECT
  USING (auth.role() = 'authenticated');

-- Prevent anon from reading customers
CREATE POLICY "Anon cannot read customers"
  ON customers FOR SELECT
  USING (auth.role() = 'authenticated');

-- Prevent anon from reading inquiries
CREATE POLICY "Anon cannot read inquiries"
  ON inquiries FOR SELECT
  USING (auth.role() = 'authenticated');

-- Prevent anon from updating or deleting anything
-- (These are already blocked by default RLS when no UPDATE/DELETE policy exists)

-- ============================================================
-- ADDITIONAL: Add pg_net extension for webhook notifications (optional)
-- ============================================================
-- CREATE EXTENSION IF NOT EXISTS pg_net;

-- ============================================================
-- AUDIT LOG — Track who did what in admin
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_log_created ON audit_log(created_at DESC);
CREATE INDEX idx_audit_log_user ON audit_log(user_id);
CREATE INDEX idx_audit_log_table ON audit_log(table_name);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Only authenticated can access audit log"
  ON audit_log FOR ALL USING (auth.role() = 'authenticated');
