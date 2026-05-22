const bcrypt = require('bcryptjs');
const pool = require('/Users/erolakarsu/projects/AIBakeryProductionManager/backend/db');
(async () => {
  const r = await pool.query('SELECT email, password FROM users WHERE email=$1', ['admin@sweetrise.com']);
  const u = r.rows[0];
  console.log('hash:', u.password);
  console.log('matches password123:', await bcrypt.compare('password123', u.password));
  await pool.end();
})();
