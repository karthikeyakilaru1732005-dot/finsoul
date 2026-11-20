import { Calculator, CalculationResult, Field, ChartPoint } from '../types';
import { EXTRA_CALCULATORS } from './extra-calculators';
import { emi as calculateEmi, irr as calculateIrr } from './finance/formulas';

export { formatINR, formatPercent, formatNumber } from './format';
import { formatINR, formatNumber, formatPercent } from './format';

const NUM = (key: string, label: string, def: string, unit?: string, hint?: string): Field => ({
  key, label, def, unit, hint, kind: 'number'
});

const FREQ_OPTIONS: [string, string][] = [
  ['1', 'Annually (1x/yr)'],
  ['2', 'Semi-Annually (2x/yr)'],
  ['4', 'Quarterly (4x/yr)'],
  ['12', 'Monthly (12x/yr)'],
  ['365', 'Daily (365x/yr)']
];

// -------------------------------------------------------------
// 1. PRESENT VALUE (PV)
// -------------------------------------------------------------
const pvCalc: Calculator = {
  id: 'pv',
  cat: 'Time Value of Money',
  name: 'Present Value (PV)',
  desc: 'Calculates what a future sum of money is worth today at a chosen discount rate.',
  fields: [
    NUM('f', 'Future Amount (FV)', '100000', '₹'),
    NUM('r', 'Annual Discount Rate', '10', '%'),
    NUM('n', 'Number of Years', '5', 'Yrs'),
    { key: 'm', label: 'Compounding Frequency', def: '1', kind: 'select', options: FREQ_OPTIONS }
  ],
  run: (v) => {
    const F = Number(v.f), r = Number(v.r) / 100, n = Number(v.n), m = Number(v.m);
    if (F <= 0 || n <= 0 || r < 0) return { headline: 'Invalid', label: 'Error', steps: [], error: 'Amounts and time must be positive numbers.' };
    
    const factor = Math.pow(1 + r / m, m * n);
    const pv = F / factor;
    const discountAmount = F - pv;

    const points: ChartPoint[] = [];
    for (let yr = 0; yr <= n; yr += Math.max(1, Math.floor(n / 10))) {
      const pvYr = F / Math.pow(1 + r / m, m * (n - yr));
      points.push({ x: `Yr ${yr}`, y: Math.round(pvYr) });
    }

    return {
      headline: formatINR(pv),
      label: 'Present Value Today',
      metrics: [
        ['Future Value', formatINR(F)],
        ['Total Discount Lost', formatINR(discountAmount)],
        ['Discount Factor', (1 / factor).toFixed(4)]
      ],
      steps: [
        'Formula: PV = FV / (1 + r / m)^(m * n)',
        `Periodic rate (r/m) = ${(r * 100).toFixed(2)}% / ${m} = ${((r / m) * 100).toFixed(4)}%`,
        `Total periods (m * n) = ${m} * ${n} = ${m * n}`,
        `Growth factor = (1 + ${(r / m).toFixed(5)})^${m * n} = ${factor.toFixed(6)}`,
        `PV = ${formatINR(F)} / ${factor.toFixed(6)} = ${formatINR(pv)}`
      ],
      interpretation: `Receiving ${formatINR(F)} in ${n} years discounted at ${(r * 100).toFixed(1)}% is economically identical to having ${formatINR(pv)} in cash today.`,
      chart: {
        title: 'Discounting Trajectory (Value Growth over Time)',
        points,
        xLabel: 'Time Elapsed',
        yLabel: 'Value (₹)'
      }
    };
  }
};

// -------------------------------------------------------------
// 2. FUTURE VALUE (FV)
// -------------------------------------------------------------
const fvCalc: Calculator = {
  id: 'fv',
  cat: 'Time Value of Money',
  name: 'Future Value (FV)',
  desc: 'Projects what an initial lump sum will grow to over time under compound interest.',
  fields: [
    NUM('p', 'Present Investment (PV)', '50000', '₹'),
    NUM('r', 'Annual Interest Rate', '12', '%'),
    NUM('n', 'Years of Growth', '10', 'Yrs'),
    { key: 'm', label: 'Compounding Frequency', def: '1', kind: 'select', options: FREQ_OPTIONS }
  ],
  run: (v) => {
    const P = Number(v.p), r = Number(v.r) / 100, n = Number(v.n), m = Number(v.m);
    if (P <= 0 || n <= 0 || r < 0) return { headline: 'Invalid', label: 'Error', steps: [], error: 'Principal, rate and tenure must be positive.' };

    const factor = Math.pow(1 + r / m, m * n);
    const fv = P * factor;
    const interest = fv - P;

    const points: ChartPoint[] = [];
    for (let yr = 0; yr <= n; yr++) {
      points.push({ x: `Yr ${yr}`, y: Math.round(P * Math.pow(1 + r / m, m * yr)) });
    }

    return {
      headline: formatINR(fv),
      label: 'Future Value at Maturity',
      metrics: [
        ['Initial Principal', formatINR(P)],
        ['Total Interest Accrued', formatINR(interest)],
        ['Wealth Multiplier', (fv / P).toFixed(2) + 'x']
      ],
      steps: [
        'Formula: FV = PV * (1 + r / m)^(m * n)',
        `Periodic rate (r/m) = ${(r * 100).toFixed(2)}% / ${m} = ${((r / m) * 100).toFixed(4)}%`,
        `Compounding factor = (1 + ${(r / m).toFixed(4)})^${m * n} = ${factor.toFixed(6)}`,
        `FV = ${formatINR(P)} * ${factor.toFixed(6)} = ${formatINR(fv)}`
      ],
      interpretation: `An investment of ${formatINR(P)} grows into ${formatINR(fv)}, multiplying your capital by ${(fv / P).toFixed(2)}x due to interest compounding on interest.`,
      chart: {
        title: 'Compound Growth Over Tenure',
        points,
        xLabel: 'Years',
        yLabel: 'Balance (₹)'
      }
    };
  }
};

