import React, { useState, useEffect } from 'react';
import { api } from '../utils';

// VIZ #2 — Waste / Spoilage Heatmap by Product
// Rows = products, cols = days, cell shade = $ cost impact
export default function IngredientStockChartView() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [days, setDays] = useState(30);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api(`/custom-views/waste-heatmap?days=${days}`);
      if (res.error) setError(res.error);
      else setData(res);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const cellColor = (intensity, cost) => {
    if (!cost || cost <= 0) return '#F9FAFB';
    // Red ramp: lighter to darker
    const alpha = Math.max(0.1, Math.min(1, intensity / 100));
    return `rgba(220, 38, 38, ${alpha.toFixed(2)})`;
  };

  const dayAxis = data?.day_axis || [];
  const matrix = data?.matrix || [];

  return (
    <div style={{ background: '#fff', padding: 20, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <h3 style={{ marginTop: 0 }}>Waste / Spoilage Heatmap by Product</h3>
      <p style={{ color: '#6B7280', fontSize: 13, marginTop: 0 }}>
        Where waste cost concentrates by product over time — darker cells flag spoilage hotspots that need attention.
      </p>

      <div style={{ display: 'flex', gap: 12, alignItems: 'end', marginBottom: 16, flexWrap: 'wrap' }}>
        <div>
          <label style={{ display: 'block', fontSize: 12, color: '#666' }}>Lookback (days)</label>
          <select value={days} onChange={e => setDays(parseInt(e.target.value))} style={{ padding: 6 }}>
            <option value={7}>7 days</option>
            <option value={14}>14 days</option>
            <option value={30}>30 days</option>
            <option value={60}>60 days</option>
            <option value={90}>90 days</option>
          </select>
        </div>
        <button className="btn btn-primary" onClick={load} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {error && <div style={{ color: '#DC2626', padding: 12, background: '#FEE2E2', borderRadius: 4 }}>{error}</div>}

      {data && (
        <>
          {/* Summary tiles */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px,1fr))', gap: 10, marginBottom: 18 }}>
            {[
              { label: 'Products', val: data.summary.total_products, color: '#1F2937' },
              { label: 'Total Waste Cost', val: `$${data.summary.total_waste_cost.toFixed(2)}`, color: '#DC2626' },
              { label: 'Incidents', val: data.summary.total_incidents, color: '#F59E0B' },
              { label: 'Avg / Product', val: `$${data.summary.avg_cost_per_product.toFixed(2)}`, color: '#3B82F6' },
              { label: 'Max Day Cost', val: `$${data.max_cell_cost.toFixed(2)}`, color: '#7F1D1D' },
            ].map(s => (
              <div key={s.label} style={{ padding: 12, background: '#F9FAFB', borderRadius: 6, textAlign: 'center', borderLeft: `4px solid ${s.color}` }}>
                <div style={{ fontSize: 11, color: '#6B7280', textTransform: 'uppercase' }}>{s.label}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: s.color }}>{s.val}</div>
              </div>
            ))}
          </div>

          {/* Reasons breakdown */}
          {data.reasons_breakdown && data.reasons_breakdown.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 14 }}>Waste Cost by Reason</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {data.reasons_breakdown.map(r => (
                  <span key={r.reason} style={{
                    padding: '4px 10px',
                    background: '#FEE2E2',
                    color: '#7F1D1D',
                    borderRadius: 12,
                    fontSize: 12,
                  }}>
                    {(r.reason || '').replace(/_/g, ' ')}: ${r.cost.toFixed(2)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Heatmap */}
          {matrix.length === 0 ? (
            <div style={{ padding: 30, textAlign: 'center', color: '#888', background: '#F9FAFB', borderRadius: 4 }}>
              No waste recorded in this window.
            </div>
          ) : (
            <div style={{ overflowX: 'auto', border: '1px solid #E5E7EB', borderRadius: 4 }}>
              <table style={{ borderCollapse: 'collapse', fontSize: 11 }}>
                <thead>
                  <tr>
                    <th style={{
                      position: 'sticky', left: 0, background: '#F3F4F6',
                      padding: '8px 10px', textAlign: 'left', borderRight: '1px solid #E5E7EB',
                      borderBottom: '1px solid #E5E7EB', minWidth: 180, zIndex: 1,
                    }}>Product</th>
                    <th style={{ padding: '8px 6px', background: '#F3F4F6', borderBottom: '1px solid #E5E7EB' }}>Total $</th>
                    {dayAxis.map(d => (
                      <th key={d} style={{
                        padding: '6px 2px',
                        background: '#F3F4F6',
                        borderBottom: '1px solid #E5E7EB',
                        fontSize: 9,
                        color: '#6B7280',
                        minWidth: 22,
                        writingMode: 'vertical-rl',
                        transform: 'rotate(180deg)',
                      }}>{d.slice(5)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {matrix.map(p => (
                    <tr key={p.item_name}>
                      <td style={{
                        position: 'sticky', left: 0, background: '#fff',
                        padding: '6px 10px', borderRight: '1px solid #E5E7EB',
                        borderBottom: '1px solid #F3F4F6',
                        whiteSpace: 'nowrap',
                      }}>
                        <div style={{ fontWeight: 500 }}>{p.item_name}</div>
                        <div style={{ fontSize: 10, color: '#6B7280' }}>{p.category}</div>
                      </td>
                      <td style={{
                        padding: '6px 10px',
                        borderBottom: '1px solid #F3F4F6',
                        textAlign: 'right',
                        fontWeight: 600,
                        color: '#7F1D1D',
                      }}>${p.total_cost.toFixed(2)}</td>
                      {p.cells.map(c => (
                        <td key={c.day} title={`${p.item_name} • ${c.day} • $${c.cost.toFixed(2)}`} style={{
                          padding: 0,
                          minWidth: 22,
                          height: 28,
                          background: cellColor(c.intensity, c.cost),
                          borderBottom: '1px solid #F3F4F6',
                          textAlign: 'center',
                          color: c.intensity > 60 ? '#fff' : '#111',
                          fontSize: 9,
                        }}>
                          {c.cost > 0 ? Math.round(c.cost) : ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div style={{ marginTop: 14, fontSize: 12, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>Color scale:</span>
            <span style={{ width: 20, height: 14, background: cellColor(10, 1), border: '1px solid #E5E7EB' }}></span>
            <span style={{ width: 20, height: 14, background: cellColor(40, 1) }}></span>
            <span style={{ width: 20, height: 14, background: cellColor(70, 1) }}></span>
            <span style={{ width: 20, height: 14, background: cellColor(100, 1) }}></span>
            <span>low → high waste cost</span>
          </div>
        </>
      )}
    </div>
  );
}
