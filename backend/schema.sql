-- Bakery Production Manager Database Schema

DROP TABLE IF EXISTS delivery_routes CASCADE;
DROP TABLE IF EXISTS equipment_maintenance CASCADE;
DROP TABLE IF EXISTS staff_schedules CASCADE;
DROP TABLE IF EXISTS temperature_logs CASCADE;
DROP TABLE IF EXISTS waste_tracking CASCADE;
DROP TABLE IF EXISTS supplier_orders CASCADE;
DROP TABLE IF EXISTS suppliers CASCADE;
DROP TABLE IF EXISTS allergen_tracking CASCADE;
DROP TABLE IF EXISTS custom_cake_orders CASCADE;
DROP TABLE IF EXISTS wholesale_orders CASCADE;
DROP TABLE IF EXISTS oven_schedules CASCADE;
DROP TABLE IF EXISTS batch_tracking CASCADE;
DROP TABLE IF EXISTS ingredient_inventory CASCADE;
DROP TABLE IF EXISTS production_schedules CASCADE;
DROP TABLE IF EXISTS recipe_ingredients CASCADE;
DROP TABLE IF EXISTS recipes CASCADE;
DROP TABLE IF EXISTS daily_reports CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'staff',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Recipes
CREATE TABLE recipes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  description TEXT,
  steps TEXT,
  yield_amount DECIMAL(10,2),
  yield_unit VARCHAR(50),
  cost_per_unit DECIMAL(10,2),
  prep_time_minutes INT,
  bake_time_minutes INT,
  bake_temp_f INT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Recipe Ingredients
CREATE TABLE recipe_ingredients (
  id SERIAL PRIMARY KEY,
  recipe_id INT REFERENCES recipes(id) ON DELETE CASCADE,
  ingredient_name VARCHAR(255) NOT NULL,
  quantity DECIMAL(10,3),
  unit VARCHAR(50),
  cost DECIMAL(10,2)
);

-- Production Schedules
CREATE TABLE production_schedules (
  id SERIAL PRIMARY KEY,
  recipe_id INT REFERENCES recipes(id),
  scheduled_date DATE NOT NULL,
  shift VARCHAR(50),
  batch_count INT,
  status VARCHAR(50) DEFAULT 'planned',
  assigned_to VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Ingredient Inventory
CREATE TABLE ingredient_inventory (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  current_stock DECIMAL(10,2),
  unit VARCHAR(50),
  par_level DECIMAL(10,2),
  cost_per_unit DECIMAL(10,2),
  supplier VARCHAR(255),
  last_ordered DATE,
  expiry_date DATE,
  storage_location VARCHAR(100)
);

-- Batch Tracking
CREATE TABLE batch_tracking (
  id SERIAL PRIMARY KEY,
  recipe_id INT REFERENCES recipes(id),
  batch_number VARCHAR(100) UNIQUE NOT NULL,
  batch_date DATE NOT NULL,
  quantity DECIMAL(10,2),
  unit VARCHAR(50),
  status VARCHAR(50) DEFAULT 'mixing',
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  temperature DECIMAL(5,1),
  notes TEXT
);

-- Oven Schedules
CREATE TABLE oven_schedules (
  id SERIAL PRIMARY KEY,
  oven_number INT NOT NULL,
  recipe_id INT REFERENCES recipes(id),
  batch_id INT REFERENCES batch_tracking(id),
  scheduled_date DATE,
  start_time TIME,
  end_time TIME,
  temperature_f INT,
  status VARCHAR(50) DEFAULT 'scheduled',
  notes TEXT
);

-- Wholesale Orders
CREATE TABLE wholesale_orders (
  id SERIAL PRIMARY KEY,
  customer_name VARCHAR(255) NOT NULL,
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  order_date DATE,
  delivery_date DATE,
  items TEXT,
  total_amount DECIMAL(10,2),
  status VARCHAR(50) DEFAULT 'pending',
  payment_status VARCHAR(50) DEFAULT 'unpaid',
  notes TEXT
);

-- Custom Cake Orders
CREATE TABLE custom_cake_orders (
  id SERIAL PRIMARY KEY,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50),
  customer_email VARCHAR(255),
  cake_size VARCHAR(50),
  cake_shape VARCHAR(50),
  cake_flavor VARCHAR(100),
  filling_flavor VARCHAR(100),
  frosting_type VARCHAR(100),
  design_description TEXT,
  color_scheme VARCHAR(255),
  inscription TEXT,
  delivery_date DATE,
  delivery_time TIME,
  delivery_address TEXT,
  price DECIMAL(10,2),
  deposit_paid DECIMAL(10,2),
  status VARCHAR(50) DEFAULT 'pending',
  allergen_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Allergen Tracking
CREATE TABLE allergen_tracking (
  id SERIAL PRIMARY KEY,
  recipe_id INT REFERENCES recipes(id),
  allergen_name VARCHAR(100) NOT NULL,
  severity VARCHAR(50),
  notes TEXT
);

-- Suppliers
CREATE TABLE suppliers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  lead_time_days INT,
  payment_terms VARCHAR(100),
  category VARCHAR(100),
  rating INT,
  is_active BOOLEAN DEFAULT true
);

