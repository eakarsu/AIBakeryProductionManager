import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { api } from './utils';

// Page imports
import Dashboard from './pages/Dashboard';
import RecipesPage from './pages/Recipes';
import ProductionPage from './pages/Production';
import { WholesalePage, CakesPage } from './pages/Orders';
import {
  AIRecipeScaling, AIDemandForecast, AIMarketingCopy,
  AINutritionLabel, AIWasteReduction, AICakeDesign,
  AIInventoryOrdering, AISeasonalMenu, AIBottleneckDetector, AIBatchQuality,
  AICostAnalysis, AISeasonalForecast, AIHistoryPage
} from './pages/AIFeatures';
import {
  ProductionAnalyticsPage, InventoryAlertsPage, BatchAlertsPage, ProductionSheetPage
} from './pages/OperationalFeatures';
import CustomViewsPage from './pages/CustomViewsPage';

// Component imports
import CrudPage from './components/CrudPage';
import StatusBadge from './components/StatusBadge';
import Toast from './components/Toast';

// ===== SIDEBAR =====
const NAV_ITEMS = [
  { section: 'Overview' },
  { key: 'dashboard', label: 'Dashboard', icon: '📊', path: '/dashboard' },
  { key: 'analytics', label: 'Production Analytics', icon: '📊', path: '/analytics' },
  { section: 'Production' },
  { key: 'recipes', label: 'Recipes', icon: '📖', path: '/recipes' },
  { key: 'production', label: 'Production Schedule', icon: '📅', path: '/production' },
  { key: 'production-sheet', label: 'Production Sheet PDF', icon: '🧾', path: '/production-sheet' },
  { key: 'batches', label: 'Batch Tracking', icon: '🥖', path: '/batches' },
  { key: 'ovens', label: 'Oven Scheduling', icon: '🔥', path: '/ovens' },
  { section: 'Orders' },
  { key: 'wholesale', label: 'Wholesale Orders', icon: '📦', path: '/wholesale' },
  { key: 'cakes', label: 'Custom Cakes', icon: '🎂', path: '/cakes' },
  { section: 'Inventory' },
  { key: 'inventory', label: 'Ingredients', icon: '🧈', path: '/inventory' },
  { key: 'inventory-alerts', label: 'Inventory Alerts', icon: '🚨', path: '/inventory-alerts' },
  { key: 'suppliers', label: 'Suppliers', icon: '🚛', path: '/suppliers' },
  { key: 'supplier-orders', label: 'Supplier Orders', icon: '📋', path: '/supplier-orders' },
  { section: 'Quality & Safety' },
  { key: 'batch-alerts', label: 'Batch Alerts', icon: '⚠️', path: '/batch-alerts' },
  { key: 'allergens', label: 'Allergen Tracking', icon: '⚠️', path: '/allergens' },
  { key: 'temperature', label: 'Temperature Logs', icon: '🌡️', path: '/temperature' },
  { key: 'waste', label: 'Waste Tracking', icon: '🗑️', path: '/waste' },
  { section: 'Operations' },
  { key: 'staff', label: 'Staff Scheduling', icon: '👥', path: '/staff' },
  { key: 'equipment', label: 'Equipment', icon: '🔧', path: '/equipment' },
  { key: 'delivery', label: 'Delivery Routes', icon: '🚚', path: '/delivery' },
  { key: 'reports', label: 'Daily Reports', icon: '📈', path: '/reports' },
  { section: 'Bakery Views' },
  { key: 'custom-views', label: 'Bakery Custom Views', icon: '🧁', path: '/custom-views' },
  { section: 'AI Tools' },
  { key: 'ai-scaling', label: 'Recipe Scaling AI', icon: '⚖️', path: '/ai/scaling', ai: true },
  { key: 'ai-forecast', label: 'Demand Forecast AI', icon: '📉', path: '/ai/forecast', ai: true },
  { key: 'ai-marketing', label: 'Marketing Copy AI', icon: '✍️', path: '/ai/marketing', ai: true },
  { key: 'ai-nutrition', label: 'Nutrition Label AI', icon: '🏷️', path: '/ai/nutrition', ai: true },
  { key: 'ai-waste', label: 'Waste Reduction AI', icon: '♻️', path: '/ai/waste', ai: true },
  { key: 'ai-cake', label: 'Cake Design AI', icon: '🎨', path: '/ai/cake', ai: true },
  { key: 'ai-inventory', label: 'Inventory Ordering AI', icon: '📦', path: '/ai/inventory', ai: true },
  { key: 'ai-seasonal', label: 'Seasonal Menu AI', icon: '🍂', path: '/ai/seasonal', ai: true },
  { key: 'ai-seasonal-forecast', label: 'Seasonal Forecast AI', icon: '📆', path: '/ai/seasonal-forecast', ai: true },
  { key: 'ai-cost', label: 'Cost Analysis AI', icon: '💵', path: '/ai/cost', ai: true },
  { key: 'ai-bottleneck', label: 'Bottleneck Detector AI', icon: '🔍', path: '/ai/bottleneck', ai: true },
  { key: 'ai-quality', label: 'Batch Quality AI', icon: '✅', path: '/ai/quality', ai: true },
  { key: 'ai-history', label: 'AI History', icon: '🗂️', path: '/ai/history', ai: true },
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
        <div className="login-header">
          <h1>🧁 Sweet Rise Bakery</h1>
          <p>Production Management System</p>
        </div>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@sweetrise.com" required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          {error && <div className="error-msg">{error}</div>}
          <button type="submit" className="btn btn-primary btn-full">Login</button>
        </form>
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <button className="btn btn-outline btn-sm" onClick={autofill}>Use Demo Account</button>
        </div>
      </div>
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
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

// ===== INLINE CRUD PAGES (not extracted to separate files) =====
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

// ===== APP ROUTER =====
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><ProductionAnalyticsPage /></ProtectedRoute>} />
        <Route path="/recipes" element={<ProtectedRoute><RecipesPage /></ProtectedRoute>} />
        <Route path="/production" element={<ProtectedRoute><ProductionPage /></ProtectedRoute>} />
        <Route path="/production-sheet" element={<ProtectedRoute><ProductionSheetPage /></ProtectedRoute>} />
        <Route path="/batches" element={<ProtectedRoute><BatchesPage /></ProtectedRoute>} />
        <Route path="/ovens" element={<ProtectedRoute><OvensPage /></ProtectedRoute>} />
        <Route path="/wholesale" element={<ProtectedRoute><WholesalePage /></ProtectedRoute>} />
        <Route path="/cakes" element={<ProtectedRoute><CakesPage /></ProtectedRoute>} />
        <Route path="/inventory" element={<ProtectedRoute><InventoryPage /></ProtectedRoute>} />
        <Route path="/inventory-alerts" element={<ProtectedRoute><InventoryAlertsPage /></ProtectedRoute>} />
        <Route path="/suppliers" element={<ProtectedRoute><SuppliersPage /></ProtectedRoute>} />
        <Route path="/supplier-orders" element={<ProtectedRoute><SupplierOrdersPage /></ProtectedRoute>} />
        <Route path="/batch-alerts" element={<ProtectedRoute><BatchAlertsPage /></ProtectedRoute>} />
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
        <Route path="/ai/inventory" element={<ProtectedRoute><AIInventoryOrdering /></ProtectedRoute>} />
        <Route path="/ai/seasonal" element={<ProtectedRoute><AISeasonalMenu /></ProtectedRoute>} />
        <Route path="/ai/seasonal-forecast" element={<ProtectedRoute><AISeasonalForecast /></ProtectedRoute>} />
        <Route path="/ai/cost" element={<ProtectedRoute><AICostAnalysis /></ProtectedRoute>} />
        <Route path="/ai/bottleneck" element={<ProtectedRoute><AIBottleneckDetector /></ProtectedRoute>} />
        <Route path="/ai/quality" element={<ProtectedRoute><AIBatchQuality /></ProtectedRoute>} />
        <Route path="/ai/history" element={<ProtectedRoute><AIHistoryPage /></ProtectedRoute>} />
        <Route path="/custom-views" element={<ProtectedRoute><CustomViewsPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
