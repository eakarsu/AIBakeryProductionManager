import React, { useState } from 'react';
import { api } from '../utils';
import AIReport from '../components/AIReport';
import FullFieldPresets from '../components/FullFieldPresets';

const markdownPresets = [
  { label: 'Morning bake', values: { items: [{ name: 'Sourdough loaf', quantity: 28, hours_to_stale: 10, unit_price: 7.5 }, { name: 'Croissant', quantity: 42, hours_to_stale: 6, unit_price: 4.25 }], closing_hours: 8 } },
  { label: 'Afternoon pastry', values: { items: [{ name: 'Cinnamon roll', quantity: 16, hours_to_stale: 3, unit_price: 4.75 }, { name: 'Fruit tart', quantity: 9, hours_to_stale: 2, unit_price: 6.5 }], closing_hours: 5 } },
  { label: 'Weekend surplus', values: { items: [{ name: 'Baguette', quantity: 35, hours_to_stale: 5, unit_price: 5 }, { name: 'Blueberry muffin', quantity: 24, hours_to_stale: 4, unit_price: 3.75 }], closing_hours: 6 } },
].map(({ label, values }) => ({ label, values: { payload: JSON.stringify(values, null, 2) } }));

export default function FreshGoodsMarkdown() {
  const [payload, setPayload] = useState('{"items":[{"name":"Sourdough loaf","quantity":28,"hours_to_stale":10,"unit_price":7.5},{"name":"Croissant","quantity":42,"hours_to_stale":6,"unit_price":4.25}],"closing_hours":8}');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const run = async () => {
    setError('');
    try { setResult(await api('/ai/fresh-goods-markdown', { method: 'POST', body: JSON.parse(payload || '{}') })); }
    catch (e) { setError(e.message); }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Fresh Goods Markdown</h1>
        <button className="btn btn-primary" onClick={run}>Plan Markdown</button>
      </div>
      <div className="card"><FullFieldPresets value={{ payload }} presets={markdownPresets} onChange={({ payload: example }) => setPayload(example)} /><textarea aria-label="Fresh goods and closing hours JSON" rows={9} value={payload} onChange={(e) => setPayload(e.target.value)} /></div>
      {error && <div className="error-msg">{error}</div>}
      {result && <AIReport response={result} title="Fresh goods markdown plan" />}
    </div>
  );
}
