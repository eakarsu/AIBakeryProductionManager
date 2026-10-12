
import FullAIExamples, { useFullAIExamples } from "../components/FullAIExamples.jsx";
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils';
import AIResponse from '../components/AIResponse';
import AIReport from '../components/AIReport';

function useCancelableAI(setLoading, setResult) {
  const activeRequest = useRef(null);
  useEffect(() => () => activeRequest.current?.abort(), []);

  const generate = async (path, body) => {
    if (activeRequest.current) return;
    const controller = new AbortController();
    activeRequest.current = controller;
    setLoading(true);
    setResult(null);
    try {
      const response = await api(path, { method: 'POST', body, signal: controller.signal });
      if (activeRequest.current === controller) setResult(response);
    } catch (error) {
      if (activeRequest.current === controller && error.name !== 'AbortError') setResult({ error: error.message });
    } finally {
      if (activeRequest.current === controller) {
        activeRequest.current = null;
        setLoading(false);
      }
    }
  };

  const cancel = () => {
    if (!activeRequest.current) return;
    activeRequest.current.abort();
    activeRequest.current = null;
    setLoading(false);
    setResult({ error: 'Request cancelled.' });
  };

  return { generate, cancel };
}

function AIRequestError({ result, onRetry }) {
  if (!result?.error) return null;
  return <div className="error-msg" role="alert" style={{ marginTop: 16 }}><strong>AI request failed.</strong><p>{result.error}</p><button type="button" className="btn btn-outline btn-sm" onClick={onRetry}>Retry</button></div>;
}

function AIActionButtons({ loading, onGenerate, onCancel, idleLabel, loadingLabel }) {
  return <div className="ai-actions"><button className="btn btn-primary" onClick={onGenerate} disabled={loading}>{loading ? loadingLabel : idleLabel}</button>{loading && <button type="button" className="btn btn-outline" onClick={onCancel}>Cancel</button>}</div>;
}

function useRecipeOptions() {
  const [recipes, setRecipes] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    api('/recipes?limit=100').then(response => {
      const rows = Array.isArray(response) ? response : response?.data;
      if (!Array.isArray(rows)) throw new Error('Recipes returned an invalid list.');
      if (active) setRecipes(rows);
    }).catch(failure => { if (active) setError(failure.message || 'Recipes could not be loaded.'); });
    return () => { active = false; };
  }, []);
  return [recipes, error];
}

function RecipeOptionsError({ error }) {
  return error ? <div className="native-load-error" role="alert">{error} Select a real recipe after the list loads.</div> : null;
}