// -------------------------------------------------------------
// 3. SIMPLE & COMPOUND INTEREST
// -------------------------------------------------------------
const siCiCalc: Calculator = {
  id: 'si-ci',
  cat: 'Time Value of Money',
  name: 'Simple vs. Compound Interest',
  desc: 'Side-by-side comparison of linear vs exponential growth on the same capital.',
  fields: [
    NUM('p', 'Principal Amount', '100000', '₹'),
    NUM('r', 'Annual Interest Rate', '8', '%'),
    NUM('n', 'Duration in Years', '10', 'Yrs')
  ],
  run: (v) => {
    const P = Number(v.p), r = Number(v.r) / 100, n = Number(v.n);
    if (P <= 0 || n <= 0 || r < 0) return { headline: 'Invalid', label: 'Error', steps: [], error: 'Invalid parameters.' };

    const si = P * r * n;
    const siTotal = P + si;
    const ciTotal = P * Math.pow(1 + r, n);
    const ci = ciTotal - P;
    const diff = ci - si;

    const points: ChartPoint[] = [];
    for (let yr = 0; yr <= n; yr++) {
      points.push({
        x: `Yr ${yr}`,
        y: Math.round(P * Math.pow(1 + r, yr)), // Compound
        secondary: Math.round(P + P * r * yr)  // Simple
      });
    }

    return {
      headline: formatINR(ci),
      label: 'Compound Interest Earned',
      metrics: [
        ['Simple Interest', formatINR(si)],
        ['Compound Interest', formatINR(ci)],
        ['Compounding Bonus', `+${formatINR(diff)} (${((diff / si) * 100).toFixed(1)}% more)`]
      ],
      steps: [
        'Simple Interest: SI = P * r * n',
        `SI = ${formatINR(P)} * ${r} * ${n} = ${formatINR(si)}`,
        'Compound Interest: CI = P * (1 + r)^n - P',
        `CI Total = ${formatINR(P)} * (1 + ${r})^${n} = ${formatINR(ciTotal)}`,
        `Difference = ${formatINR(ci)} - ${formatINR(si)} = ${formatINR(diff)}`
      ],
      interpretation: `Over ${n} years, compounding earns an extra ${formatINR(diff)} because you earn returns on prior years' interest, whereas simple interest remains strictly flat.`,
      chart: {
        title: 'Compound (Orange) vs. Simple (Blue) Trajectory',
        points,
        xLabel: 'Years',
        yLabel: 'Balance (₹)'
      }
    };
  }
};

// -------------------------------------------------------------
// 4. ANNUITIES (ORDINARY & ANNUITY DUE)
// -------------------------------------------------------------
const annuityCalc: Calculator = {
  id: 'annuity',
  cat: 'Time Value of Money',
  name: 'Annuity Valuation (PV & FV)',
  desc: 'Calculates the present and future value of regular periodic payments, with ordinary or annuity-due timing.',
  fields: [
    NUM('c', 'Payment per Period (PMT)', '10000', '₹'),
    NUM('r', 'Annual Interest Rate', '9', '%'),
    NUM('n', 'Number of Years', '10', 'Yrs'),
    {
      key: 'due',
      label: 'Payment Timing',
      def: '0',
      kind: 'select',
      options: [
        ['0', 'End of Period (Ordinary Annuity)'],
        ['1', 'Beginning of Period (Annuity Due)']
      ]
    }
  ],
  run: (v) => {
    const C = Number(v.c), r = Number(v.r) / 100, n = Number(v.n), due = Number(v.due) === 1;
    if (C <= 0 || n <= 0 || r <= 0) return { headline: 'Invalid', label: 'Error', steps: [], error: 'Valid positive inputs required.' };

    const timingMultiplier = due ? (1 + r) : 1;
    const fvOrdinary = C * ((Math.pow(1 + r, n) - 1) / r);
    const fv = fvOrdinary * timingMultiplier;

    const pvOrdinary = C * ((1 - Math.pow(1 + r, -n)) / r);
    const pv = pvOrdinary * timingMultiplier;

    const totalDeposited = C * n;

    const points: ChartPoint[] = [];
    for (let yr = 1; yr <= n; yr++) {
      const curFv = (C * ((Math.pow(1 + r, yr) - 1) / r)) * timingMultiplier;
      points.push({ x: `Yr ${yr}`, y: Math.round(curFv), secondary: C * yr });
    }

    return {
      headline: formatINR(fv),
      label: due ? 'Future Value (Annuity Due)' : 'Future Value (Ordinary Annuity)',
      metrics: [
        ['Present Value (PV)', formatINR(pv)],
        ['Total Cash Deposited', formatINR(totalDeposited)],
        ['Total Wealth Generated', formatINR(fv - totalDeposited)]
      ],
      steps: [
        `Timing: ${due ? 'Annuity Due (factor * (1 + r))' : 'Ordinary Annuity (end of period)'}`,
        'FV Formula: PMT * [((1 + r)^n - 1) / r] * (1 + r if due)',
        `FV = ${formatINR(C)} * [((1 + ${r})^${n} - 1) / ${r}] ${due ? `* (1 + ${r})` : ''} = ${formatINR(fv)}`,
        'PV Formula: PMT * [(1 - (1 + r)^(-n)) / r] * (1 + r if due)',
        `PV = ${formatINR(C)} * [(1 - (1 + ${r})^-${n}) / ${r}] ${due ? `* (1 + ${r})` : ''} = ${formatINR(pv)}`
      ],
      interpretation: `Contributing ${formatINR(C)} every year for ${n} years accumulates to ${formatINR(fv)}. Today's lump-sum equivalent is ${formatINR(pv)}.`,
      chart: {
        title: 'Accumulated Annuity FV vs Principal Contributed',
        points,
        xLabel: 'Years',
        yLabel: 'Total (₹)'
      }
    };
  }
};

// -------------------------------------------------------------
// 5. CAGR (COMPOUND ANNUAL GROWTH RATE)
// -------------------------------------------------------------
const cagrCalc: Calculator = {
  id: 'cagr',
  cat: 'Time Value of Money',
  name: 'CAGR (Compound Annual Growth Rate)',
  desc: 'Measures the smoothed annualized return of an investment over multiple years.',
  fields: [
    NUM('s', 'Initial Value', '100000', '₹'),
    NUM('e', 'Final Value', '250000', '₹'),
    NUM('n', 'Duration in Years', '5', 'Yrs')
  ],
  run: (v) => {
    const s = Number(v.s), e = Number(v.e), n = Number(v.n);
    if (s <= 0 || e <= 0 || n <= 0) return { headline: 'Invalid', label: 'Error', steps: [], error: 'All parameters must be greater than zero.' };

    const cagr = Math.pow(e / s, 1 / n) - 1;
    const totalGrowth = (e - s) / s;

    const points: ChartPoint[] = [];
    for (let yr = 0; yr <= n; yr++) {
      points.push({ x: `Yr ${yr}`, y: Math.round(s * Math.pow(1 + cagr, yr)) });
    }

    return {
      headline: formatPercent(cagr),
      label: 'Annualized Compound Growth Rate',
      metrics: [
        ['Total Absolute Return', formatPercent(totalGrowth)],
        ['Absolute Rupee Gain', formatINR(e - s)],
        ['Annual Multiplier', (1 + cagr).toFixed(4)]
      ],
      steps: [
        'Formula: CAGR = (Final Value / Initial Value)^(1 / n) - 1',
        `CAGR = (${formatINR(e)} / ${formatINR(s)})^(1 / ${n}) - 1`,
        `Growth multiple = ${(e / s).toFixed(4)}^(1 / ${n}) = ${(1 + cagr).toFixed(6)}`,
        `CAGR = ${(cagr * 100).toFixed(2)}%`
      ],
      interpretation: `Your portfolio grew from ${formatINR(s)} to ${formatINR(e)} at a steady equivalent pace of ${formatPercent(cagr)} compounded every year.`,
      chart: {
        title: 'Smoothed Annualized Portfolio Growth Curve',
        points,
        xLabel: 'Years',
        yLabel: 'Value (₹)'
      }
    };
  }
};

