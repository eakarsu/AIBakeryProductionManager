import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils';

export default function Dashboard() {
  const [stats, setStats] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    api('/dashboard').then(setStats);
  }, []);

  const features = [
    { key: 'analytics', icon: '📊', title: 'Production Analytics', desc: 'View oven use, top products, waste trends, and revenue by category', path: '/analytics' },
    { key: 'recipes', icon: '📖', title: 'Recipe Management', desc: 'Manage recipes, ingredients, yields, and costs', path: '/recipes' },
    { key: 'production', icon: '📅', title: 'Production Schedule', desc: 'Plan daily and weekly batch production', path: '/production' },
    { key: 'production-sheet', icon: '🧾', title: 'Production Sheet PDF', desc: 'Download daily production sheets for the bakery floor', path: '/production-sheet' },
    { key: 'batches', icon: '🥖', title: 'Batch Tracking', desc: 'Track dough and batter batch status', path: '/batches' },
    { key: 'ovens', icon: '🔥', title: 'Oven Scheduling', desc: 'Manage oven capacity and schedules', path: '/ovens' },
    { key: 'wholesale', icon: '📦', title: 'Wholesale Orders', desc: 'Manage wholesale customer orders', path: '/wholesale' },
    { key: 'cakes', icon: '🎂', title: 'Custom Cake Orders', desc: 'Track custom cake orders and designs', path: '/cakes' },
    { key: 'inventory', icon: '🧈', title: 'Ingredient Inventory', desc: 'Track stock levels and par levels', path: '/inventory' },
    { key: 'inventory-alerts', icon: '🚨', title: 'Inventory Alerts', desc: 'Review low-stock and expiring ingredient alerts', path: '/inventory-alerts' },
    { key: 'suppliers', icon: '🚛', title: 'Suppliers', desc: 'Manage supplier contacts and info', path: '/suppliers' },
    { key: 'supplier-orders', icon: '📋', title: 'Supplier Orders', desc: 'Track orders placed with suppliers', path: '/supplier-orders' },
    { key: 'batch-alerts', icon: '⚠️', title: 'Batch Alerts', desc: 'Catch temperature, duration, and failed-batch exceptions', path: '/batch-alerts' },
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
    { key: 'ai-inventory', icon: '📦', title: 'Inventory Ordering AI', desc: 'AI-optimized ordering timing and quantities', path: '/ai/inventory' },
    { key: 'ai-seasonal', icon: '🍂', title: 'Seasonal Menu AI', desc: 'Seasonal item recommendations based on sales', path: '/ai/seasonal' },
    { key: 'ai-seasonal-forecast', icon: '📆', title: 'Seasonal Forecast AI', desc: 'Month-by-month seasonal demand forecasting', path: '/ai/seasonal-forecast' },
    { key: 'ai-cost', icon: '💵', title: 'Cost Analysis AI', desc: 'Profitability, pricing, and margin recommendations', path: '/ai/cost' },
    { key: 'ai-bottleneck', icon: '🔍', title: 'Bottleneck Detector AI', desc: 'Identify slow stations with staffing suggestions', path: '/ai/bottleneck' },
    { key: 'ai-quality', icon: '✅', title: 'Batch Quality AI', desc: 'Variance analysis and deviation flagging', path: '/ai/quality' },
    { key: 'ai-history', icon: '🗂️', title: 'AI History', desc: 'Review previous AI analyses and saved outputs', path: '/ai/history' },
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
