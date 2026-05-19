// Custom Views API — 4 endpoints for bakery production planning
// VIZ #1: oven schedule Gantt (GET /oven-gantt)
// VIZ #2: waste/spoilage heatmap by product (GET /waste-heatmap)
// NON-VIZ #1: recipe card PDF (GET /recipe/:id/pdf)
// NON-VIZ #2: production schedule editor (GET/POST/PUT/DELETE /production-editor)

const express = require('express');
const PDFDocument = require('pdfkit');
const router = express.Router();
const pool = require('../db');
const authenticateToken = require('../middleware/auth');

// ---------- VIZ #1: Oven Schedule Gantt ----------
// GET /api/custom-views/oven-gantt?start=YYYY-MM-DD&days=14
// Returns gantt rows grouped per oven, with start/end times and recipe context
router.get('/oven-gantt', authenticateToken, async (req, res) => {
  try {
    const start = req.query.start || new Date().toISOString().slice(0, 10);
    const days = Math.min(60, Math.max(1, parseInt(req.query.days) || 14));

    const result = await pool.query(
      `SELECT os.id, os.oven_number, os.scheduled_date, os.start_time, os.end_time,
              os.temperature_f, os.status, os.notes, os.batch_id,
              r.id as recipe_id, r.name as recipe_name, r.category,
              COALESCE(r.bake_time_minutes, 45) as bake_minutes,
              r.bake_temp_f as recipe_temp_f
       FROM oven_schedules os
       LEFT JOIN recipes r ON os.recipe_id = r.id
       WHERE os.scheduled_date >= $1::date
         AND os.scheduled_date < ($1::date + ($2::int || ' days')::interval)
       ORDER BY os.scheduled_date ASC, os.oven_number ASC, os.start_time ASC`,
      [start, days]
    );

    const toMin = (t) => {
      if (!t) return null;
      const parts = String(t).split(':').map(Number);
      return parts[0] * 60 + (parts[1] || 0);
    };

    const tasks = result.rows.map(row => {
      const startMin = toMin(row.start_time) ?? 6 * 60;
      let endMin = toMin(row.end_time);
      if (endMin === null || endMin <= startMin) {
        endMin = startMin + (parseInt(row.bake_minutes) || 45);
      }
      const dateStr = row.scheduled_date instanceof Date
        ? row.scheduled_date.toISOString().slice(0, 10)
        : String(row.scheduled_date).slice(0, 10);
      const pad = (n) => String(Math.floor(n)).padStart(2, '0');
      return {
        id: row.id,
        oven_number: row.oven_number,
        recipe_id: row.recipe_id,
        recipe_name: row.recipe_name || 'Unassigned',
        category: row.category,
        date: dateStr,
        start_time: `${pad((startMin / 60) % 24)}:${pad(startMin % 60)}`,
        end_time: `${pad((endMin / 60) % 24)}:${pad(endMin % 60)}`,
        duration_minutes: endMin - startMin,
        temperature_f: row.temperature_f || row.recipe_temp_f,
        status: row.status,
        batch_id: row.batch_id,
        notes: row.notes,
      };
    });

    // Group by oven and by date for summaries
    const ovenNumbers = [...new Set(tasks.map(t => t.oven_number))].sort((a, b) => a - b);
    const summary_by_oven = ovenNumbers.map(num => {
      const ovenTasks = tasks.filter(t => t.oven_number === num);
      const totalMin = ovenTasks.reduce((s, t) => s + (t.duration_minutes || 0), 0);
      return {
        oven_number: num,
        task_count: ovenTasks.length,
        total_minutes: totalMin,
        total_hours: Math.round(totalMin / 60 * 10) / 10,
      };
    });

    const dateSet = [...new Set(tasks.map(t => t.date))];
    const summary_by_date = dateSet.map(d => ({
      date: d,
      task_count: tasks.filter(t => t.date === d).length,
      ovens_used: [...new Set(tasks.filter(t => t.date === d).map(t => t.oven_number))].length,
    }));

    res.json({
      window: { start, days },
      tasks,
      summary_by_oven,
      summary_by_date,
      generated_at: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------- VIZ #2: Waste/Spoilage Heatmap by Product ----------
// GET /api/custom-views/waste-heatmap?days=30
// Returns a 2D matrix: rows = products (item_name), cols = days,
// cell = total cost_impact for that product/day, with per-reason breakdown.
router.get('/waste-heatmap', authenticateToken, async (req, res) => {
  try {
    const days = Math.min(180, Math.max(7, parseInt(req.query.days) || 30));

    const result = await pool.query(
      `SELECT item_name, category, reason,
              TO_CHAR(waste_date, 'YYYY-MM-DD') as day,
              SUM(COALESCE(cost_impact,0)) as cost,
              SUM(COALESCE(quantity,0)) as qty,
              COUNT(*) as incidents
       FROM waste_tracking
       WHERE waste_date >= CURRENT_DATE - ($1::int || ' days')::interval
       GROUP BY item_name, category, reason, TO_CHAR(waste_date, 'YYYY-MM-DD')
       ORDER BY item_name ASC, day ASC`,
      [days]
    );

    // Build day axis (oldest -> newest)
    const dayAxis = [];
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      dayAxis.push(d.toISOString().slice(0, 10));
    }

    // Group rows by product
    const productMap = new Map();
    let maxCellCost = 0;
    result.rows.forEach(r => {
      const key = r.item_name;
      if (!productMap.has(key)) {
        productMap.set(key, {
          item_name: r.item_name,
          category: r.category || 'Uncategorized',
          total_cost: 0,
          total_qty: 0,
          incident_count: 0,
          reasons: {},
          daily: {},
        });
      }
      const p = productMap.get(key);
      const cost = parseFloat(r.cost) || 0;
      const qty = parseFloat(r.qty) || 0;
      const inc = parseInt(r.incidents) || 0;
      p.total_cost += cost;
      p.total_qty += qty;
      p.incident_count += inc;
      p.reasons[r.reason || 'unspecified'] = (p.reasons[r.reason || 'unspecified'] || 0) + cost;
      p.daily[r.day] = (p.daily[r.day] || 0) + cost;
      if (p.daily[r.day] > maxCellCost) maxCellCost = p.daily[r.day];
    });

    const products = [...productMap.values()].sort((a, b) => b.total_cost - a.total_cost);

    // Matrix: array of { product, cells: [{ day, cost, intensity }] }
    const matrix = products.map(p => ({
      item_name: p.item_name,
      category: p.category,
      total_cost: parseFloat(p.total_cost.toFixed(2)),
      total_qty: parseFloat(p.total_qty.toFixed(2)),
      incident_count: p.incident_count,
      reasons: Object.entries(p.reasons).map(([reason, cost]) => ({
        reason,
        cost: parseFloat(cost.toFixed(2)),
      })),
      cells: dayAxis.map(day => {
        const cost = p.daily[day] || 0;
        return {
          day,
          cost: parseFloat(cost.toFixed(2)),
          intensity: maxCellCost > 0 ? Math.round((cost / maxCellCost) * 100) : 0,
        };
      }),
    }));

    // Overall summaries
    const totalWasteCost = matrix.reduce((s, p) => s + p.total_cost, 0);
    const totalIncidents = matrix.reduce((s, p) => s + p.incident_count, 0);

    // Reason aggregate across all products
    const reasonAgg = {};
    matrix.forEach(p => p.reasons.forEach(r => {
      reasonAgg[r.reason] = (reasonAgg[r.reason] || 0) + r.cost;
    }));
    const reasons_breakdown = Object.entries(reasonAgg)
      .map(([reason, cost]) => ({ reason, cost: parseFloat(cost.toFixed(2)) }))
      .sort((a, b) => b.cost - a.cost);

    res.json({
      window: { days, start: dayAxis[0], end: dayAxis[dayAxis.length - 1] },
      day_axis: dayAxis,
      matrix,
      max_cell_cost: parseFloat(maxCellCost.toFixed(2)),
      summary: {
        total_products: matrix.length,
        total_waste_cost: parseFloat(totalWasteCost.toFixed(2)),
        total_incidents: totalIncidents,
        avg_cost_per_product: matrix.length
          ? parseFloat((totalWasteCost / matrix.length).toFixed(2))
          : 0,
      },
      reasons_breakdown,
      generated_at: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------- NON-VIZ #1: Recipe Card PDF ----------
// GET /api/custom-views/recipe/:id/pdf
// Returns full recipe (name, steps, ingredients, allergens) as a PDF
router.get('/recipe/:id/pdf', authenticateToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (!id) return res.status(400).json({ error: 'Invalid recipe id' });

    const [recipeRes, ingRes, allergenRes] = await Promise.all([
      pool.query('SELECT * FROM recipes WHERE id = $1', [id]),
      pool.query('SELECT * FROM recipe_ingredients WHERE recipe_id = $1 ORDER BY ingredient_name', [id]),
      pool.query('SELECT * FROM allergen_tracking WHERE recipe_id = $1 ORDER BY severity DESC', [id]),
    ]);

    if (recipeRes.rows.length === 0) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    const recipe = recipeRes.rows[0];
    const ingredients = ingRes.rows;
    const allergens = allergenRes.rows;

    const doc = new PDFDocument({ margin: 50, size: 'LETTER' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="recipe-${id}-${(recipe.name || 'recipe').replace(/[^a-z0-9]/gi, '_')}.pdf"`
    );
    doc.pipe(res);

    doc.fontSize(20).font('Helvetica-Bold').text('Sweet Rise Bakery', { align: 'center' });
    doc.fontSize(14).font('Helvetica').fillColor('#555').text('Official Recipe Card', { align: 'center' });
    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(560, doc.y).stroke('#3B82F6');
    doc.moveDown(1);

    doc.fillColor('#000').fontSize(22).font('Helvetica-Bold').text(recipe.name);
    doc.fontSize(11).font('Helvetica').fillColor('#666')
      .text(`Category: ${recipe.category || 'N/A'}`);
    doc.moveDown(0.5);

    doc.fillColor('#000').fontSize(11).font('Helvetica-Bold').text('Recipe Specifications');
    doc.font('Helvetica').fontSize(10)
      .text(`Yield: ${recipe.yield_amount || 1} ${recipe.yield_unit || 'units'}`)
      .text(`Cost per unit: $${recipe.cost_per_unit ? parseFloat(recipe.cost_per_unit).toFixed(2) : '0.00'}`)
      .text(`Prep time: ${recipe.prep_time_minutes || 0} min`)
      .text(`Bake time: ${recipe.bake_time_minutes || 0} min`)
      .text(`Bake temperature: ${recipe.bake_temp_f || 'N/A'}°F`)
      .text(`Active: ${recipe.is_active ? 'Yes' : 'No'}`);
    doc.moveDown(1);

    if (recipe.description) {
      doc.fontSize(13).font('Helvetica-Bold').text('Description');
      doc.fontSize(10).font('Helvetica').text(recipe.description, { align: 'left' });
      doc.moveDown(1);
    }

    doc.fontSize(13).font('Helvetica-Bold').fillColor('#000').text('Ingredients');
    doc.moveTo(50, doc.y).lineTo(560, doc.y).stroke('#3B82F6').moveDown(0.3);
    if (ingredients.length === 0) {
      doc.fontSize(10).font('Helvetica').fillColor('#666').text('No ingredients recorded.');
      doc.fillColor('#000');
    } else {
      doc.fontSize(10).font('Helvetica');
      ingredients.forEach((ing, i) => {
        const cost = ing.cost ? ` — $${parseFloat(ing.cost).toFixed(2)}` : '';
        doc.text(`  ${i + 1}. ${ing.ingredient_name}: ${ing.quantity} ${ing.unit}${cost}`);
      });
    }
    doc.moveDown(1);

    if (recipe.steps) {
      if (doc.y > 620) doc.addPage();
      doc.fontSize(13).font('Helvetica-Bold').fillColor('#000').text('Preparation Steps');
      doc.moveTo(50, doc.y).lineTo(560, doc.y).stroke('#3B82F6').moveDown(0.3);
      doc.fontSize(10).font('Helvetica');
      const stepsText = typeof recipe.steps === 'string' ? recipe.steps : JSON.stringify(recipe.steps, null, 2);
      doc.text(stepsText, { align: 'left' });
      doc.moveDown(1);
    }

    if (allergens.length > 0) {
      if (doc.y > 650) doc.addPage();
      doc.fontSize(13).font('Helvetica-Bold').fillColor('#000').text('Allergen Warnings');
      doc.moveTo(50, doc.y).lineTo(560, doc.y).stroke('#DC2626').moveDown(0.3);
      doc.fontSize(10).font('Helvetica');
      allergens.forEach(a => {
        doc.text(`  • ${a.allergen_name} — Severity: ${a.severity || 'Unknown'}  ${a.notes ? '(' + a.notes + ')' : ''}`);
      });
      doc.moveDown(1);
    }

    doc.moveDown(1);
    doc.fontSize(8).fillColor('#999')
      .text(`Generated: ${new Date().toLocaleString()}  |  Recipe ID: ${id}  |  Sweet Rise Bakery`, { align: 'center' });

    doc.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------- NON-VIZ #2: Production Schedule Editor (CRUD batches) ----------
// GET    /api/custom-views/production-editor?start=YYYY-MM-DD&days=14 -> list batches
// POST   /api/custom-views/production-editor                          -> create batch
// PUT    /api/custom-views/production-editor/:id                      -> update batch
// DELETE /api/custom-views/production-editor/:id                      -> delete batch
// Operates on batch_tracking joined with recipes.
router.get('/production-editor', authenticateToken, async (req, res) => {
  try {
    const start = req.query.start || new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
    const days = Math.min(60, Math.max(1, parseInt(req.query.days) || 14));

    const batches = await pool.query(
      `SELECT bt.id, bt.recipe_id, bt.batch_number, bt.batch_date,
              bt.quantity, bt.unit, bt.status, bt.started_at, bt.completed_at,
              bt.temperature, bt.notes,
              r.name as recipe_name, r.category as recipe_category,
              r.yield_unit
       FROM batch_tracking bt
       LEFT JOIN recipes r ON bt.recipe_id = r.id
       WHERE bt.batch_date >= $1::date
         AND bt.batch_date < ($1::date + ($2::int || ' days')::interval)
       ORDER BY bt.batch_date DESC, bt.id DESC`,
      [start, days]
    );

    const recipes = await pool.query(
      `SELECT id, name, category, yield_amount, yield_unit
       FROM recipes WHERE is_active = true ORDER BY name ASC`
    );

    const STATUS_VALUES = ['mixing', 'proofing', 'baking', 'cooling', 'completed'];

    // Summary
    const byStatus = STATUS_VALUES.reduce((acc, s) => {
      acc[s] = batches.rows.filter(b => b.status === s).length;
      return acc;
    }, {});

    res.json({
      window: { start, days },
      batches: batches.rows,
      recipes: recipes.rows,
      status_options: STATUS_VALUES,
      summary: {
        total_batches: batches.rows.length,
        by_status: byStatus,
        total_quantity: batches.rows.reduce((s, b) => s + (parseFloat(b.quantity) || 0), 0),
      },
      generated_at: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/production-editor', authenticateToken, async (req, res) => {
  try {
    const {
      recipe_id,
      batch_number,
      batch_date,
      quantity,
      unit,
      status = 'mixing',
      temperature,
      notes = '',
    } = req.body || {};

    if (!recipe_id || !batch_date || !quantity) {
      return res.status(400).json({ error: 'recipe_id, batch_date, and quantity are required' });
    }

    const finalBatchNumber = batch_number ||
      `B-${String(batch_date).replace(/-/g, '')}-${Date.now().toString().slice(-5)}`;

    const insert = await pool.query(
      `INSERT INTO batch_tracking
        (recipe_id, batch_number, batch_date, quantity, unit, status, temperature, notes, started_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8, NOW())
       RETURNING *`,
      [recipe_id, finalBatchNumber, batch_date, quantity, unit || 'units', status, temperature || null, notes]
    );

    res.json({ batch: insert.rows[0], created_at: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/production-editor/:id', authenticateToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (!id) return res.status(400).json({ error: 'Invalid batch id' });

    const allowed = ['recipe_id', 'batch_number', 'batch_date', 'quantity', 'unit', 'status', 'temperature', 'notes'];
    const updates = [];
    const values = [];
    let i = 1;
    for (const key of allowed) {
      if (Object.prototype.hasOwnProperty.call(req.body || {}, key)) {
        updates.push(`${key} = $${i++}`);
        values.push(req.body[key]);
      }
    }
    if (req.body && req.body.status === 'completed') {
      updates.push(`completed_at = NOW()`);
    }
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    values.push(id);
    const result = await pool.query(
      `UPDATE batch_tracking SET ${updates.join(', ')} WHERE id = $${i} RETURNING *`,
      values
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Batch not found' });
    res.json({ batch: result.rows[0], updated_at: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/production-editor/:id', authenticateToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (!id) return res.status(400).json({ error: 'Invalid batch id' });
    const result = await pool.query(
      'DELETE FROM batch_tracking WHERE id = $1 RETURNING id',
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Batch not found' });
    res.json({ deleted_id: id, deleted_at: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
