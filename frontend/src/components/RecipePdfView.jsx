import React, { useState, useEffect } from 'react';
import { api } from '../utils';

// NON-VIZ #1 — Recipe PDF download
export default function RecipePdfView() {
  const [recipes, setRecipes] = useState([]);
  const [selected, setSelected] = useState('');
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');
  const [lastDownloaded, setLastDownloaded] = useState(null);

  const loadRecipes = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api('/recipes?limit=100');
      if (res.error) setError(res.error);
      else setRecipes(res.data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRecipes(); }, []);

  const downloadPdf = async () => {
    if (!selected) { setError('Select a recipe first'); return; }
    setDownloading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const resp = await fetch(`/api/custom-views/recipe/${selected}/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resp.ok) {
        const txt = await resp.text();
        throw new Error(`PDF generation failed: ${resp.status} ${txt}`);
      }
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const recipe = recipes.find(r => r.id === parseInt(selected));
      const filename = `recipe-${selected}-${(recipe?.name || 'recipe').replace(/[^a-z0-9]/gi, '_')}.pdf`;
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setLastDownloaded({ name: recipe?.name, filename, time: new Date().toLocaleTimeString() });
    } catch (e) {
      setError(e.message);
    } finally {
      setDownloading(false);
    }
  };

  const selectedRecipe = recipes.find(r => r.id === parseInt(selected));

  return (
    <div style={{ background: '#fff', padding: 20, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <h3 style={{ marginTop: 0 }}>Recipe PDF Export</h3>
      <p style={{ color: '#6B7280', fontSize: 13, marginTop: 0 }}>
        Generate a printable PDF recipe card with ingredients, steps, and allergen warnings.
      </p>

      <div style={{ display: 'flex', gap: 12, alignItems: 'end', marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          <label style={{ display: 'block', fontSize: 12, color: '#666' }}>Recipe</label>
          <select value={selected} onChange={e => setSelected(e.target.value)} style={{ padding: 8, width: '100%' }} disabled={loading}>
            <option value="">{loading ? 'Loading...' : '-- Select a recipe --'}</option>
            {recipes.map(r => (
              <option key={r.id} value={r.id}>{r.name} ({r.category})</option>
            ))}
          </select>
        </div>
        <button className="btn btn-primary" onClick={downloadPdf} disabled={!selected || downloading}>
          {downloading ? 'Generating...' : 'Download PDF'}
        </button>
        <button className="btn btn-outline" onClick={loadRecipes} disabled={loading}>
          Refresh
        </button>
      </div>

      {error && <div style={{ color: '#DC2626', padding: 12, background: '#FEE2E2', borderRadius: 4, marginBottom: 12 }}>{error}</div>}

      {selectedRecipe && (
        <div style={{ background: '#F9FAFB', padding: 14, borderRadius: 6, borderLeft: '4px solid #3B82F6' }}>
          <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 6 }}>{selectedRecipe.name}</div>
          <div style={{ fontSize: 13, color: '#555', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))', gap: 8 }}>
            <div><strong>Category:</strong> {selectedRecipe.category || 'N/A'}</div>
            <div><strong>Yield:</strong> {selectedRecipe.yield_amount} {selectedRecipe.yield_unit}</div>
            <div><strong>Prep:</strong> {selectedRecipe.prep_time_minutes || 0} min</div>
            <div><strong>Bake:</strong> {selectedRecipe.bake_time_minutes || 0} min @ {selectedRecipe.bake_temp_f || 'N/A'}°F</div>
            <div><strong>Cost:</strong> ${selectedRecipe.cost_per_unit ? parseFloat(selectedRecipe.cost_per_unit).toFixed(2) : '0.00'}</div>
          </div>
        </div>
      )}

      {lastDownloaded && (
        <div style={{ marginTop: 16, padding: 12, background: '#ECFDF5', borderRadius: 6, borderLeft: '4px solid #10B981', fontSize: 13 }}>
          Downloaded <strong>{lastDownloaded.filename}</strong> at {lastDownloaded.time}
        </div>
      )}
    </div>
  );
}
