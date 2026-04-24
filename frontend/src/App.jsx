import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import Markdown from 'react-markdown';

const API = '/api';

function api(path, options = {}) {
  const token = localStorage.getItem('token');
  return fetch(`${API}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  }).then(r => r.json());
}

// Toast notification
function Toast({ message, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return <div className={`toast ${type}`}>{message}</div>;
}

// Status badge helper
function StatusBadge({ status }) {
  const map = {
    completed: 'success', delivered: 'success', paid: 'success', active: 'success', operational: 'success', ready: 'success',
    in_progress: 'info', confirmed: 'info', invoiced: 'info', baking: 'info', proofing: 'info', cooling: 'info',
    planned: 'default', scheduled: 'default', mixing: 'default',
    pending: 'warning', deposit: 'warning', needs_attention: 'warning', overdue: 'danger',
    cancelled: 'danger', unpaid: 'danger', spoilage: 'danger',
  };
  return <span className={`badge badge-${map[status] || 'default'}`}>{(status || '').replace(/_/g, ' ')}</span>;
}

// AI Response Display Component
function AIResponse({ data, loading }) {
  if (loading) {
    return (
      <div className="ai-response-container">
        <div className="ai-loading">
          <div className="spinner"></div>
          <span>AI is thinking...</span>
        </div>
      </div>
    );
  }
  if (!data) return null;

  const content = data?.choices?.[0]?.message?.content || 'No response generated';
  const model = data?.model || 'AI';
  const tokens = data?.usage?.total_tokens;

  return (
    <div className="ai-response-container">
      <div className="ai-response-header">
        <div className="ai-icon">✨</div>
        <div>
          <h3>AI Analysis</h3>
          <small>Powered by AI Assistant</small>
        </div>
      </div>
      <div className="ai-response-body">
        <Markdown>{content}</Markdown>
      </div>
      <div className="ai-response-meta">
        <span className="model-badge">{model}</span>
        {tokens && <span>{tokens} tokens used</span>}
      </div>
    </div>
  );
}

// ===== LOGIN PAGE =====
function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api('/auth/login', { method: 'POST', body: { email, password } });
      if (res.error) { setError(res.error); return; }
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
      navigate('/dashboard');
    } catch (err) {
      setError('Login failed. Please try again.');
    }
  };

  const autofill = () => {
    setEmail('admin@sweetrise.com');
    setPassword('password123');
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="logo">🧁</div>
        <h1>Sweet Rise Bakery</h1>
        <p className="subtitle">Production Management System</p>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email" required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" required />
          </div>
          <button type="submit" className="btn btn-primary btn-full">Sign In</button>
        </form>
        <button onClick={autofill} className="btn btn-autofill btn-full">
          🔑 Auto-Fill Demo Credentials
        </button>
      </div>
    </div>
  );
}

// ===== SIDEBAR =====
const NAV_ITEMS = [
  { section: 'Overview' },
  { key: 'dashboard', label: 'Dashboard', icon: '📊', path: '/dashboard' },
  { section: 'Production' },
  { key: 'recipes', label: 'Recipes', icon: '📖', path: '/recipes' },
  { key: 'production', label: 'Production Schedule', icon: '📅', path: '/production' },
  { key: 'batches', label: 'Batch Tracking', icon: '🥖', path: '/batches' },
  { key: 'ovens', label: 'Oven Scheduling', icon: '🔥', path: '/ovens' },
  { section: 'Orders' },
  { key: 'wholesale', label: 'Wholesale Orders', icon: '📦', path: '/wholesale' },
  { key: 'cakes', label: 'Custom Cakes', icon: '🎂', path: '/cakes' },
  { section: 'Inventory' },
  { key: 'inventory', label: 'Ingredients', icon: '🧈', path: '/inventory' },
  { key: 'suppliers', label: 'Suppliers', icon: '🚛', path: '/suppliers' },
  { key: 'supplier-orders', label: 'Supplier Orders', icon: '📋', path: '/supplier-orders' },
  { section: 'Quality & Safety' },
  { key: 'allergens', label: 'Allergen Tracking', icon: '⚠️', path: '/allergens' },
  { key: 'temperature', label: 'Temperature Logs', icon: '🌡️', path: '/temperature' },
  { key: 'waste', label: 'Waste Tracking', icon: '🗑️', path: '/waste' },
  { section: 'Operations' },
  { key: 'staff', label: 'Staff Scheduling', icon: '👥', path: '/staff' },
  { key: 'equipment', label: 'Equipment', icon: '🔧', path: '/equipment' },
  { key: 'delivery', label: 'Delivery Routes', icon: '🚚', path: '/delivery' },
  { key: 'reports', label: 'Daily Reports', icon: '📈', path: '/reports' },
  { section: 'AI Tools' },
  { key: 'ai-scaling', label: 'Recipe Scaling AI', icon: '⚖️', path: '/ai/scaling', ai: true },
  { key: 'ai-forecast', label: 'Demand Forecast AI', icon: '📉', path: '/ai/forecast', ai: true },
  { key: 'ai-marketing', label: 'Marketing Copy AI', icon: '✍️', path: '/ai/marketing', ai: true },
  { key: 'ai-nutrition', label: 'Nutrition Label AI', icon: '🏷️', path: '/ai/nutrition', ai: true },
  { key: 'ai-waste', label: 'Waste Reduction AI', icon: '♻️', path: '/ai/waste', ai: true },
  { key: 'ai-cake', label: 'Cake Design AI', icon: '🎨', path: '/ai/cake', ai: true },
];

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>🧁 Sweet Rise</h2>
        <p>Production Manager</p>
      </div>
      <div className="sidebar-nav">
        {NAV_ITEMS.map((item, i) => {
          if (item.section) return <div key={i} className="sidebar-section">{item.section}</div>;
          return (
            <button
              key={item.key}
              className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className="icon">{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </div>
      <div className="sidebar-logout">
        <button className="sidebar-link" onClick={logout}>
          <span className="icon">🚪</span> Logout ({user.name || 'User'})
        </button>
      </div>
    </div>
  );
}

// ===== GENERIC CRUD PAGE =====
function CrudPage({ title, icon, endpoint, columns, formFields, renderDetail, searchPlaceholder }) {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const load = useCallback(() => {
    api(`/${endpoint}${search ? `?search=${encodeURIComponent(search)}` : ''}`).then(setItems);
  }, [endpoint, search]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
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
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    await api(`/${endpoint}/${id}`, { method: 'DELETE' });
    setSelected(null);
    setToast({ msg: 'Deleted successfully', type: 'success' });
    load();
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
            onChange={e => setSearch(e.target.value)}
          />
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{items.length} items</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                {columns.map(col => <th key={col.key}>{col.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr><td colSpan={columns.length} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No items found</td></tr>
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

// ===== DASHBOARD =====
function Dashboard() {
  const [stats, setStats] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    api('/dashboard').then(setStats);
  }, []);

  const features = [
    { key: 'recipes', icon: '📖', title: 'Recipe Management', desc: 'Manage recipes, ingredients, yields, and costs', path: '/recipes' },
    { key: 'production', icon: '📅', title: 'Production Schedule', desc: 'Plan daily and weekly batch production', path: '/production' },
    { key: 'batches', icon: '🥖', title: 'Batch Tracking', desc: 'Track dough and batter batch status', path: '/batches' },
    { key: 'ovens', icon: '🔥', title: 'Oven Scheduling', desc: 'Manage oven capacity and schedules', path: '/ovens' },
    { key: 'wholesale', icon: '📦', title: 'Wholesale Orders', desc: 'Manage wholesale customer orders', path: '/wholesale' },
    { key: 'cakes', icon: '🎂', title: 'Custom Cake Orders', desc: 'Track custom cake orders and designs', path: '/cakes' },
    { key: 'inventory', icon: '🧈', title: 'Ingredient Inventory', desc: 'Track stock levels and par levels', path: '/inventory' },
    { key: 'suppliers', icon: '🚛', title: 'Suppliers', desc: 'Manage supplier contacts and info', path: '/suppliers' },
    { key: 'supplier-orders', icon: '📋', title: 'Supplier Orders', desc: 'Track orders placed with suppliers', path: '/supplier-orders' },
    { key: 'allergens', icon: '⚠️', title: 'Allergen Tracking', desc: 'Track allergens per recipe', path: '/allergens' },
    { key: 'temperature', icon: '🌡️', title: 'Temperature Logs', desc: 'Health dept compliance temp logs', path: '/temperature' },
    { key: 'waste', icon: '🗑️', title: 'Waste Tracking', desc: 'Track overproduction and spoilage', path: '/waste' },
    { key: 'staff', icon: '👥', title: 'Staff Scheduling', desc: 'Manage staff shifts and stations', path: '/staff' },
    { key: 'equipment', icon: '🔧', title: 'Equipment Maintenance', desc: 'Track equipment maintenance logs', path: '/equipment' },
    { key: 'delivery', icon: '🚚', title: 'Delivery Routes', desc: 'Plan and track delivery routes', path: '/delivery' },
    { key: 'reports', icon: '📈', title: 'Daily Reports', desc: 'View daily production reports', path: '/reports' },
  ];

  const aiFeatures = [
    { key: 'ai-scaling', icon: '⚖️', title: 'Recipe Scaling AI', desc: 'Scale recipes with smart ingredient substitutions', path: '/ai/scaling' },
    { key: 'ai-forecast', icon: '📉', title: 'Demand Forecast AI', desc: 'AI-powered production demand forecasting', path: '/ai/forecast' },
    { key: 'ai-marketing', icon: '✍️', title: 'Marketing Copy AI', desc: 'Generate menu descriptions and marketing copy', path: '/ai/marketing' },
    { key: 'ai-nutrition', icon: '🏷️', title: 'Nutrition Label AI', desc: 'Generate nutritional labels from recipes', path: '/ai/nutrition' },
    { key: 'ai-waste', icon: '♻️', title: 'Waste Reduction AI', desc: 'AI recommendations for reducing waste', path: '/ai/waste' },
    { key: 'ai-cake', icon: '🎨', title: 'Cake Design AI', desc: 'AI-assisted custom cake design consultation', path: '/ai/cake' },
  ];

  return (
    <div>
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome to Sweet Rise Bakery Production Manager</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon recipes">📖</div>
          <div className="stat-info"><h3>{stats.totalRecipes || 0}</h3><p>Total Recipes</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon production">📅</div>
          <div className="stat-info"><h3>{stats.todaySchedules || 0}</h3><p>Today's Batches</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orders">📦</div>
          <div className="stat-info"><h3>{stats.activeOrders || 0}</h3><p>Active Orders</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon cakes">🎂</div>
          <div className="stat-info"><h3>{stats.activeCakeOrders || 0}</h3><p>Cake Orders</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon inventory">🧈</div>
          <div className="stat-info"><h3>{stats.lowStockItems || 0}</h3><p>Low Stock Items</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon waste">🗑️</div>
          <div className="stat-info"><h3>${stats.weeklyWasteCost?.toFixed(2) || '0.00'}</h3><p>Weekly Waste</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon batches">🥖</div>
          <div className="stat-info"><h3>{stats.activeBatches || 0}</h3><p>Active Batches</p></div>
        </div>
      </div>

      <h2 style={{ marginBottom: 16, color: 'var(--primary)' }}>Management Features</h2>
      <div className="features-grid" style={{ marginBottom: 32 }}>
        {features.map(f => (
          <div key={f.key} className="feature-card" onClick={() => navigate(f.path)}>
            <div className="card-icon">{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>

      <h2 style={{ marginBottom: 16, color: 'var(--primary)' }}>AI-Powered Tools</h2>
      <div className="features-grid">
        {aiFeatures.map(f => (
          <div key={f.key} className="feature-card ai-card" onClick={() => navigate(f.path)}>
            <div className="card-icon">{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== FEATURE PAGES =====

function RecipesPage() {
  return <CrudPage
    title="Recipes" icon="📖" endpoint="recipes" searchPlaceholder="Search recipes..."
    columns={[
      { key: 'name', label: 'Name' },
      { key: 'category', label: 'Category' },
      { key: 'yield_amount', label: 'Yield', render: (v, r) => `${v} ${r.yield_unit}` },
      { key: 'cost_per_unit', label: 'Cost/Unit', render: v => v ? `$${parseFloat(v).toFixed(2)}` : '-' },
      { key: 'prep_time_minutes', label: 'Prep (min)' },
      { key: 'bake_time_minutes', label: 'Bake (min)' },
      { key: 'bake_temp_f', label: 'Temp (°F)' },
    ]}
    formFields={[
      { key: 'name', label: 'Recipe Name', placeholder: 'e.g., Sourdough Bread' },
      { key: 'category', label: 'Category', type: 'select', options: ['Bread','Pastry','Cake','Cookie','Muffin','Tart','Quick Bread'] },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'steps', label: 'Steps', type: 'textarea', placeholder: 'Step by step instructions...' },
      { key: 'yield_amount', label: 'Yield Amount', type: 'number' },
      { key: 'yield_unit', label: 'Yield Unit', placeholder: 'e.g., loaves, pieces' },
      { key: 'cost_per_unit', label: 'Cost per Unit ($)', type: 'number' },
      { key: 'prep_time_minutes', label: 'Prep Time (min)', type: 'number' },
      { key: 'bake_time_minutes', label: 'Bake Time (min)', type: 'number' },
      { key: 'bake_temp_f', label: 'Bake Temp (°F)', type: 'number' },
    ]}
  />;
}

function ProductionPage() {
  return <CrudPage
    title="Production Schedules" icon="📅" endpoint="production-schedules"
    columns={[
      { key: 'recipe_id', label: 'Recipe ID' },
      { key: 'scheduled_date', label: 'Date', render: v => v ? new Date(v).toLocaleDateString() : '-' },
      { key: 'shift', label: 'Shift' },
      { key: 'batch_count', label: 'Batches' },
      { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
      { key: 'assigned_to', label: 'Assigned To' },
    ]}
    formFields={[
      { key: 'recipe_id', label: 'Recipe ID', type: 'number' },
      { key: 'scheduled_date', label: 'Date', type: 'date' },
      { key: 'shift', label: 'Shift', type: 'select', options: ['Early AM','Morning','Afternoon','Evening'] },
      { key: 'batch_count', label: 'Batch Count', type: 'number' },
      { key: 'status', label: 'Status', type: 'select', options: ['planned','in_progress','completed','cancelled'] },
      { key: 'assigned_to', label: 'Assigned To' },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ]}
  />;
}

function BatchesPage() {
  return <CrudPage
    title="Batch Tracking" icon="🥖" endpoint="batch-tracking"
    columns={[
      { key: 'batch_number', label: 'Batch #' },
      { key: 'batch_date', label: 'Date', render: v => v ? new Date(v).toLocaleDateString() : '-' },
      { key: 'recipe_id', label: 'Recipe ID' },
      { key: 'quantity', label: 'Qty', render: (v, r) => `${v} ${r.unit}` },
      { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
      { key: 'temperature', label: 'Temp (°F)' },
    ]}
    formFields={[
      { key: 'batch_number', label: 'Batch Number', placeholder: 'e.g., SD-20260323-001' },
      { key: 'recipe_id', label: 'Recipe ID', type: 'number' },
      { key: 'batch_date', label: 'Batch Date', type: 'date' },
      { key: 'quantity', label: 'Quantity', type: 'number' },
      { key: 'unit', label: 'Unit', placeholder: 'e.g., loaves, pieces' },
      { key: 'status', label: 'Status', type: 'select', options: ['mixing','proofing','baking','cooling','completed'] },
      { key: 'temperature', label: 'Temperature (°F)', type: 'number' },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ]}
  />;
}

function OvensPage() {
  return <CrudPage
    title="Oven Schedules" icon="🔥" endpoint="oven-schedules"
    columns={[
      { key: 'oven_number', label: 'Oven #' },
      { key: 'recipe_id', label: 'Recipe ID' },
      { key: 'scheduled_date', label: 'Date', render: v => v ? new Date(v).toLocaleDateString() : '-' },
      { key: 'start_time', label: 'Start' },
      { key: 'end_time', label: 'End' },
      { key: 'temperature_f', label: 'Temp (°F)' },
      { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
    ]}
    formFields={[
      { key: 'oven_number', label: 'Oven Number', type: 'number' },
      { key: 'recipe_id', label: 'Recipe ID', type: 'number' },
      { key: 'batch_id', label: 'Batch ID', type: 'number' },
      { key: 'scheduled_date', label: 'Date', type: 'date' },
      { key: 'start_time', label: 'Start Time', type: 'time' },
      { key: 'end_time', label: 'End Time', type: 'time' },
      { key: 'temperature_f', label: 'Temperature (°F)', type: 'number' },
      { key: 'status', label: 'Status', type: 'select', options: ['scheduled','in_progress','completed','cancelled'] },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ]}
  />;
}

function WholesalePage() {
  return <CrudPage
    title="Wholesale Orders" icon="📦" endpoint="wholesale-orders"
    columns={[
      { key: 'customer_name', label: 'Customer' },
      { key: 'delivery_date', label: 'Delivery', render: v => v ? new Date(v).toLocaleDateString() : '-' },
      { key: 'items', label: 'Items', render: v => v?.length > 50 ? v.substring(0, 50) + '...' : v },
      { key: 'total_amount', label: 'Total', render: v => v ? `$${parseFloat(v).toFixed(2)}` : '-' },
      { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
      { key: 'payment_status', label: 'Payment', render: v => <StatusBadge status={v} /> },
    ]}
    formFields={[
      { key: 'customer_name', label: 'Customer Name' },
      { key: 'contact_email', label: 'Email', type: 'email' },
      { key: 'contact_phone', label: 'Phone' },
      { key: 'order_date', label: 'Order Date', type: 'date' },
      { key: 'delivery_date', label: 'Delivery Date', type: 'date' },
      { key: 'items', label: 'Items', type: 'textarea', placeholder: 'List items and quantities...' },
      { key: 'total_amount', label: 'Total Amount ($)', type: 'number' },
      { key: 'status', label: 'Status', type: 'select', options: ['pending','confirmed','in_progress','delivered','cancelled'] },
      { key: 'payment_status', label: 'Payment Status', type: 'select', options: ['unpaid','deposit','invoiced','paid'] },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ]}
  />;
}

function CakesPage() {
  return <CrudPage
    title="Custom Cake Orders" icon="🎂" endpoint="custom-cake-orders"
    columns={[
      { key: 'customer_name', label: 'Customer' },
      { key: 'cake_flavor', label: 'Flavor' },
      { key: 'cake_size', label: 'Size' },
      { key: 'delivery_date', label: 'Delivery', render: v => v ? new Date(v).toLocaleDateString() : '-' },
      { key: 'price', label: 'Price', render: v => v ? `$${parseFloat(v).toFixed(2)}` : '-' },
      { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
    ]}
    formFields={[
      { key: 'customer_name', label: 'Customer Name' },
      { key: 'customer_phone', label: 'Phone' },
      { key: 'customer_email', label: 'Email', type: 'email' },
      { key: 'cake_size', label: 'Size', type: 'select', options: ['6 inch','8 inch','10 inch','12 inch','14 inch','Tiered'] },
      { key: 'cake_shape', label: 'Shape', type: 'select', options: ['Round','Square','Sheet','Heart','Tiered'] },
      { key: 'cake_flavor', label: 'Cake Flavor' },
      { key: 'filling_flavor', label: 'Filling Flavor' },
      { key: 'frosting_type', label: 'Frosting', type: 'select', options: ['Buttercream','Cream Cheese','Fondant','Ganache','Whipped Cream'] },
      { key: 'design_description', label: 'Design Description', type: 'textarea' },
      { key: 'color_scheme', label: 'Color Scheme' },
      { key: 'inscription', label: 'Inscription' },
      { key: 'delivery_date', label: 'Delivery Date', type: 'date' },
      { key: 'delivery_time', label: 'Delivery Time', type: 'time' },
      { key: 'delivery_address', label: 'Delivery Address', type: 'textarea' },
      { key: 'price', label: 'Price ($)', type: 'number' },
      { key: 'deposit_paid', label: 'Deposit Paid ($)', type: 'number' },
      { key: 'status', label: 'Status', type: 'select', options: ['pending','confirmed','in_progress','ready','delivered','cancelled'] },
      { key: 'allergen_notes', label: 'Allergen Notes', type: 'textarea' },
    ]}
  />;
}

function InventoryPage() {
  return <CrudPage
    title="Ingredient Inventory" icon="🧈" endpoint="ingredient-inventory"
    columns={[
      { key: 'name', label: 'Ingredient' },
      { key: 'category', label: 'Category' },
      { key: 'current_stock', label: 'Stock', render: (v, r) => `${v} ${r.unit}` },
      { key: 'par_level', label: 'Par Level', render: (v, r) => `${v} ${r.unit}` },
      { key: 'cost_per_unit', label: 'Cost/Unit', render: v => v ? `$${parseFloat(v).toFixed(2)}` : '-' },
      { key: 'supplier', label: 'Supplier' },
      { key: 'expiry_date', label: 'Expiry', render: v => v ? new Date(v).toLocaleDateString() : '-' },
    ]}
    formFields={[
      { key: 'name', label: 'Ingredient Name' },
      { key: 'category', label: 'Category', type: 'select', options: ['Flour','Dairy','Sugar','Chocolate','Flavoring','Leavening','Seasoning','Fruit'] },
      { key: 'current_stock', label: 'Current Stock', type: 'number' },
      { key: 'unit', label: 'Unit', placeholder: 'kg, liters, dozen' },
      { key: 'par_level', label: 'Par Level', type: 'number' },
      { key: 'cost_per_unit', label: 'Cost per Unit ($)', type: 'number' },
      { key: 'supplier', label: 'Supplier' },
      { key: 'last_ordered', label: 'Last Ordered', type: 'date' },
      { key: 'expiry_date', label: 'Expiry Date', type: 'date' },
      { key: 'storage_location', label: 'Storage Location' },
    ]}
  />;
}

function SuppliersPage() {
  return <CrudPage
    title="Suppliers" icon="🚛" endpoint="suppliers"
    columns={[
      { key: 'name', label: 'Name' },
      { key: 'contact_person', label: 'Contact' },
      { key: 'category', label: 'Category' },
      { key: 'lead_time_days', label: 'Lead Time', render: v => `${v} days` },
      { key: 'payment_terms', label: 'Terms' },
      { key: 'rating', label: 'Rating', render: v => '⭐'.repeat(v || 0) },
    ]}
    formFields={[
      { key: 'name', label: 'Supplier Name' },
      { key: 'contact_person', label: 'Contact Person' },
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'phone', label: 'Phone' },
      { key: 'address', label: 'Address', type: 'textarea' },
      { key: 'lead_time_days', label: 'Lead Time (days)', type: 'number' },
      { key: 'payment_terms', label: 'Payment Terms', type: 'select', options: ['COD','Net 15','Net 30','Net 45'] },
      { key: 'category', label: 'Category' },
      { key: 'rating', label: 'Rating (1-5)', type: 'number' },
    ]}
  />;
}

function SupplierOrdersPage() {
  return <CrudPage
    title="Supplier Orders" icon="📋" endpoint="supplier-orders"
    columns={[
      { key: 'supplier_id', label: 'Supplier ID' },
      { key: 'order_date', label: 'Ordered', render: v => v ? new Date(v).toLocaleDateString() : '-' },
      { key: 'expected_delivery', label: 'Expected', render: v => v ? new Date(v).toLocaleDateString() : '-' },
      { key: 'items', label: 'Items', render: v => v?.length > 40 ? v.substring(0, 40) + '...' : v },
      { key: 'total_cost', label: 'Cost', render: v => v ? `$${parseFloat(v).toFixed(2)}` : '-' },
      { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
    ]}
    formFields={[
      { key: 'supplier_id', label: 'Supplier ID', type: 'number' },
      { key: 'order_date', label: 'Order Date', type: 'date' },
      { key: 'expected_delivery', label: 'Expected Delivery', type: 'date' },
      { key: 'items', label: 'Items', type: 'textarea' },
      { key: 'total_cost', label: 'Total Cost ($)', type: 'number' },
      { key: 'status', label: 'Status', type: 'select', options: ['ordered','shipped','delivered','cancelled'] },
      { key: 'received_date', label: 'Received Date', type: 'date' },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ]}
  />;
}

function AllergensPage() {
  return <CrudPage
    title="Allergen Tracking" icon="⚠️" endpoint="allergen-tracking"
    columns={[
      { key: 'recipe_id', label: 'Recipe ID' },
      { key: 'allergen_name', label: 'Allergen' },
      { key: 'severity', label: 'Severity', render: v => <StatusBadge status={v === 'High' ? 'danger' : v === 'Medium' ? 'warning' : 'default'} /> },
      { key: 'notes', label: 'Notes' },
    ]}
    formFields={[
      { key: 'recipe_id', label: 'Recipe ID', type: 'number' },
      { key: 'allergen_name', label: 'Allergen', type: 'select', options: ['Gluten','Dairy','Eggs','Tree Nuts','Peanuts','Soy','Fish','Shellfish','Sesame'] },
      { key: 'severity', label: 'Severity', type: 'select', options: ['Low','Medium','High'] },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ]}
  />;
}

function TemperaturePage() {
  return <CrudPage
    title="Temperature Logs" icon="🌡️" endpoint="temperature-logs"
    columns={[
      { key: 'equipment_name', label: 'Equipment' },
      { key: 'location', label: 'Location' },
      { key: 'temperature_f', label: 'Temp (°F)' },
      { key: 'acceptable_range', label: 'Range' },
      { key: 'is_in_range', label: 'In Range', render: v => v ? <span className="badge badge-success">Yes</span> : <span className="badge badge-danger">No</span> },
      { key: 'recorded_by', label: 'Recorded By' },
    ]}
    formFields={[
      { key: 'equipment_name', label: 'Equipment Name' },
      { key: 'location', label: 'Location' },
      { key: 'temperature_f', label: 'Temperature (°F)', type: 'number' },
      { key: 'acceptable_range', label: 'Acceptable Range', placeholder: 'e.g., 34-40°F' },
      { key: 'is_in_range', label: 'In Range', type: 'select', options: ['true','false'] },
      { key: 'recorded_by', label: 'Recorded By' },
      { key: 'corrective_action', label: 'Corrective Action', type: 'textarea' },
    ]}
  />;
}

function WastePage() {
  return <CrudPage
    title="Waste Tracking" icon="🗑️" endpoint="waste-tracking"
    columns={[
      { key: 'item_name', label: 'Item' },
      { key: 'category', label: 'Category' },
      { key: 'quantity', label: 'Qty', render: (v, r) => `${v} ${r.unit}` },
      { key: 'reason', label: 'Reason', render: v => (v || '').replace(/_/g, ' ') },
      { key: 'cost_impact', label: 'Cost', render: v => v ? `$${parseFloat(v).toFixed(2)}` : '-' },
      { key: 'waste_date', label: 'Date', render: v => v ? new Date(v).toLocaleDateString() : '-' },
    ]}
    formFields={[
      { key: 'item_name', label: 'Item Name' },
      { key: 'category', label: 'Category', type: 'select', options: ['Overproduction','Spoilage','Quality','Trimming','Maintenance'] },
      { key: 'quantity', label: 'Quantity', type: 'number' },
      { key: 'unit', label: 'Unit' },
      { key: 'reason', label: 'Reason', type: 'select', options: ['overproduction','spoilage','quality_issue','trimming','discard','damaged'] },
      { key: 'cost_impact', label: 'Cost Impact ($)', type: 'number' },
      { key: 'waste_date', label: 'Date', type: 'date' },
      { key: 'recorded_by', label: 'Recorded By' },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ]}
  />;
}

function StaffPage() {
  return <CrudPage
    title="Staff Schedules" icon="👥" endpoint="staff-schedules"
    columns={[
      { key: 'staff_name', label: 'Name' },
      { key: 'role', label: 'Role' },
      { key: 'shift_date', label: 'Date', render: v => v ? new Date(v).toLocaleDateString() : '-' },
      { key: 'start_time', label: 'Start' },
      { key: 'end_time', label: 'End' },
      { key: 'station', label: 'Station' },
      { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
    ]}
    formFields={[
      { key: 'staff_name', label: 'Staff Name' },
      { key: 'role', label: 'Role', type: 'select', options: ['Head Baker','Baker','Pastry Chef','Decorator','Front Counter','Delivery Driver','Manager'] },
      { key: 'shift_date', label: 'Date', type: 'date' },
      { key: 'start_time', label: 'Start Time', type: 'time' },
      { key: 'end_time', label: 'End Time', type: 'time' },
      { key: 'station', label: 'Station', type: 'select', options: ['Bread Station','Pastry Station','Cake Station','Mixing Station','Decoration Station','Retail Counter','Delivery'] },
      { key: 'status', label: 'Status', type: 'select', options: ['scheduled','active','completed','absent'] },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ]}
  />;
}

function EquipmentPage() {
  return <CrudPage
    title="Equipment Maintenance" icon="🔧" endpoint="equipment-maintenance"
    columns={[
      { key: 'equipment_name', label: 'Equipment' },
      { key: 'equipment_type', label: 'Type' },
      { key: 'last_maintenance', label: 'Last', render: v => v ? new Date(v).toLocaleDateString() : '-' },
      { key: 'next_maintenance', label: 'Next', render: v => v ? new Date(v).toLocaleDateString() : '-' },
      { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
      { key: 'cost', label: 'Cost', render: v => v ? `$${parseFloat(v).toFixed(2)}` : '-' },
    ]}
    formFields={[
      { key: 'equipment_name', label: 'Equipment Name' },
      { key: 'equipment_type', label: 'Type', type: 'select', options: ['Oven','Mixer','Refrigeration','Laminating','Proofing','Slicer','Sanitation','Dividing','Tempering','Vehicle'] },
      { key: 'last_maintenance', label: 'Last Maintenance', type: 'date' },
      { key: 'next_maintenance', label: 'Next Maintenance', type: 'date' },
      { key: 'maintenance_type', label: 'Type', type: 'select', options: ['Preventive','Corrective','Emergency'] },
      { key: 'performed_by', label: 'Performed By' },
      { key: 'status', label: 'Status', type: 'select', options: ['operational','needs_attention','overdue','out_of_service'] },
      { key: 'cost', label: 'Cost ($)', type: 'number' },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ]}
  />;
}

function DeliveryPage() {
  return <CrudPage
    title="Delivery Routes" icon="🚚" endpoint="delivery-routes"
    columns={[
      { key: 'route_name', label: 'Route' },
      { key: 'driver_name', label: 'Driver' },
      { key: 'delivery_date', label: 'Date', render: v => v ? new Date(v).toLocaleDateString() : '-' },
      { key: 'start_time', label: 'Start' },
      { key: 'estimated_end_time', label: 'Est. End' },
      { key: 'total_distance_miles', label: 'Distance', render: v => v ? `${v} mi` : '-' },
      { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
    ]}
    formFields={[
      { key: 'route_name', label: 'Route Name' },
      { key: 'driver_name', label: 'Driver Name' },
      { key: 'vehicle', label: 'Vehicle' },
      { key: 'delivery_date', label: 'Date', type: 'date' },
      { key: 'start_time', label: 'Start Time', type: 'time' },
      { key: 'estimated_end_time', label: 'Estimated End Time', type: 'time' },
      { key: 'stops', label: 'Stops', type: 'textarea', placeholder: 'List stops separated by commas...' },
      { key: 'total_distance_miles', label: 'Total Distance (mi)', type: 'number' },
      { key: 'status', label: 'Status', type: 'select', options: ['planned','scheduled','in_progress','completed','cancelled'] },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ]}
  />;
}

function ReportsPage() {
  return <CrudPage
    title="Daily Reports" icon="📈" endpoint="daily-reports"
    columns={[
      { key: 'report_date', label: 'Date', render: v => v ? new Date(v).toLocaleDateString() : '-' },
      { key: 'total_items_produced', label: 'Items' },
      { key: 'total_revenue', label: 'Revenue', render: v => v ? `$${parseFloat(v).toFixed(2)}` : '-' },
      { key: 'total_waste_cost', label: 'Waste', render: v => v ? `$${parseFloat(v).toFixed(2)}` : '-' },
      { key: 'total_orders', label: 'Orders' },
      { key: 'staff_count', label: 'Staff' },
    ]}
    formFields={[
      { key: 'report_date', label: 'Date', type: 'date' },
      { key: 'total_items_produced', label: 'Items Produced', type: 'number' },
      { key: 'total_revenue', label: 'Revenue ($)', type: 'number' },
      { key: 'total_waste_cost', label: 'Waste Cost ($)', type: 'number' },
      { key: 'total_orders', label: 'Total Orders', type: 'number' },
      { key: 'custom_orders', label: 'Custom Orders', type: 'number' },
      { key: 'wholesale_orders', label: 'Wholesale Orders', type: 'number' },
      { key: 'staff_count', label: 'Staff Count', type: 'number' },
      { key: 'highlights', label: 'Highlights', type: 'textarea' },
      { key: 'issues', label: 'Issues', type: 'textarea' },
    ]}
  />;
}

// ===== AI FEATURE PAGES =====

function AIRecipeScaling() {
  const [recipes, setRecipes] = useState([]);
  const [recipeId, setRecipeId] = useState('');
  const [targetYield, setTargetYield] = useState('');
  const [dietary, setDietary] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { api('/recipes').then(setRecipes); }, []);

  const handleSubmit = async () => {
    if (!recipeId || !targetYield) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await api('/ai/recipe-scaling', {
        method: 'POST',
        body: { recipeId: parseInt(recipeId), targetYield: parseInt(targetYield), dietaryRestrictions: dietary }
      });
      setResult(res);
    } catch (err) {
      setResult({ error: err.message });
    }
    setLoading(false);
  };

  return (
    <div className="ai-feature-page">
      <div className="page-header">
        <div>
          <button className="back-btn" onClick={() => navigate('/dashboard')}>← Back to Dashboard</button>
          <h1>⚖️ Recipe Scaling AI</h1>
        </div>
      </div>
      <div className="ai-form">
        <h3>Scale a Recipe with Ingredient Substitutions</h3>
        <div className="form-group">
          <label>Select Recipe</label>
          <select value={recipeId} onChange={e => setRecipeId(e.target.value)}>
            <option value="">Choose a recipe...</option>
            {recipes.map(r => <option key={r.id} value={r.id}>{r.name} ({r.yield_amount} {r.yield_unit})</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Target Yield</label>
          <input type="number" value={targetYield} onChange={e => setTargetYield(e.target.value)} placeholder="e.g., 48" />
        </div>
        <div className="form-group">
          <label>Dietary Restrictions (optional)</label>
          <input value={dietary} onChange={e => setDietary(e.target.value)} placeholder="e.g., gluten-free, vegan, nut-free" />
        </div>
        <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Analyzing...' : '✨ Scale Recipe with AI'}
        </button>
      </div>
      {loading && <AIResponse loading={true} />}
      {result?.aiResponse && <AIResponse data={result.aiResponse} />}
      {result?.error && <div className="error-msg" style={{ marginTop: 16 }}>{result.error}</div>}
    </div>
  );
}

function AIDemandForecast() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await api('/ai/demand-forecast', { method: 'POST', body: {} });
      setResult(res);
    } catch (err) {
      setResult({ error: err.message });
    }
    setLoading(false);
  };

  return (
    <div className="ai-feature-page">
      <div className="page-header">
        <div>
          <button className="back-btn" onClick={() => navigate('/dashboard')}>← Back to Dashboard</button>
          <h1>📉 Demand Forecast AI</h1>
        </div>
      </div>
      <div className="ai-form">
        <h3>AI-Powered Production Demand Forecasting</h3>
        <p style={{ color: 'var(--text-light)', marginBottom: 20 }}>
          Analyzes your recent production data, sales trends, and upcoming orders to forecast demand for the next 7 days.
        </p>
        <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Analyzing...' : '✨ Generate Demand Forecast'}
        </button>
      </div>
      {loading && <AIResponse loading={true} />}
      {result?.aiResponse && <AIResponse data={result.aiResponse} />}
      {result?.error && <div className="error-msg" style={{ marginTop: 16 }}>{result.error}</div>}
    </div>
  );
}

function AIMarketingCopy() {
  const [recipes, setRecipes] = useState([]);
  const [recipeId, setRecipeId] = useState('');
  const [tone, setTone] = useState('warm and artisanal');
  const [platform, setPlatform] = useState('menu, social media, and website');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { api('/recipes').then(setRecipes); }, []);

  const handleSubmit = async () => {
    if (!recipeId) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await api('/ai/marketing-copy', {
        method: 'POST',
        body: { recipeId: parseInt(recipeId), tone, platform }
      });
      setResult(res);
    } catch (err) {
      setResult({ error: err.message });
    }
    setLoading(false);
  };

  return (
    <div className="ai-feature-page">
      <div className="page-header">
        <div>
          <button className="back-btn" onClick={() => navigate('/dashboard')}>← Back to Dashboard</button>
          <h1>✍️ Marketing Copy AI</h1>
        </div>
      </div>
      <div className="ai-form">
        <h3>Generate Menu Descriptions & Marketing Copy</h3>
        <div className="form-group">
          <label>Select Product</label>
          <select value={recipeId} onChange={e => setRecipeId(e.target.value)}>
            <option value="">Choose a product...</option>
            {recipes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Tone</label>
          <select value={tone} onChange={e => setTone(e.target.value)}>
            <option value="warm and artisanal">Warm & Artisanal</option>
            <option value="luxury and sophisticated">Luxury & Sophisticated</option>
            <option value="fun and playful">Fun & Playful</option>
            <option value="health-conscious">Health-Conscious</option>
            <option value="nostalgic and homey">Nostalgic & Homey</option>
          </select>
        </div>
        <div className="form-group">
          <label>Platform</label>
          <select value={platform} onChange={e => setPlatform(e.target.value)}>
            <option value="menu, social media, and website">All Platforms</option>
            <option value="restaurant menu">Restaurant Menu</option>
            <option value="Instagram and social media">Social Media</option>
            <option value="website and online ordering">Website</option>
            <option value="email newsletter">Email Newsletter</option>
          </select>
        </div>
        <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Generating...' : '✨ Generate Marketing Copy'}
        </button>
      </div>
      {loading && <AIResponse loading={true} />}
      {result?.aiResponse && <AIResponse data={result.aiResponse} />}
      {result?.error && <div className="error-msg" style={{ marginTop: 16 }}>{result.error}</div>}
    </div>
  );
}

function AINutritionLabel() {
  const [recipes, setRecipes] = useState([]);
  const [recipeId, setRecipeId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { api('/recipes').then(setRecipes); }, []);

  const handleSubmit = async () => {
    if (!recipeId) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await api('/ai/nutritional-label', {
        method: 'POST',
        body: { recipeId: parseInt(recipeId) }
      });
      setResult(res);
    } catch (err) {
      setResult({ error: err.message });
    }
    setLoading(false);
  };

  return (
    <div className="ai-feature-page">
      <div className="page-header">
        <div>
          <button className="back-btn" onClick={() => navigate('/dashboard')}>← Back to Dashboard</button>
          <h1>🏷️ Nutritional Label AI</h1>
        </div>
      </div>
      <div className="ai-form">
        <h3>Generate Nutritional Labels from Recipes</h3>
        <div className="form-group">
          <label>Select Recipe</label>
          <select value={recipeId} onChange={e => setRecipeId(e.target.value)}>
            <option value="">Choose a recipe...</option>
            {recipes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
        <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Generating...' : '✨ Generate Nutrition Label'}
        </button>
      </div>
      {loading && <AIResponse loading={true} />}
      {result?.aiResponse && <AIResponse data={result.aiResponse} />}
      {result?.error && <div className="error-msg" style={{ marginTop: 16 }}>{result.error}</div>}
    </div>
  );
}

function AIWasteReduction() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await api('/ai/waste-reduction', { method: 'POST', body: {} });
      setResult(res);
    } catch (err) {
      setResult({ error: err.message });
    }
    setLoading(false);
  };

  return (
    <div className="ai-feature-page">
      <div className="page-header">
        <div>
          <button className="back-btn" onClick={() => navigate('/dashboard')}>← Back to Dashboard</button>
          <h1>♻️ Waste Reduction AI</h1>
        </div>
      </div>
      <div className="ai-form">
        <h3>AI Waste Reduction Recommendations</h3>
        <p style={{ color: 'var(--text-light)', marginBottom: 20 }}>
          Analyzes your waste tracking data and expiring inventory to provide actionable waste reduction strategies.
        </p>
        <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Analyzing...' : '✨ Analyze Waste & Get Recommendations'}
        </button>
      </div>
      {loading && <AIResponse loading={true} />}
      {result?.aiResponse && <AIResponse data={result.aiResponse} />}
      {result?.error && <div className="error-msg" style={{ marginTop: 16 }}>{result.error}</div>}
    </div>
  );
}

function AICakeDesign() {
  const [occasion, setOccasion] = useState('');
  const [guestCount, setGuestCount] = useState('');
  const [budget, setBudget] = useState('');
  const [preferences, setPreferences] = useState('');
  const [dietaryNeeds, setDietaryNeeds] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await api('/ai/cake-consultation', {
        method: 'POST',
        body: { occasion, guestCount: parseInt(guestCount) || null, budget: parseFloat(budget) || null, preferences, dietaryNeeds }
      });
      setResult(res);
    } catch (err) {
      setResult({ error: err.message });
    }
    setLoading(false);
  };

  return (
    <div className="ai-feature-page">
      <div className="page-header">
        <div>
          <button className="back-btn" onClick={() => navigate('/dashboard')}>← Back to Dashboard</button>
          <h1>🎨 Custom Cake Design AI</h1>
        </div>
      </div>
      <div className="ai-form">
        <h3>AI-Assisted Cake Design Consultation</h3>
        <div className="form-group">
          <label>Occasion</label>
          <select value={occasion} onChange={e => setOccasion(e.target.value)}>
            <option value="">Select occasion...</option>
            <option value="Wedding">Wedding</option>
            <option value="Birthday">Birthday</option>
            <option value="Anniversary">Anniversary</option>
            <option value="Baby Shower">Baby Shower</option>
            <option value="Graduation">Graduation</option>
            <option value="Corporate Event">Corporate Event</option>
            <option value="Holiday">Holiday</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="form-group">
          <label>Number of Guests</label>
          <input type="number" value={guestCount} onChange={e => setGuestCount(e.target.value)} placeholder="e.g., 50" />
        </div>
        <div className="form-group">
          <label>Budget ($)</label>
          <input type="number" value={budget} onChange={e => setBudget(e.target.value)} placeholder="e.g., 300" />
        </div>
        <div className="form-group">
          <label>Preferences & Ideas</label>
          <textarea value={preferences} onChange={e => setPreferences(e.target.value)} placeholder="Describe your dream cake, colors, theme, style..." />
        </div>
        <div className="form-group">
          <label>Dietary Needs</label>
          <input value={dietaryNeeds} onChange={e => setDietaryNeeds(e.target.value)} placeholder="e.g., gluten-free, vegan, nut-free" />
        </div>
        <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Designing...' : '✨ Get Cake Design Suggestions'}
        </button>
      </div>
      {loading && <AIResponse loading={true} />}
      {result?.aiResponse && <AIResponse data={result.aiResponse} />}
      {result?.error && <div className="error-msg" style={{ marginTop: 16 }}>{result.error}</div>}
    </div>
  );
}

// ===== PROTECTED ROUTE =====
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">{children}</div>
    </div>
  );
}

// ===== APP =====
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/recipes" element={<ProtectedRoute><RecipesPage /></ProtectedRoute>} />
        <Route path="/production" element={<ProtectedRoute><ProductionPage /></ProtectedRoute>} />
        <Route path="/batches" element={<ProtectedRoute><BatchesPage /></ProtectedRoute>} />
        <Route path="/ovens" element={<ProtectedRoute><OvensPage /></ProtectedRoute>} />
        <Route path="/wholesale" element={<ProtectedRoute><WholesalePage /></ProtectedRoute>} />
        <Route path="/cakes" element={<ProtectedRoute><CakesPage /></ProtectedRoute>} />
        <Route path="/inventory" element={<ProtectedRoute><InventoryPage /></ProtectedRoute>} />
        <Route path="/suppliers" element={<ProtectedRoute><SuppliersPage /></ProtectedRoute>} />
        <Route path="/supplier-orders" element={<ProtectedRoute><SupplierOrdersPage /></ProtectedRoute>} />
        <Route path="/allergens" element={<ProtectedRoute><AllergensPage /></ProtectedRoute>} />
        <Route path="/temperature" element={<ProtectedRoute><TemperaturePage /></ProtectedRoute>} />
        <Route path="/waste" element={<ProtectedRoute><WastePage /></ProtectedRoute>} />
        <Route path="/staff" element={<ProtectedRoute><StaffPage /></ProtectedRoute>} />
        <Route path="/equipment" element={<ProtectedRoute><EquipmentPage /></ProtectedRoute>} />
        <Route path="/delivery" element={<ProtectedRoute><DeliveryPage /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
        <Route path="/ai/scaling" element={<ProtectedRoute><AIRecipeScaling /></ProtectedRoute>} />
        <Route path="/ai/forecast" element={<ProtectedRoute><AIDemandForecast /></ProtectedRoute>} />
        <Route path="/ai/marketing" element={<ProtectedRoute><AIMarketingCopy /></ProtectedRoute>} />
        <Route path="/ai/nutrition" element={<ProtectedRoute><AINutritionLabel /></ProtectedRoute>} />
        <Route path="/ai/waste" element={<ProtectedRoute><AIWasteReduction /></ProtectedRoute>} />
        <Route path="/ai/cake" element={<ProtectedRoute><AICakeDesign /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