// -------------------------------------------------------------
// 6. RETURN ON INVESTMENT (ROI)
// -------------------------------------------------------------
const roiCalc: Calculator = {
  id: 'roi',
  cat: 'Investment Analysis',
  name: 'Return on Investment (ROI)',
  desc: 'Evaluates the profitability of an expenditure relative to initial outlay.',
  fields: [
    NUM('cost', 'Investment Cost', '200000', '₹'),
    NUM('gain', 'Final Value / Revenue', '320000', '₹'),
    NUM('holding', 'Holding Period (Optional)', '3', 'Yrs')
  ],
  run: (v) => {
    const cost = Number(v.cost), gain = Number(v.gain), yrs = Math.max(1, Number(v.holding));
    if (cost <= 0) return { headline: 'Invalid', label: 'Error', steps: [], error: 'Investment cost must be positive.' };

    const netProfit = gain - cost;
    const roi = netProfit / cost;
    const annualized = roi / yrs;

    return {
      headline: formatPercent(roi),
      label: 'Total Return on Investment (ROI)',
      metrics: [
        ['Net Rupee Profit', formatINR(netProfit)],
        ['Simple Annualized ROI', formatPercent(annualized)],
        ['Return per Rupee', `₹${(gain / cost).toFixed(2)} generated per ₹1.00`]
      ],
      steps: [
        'Formula: ROI = (Final Value - Investment Cost) / Investment Cost',
        `Net Profit = ${formatINR(gain)} - ${formatINR(cost)} = ${formatINR(netProfit)}`,
        `ROI = ${formatINR(netProfit)} / ${formatINR(cost)} = ${formatPercent(roi)}`
      ],
      interpretation: `For every rupee invested, this initiative returned ₹${(gain / cost).toFixed(2)}, generating a net profit margin of ${formatPercent(roi)}.`,
    };
  }
};

// -------------------------------------------------------------
// 7. NET PRESENT VALUE (NPV)
// -------------------------------------------------------------
const npvCalc: Calculator = {
  id: 'npv',
  cat: 'Investment Analysis',
  name: 'Net Present Value (NPV)',
  desc: 'Determines whether an investment project adds corporate value above the hurdle rate.',
  fields: [
    NUM('r', 'Hurdle Rate / Discount Rate', '10', '%'),
    {
      key: 'cf',
      label: 'Cash Flows (Initial Outflow + Inflows)',
      def: '-500000, 150000, 180000, 200000, 220000, 100000',
      hint: 'First value at t=0 must be negative (investment), followed by comma-separated yearly inflows.',
      kind: 'list'
    }
  ],
  run: (v) => {
    const r = Number(v.r) / 100;
    const rawList: number[] = Array.isArray(v.cf) ? v.cf : String(v.cf).split(',').map(Number);
    if (rawList.length < 2 || !Number.isFinite(r) || r <= -1 || rawList.some((cf) => !Number.isFinite(cf))) return { headline: 'Invalid', label: 'Error', steps: [], error: 'Enter a valid discount rate above -100% and finite cash flows.' };

    let npv = 0;
    const steps: string[] = ['Formula: NPV = sum of each cash flow discounted to time 0 (the initial outflow is CF₀).'];
    let cum = 0;
    const points: ChartPoint[] = [];

    rawList.forEach((cf, t) => {
      const pv = cf / Math.pow(1 + r, t);
      npv += pv;
      cum += pv;
      points.push({ x: `Yr ${t}`, y: Math.round(cum) });
      steps.push(`Year ${t}: ${formatINR(cf)} discounted at ${(r * 100).toFixed(1)}% = ${formatINR(pv)} (Cum: ${formatINR(cum)})`);
    });

    const isAcc = npv > 0;

    return {
      headline: formatINR(npv),
      label: 'Net Present Value',
      metrics: [
        ['Recommendation', isAcc ? 'ACCEPT PROJECT (Adds Value)' : 'REJECT (Destroys Value)'],
        ['Initial Capex', formatINR(Math.abs(rawList[0]))],
        ['Gross Inflows (PV)', formatINR(npv + Math.abs(rawList[0]))]
      ],
      steps,
      interpretation: isAcc
        ? `NPV is positive (+${formatINR(npv)}). The project comfortably beats the ${(r * 100).toFixed(1)}% hurdle rate and creates tangible shareholder wealth.`
        : `NPV is negative (${formatINR(npv)}). The capital earns less than the ${(r * 100).toFixed(1)}% required return and should be rejected.`,
      chart: {
        title: 'Cumulative Discounted Cash Flow (Break-Even Trajectory)',
        points,
        xLabel: 'Project Year',
        yLabel: 'Cumulative PV (₹)'
      }
    };
  }
};

// -------------------------------------------------------------
// 8. INTERNAL RATE OF RETURN (IRR)
// -------------------------------------------------------------
const irrCalc: Calculator = {
  id: 'irr',
  cat: 'Investment Analysis',
  name: 'Internal Rate of Return (IRR)',
  desc: 'Finds the exact break-even discount rate where project Net Present Value equals zero.',
  fields: [
    {
      key: 'cf',
      label: 'Cash Flow Sequence',
      def: '-100000, 30000, 35000, 40000, 45000',
      hint: 'First value must be negative. Subsequent values are annual inflows.',
      kind: 'list'
    }
  ],
  run: (v) => {
    const rawList: number[] = Array.isArray(v.cf) ? v.cf : String(v.cf).split(',').map(Number);
    if (rawList.length < 2 || rawList.some((x) => !Number.isFinite(x)) || !rawList.some(x => x < 0) || !rawList.some(x => x > 0)) {
      return { headline: 'Invalid', label: 'Error', steps: [], error: 'Cash flows must contain at least one negative and one positive cash flow.' };
    }
    const solvedIrr = calculateIrr(rawList);
    if (solvedIrr === null) return { headline: 'No IRR found', label: 'Error', steps: [], error: 'These cash flows do not produce a solvable IRR in the supported range. Try NPV with a chosen hurdle rate.' };
    const irrFound = solvedIrr;
    const npvAt = (rate: number) => rawList.reduce((acc, c, t) => acc + c / Math.pow(1 + rate, t), 0);

    const points: ChartPoint[] = [];
    for (let rTest = 0; rTest <= 0.40; rTest += 0.05) {
      points.push({ x: `${(rTest * 100).toFixed(0)}%`, y: Math.round(npvAt(rTest)) });
    }

    return {
      headline: formatPercent(irrFound),
      label: 'Internal Rate of Return (IRR)',
      metrics: [
        ['NPV at IRR', '₹0.00 (Break-Even)'],
        ['Capital Outlay', formatINR(Math.abs(rawList[0]))],
        ['Simple Payback Approx', `${(Math.abs(rawList[0]) / (rawList.slice(1).reduce((a, b) => a + b, 0) / (rawList.length - 1))).toFixed(1)} yrs`]
      ],
      steps: [
        'Definition: IRR is the rate r where Σ [CF_t / (1 + r)^t] = 0',
        'Algorithm: Numerical bisection converged across cash flow vectors',
        `NPV evaluated at ${formatPercent(irrFound)} = ₹0.00`
      ],
      interpretation: `Accept this investment if your cost of capital or hurdle rate is strictly lower than ${formatPercent(irrFound)}.`,
      chart: {
        title: 'NPV Profile Curve (Crosses Zero at IRR)',
        points,
        xLabel: 'Discount Rate',
        yLabel: 'NPV (₹)'
      }
    };
  }
};

