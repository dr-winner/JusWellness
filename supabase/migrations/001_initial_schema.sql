-- ============================================================
-- JUS WELLNESS — Supabase Database Schema
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PRODUCTS
-- ============================================================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('juice', 'coconut', 'mashke', 'shot')),
  ingredients TEXT[] DEFAULT '{}',
  benefits TEXT[] DEFAULT '{}',
  image_url TEXT,
  badge TEXT,
  in_stock BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product sizes (each product can have multiple size/price combos)
CREATE TABLE product_sizes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  ml INTEGER NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  sort_order INTEGER DEFAULT 0
);

-- ============================================================
-- CUSTOMERS
-- ============================================================
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  email TEXT,
  address TEXT,
  area TEXT,
  notes TEXT,
  total_orders INTEGER DEFAULT 0,
  total_spent NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ORDERS
-- ============================================================
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  delivery_address TEXT,
  channel TEXT NOT NULL DEFAULT 'online' CHECK (channel IN ('online', 'whatsapp', 'walkin', 'wholesale')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'delivered', 'cancelled')),
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  delivery_fee NUMERIC(10,2) DEFAULT 0,
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  payment_method TEXT CHECK (payment_method IN ('paystack', 'momo', 'cash', 'transfer')),
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded')),
  payment_reference TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order line items
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  product_name TEXT NOT NULL,
  size_label TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL,
  total_price NUMERIC(10,2) NOT NULL
);

-- ============================================================
-- INVENTORY (Raw Materials & Packaging)
-- ============================================================
CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('fruit', 'vegetable', 'spice', 'packaging', 'other')),
  unit TEXT NOT NULL,
  quantity NUMERIC(10,2) NOT NULL DEFAULT 0,
  cost_per_unit NUMERIC(10,2) NOT NULL DEFAULT 0,
  reorder_level NUMERIC(10,2) NOT NULL DEFAULT 0,
  supplier TEXT,
  last_restocked TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inventory restock log
CREATE TABLE inventory_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inventory_id UUID REFERENCES inventory(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('restock', 'used', 'adjustment', 'waste')),
  quantity NUMERIC(10,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PRODUCTION
-- ============================================================
CREATE TABLE production_batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_number TEXT UNIQUE NOT NULL,
  product_id UUID REFERENCES products(id),
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'in-progress' CHECK (status IN ('in-progress', 'completed', 'discarded')),
  notes TEXT,
  produced_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ingredients consumed per batch
CREATE TABLE batch_ingredients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id UUID REFERENCES production_batches(id) ON DELETE CASCADE,
  inventory_id UUID REFERENCES inventory(id),
  ingredient_name TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  unit TEXT NOT NULL
);

-- ============================================================
-- INQUIRIES (from contact form)
-- ============================================================
CREATE TABLE inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  order_type TEXT,
  message TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'resolved')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_inventory_category ON inventory(category);
CREATE INDEX idx_inventory_low_stock ON inventory(quantity, reorder_level);
CREATE INDEX idx_production_status ON production_batches(status);
CREATE INDEX idx_production_date ON production_batches(produced_at DESC);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_customers_phone ON customers(phone);

-- ============================================================
-- AUTO-UPDATE timestamps
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_products_updated
  BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_orders_updated
  BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_inventory_updated
  BEFORE UPDATE ON inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- AUTO-INCREMENT order number (JUS-001, JUS-002, etc.)
