import React, { useState } from 'react';
import { api } from '../utils';

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
      <div className="card"><textarea rows={9} value={payload} onChange={(e) => setPayload(e.target.value)} /></div>
      {error && <div className="error-msg">{error}</div>}
      {result && <pre className="card">{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
}
