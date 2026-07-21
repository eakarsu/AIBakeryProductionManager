const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config({ path: '../.env' });

const pool = require('./db');
const authRoutes = require('./routes/auth');
const aiRoutes = require('./routes/ai');
const createCrudRouter = require('./routes/crud');
const authenticateToken = require('./middleware/auth');
const { generalRateLimiter } = require('./middleware/rateLimiter');
const PDFDocument = require('pdfkit');
const { callOpenRouter } = require('./services/openrouter');

const app = express();
const PORT = process.env.BACKEND_PORT || 4000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

// ===== SECURITY MIDDLEWARE =====
app.use(helmet());

app.use(cors({
  origin: CLIENT_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '2mb' }));

// Apply general rate limiter globally (100 req / 15 min per IP)
app.use(generalRateLimiter);

// ===== HEALTH (public) =====
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ===== AUTH ROUTES (public) =====
app.use('/api/auth', authRoutes);

// ===== AI ROUTES (auth handled inside each route) =====
// Model-generated production actions are quarantined from execution.

// ===== BATCH ALERTS (auth handled inside) =====
app.use('/api/batch-alerts', require('./routes/batchAlerts'));

// ===== INTEGRATIONS / multi-location / supply-chain agent (apply pass 5) =====
app.use('/api/integrations', require('./routes/integrations'));
app.use('/api/governed-production', require('./routes/governedProduction'));

// ===== PAGINATED LIST ENDPOINTS =====
// Registered BEFORE crud routers so they take precedence for GET /

