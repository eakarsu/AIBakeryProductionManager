import React from 'react';
import CrudPage from '../components/CrudPage';
import StatusBadge from '../components/StatusBadge';

export default function ProductionPage() {
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
