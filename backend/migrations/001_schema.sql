-- ShopScale Database Schema Migration
-- Idempotent: safe to run multiple times (RSK-12)

-- 1. Users
CREATE TABLE IF NOT EXISTS users (
  user_id    SERIAL PRIMARY KEY,
  email      VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name  VARCHAR(100) NOT NULL,
  role       VARCHAR(20) NOT NULL DEFAULT 'customer'
             CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Categories
CREATE TABLE IF NOT EXISTS categories (
  category_id SERIAL PRIMARY KEY,
  name        VARCHAR(100) UNIQUE NOT NULL,
  slug        VARCHAR(100) UNIQUE NOT NULL
);

-- 3. Products
CREATE TABLE IF NOT EXISTS products (
  product_id     SERIAL PRIMARY KEY,
  name           VARCHAR(255) NOT NULL,
  description    TEXT,
  category_id    INTEGER REFERENCES categories(category_id) ON DELETE SET NULL,
  price          DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  image_url      VARCHAR(500),
  stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  is_active      BOOLEAN NOT NULL DEFAULT true,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active   ON products(is_active);

-- 4. Carts
CREATE TABLE IF NOT EXISTS carts (
  cart_id    SERIAL PRIMARY KEY,
  user_id    INTEGER UNIQUE NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Cart Items
CREATE TABLE IF NOT EXISTS cart_items (
  item_id    SERIAL PRIMARY KEY,
  cart_id    INTEGER NOT NULL REFERENCES carts(cart_id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
  quantity   INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  UNIQUE(cart_id, product_id)
);

-- 6. Orders
CREATE TABLE IF NOT EXISTS orders (
  order_id         SERIAL PRIMARY KEY,
  user_id          INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  status           VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                   CHECK (status IN ('PENDING','PAID','PROCESSING','SHIPPED','DELIVERED','CANCELLED')),
  total_amount     DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
  shipping_address TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user   ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- 7. Order Items
CREATE TABLE IF NOT EXISTS order_items (
  item_id       SERIAL PRIMARY KEY,
  order_id      INTEGER NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
  product_id    INTEGER NOT NULL REFERENCES products(product_id) ON DELETE SET NULL,
  product_name  VARCHAR(255) NOT NULL,
  product_price DECIMAL(10,2) NOT NULL,
  quantity      INTEGER NOT NULL CHECK (quantity > 0)
);

-- 8. Payments
CREATE TABLE IF NOT EXISTS payments (
  payment_id     SERIAL PRIMARY KEY,
  order_id       INTEGER UNIQUE NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
  status         VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                 CHECK (status IN ('PENDING','SUCCESS','FAILED')),
  transaction_id VARCHAR(100),
  failure_reason TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
