import React, { useState, useEffect } from 'react';
import { api } from '../utils';

// VIZ #1 — Oven Schedule Gantt
// Each row = one oven; bars = scheduled bake slots on the selected day
export default function ProductionGanttView() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const today = new Date().toISOString().slice(0, 10);
  const [start, setStart] = useState(today);
  const [days, setDays] = useState(7);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api(`/custom-views/oven-gantt?start=${start}&days=${days}`);
      if (res.error) setError(res.error);
      else setData(res);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const statusColor = (s) => {
    const c = {
      scheduled: '#3B82F6',
      in_progress: '#F59E0B',
      completed: '#10B981',
      cancelled: '#EF4444',
    };
    return c[(s || '').toLowerCase()] || '#6B7280';
  };

  const renderBar = (t) => {
    const [sh, sm] = t.start_time.split(':').map(Number);
    const [eh, em] = t.end_time.split(':').map(Number);
    const startMin = sh * 60 + sm;
    const endMin = eh * 60 + em;
    const totalDay = 24 * 60;
    const leftPct = (startMin / totalDay) * 100;
    const widthPct = Math.max(2, ((endMin - startMin) / totalDay) * 100);
    return (
      <div
        key={t.id}
        title={`Oven #${t.oven_number} • ${t.recipe_name} • ${t.start_time}-${t.end_time} @ ${t.temperature_f || '?'}°F`}
        style={{
          position: 'absolute',
          left: `${leftPct}%`,
          width: `${widthPct}%`,
          height: 22,
          background: statusColor(t.status),
          color: '#fff',
          fontSize: 11,
          padding: '2px 6px',
          borderRadius: 3,
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
          boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
        }}
      >
        {t.recipe_name} {t.temperature_f ? `(${t.temperature_f}°F)` : ''}
      </div>
    );
  };

  // Group by date -> oven_number
  const byDate = {};
  (data?.tasks || []).forEach(t => {
    if (!byDate[t.date]) byDate[t.date] = {};
    if (!byDate[t.date][t.oven_number]) byDate[t.date][t.oven_number] = [];
    byDate[t.date][t.oven_number].push(t);
  });

  return (
    <div style={{ background: '#fff', padding: 20, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <h3 style={{ marginTop: 0 }}>Oven Schedule Gantt</h3>
      <p style={{ color: '#6B7280', fontSize: 13, marginTop: 0 }}>
        Visualize bake slots across each oven so production planners can spot conflicts and idle time at a glance.
      </p>

      <div style={{ display: 'flex', gap: 12, alignItems: 'end', marginBottom: 16, flexWrap: 'wrap' }}>
        <div>
          <label style={{ display: 'block', fontSize: 12, color: '#666' }}>Start date</label>
          <input type="date" value={start} onChange={e => setStart(e.target.value)} style={{ padding: 6 }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, color: '#666' }}>Days</label>
          <input type="number" min={1} max={30} value={days} onChange={e => setDays(parseInt(e.target.value) || 7)} style={{ padding: 6, width: 80 }} />
        </div>
        <button className="btn btn-primary" onClick={load} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {error && <div style={{ color: '#DC2626', padding: 12, background: '#FEE2E2', borderRadius: 4 }}>{error}</div>}

      {data && (
        <>
          <div style={{ fontSize: 13, color: '#555', marginBottom: 12 }}>
            {data.tasks.length} bake slots · {data.summary_by_oven.length} ovens · {data.summary_by_date.length} days
          </div>

          {data.summary_by_oven.length > 0 && (
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
              {data.summary_by_oven.map(o => (
                <div key={o.oven_number} style={{ padding: 8, background: '#F3F4F6', borderRadius: 4, fontSize: 12 }}>
                  <strong>Oven #{o.oven_number}</strong>: {o.task_count} slots · {o.total_hours}h
                </div>
              ))}
            </div>
          )}

          {Object.keys(byDate).length === 0 && (
            <div style={{ padding: 30, textAlign: 'center', color: '#888', background: '#F9FAFB', borderRadius: 4 }}>
              No oven schedules in this window.
            </div>
          )}

          {Object.entries(byDate).sort().map(([date, ovens]) => (
            <div key={date} style={{ marginBottom: 20, borderTop: '1px solid #E5E7EB', paddingTop: 10 }}>
              <div style={{ fontWeight: 600, marginBottom: 8, color: '#1F2937' }}>
                {new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </div>
              {/* Hour scale */}
              <div style={{ position: 'relative', height: 16, background: '#F3F4F6', borderRadius: 2, marginBottom: 4, marginLeft: 80 }}>
                {[0, 6, 12, 18, 24].map(h => (
                  <div key={h} style={{
                    position: 'absolute',
                    left: `${(h / 24) * 100}%`,
                    fontSize: 10,
                    color: '#6B7280',
                    transform: 'translateX(-50%)',
                  }}>{h}:00</div>
                ))}
              </div>
              {Object.entries(ovens).sort((a, b) => Number(a[0]) - Number(b[0])).map(([ovenNum, tasks]) => (
                <div key={ovenNum} style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                  <div style={{ width: 80, fontSize: 12, fontWeight: 600, color: '#374151' }}>Oven #{ovenNum}</div>
                  <div style={{ position: 'relative', flex: 1, height: 26, background: '#F9FAFB', borderRadius: 2 }}>
                    {tasks.map(renderBar)}
                  </div>
                </div>
              ))}
            </div>
          ))}

          <div style={{ marginTop: 16, fontSize: 12, color: '#666', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {['scheduled', 'in_progress', 'completed', 'cancelled'].map(s => (
              <span key={s} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 12, height: 12, background: statusColor(s), borderRadius: 2, display: 'inline-block' }}></span>
                {s.replace('_', ' ')}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