// -------------------------------------------------------------
// 9. PAYBACK PERIOD & DISCOUNTED PAYBACK
// -------------------------------------------------------------
const paybackCalc: Calculator = {
  id: 'payback',
  cat: 'Investment Analysis',
  name: 'Payback & Discounted Payback',
  desc: 'Measures how many years it takes for cash inflows to fully recover initial project capex.',
  fields: [
    NUM('r', 'Discount Rate (For Discounted Payback)', '10', '%'),
    {
      key: 'cf',
      label: 'Cash Flows (t=0 Outlay + Inflows)',
      def: '-100000, 30000, 40000, 35000, 25000',
      kind: 'list'
    }
  ],
  run: (v) => {
    const r = Number(v.r) / 100;
    const rawList: number[] = Array.isArray(v.cf) ? v.cf : String(v.cf).split(',').map(Number);
    const capex = Math.abs(rawList[0]);

    // Simple payback
    let cumSimple = 0, pbSimple: number | null = null;
    for (let t = 1; t < rawList.length; t++) {
      const prior = cumSimple;
      cumSimple += rawList[t];
      if (cumSimple >= capex && pbSimple === null) {
        pbSimple = (t - 1) + (capex - prior) / rawList[t];
      }
    }

    // Discounted payback
    let cumDisc = 0, pbDisc: number | null = null;
    for (let t = 1; t < rawList.length; t++) {
      const discCf = rawList[t] / Math.pow(1 + r, t);
      const prior = cumDisc;
      cumDisc += discCf;
      if (cumDisc >= capex && pbDisc === null) {
        pbDisc = (t - 1) + (capex - prior) / discCf;
      }
    }

    return {
      headline: pbSimple ? `${pbSimple.toFixed(2)} Years` : 'Not Recovered',
      label: 'Simple Payback Period',
      metrics: [
        ['Discounted Payback', pbDisc ? `${pbDisc.toFixed(2)} Years` : 'Beyond Horizon'],
        ['Initial Outlay', formatINR(capex)],
        ['Total Inflows (Nominal)', formatINR(rawList.slice(1).reduce((a, b) => a + b, 0))]
      ],
      steps: [
        `Initial Outlay: ${formatINR(capex)}`,
        `Simple Payback = Year before full recovery + (Unrecovered Cost / Next Year Cash Flow) = ${pbSimple ? pbSimple.toFixed(2) + ' yrs' : 'N/A'}`,
        `Discounted Payback applies ${(r * 100).toFixed(1)}% discount factor: ${pbDisc ? pbDisc.toFixed(2) + ' yrs' : 'Exceeds timeline'}`
      ],
      interpretation: `Capital is nominally recouped in ${pbSimple ? pbSimple.toFixed(2) : '—'} years. Factoring the time value of money, the true economic recovery requires ${pbDisc ? pbDisc.toFixed(2) : '—'} years.`
    };
  }
};

// -------------------------------------------------------------
// 10. EMI & LOAN AMORTIZATION
// -------------------------------------------------------------
const emiCalc: Calculator = {
  id: 'emi',
  cat: 'Loans & Financing',
  name: 'EMI & Loan Amortization',
  desc: 'Calculates equated monthly installments and principal-to-interest distribution over loan tenure.',
  fields: [
    NUM('p', 'Loan Amount (Principal)', '1000000', '₹'),
    NUM('r', 'Annual Interest Rate', '9.5', '%'),
    NUM('n', 'Tenure in Years', '15', 'Yrs')
  ],
  run: (v) => {
    const P = Number(v.p), annualRate = Number(v.r) / 100, yrs = Number(v.n);
    const months = yrs * 12;
    const monthlyRate = annualRate / 12;

    if (!Number.isFinite(P) || P <= 0 || !Number.isFinite(annualRate) || annualRate < 0 || !Number.isFinite(yrs) || yrs <= 0 || !Number.isInteger(months)) {
      return { headline: 'Invalid', label: 'Error', steps: [], error: 'Enter a positive loan amount and term, and a non-negative annual interest rate.' };
    }

    const emi = calculateEmi(P, annualRate, months);
    const totalPaid = emi * months;
    const totalInterest = totalPaid - P;

    const points: ChartPoint[] = [];
    let bal = P;
    for (let m = 1; m <= months; m++) {
      const int = bal * monthlyRate;
      const prin = emi - int;
      bal = Math.max(0, bal - prin);
      if (m % 12 === 0 || m === months) {
        points.push({ x: `Yr ${m / 12}`, y: Math.round(bal) });
      }
    }

    return {
      headline: formatINR(emi),
      label: 'Monthly EMI Payment',
      metrics: [
        ['Total Loan Amount', formatINR(P)],
        ['Total Interest Payable', formatINR(totalInterest)],
        ['Total Lifetime Payment', formatINR(totalPaid)],
        ['Interest-to-Principal Ratio', ((totalInterest / P) * 100).toFixed(1) + '%']
      ],
      steps: [
        'Formula: EMI = P * i * (1 + i)^n / ((1 + i)^n - 1)',
        `Monthly rate (i) = ${(annualRate * 100).toFixed(2)}% / 12 = ${(monthlyRate * 100).toFixed(4)}%`,
        `Total payments (n) = ${yrs} * 12 = ${months} months`,
        `EMI = ${formatINR(emi)} / month`
      ],
      interpretation: `Repaying a ${formatINR(P)} loan at ${(annualRate * 100).toFixed(1)}% requires ${formatINR(emi)} per month. Total interest equals ${formatINR(totalInterest)}.`,
      chart: {
        title: 'Outstanding Loan Balance Decline Over Tenure',
        points,
        xLabel: 'Tenure Elapsed',
        yLabel: 'Balance (₹)'
      }
    };
  }
};