// GET /api/recipes?page=&limit=&search=&category= (paginated)
app.get('/api/recipes', authenticateToken, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;
    const conditions = [];
    const values = [];
    let paramIndex = 1;
    if (req.query.search) {
      values.push(`%${req.query.search}%`);
      conditions.push(`name ILIKE $${paramIndex++}`);
    }
    if (req.query.category) {
      values.push(req.query.category);
      conditions.push(`category = $${paramIndex++}`);
    }
    if (req.query.is_active !== undefined) {
      values.push(req.query.is_active === 'true');
      conditions.push(`is_active = $${paramIndex++}`);
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const countResult = await pool.query(`SELECT COUNT(*) FROM recipes ${where}`, values);
    const total = parseInt(countResult.rows[0].count);
    const dataValues = [...values, limit, offset];
    const result = await pool.query(
      `SELECT * FROM recipes ${where} ORDER BY name ASC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      dataValues
    );
    res.json({ data: result.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/wholesale-orders?page=&limit=&status=&search= (paginated)
app.get('/api/wholesale-orders', authenticateToken, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;
    const conditions = [];
    const values = [];
    let paramIndex = 1;
    if (req.query.status) {
      values.push(req.query.status);
      conditions.push(`status = $${paramIndex++}`);
    }
    if (req.query.search) {
      values.push(`%${req.query.search}%`);
      conditions.push(`customer_name ILIKE $${paramIndex++}`);
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const countResult = await pool.query(`SELECT COUNT(*) FROM wholesale_orders ${where}`, values);
    const total = parseInt(countResult.rows[0].count);
    const dataValues = [...values, limit, offset];
    const result = await pool.query(
      `SELECT * FROM wholesale_orders ${where} ORDER BY order_date DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      dataValues
    );
    res.json({ data: result.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== CRUD ROUTES (all authenticated via createCrudRouter) =====
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

// Recipe ingredients by recipe (protected)
app.get('/api/recipes/:id/ingredients', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM recipe_ingredients WHERE recipe_id = $1', [req.params.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Recipe allergens (protected)
app.get('/api/recipes/:id/allergens', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM allergen_tracking WHERE recipe_id = $1', [req.params.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Dashboard stats (protected)
app.get('/api/dashboard', authenticateToken, async (req, res) => {
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

// ===== PRODUCTION ANALYTICS (protected) =====
app.get('/api/analytics/production', authenticateToken, async (req, res) => {
  try {
    const [ovenUtil, topProduced, wasteTrend, revenuePerBatch] = await Promise.all([
      pool.query(
        `SELECT
           TO_CHAR(scheduled_date, 'Day') as day_of_week,
           EXTRACT(DOW FROM scheduled_date) as day_num,
           COUNT(*) as total_slots,
           COUNT(CASE WHEN status IN ('completed','in_progress') THEN 1 END) as used_slots,
           ROUND(100.0 * COUNT(CASE WHEN status IN ('completed','in_progress') THEN 1 END) / NULLIF(COUNT(*),0), 1) as utilization_pct
         FROM oven_schedules
         WHERE scheduled_date >= NOW() - INTERVAL '30 days'
         GROUP BY TO_CHAR(scheduled_date, 'Day'), EXTRACT(DOW FROM scheduled_date)
         ORDER BY day_num ASC`
      ),
      pool.query(
        `SELECT r.name, r.category, SUM(ps.batch_count) as total_batches, COUNT(ps.id) as schedule_count
         FROM production_schedules ps
         JOIN recipes r ON ps.recipe_id = r.id
         WHERE ps.scheduled_date >= NOW() - INTERVAL '30 days'
         GROUP BY r.id, r.name, r.category
         ORDER BY total_batches DESC
         LIMIT 10`
      ),
      pool.query(
        `SELECT
           TO_CHAR(w.waste_date, 'YYYY-MM-DD') as date,
           SUM(w.cost_impact) as waste_cost,
           COALESCE(dr.total_revenue, 0) as revenue,
           CASE WHEN dr.total_revenue > 0
             THEN ROUND(100.0 * SUM(w.cost_impact) / dr.total_revenue, 2)
             ELSE 0
           END as waste_pct
         FROM waste_tracking w
         LEFT JOIN daily_reports dr ON dr.report_date = w.waste_date
         WHERE w.waste_date >= NOW() - INTERVAL '30 days'
         GROUP BY w.waste_date, dr.total_revenue
         ORDER BY w.waste_date ASC`
      ),
      pool.query(
        `SELECT
           r.category,
           COUNT(bt.id) as total_batches,
           COALESCE(AVG(r.cost_per_unit * r.yield_amount), 0) as avg_revenue_per_batch,
           COALESCE(SUM(r.cost_per_unit * r.yield_amount * bt.quantity), 0) as estimated_total_revenue
         FROM batch_tracking bt
         JOIN recipes r ON bt.recipe_id = r.id
         WHERE bt.batch_date >= NOW() - INTERVAL '30 days'
           AND bt.status = 'completed'
         GROUP BY r.category
         ORDER BY avg_revenue_per_batch DESC`
      )
    ]);

    res.json({
      oven_utilization_by_day: ovenUtil.rows,
      top_produced_items: topProduced.rows,
      waste_trend_30_days: wasteTrend.rows,
      revenue_per_batch_by_category: revenuePerBatch.rows,
      period: 'last_30_days',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== INVENTORY ALERTS (protected) =====
app.get('/api/inventory/alerts', authenticateToken, async (req, res) => {
  try {
    const alerts = await pool.query(
      `SELECT
         id, name, category, current_stock, par_level, unit, supplier,
         cost_per_unit, expiry_date, storage_location,
         (par_level - current_stock) as shortage_amount,
         CASE
           WHEN current_stock = 0 THEN 'OUT_OF_STOCK'
           WHEN current_stock <= par_level * 0.25 THEN 'CRITICAL'
           WHEN current_stock <= par_level * 0.5 THEN 'LOW'
           ELSE 'BELOW_PAR'
         END as alert_level
       FROM ingredient_inventory
       WHERE current_stock <= par_level
       ORDER BY
         CASE WHEN current_stock = 0 THEN 0
              WHEN current_stock <= par_level * 0.25 THEN 1
              WHEN current_stock <= par_level * 0.5 THEN 2
              ELSE 3
         END ASC,
         (par_level - current_stock) DESC`
    );

    const expiringItems = await pool.query(
      `SELECT id, name, current_stock, unit, expiry_date,
              (expiry_date - CURRENT_DATE) as days_until_expiry
       FROM ingredient_inventory
       WHERE expiry_date IS NOT NULL
         AND expiry_date <= CURRENT_DATE + 7
       ORDER BY expiry_date ASC`
    );

    res.json({
      low_stock_alerts: alerts.rows,
      expiring_soon: expiringItems.rows,
      summary: {
        out_of_stock: alerts.rows.filter(r => r.alert_level === 'OUT_OF_STOCK').length,
        critical: alerts.rows.filter(r => r.alert_level === 'CRITICAL').length,
        low: alerts.rows.filter(r => r.alert_level === 'LOW').length,
        below_par: alerts.rows.filter(r => r.alert_level === 'BELOW_PAR').length,
        expiring_within_7_days: expiringItems.rows.length,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/inventory/auto-order — AI-generated optimized purchase order (protected)
app.post('/api/inventory/auto-order', authenticateToken, async (req, res) => {
  try {
    const lowStock = await pool.query(
      `SELECT i.*, s.name as supplier_name, s.lead_time_days, s.payment_terms, s.contact_person, s.email as supplier_email
       FROM ingredient_inventory i
       LEFT JOIN suppliers s ON s.name = i.supplier
       WHERE i.current_stock <= i.par_level
       ORDER BY (i.par_level - i.current_stock) DESC`
    );

    const upcomingSchedules = await pool.query(
      `SELECT ps.*, r.name as recipe_name, r.category, r.yield_amount, r.yield_unit
       FROM production_schedules ps
       JOIN recipes r ON ps.recipe_id = r.id
       WHERE ps.scheduled_date BETWEEN CURRENT_DATE AND CURRENT_DATE + 14
         AND ps.status IN ('planned','in_progress')
       ORDER BY ps.scheduled_date ASC`
    );

    const recipeIds = [...new Set(upcomingSchedules.rows.map(s => s.recipe_id))];
    let ingredientRequirements = [];
    if (recipeIds.length > 0) {
      const ingredientsResult = await pool.query(
        `SELECT ri.*, r.name as recipe_name
         FROM recipe_ingredients ri
         JOIN recipes r ON ri.recipe_id = r.id
         WHERE ri.recipe_id = ANY($1)`,
        [recipeIds]
      );
      ingredientRequirements = ingredientsResult.rows;
    }

    const lowStockSummary = lowStock.rows.map(i =>
      `${i.name} (${i.category}): Current ${i.current_stock}${i.unit}, Par ${i.par_level}${i.unit}, Cost $${i.cost_per_unit}/${i.unit}, Supplier: ${i.supplier || 'Unknown'}`
    ).join('\n');

    const scheduleSummary = upcomingSchedules.rows.map(s =>
      `${s.scheduled_date}: ${s.recipe_name} x${s.batch_count} batches (${s.shift} shift)`
    ).join('\n');

    const requirementsSummary = ingredientRequirements.map(i =>
      `${i.recipe_name} needs: ${i.ingredient_name} - ${i.quantity} ${i.unit} per batch`
    ).join('\n');

    const systemPrompt = `You are an expert bakery procurement manager. Generate optimized purchase orders that minimize cost, reduce waste, and ensure production continuity. Consider lead times, par levels, and upcoming production needs.`;

    const userPrompt = `Generate an optimized purchase order for the bakery.

LOW STOCK INGREDIENTS (${lowStock.rows.length} items):
${lowStockSummary || 'None'}

UPCOMING PRODUCTION SCHEDULE (Next 14 days):
${scheduleSummary || 'No upcoming schedules'}

INGREDIENT REQUIREMENTS PER BATCH:
${requirementsSummary || 'No recipe data'}

Please provide:
1. Prioritized purchase order list with exact quantities to order for each ingredient
2. Recommended supplier grouping to minimize delivery costs
3. Order timing recommendations based on lead times
4. Cost estimate for the total order
5. Any substitution suggestions for out-of-stock items
6. Warnings about potential production impacts if orders are delayed

Format as a structured purchase order with line items.`;

    const aiResult = await callOpenRouter(systemPrompt, userPrompt);

    res.json({
      low_stock_items: lowStock.rows,
      upcoming_schedules: upcomingSchedules.rows,
      ingredient_requirements: ingredientRequirements,
      purchase_order: aiResult.raw,
      content: aiResult.content,
      generated_at: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== PDF PRODUCTION SHEET (protected) =====
app.get('/api/production/:date/sheet/pdf', authenticateToken, async (req, res) => {
  try {
    const { date } = req.params;
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD.' });
    }

    const [schedules, ovenSchedules, staffSchedules] = await Promise.all([
      pool.query(
        `SELECT ps.*, r.name as recipe_name, r.category, r.yield_amount, r.yield_unit,
                r.prep_time_minutes, r.bake_time_minutes, r.bake_temp_f, r.steps
         FROM production_schedules ps
         JOIN recipes r ON ps.recipe_id = r.id
         WHERE ps.scheduled_date = $1
         ORDER BY ps.shift ASC, r.name ASC`,
        [date]
      ),
      pool.query(
        `SELECT os.*, r.name as recipe_name, r.bake_temp_f
         FROM oven_schedules os
         LEFT JOIN recipes r ON os.recipe_id = r.id
         WHERE os.scheduled_date = $1
         ORDER BY os.oven_number ASC, os.start_time ASC`,
        [date]
      ),
      pool.query(
        `SELECT * FROM staff_schedules WHERE shift_date = $1 ORDER BY start_time ASC`,
        [date]
      )
    ]);

    const recipeIds = schedules.rows.map(s => s.recipe_id);
    let ingredientSummary = [];
    if (recipeIds.length > 0) {
      const ingResult = await pool.query(
        `SELECT ri.ingredient_name, ri.unit,
                SUM(ri.quantity * ps.batch_count) as total_quantity
         FROM recipe_ingredients ri
         JOIN production_schedules ps ON ri.recipe_id = ps.recipe_id
         WHERE ps.scheduled_date = $1
         GROUP BY ri.ingredient_name, ri.unit
         ORDER BY ri.ingredient_name ASC`,
        [date]
      );
      ingredientSummary = ingResult.rows;
    }

    const formattedDate = new Date(date + 'T12:00:00').toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });

    const doc = new PDFDocument({ margin: 50, size: 'LETTER' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="production-sheet-${date}.pdf"`);
    doc.pipe(res);

    doc.fontSize(20).font('Helvetica-Bold').text('Sweet Rise Bakery', { align: 'center' });
    doc.fontSize(16).font('Helvetica-Bold').text('Daily Production Sheet', { align: 'center' });
    doc.fontSize(12).font('Helvetica').fillColor('#555').text(formattedDate, { align: 'center' });
    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(560, doc.y).stroke('#333');
    doc.moveDown(1);

    doc.fillColor('#000').fontSize(11).font('Helvetica-Bold').text('Production Summary');
    doc.font('Helvetica').fontSize(10)
      .text(`Total Recipes Scheduled: ${schedules.rows.length}`)
      .text(`Total Batches: ${schedules.rows.reduce((sum, s) => sum + (s.batch_count || 0), 0)}`)
      .text(`Oven Assignments: ${ovenSchedules.rows.length}`)
      .text(`Staff Scheduled: ${staffSchedules.rows.length}`);
    doc.moveDown(1);

    if (schedules.rows.length > 0) {
      doc.fontSize(13).font('Helvetica-Bold').text('Production Schedule');
      doc.moveTo(50, doc.y).lineTo(560, doc.y).stroke('#3B82F6').moveDown(0.5);

      const shifts = [...new Set(schedules.rows.map(s => s.shift))];
      for (const shift of shifts) {
        const shiftItems = schedules.rows.filter(s => s.shift === shift);
        doc.fontSize(11).font('Helvetica-Bold').fillColor('#1e40af').text(`Shift: ${shift}`);
        doc.fillColor('#000').font('Helvetica').fontSize(10);

        shiftItems.forEach((s, i) => {
          doc.font('Helvetica-Bold').text(`  ${i + 1}. ${s.recipe_name}`);
          doc.font('Helvetica')
            .text(`     Batches: ${s.batch_count}  |  Yield: ${s.batch_count * (s.yield_amount || 1)} ${s.yield_unit || 'units'}  |  Status: ${s.status || 'planned'}`)
            .text(`     Prep: ${s.prep_time_minutes || 0} min  |  Bake: ${s.bake_time_minutes || 0} min at ${s.bake_temp_f || 'N/A'}°F`)
            .text(`     Assigned to: ${s.assigned_to || 'Unassigned'}  |  Notes: ${s.notes || 'None'}`);
          doc.moveDown(0.3);
        });
        doc.moveDown(0.5);
      }
    } else {
      doc.fontSize(11).font('Helvetica').fillColor('#666').text('No production scheduled for this date.');
      doc.fillColor('#000');
    }

    if (ovenSchedules.rows.length > 0) {
      if (doc.y > 620) doc.addPage();
      doc.fontSize(13).font('Helvetica-Bold').fillColor('#000').text('Oven Assignments');
      doc.moveTo(50, doc.y).lineTo(560, doc.y).stroke('#3B82F6').moveDown(0.5);
      doc.font('Helvetica').fontSize(10);
      ovenSchedules.rows.forEach(o => {
        doc.text(`Oven #${o.oven_number}: ${o.recipe_name || 'Recipe #' + o.recipe_id}  |  ${o.start_time || 'TBD'} - ${o.end_time || 'TBD'}  |  ${o.temperature_f || o.bake_temp_f || 'N/A'}°F  |  Status: ${o.status || 'scheduled'}`);
      });
      doc.moveDown(1);
    }

    if (ingredientSummary.length > 0) {
      if (doc.y > 580) doc.addPage();
      doc.fontSize(13).font('Helvetica-Bold').fillColor('#000').text('Ingredient Requirements Summary');
      doc.moveTo(50, doc.y).lineTo(560, doc.y).stroke('#3B82F6').moveDown(0.5);
      doc.font('Helvetica').fontSize(10);
      ingredientSummary.forEach(ing => {
        doc.text(`${ing.ingredient_name}: ${parseFloat(ing.total_quantity).toFixed(2)} ${ing.unit}`);
      });
      doc.moveDown(1);
    }

    if (staffSchedules.rows.length > 0) {
      if (doc.y > 620) doc.addPage();
      doc.fontSize(13).font('Helvetica-Bold').fillColor('#000').text('Staff Schedule');
      doc.moveTo(50, doc.y).lineTo(560, doc.y).stroke('#3B82F6').moveDown(0.5);
      doc.font('Helvetica').fontSize(10);
      staffSchedules.rows.forEach(s => {
        doc.text(`${s.staff_name} (${s.role}): ${s.start_time || 'TBD'} - ${s.end_time || 'TBD'}  |  Station: ${s.station || 'TBD'}  |  Status: ${s.status || 'scheduled'}`);
      });
    }

    doc.moveDown(2);
    doc.fontSize(8).fillColor('#999')
      .text(`Generated: ${new Date().toLocaleString()}  |  Sweet Rise Bakery Production Management System`, { align: 'center' });

    doc.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.use('/api/supply-chain-agent', require('./routes/supplyChainAgent')); // apply pass 6 — audit custom suggestion

app.use('/api/multi-location-demand', require('./routes/multiLocationDemandSync')); // apply pass 6 — audit custom suggestion

app.use('/api/video-recipe-adapt', require('./routes/videoRecipeAdapt')); // apply pass 6 — audit custom suggestion

app.use('/api/food-integrations', require('./routes/foodPosSupplierIntegrations')); // apply pass 6 — audit custom suggestion

// ===== CUSTOM VIEWS (4 synthesized endpoints) =====
app.use('/api/custom-views', require('./routes/customViews'));

app.listen(PORT, () => {
  console.log(`Bakery Backend running on port ${PORT}`);
});


// === Batch 01 Gaps & Frontend Mounts ===
// Generated gap endpoints remain unmounted audit artifacts.