// ===== AI RECIPE SCALING =====
export function AIRecipeScaling() {
  const fullAIExamples = useFullAIExamples();

  const [recipes, recipeLoadError] = useRecipeOptions();
  const [recipeId, setRecipeId] = useState('');
  const [targetYield, setTargetYield] = useState('');
  const [dietary, setDietary] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const { generate, cancel } = useCancelableAI(setLoading, setResult);
  const navigate = useNavigate();


  const handleSubmit = () => {
    if (!recipeId || !targetYield) return;
    generate('/ai/recipe-scaling', { recipeId: parseInt(recipeId), targetYield: parseInt(targetYield), dietaryRestrictions: dietary });
  };

  return (
    <div className="ai-feature-page" data-full-ai-workspace="AIRecipeScaling"><FullAIExamples controller={fullAIExamples} disabled={Boolean(loading)} /><RecipeOptionsError error={recipeLoadError} />
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
          <select value={recipeId} onChange={e => setRecipeId(e.target.value)} data-full-ai-field={fullAIExamples.bind({ current: recipeId, change: e => setRecipeId(e.target.value), label: "recipeId", reference: true, manual: false, json: false, sample: '' }, "p1-1562", undefined)}>
            <option value="">Choose a recipe...</option>
            {recipes.map(r => <option key={r.id} value={r.id}>{r.name} ({r.yield_amount} {r.yield_unit})</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Target Yield</label>
          <input type="number" value={targetYield} onChange={e => setTargetYield(e.target.value)} placeholder="e.g., 48" data-full-ai-field={fullAIExamples.bind({ current: targetYield, change: e => setTargetYield(e.target.value), label: "targetYield", manual: false, json: false, sample: '' }, "p1-1925", undefined)} />
        </div>
        <div className="form-group">
          <label>Dietary Restrictions (optional)</label>
          <input value={dietary} onChange={e => setDietary(e.target.value)} placeholder="e.g., gluten-free, vegan, nut-free" data-full-ai-field={fullAIExamples.bind({ current: dietary, change: e => setDietary(e.target.value), label: "dietary", manual: false, json: false, sample: '' }, "p1-2158", undefined)} />
        </div>
        <AIActionButtons loading={loading} onGenerate={handleSubmit} onCancel={cancel} idleLabel="✨ Scale Recipe with AI" loadingLabel="Analyzing…" />
      </div>
      {loading && <AIResponse loading={true} />}
      {result?.aiResponse && <AIResponse data={result.aiResponse} />}
      <AIRequestError result={result} onRetry={handleSubmit} />
    </div>
  );
}

// ===== AI DEMAND FORECAST =====
export function AIDemandForecast() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const { generate, cancel } = useCancelableAI(setLoading, setResult);
  const navigate = useNavigate();

  const handleSubmit = () => generate('/ai/demand-forecast', {});

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
        <AIActionButtons loading={loading} onGenerate={handleSubmit} onCancel={cancel} idleLabel="✨ Generate Demand Forecast" loadingLabel="Analyzing…" />
      </div>
      {loading && <AIResponse loading={true} />}
      {result?.aiResponse && <AIResponse data={result.aiResponse} />}
      <AIRequestError result={result} onRetry={handleSubmit} />
    </div>
  );
}

