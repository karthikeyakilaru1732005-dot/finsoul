import { Calculator } from '../types';
import { formatINR, formatNumber, formatPercent } from './format';
import {
  breakEvenUnits,
  contributionMargin,
  contributionMarginRatio,
  discountedPayback,
  emi,
  makeOrBuy,
  marginOfSafetyRatio,
  npv,
  paybackPeriod,
  targetProfitUnits,
} from './finance/formulas';

const invalid = (message: string) => ({
  headline: 'Invalid',
  label: 'Error',
  steps: [] as string[],
  error: message,
});

const investmentComparison: Calculator = {
  id: 'investment-comparison',
  cat: 'Investment Analysis',
  name: 'Investment Comparison',
  desc: 'Compares two mutually exclusive projects on NPV at the same hurdle rate.',
  fields: [
    { key: 'r', label: 'Hurdle Rate', def: '10', unit: '%', kind: 'number' },
    { key: 'a', label: 'Project A Cash Flows', def: '-100000, 45000, 45000, 45000', kind: 'list', hint: 't0 first, comma-separated' },
    { key: 'b', label: 'Project B Cash Flows', def: '-100000, 20000, 40000, 70000', kind: 'list' },
  ],
  run: (v) => {
    const rate = Number(v.r) / 100;
    const parse = (raw: unknown) => (Array.isArray(raw) ? raw.map(Number) : String(raw).split(',').map(Number));
    const a = parse(v.a);
    const b = parse(v.b);
    if ([...a, ...b, rate].some((n) => Number.isNaN(n))) return invalid('Enter numeric cash flows and a hurdle rate.');
    const npvA = npv(rate, a);
    const npvB = npv(rate, b);
    const winner = Math.abs(npvA - npvB) < 1 ? 'Indifferent' : npvA > npvB ? 'Project A' : 'Project B';
    return {
      headline: winner,
      label: 'Preferred Project',
      metrics: [
        ['Project A NPV', formatINR(npvA)],
        ['Project B NPV', formatINR(npvB)],
        ['NPV Advantage', formatINR(Math.abs(npvA - npvB))],
      ],
      steps: [
        'Formula: NPV = Σ CF_t / (1 + r)^t',
        `Project A NPV at ${formatPercent(rate)} = ${formatINR(npvA)}`,
        `Project B NPV at ${formatPercent(rate)} = ${formatINR(npvB)}`,
        `Select the higher NPV when projects are mutually exclusive: ${winner}.`,
      ],
      interpretation:
        winner === 'Indifferent'
          ? 'Both projects create the same present value at this hurdle rate.'
          : `${winner} creates more shareholder value and should be chosen if only one project can be funded.`,
      chart: {
        title: 'NPV Comparison',
        points: [
          { x: 'Project A', y: Math.round(npvA) },
          { x: 'Project B', y: Math.round(npvB) },
        ],
        xLabel: 'Project',
        yLabel: 'NPV (₹)',
      },
    };
  },
};

const loanComparison: Calculator = {
  id: 'loan-comparison',
  cat: 'Loans & Financing',
  name: 'Loan Comparison',
  desc: 'Compares two loans on EMI, total interest, and total repayment.',
  fields: [
    { key: 'p1', label: 'Loan A Principal', def: '1000000', unit: '₹', kind: 'number' },
    { key: 'r1', label: 'Loan A Annual Rate', def: '9', unit: '%', kind: 'number' },
    { key: 'n1', label: 'Loan A Tenure', def: '10', unit: 'Yrs', kind: 'number' },
    { key: 'p2', label: 'Loan B Principal', def: '1000000', unit: '₹', kind: 'number' },
    { key: 'r2', label: 'Loan B Annual Rate', def: '8.2', unit: '%', kind: 'number' },
    { key: 'n2', label: 'Loan B Tenure', def: '12', unit: 'Yrs', kind: 'number' },
  ],
  run: (v) => {
    const loans = [1, 2].map((i) => ({
      principal: Number(v[`p${i}`]),
      rate: Number(v[`r${i}`]) / 100,
      years: Number(v[`n${i}`]),
    }));
    if (loans.some((l) => l.principal <= 0 || l.years <= 0 || l.rate < 0)) {
      return invalid('Principal and tenure must be positive.');
    }
    const priced = loans.map((l) => {
      const months = l.years * 12;
      const installment = emi(l.principal, l.rate, months);
      const total = installment * months;
      return { ...l, months, installment, total, interest: total - l.principal };
    });
    const cheaper = priced[0].interest <= priced[1].interest ? 'Loan A' : 'Loan B';
    return {
      headline: cheaper,
      label: 'Lower Total Interest',
      metrics: [
        ['Loan A EMI', formatINR(priced[0].installment)],
        ['Loan B EMI', formatINR(priced[1].installment)],
        ['Loan A Interest', formatINR(priced[0].interest)],
        ['Loan B Interest', formatINR(priced[1].interest)],
      ],
      steps: [
        'Formula: EMI = P × r × (1 + r)^n / ((1 + r)^n − 1), with r as the monthly rate',
        `Loan A: EMI ${formatINR(priced[0].installment)} × ${priced[0].months} months = ${formatINR(priced[0].total)}`,
        `Loan B: EMI ${formatINR(priced[1].installment)} × ${priced[1].months} months = ${formatINR(priced[1].total)}`,
        `Interest gap = ${formatINR(Math.abs(priced[0].interest - priced[1].interest))}`,
      ],
      interpretation: `${cheaper} costs less in total interest. A lower EMI can still be more expensive if the tenure is longer, so compare total interest, not the installment alone.`,
      chart: {
        title: 'Total Interest',
        points: [
          { x: 'Loan A', y: Math.round(priced[0].interest) },
          { x: 'Loan B', y: Math.round(priced[1].interest) },
        ],
        xLabel: 'Loan',
        yLabel: 'Interest (₹)',
      },
    };
  },
};