// -------------------------------------------------------------
// 11. COST OF DEBT & EQUITY (CAPM)
// -------------------------------------------------------------
const costCapitalCalc: Calculator = {
  id: 'cost-of-capital',
  cat: 'Corporate Finance',
  name: 'Cost of Debt & Equity (CAPM)',
  desc: 'Estimates required return on equity via Capital Asset Pricing Model and after-tax cost of debt.',
  fields: [
    NUM('rf', 'Risk-Free Rate (Rf)', '6.5', '%'),
    NUM('beta', 'Equity Beta (β)', '1.15'),
    NUM('rm', 'Expected Market Return (Rm)', '13', '%'),
    NUM('kd', 'Pre-Tax Cost of Debt', '9.0', '%'),
    NUM('tax', 'Corporate Tax Rate', '25', '%')
  ],
  run: (v) => {
    const rf = Number(v.rf) / 100, beta = Number(v.beta), rm = Number(v.rm) / 100;
    const kd = Number(v.kd) / 100, tax = Number(v.tax) / 100;

    const ke = rf + beta * (rm - rf);
    const kdAfter = kd * (1 - tax);
    const erp = rm - rf;

    return {
      headline: formatPercent(ke),
      label: 'Cost of Equity (Ke via CAPM)',
      metrics: [
        ['After-Tax Cost of Debt (Kd)', formatPercent(kdAfter)],
        ['Equity Risk Premium (Rm - Rf)', formatPercent(erp)],
        ['Pre-tax Debt Rate', formatPercent(kd)]
      ],
      steps: [
        'Cost of Equity (CAPM): Ke = Rf + β * (Rm - Rf)',
        `Ke = ${(rf * 100).toFixed(2)}% + ${beta} * (${(rm * 100).toFixed(2)}% - ${(rf * 100).toFixed(2)}%) = ${formatPercent(ke)}`,
        'After-tax Cost of Debt: Kd(after) = Kd * (1 - Tax Rate)',
        `Kd(after) = ${(kd * 100).toFixed(2)}% * (1 - ${(tax * 100).toFixed(2)}%) = ${formatPercent(kdAfter)}`
      ],
      interpretation: `Equity holders demand a ${formatPercent(ke)} hurdle rate to compensate for systematic market risk. Tax shields reduce effective borrowing cost to ${formatPercent(kdAfter)}.`
    };
  }
};

// -------------------------------------------------------------
// 12. WEIGHTED AVERAGE COST OF CAPITAL (WACC)
// -------------------------------------------------------------
const waccCalc: Calculator = {
  id: 'wacc',
  cat: 'Corporate Finance',
  name: 'Weighted Average Cost of Capital (WACC)',
  desc: 'Calculates the overall weighted discount hurdle rate blending debt and equity financing.',
  fields: [
    NUM('e', 'Market Value of Equity', '7000000', '₹'),
    NUM('d', 'Market Value of Debt', '3000000', '₹'),
    NUM('ke', 'Cost of Equity (Ke)', '14', '%'),
    NUM('kd', 'Cost of Debt (Kd Pre-Tax)', '9.5', '%'),
    NUM('tax', 'Corporate Tax Rate', '25', '%')
  ],
  run: (v) => {
    const E = Number(v.e), D = Number(v.d), ke = Number(v.ke) / 100, kd = Number(v.kd) / 100, tax = Number(v.tax) / 100;
    const V = E + D;
    if (V <= 0) return { headline: 'Invalid', label: 'Error', steps: [], error: 'Capital structure cannot be zero.' };

    const wE = E / V, wD = D / V;
    const kdAfter = kd * (1 - tax);
    const wacc = wE * ke + wD * kdAfter;

    return {
      headline: formatPercent(wacc),
      label: 'Weighted Average Cost of Capital (WACC)',
      metrics: [
        ['Total Firm Value (V)', formatINR(V)],
        ['Equity Weight (We)', formatPercent(wE)],
        ['Debt Weight (Wd)', formatPercent(wD)],
        ['After-tax Debt Cost', formatPercent(kdAfter)]
      ],
      steps: [
        'Formula: WACC = (E / V) * Ke + (D / V) * Kd * (1 - T)',
        `Equity Weight: ${formatINR(E)} / ${formatINR(V)} = ${(wE * 100).toFixed(1)}%`,
        `Debt Weight: ${formatINR(D)} / ${formatINR(V)} = ${(wD * 100).toFixed(1)}%`,
        `WACC = [${(wE * 100).toFixed(1)}% * ${(ke * 100).toFixed(2)}%] + [${(wD * 100).toFixed(1)}% * ${(kdAfter * 100).toFixed(2)}%] = ${formatPercent(wacc)}`
      ],
      interpretation: `The business must earn at least ${formatPercent(wacc)} across its operations to meet the combined expectations of debt providers and equity shareholders.`
    };
  }
};

// -------------------------------------------------------------
// 13. FINANCIAL & OPERATING LEVERAGE (DOL, DFL, DCL)
// -------------------------------------------------------------
const leverageCalc: Calculator = {
  id: 'leverage',
  cat: 'Corporate Finance',
  name: 'Operating & Financial Leverage',
  desc: 'Quantifies how revenue volatility magnifies operating profits (EBIT) and net EPS.',
  fields: [
    NUM('sales', 'Total Sales Revenue', '1000000', '₹'),
    NUM('vc', 'Variable Costs', '600000', '₹'),
    NUM('fc', 'Fixed Operating Costs', '200000', '₹'),
    NUM('int', 'Interest Expense', '50000', '₹')
  ],
  run: (v) => {
    const s = Number(v.sales), vc = Number(v.vc), fc = Number(v.fc), i = Number(v.int);
    const cm = s - vc;
    const ebit = cm - fc;
    const ebt = ebit - i;

    if (ebit <= 0 || ebt <= 0) return { headline: 'Inapplicable', label: 'Loss Incurred', steps: [], error: 'EBIT and EBT must be positive to calculate meaningful leverage.' };

    const dol = cm / ebit;
    const dfl = ebit / ebt;
    const dcl = dol * dfl;

    return {
      headline: `${dcl.toFixed(2)}x`,
      label: 'Degree of Combined Leverage (DCL)',
      metrics: [
        ['Degree of Operating Leverage (DOL)', `${dol.toFixed(2)}x`],
        ['Degree of Financial Leverage (DFL)', `${dfl.toFixed(2)}x`],
        ['Operating Profit (EBIT)', formatINR(ebit)],
        ['Earnings Before Tax (EBT)', formatINR(ebt)]
      ],
      steps: [
        `Contribution Margin = Sales - VC = ${formatINR(s)} - ${formatINR(vc)} = ${formatINR(cm)}`,
        `EBIT = Contribution - Fixed Costs = ${formatINR(cm)} - ${formatINR(fc)} = ${formatINR(ebit)}`,
        `DOL = Contribution / EBIT = ${formatINR(cm)} / ${formatINR(ebit)} = ${dol.toFixed(2)}x`,
        `DFL = EBIT / EBT = ${formatINR(ebit)} / ${formatINR(ebt)} = ${dfl.toFixed(2)}x`,
        `DCL = DOL * DFL = ${dol.toFixed(2)} * ${dfl.toFixed(2)} = ${dcl.toFixed(2)}x`
      ],
      interpretation: `A 1% increase in sales will increase Operating Income (EBIT) by ${dol.toFixed(2)}%, and increase Pre-Tax Net Profit (EBT) by ${dcl.toFixed(2)}%.`
    };
  }
};

