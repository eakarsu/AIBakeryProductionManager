import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils';
import StatusBadge from '../components/StatusBadge';

function BackHeader({ title, icon, action }) {
  const navigate = useNavigate();
  return (
    <div className="page-header">
      <div>
        <button className="back-btn" onClick={() => navigate('/dashboard')}>← Back to Dashboard</button>
        <h1>{icon} {title}</h1>
      </div>
      {action}
    </div>
  );
}

function MetricCard({ label, value }) {
  return (
    <div className="stat-card">
      <div className="stat-info">
        <h3>{value ?? 0}</h3>
        <p>{label}</p>
      </div>
    </div>
  );
}

export function ProductionAnalyticsPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api('/analytics/production').then(setData);
  }, []);

  const topItems = data?.top_produced_items || [];
  const ovenDays = data?.oven_utilization_by_day || [];
  const wasteTrend = data?.waste_trend_30_days || [];
  const revenue = data?.revenue_per_batch_by_category || [];

  return (
    <div>
      <BackHeader title="Production Analytics" icon="📊" />
      <div className="stats-grid">
        <MetricCard label="Top Items Tracked" value={topItems.length} />
        <MetricCard label="Oven Days Analyzed" value={ovenDays.length} />
        <MetricCard label="Waste Days" value={wasteTrend.length} />
        <MetricCard label="Revenue Categories" value={revenue.length} />
      </div>

      <div className="insight-grid">
        <section className="insight-panel">
          <h2>Top Produced Items</h2>
          <table>
            <thead><tr><th>Recipe</th><th>Category</th><th>Batches</th><th>Schedules</th></tr></thead>
            <tbody>
              {topItems.map(item => (
                <tr key={`${item.name}-${item.category}`}>
                  <td>{item.name}</td>
                  <td>{item.category || '-'}</td>
                  <td>{item.total_batches || 0}</td>
                  <td>{item.schedule_count || 0}</td>
                </tr>
              ))}
              {topItems.length === 0 && <tr><td colSpan="4">No production analytics yet.</td></tr>}
            </tbody>
          </table>
        </section>

        <section className="insight-panel">
          <h2>Oven Utilization</h2>
          <table>
            <thead><tr><th>Day</th><th>Used Slots</th><th>Total Slots</th><th>Utilization</th></tr></thead>
            <tbody>
              {ovenDays.map(day => (
                <tr key={day.day_of_week}>
                  <td>{day.day_of_week?.trim()}</td>
                  <td>{day.used_slots}</td>
                  <td>{day.total_slots}</td>
                  <td>{day.utilization_pct || 0}%</td>
                </tr>
              ))}
              {ovenDays.length === 0 && <tr><td colSpan="4">No oven schedule data yet.</td></tr>}
            </tbody>
          </table>
        </section>

        <section className="insight-panel">
          <h2>Waste Trend</h2>
          <table>
            <thead><tr><th>Date</th><th>Waste Cost</th><th>Revenue</th><th>Waste %</th></tr></thead>
            <tbody>
              {wasteTrend.map(day => (
                <tr key={day.date}>
                  <td>{day.date}</td>
                  <td>${parseFloat(day.waste_cost || 0).toFixed(2)}</td>
                  <td>${parseFloat(day.revenue || 0).toFixed(2)}</td>
                  <td>{day.waste_pct || 0}%</td>
                </tr>
              ))}
              {wasteTrend.length === 0 && <tr><td colSpan="4">No waste records in the last 30 days.</td></tr>}
            </tbody>
          </table>
        </section>

        <section className="insight-panel">
          <h2>Revenue by Category</h2>
          <table>
            <thead><tr><th>Category</th><th>Batches</th><th>Avg / Batch</th><th>Estimated Total</th></tr></thead>
            <tbody>
              {revenue.map(item => (
                <tr key={item.category}>
                  <td>{item.category || '-'}</td>
                  <td>{item.total_batches}</td>
                  <td>${parseFloat(item.avg_revenue_per_batch || 0).toFixed(2)}</td>
                  <td>${parseFloat(item.estimated_total_revenue || 0).toFixed(2)}</td>
                </tr>
              ))}
              {revenue.length === 0 && <tr><td colSpan="4">No completed batch revenue data yet.</td></tr>}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}

export function InventoryAlertsPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api('/inventory/alerts').then(setData);
  }, []);

  const alerts = data?.low_stock_alerts || [];
  const expiring = data?.expiring_soon || [];
  const summary = data?.summary || {};

  return (
    <div>
      <BackHeader title="Inventory Alerts" icon="🚨" />
      <div className="stats-grid">
        <MetricCard label="Out of Stock" value={summary.out_of_stock} />
        <MetricCard label="Critical" value={summary.critical} />
        <MetricCard label="Low" value={summary.low} />
        <MetricCard label="Expiring Soon" value={summary.expiring_within_7_days} />
      </div>

      <div className="insight-grid">
        <section className="insight-panel">
          <h2>Low Stock</h2>
          <table>
            <thead><tr><th>Ingredient</th><th>Level</th><th>Stock</th><th>Par</th><th>Supplier</th></tr></thead>
            <tbody>
              {alerts.map(item => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td><StatusBadge status={item.alert_level?.toLowerCase()} /></td>
                  <td>{item.current_stock} {item.unit}</td>
                  <td>{item.par_level} {item.unit}</td>
                  <td>{item.supplier || '-'}</td>
                </tr>
              ))}
              {alerts.length === 0 && <tr><td colSpan="5">No low-stock alerts.</td></tr>}
            </tbody>
          </table>
        </section>

        <section className="insight-panel">
          <h2>Expiring Soon</h2>
          <table>
            <thead><tr><th>Ingredient</th><th>Stock</th><th>Expiry</th><th>Days</th></tr></thead>
            <tbody>
              {expiring.map(item => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.current_stock} {item.unit}</td>
                  <td>{item.expiry_date ? new Date(item.expiry_date).toLocaleDateString() : '-'}</td>
                  <td>{item.days_until_expiry}</td>
                </tr>
              ))}
              {expiring.length === 0 && <tr><td colSpan="4">No ingredients expiring within 7 days.</td></tr>}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}

