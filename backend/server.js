const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: '../.env' });

const pool = require('./db');
const authRoutes = require('./routes/auth');
const aiRoutes = require('./routes/ai');
const createCrudRouter = require('./routes/crud');
const authenticateToken = require('./middleware/auth');

const app = express();
const PORT = process.env.BACKEND_PORT || 4000;

app.use(cors());
app.use(express.json());

// Auth routes (public)
app.use('/api/auth', authRoutes);

// AI routes
app.use('/api/ai', aiRoutes);

// CRUD routes for all features
app.use('/api/recipes', createCrudRouter('recipes',
  ['name','category','description','steps','yield_amount','yield_unit','cost_per_unit','prep_time_minutes','bake_time_minutes','bake_temp_f','is_active'], 'name'));

app.use('/api/recipe-ingredients', createCrudRouter('recipe_ingredients',
  ['recipe_id','ingredient_name','quantity','unit','cost'], 'ingredient_name'));

app.use('/api/production-schedules', createCrudRouter('production_schedules',
  ['recipe_id','scheduled_date','shift','batch_count','status','assigned_to','notes'], 'assigned_to'));

app.use('/api/ingredient-inventory', createCrudRouter('ingredient_inventory',
  ['name','category','current_stock','unit','par_level','cost_per_unit','supplier','last_ordered','expiry_date','storage_location'], 'name'));

app.use('/api/batch-tracking', createCrudRouter('batch_tracking',
  ['recipe_id','batch_number','batch_date','quantity','unit','status','started_at','completed_at','temperature','notes'], 'batch_number'));

app.use('/api/oven-schedules', createCrudRouter('oven_schedules',
  ['oven_number','recipe_id','batch_id','scheduled_date','start_time','end_time','temperature_f','status','notes'], 'notes'));

app.use('/api/wholesale-orders', createCrudRouter('wholesale_orders',
  ['customer_name','contact_email','contact_phone','order_date','delivery_date','items','total_amount','status','payment_status','notes'], 'customer_name'));

app.use('/api/custom-cake-orders', createCrudRouter('custom_cake_orders',
  ['customer_name','customer_phone','customer_email','cake_size','cake_shape','cake_flavor','filling_flavor','frosting_type','design_description','color_scheme','inscription','delivery_date','delivery_time','delivery_address','price','deposit_paid','status','allergen_notes'], 'customer_name'));

app.use('/api/allergen-tracking', createCrudRouter('allergen_tracking',
  ['recipe_id','allergen_name','severity','notes'], 'allergen_name'));

app.use('/api/suppliers', createCrudRouter('suppliers',
  ['name','contact_person','email','phone','address','lead_time_days','payment_terms','category','rating','is_active'], 'name'));

app.use('/api/supplier-orders', createCrudRouter('supplier_orders',
  ['supplier_id','order_date','expected_delivery','items','total_cost','status','received_date','notes'], 'items'));

app.use('/api/waste-tracking', createCrudRouter('waste_tracking',
  ['item_name','category','quantity','unit','reason','cost_impact','waste_date','recorded_by','notes'], 'item_name'));

app.use('/api/temperature-logs', createCrudRouter('temperature_logs',
  ['equipment_name','location','temperature_f','acceptable_range','is_in_range','recorded_at','recorded_by','corrective_action'], 'equipment_name'));

app.use('/api/staff-schedules', createCrudRouter('staff_schedules',
  ['staff_name','role','shift_date','start_time','end_time','station','status','notes'], 'staff_name'));

app.use('/api/equipment-maintenance', createCrudRouter('equipment_maintenance',
  ['equipment_name','equipment_type','last_maintenance','next_maintenance','maintenance_type','performed_by','status','cost','notes'], 'equipment_name'));

app.use('/api/daily-reports', createCrudRouter('daily_reports',
  ['report_date','total_items_produced','total_revenue','total_waste_cost','total_orders','custom_orders','wholesale_orders','staff_count','highlights','issues'], 'highlights'));

app.use('/api/delivery-routes', createCrudRouter('delivery_routes',
  ['route_name','driver_name','vehicle','delivery_date','start_time','estimated_end_time','stops','total_distance_miles','status','notes'], 'route_name'));

// Recipe ingredients by recipe
app.get('/api/recipes/:id/ingredients', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM recipe_ingredients WHERE recipe_id = $1', [req.params.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Recipe allergens
app.get('/api/recipes/:id/allergens', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM allergen_tracking WHERE recipe_id = $1', [req.params.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Dashboard stats
app.get('/api/dashboard', async (req, res) => {
  try {
    const [recipes, schedules, orders, cakes, inventory, waste, batches] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM recipes'),
      pool.query("SELECT COUNT(*) FROM production_schedules WHERE scheduled_date = CURRENT_DATE"),
      pool.query("SELECT COUNT(*) FROM wholesale_orders WHERE status NOT IN ('delivered','cancelled')"),
      pool.query("SELECT COUNT(*) FROM custom_cake_orders WHERE status NOT IN ('delivered','cancelled')"),
      pool.query('SELECT COUNT(*) FROM ingredient_inventory WHERE current_stock <= par_level'),
      pool.query('SELECT COALESCE(SUM(cost_impact),0) as total FROM waste_tracking WHERE waste_date >= CURRENT_DATE - 7'),
      pool.query("SELECT COUNT(*) FROM batch_tracking WHERE status NOT IN ('completed')"),
    ]);
    res.json({
      totalRecipes: parseInt(recipes.rows[0].count),
      todaySchedules: parseInt(schedules.rows[0].count),
      activeOrders: parseInt(orders.rows[0].count),
      activeCakeOrders: parseInt(cakes.rows[0].count),
      lowStockItems: parseInt(inventory.rows[0].count),
      weeklyWasteCost: parseFloat(waste.rows[0].total),
      activeBatches: parseInt(batches.rows[0].count),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🧁 Bakery Backend running on port ${PORT}`);
});
