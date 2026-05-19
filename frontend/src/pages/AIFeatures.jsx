import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils';
import AIResponse from '../components/AIResponse';

// ===== AI RECIPE SCALING =====
export function AIRecipeScaling() {
  const [recipes, setRecipes] = useState([]);
  const [recipeId, setRecipeId] = useState('');
  const [targetYield, setTargetYield] = useState('');
  const [dietary, setDietary] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { api('/recipes').then(d => setRecipes(d.data || d)); }, []);

  const handleSubmit = async () => {
    if (!recipeId || !targetYield) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await api('/ai/recipe-scaling', {
        method: 'POST',
        body: { recipeId: parseInt(recipeId), targetYield: parseInt(targetYield), dietaryRestrictions: dietary }
      });
      setResult(res);
    } catch (err) {
      setResult({ error: err.message });
    }
    setLoading(false);
  };

  return (
    <div className="ai-feature-page">
      <div className="page-header">
        <div>
          <button className="back-btn" onClick={() => navigate('/dashboard')}>← Back to Dashboard</button>
          <h1>⚖️ Recipe Scaling AI</h1>
        </div>
      </div>
      <div className="ai-form">
        <h3>Scale a Recipe with Ingredient Substitutions</h3>
        <div className="form-group">
          <label>Select Recipe</label>
          <select value={recipeId} onChange={e => setRecipeId(e.target.value)}>
            <option value="">Choose a recipe...</option>
            {recipes.map(r => <option key={r.id} value={r.id}>{r.name} ({r.yield_amount} {r.yield_unit})</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Target Yield</label>
          <input type="number" value={targetYield} onChange={e => setTargetYield(e.target.value)} placeholder="e.g., 48" />
        </div>
        <div className="form-group">
          <label>Dietary Restrictions (optional)</label>
          <input value={dietary} onChange={e => setDietary(e.target.value)} placeholder="e.g., gluten-free, vegan, nut-free" />
        </div>
        <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Analyzing...' : '✨ Scale Recipe with AI'}
        </button>
      </div>
      {loading && <AIResponse loading={true} />}
      {result?.aiResponse && <AIResponse data={result.aiResponse} />}
      {result?.error && <div className="error-msg" style={{ marginTop: 16 }}>{result.error}</div>}
    </div>
  );
}

// ===== AI DEMAND FORECAST =====
export function AIDemandForecast() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await api('/ai/demand-forecast', { method: 'POST', body: {} });
      setResult(res);
    } catch (err) {
      setResult({ error: err.message });
    }
    setLoading(false);
  };

  return (
    <div className="ai-feature-page">
      <div className="page-header">
        <div>
          <button className="back-btn" onClick={() => navigate('/dashboard')}>← Back to Dashboard</button>
          <h1>📉 Demand Forecast AI</h1>
        </div>
      </div>
      <div className="ai-form">
        <h3>AI-Powered Production Demand Forecasting</h3>
        <p style={{ color: 'var(--text-light)', marginBottom: 20 }}>
          Analyzes your recent production data, sales trends, and upcoming orders to forecast demand for the next 7 days.
        </p>
        <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Analyzing...' : '✨ Generate Demand Forecast'}
        </button>
      </div>
      {loading && <AIResponse loading={true} />}
      {result?.aiResponse && <AIResponse data={result.aiResponse} />}
      {result?.error && <div className="error-msg" style={{ marginTop: 16 }}>{result.error}</div>}
    </div>
  );
}