// ===== AI MARKETING COPY =====
export function AIMarketingCopy() {
  const fullAIExamples = useFullAIExamples();

  const [recipes, recipeLoadError] = useRecipeOptions();
  const [recipeId, setRecipeId] = useState('');
  const [tone, setTone] = useState('warm and artisanal');
  const [platform, setPlatform] = useState('menu, social media, and website');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const { generate, cancel } = useCancelableAI(setLoading, setResult);
  const navigate = useNavigate();


  const handleSubmit = () => {
    if (!recipeId) return;
    generate('/ai/marketing-copy', { recipeId: parseInt(recipeId), tone, platform });
  };

  return (
    <div className="ai-feature-page" data-full-ai-workspace="AIMarketingCopy"><FullAIExamples controller={fullAIExamples} disabled={Boolean(loading)} /><RecipeOptionsError error={recipeLoadError} />
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
          <select value={recipeId} onChange={e => setRecipeId(e.target.value)} data-full-ai-field={fullAIExamples.bind({ current: recipeId, change: e => setRecipeId(e.target.value), label: "recipeId", reference: true, manual: false, json: false, sample: '' }, "p1-5542", undefined)}>
            <option value="">Choose a product...</option>
            {recipes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Tone</label>
          <select value={tone} onChange={e => setTone(e.target.value)} data-full-ai-field={fullAIExamples.bind({ current: tone, change: e => setTone(e.target.value), label: "tone", manual: false, json: false, sample: 'warm and artisanal' }, "p1-5864", undefined)}>
            <option value="warm and artisanal">Warm & Artisanal</option>
            <option value="luxury and sophisticated">Luxury & Sophisticated</option>
            <option value="fun and playful">Fun & Playful</option>
            <option value="health-conscious">Health-Conscious</option>
            <option value="nostalgic and homey">Nostalgic & Homey</option>
          </select>
        </div>
        <div className="form-group">
          <label>Platform</label>
          <select value={platform} onChange={e => setPlatform(e.target.value)} data-full-ai-field={fullAIExamples.bind({ current: platform, change: e => setPlatform(e.target.value), label: "platform", manual: false, json: false, sample: 'menu, social media, and website' }, "p1-6413", undefined)}>
            <option value="menu, social media, and website">All Platforms</option>
            <option value="restaurant menu">Restaurant Menu</option>
            <option value="Instagram and social media">Social Media</option>
            <option value="website and online ordering">Website</option>
            <option value="email newsletter">Email Newsletter</option>
          </select>
        </div>
        <AIActionButtons loading={loading} onGenerate={handleSubmit} onCancel={cancel} idleLabel="✨ Generate Marketing Copy" loadingLabel="Generating…" />
      </div>
      {loading && <AIResponse loading={true} />}
      {result?.aiResponse && <AIResponse data={result.aiResponse} />}
      <AIRequestError result={result} onRetry={handleSubmit} />
    </div>
  );
}

// ===== AI NUTRITION LABEL =====
export function AINutritionLabel() {
  const fullAIExamples = useFullAIExamples();

  const [recipes, recipeLoadError] = useRecipeOptions();
  const [recipeId, setRecipeId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const { generate, cancel } = useCancelableAI(setLoading, setResult);
  const navigate = useNavigate();


  const handleSubmit = () => {
    if (!recipeId) return;
    generate('/ai/nutritional-label', { recipeId: parseInt(recipeId) });
  };

  return (
    <div className="ai-feature-page" data-full-ai-workspace="AINutritionLabel"><FullAIExamples controller={fullAIExamples} disabled={Boolean(loading)} /><RecipeOptionsError error={recipeLoadError} />
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
          <select value={recipeId} onChange={e => setRecipeId(e.target.value)} data-full-ai-field={fullAIExamples.bind({ current: recipeId, change: e => setRecipeId(e.target.value), label: "recipeId", reference: true, manual: false, json: false, sample: '' }, "p1-8515", undefined)}>
            <option value="">Choose a recipe...</option>
            {recipes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
        <AIActionButtons loading={loading} onGenerate={handleSubmit} onCancel={cancel} idleLabel="✨ Generate Nutrition Label" loadingLabel="Generating…" />
      </div>
      {loading && <AIResponse loading={true} />}
      {result?.aiResponse && <AIResponse data={result.aiResponse} />}
      <AIRequestError result={result} onRetry={handleSubmit} />
    </div>
  );
}

// ===== AI WASTE REDUCTION =====
export function AIWasteReduction() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const { generate, cancel } = useCancelableAI(setLoading, setResult);
  const navigate = useNavigate();

  const handleSubmit = () => generate('/ai/waste-reduction', {});

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
        <AIActionButtons loading={loading} onGenerate={handleSubmit} onCancel={cancel} idleLabel="✨ Analyze Waste & Get Recommendations" loadingLabel="Analyzing…" />
      </div>
      {loading && <AIResponse loading={true} />}
      {result?.aiResponse && <AIResponse data={result.aiResponse} />}
      <AIRequestError result={result} onRetry={handleSubmit} />
    </div>
  );
}

// ===== AI CAKE DESIGN =====
export function AICakeDesign() {
  const fullAIExamples = useFullAIExamples();

  const [occasion, setOccasion] = useState('');
  const [guestCount, setGuestCount] = useState('');
  const [budget, setBudget] = useState('');
  const [preferences, setPreferences] = useState('');
  const [dietaryNeeds, setDietaryNeeds] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const { generate, cancel } = useCancelableAI(setLoading, setResult);
  const navigate = useNavigate();

  const handleSubmit = () => generate('/ai/cake-consultation', {
    occasion,
    guestCount: parseInt(guestCount) || null,
    budget: parseFloat(budget) || null,
    preferences,
    dietaryNeeds,
  });

  return (
    <div className="ai-feature-page" data-full-ai-workspace="AICakeDesign"><FullAIExamples controller={fullAIExamples} disabled={Boolean(loading)} />
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
          <select value={occasion} onChange={e => setOccasion(e.target.value)} data-full-ai-field={fullAIExamples.bind({ current: occasion, change: e => setOccasion(e.target.value), label: "occasion", manual: false, json: false, sample: '' }, "p1-11987", undefined)}>
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
          <input type="number" value={guestCount} onChange={e => setGuestCount(e.target.value)} placeholder="e.g., 50" data-full-ai-field={fullAIExamples.bind({ current: guestCount, change: e => setGuestCount(e.target.value), label: "guestCount", manual: false, json: false, sample: '' }, "p1-12698", undefined)} />
        </div>
        <div className="form-group">
          <label>Budget ($)</label>
          <input type="number" value={budget} onChange={e => setBudget(e.target.value)} placeholder="e.g., 300" data-full-ai-field={fullAIExamples.bind({ current: budget, change: e => setBudget(e.target.value), label: "budget", manual: false, json: false, sample: '' }, "p1-12908", undefined)} />
        </div>
        <div className="form-group">
          <label>Preferences & Ideas</label>
          <textarea value={preferences} onChange={e => setPreferences(e.target.value)} placeholder="Describe your dream cake, colors, theme, style..." data-full-ai-field={fullAIExamples.bind({ current: preferences, change: e => setPreferences(e.target.value), label: "preferences", manual: false, json: false, sample: '' }, "p1-13120", undefined)} />
        </div>
        <div className="form-group">
          <label>Dietary Needs</label>
          <input value={dietaryNeeds} onChange={e => setDietaryNeeds(e.target.value)} placeholder="e.g., gluten-free, vegan, nut-free" data-full-ai-field={fullAIExamples.bind({ current: dietaryNeeds, change: e => setDietaryNeeds(e.target.value), label: "dietaryNeeds", manual: false, json: false, sample: '' }, "p1-13365", undefined)} />
        </div>
        <AIActionButtons loading={loading} onGenerate={handleSubmit} onCancel={cancel} idleLabel="✨ Get Cake Design Suggestions" loadingLabel="Designing…" />
      </div>
      {loading && <AIResponse loading={true} />}
      {result?.aiResponse && <AIResponse data={result.aiResponse} />}
      <AIRequestError result={result} onRetry={handleSubmit} />
    </div>
  );
}

// ===== AI INVENTORY ORDERING =====
export function AIInventoryOrdering() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const { generate, cancel } = useCancelableAI(setLoading, setResult);
  const navigate = useNavigate();

  const handleSubmit = () => generate('/ai/inventory-ordering', {});

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
        <AIActionButtons loading={loading} onGenerate={handleSubmit} onCancel={cancel} idleLabel="✨ Generate Order Recommendations" loadingLabel="Analyzing inventory…" />
      </div>
      {loading && <AIResponse loading={true} />}
      {result?.recommendations && <AIResponse data={result.recommendations} />}
      <AIRequestError result={result} onRetry={handleSubmit} />
    </div>
  );
}