const targetProfit: Calculator = {
  id: 'target-profit',
  cat: 'Cost & Management Accounting',
  name: 'Target Profit & CVP',
  desc: 'Finds the unit volume required to cover fixed costs and earn a stated profit.',
  fields: [
    { key: 'p', label: 'Selling Price', def: '150', unit: '₹', kind: 'number' },
    { key: 'vc', label: 'Variable Cost per Unit', def: '90', unit: '₹', kind: 'number' },
    { key: 'fc', label: 'Fixed Costs', def: '300000', unit: '₹', kind: 'number' },
    { key: 'tp', label: 'Target Profit', def: '120000', unit: '₹', kind: 'number' },
    { key: 'actual', label: 'Expected Sales', def: '8000', unit: 'Units', kind: 'number' },
  ],
  run: (v) => {
    const price = Number(v.p);
    const variable = Number(v.vc);
    const fixed = Number(v.fc);
    const profit = Number(v.tp);
    const actual = Number(v.actual);
    const cm = contributionMargin(price, variable);
    if (cm <= 0) return invalid('Price must exceed variable cost.');
    const units = targetProfitUnits(fixed, profit, price, variable);
    const bep = breakEvenUnits(fixed, price, variable);
    const cmr = contributionMarginRatio(price, variable);
    const mos = actual > 0 ? marginOfSafetyRatio(actual, bep) : 0;
    return {
      headline: `${formatNumber(units, 0)} Units`,
      label: 'Units for Target Profit',
      metrics: [
        ['Contribution Margin', formatINR(cm)],
        ['Contribution Margin Ratio', formatPercent(cmr)],
        ['Break-Even Units', formatNumber(bep, 0)],
        ['Margin of Safety', formatPercent(mos)],
      ],
      steps: [
        'Formula: Target units = (Fixed costs + Target profit) / (Price − Variable cost)',
        `Contribution margin = ${formatINR(price)} − ${formatINR(variable)} = ${formatINR(cm)}`,
        `Units = (${formatINR(fixed)} + ${formatINR(profit)}) / ${formatINR(cm)} = ${formatNumber(units, 2)}`,
        `Break-even = ${formatINR(fixed)} / ${formatINR(cm)} = ${formatNumber(bep, 2)} units`,
        `Margin of safety = (${formatNumber(actual, 0)} − ${formatNumber(bep, 2)}) / ${formatNumber(actual, 0)} = ${formatPercent(mos)}`,
      ],
      interpretation: `Selling ${formatNumber(Math.ceil(units), 0)} units covers overhead and the ${formatINR(profit)} profit target. Expected volume sits ${formatPercent(mos)} above break-even.`,
    };
  },
};