// ===== AI MARKETING COPY =====
export function AIMarketingCopy() {
  const [recipes, setRecipes] = useState([]);
  const [recipeId, setRecipeId] = useState('');
  const [tone, setTone] = useState('warm and artisanal');
  const [platform, setPlatform] = useState('menu, social media, and website');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { api('/recipes').then(d => setRecipes(d.data || d)); }, []);

  const handleSubmit = async () => {
    if (!recipeId) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await api('/ai/marketing-copy', {
        method: 'POST',
        body: { recipeId: parseInt(recipeId), tone, platform }
      });
      setResult(res);
    } catch (err) {
      setResult({ error: err.message });
    }
    setLoading(false);
  };

  return (
    <div className="ai-feature-page">
      <div className="page-header">
        <div>
          <button className="back-btn" onClick={() => navigate('/dashboard')}>← Back to Dashboard</button>
          <h1>✍️ Marketing Copy AI</h1>
        </div>
      </div>
      <div className="ai-form">
        <h3>Generate Menu Descriptions & Marketing Copy</h3>
        <div className="form-group">
          <label>Select Product</label>
          <select value={recipeId} onChange={e => setRecipeId(e.target.value)}>
            <option value="">Choose a product...</option>
            {recipes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Tone</label>
          <select value={tone} onChange={e => setTone(e.target.value)}>
            <option value="warm and artisanal">Warm & Artisanal</option>
            <option value="luxury and sophisticated">Luxury & Sophisticated</option>
            <option value="fun and playful">Fun & Playful</option>
            <option value="health-conscious">Health-Conscious</option>
            <option value="nostalgic and homey">Nostalgic & Homey</option>
          </select>
        </div>
        <div className="form-group">
          <label>Platform</label>
          <select value={platform} onChange={e => setPlatform(e.target.value)}>
            <option value="menu, social media, and website">All Platforms</option>
            <option value="restaurant menu">Restaurant Menu</option>
            <option value="Instagram and social media">Social Media</option>
            <option value="website and online ordering">Website</option>
            <option value="email newsletter">Email Newsletter</option>
          </select>
        </div>
        <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Generating...' : '✨ Generate Marketing Copy'}
        </button>
      </div>
      {loading && <AIResponse loading={true} />}
      {result?.aiResponse && <AIResponse data={result.aiResponse} />}
      {result?.error && <div className="error-msg" style={{ marginTop: 16 }}>{result.error}</div>}
    </div>
  );
}

// ===== AI NUTRITION LABEL =====
export function AINutritionLabel() {
  const [recipes, setRecipes] = useState([]);
  const [recipeId, setRecipeId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { api('/recipes').then(d => setRecipes(d.data || d)); }, []);

  const handleSubmit = async () => {
    if (!recipeId) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await api('/ai/nutritional-label', {
        method: 'POST',
        body: { recipeId: parseInt(recipeId) }
      });
      setResult(res);
    } catch (err) {
      setResult({ error: err.message });
    }
    setLoading(false);
  };

  return (
    <div className="ai-feature-page">
      <div className="page-header">
        <div>
          <button className="back-btn" onClick={() => navigate('/dashboard')}>← Back to Dashboard</button>
          <h1>🏷️ Nutritional Label AI</h1>
        </div>
      </div>
      <div className="ai-form">
        <h3>Generate Nutritional Labels from Recipes</h3>
        <div className="form-group">
          <label>Select Recipe</label>
          <select value={recipeId} onChange={e => setRecipeId(e.target.value)}>
            <option value="">Choose a recipe...</option>
            {recipes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
        <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Generating...' : '✨ Generate Nutrition Label'}
        </button>
      </div>
      {loading && <AIResponse loading={true} />}
      {result?.aiResponse && <AIResponse data={result.aiResponse} />}
      {result?.error && <div className="error-msg" style={{ marginTop: 16 }}>{result.error}</div>}
    </div>
  );
}

// ===== AI WASTE REDUCTION =====
export function AIWasteReduction() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await api('/ai/waste-reduction', { method: 'POST', body: {} });
      setResult(res);
    } catch (err) {
      setResult({ error: err.message });
    }
    setLoading(false);
  };

  return (
    <div className="ai-feature-page">
      <div className="page-header">
        <div>
          <button className="back-btn" onClick={() => navigate('/dashboard')}>← Back to Dashboard</button>
          <h1>♻️ Waste Reduction AI</h1>
        </div>
      </div>
      <div className="ai-form">
        <h3>AI Waste Reduction Recommendations</h3>
        <p style={{ color: 'var(--text-light)', marginBottom: 20 }}>
          Analyzes your waste tracking data and expiring inventory to provide actionable waste reduction strategies.
        </p>
        <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Analyzing...' : '✨ Analyze Waste & Get Recommendations'}
        </button>
      </div>
      {loading && <AIResponse loading={true} />}
      {result?.aiResponse && <AIResponse data={result.aiResponse} />}
      {result?.error && <div className="error-msg" style={{ marginTop: 16 }}>{result.error}</div>}
    </div>
  );
}

