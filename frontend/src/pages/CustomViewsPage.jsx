import React, { useState } from 'react';
import ProductionGanttView from '../components/ProductionGanttView';
import IngredientStockChartView from '../components/IngredientStockChartView';
import RecipePdfView from '../components/RecipePdfView';
import ProductionOrderWizardView from '../components/ProductionOrderWizardView';

const TABS = [
  { key: 'gantt', label: 'Oven Schedule Gantt', icon: '🔥' },
  { key: 'stock', label: 'Waste Heatmap', icon: '🗑️' },
  { key: 'recipe-pdf', label: 'Recipe Card PDF', icon: '📄' },
  { key: 'wizard', label: 'Production Editor', icon: '📝' },
];

export default function CustomViewsPage() {
  const [tab, setTab] = useState('gantt');

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 18 }}>
        <h1 style={{ margin: 0, fontSize: 26 }}>🧁 Bakery Custom Views</h1>
        <p style={{ color: '#6B7280', marginTop: 4 }}>
          Four bakery production views: oven schedule Gantt, waste/spoilage heatmap by product, printable recipe cards, and a CRUD editor for production batches.
        </p>
      </div>

      <div style={{
        display: 'flex',
        gap: 4,
        borderBottom: '2px solid #E5E7EB',
        marginBottom: 20,
        flexWrap: 'wrap',
      }}>
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: '10px 18px',
              border: 'none',
              background: tab === t.key ? '#3B82F6' : 'transparent',
              color: tab === t.key ? '#fff' : '#374151',
              borderRadius: '6px 6px 0 0',
              cursor: 'pointer',
              fontWeight: tab === t.key ? 600 : 400,
              fontSize: 14,
            }}
          >
            <span style={{ marginRight: 6 }}>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      <div>
        {tab === 'gantt' && <ProductionGanttView />}
        {tab === 'stock' && <IngredientStockChartView />}
        {tab === 'recipe-pdf' && <RecipePdfView />}
        {tab === 'wizard' && <ProductionOrderWizardView />}
      </div>
    </div>
  );
}
