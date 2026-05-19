import React from 'react';
import CrudPage from '../components/CrudPage';
import StatusBadge from '../components/StatusBadge';

export default function RecipesPage() {
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
