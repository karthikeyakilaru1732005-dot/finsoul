/**
 * Canonical FINSOUL formulas. UI calculators call these functions.
 * Rates are decimals (0.10 = 10%) unless a function name says otherwise.
 */

export function presentValue(futureValue: number, rate: number, periods: number): number {
  if (periods === 0) return futureValue;
  return futureValue / Math.pow(1 + rate, periods);
}

export function futureValue(present: number, rate: number, periods: number): number {
  return present * Math.pow(1 + rate, periods);
}

export function simpleInterest(principal: number, rate: number, years: number): number {
  return principal * rate * years;
}

export function compoundAmount(principal: number, rate: number, years: number, compoundsPerYear = 1): number {
  return principal * Math.pow(1 + rate / compoundsPerYear, compoundsPerYear * years);
}

export function compoundInterest(principal: number, rate: number, years: number, compoundsPerYear = 1): number {
  return compoundAmount(principal, rate, years, compoundsPerYear) - principal;
}

export function effectiveAnnualRate(nominalRate: number, compoundsPerYear: number): number {
  return Math.pow(1 + nominalRate / compoundsPerYear, compoundsPerYear) - 1;
}

export function ordinaryAnnuityPV(payment: number, rate: number, periods: number): number {
  if (rate === 0) return payment * periods;
  return payment * ((1 - Math.pow(1 + rate, -periods)) / rate);
}

export function ordinaryAnnuityFV(payment: number, rate: number, periods: number): number {
  if (rate === 0) return payment * periods;
  return payment * ((Math.pow(1 + rate, periods) - 1) / rate);
}

export function annuityDuePV(payment: number, rate: number, periods: number): number {
  return ordinaryAnnuityPV(payment, rate, periods) * (1 + rate);
}

export function annuityDueFV(payment: number, rate: number, periods: number): number {
  return ordinaryAnnuityFV(payment, rate, periods) * (1 + rate);
}

export function cagr(begin: number, end: number, years: number): number {
  return Math.pow(end / begin, 1 / years) - 1;
}

export function roi(netGain: number, cost: number): number {
  return netGain / cost;
}

/** cashFlows[0] is time 0 (usually negative). */
export function npv(rate: number, cashFlows: number[]): number {
  return cashFlows.reduce((sum, cf, t) => sum + cf / Math.pow(1 + rate, t), 0);
}

export function irr(cashFlows: number[], guess = 0.1): number | null {
  if (cashFlows.length < 2) return null;
  const hasPos = cashFlows.some((c) => c > 0);
  const hasNeg = cashFlows.some((c) => c < 0);
  if (!hasPos || !hasNeg) return null;

  let low = -0.99;
  let high = 10;
  const npvLow = npv(low, cashFlows);
  const npvHigh = npv(high, cashFlows);
  if (npvLow * npvHigh > 0) {
    let rate = guess;
    for (let i = 0; i < 80; i++) {
      const value = npv(rate, cashFlows);
      const derivative = cashFlows.reduce((sum, cf, t) => {
        if (t === 0) return sum;
        return sum - (t * cf) / Math.pow(1 + rate, t + 1);
      }, 0);
      if (Math.abs(derivative) < 1e-12) break;
      const next = rate - value / derivative;
      if (!Number.isFinite(next) || next <= -0.999) break;
      if (Math.abs(next - rate) < 1e-8) return next;
      rate = next;
    }
    return Math.abs(npv(rate, cashFlows)) < 1 ? rate : null;
  }

  for (let i = 0; i < 80; i++) {
    const mid = (low + high) / 2;
    const value = npv(mid, cashFlows);
    if (Math.abs(value) < 1e-6) return mid;
    if (npv(low, cashFlows) * value < 0) high = mid;
    else low = mid;
  }
  return (low + high) / 2;
}

function recoveryYears(outlay: number, inflows: number[]): number | null {
  let cumulative = 0;
  for (let t = 0; t < inflows.length; t++) {
    const prior = cumulative;
    cumulative += inflows[t];
    if (cumulative >= outlay && inflows[t] !== 0) {
      return t + (outlay - prior) / inflows[t];
    }
  }
  return null;
}

/** cashFlows[0] is the initial outflow (negative or positive magnitude handled). */
export function paybackPeriod(cashFlows: number[]): number | null {
  const outlay = Math.abs(cashFlows[0] ?? 0);
  return recoveryYears(outlay, cashFlows.slice(1));
}

export function discountedPayback(rate: number, cashFlows: number[]): number | null {
  const outlay = Math.abs(cashFlows[0] ?? 0);
  const discounted = cashFlows.slice(1).map((cf, i) => cf / Math.pow(1 + rate, i + 1));
  return recoveryYears(outlay, discounted);
}

export function emi(principal: number, annualRate: number, months: number): number {
  const monthly = annualRate / 12;
  if (monthly === 0) return principal / months;
  const factor = Math.pow(1 + monthly, months);
  return (principal * monthly * factor) / (factor - 1);
}

