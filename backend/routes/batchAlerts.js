const express = require('express');
const pool = require('../db');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const { body, query, validationResult } = require('express-validator');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

// Helper: fetch thresholds from DB (with in-memory default fallback)
async function getThresholds() {
  try {
    const result = await pool.query('SELECT * FROM batch_alert_thresholds WHERE enabled = true');
    const map = {};
    for (const row of result.rows) {
      map[row.batch_type.toLowerCase()] = row;
    }
    if (!map['default']) {
      map['default'] = { temp_min_f: 325, temp_max_f: 425, duration_max_minutes: 120, enabled: true };
    }
    return map;
  } catch {
    return { default: { temp_min_f: 325, temp_max_f: 425, duration_max_minutes: 120, enabled: true } };
  }
}

// GET /api/batch-alerts — paginated list of batches with out-of-range temps/durations
router.get(
  '/',
  authenticateToken,
  [
    query('days').optional().isInt({ min: 1, max: 365 }).withMessage('days must be between 1 and 365'),
    query('batch_type').optional().isString(),
    query('severity').optional().isIn(['all', 'warning', 'critical']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  validateRequest,
  async (req, res) => {
    try {
      const days = parseInt(req.query.days) || 7;
      const batchType = req.query.batch_type || null;
      const severity = req.query.severity || 'all';
      const page = Math.max(1, parseInt(req.query.page) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 25));
      const offset = (page - 1) * limit;

      const alertThresholds = await getThresholds();

      const batchesResult = await pool.query(
        `SELECT bt.*, r.name as recipe_name, r.category, r.bake_temp_f as target_temp_f,
                r.bake_time_minutes as target_bake_time,
                EXTRACT(EPOCH FROM (bt.completed_at - bt.started_at))/60 as actual_duration_minutes
         FROM batch_tracking bt
         LEFT JOIN recipes r ON bt.recipe_id = r.id
         WHERE bt.batch_date >= NOW() - $1 * INTERVAL '1 day'
           AND bt.temperature IS NOT NULL
           ${batchType ? `AND r.category ILIKE $2` : ''}
         ORDER BY bt.batch_date DESC`,
        batchType ? [days, `%${batchType}%`] : [days]
      );

      const batches = batchesResult.rows;
      const alertedBatches = [];

      for (const batch of batches) {
        const category = (batch.category || 'default').toLowerCase();
        const thresholds = alertThresholds[category] || alertThresholds['default'];
        if (!thresholds || thresholds.enabled === false) continue;

        const temp = parseFloat(batch.temperature);
        const targetTemp = parseFloat(batch.target_temp_f);
        const actualDuration = parseFloat(batch.actual_duration_minutes);
        const maxDuration = thresholds.duration_max_minutes || 120;
        const alerts = [];

        if (!isNaN(temp)) {
          if (temp < thresholds.temp_min_f) {
            alerts.push({
              type: 'TEMPERATURE_LOW',
              severity: temp < thresholds.temp_min_f - 25 ? 'CRITICAL' : 'WARNING',
              message: `Temperature ${temp}°F is below minimum ${thresholds.temp_min_f}°F`,
              deviation: thresholds.temp_min_f - temp,
            });
          } else if (temp > thresholds.temp_max_f) {
            alerts.push({
              type: 'TEMPERATURE_HIGH',
              severity: temp > thresholds.temp_max_f + 25 ? 'CRITICAL' : 'WARNING',
              message: `Temperature ${temp}°F exceeds maximum ${thresholds.temp_max_f}°F`,
              deviation: temp - thresholds.temp_max_f,
            });
          }
          if (!isNaN(targetTemp) && targetTemp > 0) {
            const tempDiff = Math.abs(temp - targetTemp);
            if (tempDiff > 25) {
              alerts.push({
                type: 'TEMPERATURE_DEVIATION',
                severity: tempDiff > 50 ? 'CRITICAL' : 'WARNING',
                message: `Temperature ${temp}°F deviates ${tempDiff.toFixed(1)}°F from recipe target ${targetTemp}°F`,
                deviation: tempDiff,
              });
            }
          }
        }

        if (!isNaN(actualDuration) && actualDuration > maxDuration) {
          alerts.push({
            type: 'DURATION_EXCEEDED',
            severity: actualDuration > maxDuration * 1.5 ? 'CRITICAL' : 'WARNING',
            message: `Batch took ${actualDuration.toFixed(0)} minutes, exceeding maximum ${maxDuration} minutes`,
            deviation: actualDuration - maxDuration,
          });
        }

        if (batch.status === 'failed' || batch.status === 'rejected') {
          alerts.push({
            type: 'BATCH_FAILURE',
            severity: 'CRITICAL',
            message: `Batch marked as ${batch.status}`,
            deviation: null,
          });
        }

        if (alerts.length > 0) {
          const hasCritical = alerts.some(a => a.severity === 'CRITICAL');
          if (severity === 'critical' && !hasCritical) continue;
          if (severity === 'warning' && hasCritical) continue;

          alertedBatches.push({
            ...batch,
            alerts,
            highest_severity: hasCritical ? 'CRITICAL' : 'WARNING',
            alert_count: alerts.length,
          });
        }
      }

      const total = alertedBatches.length;
      const paginatedAlerts = alertedBatches.slice(offset, offset + limit);
      const criticalCount = alertedBatches.filter(b => b.highest_severity === 'CRITICAL').length;
      const warningCount = alertedBatches.filter(b => b.highest_severity === 'WARNING').length;

      res.json({
        data: paginatedAlerts,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        summary: {
          total_batches_checked: batches.length,
          total_alerts: total,
          critical_count: criticalCount,
          warning_count: warningCount,
          days_range: days,
        },
        current_thresholds: alertThresholds,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// POST /api/batch-alerts/configure — persisted to DB
router.post(
  '/configure',
  authenticateToken,
  [
    body('batch_type').notEmpty().isString().withMessage('batch_type is required'),
    body('temp_min_f').optional().isFloat({ min: 100, max: 600 }).withMessage('temp_min_f must be between 100 and 600'),
    body('temp_max_f').optional().isFloat({ min: 100, max: 600 }).withMessage('temp_max_f must be between 100 and 600'),
    body('duration_max_minutes').optional().isInt({ min: 1, max: 1440 }),
    body('enabled').optional().isBoolean(),
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { batch_type, temp_min_f, temp_max_f, duration_max_minutes, enabled } = req.body;

      if (temp_min_f !== undefined && temp_max_f !== undefined) {
        if (parseFloat(temp_min_f) >= parseFloat(temp_max_f)) {
          return res.status(400).json({ error: 'temp_min_f must be less than temp_max_f' });
        }
      }

      const key = batch_type.toLowerCase();

      // Upsert into DB
      const result = await pool.query(
        `INSERT INTO batch_alert_thresholds (batch_type, temp_min_f, temp_max_f, duration_max_minutes, enabled, updated_by, updated_at)
         VALUES ($1,
           COALESCE($2, 325), COALESCE($3, 425), COALESCE($4, 120), COALESCE($5, true),
           $6, NOW()
         )
         ON CONFLICT (batch_type) DO UPDATE SET
           temp_min_f = COALESCE($2, batch_alert_thresholds.temp_min_f),
           temp_max_f = COALESCE($3, batch_alert_thresholds.temp_max_f),
           duration_max_minutes = COALESCE($4, batch_alert_thresholds.duration_max_minutes),
           enabled = COALESCE($5, batch_alert_thresholds.enabled),
           updated_by = $6,
           updated_at = NOW()
         RETURNING *`,
        [
          key,
          temp_min_f !== undefined ? parseFloat(temp_min_f) : null,
          temp_max_f !== undefined ? parseFloat(temp_max_f) : null,
          duration_max_minutes !== undefined ? parseInt(duration_max_minutes) : null,
          enabled !== undefined ? enabled : null,
          req.user?.id || null,
        ]
      );

      res.json({
        message: `Alert thresholds updated for batch type: ${batch_type}`,
        batch_type: key,
        thresholds: result.rows[0],
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// GET /api/batch-alerts/thresholds
router.get('/thresholds', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM batch_alert_thresholds ORDER BY batch_type ASC');
    res.json({
      thresholds: result.rows,
      configured_types: result.rows.map(r => r.batch_type),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
