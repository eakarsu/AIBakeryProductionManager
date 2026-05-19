import React from 'react';
import CrudPage from '../components/CrudPage';
import StatusBadge from '../components/StatusBadge';

export function WholesalePage() {
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

export function CakesPage() {
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
