const express = require('express');
const { callOpenRouter, parseAIJson } = require('../services/openrouter');
const pool = require('../db');
const router = express.Router();
const { rateLimit } = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const authenticateToken = require('../middleware/auth');

// Rate limiter: 20 AI requests per user per hour
const aiRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  keyGenerator: (req) => req.user?.id ? `user_${req.user.id}` : req.ip,
  message: { error: 'Too many AI requests. Limit is 20 per hour. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

const BAKERY_SYSTEM_PROMPT = 'You are an expert bakery operations manager and food scientist. Provide precise, actionable production optimization recommendations.';

// Helper: persist AI result to ai_results table
async function persistAIResult(featureName, inputSummary, aiResult, userId) {
  try {
    await pool.query(
      `INSERT INTO ai_results (feature_name, input_summary, content, parsed_result, model, tokens_used, user_id, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
      [
        featureName,
        inputSummary,
        aiResult.content,
        aiResult.parsed ? JSON.stringify(aiResult.parsed) : null,
        aiResult.model,
        aiResult.usage?.total_tokens || null,
        userId || null,
      ]
    );
  } catch (e) {
    console.error('Failed to persist AI result:', e.message);
  }
}

// POST /api/ai/inventory-ordering
router.post('/inventory-ordering',
  authenticateToken,
  aiRateLimiter,
  [
    body('inventory').optional().isArray().withMessage('inventory must be an array'),
    body('demand_forecast').optional(),
  ],
  validateRequest,
  async (req, res) => {
    try {
      let { inventory, demand_forecast } = req.body;

      if (!inventory || inventory.length === 0) {
        const result = await pool.query(
          `SELECT name, category, current_stock, unit, par_level, cost_per_unit, supplier, expiry_date
           FROM ingredient_inventory ORDER BY current_stock ASC`
        );
        inventory = result.rows;
      }

      if (!demand_forecast) {
        const recentReports = await pool.query(
          `SELECT TO_CHAR(report_date, 'YYYY-MM-DD') as date,
                  total_items_produced, total_revenue, total_orders
           FROM daily_reports ORDER BY report_date DESC LIMIT 14`
        );
        demand_forecast = recentReports.rows;
      }

      const lowStockItems = Array.isArray(inventory)
        ? inventory.filter(i => i.current_stock <= (i.par_level || 0))
        : [];

      const userPrompt = `Analyze the current bakery inventory and demand forecast to recommend optimal ordering decisions.

CURRENT INVENTORY (${Array.isArray(inventory) ? inventory.length : 0} items):
${JSON.stringify(inventory, null, 2)}

LOW STOCK ITEMS (at or below par level): ${lowStockItems.length} items
${JSON.stringify(lowStockItems, null, 2)}

DEMAND FORECAST / RECENT PRODUCTION DATA:
${JSON.stringify(demand_forecast, null, 2)}

Respond ONLY with valid JSON in this exact format:
{
  "urgent_orders": [
    {
      "item": "ingredient name",
      "current_stock": "amount + unit",
      "recommended_order_qty": "amount + unit",
      "order_by_date": "YYYY-MM-DD",
      "estimated_cost": "$X",
      "reason": "why urgent"
    }
  ],
  "scheduled_orders": [
    {
      "item": "ingredient name",
      "recommended_order_qty": "amount + unit",
      "order_by_date": "YYYY-MM-DD",
      "estimated_cost": "$X",
      "rationale": "reasoning"
    }
  ],
  "items_to_monitor": ["list of items approaching par level"],
  "total_estimated_order_cost": "$X",
  "cost_saving_opportunities": ["list of cost optimization suggestions"],
  "supplier_consolidation": ["suggestions for consolidating orders by supplier"],
  "summary": "executive summary of ordering recommendations"
}`;

      const aiResult = await callOpenRouter(BAKERY_SYSTEM_PROMPT, userPrompt, { jsonMode: true });
      await persistAIResult('inventory-ordering', `Items: ${Array.isArray(inventory) ? inventory.length : 0}, Low stock: ${lowStockItems.length}`, aiResult, req.user?.id);

      res.json({
        inventory_count: Array.isArray(inventory) ? inventory.length : 0,
        low_stock_count: lowStockItems.length,
        recommendations: aiResult.raw,
        parsed: aiResult.parsed,
        content: aiResult.content,
        generated_at: new Date().toISOString(),
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// POST /api/ai/seasonal-menu
router.post('/seasonal-menu',
  authenticateToken,
  aiRateLimiter,
  [
    body('current_season').optional().isIn(['spring', 'summer', 'fall', 'winter', 'Spring', 'Summer', 'Fall', 'Winter'])
      .withMessage('current_season must be one of: spring, summer, fall, winter'),
    body('sales_history').optional().isArray(),
  ],
  validateRequest,
  async (req, res) => {
    try {
      let { sales_history, current_season } = req.body;

      if (!current_season) {
        const month = new Date().getMonth() + 1;
        if (month >= 3 && month <= 5) current_season = 'Spring';
        else if (month >= 6 && month <= 8) current_season = 'Summer';
        else if (month >= 9 && month <= 11) current_season = 'Fall';
        else current_season = 'Winter';
      }

      if (!sales_history || sales_history.length === 0) {
        const salesResult = await pool.query(
          `SELECT TO_CHAR(report_date, 'YYYY-MM') as month,
                  SUM(total_revenue) as revenue,
                  SUM(total_items_produced) as items_produced,
                  COUNT(*) as days
           FROM daily_reports
           WHERE report_date >= NOW() - INTERVAL '12 months'
           GROUP BY TO_CHAR(report_date, 'YYYY-MM')
           ORDER BY month DESC`
        );
        sales_history = salesResult.rows;
      }

      const recipesResult = await pool.query(
        `SELECT name, category, description, cost_per_unit, yield_amount, yield_unit
         FROM recipes WHERE is_active = true ORDER BY name`
      );

      const userPrompt = `Based on the bakery's sales history and current season, recommend seasonal menu items and adjustments.

CURRENT SEASON: ${current_season}
CURRENT DATE: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}

SALES HISTORY (last 12 months):
${JSON.stringify(sales_history, null, 2)}

CURRENT ACTIVE RECIPES:
${JSON.stringify(recipesResult.rows, null, 2)}

Respond ONLY with valid JSON in this exact format:
{
  "season_analysis": "brief analysis of seasonal trends from sales data",
  "new_seasonal_items": [
    {
      "name": "product name",
      "category": "category",
      "description": "detailed description",
      "key_ingredients": ["ingredient1", "ingredient2"],
      "estimated_price": "$X",
      "production_difficulty": "EASY|MEDIUM|HARD",
      "revenue_potential": "LOW|MEDIUM|HIGH",
      "marketing_angle": "why this sells this season"
    }
  ],
  "items_to_retire": ["items from current menu to remove this season with reason"],
  "items_to_promote": ["existing items to feature heavily this season with reason"],
  "seasonal_promotions": [
    {
      "promotion_name": "name",
      "description": "details",
      "discount_or_bundle": "offer details",
      "target_dates": "date range"
    }
  ],
  "ingredient_prep": ["ingredients to stock up on for seasonal items"],
  "projected_revenue_increase": "estimated % increase with seasonal adjustments",
  "summary": "executive summary of seasonal menu strategy"
}`;

      const aiResult = await callOpenRouter(BAKERY_SYSTEM_PROMPT, userPrompt, { jsonMode: true });
      await persistAIResult('seasonal-menu', `Season: ${current_season}`, aiResult, req.user?.id);

      res.json({
        current_season,
        current_recipes_count: recipesResult.rows.length,
        recommendations: aiResult.raw,
        parsed: aiResult.parsed,
        content: aiResult.content,
        generated_at: new Date().toISOString(),
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// POST /api/ai/bottleneck-detector
router.post('/bottleneck-detector',
  authenticateToken,
  aiRateLimiter,
  [
    body('production_data').optional().isArray(),
    body('schedules').optional().isArray(),
  ],
  validateRequest,
  async (req, res) => {
    try {
      let { production_data, schedules } = req.body;

      if (!production_data || production_data.length === 0) {
        const batchResult = await pool.query(
          `SELECT bt.batch_number, bt.batch_date, bt.status,
                  bt.started_at, bt.completed_at, bt.temperature, bt.notes,
                  r.name as recipe_name, r.category, r.prep_time_minutes, r.bake_time_minutes,
                  EXTRACT(EPOCH FROM (bt.completed_at - bt.started_at))/60 as actual_duration_minutes
           FROM batch_tracking bt
           LEFT JOIN recipes r ON bt.recipe_id = r.id
           WHERE bt.batch_date >= NOW() - INTERVAL '30 days'
           ORDER BY bt.batch_date DESC`
        );
        production_data = batchResult.rows;
      }

      if (!schedules || schedules.length === 0) {
        const schedResult = await pool.query(
          `SELECT ps.*, r.name as recipe_name, r.prep_time_minutes, r.bake_time_minutes
           FROM production_schedules ps
           LEFT JOIN recipes r ON ps.recipe_id = r.id
           WHERE ps.scheduled_date >= NOW() - INTERVAL '30 days'
           ORDER BY ps.scheduled_date DESC, ps.shift ASC`
        );
        schedules = schedResult.rows;
      }

      const ovenResult = await pool.query(
        `SELECT os.*, r.name as recipe_name, r.bake_time_minutes, r.bake_temp_f
         FROM oven_schedules os
         LEFT JOIN recipes r ON os.recipe_id = r.id
         WHERE os.scheduled_date >= NOW() - INTERVAL '30 days'
         ORDER BY os.scheduled_date DESC, os.oven_number ASC`
      );

      const userPrompt = `Analyze bakery production data to identify bottlenecks, inefficiencies, and staffing optimization opportunities.

BATCH PRODUCTION DATA (last 30 days, ${production_data.length} batches):
${JSON.stringify(production_data.slice(0, 50), null, 2)}

PRODUCTION SCHEDULES (last 30 days):
${JSON.stringify(schedules.slice(0, 50), null, 2)}

OVEN SCHEDULES:
${JSON.stringify(ovenResult.rows.slice(0, 30), null, 2)}

Respond ONLY with valid JSON in this exact format:
{
  "bottlenecks_identified": [
    {
      "station": "station/area name",
      "severity": "LOW|MEDIUM|HIGH|CRITICAL",
      "description": "what the bottleneck is",
      "impact": "how it affects production",
      "evidence": "data points supporting this finding",
      "root_cause": "underlying cause",
      "resolution": "specific fix recommended"
    }
  ],
  "underutilized_stations": [
    {
      "station": "station name",
      "current_utilization_pct": 0,
      "recommendation": "how to better use this station"
    }
  ],
  "staffing_recommendations": [
    {
      "shift": "morning|afternoon|evening",
      "current_staff_assessment": "assessment",
      "recommended_headcount": 0,
      "roles_needed": ["role1"],
      "rationale": "why"
    }
  ],
  "process_improvements": ["list of specific process improvements"],
  "scheduling_optimizations": ["scheduling changes to reduce bottlenecks"],
  "estimated_throughput_gain_pct": 0,
  "estimated_waste_reduction_pct": 0,
  "priority_actions": ["top 3 immediate actions"],
  "summary": "executive summary"
}`;

      const aiResult = await callOpenRouter(BAKERY_SYSTEM_PROMPT, userPrompt, { jsonMode: true });
      await persistAIResult('bottleneck-detector', `Batches: ${production_data.length}, Schedules: ${schedules.length}`, aiResult, req.user?.id);

      res.json({
        batches_analyzed: production_data.length,
        schedules_analyzed: schedules.length,
        analysis: aiResult.raw,
        parsed: aiResult.parsed,
        content: aiResult.content,
        generated_at: new Date().toISOString(),
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// POST /api/ai/batch-quality
router.post('/batch-quality',
  authenticateToken,
  aiRateLimiter,
  [
    body('batches').optional().isArray(),
    body('date_range_days').optional().isInt({ min: 1, max: 365 }),
  ],
  validateRequest,
  async (req, res) => {
    try {
      let { batches, date_range_days = 30 } = req.body;

      if (!batches || batches.length === 0) {
        const batchResult = await pool.query(
          `SELECT bt.*, r.name as recipe_name, r.category,
                  r.bake_temp_f as target_temp_f, r.bake_time_minutes as target_bake_time,
                  r.prep_time_minutes as target_prep_time,
                  EXTRACT(EPOCH FROM (bt.completed_at - bt.started_at))/60 as actual_duration_minutes
           FROM batch_tracking bt
           LEFT JOIN recipes r ON bt.recipe_id = r.id
           WHERE bt.batch_date >= NOW() - INTERVAL '${parseInt(date_range_days)} days'
           ORDER BY bt.batch_date DESC`
        );
        batches = batchResult.rows;
      }

      if (batches.length === 0) {
        return res.status(404).json({ error: 'No batch data found for the specified period' });
      }

      const completed = batches.filter(b => b.status === 'completed');
      const failed = batches.filter(b => b.status === 'failed' || b.status === 'rejected');
      const inProgress = batches.filter(b => b.status === 'in_progress' || b.status === 'baking');
      const tempReadings = batches.filter(b => b.temperature != null).map(b => parseFloat(b.temperature));
      const avgTemp = tempReadings.length > 0
        ? (tempReadings.reduce((a, b) => a + b, 0) / tempReadings.length).toFixed(1)
        : null;

      const userPrompt = `Perform a comprehensive quality variance analysis on bakery batch data. Identify deviations from standards, quality issues, and trends.

BATCH DATA (${batches.length} batches over ${date_range_days} days):
${JSON.stringify(batches.slice(0, 60), null, 2)}

SUMMARY STATS:
- Total Batches: ${batches.length}
- Completed: ${completed.length}
- Failed/Rejected: ${failed.length}
- In Progress: ${inProgress.length}
- Average Temperature Reading: ${avgTemp ? avgTemp + '°F' : 'N/A'}

Respond ONLY with valid JSON in this exact format:
{
  "overall_quality_score": 85,
  "quality_grade": "A|B|C|D|F",
  "flagged_batches": [
    {
      "batch_number": "batch id",
      "recipe": "recipe name",
      "date": "date",
      "deviation_type": "TEMPERATURE|TIMING|QUANTITY|FAILURE|OTHER",
      "severity": "LOW|MEDIUM|HIGH|CRITICAL",
      "description": "what went wrong",
      "recommended_action": "what to do"
    }
  ],
  "variance_analysis": {
    "temperature_variance": {
      "avg_deviation_f": 0,
      "max_deviation_f": 0,
      "batches_out_of_range": 0,
      "assessment": "text"
    },
    "timing_variance": {
      "avg_delay_minutes": 0,
      "batches_overdue": 0,
      "assessment": "text"
    },
    "yield_variance": {
      "assessment": "text",
      "common_issues": ["list"]
    }
  },
  "failure_rate_pct": 0,
  "root_causes": ["most common root causes"],
  "corrective_actions": [
    {
      "issue": "issue description",
      "action": "corrective action",
      "priority": "IMMEDIATE|THIS_WEEK|THIS_MONTH"
    }
  ],
  "preventive_measures": ["list of preventive measures"],
  "quality_trends": "trend analysis over the period",
  "summary": "executive quality summary"
}`;

      const aiResult = await callOpenRouter(BAKERY_SYSTEM_PROMPT, userPrompt, { jsonMode: true });
      await persistAIResult('batch-quality', `Batches: ${batches.length}, Days: ${date_range_days}`, aiResult, req.user?.id);

      res.json({
        batches_analyzed: batches.length,
        date_range_days,
        completed_count: completed.length,
        failed_count: failed.length,
        quality_analysis: aiResult.raw,
        parsed: aiResult.parsed,
        content: aiResult.content,
        generated_at: new Date().toISOString(),
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// POST /api/ai/cost-analysis — NEW FEATURE: profitability analysis per recipe
router.post('/cost-analysis',
  authenticateToken,
  aiRateLimiter,
  [
    body('recipe_id').optional().isInt({ min: 1 }),
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { recipe_id } = req.body;

      let recipes;
      if (recipe_id) {
        const r = await pool.query(
          `SELECT r.*, COALESCE(SUM(ri.cost * ri.quantity), 0) as total_ingredient_cost
           FROM recipes r
           LEFT JOIN recipe_ingredients ri ON ri.recipe_id = r.id
           WHERE r.id = $1
           GROUP BY r.id`,
          [recipe_id]
        );
        recipes = r.rows;
      } else {
        const r = await pool.query(
          `SELECT r.*, COALESCE(SUM(ri.cost * ri.quantity), 0) as total_ingredient_cost
           FROM recipes r
           LEFT JOIN recipe_ingredients ri ON ri.recipe_id = r.id
           WHERE r.is_active = true
           GROUP BY r.id
           ORDER BY r.name`
        );
        recipes = r.rows;
      }

      // Get waste costs by recipe category
      const wasteCosts = await pool.query(
        `SELECT category, SUM(cost_impact) as total_waste_cost, COUNT(*) as waste_events
         FROM waste_tracking
         WHERE waste_date >= NOW() - INTERVAL '30 days'
         GROUP BY category`
      );

      const userPrompt = `Analyze the profitability of bakery recipes and recommend pricing and production adjustments.

RECIPE COST DATA:
${JSON.stringify(recipes, null, 2)}

WASTE COSTS BY CATEGORY (last 30 days):
${JSON.stringify(wasteCosts.rows, null, 2)}

Respond ONLY with valid JSON in this exact format:
{
  "profitability_overview": "summary of overall bakery profitability",
  "recipe_analysis": [
    {
      "recipe_name": "name",
      "category": "category",
      "ingredient_cost": 0,
      "current_price": 0,
      "estimated_profit_margin_pct": 0,
      "profitability_rating": "EXCELLENT|GOOD|FAIR|POOR|LOSS_MAKER",
      "recommendation": "specific action to take",
      "suggested_price": 0
    }
  ],
  "most_profitable": ["top 3 most profitable items"],
  "least_profitable": ["bottom 3 least profitable items — consider discontinuing or repricing"],
  "pricing_strategy": "overall pricing strategy recommendation",
  "waste_impact_analysis": "how waste is affecting overall margins",
  "cost_reduction_opportunities": ["specific cost reduction suggestions"],
  "estimated_monthly_profit_improvement": "$X if recommendations are followed",
  "summary": "executive profitability summary"
}`;

      const aiResult = await callOpenRouter(BAKERY_SYSTEM_PROMPT, userPrompt, { jsonMode: true });
      await persistAIResult('cost-analysis', `Recipes: ${recipes.length}`, aiResult, req.user?.id);

      res.json({
        recipes_analyzed: recipes.length,
        analysis: aiResult.raw,
        parsed: aiResult.parsed,
        content: aiResult.content,
        generated_at: new Date().toISOString(),
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;