export function BatchAlertsPage() {
  const [days, setDays] = useState(7);
  const [severity, setSeverity] = useState('all');
  const [data, setData] = useState(null);
  const [thresholds, setThresholds] = useState(null);
  const [config, setConfig] = useState({ batch_type: 'default', temp_min_f: 325, temp_max_f: 425, duration_max_minutes: 120, enabled: true });

  const load = () => {
    api(`/batch-alerts?days=${days}&severity=${severity}`).then(setData);
    api('/batch-alerts/thresholds').then(setThresholds);
  };

  useEffect(() => { load(); }, []);

  const saveThreshold = async () => {
    await api('/batch-alerts/configure', { method: 'POST', body: config });
    load();
  };

  const alerts = data?.data || [];
  const summary = data?.summary || {};

  return (
    <div>
      <BackHeader title="Batch Alerts" icon="⚠️" action={<button className="btn btn-primary" onClick={load}>Refresh</button>} />

      <div className="filter-bar">
        <div className="form-group">
          <label>Days</label>
          <input type="number" min="1" max="365" value={days} onChange={e => setDays(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Severity</label>
          <select value={severity} onChange={e => setSeverity(e.target.value)}>
            <option value="all">All</option>
            <option value="critical">Critical</option>
            <option value="warning">Warning</option>
          </select>
        </div>
      </div>

      <div className="stats-grid">
        <MetricCard label="Batches Checked" value={summary.total_batches_checked} />
        <MetricCard label="Total Alerts" value={summary.total_alerts} />
        <MetricCard label="Critical" value={summary.critical_count} />
        <MetricCard label="Warning" value={summary.warning_count} />
      </div>

      <div className="insight-grid">
        <section className="insight-panel">
          <h2>Alerted Batches</h2>
          <table>
            <thead><tr><th>Batch</th><th>Recipe</th><th>Date</th><th>Severity</th><th>Alerts</th></tr></thead>
            <tbody>
              {alerts.map(batch => (
                <tr key={batch.id}>
                  <td>{batch.batch_number}</td>
                  <td>{batch.recipe_name || '-'}</td>
                  <td>{batch.batch_date ? new Date(batch.batch_date).toLocaleDateString() : '-'}</td>
                  <td><StatusBadge status={batch.highest_severity?.toLowerCase()} /></td>
                  <td>{batch.alerts?.map(a => a.message).join(' | ')}</td>
                </tr>
              ))}
              {alerts.length === 0 && <tr><td colSpan="5">No batch alerts found.</td></tr>}
            </tbody>
          </table>
        </section>

        <section className="insight-panel">
          <h2>Thresholds</h2>
          <div className="form-row">
            <div className="form-group">
              <label>Batch Type</label>
              <input value={config.batch_type} onChange={e => setConfig({ ...config, batch_type: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Duration Max</label>
              <input type="number" value={config.duration_max_minutes} onChange={e => setConfig({ ...config, duration_max_minutes: parseInt(e.target.value) })} />
            </div>
            <div className="form-group">
              <label>Temp Min</label>
              <input type="number" value={config.temp_min_f} onChange={e => setConfig({ ...config, temp_min_f: parseFloat(e.target.value) })} />
            </div>
            <div className="form-group">
              <label>Temp Max</label>
              <input type="number" value={config.temp_max_f} onChange={e => setConfig({ ...config, temp_max_f: parseFloat(e.target.value) })} />
            </div>
          </div>
          <button className="btn btn-primary" onClick={saveThreshold}>Save Threshold</button>
          <table style={{ marginTop: 20 }}>
            <thead><tr><th>Type</th><th>Temp Range</th><th>Duration</th><th>Enabled</th></tr></thead>
            <tbody>
              {(thresholds?.thresholds || []).map(t => (
                <tr key={t.id}>
                  <td>{t.batch_type}</td>
                  <td>{t.temp_min_f}–{t.temp_max_f}°F</td>
                  <td>{t.duration_max_minutes} min</td>
                  <td>{t.enabled ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}

export function ProductionSheetPage() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [error, setError] = useState('');

  const downloadPdf = async () => {
    setError('');
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/production/${date}/sheet/pdf`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) {
      setError('Could not generate production sheet for that date.');
      return;
    }
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `production-sheet-${date}.pdf`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="ai-feature-page">
      <BackHeader title="Production Sheet PDF" icon="🧾" />
      <div className="ai-form">
        <h3>Daily Production Sheet</h3>
        <p style={{ color: 'var(--text-light)', marginBottom: 20 }}>
          Download a PDF with production schedules, oven assignments, ingredient totals, and staff coverage for the selected date.
        </p>
        <div className="form-group">
          <label>Production Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} />
        </div>
        <button className="btn btn-primary" onClick={downloadPdf}>Download PDF</button>
        {error && <div className="error-msg" style={{ marginTop: 16 }}>{error}</div>}
      </div>
    </div>
  );
}
