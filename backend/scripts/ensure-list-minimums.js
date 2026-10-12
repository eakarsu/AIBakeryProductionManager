'use strict';

const pool = require('../db');

const demoOrders = [
  ['Bread flour and whole-grain flour', 485.00, 3],
  ['Butter, cream, and cultured dairy', 372.50, 1],
  ['Shell eggs for weekly production plan', 196.00, 1],
  ['Cane sugar and confectioners sugar', 244.25, 5],
  ['Dark chocolate and cocoa powder', 618.75, 7],
  ['Cinnamon, vanilla, and cardamom', 185.50, 4],
  ['Yeast, baking powder, and baking soda', 138.00, 3],
  ['Seasonal berries for proposed menu', 426.00, 2],
  ['Almonds, pecans, and sesame seeds', 295.75, 3],
  ['Cake boxes, bread bags, and labels', 336.40, 5],
  ['Food-safe sanitizer and cleaning supplies', 214.30, 3],
  ['Organic bread and pastry flour', 542.00, 5],
  ['Heavy cream and mascarpone', 286.80, 2],
  ['Mango, passion fruit, and coconut', 378.25, 4],
  ['Printed allergen labels and order forms', 169.90, 7],
];

async function ensureSupplierOrders() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('LOCK TABLE supplier_orders IN SHARE ROW EXCLUSIVE MODE');
    const count = Number((await client.query('SELECT COUNT(*) FROM supplier_orders')).rows[0].count);
    const suppliers = (await client.query('SELECT id FROM suppliers ORDER BY id LIMIT 15')).rows;
    if (suppliers.length === 0) throw new Error('At least one supplier is required before demo supplier orders can be added.');

    for (let index = count; index < 15; index += 1) {
      const [items, totalCost, leadDays] = demoOrders[index % demoOrders.length];
      const supplier = suppliers[index % suppliers.length];
      await client.query(
        `INSERT INTO supplier_orders
          (supplier_id, order_date, expected_delivery, items, total_cost, status, received_date, notes)
         VALUES ($1, CURRENT_DATE, CURRENT_DATE + $2::int, $3, $4, 'ordered', NULL, $5)`,
        [supplier.id, leadDays, items, totalCost, `Fictional demonstration purchase plan ${index + 1}; not submitted to a supplier and not paid.`],
      );
    }
    await client.query('COMMIT');
    return { before: count, after: Math.max(count, 15), added: Math.max(0, 15 - count) };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  ensureSupplierOrders()
    .then((result) => console.log(`Supplier orders preserved; ${result.added} fictional planning rows added (${result.after} total).`))
    .catch((error) => { console.error(error.message); process.exitCode = 1; })
    .finally(() => pool.end());
}

module.exports = { ensureSupplierOrders };