// -------------------------------------------------------------
// 14. CAPITAL STRUCTURE ANALYSIS
// -------------------------------------------------------------
const capitalStructureCalc: Calculator = {
  id: 'capital-structure',
  cat: 'Corporate Finance',
  name: 'Capital Structure & Solvency',
  desc: 'Analyzes long-term debt burden, equity buffer, and financial risk.',
  fields: [
    NUM('d', 'Total Debt', '5000000', '₹'),
    NUM('e', 'Shareholders Equity', '5000000', '₹'),
    NUM('ebit', 'Annual EBIT', '1200000', '₹'),
    NUM('int', 'Annual Interest Expense', '400000', '₹')
  ],
  run: (v) => {
    const d = Number(v.d), e = Number(v.e), ebit = Number(v.ebit), interest = Number(v.int);
    const assets = d + e;
    const deRatio = d / e;
    const debtRatio = d / assets;
    const icr = ebit / interest;

    return {
      headline: `${deRatio.toFixed(2)}x`,
      label: 'Debt-to-Equity Ratio',
      metrics: [
        ['Debt-to-Assets Ratio', formatPercent(debtRatio)],
        ['Interest Coverage Ratio (ICR)', `${icr.toFixed(2)}x`],
        ['Equity Multiplier', `${(assets / e).toFixed(2)}x`],
        ['Solvency Status', icr >= 2.5 ? 'STRONG SOLVENCY' : 'HIGH FINANCIAL RISK']
      ],
      steps: [
        `Debt-to-Equity = Total Debt / Equity = ${formatINR(d)} / ${formatINR(e)} = ${deRatio.toFixed(2)}x`,
        `Debt Ratio = Debt / Total Capital = ${formatINR(d)} / ${formatINR(assets)} = ${formatPercent(debtRatio)}`,
        `Interest Coverage Ratio = EBIT / Interest = ${formatINR(ebit)} / ${formatINR(interest)} = ${icr.toFixed(2)}x`
      ],
      interpretation: icr >= 2.5
        ? `Comfortable debt profile. Operating income covers interest payments by ${icr.toFixed(2)}x.`
        : `High leverage alert. Interest coverage of ${icr.toFixed(2)}x leaves minimal margin of safety for cash flow declines.`
    };
  }
};

// -------------------------------------------------------------
// 15. FINANCIAL RATIOS (LIQUIDITY & EFFICIENCY)
// -------------------------------------------------------------
const ratiosCalc: Calculator = {
  id: 'ratios',
  cat: 'Financial & Accounting Ratios',
  name: 'Liquidity & Solvency Suite',
  desc: 'Evaluates short-term solvency: Current, Quick, and Cash Ratios.',
  fields: [
    NUM('ca', 'Current Assets', '450000', '₹'),
    NUM('inv', 'Inventory', '150000', '₹'),
    NUM('cash', 'Cash & Equivalents', '90000', '₹'),
    NUM('cl', 'Current Liabilities', '200000', '₹')
  ],
  run: (v) => {
    const ca = Number(v.ca), inv = Number(v.inv), cash = Number(v.cash), cl = Number(v.cl);
    if (cl <= 0) return { headline: 'Invalid', label: 'Error', steps: [], error: 'Current liabilities must be greater than zero.' };

    const cr = ca / cl;
    const qr = (ca - inv) / cl;
    const cashR = cash / cl;

    return {
      headline: `${cr.toFixed(2)}x`,
      label: 'Current Ratio',
      metrics: [
        ['Quick Ratio (Acid Test)', `${qr.toFixed(2)}x`],
        ['Cash Ratio', `${cashR.toFixed(2)}x`],
        ['Net Working Capital', formatINR(ca - cl)]
      ],
      steps: [
        `Current Ratio = Current Assets / Current Liabilities = ${formatINR(ca)} / ${formatINR(cl)} = ${cr.toFixed(2)}x`,
        `Quick Ratio = (Current Assets - Inventory) / CL = (${formatINR(ca)} - ${formatINR(inv)}) / ${formatINR(cl)} = ${qr.toFixed(2)}x`,
        `Cash Ratio = Cash / Current Liabilities = ${formatINR(cash)} / ${formatINR(cl)} = ${cashR.toFixed(2)}x`
      ],
      interpretation: cr >= 1.5 && qr >= 1.0
        ? 'Healthy liquidity position. The firm comfortably meets short-term creditor claims without forced asset sales.'
        : 'Tight liquidity. Quick ratio is low, meaning working capital could be stressed if inventory sales stall.'
    };
  }
};

// -------------------------------------------------------------
// 16. PROFITABILITY MARGINS
// -------------------------------------------------------------
const marginsCalc: Calculator = {
  id: 'margins',
  cat: 'Financial & Accounting Ratios',
  name: 'Profit Margins (Gross, Operating, Net)',
  desc: 'Decomposes income statement profitability across revenue retention tiers.',
  fields: [
    NUM('rev', 'Total Revenue', '1000000', '₹'),
    NUM('cogs', 'Cost of Goods Sold (COGS)', '550000', '₹'),
    NUM('op', 'Operating Expenses', '200000', '₹'),
    NUM('tax', 'Interest & Taxes', '75000', '₹')
  ],
  run: (v) => {
    const rev = Number(v.rev), cogs = Number(v.cogs), op = Number(v.op), tax = Number(v.tax);
    if (rev <= 0) return { headline: 'Invalid', label: 'Error', steps: [], error: 'Revenue must be positive.' };

    const gp = rev - cogs;
    const ebit = gp - op;
    const np = ebit - tax;

    const gpm = gp / rev;
    const opm = ebit / rev;
    const npm = np / rev;

    return {
      headline: formatPercent(npm),
      label: 'Net Profit Margin',
      metrics: [
        ['Gross Profit Margin', formatPercent(gpm)],
        ['Operating Profit Margin', formatPercent(opm)],
        ['Net Rupee Income', formatINR(np)]
      ],
      steps: [
        `Gross Profit = Revenue - COGS = ${formatINR(rev)} - ${formatINR(cogs)} = ${formatINR(gp)} (${formatPercent(gpm)})`,
        `Operating Profit (EBIT) = GP - Opex = ${formatINR(gp)} - ${formatINR(op)} = ${formatINR(ebit)} (${formatPercent(opm)})`,
        `Net Profit = EBIT - Tax/Interest = ${formatINR(ebit)} - ${formatINR(tax)} = ${formatINR(np)} (${formatPercent(npm)})`
      ],
      interpretation: `Out of every ₹100 earned, the firm keeps ₹${(gpm * 100).toFixed(1)} after manufacturing, ₹${(opm * 100).toFixed(1)} after overheads, and converts ₹${(npm * 100).toFixed(1)} into net bottom-line cash.`
    };
  }
};

