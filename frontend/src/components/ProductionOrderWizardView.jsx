import React, { useState, useEffect } from 'react';
import { api } from '../utils';

// NON-VIZ #2 — Production Schedule Editor (CRUD batches)
// Lists, creates, updates, and deletes batch_tracking rows.
export default function ProductionOrderWizardView() {
  const today = new Date().toISOString().slice(0, 10);
  const [start, setStart] = useState(
    new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10)
  );
  const [days, setDays] = useState(21);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [busyId, setBusyId] = useState(null);

  // Create form state
  const [form, setForm] = useState({
    recipe_id: '',
    batch_number: '',
    batch_date: today,
    quantity: 1,
    unit: 'units',
    status: 'mixing',
    temperature: '',
    notes: '',
  });

  // Edit form state
  const [editForm, setEditForm] = useState({});

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api(`/custom-views/production-editor?start=${start}&days=${days}`);
      if (res.error) setError(res.error);
      else setData(res);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const createBatch = async () => {
    setError('');
    if (!form.recipe_id) { setError('Select a recipe'); return; }
    if (!form.quantity || form.quantity <= 0) { setError('Quantity must be > 0'); return; }
    try {
      const res = await api('/custom-views/production-editor', {
        method: 'POST',
        body: {
          recipe_id: parseInt(form.recipe_id),
          batch_number: form.batch_number || undefined,
          batch_date: form.batch_date,
          quantity: parseFloat(form.quantity),
          unit: form.unit,
          status: form.status,
          temperature: form.temperature ? parseFloat(form.temperature) : null,
          notes: form.notes,
        },
      });
      if (res.error) { setError(res.error); return; }
      setForm({ ...form, batch_number: '', notes: '' });
      load();
    } catch (e) { setError(e.message); }
  };

  const startEdit = (batch) => {
    setEditingId(batch.id);
    setEditForm({
      recipe_id: batch.recipe_id,
      batch_number: batch.batch_number || '',
      batch_date: (batch.batch_date || '').slice(0, 10),
      quantity: batch.quantity,
      unit: batch.unit || 'units',
      status: batch.status || 'mixing',
      temperature: batch.temperature || '',
      notes: batch.notes || '',
    });
  };

  const cancelEdit = () => { setEditingId(null); setEditForm({}); };

  const saveEdit = async (id) => {
    setBusyId(id);
    setError('');
    try {
      const res = await api(`/custom-views/production-editor/${id}`, {
        method: 'PUT',
        body: {
          recipe_id: parseInt(editForm.recipe_id),
          batch_number: editForm.batch_number,
          batch_date: editForm.batch_date,
          quantity: parseFloat(editForm.quantity),
          unit: editForm.unit,
          status: editForm.status,
          temperature: editForm.temperature ? parseFloat(editForm.temperature) : null,
          notes: editForm.notes,
        },
      });
      if (res.error) { setError(res.error); return; }
      cancelEdit();
      load();
    } catch (e) { setError(e.message); }
    finally { setBusyId(null); }
  };

  const deleteBatch = async (id) => {
    if (!window.confirm('Delete this batch?')) return;
    setBusyId(id);
    setError('');
    try {
      const res = await api(`/custom-views/production-editor/${id}`, { method: 'DELETE' });
      if (res.error) { setError(res.error); return; }
      load();
    } catch (e) { setError(e.message); }
    finally { setBusyId(null); }
  };

  const recipes = data?.recipes || [];
  const statusOptions = data?.status_options || ['mixing', 'proofing', 'baking', 'cooling', 'completed'];
  const batches = data?.batches || [];

  const statusBadge = (s) => {
    const palette = {
      mixing: ['#DBEAFE', '#1E40AF'],
      proofing: ['#FEF3C7', '#92400E'],
      baking: ['#FECACA', '#991B1B'],
      cooling: ['#E0E7FF', '#3730A3'],
      completed: ['#D1FAE5', '#065F46'],
    };
    const [bg, fg] = palette[s] || ['#F3F4F6', '#374151'];
    return (
      <span style={{ padding: '2px 8px', borderRadius: 10, background: bg, color: fg, fontSize: 11, fontWeight: 600 }}>
        {s}
      </span>
    );
  };

  return (
    <div style={{ background: '#fff', padding: 20, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <h3 style={{ marginTop: 0 }}>Production Schedule Editor</h3>
      <p style={{ color: '#6B7280', fontSize: 13, marginTop: 0 }}>
        Add, update, and remove production batches across the schedule window.
      </p>

      {/* Window controls */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'end', marginBottom: 16, flexWrap: 'wrap' }}>
        <div>
          <label style={{ display: 'block', fontSize: 12, color: '#666' }}>Start date</label>
          <input type="date" value={start} onChange={e => setStart(e.target.value)} style={{ padding: 6 }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, color: '#666' }}>Days</label>
          <input type="number" min={1} max={60} value={days} onChange={e => setDays(parseInt(e.target.value) || 21)} style={{ padding: 6, width: 80 }} />
        </div>
        <button className="btn btn-primary" onClick={load} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {error && <div style={{ color: '#DC2626', padding: 12, background: '#FEE2E2', borderRadius: 4, marginBottom: 12 }}>{error}</div>}

      {/* Summary */}
      {data && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px,1fr))', gap: 8, marginBottom: 16 }}>
          <div style={{ padding: 10, background: '#F9FAFB', borderRadius: 4, borderLeft: '4px solid #3B82F6' }}>
            <div style={{ fontSize: 11, color: '#6B7280' }}>BATCHES</div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{data.summary.total_batches}</div>
          </div>
          {Object.entries(data.summary.by_status).map(([s, n]) => (
            <div key={s} style={{ padding: 10, background: '#F9FAFB', borderRadius: 4 }}>
              <div style={{ fontSize: 11, color: '#6B7280', textTransform: 'uppercase' }}>{s}</div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{n}</div>
            </div>
          ))}
        </div>
      )}

      {/* Create form */}
      <div style={{ background: '#F9FAFB', padding: 14, borderRadius: 6, marginBottom: 20, border: '1px solid #E5E7EB' }}>
        <div style={{ fontWeight: 600, marginBottom: 10, fontSize: 14 }}>+ Add New Batch</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, color: '#666' }}>Recipe</label>
            <select value={form.recipe_id} onChange={e => setForm({ ...form, recipe_id: e.target.value })} style={{ padding: 6, width: '100%' }}>
              <option value="">-- Select --</option>
              {recipes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, color: '#666' }}>Batch Number (auto if blank)</label>
            <input value={form.batch_number} onChange={e => setForm({ ...form, batch_number: e.target.value })} placeholder="auto" style={{ padding: 6, width: '100%' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, color: '#666' }}>Date</label>
            <input type="date" value={form.batch_date} onChange={e => setForm({ ...form, batch_date: e.target.value })} style={{ padding: 6, width: '100%' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, color: '#666' }}>Quantity</label>
            <input type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} style={{ padding: 6, width: '100%' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, color: '#666' }}>Unit</label>
            <input value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} placeholder="loaves, dozen…" style={{ padding: 6, width: '100%' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, color: '#666' }}>Status</label>
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={{ padding: 6, width: '100%' }}>
              {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, color: '#666' }}>Temp (°F)</label>
            <input type="number" value={form.temperature} onChange={e => setForm({ ...form, temperature: e.target.value })} style={{ padding: 6, width: '100%' }} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', fontSize: 11, color: '#666' }}>Notes</label>
            <input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Optional notes" style={{ padding: 6, width: '100%' }} />
          </div>
        </div>
        <button className="btn btn-primary" onClick={createBatch} style={{ marginTop: 12 }}>
          Create Batch
        </button>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#F3F4F6' }}>
              <th style={{ padding: 8, textAlign: 'left', borderBottom: '1px solid #E5E7EB' }}>Batch #</th>
              <th style={{ padding: 8, textAlign: 'left', borderBottom: '1px solid #E5E7EB' }}>Recipe</th>
              <th style={{ padding: 8, textAlign: 'left', borderBottom: '1px solid #E5E7EB' }}>Date</th>
              <th style={{ padding: 8, textAlign: 'right', borderBottom: '1px solid #E5E7EB' }}>Qty</th>
              <th style={{ padding: 8, textAlign: 'center', borderBottom: '1px solid #E5E7EB' }}>Status</th>
              <th style={{ padding: 8, textAlign: 'right', borderBottom: '1px solid #E5E7EB' }}>Temp</th>
              <th style={{ padding: 8, textAlign: 'left', borderBottom: '1px solid #E5E7EB' }}>Notes</th>
              <th style={{ padding: 8, textAlign: 'right', borderBottom: '1px solid #E5E7EB' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {batches.length === 0 && (
              <tr>
                <td colSpan={8} style={{ padding: 20, textAlign: 'center', color: '#888' }}>
                  No batches in this window.
                </td>
              </tr>
            )}
            {batches.map(b => {
              const isEdit = editingId === b.id;
              return (
                <tr key={b.id} style={{ borderBottom: '1px solid #F3F4F6', background: isEdit ? '#FFFBEB' : 'transparent' }}>
                  <td style={{ padding: 8 }}>
                    {isEdit
                      ? <input value={editForm.batch_number} onChange={e => setEditForm({ ...editForm, batch_number: e.target.value })} style={{ padding: 4, width: 130 }} />
                      : <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{b.batch_number}</span>}
                  </td>
                  <td style={{ padding: 8 }}>
                    {isEdit
                      ? (
                        <select value={editForm.recipe_id} onChange={e => setEditForm({ ...editForm, recipe_id: e.target.value })} style={{ padding: 4 }}>
                          {recipes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>
                      )
                      : b.recipe_name || `Recipe #${b.recipe_id}`}
                  </td>
                  <td style={{ padding: 8 }}>
                    {isEdit
                      ? <input type="date" value={editForm.batch_date} onChange={e => setEditForm({ ...editForm, batch_date: e.target.value })} style={{ padding: 4 }} />
                      : (b.batch_date ? new Date(b.batch_date).toLocaleDateString() : '-')}
                  </td>
                  <td style={{ padding: 8, textAlign: 'right' }}>
                    {isEdit
                      ? <input type="number" value={editForm.quantity} onChange={e => setEditForm({ ...editForm, quantity: e.target.value })} style={{ padding: 4, width: 70 }} />
                      : `${b.quantity} ${b.unit || ''}`}
                  </td>
                  <td style={{ padding: 8, textAlign: 'center' }}>
                    {isEdit
                      ? (
                        <select value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })} style={{ padding: 4 }}>
                          {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      )
                      : statusBadge(b.status)}
                  </td>
                  <td style={{ padding: 8, textAlign: 'right' }}>
                    {isEdit
                      ? <input type="number" value={editForm.temperature} onChange={e => setEditForm({ ...editForm, temperature: e.target.value })} style={{ padding: 4, width: 60 }} />
                      : (b.temperature ? `${b.temperature}°F` : '-')}
                  </td>
                  <td style={{ padding: 8, color: '#555' }}>
                    {isEdit
                      ? <input value={editForm.notes} onChange={e => setEditForm({ ...editForm, notes: e.target.value })} style={{ padding: 4, width: 140 }} />
                      : (b.notes || '-')}
                  </td>
                  <td style={{ padding: 8, textAlign: 'right', whiteSpace: 'nowrap' }}>
                    {isEdit ? (
                      <>
                        <button className="btn btn-primary btn-sm" disabled={busyId === b.id} onClick={() => saveEdit(b.id)}>Save</button>
                        <button className="btn btn-outline btn-sm" onClick={cancelEdit} style={{ marginLeft: 4 }}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <button className="btn btn-outline btn-sm" onClick={() => startEdit(b)}>Edit</button>
                        <button className="btn btn-outline btn-sm" disabled={busyId === b.id} onClick={() => deleteBatch(b.id)} style={{ marginLeft: 4, color: '#DC2626' }}>Delete</button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