// ===== AI SEASONAL MENU =====
export function AISeasonalMenu() {
  const fullAIExamples = useFullAIExamples();

  const [season, setSeason] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const { generate, cancel } = useCancelableAI(setLoading, setResult);
  const navigate = useNavigate();

  const handleSubmit = () => generate('/ai/seasonal-menu', { current_season: season || undefined });

  return (
    <div className="ai-feature-page" data-full-ai-workspace="AISeasonalMenu"><FullAIExamples controller={fullAIExamples} disabled={Boolean(loading)} />
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
          <select value={season} onChange={e => setSeason(e.target.value)} data-full-ai-field={fullAIExamples.bind({ current: season, change: e => setSeason(e.target.value), label: "season", manual: false, json: false, sample: '' }, "p1-16675", undefined)}>
            <option value="">Auto-detect current season</option>
            <option value="Spring">Spring</option>
            <option value="Summer">Summer</option>
            <option value="Fall">Fall</option>
            <option value="Winter">Winter</option>
          </select>
        </div>
        <AIActionButtons loading={loading} onGenerate={handleSubmit} onCancel={cancel} idleLabel="✨ Get Seasonal Recommendations" loadingLabel="Analyzing seasonal trends…" />
      </div>
      {loading && <AIResponse loading={true} />}
      {result?.recommendations && <AIResponse data={result.recommendations} />}
      <AIRequestError result={result} onRetry={handleSubmit} />
    </div>
  );
}