-- ============================================================
CREATE SEQUENCE order_seq START 1;

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number = 'JUS-' || LPAD(nextval('order_seq')::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_order_number
  BEFORE INSERT ON orders FOR EACH ROW
  WHEN (NEW.order_number IS NULL)
  EXECUTE FUNCTION generate_order_number();

-- ============================================================
-- AUTO-INCREMENT batch number (BATCH-001, etc.)
-- ============================================================
CREATE SEQUENCE batch_seq START 1;

CREATE OR REPLACE FUNCTION generate_batch_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.batch_number = 'BATCH-' || LPAD(nextval('batch_seq')::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_batch_number
  BEFORE INSERT ON production_batches FOR EACH ROW
  WHEN (NEW.batch_number IS NULL)
  EXECUTE FUNCTION generate_batch_number();

-- ============================================================
-- DEDUCT INVENTORY on batch completion
-- ============================================================
CREATE OR REPLACE FUNCTION deduct_inventory_on_batch_complete()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE inventory i
    SET quantity = i.quantity - bi.amount
    FROM batch_ingredients bi
    WHERE bi.batch_id = NEW.id AND bi.inventory_id = i.id;

    -- Log the deductions
    INSERT INTO inventory_logs (inventory_id, type, quantity, notes)
    SELECT bi.inventory_id, 'used', bi.amount, 'Used in ' || NEW.batch_number
    FROM batch_ingredients bi
    WHERE bi.batch_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_deduct_inventory
  AFTER UPDATE ON production_batches FOR EACH ROW
  EXECUTE FUNCTION deduct_inventory_on_batch_complete();

-- ============================================================
-- UPDATE CUSTOMER STATS on order delivery
-- ============================================================
CREATE OR REPLACE FUNCTION update_customer_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'delivered' AND OLD.status != 'delivered' AND NEW.customer_id IS NOT NULL THEN
    UPDATE customers
    SET total_orders = total_orders + 1,
        total_spent = total_spent + NEW.total
    WHERE id = NEW.customer_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_customer_stats
  AFTER UPDATE ON orders FOR EACH ROW
  EXECUTE FUNCTION update_customer_stats();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Public can read products; everything else requires auth
-- ============================================================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE batch_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- Public read access to products
CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT USING (true);
CREATE POLICY "Product sizes are viewable by everyone"
  ON product_sizes FOR SELECT USING (true);

-- Authenticated (admin) full access
CREATE POLICY "Admin full access to products"
  ON products FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access to product_sizes"
  ON product_sizes FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access to orders"
  ON orders FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access to order_items"
  ON order_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access to inventory"
  ON inventory FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access to inventory_logs"
  ON inventory_logs FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access to production_batches"
  ON production_batches FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access to batch_ingredients"
  ON batch_ingredients FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access to customers"
  ON customers FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access to inquiries"
  ON inquiries FOR ALL USING (auth.role() = 'authenticated');

-- Allow anonymous users to insert orders and inquiries (for the storefront)
CREATE POLICY "Anyone can place orders"
  ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can insert order items"
  ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can submit inquiries"
  ON inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can create customers"
  ON customers FOR INSERT WITH CHECK (true);

-- ============================================================
-- SEED DATA — Products
-- ============================================================
INSERT INTO products (slug, name, description, category, ingredients, benefits, badge, sort_order) VALUES
('better-off-red', 'Better Off Red', 'A bold, earthy blend that gets your blood pumping. Beetroot power meets tropical zing.', 'juice', ARRAY['Beetroot', 'Watermelon', 'Lemon', 'Ginger', 'Pineapple'], ARRAY['Iron Boost', 'Heart Health', 'Energy'], 'Best Seller', 1),
('takes-two-to-mango', 'Takes Two to Mango', 'Pure mango goodness — sweet, thick, and irresistible. No mix, no dilution, just mango.', 'juice', ARRAY['Mango'], ARRAY['Vitamin A', 'Antioxidants', 'Skin Glow'], NULL, 2),
('beach-body', 'Beach Body', 'Light, refreshing, and hydrating. The perfect post-workout cool-down.', 'juice', ARRAY['Watermelon', 'Mint'], ARRAY['Hydration', 'Cooling', 'Low Calorie'], 'Refreshing', 3),
('sun-kissed', 'Sun Kissed', 'Golden tropical vibes with a carrot kick. Tastes like sunshine in a bottle.', 'juice', ARRAY['Pineapple', 'Carrot'], ARRAY['Vitamin A', 'Vision Health', 'Immune Support'], NULL, 4),
('lil-miss-sunshine', 'Lil Miss Sunshine', 'Classic orange juice, freshly squeezed. Simple, pure, and packed with vitamin C.', 'juice', ARRAY['Orange'], ARRAY['Vitamin C', 'Immune Boost', 'Energy'], NULL, 5),
('take-me-higher', 'Take Me Higher', 'A rich, creamy Ghanaian superfood blend. Tiger nut meets dates and prekese for deep nutrition.', 'juice', ARRAY['Tiger Nut', 'Dates', 'Prekese', 'Ginger'], ARRAY['Aphrodisiac', 'Energy', 'Gut Health'], 'Local Fave', 6),
('heart-of-gold', 'Heart of Gold', 'Citrus meets spice — orange and pineapple lifted by a ginger punch.', 'juice', ARRAY['Orange', 'Pineapple', 'Ginger'], ARRAY['Vitamin C', 'Digestion', 'Anti-inflammatory'], NULL, 7),
('ms-fit', 'Ms Fit', 'Light and clean — pineapple sweetness balanced by cool cucumber and mint. Your gym buddy.', 'juice', ARRAY['Pineapple', 'Cucumber', 'Mint'], ARRAY['Low Calorie', 'Hydration', 'Detox'], 'Fitness Pick', 8),
('lovers-rock', 'Lover''s Rock', 'Creamy, warming, and indulgent. Tiger nuts and coconut with a ginger hug. A natural aphrodisiac.', 'juice', ARRAY['Tiger Nuts', 'Dates', 'Coconut', 'Ginger'], ARRAY['Aphrodisiac', 'Energy', 'Protein'], 'Popular', 9),
('ginga-yourself', 'Ginga Yourself', 'Pineapple sweetness with a fiery ginger kick. Wakes you up better than coffee.', 'juice', ARRAY['Pineapple', 'Ginger'], ARRAY['Anti-inflammatory', 'Metabolism', 'Digestion'], NULL, 10),
('citrus-kick', 'Citrus Kick', 'A zesty powerhouse — orange, lemon, carrot, and ginger for maximum immunity.', 'juice', ARRAY['Orange', 'Lemon', 'Carrot', 'Ginger'], ARRAY['Immune Boost', 'Vitamin C', 'Anti-inflammatory'], NULL, 11),
('the-joy', 'The Joy', 'Tropical euphoria — pineapple meets passion fruit for a tangy-sweet explosion.', 'juice', ARRAY['Pineapple', 'Passion Fruit'], ARRAY['Mood Boost', 'Vitamin C', 'Antioxidants'], 'New', 12),
('rise-and-shine', 'Rise & Shine', 'Start your morning right — pineapple, ginger, and coconut. Energizing and tropical.', 'juice', ARRAY['Pineapple', 'Ginger', 'Coconut'], ARRAY['Energy', 'Hydration', 'Metabolism'], NULL, 13),
('pineapple-of-my-eye', 'Pineapple of My Eye', 'Pure pineapple. Nothing else. Just the queen of tropical fruits, freshly pressed.', 'juice', ARRAY['Pineapple'], ARRAY['Bromelain', 'Digestion', 'Vitamin C'], NULL, 14),
('real-good', 'Real Good', 'Pineapple, ginger, and beetroot — a triple threat for energy and detox.', 'juice', ARRAY['Pineapple', 'Ginger', 'Beetroot'], ARRAY['Detox', 'Iron Boost', 'Energy'], NULL, 15),
('somethings-brewing', 'Something''s Brewing?', 'Our mystery blend — a surprise flavour that changes weekly. Ask us what''s in it today!', 'juice', ARRAY['Mystery Blend'], ARRAY['Surprise', 'Limited Edition'], 'Mystery', 16),
('coconut-water', 'Coconut Water', 'Pure coconut water — no additions, no sugar. Nature''s perfect electrolyte drink.', 'coconut', ARRAY['Coconut Water'], ARRAY['Hydration', 'Electrolytes', 'Natural'], NULL, 17),
('coconut-chia', 'Coconut with Chia Seeds', 'Hydrating coconut water supercharged with chia seeds for extra fibre and omega-3.', 'coconut', ARRAY['Coconut Water', 'Chia Seeds'], ARRAY['Omega-3', 'Fibre', 'Hydration'], 'Superfood', 18),
('coconut-mint-lime', 'Coconut with Mint & Lime', 'A refreshing twist on coconut water — mint and lime take it to another level.', 'coconut', ARRAY['Coconut Water', 'Mint', 'Lime'], ARRAY['Cooling', 'Hydration', 'Digestion'], NULL, 19),
('bougie-mashke', 'Bougie Mashke', 'Our signature blended drink — thick, creamy, and packed with flavour. A premium treat.', 'mashke', ARRAY['Premium Blend'], ARRAY['Filling', 'Energy', 'Indulgent'], 'Premium', 20),
('ginger-shot', 'Ginger Shot', 'A fiery immune-boosting shot. Ginger, turmeric, black pepper, orange, and lemon — one sip, maximum impact.', 'shot', ARRAY['Ginger', 'Turmeric', 'Black Pepper', 'Orange', 'Lemon'], ARRAY['Immune Boost', 'Anti-inflammatory', 'Metabolism'], 'Popular', 21),
('de-bloat-shot', 'De-bloat Shot', 'Feeling heavy? This shot flattens and soothes. Celery, cucumber, ginger, and lemon.', 'shot', ARRAY['Celery', 'Cucumber', 'Ginger', 'Lemon'], ARRAY['De-bloat', 'Digestion', 'Gut Health'], NULL, 22),
('gut-health-shot', 'Gut Health Shot', 'Heal your gut from the inside. Apple, ginger, lemon, and honey for a happy tummy.', 'shot', ARRAY['Apple', 'Ginger', 'Lemon', 'Honey'], ARRAY['Gut Health', 'Probiotics', 'Soothing'], NULL, 23);

-- Juice sizes (all 16 juices get the same 4 sizes)
INSERT INTO product_sizes (product_id, label, ml, price, sort_order)
SELECT p.id, s.label, s.ml, s.price, s.sort_order
FROM products p
CROSS JOIN (VALUES
  ('250ml', 250, 13, 1),
  ('350ml', 350, 20, 2),
  ('500ml', 500, 25, 3),
  ('5 Litre', 5000, 280, 4)
) AS s(label, ml, price, sort_order)
WHERE p.category = 'juice';

-- Coconut Water (500ml only)
INSERT INTO product_sizes (product_id, label, ml, price, sort_order)
SELECT id, '500ml', 500, 25, 1 FROM products WHERE slug = 'coconut-water';

-- Coconut Chia & Mint Lime (3 sizes)
INSERT INTO product_sizes (product_id, label, ml, price, sort_order)
SELECT p.id, s.label, s.ml, s.price, s.sort_order
FROM products p
CROSS JOIN (VALUES
  ('250ml', 250, 15, 1),
  ('500ml', 500, 30, 2),
  ('5 Litre', 5000, 280, 3)
) AS s(label, ml, price, sort_order)
WHERE p.slug IN ('coconut-chia', 'coconut-mint-lime');

-- Bougie Mashke (500ml only)
INSERT INTO product_sizes (product_id, label, ml, price, sort_order)
SELECT id, '500ml', 500, 25, 1 FROM products WHERE slug = 'bougie-mashke';

-- Shots (60ml)
INSERT INTO product_sizes (product_id, label, ml, price, sort_order)
SELECT p.id, '60ml', 60, 15, 1
FROM products p WHERE p.category = 'shot';

-- ============================================================
-- SEED DATA — Inventory
-- ============================================================
INSERT INTO inventory (name, category, unit, quantity, cost_per_unit, reorder_level, supplier, last_restocked) VALUES
('Beetroot', 'vegetable', 'kg', 8, 12, 5, 'Madina Market', NOW()),
('Watermelon', 'fruit', 'kg', 25, 5, 10, 'Madina Market', NOW()),
('Pineapple', 'fruit', 'pcs', 15, 8, 8, 'Madina Market', NOW()),
('Ginger', 'spice', 'kg', 3, 20, 3, 'Madina Market', NOW()),
('Mango', 'fruit', 'kg', 12, 15, 10, 'Local Farm', NOW()),
('Tiger Nuts', 'other', 'kg', 5, 35, 5, 'Madina Market', NOW()),
('Dates', 'fruit', 'kg', 4, 40, 3, 'Spice Trader', NOW()),
('Orange', 'fruit', 'pcs', 30, 3, 20, 'Madina Market', NOW()),
('Lemon', 'fruit', 'pcs', 25, 2, 15, 'Madina Market', NOW()),
('Turmeric', 'spice', 'kg', 3, 30, 2, 'Spice Trader', NOW()),
('Coconut Water', 'other', 'litres', 20, 10, 10, 'Local Farm', NOW()),
('Prekese', 'spice', 'kg', 1.5, 50, 1, 'Spice Trader', NOW()),
('Cucumber', 'vegetable', 'kg', 10, 8, 5, 'Madina Market', NOW()),
('Mint', 'vegetable', 'kg', 2, 15, 1, 'Madina Market', NOW()),
('Carrot', 'vegetable', 'kg', 8, 10, 5, 'Madina Market', NOW()),
('Passion Fruit', 'fruit', 'kg', 5, 25, 3, 'Local Farm', NOW()),
('Chia Seeds', 'other', 'kg', 3, 60, 2, 'Health Store', NOW()),
('Celery', 'vegetable', 'kg', 4, 18, 3, 'Accra Mall Fresh', NOW()),
('Apple', 'fruit', 'pcs', 20, 5, 10, 'Accra Mall Fresh', NOW()),
('Honey', 'other', 'litres', 2, 45, 1, 'Local Beekeeper', NOW()),
('Black Pepper', 'spice', 'kg', 0.5, 80, 0.3, 'Spice Trader', NOW()),
('Glass Bottles (250ml)', 'packaging', 'pcs', 80, 2.5, 50, 'PackGH', NOW()),
('Glass Bottles (350ml)', 'packaging', 'pcs', 60, 3, 50, 'PackGH', NOW()),
('Glass Bottles (500ml)', 'packaging', 'pcs', 50, 3.5, 50, 'PackGH', NOW()),
('Bottle Caps', 'packaging', 'pcs', 200, 0.5, 100, 'PackGH', NOW()),
('Labels', 'packaging', 'pcs', 150, 1, 50, 'PrintMax GH', NOW()),
('5L Containers', 'packaging', 'pcs', 10, 15, 5, 'PackGH', NOW());
