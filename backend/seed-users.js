const bcrypt = require('bcryptjs');
const pool = require('./db');

function requireDemoPassword() {
  const password = process.env.DEMO_PASSWORD || process.env.SEED_DEMO_PASSWORD || process.env.DEMO_SEED_PASSWORD || '';
  if (password.length < 12 || password.length > 1024) throw new Error('DEMO_PASSWORD must contain 12-1024 characters');
  return password;
}

async function seedUsers() {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(requireDemoPassword(), salt);

  await pool.query('DELETE FROM users');
  await pool.query(
    `INSERT INTO users (email, password, name, role) VALUES ($1, $2, 'Admin User', 'admin')`,
    ['admin@sweetrise.com', hash]
  );
  await pool.query(
    `INSERT INTO users (email, password, name, role) VALUES ($1, $2, 'Head Baker', 'baker')`,
    ['baker@sweetrise.com', hash]
  );

  console.log('Demo login users provisioned from the local environment.');
  await pool.end();
}

seedUsers().catch(console.error);
