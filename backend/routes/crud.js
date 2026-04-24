const express = require('express');
const pool = require('../db');

function createCrudRouter(tableName, columns, searchColumn) {
  const router = express.Router();

  // GET all
  router.get('/', async (req, res) => {
    try {
      const { search, sort, order } = req.query;
      let query = `SELECT * FROM ${tableName}`;
      const params = [];
      if (search && searchColumn) {
        params.push(`%${search}%`);
        query += ` WHERE ${searchColumn} ILIKE $${params.length}`;
      }
      if (sort) {
        const dir = order === 'asc' ? 'ASC' : 'DESC';
        query += ` ORDER BY ${sort} ${dir}`;
      } else {
        query += ` ORDER BY id DESC`;
      }
      const result = await pool.query(query, params);
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // GET one
  router.get('/:id', async (req, res) => {
    try {
      const result = await pool.query(`SELECT * FROM ${tableName} WHERE id = $1`, [req.params.id]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST create
  router.post('/', async (req, res) => {
    try {
      const keys = Object.keys(req.body).filter(k => columns.includes(k));
      const values = keys.map(k => req.body[k]);
      const placeholders = keys.map((_, i) => `$${i + 1}`);
      const result = await pool.query(
        `INSERT INTO ${tableName} (${keys.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`,
        values
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // PUT update
  router.put('/:id', async (req, res) => {
    try {
      const keys = Object.keys(req.body).filter(k => columns.includes(k));
      const values = keys.map(k => req.body[k]);
      const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
      values.push(req.params.id);
      const result = await pool.query(
        `UPDATE ${tableName} SET ${setClause} WHERE id = $${values.length} RETURNING *`,
        values
      );
      if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // DELETE
  router.delete('/:id', async (req, res) => {
    try {
      const result = await pool.query(`DELETE FROM ${tableName} WHERE id = $1 RETURNING *`, [req.params.id]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
      res.json({ message: 'Deleted successfully', deleted: result.rows[0] });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
}

module.exports = createCrudRouter;
