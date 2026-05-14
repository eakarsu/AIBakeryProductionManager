import React from 'react';

export default function StatusBadge({ status }) {
  const map = {
    completed: 'success', delivered: 'success', paid: 'success', active: 'success', operational: 'success', ready: 'success',
    in_progress: 'info', confirmed: 'info', invoiced: 'info', baking: 'info', proofing: 'info', cooling: 'info',
    planned: 'default', scheduled: 'default', mixing: 'default',
    pending: 'warning', deposit: 'warning', needs_attention: 'warning', low: 'warning', below_par: 'warning', warning: 'warning',
    overdue: 'danger', critical: 'danger', out_of_stock: 'danger',
    cancelled: 'danger', unpaid: 'danger', spoilage: 'danger',
  };
  return <span className={`badge badge-${map[status] || 'default'}`}>{(status || '').replace(/_/g, ' ')}</span>;
}
