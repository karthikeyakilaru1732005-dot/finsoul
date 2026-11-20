import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { ALL_CALCULATORS, TOOLKIT_CATEGORIES } from '../lib/calculations';
import { CalculationResult } from '../types';
import { ResultChart } from '../components/ResultChart';
import { 
  Search, 
  Star, 
  RotateCcw, 
  Download, 
  Printer, 
  ArrowLeft, 
  HelpCircle, 
  Check, 
  AlertCircle,
  Save,
  TrendingUp
} from 'lucide-react';

export const Toolkit: React.FC = () => {
  const { calcId } = useParams();
  const navigate = useNavigate();
  const { savedCalcIds, toggleSaveCalc, addXp, saveInputs } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  
  // Active calculator form state
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Active selected calculator
  const activeCalc = useMemo(() => {
    return ALL_CALCULATORS.find(c => c.id === calcId) || null;
  }, [calcId]);

  // Load defaults whenever active calculator changes
  useEffect(() => {
    if (activeCalc) {
      const stored = useStore.getState().savedInputs[activeCalc.id];
      const initial: Record<string, string> = {};
      activeCalc.fields.forEach(f => {
        initial[f.key] = stored?.[f.key] ?? f.def;
      });
      setInputValues(initial);
      setResult(activeCalc.run(initial));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setResult(null);
    }
  }, [activeCalc]);

  // Filter list
  const filteredCalculators = useMemo(() => {
    return ALL_CALCULATORS.filter(calc => {
      const matchesSearch = (calc.name + ' ' + calc.desc + ' ' + calc.cat).toLowerCase().includes(searchQuery.toLowerCase());
      if (activeCategory === 'All') return matchesSearch;
      if (activeCategory === 'Saved') return matchesSearch && savedCalcIds.includes(calc.id);
      return matchesSearch && calc.cat === activeCategory;
    });
  }, [searchQuery, activeCategory, savedCalcIds]);

  const handleCalculate = () => {
    if (!activeCalc) return;
    const res = activeCalc.run(inputValues);
    setResult(res);
    if (!res.error) {
      saveInputs(activeCalc.id, inputValues);
      addXp(5, 'Calculator execution');
    }
  };

  const handleReset = () => {
    if (!activeCalc) return;
    const initial: Record<string, string> = {};
    activeCalc.fields.forEach(f => {
      initial[f.key] = f.def;
    });
    setInputValues(initial);
    setResult(activeCalc.run(initial));
  };

  const handleExportCSV = () => {
    if (!activeCalc || !result) return;
    const rows: string[][] = [
      ['FINSOUL FINANCIAL TOOLKIT REPORT'],
      ['Calculator', activeCalc.name],
      ['Category', activeCalc.cat],
      ['Date Generated', new Date().toLocaleString()],
      [''],
      ['INPUTS'],
      ...activeCalc.fields.map(f => [f.label, inputValues[f.key] || f.def, f.unit || '']),
      [''],
      ['RESULTS'],
      ['Headline', result.headline],
      ['Output Label', result.label],
      ...(result.metrics || []).map(m => [m[0], m[1]]),
      [''],
      ['STEP-BY-STEP CALCULATION'],
      ...result.steps.map((step, i) => [`Step ${i + 1}`, step]),
      [''],
      ['INTERPRETATION', result.interpretation || '']
    ];

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.map(x => `"${String(x).replace(/"/g, '""')}"`).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `finsoul-${activeCalc.id}-calculation.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="toolkit-page max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* TOOLKIT HEADER */}
      {!activeCalc && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center space-x-1.5 text-xs font-extrabold uppercase text-finsoul bg-finsoul-light px-3 py-1 rounded-full mb-1">
                <span>{ALL_CALCULATORS.length} Expert Calculators</span>
              </div>
              <h1 className="text-3xl font-extrabold text-navy tracking-tight">
                Financial Toolkit
              </h1>
              <p className="text-subtext text-xs sm:text-sm mt-1">
                Transparent financial formulas, mathematical step-by-step substitutions, and visual curves.
              </p>
            </div>
            
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-subtext absolute left-3 top-3.5" />
              <input
                type="text"
                placeholder="Search tools (e.g. NPV, WACC)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-borderCol rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-finsoul/30 focus:border-finsoul transition-all"
              />
            </div>
          </div>

          {/* Category Chips Bar */}
          <div className="calculator-category-filter flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
            {['All', 'Saved', ...TOOLKIT_CATEGORIES.slice(1)].map(cat => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-navy text-white shadow-sm'
                      : 'bg-white border border-borderCol text-subtext hover:border-finsoul hover:text-navy'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* CALCULATOR DIRECTORY GRID */}
      {!activeCalc && (
        <div className="calculator-grid">
          {filteredCalculators.map(calc => {
            const isStarred = savedCalcIds.includes(calc.id);
            return (
              <div
                key={calc.id}
                onClick={() => navigate(`/toolkit/${calc.id}`)}
                className="calculator-card bg-white border border-borderCol hover:border-finsoul rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] font-bold text-subtext mb-2">
                    <span className="bg-cream-dark px-2 py-0.5 rounded text-navy">{calc.cat}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSaveCalc(calc.id);
                      }}
                      className="p-1 hover:text-amber-500 transition-colors"
                      title={isStarred ? 'Remove from Starred' : 'Save as Favorite'}
                    >
                      <span className="save-toggle-label">{isStarred ? 'Saved' : 'Save'}</span>
                    </button>
                  </div>
                  <h3 className="font-extrabold text-navy text-base group-hover:text-finsoul transition-colors">
                    {calc.name}
                  </h3>
                  <p className="text-xs text-subtext mt-1.5 leading-relaxed line-clamp-2">
                    {calc.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-finsoul">
                  <span>Open Calculator</span>
                  <span className="group-hover:translate-x-1 transition-transform"></span>
                </div>
              </div>
            );
          })}
          {filteredCalculators.length === 0 && (
            <div className="col-span-full py-16 text-center text-subtext bg-white border border-dashed border-borderCol rounded-2xl">
              <Search className="w-8 h-8 mx-auto text-gray-300 mb-2" />
              <p className="font-bold text-sm">No calculators match your filter.</p>
              <button 
                onClick={() => { setSearchQuery(''); setActiveCategory('All'); }} 
                className="mt-2 text-xs font-bold text-finsoul hover:underline"
              >
                Reset filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* ACTIVE CALCULATOR RUNNER INTERFACE */}
      {activeCalc && (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          
          {/* Back & Title Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-borderCol">
            <div>
              <button
                onClick={() => navigate('/toolkit')}
                className="inline-flex items-center space-x-1.5 text-xs font-bold text-subtext hover:text-navy mb-2 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>All {ALL_CALCULATORS.length} Calculators</span>
              </button>
              <div className="flex items-center space-x-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-navy tracking-tight">
                  {activeCalc.name}
                </h1>
                <button
                  onClick={() => toggleSaveCalc(activeCalc.id)}
                  title="Bookmark Tool"
                  className="save-toggle-active"
                >
                  {savedCalcIds.includes(activeCalc.id) ? 'Saved' : 'Save tool'}
                </button>
              </div>
              <p className="text-xs sm:text-sm text-subtext mt-1">{activeCalc.desc}</p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleExportCSV}
                className="px-3.5 py-2 rounded-xl bg-white border border-borderCol hover:border-navy text-xs font-bold text-navy flex items-center space-x-1.5 shadow-sm transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={() => window.print()}
                className="px-3.5 py-2 rounded-xl bg-white border border-borderCol hover:border-navy text-xs font-bold text-navy flex items-center space-x-1.5 shadow-sm transition-all"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print PDF</span>
              </button>
            </div>
          </div>

          <div className="calculator-workspace grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: Input Form Panel */}
            <div className="calculator-inputs lg:col-span-5 bg-white border border-borderCol rounded-2xl p-6 shadow-sm space-y-4">
              <h2 className="text-sm font-extrabold text-navy uppercase tracking-wider border-b border-gray-100 pb-2">
                Calculator Parameters
              </h2>

              <div className="space-y-4">
                {activeCalc.fields.map(field => {
                  return (
                    <div key={field.key} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold text-navy">
                        <label htmlFor={field.key}>
                          {field.label} {field.unit && <span className="text-subtext font-normal">({field.unit})</span>}
                        </label>
                      </div>

                      {field.kind === 'select' ? (
                        <select
                          id={field.key}
                          value={inputValues[field.key] || field.def}
                          onChange={e => setInputValues({ ...inputValues, [field.key]: e.target.value })}
                          className="w-full p-2.5 bg-cream border border-borderCol rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-finsoul/30 focus:border-finsoul"
                        >
                          {field.options?.map(opt => (
                            <option key={opt[0]} value={opt[0]}>{opt[1]}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          id={field.key}
                          type={field.kind === 'list' ? 'text' : 'number'}
                          step="any"
                          value={inputValues[field.key] ?? field.def}
                          onChange={e => setInputValues({ ...inputValues, [field.key]: e.target.value })}
                          className="w-full p-2.5 bg-cream border border-borderCol rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-finsoul/30 focus:border-finsoul"
                        />
                      )}

                      {field.hint && (
                        <p className="text-[11px] text-subtext leading-tight">{field.hint}</p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex gap-2">
                <button
                  onClick={handleCalculate}
                  className="flex-1 py-3 rounded-xl bg-finsoul hover:bg-finsoul-dark text-white font-extrabold text-sm shadow transition-all flex items-center justify-center space-x-1.5"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>Calculate Now</span>
                </button>

                <button
                  onClick={handleReset}
                  title="Reset to sample values"
                  className="px-3 py-2 rounded-xl bg-cream border border-borderCol hover:border-gray-400 text-subtext hover:text-navy transition-all text-xs font-bold"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Right: Results, Steps & Proof Display Panel */}
            <div className="lg:col-span-7 space-y-6">
              
              {result?.error ? (
                <div className="bg-brandRed-light border border-brandRed/30 rounded-2xl p-6 text-brandRed flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-extrabold text-sm">Calculation Error</h3>
                    <p className="text-xs mt-1">{result.error}</p>
                  </div>
                </div>
              ) : result && (
                <>
                  {/* Hero Headline Card */}
                  <div className="bg-navy text-white rounded-2xl p-6 shadow-lg space-y-3 result-summary">
                    <span className="text-xs font-extrabold text-amber-400 uppercase tracking-widest block result-label">
                      {result.label}
                    </span>
                    <div className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white result-value">
                      {result.headline}
                    </div>

                    {/* Secondary Metrics Grid */}
                    {result.metrics && result.metrics.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-700/60">
                        {result.metrics.map((m, idx) => (
                          <div key={idx} className="bg-navy-light/60 p-2.5 rounded-xl border border-slate-700/40">
                            <span className="text-[11px] text-gray-400 block">{m[0]}</span>
                            <span className="text-xs sm:text-sm font-extrabold text-white mt-0.5 block">{m[1]}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Visual Chart Card (If available) */}
                  {result.chart && (
                    <div className="bg-white border border-borderCol rounded-2xl p-6 shadow-sm space-y-3">
                      <h3 className="text-xs font-extrabold text-navy uppercase tracking-wider">
                        {result.chart.title}
                      </h3>
                      
                      {/* Responsive Inline SVG Visualization */}
                      <div className="pt-2">
                        {renderChart(result.chart)}
                      </div>
                    </div>
                  )}

                  <details className="formula-proof">
                    <summary>Formula and step-by-step working</summary>
                    <div className="formula-proof-content">
                      {result.steps.map((step, idx) => (
                        <div key={idx} className="formula-proof-step">
                          <span>{String(idx + 1).padStart(2, '0')}</span>
                          <p>{step}</p>
                        </div>
                      ))}
                    </div>
                  </details>

                  {/* Plain-Language Financial Interpretation */}
                  {result.interpretation && (
                    <div className="bg-finsoul-light/40 border border-finsoul/30 rounded-2xl p-5 text-navy space-y-1">
                      <h4 className="text-xs font-extrabold text-finsoul-dark uppercase tracking-wider flex items-center space-x-1.5">
                        <HelpCircle className="w-4 h-4" />
                        <span>What This Means For Your Decision:</span>
                      </h4>
                      <p className="text-xs sm:text-sm text-navy/90 leading-relaxed font-medium">
                        {result.interpretation}
                      </p>
                    </div>
                  )}
                </>
              )}

            </div>

          </div>
        </div>
      )}

    </div>
  );
};

// Simple standalone SVG chart renderer
function renderChart(chart: NonNullable<CalculationResult['chart']>) {
  const W = 520, H = 200;
  const padding = { top: 20, right: 30, bottom: 35, left: 60 };
  const graphW = W - padding.left - padding.right;
  const graphH = H - padding.top - padding.bottom;

  const yValues = chart.points.flatMap(p => [p.y, p.secondary ?? p.y]);
  const minY = Math.min(0, ...yValues);
  const maxY = Math.max(1, ...yValues);
  const rangeY = maxY - minY || 1;

  const getX = (idx: number) => padding.left + (idx / (chart.points.length - 1 || 1)) * graphW;
  const getY = (val: number) => padding.top + graphH - ((val - minY) / rangeY) * graphH;

  const primaryPath = chart.points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(p.y).toFixed(1)}`)
    .join(' ');

  const hasSecondary = chart.points.some(p => p.secondary !== undefined);
  const secondaryPath = hasSecondary
    ? chart.points
        .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(p.secondary ?? p.y).toFixed(1)}`)
        .join(' ')
    : '';

  return (
    <div className="w-full overflow-hidden">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto text-xs font-mono">
        {/* Zero baseline */}
        <line
          x1={padding.left}
          y1={getY(0)}
          x2={W - padding.right}
          y2={getY(0)}
          stroke="#CBD5E1"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />

        {/* Secondary line (if comparison) */}
        {hasSecondary && (
          <path
            d={secondaryPath}
            fill="none"
            stroke="#94A3B8"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        )}

        {/* Primary curve */}
        <path
          d={primaryPath}
          fill="none"
          stroke="#F47B35"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Min / Max Labels */}
        <text x={padding.left - 8} y={padding.top + 10} textAnchor="end" fill="#788190" fontSize="10">
          ₹{maxY >= 100000 ? (maxY / 100000).toFixed(1) + 'L' : Math.round(maxY)}
        </text>
        <text x={padding.left - 8} y={padding.top + graphH} textAnchor="end" fill="#788190" fontSize="10">
          ₹{minY < 0 ? (minY / 100000).toFixed(1) + 'L' : '0'}
        </text>

        {/* X-axis start & end */}
        <text x={padding.left} y={H - 10} fill="#788190" fontSize="10">
          {chart.points[0]?.x}
        </text>
        <text x={W - padding.right} y={H - 10} textAnchor="end" fill="#788190" fontSize="10">
          {chart.points[chart.points.length - 1]?.x}
        </text>
      </svg>

      {hasSecondary && (
        <div className="flex items-center justify-center space-x-6 text-[11px] font-bold text-subtext pt-2">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-0.5 bg-finsoul rounded" />
            <span>Primary Metric</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-0.5 bg-slate-400 rounded" />
            <span>Benchmark / Simple Line</span>
          </div>
        </div>
      )}
    </div>
  );
}