// -------------------------------------------------------------
// 17. ROA & ROE (3-STEP DUPONT ANALYSIS)
// -------------------------------------------------------------
const dupontCalc: Calculator = {
  id: 'dupont',
  cat: 'Financial & Accounting Ratios',
  name: 'ROA & ROE (3-Step DuPont)',
  desc: 'Deconstructs Return on Equity into Operating Efficiency, Asset Efficiency, and Financial Leverage.',
  fields: [
    NUM('ni', 'Net Income', '150000', '₹'),
    NUM('rev', 'Sales Revenue', '1500000', '₹'),
    NUM('assets', 'Total Assets', '1000000', '₹'),
    NUM('equity', 'Shareholders Equity', '500000', '₹')
  ],
  run: (v) => {
    const ni = Number(v.ni), rev = Number(v.rev), assets = Number(v.assets), eq = Number(v.equity);
    if (rev <= 0 || assets <= 0 || eq <= 0) return { headline: 'Invalid', label: 'Error', steps: [], error: 'All denominators must exceed zero.' };

    const roe = ni / eq;
    const roa = ni / assets;
    const margin = ni / rev;
    const turnover = rev / assets;
    const leverage = assets / eq;

    return {
      headline: formatPercent(roe),
      label: 'Return on Equity (ROE)',
      metrics: [
        ['Return on Assets (ROA)', formatPercent(roa)],
        ['Net Margin (Pillar 1)', formatPercent(margin)],
        ['Asset Turnover (Pillar 2)', `${turnover.toFixed(2)}x`],
        ['Equity Multiplier (Pillar 3)', `${leverage.toFixed(2)}x`]
      ],
      steps: [
        'DuPont Identity: ROE = Net Margin * Asset Turnover * Equity Multiplier',
        `Pillar 1 (Profitability): Net Income / Revenue = ${formatINR(ni)} / ${formatINR(rev)} = ${formatPercent(margin)}`,
        `Pillar 2 (Efficiency): Revenue / Assets = ${formatINR(rev)} / ${formatINR(assets)} = ${turnover.toFixed(2)}x`,
        `Pillar 3 (Leverage): Assets / Equity = ${formatINR(assets)} / ${formatINR(eq)} = ${leverage.toFixed(2)}x`,
        `ROE Check: ${(margin * 100).toFixed(2)}% * ${turnover.toFixed(2)} * ${leverage.toFixed(2)} = ${formatPercent(roe)}`
      ],
      interpretation: `The business generates a ${formatPercent(roe)} return on shareholder capital. For every ₹1 of equity, assets generate ${turnover.toFixed(2)}x in revenue while leverage amplifies returns by ${leverage.toFixed(2)}x.`
    };
  }
};

// -------------------------------------------------------------
// 18. WORKING CAPITAL & CASH CONVERSION CYCLE (CCC)
// -------------------------------------------------------------
const cccCalc: Calculator = {
  id: 'ccc',
  cat: 'Financial & Accounting Ratios',
  name: 'Cash Conversion Cycle (CCC)',
  desc: 'Calculates the number of days working capital remains trapped between buying inventory and customer collections.',
  fields: [
    NUM('dio', 'Days Inventory Outstanding (DIO)', '55', 'Days', 'Time inventory sits in warehouse'),
    NUM('dso', 'Days Sales Outstanding (DSO)', '42', 'Days', 'Time to collect receivables'),
    NUM('dpo', 'Days Payables Outstanding (DPO)', '30', 'Days', 'Time allowed to pay suppliers')
  ],
  run: (v) => {
    const dio = Number(v.dio), dso = Number(v.dso), dpo = Number(v.dpo);
    const ccc = dio + dso - dpo;
    const opCycle = dio + dso;

    return {
      headline: `${ccc} Days`,
      label: 'Cash Conversion Cycle (CCC)',
      metrics: [
        ['Operating Cycle', `${opCycle} Days`],
        ['Supplier Financing Buffer (DPO)', `${dpo} Days`],
        ['Working Capital Status', ccc <= 45 ? 'EFFICIENT CYCLE' : 'WORKING CAPITAL TRAPPED']
      ],
      steps: [
        'Formula: CCC = DIO + DSO - DPO',
        `Operating Cycle = DIO (${dio}) + DSO (${dso}) = ${opCycle} days`,
        `CCC = ${opCycle} days - DPO (${dpo} days) = ${ccc} days`
      ],
      interpretation: `It takes ${ccc} days from paying cash to suppliers to receiving cash back from customers. Reducing DSO or negotiating extended supplier terms (DPO) directly frees cash flow.`
    };
  }
};

