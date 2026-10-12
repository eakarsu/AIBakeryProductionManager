import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils';
import StatusBadge from './StatusBadge';
import Toast from './Toast';

const PAGE_SIZE = 15;

export default function CrudPage({ title, icon, endpoint, columns, formFields, renderDetail, searchPlaceholder }) {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1, limit: PAGE_SIZE });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const load = useCallback(async (signal) => {
    setLoading(true);
    setLoadError('');
    const query = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
    if (search) query.set('search', search);
    try {
      const result = await api(`/${endpoint}?${query}`, { signal });
      const rows = Array.isArray(result) ? result : result.data;
      if (!Array.isArray(rows)) throw new Error('The list returned an invalid response.');
      setItems(rows.slice(0, PAGE_SIZE));
      setPagination(result.pagination || { page, total: rows.length, totalPages: 1, limit: PAGE_SIZE });
    } catch (error) {
      if (error.name !== 'AbortError') {
        setItems([]);
        setLoadError(error.message || `Unable to load ${title.toLowerCase()}.`);
      }
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [endpoint, page, search, title]);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const handleSave = async () => {
    try {
      if (editItem) {
        await api(`/${endpoint}/${editItem.id}`, { method: 'PUT', body: formData });
        setToast({ msg: 'Updated successfully', type: 'success' });
      } else {
        await api(`/${endpoint}`, { method: 'POST', body: formData });
        setToast({ msg: 'Created successfully', type: 'success' });
      }
      setShowForm(false);
      setEditItem(null);
      setFormData({});
      await load();
    } catch (error) {
      setToast({ msg: error.message || 'The item could not be saved.', type: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      await api(`/${endpoint}/${id}`, { method: 'DELETE' });
      setSelected(null);
      setToast({ msg: 'Deleted successfully', type: 'success' });
      await load();
    } catch (error) {
      setToast({ msg: error.message || 'The item could not be deleted.', type: 'error' });
    }
  };

  const openEdit = (item) => {
    setEditItem(item);
    setFormData(item);
    setShowForm(true);
    setSelected(null);
  };

  const openNew = () => {
    setEditItem(null);
    setFormData({});
    setShowForm(true);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <button className="back-btn" onClick={() => navigate('/dashboard')}>← Back to Dashboard</button>
          <h1>{icon} {title}</h1>
        </div>
        <button className="btn btn-primary" onClick={openNew}>+ New {title.replace(/s$/, '').replace(/ies$/, 'y')}</button>
      </div>

      <div className="table-container">
        <div className="table-toolbar">
          <input
            className="search-input"
            placeholder={searchPlaceholder || `Search ${title.toLowerCase()}...`}
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            {pagination.total} {pagination.total === 1 ? 'item' : 'items'}
          </span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                {columns.map(col => <th key={col.key}>{col.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={columns.length} className="native-list-message">Loading {title.toLowerCase()}…</td></tr>
              ) : loadError ? (
                <tr><td colSpan={columns.length} className="native-list-message">
                  <div className="native-load-error" role="alert">
                    <strong>{title} could not be loaded.</strong>
                    <p>{loadError}</p>
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => load()}>Retry</button>
                  </div>
                </td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={columns.length} className="native-list-message">No items found</td></tr>
              ) : (
                items.map(item => (
                  <tr key={item.id} onClick={() => setSelected(item)}>
                    {columns.map(col => (
                      <td key={col.key}>
                        {col.render ? col.render(item[col.key], item) : (item[col.key] ?? '-')}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!loading && !loadError && pagination.totalPages > 1 && (
          <nav className="native-pagination" aria-label={`${title} pages`}>
            <button type="button" className="btn btn-outline btn-sm" disabled={page <= 1} onClick={() => setPage(current => Math.max(1, current - 1))}>Previous</button>
            <span>Page {pagination.page} of {pagination.totalPages}</span>
            <button type="button" className="btn btn-outline btn-sm" disabled={page >= pagination.totalPages} onClick={() => setPage(current => Math.min(pagination.totalPages, current + 1))}>Next</button>
          </nav>
        )}
      </div>

      {/* Detail Panel */}
      {selected && (
        <div className="detail-overlay" onClick={(e) => e.target === e.currentTarget && setSelected(null)}>
          <div className="detail-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>{icon} Detail View</h2>
              <button className="btn btn-outline btn-sm" onClick={() => setSelected(null)}>✕ Close</button>
            </div>
            {renderDetail ? renderDetail(selected) : (
              Object.entries(selected).map(([key, val]) => (
                <div className="detail-row" key={key}>
                  <div className="label">{key.replace(/_/g, ' ')}</div>
                  <div className="value">
                    {key === 'status' ? <StatusBadge status={val} /> : (val?.toString() || '-')}
                  </div>
                </div>
              ))
            )}
            <div className="detail-actions">
              <button className="btn btn-outline" onClick={() => setSelected(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => openEdit(selected)}>✏️ Edit</button>
              <button className="btn btn-danger" onClick={() => handleDelete(selected.id)}>🗑️ Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal">
            <h2>{editItem ? 'Edit' : 'New'} {title.replace(/s$/, '').replace(/ies$/, 'y')}</h2>
            {formFields.map(field => (
              <div className="form-group" key={field.key}>
                <label>{field.label}</label>
                {field.type === 'textarea' ? (
                  <textarea
                    value={formData[field.key] || ''}
                    onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                    placeholder={field.placeholder}
                  />
                ) : field.type === 'select' ? (
                  <select
                    value={formData[field.key] || ''}
                    onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                  >
                    <option value="">Select...</option>
                    {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                ) : (
                  <input
                    type={field.type || 'text'}
                    value={formData[field.key] || ''}
                    onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                    placeholder={field.placeholder}
                  />
                )}
              </div>
            ))}
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => { setShowForm(false); setEditItem(null); }}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}>{editItem ? 'Update' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
