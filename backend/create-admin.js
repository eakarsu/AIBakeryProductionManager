'use strict';

const bcrypt = require('bcryptjs');
const pool = require('./db');

async function main() {
  if (process.env.BOOTSTRAP_ACKNOWLEDGEMENT !== 'create-initial-admin') {
    throw new Error('Set BOOTSTRAP_ACKNOWLEDGEMENT=create-initial-admin to provision an operator');
  }
  const email = String(process.env.PROVISION_ADMIN_EMAIL || process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = process.env.PROVISION_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD;
  const name = String(process.env.PROVISION_ADMIN_NAME || 'Initial Administrator').trim();
  if (!email.includes('@') || typeof password !== 'string' || password.length < 12) {
    throw new Error('A valid operator email and password of at least 12 characters are required');
  }
  const passwordHash = await bcrypt.hash(password, 12);
  await pool.query(
    `INSERT INTO users (email, password, name, role)
     VALUES ($1, $2, $3, 'admin')
     ON CONFLICT (email) DO UPDATE
       SET password = EXCLUDED.password, name = EXCLUDED.name, role = 'admin'`,
    [email, passwordHash, name]
  );
}

main()
  .then(() => pool.end())
  .catch(async (error) => {
    console.error(error.message);
    await pool.end().catch(() => {});
    process.exitCode = 1;
  });
