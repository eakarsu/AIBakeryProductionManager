const express = require('express');
const { callOpenRouter } = require('../services/openrouter');
const pool = require('../db');
const router = express.Router();

// 1. Recipe Scaling with Ingredient Substitution
router.post('/recipe-scaling', async (req, res) => {
  try {
    const { recipeId, targetYield, dietaryRestrictions } = req.body;
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

    const aiResponse = await callOpenRouter(systemPrompt, userPrompt);
    res.json({ recipe: r, originalIngredients: ingredients.rows, aiResponse });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Production Demand Forecasting
router.post('/demand-forecast', async (req, res) => {
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
${reportData}

Upcoming Wholesale Orders:
${upcomingOrders}

Please provide:
1. Demand forecast for each product category for next 7 days
2. Recommended production quantities
3. Staffing suggestions based on forecasted demand
4. Potential revenue projections
5. Risk factors (weather, events, trends)`;

    const aiResponse = await callOpenRouter(systemPrompt, userPrompt);
    res.json({ historicalData: reports.rows, upcomingOrders: orders.rows, aiResponse });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Menu Description & Marketing Copy
router.post('/marketing-copy', async (req, res) => {
  try {
    const { recipeId, tone, platform } = req.body;
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

    const aiResponse = await callOpenRouter(systemPrompt, userPrompt);
    res.json({ recipe: r, aiResponse });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Nutritional Label Generation
router.post('/nutritional-label', async (req, res) => {
  try {
    const { recipeId } = req.body;
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

    const aiResponse = await callOpenRouter(systemPrompt, userPrompt);
    res.json({ recipe: r, ingredients: ingredients.rows, aiResponse });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Waste Reduction Recommendations
router.post('/waste-reduction', async (req, res) => {
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
${wasteData}

Items Expiring Within 7 Days:
${expiringItems || 'None'}

Please provide:
1. Waste pattern analysis (top causes, trends)
2. Specific reduction strategies for each waste category
3. Recipes or products to use near-expiry ingredients
4. Production adjustment recommendations
5. Estimated monthly savings if recommendations are followed
6. Long-term sustainability improvements`;

    const aiResponse = await callOpenRouter(systemPrompt, userPrompt);
    res.json({ wasteData: waste.rows, expiringItems: inventory.rows, aiResponse });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Custom Cake Design Consultation
router.post('/cake-consultation', async (req, res) => {
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

    const aiResponse = await callOpenRouter(systemPrompt, userPrompt);
    res.json({ aiResponse });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
