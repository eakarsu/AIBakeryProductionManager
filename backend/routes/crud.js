const express = require('express');
const pool = require('../db');
const authenticateToken = require('../middleware/auth');

function createCrudRouter(tableName, columns, searchColumn) {
  const router = express.Router();

  // Apply auth to all CRUD routes
  router.use(authenticateToken);

  // GET all — paginated (?page=1&limit=20&search=)
  router.get('/', async (req, res) => {
    try {
      const page = Math.max(1, parseInt(req.query.page) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
      const offset = (page - 1) * limit;
      const { search, sort, order } = req.query;

      let where = '';
      const params = [];

      if (search && searchColumn) {
        params.push(`%${search}%`);
        where = ` WHERE ${searchColumn} ILIKE $${params.length}`;
      }

      const sortCol = sort && columns.includes(sort) ? sort : 'id';
      const sortDir = order === 'asc' ? 'ASC' : 'DESC';

      const countResult = await pool.query(
        `SELECT COUNT(*) FROM ${tableName}${where}`,
        params
      );
      const total = parseInt(countResult.rows[0].count);

      const dataParams = [...params, limit, offset];
      const result = await pool.query(
        `SELECT * FROM ${tableName}${where} ORDER BY ${sortCol} ${sortDir} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        dataParams
      );

      res.json({
        data: result.rows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // GET one
  router.get('/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' });
      const result = await pool.query(`SELECT * FROM ${tableName} WHERE id = $1`, [id]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST create — validate that at least one allowed column is provided
  router.post('/', async (req, res) => {
    try {
      if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({ error: 'Request body must be a JSON object' });
      }
      const keys = Object.keys(req.body).filter(k => columns.includes(k));
      if (keys.length === 0) {
        return res.status(400).json({ error: `At least one of these fields is required: ${columns.join(', ')}` });
      }
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
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' });
      if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({ error: 'Request body must be a JSON object' });
      }
      const keys = Object.keys(req.body).filter(k => columns.includes(k));
      if (keys.length === 0) {
        return res.status(400).json({ error: `At least one of these fields is required: ${columns.join(', ')}` });
      }
      const values = keys.map(k => req.body[k]);
      const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
      values.push(id);
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
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' });
      const result = await pool.query(`DELETE FROM ${tableName} WHERE id = $1 RETURNING *`, [id]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
      res.json({ message: 'Deleted successfully', deleted: result.rows[0] });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
}

module.exports = createCrudRouter;