// ===== AI CAKE DESIGN =====
export function AICakeDesign() {
  const [occasion, setOccasion] = useState('');
  const [guestCount, setGuestCount] = useState('');
  const [budget, setBudget] = useState('');
  const [preferences, setPreferences] = useState('');
  const [dietaryNeeds, setDietaryNeeds] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await api('/ai/cake-consultation', {
        method: 'POST',
        body: { occasion, guestCount: parseInt(guestCount) || null, budget: parseFloat(budget) || null, preferences, dietaryNeeds }
      });
      setResult(res);
    } catch (err) {
      setResult({ error: err.message });
    }
    setLoading(false);
  };

  return (
    <div className="ai-feature-page">
      <div className="page-header">
        <div>
          <button className="back-btn" onClick={() => navigate('/dashboard')}>← Back to Dashboard</button>
          <h1>🎨 Custom Cake Design AI</h1>
        </div>
      </div>
      <div className="ai-form">
        <h3>AI-Assisted Cake Design Consultation</h3>
        <div className="form-group">
          <label>Occasion</label>
          <select value={occasion} onChange={e => setOccasion(e.target.value)}>
            <option value="">Select occasion...</option>
            <option value="Wedding">Wedding</option>
            <option value="Birthday">Birthday</option>
            <option value="Anniversary">Anniversary</option>
            <option value="Baby Shower">Baby Shower</option>
            <option value="Graduation">Graduation</option>
            <option value="Corporate Event">Corporate Event</option>
            <option value="Holiday">Holiday</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="form-group">
          <label>Number of Guests</label>
          <input type="number" value={guestCount} onChange={e => setGuestCount(e.target.value)} placeholder="e.g., 50" />
        </div>
        <div className="form-group">
          <label>Budget ($)</label>
          <input type="number" value={budget} onChange={e => setBudget(e.target.value)} placeholder="e.g., 300" />
        </div>
        <div className="form-group">
          <label>Preferences & Ideas</label>
          <textarea value={preferences} onChange={e => setPreferences(e.target.value)} placeholder="Describe your dream cake, colors, theme, style..." />
        </div>
        <div className="form-group">
          <label>Dietary Needs</label>
          <input value={dietaryNeeds} onChange={e => setDietaryNeeds(e.target.value)} placeholder="e.g., gluten-free, vegan, nut-free" />
        </div>
        <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Designing...' : '✨ Get Cake Design Suggestions'}
        </button>
      </div>
      {loading && <AIResponse loading={true} />}
      {result?.aiResponse && <AIResponse data={result.aiResponse} />}
      {result?.error && <div className="error-msg" style={{ marginTop: 16 }}>{result.error}</div>}
    </div>
  );
}

// ===== AI INVENTORY ORDERING =====
export function AIInventoryOrdering() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await api('/ai/inventory-ordering', { method: 'POST', body: {} });
      setResult(res);
    } catch (err) {
      setResult({ error: err.message });
    }
    setLoading(false);
  };

  return (
    <div className="ai-feature-page">
      <div className="page-header">
        <div>
          <button className="back-btn" onClick={() => navigate('/dashboard')}>← Back to Dashboard</button>
          <h1>📦 Inventory Ordering AI</h1>
        </div>
      </div>
      <div className="ai-form">
        <h3>AI-Optimized Inventory Ordering</h3>
        <p style={{ color: 'var(--text-light)', marginBottom: 20 }}>
          Analyzes current stock levels and demand forecasts to recommend optimal order timing and quantities.
        </p>
        <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Analyzing inventory...' : '✨ Generate Order Recommendations'}
        </button>
      </div>
      {loading && <AIResponse loading={true} />}
      {result?.recommendations && <AIResponse data={result.recommendations} />}
      {result?.error && <div className="error-msg" style={{ marginTop: 16 }}>{result.error}</div>}
    </div>
  );
}

// ===== AI SEASONAL MENU =====
export function AISeasonalMenu() {
  const [season, setSeason] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await api('/ai/seasonal-menu', {
        method: 'POST',
        body: { current_season: season || undefined }
      });
      setResult(res);
    } catch (err) {
      setResult({ error: err.message });
    }
    setLoading(false);
  };

  return (
    <div className="ai-feature-page">
      <div className="page-header">
        <div>
          <button className="back-btn" onClick={() => navigate('/dashboard')}>← Back to Dashboard</button>
          <h1>🍂 Seasonal Menu AI</h1>
        </div>
      </div>
      <div className="ai-form">
        <h3>Seasonal Menu Recommendations</h3>
        <p style={{ color: 'var(--text-light)', marginBottom: 20 }}>
          Get AI-powered seasonal item recommendations based on your sales history and current season.
        </p>
        <div className="form-group">
          <label>Season (optional — auto-detected if blank)</label>
          <select value={season} onChange={e => setSeason(e.target.value)}>
            <option value="">Auto-detect current season</option>
            <option value="Spring">Spring</option>
            <option value="Summer">Summer</option>
            <option value="Fall">Fall</option>
            <option value="Winter">Winter</option>
          </select>
        </div>
        <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Analyzing seasonal trends...' : '✨ Get Seasonal Recommendations'}
        </button>
      </div>
      {loading && <AIResponse loading={true} />}
      {result?.recommendations && <AIResponse data={result.recommendations} />}
      {result?.error && <div className="error-msg" style={{ marginTop: 16 }}>{result.error}</div>}
    </div>
  );
}