const makeBuy: Calculator = {
  id: 'make-or-buy',
  cat: 'Cost & Management Accounting',
  name: 'Make-or-Buy Comparison',
  desc: 'Compares relevant make cost with a supplier quote, ignoring sunk costs.',
  fields: [
    { key: 'units', label: 'Annual Volume', def: '1000', unit: 'Units', kind: 'number' },
    { key: 'dm', label: 'Direct Material per Unit', def: '200', unit: '₹', kind: 'number' },
    { key: 'dl', label: 'Direct Labour per Unit', def: '150', unit: '₹', kind: 'number' },
    { key: 'voh', label: 'Variable Overhead per Unit', def: '80', unit: '₹', kind: 'number' },
    { key: 'fixed', label: 'Avoidable Fixed Cost', def: '50000', unit: '₹', kind: 'number' },
    { key: 'opp', label: 'Opportunity Cost of Capacity', def: '20000', unit: '₹', kind: 'number' },
    { key: 'buy', label: 'Supplier Price per Unit', def: '520', unit: '₹', kind: 'number' },
  ],
  run: (v) => {
    const input = {
      units: Number(v.units),
      directMaterial: Number(v.dm),
      directLabor: Number(v.dl),
      variableOverhead: Number(v.voh),
      avoidableFixed: Number(v.fixed),
      opportunityCost: Number(v.opp),
      purchasePrice: Number(v.buy),
    };
    if (input.units <= 0) return invalid('Volume must be positive.');
    const result = makeOrBuy(input);
    return {
      headline: result.advantage === 'indifferent' ? 'Indifferent' : result.advantage === 'make' ? 'Make' : 'Buy',
      label: 'Relevant-Cost Decision',
      metrics: [
        ['Relevant Make Cost', formatINR(result.makeTotal)],
        ['Buy Cost', formatINR(result.buyTotal)],
        ['Advantage', formatINR(result.savings)],
      ],
      steps: [
        'Relevant make cost = (DM + DL + variable OH) × units + avoidable fixed cost + opportunity cost',
        `Unit make cost = ${formatINR(input.directMaterial + input.directLabor + input.variableOverhead)}`,
        `Make total = ${formatINR(result.makeTotal)}`,
        `Buy total = ${formatINR(input.purchasePrice)} × ${input.units} = ${formatINR(result.buyTotal)}`,
        'Sunk depreciation and allocated corporate overhead that continue either way are excluded.',
      ],
      interpretation:
        result.advantage === 'make'
          ? `Making in-house saves ${formatINR(result.savings)} of relevant cost.`
          : result.advantage === 'buy'
            ? `Buying saves ${formatINR(result.savings)} of relevant cost.`
            : 'Make and buy have the same relevant cost.',
      chart: {
        title: 'Relevant Cost',
        points: [
          { x: 'Make', y: Math.round(result.makeTotal) },
          { x: 'Buy', y: Math.round(result.buyTotal) },
        ],
        xLabel: 'Option',
        yLabel: 'Cost (₹)',
      },
    };
  },
};

const recovery: Calculator = {
  id: 'discounted-payback',
  cat: 'Investment Analysis',
  name: 'Discounted Payback Period',
  desc: 'Measures how long discounted cash inflows take to recover the initial outlay.',
  fields: [
    { key: 'r', label: 'Discount Rate', def: '10', unit: '%', kind: 'number' },
    { key: 'cf', label: 'Cash Flows (t0 then inflows)', def: '-100000, 30000, 40000, 35000, 25000', kind: 'list' },
  ],
  run: (v) => {
    const rate = Number(v.r) / 100;
    const flows = Array.isArray(v.cf) ? v.cf.map(Number) : String(v.cf).split(',').map(Number);
    if (flows.some((n) => Number.isNaN(n))) return invalid('Cash flows must be numeric.');
    const simple = paybackPeriod(flows);
    const discounted = discountedPayback(rate, flows);
    return {
      headline: discounted == null ? 'Not recovered' : `${discounted.toFixed(2)} years`,
      label: 'Discounted Payback',
      metrics: [
        ['Simple Payback', simple == null ? 'Not recovered' : `${simple.toFixed(2)} years`],
        ['Discount Rate', formatPercent(rate)],
      ],
      steps: [
        'Discount each inflow, then interpolate the year when cumulative PV covers the outlay.',
        `Simple payback = ${simple == null ? 'beyond the horizon' : simple.toFixed(2) + ' years'}`,
        `Discounted payback = ${discounted == null ? 'beyond the horizon' : discounted.toFixed(2) + ' years'}`,
      ],
      interpretation:
        discounted == null
          ? 'Discounted inflows never recover the investment inside the stated horizon.'
          : `Economic recovery takes ${discounted.toFixed(2)} years after the time value of money. Simple payback is shorter because it ignores discounting.`,
    };
  },
};

export const EXTRA_CALCULATORS: Calculator[] = [
  investmentComparison,
  loanComparison,
  targetProfit,
  makeBuy,
  recovery,
];
