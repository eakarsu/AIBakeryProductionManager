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
    // Non-fatal — log but don't fail the response
    console.error('Failed to persist AI result:', e.message);
  }
}

const recipeValidators = [
  body('recipeId').optional().isInt({ min: 1 }).withMessage('recipeId must be a positive integer'),
  body('batch_size').optional().isInt({ min: 1 }),
  body('production_date').optional().isISO8601(),
  body('targetYield').optional().isInt({ min: 1 }),
];

// 1. Recipe Scaling with Ingredient Substitution
router.post('/recipe-scaling', authenticateToken, aiRateLimiter, recipeValidators, validateRequest, async (req, res) => {
  try {
    const { recipeId, targetYield, dietaryRestrictions } = req.body;
    if (!recipeId || !targetYield) return res.status(400).json({ error: 'recipeId and targetYield are required' });
    const recipe = await pool.query('SELECT * FROM recipes WHERE id = $1', [recipeId]);
    const ingredients = await pool.query('SELECT * FROM recipe_ingredients WHERE recipe_id = $1', [recipeId]);
    if (recipe.rows.length === 0) return res.status(404).json({ error: 'Recipe not found' });

    const r = recipe.rows[0];
    const ingredientList = ingredients.rows.map(i => `${i.ingredient_name}: ${i.quantity} ${i.unit}`).join('\n');

    const systemPrompt = `You are an expert bakery chef and food scientist. Provide precise recipe scaling calculations and intelligent ingredient substitutions. Always format your response clearly with sections for scaled ingredients and substitution suggestions.`;
    const userPrompt = `Scale this recipe and suggest substitutions:

Recipe: ${r.name}
Current Yield: ${r.yield_amount} ${r.yield_unit}
Target Yield: ${targetYield} ${r.yield_unit}
${dietaryRestrictions ? `Dietary Restrictions: ${dietaryRestrictions}` : ''}

Current Ingredients:
${ingredientList}

Please provide:
1. Scaled ingredient amounts for the target yield
2. Ingredient substitution suggestions${dietaryRestrictions ? ` (considering: ${dietaryRestrictions})` : ''}
3. Tips for maintaining quality at the new scale
4. Any adjustments needed for baking time/temperature`;

    const aiResult = await callOpenRouter(systemPrompt, userPrompt);
    await persistAIResult('recipe-scaling', `Recipe: ${r.name}, Target: ${targetYield} ${r.yield_unit}`, aiResult, req.user?.id);
    res.json({ recipe: r, originalIngredients: ingredients.rows, aiResponse: aiResult.raw, content: aiResult.content });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Production Demand Forecasting
router.post('/demand-forecast', authenticateToken, aiRateLimiter, recipeValidators, validateRequest, async (req, res) => {
  try {
    const reports = await pool.query('SELECT * FROM daily_reports ORDER BY report_date DESC LIMIT 14');
    const orders = await pool.query('SELECT * FROM wholesale_orders WHERE delivery_date >= CURRENT_DATE ORDER BY delivery_date');

    const reportData = reports.rows.map(r =>
      `${r.report_date}: Produced=${r.total_items_produced}, Revenue=$${r.total_revenue}, Orders=${r.total_orders}, Waste=$${r.total_waste_cost}`
    ).join('\n');

    const upcomingOrders = orders.rows.map(o =>
      `${o.delivery_date}: ${o.customer_name} - ${o.items} ($${o.total_amount})`
    ).join('\n');

    const systemPrompt = `You are a bakery production analyst specializing in demand forecasting. Analyze production data and provide actionable forecasts with specific numbers.`;
    const userPrompt = `Analyze this bakery production data and forecast demand for the next 7 days:

Recent Daily Reports (last 14 days):
${reportData || 'No data yet'}

Upcoming Wholesale Orders:
${upcomingOrders || 'No upcoming orders'}

Please provide:
1. Demand forecast for each product category for next 7 days
2. Recommended production quantities
3. Staffing suggestions based on forecasted demand
4. Potential revenue projections
5. Risk factors (weather, events, trends)`;

    const aiResult = await callOpenRouter(systemPrompt, userPrompt);
    await persistAIResult('demand-forecast', `Reports: ${reports.rows.length}, Orders: ${orders.rows.length}`, aiResult, req.user?.id);
    res.json({ historicalData: reports.rows, upcomingOrders: orders.rows, aiResponse: aiResult.raw, content: aiResult.content });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Menu Description & Marketing Copy
router.post('/marketing-copy', authenticateToken, aiRateLimiter, recipeValidators, validateRequest, async (req, res) => {
  try {
    const { recipeId, tone, platform } = req.body;
    if (!recipeId) return res.status(400).json({ error: 'recipeId is required' });
    const recipe = await pool.query('SELECT * FROM recipes WHERE id = $1', [recipeId]);
    const ingredients = await pool.query('SELECT * FROM recipe_ingredients WHERE recipe_id = $1', [recipeId]);
    if (recipe.rows.length === 0) return res.status(404).json({ error: 'Recipe not found' });
    const r = recipe.rows[0];

    const systemPrompt = `You are a creative food marketing copywriter for an artisan bakery called "Sweet Rise Bakery". Write compelling, appetite-inducing descriptions.`;
    const userPrompt = `Write marketing copy for this bakery item:

Product: ${r.name}
Category: ${r.category}
Description: ${r.description}
Key Ingredients: ${ingredients.rows.map(i => i.ingredient_name).join(', ')}
Tone: ${tone || 'warm and artisanal'}
Platform: ${platform || 'menu, social media, and website'}

Please provide:
1. Menu description (2-3 elegant sentences)
2. Social media post (Instagram-style with hashtags)
3. Website product page description
4. Seasonal promotion idea
5. Email newsletter feature blurb`;

    const aiResult = await callOpenRouter(systemPrompt, userPrompt);
    await persistAIResult('marketing-copy', `Recipe: ${r.name}`, aiResult, req.user?.id);
    res.json({ recipe: r, aiResponse: aiResult.raw, content: aiResult.content });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Nutritional Label Generation
router.post('/nutritional-label', authenticateToken, aiRateLimiter, recipeValidators, validateRequest, async (req, res) => {
  try {
    const { recipeId } = req.body;
    if (!recipeId) return res.status(400).json({ error: 'recipeId is required' });
    const recipe = await pool.query('SELECT * FROM recipes WHERE id = $1', [recipeId]);
    const ingredients = await pool.query('SELECT * FROM recipe_ingredients WHERE recipe_id = $1', [recipeId]);
    if (recipe.rows.length === 0) return res.status(404).json({ error: 'Recipe not found' });
    const r = recipe.rows[0];
    const ingredientList = ingredients.rows.map(i => `${i.ingredient_name}: ${i.quantity} ${i.unit}`).join('\n');

    const systemPrompt = `You are a food science nutritionist specializing in bakery products. Provide accurate nutritional estimates based on standard USDA values for common bakery ingredients.`;
    const userPrompt = `Generate a nutritional label for this recipe:

Recipe: ${r.name}
Yield: ${r.yield_amount} ${r.yield_unit}
Ingredients:
${ingredientList}

Please provide per serving:
1. Serving size
2. Calories
3. Total Fat (saturated, trans)
4. Cholesterol
5. Sodium
6. Total Carbohydrates (fiber, sugars)
7. Protein
8. Key vitamins and minerals
9. Allergen statement
10. Ingredient list (in descending order by weight, as required by FDA)`;

    const aiResult = await callOpenRouter(systemPrompt, userPrompt);
    await persistAIResult('nutritional-label', `Recipe: ${r.name}`, aiResult, req.user?.id);
    res.json({ recipe: r, ingredients: ingredients.rows, aiResponse: aiResult.raw, content: aiResult.content });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Waste Reduction Recommendations
router.post('/waste-reduction', authenticateToken, aiRateLimiter, validateRequest, async (req, res) => {
  try {
    const waste = await pool.query('SELECT * FROM waste_tracking ORDER BY waste_date DESC LIMIT 30');
    const inventory = await pool.query('SELECT * FROM ingredient_inventory WHERE expiry_date <= CURRENT_DATE + 7 ORDER BY expiry_date');

    const wasteData = waste.rows.map(w =>
      `${w.waste_date}: ${w.item_name} - ${w.quantity} ${w.unit} (${w.reason}) Cost: $${w.cost_impact}`
    ).join('\n');

    const expiringItems = inventory.rows.map(i =>
      `${i.name}: ${i.current_stock} ${i.unit} expires ${i.expiry_date}`
    ).join('\n');

    const systemPrompt = `You are a bakery waste reduction consultant focused on sustainability and cost savings. Provide specific, actionable recommendations.`;
    const userPrompt = `Analyze this bakery waste data and provide reduction recommendations:

Recent Waste Records:
${wasteData || 'No recent waste data'}

Items Expiring Within 7 Days:
${expiringItems || 'None'}

Please provide:
1. Waste pattern analysis (top causes, trends)
2. Specific reduction strategies for each waste category
3. Recipes or products to use near-expiry ingredients
4. Production adjustment recommendations
5. Estimated monthly savings if recommendations are followed
6. Long-term sustainability improvements`;

    const aiResult = await callOpenRouter(systemPrompt, userPrompt);
    await persistAIResult('waste-reduction', `Waste records: ${waste.rows.length}, Expiring: ${inventory.rows.length}`, aiResult, req.user?.id);
    res.json({ wasteData: waste.rows, expiringItems: inventory.rows, aiResponse: aiResult.raw, content: aiResult.content });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Custom Cake Design Consultation
router.post('/cake-consultation', authenticateToken, aiRateLimiter, validateRequest, async (req, res) => {
  try {
    const { occasion, guestCount, budget, preferences, dietaryNeeds } = req.body;

    const systemPrompt = `You are an expert custom cake designer and consultant at Sweet Rise Bakery. Help customers design their dream cakes with creative, detailed suggestions. Consider budget, dietary needs, and current trends.`;
    const userPrompt = `Help design a custom cake:

Occasion: ${occasion || 'Not specified'}
Guest Count: ${guestCount || 'Not specified'}
Budget: ${budget ? '$' + budget : 'Not specified'}
Customer Preferences: ${preferences || 'Open to suggestions'}
Dietary Needs: ${dietaryNeeds || 'None specified'}

Please provide:
1. 3 cake design options (size, tiers, shape)
2. Flavor combinations for each option
3. Frosting and decoration suggestions
4. Color scheme recommendations
5. Estimated pricing for each option
6. Timeline for ordering and production
7. Add-on suggestions (toppers, flowers, special elements)`;

    const aiResult = await callOpenRouter(systemPrompt, userPrompt);
    await persistAIResult('cake-consultation', `Occasion: ${occasion}, Guests: ${guestCount}, Budget: $${budget}`, aiResult, req.user?.id);
    res.json({ aiResponse: aiResult.raw, content: aiResult.content });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Seasonal Demand Forecast
router.post('/seasonal-forecast',
  authenticateToken,
  aiRateLimiter,
  [
    body('product_id').optional().isInt({ min: 1 }),
    body('months_ahead').optional().isInt({ min: 1, max: 12 }),
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { product_id, months_ahead = 3 } = req.body;

      let productInfo = null;
      if (product_id) {
        const recipeResult = await pool.query('SELECT * FROM recipes WHERE id = $1', [product_id]);
        if (recipeResult.rows.length > 0) productInfo = recipeResult.rows[0];
      }

      const monthlyProduction = await pool.query(
        `SELECT TO_CHAR(report_date, 'YYYY-MM') as month,
                TO_CHAR(report_date, 'Month') as month_name,
                EXTRACT(MONTH FROM report_date) as month_num,
                SUM(total_items_produced) as items_produced,
                SUM(total_revenue) as revenue,
                COUNT(*) as reporting_days
         FROM daily_reports
         WHERE report_date >= NOW() - INTERVAL '12 months'
         GROUP BY TO_CHAR(report_date, 'YYYY-MM'), TO_CHAR(report_date, 'Month'), EXTRACT(MONTH FROM report_date)
         ORDER BY month ASC`
      );

      const schedulePattern = await pool.query(
        `SELECT TO_CHAR(scheduled_date, 'YYYY-MM') as month,
                EXTRACT(MONTH FROM scheduled_date) as month_num,
                COUNT(*) as schedule_count,
                SUM(batch_count) as total_batches
         FROM production_schedules
         WHERE scheduled_date >= NOW() - INTERVAL '12 months'
         GROUP BY TO_CHAR(scheduled_date, 'YYYY-MM'), EXTRACT(MONTH FROM scheduled_date)
         ORDER BY month ASC`
      );

      const historicalSales = monthlyProduction.rows;
      const monthlyData = historicalSales.map(m =>
        `${m.month} (${m.month_name.trim()}): ${m.items_produced || 0} items, Revenue $${parseFloat(m.revenue || 0).toFixed(2)}, Active ${m.reporting_days} days`
      ).join('\n');

      const scheduleData = schedulePattern.rows.map(s =>
        `${s.month}: ${s.schedule_count} schedules, ${s.total_batches} total batches`
      ).join('\n');

      const systemPrompt = `You are an expert bakery demand forecasting analyst specializing in seasonal trends and production planning. Analyze historical data and provide precise forecasts with confidence intervals.`;
      const userPrompt = `Analyze seasonal patterns and forecast demand for the next ${months_ahead} months.

${productInfo ? `PRODUCT: ${productInfo.name} (${productInfo.category})\nYield per batch: ${productInfo.yield_amount} ${productInfo.yield_unit}\n` : 'SCOPE: Entire bakery production\n'}

HISTORICAL MONTHLY PRODUCTION (Last 12 months):
${monthlyData || 'No historical data available'}

PRODUCTION SCHEDULE PATTERNS:
${scheduleData || 'No schedule data available'}

Current date: ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}

Please provide:
1. Seasonal trend analysis (identify peak/slow months and why)
2. Month-by-month demand forecast for the next ${months_ahead} months with projected production quantities, revenue projections, and confidence interval
3. Key seasonal drivers (holidays, weather, local events)
4. Recommended inventory pre-stocking months
5. Staffing recommendations by forecast month
6. Top 3 risks to the forecast and mitigation strategies`;

      const aiResult = await callOpenRouter(systemPrompt, userPrompt);
      await persistAIResult('seasonal-forecast', `Months: ${months_ahead}, Product: ${productInfo?.name || 'all'}`, aiResult, req.user?.id);

      res.json({
        product: productInfo,
        months_ahead,
        historical_data: historicalSales,
        schedule_patterns: schedulePattern.rows,
        forecast: aiResult.raw,
        content: aiResult.content,
        generated_at: new Date().toISOString(),
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// GET /api/ai/history — paginated list of past AI analyses
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;
    const featureName = req.query.feature || null;

    const conditions = [];
    const params = [];
    let idx = 1;

    if (featureName) {
      conditions.push(`feature_name = $${idx++}`);
      params.push(featureName);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await pool.query(`SELECT COUNT(*) FROM ai_results ${where}`, params);
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(
      `SELECT id, feature_name, input_summary, model, tokens_used, user_id, created_at,
              LEFT(content, 300) as content_preview
       FROM ai_results ${where}
       ORDER BY created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, limit, offset]
    );

    res.json({
      data: result.rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/ai/history/:id — full AI result
router.get('/history/:id', authenticateToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' });
    const result = await pool.query('SELECT * FROM ai_results WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
