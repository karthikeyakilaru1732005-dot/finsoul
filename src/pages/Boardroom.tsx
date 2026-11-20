import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { BOARDROOM_CASES } from '../lib/boardroom-data';
import { CaseStudy } from '../types';
import { 
  Briefcase, 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ArrowRight, 
  Award,
  HelpCircle,
  FileSpreadsheet,
  Calculator,
  Compass
} from 'lucide-react';

export const Boardroom: React.FC = () => {
  const { selectedCaseId, setSelectedCaseId, caseSubmissions, submitCase } = useStore();
  const { caseId } = useParams();
  const navigate = useNavigate();

  // Active case state
  const activeCase = useMemo(() => {
    return BOARDROOM_CASES.find(c => c.id === (caseId || selectedCaseId)) || null;
  }, [caseId, selectedCaseId]);

  // Case inputs state
  const [numericInput, setNumericInput] = useState<string>('');
  const [calcChecked, setCalcChecked] = useState<boolean | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [submittedFeedback, setSubmittedFeedback] = useState<boolean>(false);

  const existingSubmission = activeCase ? caseSubmissions[activeCase.id] : null;

  const handleOpenCase = (c: CaseStudy) => {
    setSelectedCaseId(c.id);
    setNumericInput('');
    setCalcChecked(null);
    setSelectedOptionId(null);
    setSubmittedFeedback(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCheckCalculation = () => {
    if (!activeCase) return;
    const val = Number(numericInput);
    const expected = activeCase.calculationChallenge.expectedValue;
    const tol = (activeCase.calculationChallenge.tolerancePct ?? 2) / 100;
    const isOk = !isNaN(val) && Math.abs(val - expected) <= Math.abs(expected) * tol;
    setCalcChecked(isOk);
  };

  const handleSubmitDecision = () => {
    if (!activeCase || !selectedOptionId) return;
    const chosenOption = activeCase.options.find(o => o.id === selectedOptionId);
    
    // Check numeric
    const val = Number(numericInput);
    const expected = activeCase.calculationChallenge.expectedValue;
    const tol = (activeCase.calculationChallenge.tolerancePct ?? 2) / 100;
    const numOk = !isNaN(val) && Math.abs(val - expected) <= Math.abs(expected) * tol;
    const decisionOk = chosenOption?.isBestChoice ?? false;

    const score = (numOk ? 50 : 0) + (chosenOption?.scoreContribution ?? 0);
    const xpEarned = Math.round(score * 0.75);

    submitCase({
      caseId: activeCase.id,
      score,
      numericGiven: val,
      numericCorrect: numOk,
      selectedOptionId,
      decisionCorrect: decisionOk,
      xpEarned
    });

    setSubmittedFeedback(true);
  };

  return (
    <div className="boardroom-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* 1. DIRECTORY LIST OF ALL 10 CASES */}
      {!activeCase && (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          <div>
            <div className="inline-flex items-center space-x-1.5 text-xs font-extrabold uppercase text-navy bg-cream-dark px-3 py-1 rounded-full mb-1">
              <Briefcase className="w-3.5 h-3.5 text-finsoul" />
              <span>{BOARDROOM_CASES.length} Executive CFO Simulations</span>
            </div>
            <h1 className="text-3xl font-extrabold text-navy tracking-tight">
              FINSOUL Boardroom
            </h1>
            <p className="text-subtext text-xs sm:text-sm mt-1">
              Apply discounted cash flows, capital rationing, make-or-buy, and working capital strategies to real corporate scenarios.
            </p>
          </div>

          <div className="boardroom-case-grid">
            {BOARDROOM_CASES.map(c => {
              const prev = caseSubmissions[c.id];
              return (
                <div
                  key={c.id}
                  onClick={() => handleOpenCase(c)}
                  onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); handleOpenCase(c); } }}
                  role="button"
                  tabIndex={0}
                  className="bg-white border border-borderCol hover:border-finsoul rounded-2xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-[11px] font-bold text-subtext">
                      <span className="text-finsoul bg-finsoul-light px-2 py-0.5 rounded font-extrabold">
                        {c.category}
                      </span>
                      <span className="capitalize">{c.difficulty}</span>
                    </div>

                    <h3 className="font-extrabold text-navy text-base group-hover:text-finsoul transition-colors leading-snug">
                      {c.title}
                    </h3>

                    <p className="text-xs text-subtext leading-relaxed line-clamp-3">
                      {c.executiveSummary}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-bold">
                    {prev ? (
                      <span className="text-brandGreen font-extrabold flex items-center">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Score: {prev.score}/100
                      </span>
                    ) : (
                      <span className="text-subtext">Not Attempted</span>
                    )}
                    <span className="text-finsoul group-hover:translate-x-1 transition-transform flex items-center">
                      Open Case <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. ACTIVE CASE WORKSPACE */}
      {activeCase && (
        <div className="space-y-8 animate-in fade-in-50 duration-200">
          
          {/* Header */}
          <div className="space-y-2 pb-4 border-b border-borderCol">
            <button
              onClick={() => { setSelectedCaseId(null); navigate('/boardroom'); }}
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-subtext hover:text-navy transition-colors mb-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>All {BOARDROOM_CASES.length} Boardroom Cases</span>
            </button>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-extrabold uppercase text-finsoul bg-finsoul-light px-2.5 py-0.5 rounded mr-2">
                  {activeCase.category}
                </span>
                <span className="text-xs text-subtext capitalize font-bold">
                  {activeCase.difficulty} • ~{activeCase.estimatedMinutes} mins
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-navy tracking-tight mt-1">
                  {activeCase.title}
                </h1>
              </div>

              {existingSubmission && (
                <div className="bg-brandGreen-light border border-brandGreen/30 text-brandGreen font-extrabold px-3.5 py-1.5 rounded-xl text-xs flex items-center">
                  <CheckCircle2 className="w-4 h-4 mr-1.5" /> Best Score: {existingSubmission.score} / 100
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Background & Financial Data Sheets */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Situation Brief */}
              <div className="bg-white border border-borderCol rounded-2xl p-6 shadow-sm space-y-3">
                <h2 className="text-xs font-extrabold text-navy uppercase tracking-wider flex items-center space-x-1.5">
                  <Compass className="w-4 h-4 text-finsoul" />
                  <span>Corporate Background & Situation</span>
                </h2>
                <p className="text-xs sm:text-sm text-subtext leading-relaxed">
                  {activeCase.companyBackground}
                </p>
                <div className="p-4 bg-cream rounded-xl text-xs sm:text-sm text-navy leading-relaxed font-medium">
                  {activeCase.situation}
                </div>
              </div>

              {/* Data Sheets Tables */}
              {activeCase.dataSheets.map((sheet, sIdx) => (
                <div key={sIdx} className="bg-white border border-borderCol rounded-2xl p-6 shadow-sm space-y-3">
                  <h3 className="text-xs font-extrabold text-navy uppercase tracking-wider flex items-center space-x-1.5">
                    <FileSpreadsheet className="w-4 h-4 text-brandGreen" />
                    <span>{sheet.title}</span>
                  </h3>
                  <div className="divide-y divide-gray-100 text-xs">
                    {sheet.items.map((item, iIdx) => (
                      <div key={iIdx} className="py-2.5 flex items-center justify-between">
                        <span className="text-subtext font-semibold">{item.label}</span>
                        <span className="font-extrabold text-navy">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

            </div>

            {/* Right Column: Calculation Challenge & Decision Submission */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* 1. Quantitative Calculation Scratchpad */}
              <div className="bg-white border border-borderCol rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="text-xs font-extrabold text-navy uppercase tracking-wider flex items-center space-x-1.5">
                  <Calculator className="w-4 h-4 text-finsoul" />
                  <span>Step 1: Financial Computation</span>
                </h3>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-navy block">
                    {activeCase.calculationChallenge.label} ({activeCase.calculationChallenge.unit})
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="any"
                      placeholder="e.g. 345000"
                      value={numericInput}
                      onChange={e => {
                        setNumericInput(e.target.value);
                        setCalcChecked(null);
                      }}
                      className="flex-1 p-2.5 bg-cream border border-borderCol rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-finsoul"
                    />
                    <button
                      onClick={handleCheckCalculation}
                      className="px-4 py-2.5 bg-navy text-white text-xs font-extrabold rounded-xl hover:bg-navy-light transition-all"
                    >
                      Verify
                    </button>
                  </div>
                  <p className="text-[11px] text-subtext leading-tight">
                    Hint: {activeCase.calculationChallenge.hint}
                  </p>
                </div>

                {calcChecked !== null && (
                  <div className={`p-3 rounded-xl text-xs font-bold flex items-start space-x-2 ${
                    calcChecked ? 'bg-brandGreen-light text-brandGreen' : 'bg-brandRed-light text-brandRed'
                  }`}>
                    {calcChecked ? <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" /> : <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
                    <div>
                      <span>{calcChecked ? 'Calculation Correct (+50 Pts)!' : 'Calculation Off Target.'}</span>
                      {!calcChecked && (
                        <p className="text-[11px] font-normal text-subtext mt-1">
                          Expected roughly: {activeCase.calculationChallenge.expectedValue} {activeCase.calculationChallenge.unit}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Executive Decision Choice */}
              <div className="bg-white border border-borderCol rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="text-xs font-extrabold text-navy uppercase tracking-wider">
                  Step 2: Executive Decision
                </h3>
                <p className="text-xs text-subtext font-medium leading-relaxed">
                  {activeCase.decisionPrompt}
                </p>

                <div className="space-y-3">
                  {activeCase.options.map((opt) => {
                    const isSelected = selectedOptionId === opt.id;
                    return (
                      <div
                        key={opt.id}
                        onClick={() => setSelectedOptionId(opt.id)}
                        className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                          isSelected
                            ? 'border-finsoul bg-finsoul-light text-navy'
                            : 'border-borderCol hover:border-gray-300 text-subtext'
                        }`}
                      >
                        <div className="font-extrabold text-xs text-navy">{opt.title}</div>
                        <div className="text-[11px] text-subtext mt-1 leading-snug">{opt.description}</div>
                      </div>
                    );
                  })}
                </div>

                <button
                  disabled={!selectedOptionId}
                  onClick={handleSubmitDecision}
                  className="w-full py-3.5 rounded-xl bg-finsoul hover:bg-finsoul-dark disabled:opacity-50 text-white font-extrabold text-sm shadow transition-all"
                >
                  Submit Executive Recommendation
                </button>
              </div>

              {/* 3. CFO Model Solution Reveal */}
              {(submittedFeedback || existingSubmission) && (
                <div className="bg-navy text-white rounded-2xl p-6 shadow-lg space-y-4 animate-in fade-in-50">
                  <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                    <span className="text-xs font-extrabold uppercase text-amber-400">
                      CFO Boardroom Review
                    </span>
                    <span className="text-xs font-extrabold text-brandGreen">
                      Score: {existingSubmission?.score ?? 100} / 100
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-white mb-1">CFO Verdict:</h4>
                    <p className="text-xs text-gray-300 leading-relaxed font-mono bg-navy-card p-3 rounded-lg border border-slate-700">
                      {activeCase.modelSolution.cfoVerdict}
                    </p>
                  </div>

                  <div className="space-y-2 text-xs text-gray-300">
                    <h4 className="font-bold text-white">Strategic Takeaways:</h4>
                    <ul className="list-disc pl-4 space-y-1">
                      {activeCase.modelSolution.strategicAnalysis.map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