// -------------------------------------------------------------
// 19. BREAK-EVEN ANALYSIS & CONTRIBUTION MARGIN
// -------------------------------------------------------------
const breakEvenCalc: Calculator = {
  id: 'break-even',
  cat: 'Cost & Management Accounting',
  name: 'Break-Even & Contribution Margin',
  desc: 'Identifies unit sales and gross revenue needed to cover all corporate overheads.',
  fields: [
    NUM('p', 'Selling Price per Unit', '150', '₹'),
    NUM('vc', 'Variable Cost per Unit', '90', '₹'),
    NUM('fc', 'Total Fixed Costs', '300000', '₹'),
    NUM('actual', 'Target / Expected Volume', '7000', 'Units')
  ],
  run: (v) => {
    const P = Number(v.p), vc = Number(v.vc), fc = Number(v.fc), actualUnits = Number(v.actual);
    const cm = P - vc;
    if (cm <= 0) return { headline: 'Invalid', label: 'Error', steps: [], error: 'Selling price must strictly exceed variable cost.' };

    const bepUnits = Math.ceil(fc / cm);
    const bepRevenue = bepUnits * P;
    const cmRatio = cm / P;
    const mosUnits = actualUnits - bepUnits;
    const mosPct = actualUnits > 0 ? (mosUnits / actualUnits) : 0;

    const points: ChartPoint[] = [];
    const stepUnits = Math.max(100, Math.floor(bepUnits * 1.5 / 6));
    for (let u = 0; u <= bepUnits * 1.6; u += stepUnits) {
      points.push({
        x: `${u}u`,
        y: Math.round(u * P), // Total Revenue
        secondary: Math.round(fc + u * vc) // Total Costs
      });
    }

    return {
      headline: `${bepUnits.toLocaleString('en-IN')} Units`,
      label: 'Break-Even Volume Required',
      metrics: [
        ['Break-Even Sales Revenue', formatINR(bepRevenue)],
        ['Contribution Margin per Unit', formatINR(cm)],
        ['Contribution Margin Ratio', formatPercent(cmRatio)],
        ['Margin of Safety', `${formatPercent(mosPct)} (${mosUnits > 0 ? '+' : ''}${mosUnits} units)`]
      ],
      steps: [
        `Contribution Margin = Price - VC = ${formatINR(P)} - ${formatINR(vc)} = ${formatINR(cm)} per unit`,
        `Contribution Margin Ratio = ${formatINR(cm)} / ${formatINR(P)} = ${formatPercent(cmRatio)}`,
        `Break-Even Units = Fixed Costs / CM = ${formatINR(fc)} / ${formatINR(cm)} = ${bepUnits} units`,
        `Break-Even Revenue = ${bepUnits} units * ${formatINR(P)} = ${formatINR(bepRevenue)}`
      ],
      interpretation: `The business must sell ${bepUnits.toLocaleString('en-IN')} units (${formatINR(bepRevenue)}) before earning ₹1 of profit. Sales above this volume contribute ${formatINR(cm)} per unit straight to profit.`,
      chart: {
        title: 'Break-Even Chart: Total Revenue vs. Total Cost',
        points,
        xLabel: 'Volume',
        yLabel: '₹ Amount'
      }
    };
  }
};

// -------------------------------------------------------------
// 20. GROWING ANNUITY & PERPETUITY
// -------------------------------------------------------------
const growingAnnuityCalc: Calculator = {
  id: 'growing-annuity',
  cat: 'Time Value of Money',
  name: 'Growing Annuity & Perpetuity',
  desc: 'Values cash flows that increase at a steady annual rate (dividend models, leases).',
  fields: [
    NUM('c', 'First Cash Flow (C1)', '50000', '₹'),
    NUM('r', 'Discount Rate (r)', '10', '%'),
    NUM('g', 'Annual Growth Rate (g)', '4', '%'),
    NUM('n', 'Years (Enter 999 for Perpetuity)', '10', 'Yrs')
  ],
  run: (v) => {
    const C = Number(v.c), r = Number(v.r) / 100, g = Number(v.g) / 100, n = Number(v.n);
    if (C <= 0 || r <= 0 || r <= g) return { headline: 'Invalid', label: 'Error', steps: [], error: 'Discount rate must strictly exceed growth rate.' };

    const isPerp = n >= 900;
    const pv = isPerp
      ? C / (r - g)
      : (C / (r - g)) * (1 - Math.pow((1 + g) / (1 + r), n));

    return {
      headline: formatINR(pv),
      label: isPerp ? 'Present Value of Growing Perpetuity' : 'Present Value of Growing Annuity',
      metrics: [
        ['First Cash Flow', formatINR(C)],
        ['Net Hurdle Spread (r - g)', formatPercent(r - g)],
        ['Terminal Horizon', isPerp ? 'Forever (Perpetual)' : `${n} Years`]
      ],
      steps: [
        isPerp
          ? 'Gordon Growth / Perpetuity Formula: PV = C1 / (r - g)'
          : 'Growing Annuity Formula: PV = [C1 / (r - g)] * [1 - ((1 + g)/(1 + r))^n]',
        `Net spread = ${(r * 100).toFixed(2)}% - ${(g * 100).toFixed(2)}% = ${formatPercent(r - g)}`,
        `PV = ${formatINR(pv)}`
      ],
      interpretation: `A cash flow of ${formatINR(C)} growing at ${formatPercent(g)} per year discounted at ${formatPercent(r)} is worth ${formatINR(pv)} in present cash.`
    };
  }
};

// -------------------------------------------------------------
// 21. EFFECTIVE ANNUAL RATE (EAR)
// -------------------------------------------------------------
const earCalc: Calculator = {
  id: 'ear',
  cat: 'Time Value of Money',
  name: 'Effective Annual Rate (EAR)',
  desc: 'Reveals the true annualized interest rate after factoring intra-year compounding.',
  fields: [
    NUM('r', 'Nominal Annual Rate', '12', '%'),
    { key: 'm', label: 'Compounding Frequency', def: '12', kind: 'select', options: FREQ_OPTIONS }
  ],
  run: (v) => {
    const r = Number(v.r) / 100, m = Number(v.m);
    if (r < 0 || m <= 0) return { headline: 'Invalid', label: 'Error', steps: [], error: 'Invalid parameters.' };

    const ear = Math.pow(1 + r / m, m) - 1;
    const spread = ear - r;

    return {
      headline: formatPercent(ear),
      label: 'True Effective Annual Rate (EAR)',
      metrics: [
        ['Stated Nominal Rate', formatPercent(r)],
        ['Compounding Boost', `+${formatPercent(spread)}`],
        ['Compounding Times per Year', `${m}x`]
      ],
      steps: [
        'Formula: EAR = (1 + r / m)^m - 1',
        `Periodic rate = ${(r * 100).toFixed(2)}% / ${m} = ${((r / m) * 100).toFixed(4)}%`,
        `EAR = (1 + ${(r / m).toFixed(4)})^${m} - 1 = ${formatPercent(ear)}`
      ],
      interpretation: `A stated nominal rate of ${formatPercent(r)} compounded ${m} times per year effectively charges or yields ${formatPercent(ear)} over a full calendar year.`
    };
  }
};

// Master collection of financial toolkit calculators
export const ALL_CALCULATORS: Calculator[] = [
  pvCalc,
  fvCalc,
  siCiCalc,
  annuityCalc,
  growingAnnuityCalc,
  earCalc,
  cagrCalc,
  roiCalc,
  npvCalc,
  irrCalc,
  paybackCalc,
  emiCalc,
  costCapitalCalc,
  waccCalc,
  leverageCalc,
  capitalStructureCalc,
  ratiosCalc,
  marginsCalc,
  dupontCalc,
  cccCalc,
  breakEvenCalc,
  ...EXTRA_CALCULATORS,
];

export const TOOLKIT_CATEGORIES = [
  'All',
  'Time Value of Money',
  'Investment Analysis',
  'Loans & Financing',
  'Corporate Finance',
  'Financial & Accounting Ratios',
  'Cost & Management Accounting',
] as const;
