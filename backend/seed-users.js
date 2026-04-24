const bcrypt = require('bcryptjs');
const pool = require('./db');

async function seedUsers() {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash('password123', salt);

  await pool.query('DELETE FROM users');
  await pool.query(
    `INSERT INTO users (email, password, name, role) VALUES ($1, $2, 'Admin User', 'admin')`,
    ['admin@sweetrise.com', hash]
  );
  await pool.query(
    `INSERT INTO users (email, password, name, role) VALUES ($1, $2, 'Head Baker', 'baker')`,
    ['baker@sweetrise.com', hash]
  );

  console.log('Users seeded with password: password123');
  await pool.end();
}

seedUsers().catch(console.error);