// ===== AI BOTTLENECK DETECTOR =====
export function AIBottleneckDetector() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await api('/ai/bottleneck-detector', { method: 'POST', body: {} });
      setResult(res);
    } catch (err) {
      setResult({ error: err.message });
    }
    setLoading(false);
  };

  return (
    <div className="ai-feature-page">
      <div className="page-header">
        <div>
          <button className="back-btn" onClick={() => navigate('/dashboard')}>← Back to Dashboard</button>
          <h1>🔍 Bottleneck Detector AI</h1>
        </div>
      </div>
      <div className="ai-form">
        <h3>Production Bottleneck Analysis</h3>
        <p style={{ color: 'var(--text-light)', marginBottom: 20 }}>
          Analyzes the last 30 days of batch and schedule data to identify slow stations and provide staffing suggestions.
        </p>
        <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Analyzing production data...' : '✨ Detect Bottlenecks'}
        </button>
      </div>
      {loading && <AIResponse loading={true} />}
      {result?.analysis && <AIResponse data={result.analysis} />}
      {result?.error && <div className="error-msg" style={{ marginTop: 16 }}>{result.error}</div>}
    </div>
  );
}

// ===== AI BATCH QUALITY =====
export function AIBatchQuality() {
  const [days, setDays] = useState(30);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await api('/ai/batch-quality', {
        method: 'POST',
        body: { date_range_days: parseInt(days) }
      });
      setResult(res);
    } catch (err) {
      setResult({ error: err.message });
    }
    setLoading(false);
  };

  return (
    <div className="ai-feature-page">
      <div className="page-header">
        <div>
          <button className="back-btn" onClick={() => navigate('/dashboard')}>← Back to Dashboard</button>
          <h1>✅ Batch Quality AI</h1>
        </div>
      </div>
      <div className="ai-form">
        <h3>Batch Quality Variance Analysis</h3>
        <p style={{ color: 'var(--text-light)', marginBottom: 20 }}>
          Analyzes batch tracking data to identify temperature deviations, timing issues, and quality trends.
        </p>
        <div className="form-group">
          <label>Analysis Period</label>
          <select value={days} onChange={e => setDays(e.target.value)}>
            <option value="7">Last 7 days</option>
            <option value="14">Last 14 days</option>
            <option value="30">Last 30 days</option>
            <option value="60">Last 60 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </div>
        <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Analyzing batch quality...' : '✨ Analyze Batch Quality'}
        </button>
      </div>
      {loading && <AIResponse loading={true} />}
      {result?.quality_analysis && <AIResponse data={result.quality_analysis} />}
      {result?.error && <div className="error-msg" style={{ marginTop: 16 }}>{result.error}</div>}
    </div>
  );
}

// ===== AI COST ANALYSIS =====
export function AICostAnalysis() {
  const [recipes, setRecipes] = useState([]);
  const [recipeId, setRecipeId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { api('/recipes').then(d => setRecipes(d.data || d)); }, []);

  const handleSubmit = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await api('/ai/cost-analysis', {
        method: 'POST',
        body: { recipe_id: recipeId ? parseInt(recipeId) : undefined }
      });
      setResult(res);
    } catch (err) {
      setResult({ error: err.message });
    }
    setLoading(false);
  };

  return (
    <div className="ai-feature-page">
      <div className="page-header">
        <div>
          <button className="back-btn" onClick={() => navigate('/dashboard')}>← Back to Dashboard</button>
          <h1>💵 Cost Analysis AI</h1>
        </div>
      </div>
      <div className="ai-form">
        <h3>Recipe Profitability & Pricing Analysis</h3>
        <p style={{ color: 'var(--text-light)', marginBottom: 20 }}>
          Analyzes ingredient costs, recipe prices, and recent waste costs to recommend pricing and production adjustments.
        </p>
        <div className="form-group">
          <label>Recipe Scope</label>
          <select value={recipeId} onChange={e => setRecipeId(e.target.value)}>
            <option value="">All active recipes</option>
            {recipes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
        <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Analyzing profitability...' : '✨ Analyze Costs'}
        </button>
      </div>
      {loading && <AIResponse loading={true} />}
      {result?.analysis && <AIResponse data={result.analysis} />}
      {result?.error && <div className="error-msg" style={{ marginTop: 16 }}>{result.error}</div>}
    </div>
  );
}