// ===== AI BOTTLENECK DETECTOR =====
export function AIBottleneckDetector() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const { generate, cancel } = useCancelableAI(setLoading, setResult);
  const navigate = useNavigate();

  const handleSubmit = () => generate('/ai/bottleneck-detector', {});

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
        <AIActionButtons loading={loading} onGenerate={handleSubmit} onCancel={cancel} idleLabel="✨ Detect Bottlenecks" loadingLabel="Analyzing production data…" />
      </div>
      {loading && <AIResponse loading={true} />}
      {result?.analysis && <AIResponse data={result.analysis} />}
      <AIRequestError result={result} onRetry={handleSubmit} />
    </div>
  );
}

// ===== AI BATCH QUALITY =====
export function AIBatchQuality() {
  const fullAIExamples = useFullAIExamples();

  const [days, setDays] = useState(30);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const { generate, cancel } = useCancelableAI(setLoading, setResult);
  const navigate = useNavigate();

  const handleSubmit = () => generate('/ai/batch-quality', { date_range_days: parseInt(days) });

  return (
    <div className="ai-feature-page" data-full-ai-workspace="AIBatchQuality"><FullAIExamples controller={fullAIExamples} disabled={Boolean(loading)} />
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
          <select value={days} onChange={e => setDays(e.target.value)} data-full-ai-field={fullAIExamples.bind({ current: days, change: e => setDays(e.target.value), label: "days", manual: false, json: false, sample: 30 }, "p1-20203", undefined)}>
            <option value="7">Last 7 days</option>
            <option value="14">Last 14 days</option>
            <option value="30">Last 30 days</option>
            <option value="60">Last 60 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </div>
        <AIActionButtons loading={loading} onGenerate={handleSubmit} onCancel={cancel} idleLabel="✨ Analyze Batch Quality" loadingLabel="Analyzing batch quality…" />
      </div>
      {loading && <AIResponse loading={true} />}
      {result?.quality_analysis && <AIResponse data={result.quality_analysis} />}
      <AIRequestError result={result} onRetry={handleSubmit} />
    </div>
  );
}

