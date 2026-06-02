-- ============================================================
-- 003 — Sales, Production/Waste & Inventory Redesign
-- Run after 002_security_hardening.sql
-- ============================================================

-- ============================================================
-- SALES TABLE — manual sales logging by admin
-- ============================================================
CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sale_number TEXT UNIQUE,
  product_name TEXT NOT NULL,
  bottle_size TEXT NOT NULL,
  units_sold INTEGER NOT NULL CHECK (units_sold > 0),
  unit_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  customer_name TEXT,
  customer_phone TEXT,
  channel TEXT DEFAULT 'walkin' CHECK (channel IN ('walkin', 'whatsapp', 'online', 'wholesale')),
  payment_method TEXT CHECK (payment_method IN ('cash', 'momo', 'transfer', 'paystack')),
  notes TEXT,
  sold_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sales_sold_at ON sales(sold_at DESC);
CREATE INDEX idx_sales_product ON sales(product_name);

-- Auto sale number: SALE-0001, SALE-0002...
CREATE SEQUENCE sale_seq START 1;

CREATE OR REPLACE FUNCTION generate_sale_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.sale_number = 'SALE-' || LPAD(nextval('sale_seq')::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sale_number
  BEFORE INSERT ON sales FOR EACH ROW
  WHEN (NEW.sale_number IS NULL)
  EXECUTE FUNCTION generate_sale_number();

-- RLS
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access to sales"
  ON sales FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- PRODUCTION BATCHES — add bottle_size, units_wasted columns
-- Batch number changes to format like MON20260522
-- ============================================================
ALTER TABLE production_batches
  ADD COLUMN IF NOT EXISTS bottle_size TEXT,
  ADD COLUMN IF NOT EXISTS units_wasted INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS waste_reason TEXT;

-- ============================================================
-- INVENTORY — add condition, notes columns
-- ============================================================
ALTER TABLE inventory
  ADD COLUMN IF NOT EXISTS condition TEXT DEFAULT 'good' CHECK (condition IN ('good', 'fair', 'poor', 'expired')),
  ADD COLUMN IF NOT EXISTS notes TEXT;