export interface AmortizationRow {
  month: number;
  payment: number;
  interest: number;
  principal: number;
  balance: number;
}

export function amortizationSchedule(principal: number, annualRate: number, months: number): AmortizationRow[] {
  const payment = emi(principal, annualRate, months);
  const monthly = annualRate / 12;
  let balance = principal;
  const rows: AmortizationRow[] = [];
  for (let month = 1; month <= months; month++) {
    const interest = balance * monthly;
    const principalPaid = Math.min(balance, payment - interest);
    balance = Math.max(0, balance - principalPaid);
    rows.push({ month, payment, interest, principal: principalPaid, balance });
  }
  return rows;
}

export function costOfDebtAfterTax(preTaxCost: number, taxRate: number): number {
  return preTaxCost * (1 - taxRate);
}

export function costOfEquityCAPM(riskFree: number, beta: number, marketReturn: number): number {
  return riskFree + beta * (marketReturn - riskFree);
}

export function wacc(equity: number, debt: number, costOfEquity: number, preTaxCostOfDebt: number, taxRate: number): number {
  const value = equity + debt;
  if (value === 0) return NaN;
  const afterTaxDebt = costOfDebtAfterTax(preTaxCostOfDebt, taxRate);
  return (equity / value) * costOfEquity + (debt / value) * afterTaxDebt;
}

export function degreeOfOperatingLeverage(contribution: number, ebit: number): number {
  return contribution / ebit;
}

export function degreeOfFinancialLeverage(ebit: number, interest: number): number {
  return ebit / (ebit - interest);
}

export function degreeOfCombinedLeverage(contribution: number, ebit: number, interest: number): number {
  return degreeOfOperatingLeverage(contribution, ebit) * degreeOfFinancialLeverage(ebit, interest);
}

export function currentRatio(currentAssets: number, currentLiabilities: number): number {
  return currentAssets / currentLiabilities;
}

export function quickRatio(currentAssets: number, inventory: number, currentLiabilities: number): number {
  return (currentAssets - inventory) / currentLiabilities;
}

export function cashRatio(cash: number, currentLiabilities: number): number {
  return cash / currentLiabilities;
}

export function debtToEquity(debt: number, equity: number): number {
  return debt / equity;
}

export function debtRatio(debt: number, assets: number): number {
  return debt / assets;
}

export function grossMargin(revenue: number, cogs: number): number {
  return (revenue - cogs) / revenue;
}

export function operatingMargin(operatingIncome: number, revenue: number): number {
  return operatingIncome / revenue;
}

export function netMargin(netIncome: number, revenue: number): number {
  return netIncome / revenue;
}

export function roa(netIncome: number, assets: number): number {
  return netIncome / assets;
}

export function roe(netIncome: number, equity: number): number {
  return netIncome / equity;
}

export function inventoryTurnover(cogs: number, averageInventory: number): number {
  return cogs / averageInventory;
}

export function receivablesTurnover(creditSales: number, averageReceivables: number): number {
  return creditSales / averageReceivables;
}

export function payablesTurnover(purchases: number, averagePayables: number): number {
  return purchases / averagePayables;
}

export function workingCapital(currentAssets: number, currentLiabilities: number): number {
  return currentAssets - currentLiabilities;
}

export function operatingCycle(dio: number, dso: number): number {
  return dio + dso;
}

export function cashConversionCycle(dio: number, dso: number, dpo: number): number {
  return dio + dso - dpo;
}

export function contributionMargin(price: number, variableCost: number): number {
  return price - variableCost;
}

export function contributionMarginRatio(price: number, variableCost: number): number {
  return contributionMargin(price, variableCost) / price;
}

export function breakEvenUnits(fixedCosts: number, price: number, variableCost: number): number {
  return fixedCosts / contributionMargin(price, variableCost);
}

export function marginOfSafetyRatio(actualSales: number, breakEvenSales: number): number {
  return (actualSales - breakEvenSales) / actualSales;
}

export function targetProfitUnits(fixedCosts: number, targetProfit: number, price: number, variableCost: number): number {
  return (fixedCosts + targetProfit) / contributionMargin(price, variableCost);
}

export interface MakeOrBuyInput {
  units: number;
  directMaterial: number;
  directLabor: number;
  variableOverhead: number;
  avoidableFixed: number;
  opportunityCost: number;
  purchasePrice: number;
}

export function makeOrBuy(input: MakeOrBuyInput): { makeTotal: number; buyTotal: number; advantage: 'make' | 'buy' | 'indifferent'; savings: number } {
  const variableUnit = input.directMaterial + input.directLabor + input.variableOverhead;
  const makeTotal = variableUnit * input.units + input.avoidableFixed + input.opportunityCost;
  const buyTotal = input.purchasePrice * input.units;
  const diff = buyTotal - makeTotal;
  const advantage = Math.abs(diff) < 0.005 ? 'indifferent' : diff > 0 ? 'make' : 'buy';
  return { makeTotal, buyTotal, advantage, savings: Math.abs(diff) };
}