// ===== AI SEASONAL FORECAST =====
export function AISeasonalForecast() {
  const [recipes, setRecipes] = useState([]);
  const [productId, setProductId] = useState('');
  const [monthsAhead, setMonthsAhead] = useState(3);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { api('/recipes').then(d => setRecipes(d.data || d)); }, []);

  const handleSubmit = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await api('/ai/seasonal-forecast', {
        method: 'POST',
        body: {
          product_id: productId ? parseInt(productId) : undefined,
          months_ahead: parseInt(monthsAhead)
        }
      });
      setResult(res);
    } catch (err) {
      setResult({ error: err.message });
    }
    setLoading(false);
  };

  return (
    <div className="ai-feature-page">
      <div className="page-header">
        <div>
          <button className="back-btn" onClick={() => navigate('/dashboard')}>← Back to Dashboard</button>
          <h1>📆 Seasonal Forecast AI</h1>
        </div>
      </div>
      <div className="ai-form">
        <h3>Seasonal Production Demand Forecast</h3>
        <p style={{ color: 'var(--text-light)', marginBottom: 20 }}>
          Forecasts demand over the next few months using daily reports and production schedule patterns.
        </p>
        <div className="form-row">
          <div className="form-group">
            <label>Product Scope</label>
            <select value={productId} onChange={e => setProductId(e.target.value)}>
              <option value="">Entire bakery</option>
              {recipes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Months Ahead</label>
            <select value={monthsAhead} onChange={e => setMonthsAhead(e.target.value)}>
              <option value="1">1 month</option>
              <option value="3">3 months</option>
              <option value="6">6 months</option>
              <option value="12">12 months</option>
            </select>
          </div>
        </div>
        <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Forecasting...' : '✨ Generate Seasonal Forecast'}
        </button>
      </div>
      {loading && <AIResponse loading={true} />}
      {result?.forecast && <AIResponse data={result.forecast} />}
      {result?.error && <div className="error-msg" style={{ marginTop: 16 }}>{result.error}</div>}
    </div>
  );
}

// ===== AI HISTORY =====
export function AIHistoryPage() {
  const [history, setHistory] = useState([]);
  const [selected, setSelected] = useState(null);
  const [feature, setFeature] = useState('');
  const navigate = useNavigate();

  const load = () => {
    api(`/ai/history?limit=50${feature ? `&feature=${encodeURIComponent(feature)}` : ''}`)
      .then(res => setHistory(res.data || []));
  };

  useEffect(() => { load(); }, []);

  const openDetail = async (id) => {
    const detail = await api(`/ai/history/${id}`);
    setSelected(detail);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <button className="back-btn" onClick={() => navigate('/dashboard')}>← Back to Dashboard</button>
          <h1>🗂️ AI History</h1>
        </div>
        <button className="btn btn-primary" onClick={load}>Refresh</button>
      </div>

      <div className="table-container">
        <div className="table-toolbar">
          <input
            className="search-input"
            placeholder="Filter by exact feature name..."
            value={feature}
            onChange={e => setFeature(e.target.value)}
          />
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{history.length} analyses</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr><th>Feature</th><th>Input</th><th>Model</th><th>Tokens</th><th>Created</th></tr>
            </thead>
            <tbody>
              {history.map(item => (
                <tr key={item.id} onClick={() => openDetail(item.id)}>
                  <td>{item.feature_name}</td>
                  <td>{item.input_summary || '-'}</td>
                  <td>{item.model || '-'}</td>
                  <td>{item.tokens_used || '-'}</td>
                  <td>{item.created_at ? new Date(item.created_at).toLocaleString() : '-'}</td>
                </tr>
              ))}
              {history.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center', padding: 40 }}>No AI history yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div className="detail-overlay" onClick={(e) => e.target === e.currentTarget && setSelected(null)}>
          <div className="detail-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>{selected.feature_name}</h2>
              <button className="btn btn-outline btn-sm" onClick={() => setSelected(null)}>✕ Close</button>
            </div>
            <div className="detail-row"><div className="label">Input</div><div className="value">{selected.input_summary || '-'}</div></div>
            <div className="detail-row"><div className="label">Model</div><div className="value">{selected.model || '-'}</div></div>
            <div className="detail-row"><div className="label">Tokens</div><div className="value">{selected.tokens_used || '-'}</div></div>
            <div className="ai-response-body" style={{ marginTop: 20, whiteSpace: 'pre-wrap' }}>{selected.content || 'No content saved.'}</div>
          </div>
        </div>
      )}
    </div>
  );
}