-- Supplier Orders
CREATE TABLE supplier_orders (
  id SERIAL PRIMARY KEY,
  supplier_id INT REFERENCES suppliers(id),
  order_date DATE,
  expected_delivery DATE,
  items TEXT,
  total_cost DECIMAL(10,2),
  status VARCHAR(50) DEFAULT 'ordered',
  received_date DATE,
  notes TEXT
);

-- Waste Tracking
CREATE TABLE waste_tracking (
  id SERIAL PRIMARY KEY,
  item_name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  quantity DECIMAL(10,2),
  unit VARCHAR(50),
  reason VARCHAR(100),
  cost_impact DECIMAL(10,2),
  waste_date DATE,
  recorded_by VARCHAR(255),
  notes TEXT
);

-- Temperature Logs
CREATE TABLE temperature_logs (
  id SERIAL PRIMARY KEY,
  equipment_name VARCHAR(255) NOT NULL,
  location VARCHAR(100),
  temperature_f DECIMAL(5,1),
  acceptable_range VARCHAR(50),
  is_in_range BOOLEAN,
  recorded_at TIMESTAMP DEFAULT NOW(),
  recorded_by VARCHAR(255),
  corrective_action TEXT
);

-- Staff Schedules
CREATE TABLE staff_schedules (
  id SERIAL PRIMARY KEY,
  staff_name VARCHAR(255) NOT NULL,
  role VARCHAR(100),
  shift_date DATE,
  start_time TIME,
  end_time TIME,
  station VARCHAR(100),
  status VARCHAR(50) DEFAULT 'scheduled',
  notes TEXT
);

-- Equipment Maintenance
CREATE TABLE equipment_maintenance (
  id SERIAL PRIMARY KEY,
  equipment_name VARCHAR(255) NOT NULL,
  equipment_type VARCHAR(100),
  last_maintenance DATE,
  next_maintenance DATE,
  maintenance_type VARCHAR(100),
  performed_by VARCHAR(255),
  status VARCHAR(50) DEFAULT 'operational',
  cost DECIMAL(10,2),
  notes TEXT
);

-- Daily Reports
CREATE TABLE daily_reports (
  id SERIAL PRIMARY KEY,
  report_date DATE NOT NULL,
  total_items_produced INT,
  total_revenue DECIMAL(10,2),
  total_waste_cost DECIMAL(10,2),
  total_orders INT,
  custom_orders INT,
  wholesale_orders INT,
  staff_count INT,
  highlights TEXT,
  issues TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Delivery Routes
CREATE TABLE delivery_routes (
  id SERIAL PRIMARY KEY,
  route_name VARCHAR(255) NOT NULL,
  driver_name VARCHAR(255),
  vehicle VARCHAR(100),
  delivery_date DATE,
  start_time TIME,
  estimated_end_time TIME,
  stops TEXT,
  total_distance_miles DECIMAL(10,1),
  status VARCHAR(50) DEFAULT 'planned',
  notes TEXT
);