// ===== AI COST ANALYSIS =====
export function AICostAnalysis() {
  const fullAIExamples = useFullAIExamples();

  const [recipes, recipeLoadError] = useRecipeOptions();
  const [recipeId, setRecipeId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const { generate, cancel } = useCancelableAI(setLoading, setResult);
  const navigate = useNavigate();


  const handleSubmit = () => generate('/ai/cost-analysis', { recipe_id: recipeId ? parseInt(recipeId) : undefined });

  return (
    <div className="ai-feature-page" data-full-ai-workspace="AICostAnalysis"><FullAIExamples controller={fullAIExamples} disabled={Boolean(loading)} /><RecipeOptionsError error={recipeLoadError} />
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
          <select value={recipeId} onChange={e => setRecipeId(e.target.value)} data-full-ai-field={fullAIExamples.bind({ current: recipeId, change: e => setRecipeId(e.target.value), label: "recipeId", reference: true, manual: false, json: false, sample: '' }, "p1-22398", undefined)}>
            <option value="">All active recipes</option>
            {recipes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
        <AIActionButtons loading={loading} onGenerate={handleSubmit} onCancel={cancel} idleLabel="✨ Analyze Costs" loadingLabel="Analyzing profitability…" />
      </div>
      {loading && <AIResponse loading={true} />}
      {result?.analysis && <AIResponse data={result.analysis} />}
      <AIRequestError result={result} onRetry={handleSubmit} />
    </div>
  );
}

// ===== AI SEASONAL FORECAST =====
export function AISeasonalForecast() {
  const fullAIExamples = useFullAIExamples();

  const [recipes, recipeLoadError] = useRecipeOptions();
  const [productId, setProductId] = useState('');
  const [monthsAhead, setMonthsAhead] = useState(3);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const { generate, cancel } = useCancelableAI(setLoading, setResult);
  const navigate = useNavigate();


  const handleSubmit = () => generate('/ai/seasonal-forecast', {
    product_id: productId ? parseInt(productId) : undefined,
    months_ahead: parseInt(monthsAhead),
  });

  return (
    <div className="ai-feature-page" data-full-ai-workspace="AISeasonalForecast"><FullAIExamples controller={fullAIExamples} disabled={Boolean(loading)} /><RecipeOptionsError error={recipeLoadError} />
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
            <select value={productId} onChange={e => setProductId(e.target.value)} data-full-ai-field={fullAIExamples.bind({ current: productId, change: e => setProductId(e.target.value), label: "productId", reference: true, manual: false, json: false, sample: '' }, "p1-24612", undefined)}>
              <option value="">Entire bakery</option>
              {recipes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Months Ahead</label>
            <select value={monthsAhead} onChange={e => setMonthsAhead(e.target.value)} data-full-ai-field={fullAIExamples.bind({ current: monthsAhead, change: e => setMonthsAhead(e.target.value), label: "monthsAhead", manual: false, json: false, sample: 3 }, "p1-24952", undefined)}>
              <option value="1">1 month</option>
              <option value="3">3 months</option>
              <option value="6">6 months</option>
              <option value="12">12 months</option>
            </select>
          </div>
        </div>
        <AIActionButtons loading={loading} onGenerate={handleSubmit} onCancel={cancel} idleLabel="✨ Generate Seasonal Forecast" loadingLabel="Forecasting…" />
      </div>
      {loading && <AIResponse loading={true} />}
      {result?.forecast && <AIResponse data={result.forecast} />}
      <AIRequestError result={result} onRetry={handleSubmit} />
    </div>
  );
}

// ===== AI HISTORY =====
export function AIHistoryPage() {
  const [history, setHistory] = useState([]);
  const [selected, setSelected] = useState(null);
  const [feature, setFeature] = useState('');
  const [loadError, setLoadError] = useState('');
  const [detailError, setDetailError] = useState('');
  const navigate = useNavigate();

  const load = () => {
    setLoadError('');
    api(`/ai/history?limit=50${feature ? `&feature=${encodeURIComponent(feature)}` : ''}`)
      .then(res => {
        const rows = Array.isArray(res) ? res : res?.data;
        if (!Array.isArray(rows)) throw new Error('AI history returned an invalid list.');
        setHistory(rows);
      })
      .catch(error => { setHistory([]); setLoadError(error.message || 'AI history could not be loaded.'); });
  };

  useEffect(() => { load(); }, []);

  const openDetail = async (id) => {
    setDetailError('');
    try {
      const detail = await api(`/ai/history/${id}`);
      setSelected(detail);
    } catch (error) {
      setDetailError(error.message || 'The saved analysis could not be loaded.');
    }
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
        {loadError && <div className="native-load-error" role="alert">{loadError}</div>}
        {detailError && <div className="native-load-error" role="alert">{detailError}</div>}
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
            <AIReport response={selected.content ?? 'No content saved.'} title={selected.feature_name || 'AI analysis'} model={selected.model} tokens={selected.tokens_used} />
          </div>
        </div>
      )}
    </div>
  );
}
